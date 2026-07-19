import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE_ROOT = resolve(ROOT, 'tests/fixtures/place-based-rental-market');
const requireFromTest = createRequire(import.meta.url);
const fixtureNames = [
    'config.v2.json',
    'palm.valid.payload.json',
    'palm.compared.payload.json',
    'ocean.valid.payload.json',
    'invalid-closed-schema.json',
    'invalid-pair-leak.json',
    'five-bedroom-not-luxury.json',
    'sparse-unknown-coverage.json',
    'broad-to-luxury-substitution.json',
    'comparison-mismatch.json',
    'palm-missing-burden.json',
    'ocean-coastal-sensitivity.json',
    'unsafe-source.json'
];

function readFixture(name) {
    return JSON.parse(readFileSync(resolve(FIXTURE_ROOT, name), 'utf8'));
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function mutate(value, recipe) {
    const parts = recipe.path.split('.');
    const last = parts.pop();
    let target = value;
    for (const part of parts) target = target[Number.isInteger(Number(part)) ? Number(part) : part];
    if (recipe.operation === 'delete') {
        if (Array.isArray(target)) target.splice(Number(last), 1);
        else delete target[last];
    } else {
        target[Number.isInteger(Number(last)) ? Number(last) : last] = recipe.value;
    }
    return value;
}

function findCode(result, code, path) {
    return result.errors.some((error) => error.code === code && (!path || error.path === path));
}

test('Scope 1 v2 fixture corpus parses before production module loading', () => {
    for (const name of fixtureNames) {
        const value = readFixture(name);
        assert.ok(value && typeof value === 'object', `${name} must parse to an object`);
    }
    assert.equal(readFixture('config.v2.json').schemaVersion, 'place-based-rental-market-config/v2');
    assert.equal(readFixture('palm.valid.payload.json').units.length, 2);
    assert.equal(readFixture('ocean.valid.payload.json').units.length, 2);
});

test('RLRENTAL owns the complete shared v2 foundation contract', async (scope) => {
    const rental = requireFromTest('../rlrental.js');
    const config = readFixture('config.v2.json');
    const productionConfig = JSON.parse(readFileSync(resolve(ROOT, 'place-based-rental-market.config.json'), 'utf8'));
    const productionPalm = JSON.parse(readFileSync(resolve(ROOT, 'palm-springs-rental-market.payload.json'), 'utf8'));
    const productionOcean = JSON.parse(readFileSync(resolve(ROOT, 'ocean-shores-rental-market.payload.json'), 'utf8'));
    const palm = readFixture('palm.valid.payload.json');
    const ocean = readFixture('ocean.valid.payload.json');

    await scope.test('exports the frozen browser and Node API without hidden authority', () => {
        const required = [
            'validateConfig', 'indexConfig', 'validateMarketPayload', 'indexMarketPayload',
            'evaluateLuxuryQualification', 'computeCoverage', 'buildBasisSignature', 'compareAligned',
            'normalizeUserAssumptions', 'computeAdjustedOccupancy', 'computeEffectiveAvailableNights',
            'computeMonthlyPayment', 'computeRentalResult', 'resultIdentity', 'buildViewModel',
            'buildToolRead', 'buildResearchAuditProjection', 'mountRoute'
        ];
        assert.deepEqual(Object.keys(rental).sort(), required.sort());
        assert.equal(Object.isFrozen(rental), true);
    });

    await scope.test('validates and indexes the closed config without mutating input', () => {
        const before = JSON.stringify(config);
        const validation = rental.validateConfig(config);
        assert.equal(validation.ok, true, JSON.stringify(validation.errors));
        const index = rental.indexConfig(config);
        assert.equal(index.marketsById.size, 2);
        assert.equal(index.segmentsByPair.size, 4);
        assert.equal(index.profilesById.size, 2);
        assert.equal(index.marketsById.get('palm-springs-ca').comparisonMarketId, 'ocean-shores-wa');
        assert.equal(Object.isFrozen(index), true);
        assert.equal(JSON.stringify(config), before);
        const productionValidation = rental.validateConfig(productionConfig);
        assert.equal(productionValidation.ok, true, JSON.stringify(productionValidation.errors));
        assert.equal(productionConfig.configVersion, '2.0.0');
        assert.equal(JSON.stringify(productionConfig).includes('TEST FIXTURE'), false);
        assert.equal(rental.indexConfig(productionConfig).segmentsByPair.size, 4);
    });

    await scope.test('rejects every closed-schema mutation with deterministic code and path', () => {
        const matrix = readFixture('invalid-closed-schema.json');
        const configIndex = rental.indexConfig(config);
        for (const recipe of matrix.cases) {
            const candidate = mutate(clone(recipe.target === 'config' ? config : palm), recipe);
            const result = recipe.target === 'config'
                ? rental.validateConfig(candidate)
                : rental.validateMarketPayload(candidate, configIndex, 'palm-springs-ca');
            assert.equal(result.ok, false, recipe.id);
            assert.equal(findCode(result, recipe.expectedCode, recipe.expectedPath), true, `${recipe.id}: ${JSON.stringify(result.errors)}`);
        }
    });

    await scope.test('validates both synthetic market payloads and isolates pair indexes', () => {
        const configIndex = rental.indexConfig(config);
        assert.equal(rental.validateMarketPayload(palm, configIndex, 'palm-springs-ca').ok, true);
        assert.equal(rental.validateMarketPayload(ocean, configIndex, 'ocean-shores-wa').ok, true);
        const palmIndex = rental.indexMarketPayload(palm, configIndex);
        const oceanIndex = rental.indexMarketPayload(ocean, configIndex);
        assert.equal(palmIndex.unitsByPair.size, 2);
        assert.equal(oceanIndex.unitsByPair.size, 2);
        assert.equal(palmIndex.unitsByPair.has('ocean-shores-wa::whole-market'), false);
        assert.equal(oceanIndex.unitsByPair.has('palm-springs-ca::whole-market'), false);
        const leak = rental.validateMarketPayload(readFixture('invalid-pair-leak.json'), configIndex, 'palm-springs-ca');
        assert.equal(leak.ok, false);
        assert.equal(findCode(leak, 'PBRM-PAYLOAD-PAIR-LEAK'), true, JSON.stringify(leak.errors));
    });

    await scope.test('projects every Scope 2 research audit outcome from validated production indexes', () => {
        const configIndex = rental.indexConfig(productionConfig);
        const projection = rental.buildResearchAuditProjection(configIndex, {
            'palm-springs-ca': rental.indexMarketPayload(productionPalm, configIndex),
            'ocean-shores-wa': rental.indexMarketPayload(productionOcean, configIndex)
        });
        assert.deepEqual(Object.keys(projection).sort(), [
            'acquisition', 'attempts', 'changes', 'evidenceClasses',
            'independence', 'inventory', 'scenarios'
        ].sort());
        assert.match(projection.inventory, /markets=2/);
        assert.match(projection.inventory, /units=4/);
        assert.match(projection.inventory, /categories=9\/9/);
        assert.match(projection.inventory, /authority=PRODUCTION RESEARCH PROPOSAL/);
        assert.match(projection.inventory, /publication=UNCOMMITTED FOR REVIEW/);
        assert.match(projection.changes, /priorMode=baseline/);
        assert.match(projection.changes, /priorUnitId=NONE/);
        assert.match(projection.changes, /changeRecords=0/);
        assert.match(projection.changes, /priorRelativeClaims=0/);
        assert.match(projection.attempts, /state=(?:inaccessible|rejected)/);
        assert.match(projection.attempts, /numericValue=ABSENT/);
        assert.match(projection.attempts, /positiveSubstitution=false/);
        assert.match(projection.evidenceClasses, /class=OBSERVED/);
        assert.match(projection.evidenceClasses, /class=ASSUMPTION/);
        assert.match(projection.evidenceClasses, /class=INFERENCE/);
        assert.match(projection.evidenceClasses, /class=MODELED OUTPUT/);
        assert.match(projection.independence, /receipts=4/);
        assert.match(projection.independence, /foreignIds=0/);
        assert.match(projection.independence, /inheritedIdentity=false/);
        assert.match(projection.acquisition, /segment=large-luxury-5plus/);
        assert.match(projection.acquisition, /status=active-ask/);
        assert.match(projection.acquisition, /dedup=/);
        assert.match(projection.acquisition, /sampleN=/);
        assert.match(projection.acquisition, /range=/);
        assert.match(projection.acquisition, /period=/);
        assert.match(projection.acquisition, /exclusions=/);
        assert.match(projection.acquisition, /legalUnknowns=/);
        assert.match(projection.acquisition, /baseline=unavailable/);
        assert.match(projection.acquisition, /purchasePriceUsd=UNAVAILABLE/);
        assert.match(projection.scenarios, /scenario-slot:rest-2026-base/);
        assert.match(projection.scenarios, /scenario-slot:2027-base/);
        assert.match(projection.scenarios, /method=/);
        assert.match(projection.scenarios, /coverage=/);
        assert.match(projection.scenarios, /confidence=/);
        assert.match(projection.scenarios, /falsifiers=/);
        assert.match(projection.scenarios, /scenario-slot:assumption-sensitivity/);
        assert.match(projection.scenarios, /requiredUserInputs=/);
        assert.match(projection.scenarios, /observedFact=false/);
    });

    await scope.test('validates a compared prior fixture with pair-owned material accounting', () => {
        const compared = readFixture('palm.compared.payload.json');
        const configIndex = rental.indexConfig(config);
        const validation = rental.validateMarketPayload(compared, configIndex, 'palm-springs-ca');
        assert.equal(validation.ok, true, JSON.stringify(validation.errors));
        const comparedUnits = compared.units.filter((unit) => unit.prior.mode === 'compared');
        assert.equal(comparedUnits.length > 0, true);
        for (const unit of comparedUnits) {
            assert.equal(typeof unit.prior.unitId, 'string');
            assert.equal(typeof unit.prior.researchedAt, 'string');
            assert.equal(typeof unit.prior.gitBlobOid, 'string');
            assert.equal(unit.changes.mode, 'compared');
            assert.equal(unit.changes.priorUnitId, unit.prior.unitId);
            assert.equal(unit.changes.records.length >= 8, true);
            const identities = new Set();
            const entityTypes = new Set();
            for (const record of unit.changes.records) {
                assert.deepEqual(Object.keys(record).sort(), [
                    'id', 'entityType', 'entityId', 'changeType', 'priorSummary',
                    'currentSummary', 'reason', 'evidenceSourceIds'
                ].sort());
                assert.equal(record.id.includes(`:${unit.marketId}:${unit.segmentId}:`), true);
                assert.equal(record.entityId.includes(`:${unit.marketId}:${unit.segmentId}:`), true);
                assert.equal(identities.has(`${record.entityType}:${record.entityId}`), false);
                identities.add(`${record.entityType}:${record.entityId}`);
                entityTypes.add(record.entityType);
            }
            for (const entityType of [
                'thesis', 'coverage', 'metric-observation', 'scenario',
                'acquisition-sample', 'acquisition-baseline', 'cost-line', 'risk-assumption'
            ]) assert.equal(entityTypes.has(entityType), true, entityType);
        }
        const projection = rental.buildResearchAuditProjection(configIndex, {
            'palm-springs-ca': rental.indexMarketPayload(compared, configIndex),
            'ocean-shores-wa': rental.indexMarketPayload(ocean, configIndex)
        });
        assert.match(projection.inventory, /authority=TEST FIXTURE SYNTHETIC/);
        assert.match(projection.inventory, /publication=DISABLED/);
        assert.match(projection.changes, /pair=palm-springs-ca::whole-market/);
        assert.match(projection.changes, /priorMode=compared/);
        assert.match(projection.changes, /priorUnitId=unit:palm-springs-ca:whole-market:test-prior-v2/);
        assert.match(projection.changes, /priorUnitMatch=true/);
        assert.match(projection.changes, /changeRecords=11/);
        assert.match(projection.changes, /materialEntities=11/);
        assert.match(projection.changes, /expectedMaterialEntities=11/);
        assert.match(projection.changes, /complete=true/);
        assert.match(projection.changes, /entityTypes=thesis,coverage,metric-observation,scenario,acquisition-sample,acquisition-baseline,cost-line,risk-assumption/);
        assert.match(projection.changes, /pairOwned=true/);
    });

    await scope.test('resolves comparison metric identity from the selected pair config', async () => {
        const syntheticConfig = clone(config);
        const syntheticId = 'metricdef:synthetic:config-owned-occupancy';
        syntheticConfig.metricDefinitions = syntheticConfig.metricDefinitions.filter((definition) => definition.id !== 'metricdef:palm:whole-occupancy');
        const luxuryDefinition = syntheticConfig.metricDefinitions.find((definition) => definition.id === 'metricdef:palm:luxury-occupancy');
        luxuryDefinition.id = syntheticId;
        luxuryDefinition.directlyComparableWith = [syntheticId];

        const syntheticPalm = clone(palm);
        const wholeUnit = syntheticPalm.units.find((unit) => unit.segmentId === 'whole-market');
        const luxuryUnit = syntheticPalm.units.find((unit) => unit.segmentId === 'large-luxury-5plus');
        wholeUnit.metricObservations[0].metricDefinitionId = syntheticId;
        wholeUnit.segmentCoverage.metricSamples[0].metricDefinitionId = syntheticId;
        luxuryUnit.segmentCoverage.metricSamples[0].metricDefinitionId = syntheticId;

        const elements = new Map();
        const responses = new Map([
            ['fixture-config', syntheticConfig],
            ['fixture-palm', syntheticPalm],
            ['fixture-ocean', ocean]
        ]);
        const previous = {
            document: globalThis.document,
            fetch: globalThis.fetch,
            location: globalThis.location
        };
        globalThis.document = {
            getElementById(id) {
                if (!elements.has(id)) elements.set(id, { hidden: false, onclick: null, style: {}, textContent: '' });
                return elements.get(id);
            }
        };
        globalThis.location = { search: '?fixture=current&segment=large-luxury-5plus' };
        globalThis.fetch = async (path) => ({
            ok: responses.has(path),
            async json() { return clone(responses.get(path)); }
        });

        const routeOptions = {
            adapter: {
                marketId: 'palm-springs-ca',
                toolId: 'palm-springs-rental-market-lab',
                configPath: 'unused-production-config'
            },
            fixtures: {
                config: 'fixture-config',
                invalidPayload: 'fixture-invalid',
                missingConfig: 'fixture-missing',
                payloads: {
                    'palm-springs-ca': 'fixture-palm',
                    'ocean-shores-wa': 'fixture-ocean'
                }
            }
        };

        try {
            const result = await rental.mountRoute(routeOptions);
            assert.ok(result);
            assert.doesNotMatch(elements.get('comparisonReceipt').textContent, /METRIC_DEFINITION/);

            const missingConfig = clone(syntheticConfig);
            missingConfig.metricDefinitions = missingConfig.metricDefinitions.filter((definition) => definition.id !== syntheticId);
            responses.set('fixture-config', missingConfig);
            elements.clear();
            assert.equal(await rental.mountRoute(routeOptions), null);
            assert.equal(elements.get('truthState').textContent, 'INVALID CONFIGURATION');
            assert.match(elements.get('contractErrors').textContent, /PBRM-CONFIG-METRIC-DEFINITION/);

            const ambiguousConfig = clone(syntheticConfig);
            const duplicateDefinition = clone(ambiguousConfig.metricDefinitions.find((definition) => definition.id === syntheticId));
            duplicateDefinition.id = 'metricdef:synthetic:duplicate-config-owned-occupancy';
            duplicateDefinition.directlyComparableWith = [duplicateDefinition.id];
            ambiguousConfig.metricDefinitions.push(duplicateDefinition);
            responses.set('fixture-config', ambiguousConfig);
            elements.clear();
            assert.equal(await rental.mountRoute(routeOptions), null);
            assert.equal(elements.get('truthState').textContent, 'INVALID CONFIGURATION');
            assert.match(elements.get('contractErrors').textContent, /PBRM-CONFIG-METRIC-DEFINITION/);
        } finally {
            for (const [name, value] of Object.entries(previous)) {
                if (value === undefined) delete globalThis[name];
                else globalThis[name] = value;
            }
        }
    });

    await scope.test('requires every composite luxury gate and never promotes five bedrooms alone', () => {
        const policy = rental.indexConfig(config).segmentsByPair.get('palm-springs-ca::large-luxury-5plus').qualificationPolicy;
        for (const candidate of readFixture('five-bedroom-not-luxury.json').cases) {
            const result = rental.evaluateLuxuryQualification({
                luxuryQualification: {
                    method: 'composite-sample',
                    sample: { sampleN: candidate.sampleN },
                    members: [candidate.member],
                    composite: { samplePercentileValue: candidate.percentileValue }
                }
            }, policy);
            assert.equal(result.disposition, candidate.expectedDisposition, candidate.id);
            if (candidate.expectedReason) assert.equal(result.reasonCodes.includes(candidate.expectedReason), true, candidate.id);
        }
    });

    await scope.test('keeps sparse and unknown coverage explicit without multiplying marginals', () => {
        const configIndex = rental.indexConfig(config);
        for (const candidate of readFixture('sparse-unknown-coverage.json').cases) {
            const result = rental.computeCoverage(candidate.coverage, { disposition: 'unknown' }, configIndex);
            assert.equal(result.state, candidate.expectedState, candidate.id);
            assert.equal(result.coverageRatio, candidate.expectedRatio, candidate.id);
            assert.deepEqual(result.independentMarginalsUsed, []);
            assert.equal(result.confidenceConsequence.length > 0, true);
        }
    });

    await scope.test('rejects whole-market evidence copied into an observed luxury field', () => {
        const candidate = clone(palm);
        const luxury = candidate.units.find((unit) => unit.segmentId === 'large-luxury-5plus');
        luxury.metricObservations.push(readFixture('broad-to-luxury-substitution.json').observation);
        const result = rental.validateMarketPayload(candidate, rental.indexConfig(config), 'palm-springs-ca');
        assert.equal(result.ok, false);
        assert.equal(findCode(result, 'PBRM-PAYLOAD-BROAD-LUXURY-SUBSTITUTION'), true, JSON.stringify(result.errors));
    });

    await scope.test('emits deltas only for fully aligned comparison bases', () => {
        const fixture = readFixture('comparison-mismatch.json');
        const left = rental.buildBasisSignature(fixture.base, null, rental.indexConfig(config));
        const aligned = rental.compareAligned({ ...left, value: 0.4 }, { ...left, value: 0.5 });
        assert.equal(aligned.state, 'COMPARABLE');
        assert.equal(aligned.absoluteDelta, 0.1);
        assert.equal(aligned.percentDelta, 0.25);
        assert.equal(aligned.ranking, null);
        for (const candidate of fixture.cases) {
            const right = rental.buildBasisSignature({ ...fixture.base, [candidate.field]: candidate.value }, null, rental.indexConfig(config));
            const result = rental.compareAligned({ ...left, value: 0.4 }, { ...right, value: 0.5 });
            assert.equal(result.state, 'INCOMPARABLE', candidate.field);
            assert.equal(result.mismatchReasons.includes(candidate.reason), true, candidate.field);
            assert.equal(result.absoluteDelta, null);
            assert.equal(result.ranking, null);
        }
    });

    await scope.test('applies occupancy, effective-night, amortizing, and zero-rate equations exactly', () => {
        const occupancy = rental.computeAdjustedOccupancy(0.4, 0.1, 0.25);
        assert.equal(occupancy.ok, true);
        assert.ok(Math.abs(occupancy.value - (0.4 * 1.1 / 1.25)) < 1e-12);
        const invalid = rental.computeAdjustedOccupancy(0.4, 0.1, -1);
        assert.equal(invalid.ok, false);
        assert.equal(invalid.errors[0].code, 'PBRM-MODEL-OCCUPANCY-DENOMINATOR');
        assert.equal(Object.hasOwn(invalid, 'value'), false);
        const disjoint = rental.computeEffectiveAvailableNights(365, { method: 'explicit-disjoint-days', items: [{ riskFieldId: 'risk:a', days: 4, disjointWithAllOthers: true }, { riskFieldId: 'risk:b', days: 6, disjointWithAllOthers: true }] });
        assert.equal(disjoint.value, 355);
        const union = rental.computeEffectiveAvailableNights(365, { method: 'calendar-day-union', items: [{ riskFieldId: 'risk:a', dates: ['2026-01-01', '2026-01-02'] }, { riskFieldId: 'risk:b', dates: ['2026-01-02', '2026-01-03'] }] });
        assert.equal(union.value, 362);
        const amortizing = rental.computeMonthlyPayment(400000, 0.06, 30);
        const monthlyRate = 0.06 / 12;
        const power = Math.pow(1 + monthlyRate, 360);
        assert.equal(amortizing.branch, 'amortizing');
        assert.ok(Math.abs(amortizing.monthlyPaymentUsd - (400000 * monthlyRate * power / (power - 1))) < 1e-9);
        const zero = rental.computeMonthlyPayment(400000, 0, 30);
        assert.equal(zero.branch, 'zero-rate');
        assert.equal(zero.monthlyPaymentUsd, 400000 / 360);
    });

    await scope.test('keeps incomplete costs partial and coastal controls deterministic', () => {
        const palmMissing = readFixture('palm-missing-burden.json');
        const incomplete = rental.computeRentalResult(palmMissing.pairContext, palmMissing.assumptions);
        assert.equal(incomplete.ok, true);
        assert.equal(incomplete.result.economicsState, 'INCOMPLETE');
        assert.deepEqual(incomplete.result.missingCostFieldIds, palmMissing.expectedMissingCostFieldIds);
        assert.equal(incomplete.result.preTaxCashFlowUsd, null);
        assert.equal(Number.isFinite(incomplete.result.grossRevenueUsd), true);
        const oceanFixture = readFixture('ocean-coastal-sensitivity.json');
        const base = rental.computeRentalResult(oceanFixture.pairContext, oceanFixture.baseAssumptions);
        const changedAssumptions = clone(oceanFixture.baseAssumptions);
        changedAssumptions.downtime.items[0].days = oceanFixture.changed.downtimeDays;
        changedAssumptions.fixedRiskCosts[0].annualUsd = oceanFixture.changed.floodInsuranceUsd;
        changedAssumptions.fixedRiskCosts[1].annualUsd = oceanFixture.changed.windStormReserveUsd;
        const changed = rental.computeRentalResult(oceanFixture.pairContext, changedAssumptions);
        assert.equal(changed.result.effectiveAvailableNights < base.result.effectiveAvailableNights, true);
        assert.equal(changed.result.grossRevenueUsd < base.result.grossRevenueUsd, true);
        assert.equal(changed.result.fixedRiskCostUsd > base.result.fixedRiskCostUsd, true);
        assert.equal(changed.result.preTaxCashFlowUsd < base.result.preTaxCashFlowUsd, true);
    });

    await scope.test('rejects unknown and out-of-bound user assumptions before result computation', () => {
        const oceanFixture = readFixture('ocean-coastal-sensitivity.json');
        const pairContext = {
            ...oceanFixture.pairContext,
            bounds: rental.indexConfig(config).bounds
        };
        const unknownKey = clone(oceanFixture.baseAssumptions);
        unknownKey.fallbackOccupancy = 0.75;
        const unknownResult = rental.normalizeUserAssumptions(unknownKey, pairContext);
        assert.equal(unknownResult.ok, false);
        assert.equal(findCode(unknownResult, 'PBRM-MODEL-IDENTITY', 'assumptions.fallbackOccupancy'), true, JSON.stringify(unknownResult.errors));

        const outOfBound = clone(oceanFixture.baseAssumptions);
        outOfBound.demandDelta = 0.75;
        const boundResult = rental.normalizeUserAssumptions(outOfBound, pairContext);
        assert.equal(boundResult.ok, false);
        assert.equal(findCode(boundResult, 'PBRM-MODEL-BOUNDS', 'assumptions.demandDelta'), true, JSON.stringify(boundResult.errors));
    });

    await scope.test('uses canonical identity and omits invalid owner-read numerics', () => {
        const identityInput = {
            contractVersion: 'place-based-rental-market-result/v2',
            formulaVersion: 'place-based-rental-market-model/2.0.0',
            marketId: 'palm-springs-ca', segmentId: 'whole-market', pairKey: 'palm-springs-ca::whole-market',
            unitId: 'unit:palm-springs-ca:whole-market:test', scenarioId: 'scenario:palm-springs-ca:whole-market:test',
            acquisitionBaselineId: 'baseline:palm-springs-ca:whole-market:test', variableCostBaselineId: 'costset:palm-springs-ca:whole-market:variable',
            fixedRiskCostBaselineId: 'costset:palm-springs-ca:whole-market:fixed', riskAssumptionBaselineId: 'riskset:palm-springs-ca:whole-market:test',
            validatedUserAssumptions: { demandDelta: 0 }
        };
        const first = rental.resultIdentity({ ...identityInput, mode: 'simple' });
        const second = rental.resultIdentity({ ...identityInput, mode: 'power', viewport: 'mobile' });
        assert.equal(first, second);
        assert.match(first, /^sha256:[a-f0-9]{64}$/);
        const read = rental.buildToolRead({
            route: { toolId: 'palm-springs-rental-market-lab', path: 'palm-springs-rental-market-lab.html' },
            pair: { marketId: 'palm-springs-ca', segmentId: 'large-luxury-5plus', pairKey: 'palm-springs-ca::large-luxury-5plus', unitId: 'unit:palm-springs-ca:large-luxury-5plus:test' },
            truth: { state: 'unavailable', asOf: null, freshUntil: null }, coverage: { state: 'sparse' },
            qualification: { disposition: 'unknown' }, thesis: { phase: 'unavailable', direction: 'unavailable', confidencePct: 0 },
            scenario: { year: 2027, id: 'scenario:palm-springs-ca:large-luxury-5plus:test' }, result: { grossRevenueUsd: null, preTaxCashFlowUsd: NaN, economicsState: 'INCOMPLETE', missingCostFieldIds: ['costfield:palm:pool-spa-service'], errors: [{ code: 'PBRM-MODEL-COST-INCOMPLETE' }] },
            resultId: null, errors: [{ code: 'PBRM-PAYLOAD-COVERAGE' }]
        }, '2026-07-17T12:00:00.000Z');
        assert.equal(read.contractVersion, 'rl-tool-read/v1');
        assert.equal(read.availability, 'unavailable');
        assert.deepEqual(Object.keys(read).sort(), ['asOf', 'availability', 'computedAt', 'contractVersion', 'deepLink', 'freshUntil', 'id', 'metrics', 'read'].sort());
        assert.equal(read.metrics.pairKey, 'palm-springs-ca::large-luxury-5plus');
        assert.equal(Object.hasOwn(read.metrics, 'grossRevenueUsd'), false);
        assert.equal(Object.hasOwn(read.metrics, 'preTaxCashFlowUsd'), false);
        assert.equal(read.metrics.omittedMetrics.includes('grossRevenueUsd'), true);
    });

    await scope.test('rejects unsafe source URLs while leaving script-like text inert data', () => {
        for (const candidate of readFixture('unsafe-source.json').cases) {
            const result = rental.validateMarketPayload.safeSourceUrl(candidate.url);
            assert.equal(result.ok, candidate.reason === null, candidate.url);
            if (candidate.reason) assert.equal(result.reason, candidate.reason, candidate.url);
        }
        assert.match(readFixture('unsafe-source.json').scriptLikeText, /<script>/);
    });
});