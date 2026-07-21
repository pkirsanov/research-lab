import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requireFromValidator = createRequire(import.meta.url);
const rental = requireFromValidator('../rlrental.js');
const fixtureRoot = path.join(root, 'tests/fixtures/place-based-rental-market');
const V1_CONFIG_MIGRATION_CLASSIFICATION = Object.freeze({
    schemaVersion: 'replaced', configVersion: 'migrated', toolId: 'migrated', contracts: 'migrated',
    requiredResearchCategories: 'replaced', enums: 'migrated', freshness: 'migrated', stringLimits: 'replaced',
    bounds: 'migrated', initialUi: 'migrated', forecastYears: 'replaced', scenarioCatalog: 'replaced',
    geographies: 'migrated', populations: 'migrated', sourcePolicies: 'migrated', metricDefinitions: 'migrated',
    displayFormats: 'migrated'
});
const REQUIRED_CATEGORIES = Object.freeze([
    'lodging-performance', 'legal-active-supply', 'housing-acquisition',
    'travel-access-feeder', 'macro-financing', 'hotel-competition',
    'events-seasonality', 'operating-costs', 'physical-risks'
]);
const SOURCE_KEYS = Object.freeze([
    'id', 'publisher', 'title', 'url', 'methodologyUrl', 'categoryId', 'policyId',
    'quality', 'state', 'retrievedAt', 'publishedAt', 'asOf', 'observationPeriod',
    'geographyId', 'populationId', 'segmentApplicability', 'access', 'rights', 'limitations'
]);
const CLAIM_KEYS = Object.freeze([
    'id', 'kind', 'evidenceClass', 'statement', 'geographyId', 'populationId',
    'period', 'confidencePct', 'sourceRefs', 'metricObservationIds',
    'supportsClaimIds', 'contradictsClaimIds', 'status'
]);
const METRIC_KEYS = Object.freeze([
    'id', 'metricDefinitionId', 'evidenceClass', 'value', 'period', 'marketId',
    'segmentId', 'geographyId', 'populationId', 'sourceRefs', 'sourceMethodId',
    'sampleFrameId', 'qualificationSignature', 'forecastMethodId', 'limitations'
]);
const SCENARIO_KEYS = Object.freeze([
    'id', 'scenarioSlotId', 'pairKey', 'year', 'label', 'state', 'baseOccupancy',
    'baseAdrUsd', 'availableNights', 'downtimeBaseline', 'forecastMethodId',
    'observedBaselineRefs', 'baselineGapClaimIds', 'assumptionClaimIds',
    'inferenceClaimIds', 'falsifierClaimIds', 'coverageState', 'confidencePct',
    'requiredUserInputIds'
]);
const CHANGE_RECORD_KEYS = Object.freeze([
    'id', 'entityType', 'entityId', 'changeType', 'priorSummary',
    'currentSummary', 'reason', 'evidenceSourceIds'
]);
const CHANGE_TYPES = Object.freeze(['added', 'removed', 'revised', 'unchanged', 'contradicted', 'unresolved']);
const CHANGE_ENTITY_TYPES = Object.freeze([
    'thesis', 'claim', 'source', 'metric-observation', 'coverage',
    'qualification-member', 'sample-member', 'legal-fact', 'driver',
    'forecast-method', 'scenario', 'acquisition-sample',
    'acquisition-baseline', 'cost-line', 'risk-assumption', 'unknown'
]);
const REQUIRED_COMPARED_ENTITY_TYPES = Object.freeze([
    'thesis', 'coverage', 'metric-observation', 'scenario',
    'acquisition-sample', 'acquisition-baseline', 'cost-line', 'risk-assumption'
]);

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
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
    } else target[Number.isInteger(Number(last)) ? Number(last) : last] = recipe.value;
    return value;
}

function hasFinding(result, code, expectedPath) {
    return result.errors.some((error) => error.code === code && (!expectedPath || error.path === expectedPath));
}

function relative(filePath) {
    return path.relative(root, filePath);
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function branchesMetricIdentityOnMarket(source, marketId) {
    const id = escapeRegExp(marketId);
    const metricThenMarketBranch = new RegExp(`metricDefinition(?:Id)?[\\s\\S]{0,240}(?:===|case\\s+)[\\s]*["']${id}["']`);
    const marketBranchThenMetric = new RegExp(`(?:===|case\\s+)[\\s]*["']${id}["'][\\s\\S]{0,240}metricDefinition(?:Id)?`);
    return metricThenMarketBranch.test(source) || marketBranchThenMetric.test(source);
}

function validateCandidate(payloadPath, configPath, expectedMarketId) {
    const config = readJson(configPath);
    const configValidation = rental.validateConfig(config);
    if (!configValidation.ok) return { ok: false, configValidation, payloadValidation: null };
    const payload = readJson(payloadPath);
    const payloadValidation = rental.validateMarketPayload(payload, rental.indexConfig(config), expectedMarketId);
    return { ok: payloadValidation.ok, configValidation, payloadValidation };
}

function validateMigrationClassification() {
    const legacyPath = path.join(root, 'palm-springs-rental-market.config.json');
    const classifiedKeys = Object.keys(V1_CONFIG_MIGRATION_CLASSIFICATION).sort();
    if (!fs.existsSync(legacyPath)) return { ok: true, classified: classifiedKeys.length, legacyPresent: false };
    const legacy = readJson(legacyPath);
    const legacyKeys = Object.keys(legacy).sort();
    return { ok: JSON.stringify(legacyKeys) === JSON.stringify(classifiedKeys), classified: classifiedKeys.length, legacyPresent: true };
}

function productionFinding(findings, code, findingPath, message) {
    findings.push({ code, path: findingPath, message });
}

function validateExactKeys(value, keys, findings, findingPath) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        productionFinding(findings, 'PBRM-PRODUCTION-SCHEMA', findingPath, 'object required');
        return;
    }
    const expected = new Set(keys);
    Object.keys(value).forEach((key) => {
        if (!expected.has(key)) productionFinding(findings, 'PBRM-PRODUCTION-SCHEMA', `${findingPath}.${key}`, 'unknown key');
    });
    keys.forEach((key) => {
        if (!Object.hasOwn(value, key)) productionFinding(findings, 'PBRM-PRODUCTION-SCHEMA', `${findingPath}.${key}`, 'missing key');
    });
}

function requireReferences(ids, index, findings, findingPath, code = 'PBRM-PRODUCTION-REFERENCE') {
    if (!Array.isArray(ids)) {
        productionFinding(findings, code, findingPath, 'reference array required');
        return;
    }
    ids.forEach((id, indexPosition) => {
        if (!index.has(id)) productionFinding(findings, code, `${findingPath}.${indexPosition}`, `unresolved reference ${id}`);
    });
}

function validateComparedFixture(payload, configIndex, findings) {
    const comparedUnits = payload.units.filter((unit) => unit.prior.mode === 'compared');
    let recordCount = 0;
    if (comparedUnits.length === 0) {
        productionFinding(findings, 'PBRM-FIXTURE-COMPARED', 'palm.compared.payload.json', 'at least one compared unit required');
    }
    comparedUnits.forEach((unit, unitIndex) => {
        const unitPath = `palm.compared.payload.json:units.${unitIndex}`;
        const pairToken = `:${unit.marketId}:${unit.segmentId}:`;
        if (typeof unit.prior.unitId !== 'string' || !unit.prior.unitId ||
            !Number.isFinite(Date.parse(unit.prior.researchedAt)) ||
            typeof unit.prior.gitBlobOid !== 'string' || !/^[a-f0-9]{40}$/.test(unit.prior.gitBlobOid) ||
            unit.changes.mode !== 'compared' || unit.changes.priorUnitId !== unit.prior.unitId ||
            unit.changes.contractVersion !== configIndex.contracts.changeAccounting) {
            productionFinding(findings, 'PBRM-FIXTURE-COMPARED', `${unitPath}.prior`, 'compared prior identity or change linkage invalid');
        }
        const identities = new Set();
        const entityTypes = new Set();
        unit.changes.records.forEach((record, recordIndex) => {
            const recordPath = `${unitPath}.changes.records.${recordIndex}`;
            validateExactKeys(record, CHANGE_RECORD_KEYS, findings, recordPath);
            const identity = `${record.entityType}:${record.entityId}`;
            if (typeof record.id !== 'string' || !record.id.includes(pairToken) ||
                typeof record.entityId !== 'string' || !record.entityId.includes(pairToken) ||
                identities.has(identity)) {
                productionFinding(findings, 'PBRM-FIXTURE-COMPARED', recordPath, 'change record identity must be unique and pair-owned');
            }
            identities.add(identity);
            entityTypes.add(record.entityType);
            if (!CHANGE_TYPES.includes(record.changeType) || !CHANGE_ENTITY_TYPES.includes(record.entityType)) {
                productionFinding(findings, 'PBRM-FIXTURE-COMPARED', recordPath, 'change record enum is outside the closed contract');
            }
            if (record.changeType === 'added' ? record.priorSummary !== null :
                (record.changeType === 'removed' ? record.currentSummary !== null :
                    (typeof record.priorSummary !== 'string' || typeof record.currentSummary !== 'string'))) {
                productionFinding(findings, 'PBRM-FIXTURE-COMPARED', recordPath, 'change summaries do not match change type');
            }
            if (!Array.isArray(record.evidenceSourceIds) ||
                record.evidenceSourceIds.some((sourceId) => !unit.sources.some((source) => source.id === sourceId)) ||
                (record.changeType === 'revised' && ['scenario', 'acquisition-baseline', 'cost-line', 'risk-assumption'].includes(record.entityType) && record.evidenceSourceIds.length === 0)) {
                productionFinding(findings, 'PBRM-FIXTURE-COMPARED', `${recordPath}.evidenceSourceIds`, 'change evidence references invalid');
            }
        });
        REQUIRED_COMPARED_ENTITY_TYPES.forEach((entityType) => {
            if (!entityTypes.has(entityType)) productionFinding(findings, 'PBRM-FIXTURE-COMPARED', `${unitPath}.changes.records`, `material entity type missing: ${entityType}`);
        });
        const materialIdentities = [
            `thesis:${unit.thesis.id}`,
            `coverage:coverage:${unit.marketId}:${unit.segmentId}:segment`,
            `acquisition-sample:${unit.acquisitionSample.sampleId}`,
            `acquisition-baseline:${unit.acquisitionBaseline.baselineId}`,
            `risk-assumption:${unit.riskAssumptionBaseline.baselineId}`,
            ...unit.claims.map((record) => `claim:${record.id}`),
            ...unit.sources.map((record) => `source:${record.id}`),
            ...unit.metricObservations.map((record) => `metric-observation:${record.id}`),
            ...unit.legalFacts.map((record) => `legal-fact:${record.id}`),
            ...unit.drivers.map((record) => `driver:${record.id}`),
            ...unit.forecastMethods.map((record) => `forecast-method:${record.id}`),
            ...unit.scenarios.map((record) => `scenario:${record.id}`),
            ...unit.unknowns.map((record) => `unknown:${record.id}`),
            ...unit.luxuryQualification.members.map((member) => `qualification-member:${member.memberId}`),
            ...unit.acquisitionSample.memberIds.map((memberId) => `sample-member:${memberId}`),
            ...unit.variableCostBaseline.components.concat(unit.fixedRiskCostBaseline.lines).map((line) => {
                const suffix = line.costFieldId.split(':').at(-1);
                return `cost-line:cost-line:${unit.marketId}:${unit.segmentId}:${suffix}`;
            })
        ];
        if (identities.size !== unit.changes.records.length || identities.size !== materialIdentities.length || materialIdentities.some((identity) => !identities.has(identity))) {
            productionFinding(findings, 'PBRM-FIXTURE-COMPARED', `${unitPath}.changes.records`, 'change accounting must cover every current material identity exactly once');
        }
        recordCount += unit.changes.records.length;
    });
    return { comparedUnits: comparedUnits.length, recordCount };
}

function validateProductionUnit(unit, unitPath, configIndex, findings) {
    const pairToken = `:${unit.marketId}:${unit.segmentId}:`;
    const sources = new Map(unit.sources.map((record) => [record.id, record]));
    const claims = new Map(unit.claims.map((record) => [record.id, record]));
    claims.set(unit.thesis.id, unit.thesis);
    const metrics = new Map(unit.metricObservations.map((record) => [record.id, record]));
    const methods = new Map(unit.forecastMethods.map((record) => [record.id, record]));
    const scenarios = new Map(unit.scenarios.map((record) => [record.id, record]));
    const legal = new Map(unit.legalFacts.map((record) => [record.id, record]));
    const categorySourceIds = new Set();

    if (unit.prior.mode !== 'baseline' || unit.prior.unitId !== null || unit.prior.researchedAt !== null || unit.prior.gitBlobOid !== null ||
        unit.changes.mode !== 'baseline' || unit.changes.priorUnitId !== null || unit.changes.records.length !== 0 || unit.thesis.changeViewClaimIds.length !== 0) {
        productionFinding(findings, 'PBRM-PRODUCTION-BASELINE', `${unitPath}.prior`, 'baseline-no-prior contract violated');
    }
    const categoryIds = unit.categoryCoverage.map((entry) => entry.categoryId);
    if (JSON.stringify(categoryIds) !== JSON.stringify(REQUIRED_CATEGORIES)) {
        productionFinding(findings, 'PBRM-PRODUCTION-CATEGORY', `${unitPath}.categoryCoverage`, 'nine categories must appear in config order');
    }
    unit.categoryCoverage.forEach((category, categoryIndex) => {
        const categoryPath = `${unitPath}.categoryCoverage.${categoryIndex}`;
        [...category.eligibleSourceIds, ...category.attemptedSourceIds].forEach((id) => categorySourceIds.add(id));
        requireReferences(category.eligibleSourceIds, sources, findings, `${categoryPath}.eligibleSourceIds`);
        requireReferences(category.attemptedSourceIds, sources, findings, `${categoryPath}.attemptedSourceIds`);
        if (category.summaryClaimId !== null && !claims.has(category.summaryClaimId)) {
            productionFinding(findings, 'PBRM-PRODUCTION-REFERENCE', `${categoryPath}.summaryClaimId`, 'summary claim unresolved');
        }
        category.eligibleSourceIds.forEach((id) => {
            const source = sources.get(id);
            if (source && (source.categoryId !== category.categoryId || source.state !== 'eligible')) {
                productionFinding(findings, 'PBRM-PRODUCTION-SOURCE-STATE', categoryPath, 'eligible category source has wrong category or state');
            }
        });
        category.attemptedSourceIds.forEach((id) => {
            const source = sources.get(id);
            if (source && (!['inaccessible', 'rejected'].includes(source.state) || source.rights.numericValueAllowed !== false)) {
                productionFinding(findings, 'PBRM-PRODUCTION-ATTEMPT', categoryPath, 'attempted source must be inaccessible/rejected and non-numeric');
            }
        });
        if (category.state === 'researched' && category.eligibleSourceIds.length === 0) {
            productionFinding(findings, 'PBRM-PRODUCTION-CATEGORY', categoryPath, 'researched category requires eligible evidence');
        }
        if (['unknown', 'unavailable'].includes(category.state) && category.attemptedSourceIds.length === 0 && category.missingFieldIds.length === 0) {
            productionFinding(findings, 'PBRM-PRODUCTION-CATEGORY', categoryPath, 'unknown category requires an attempt or exact missing field');
        }
    });

    unit.sources.forEach((source, sourceIndex) => {
        const sourcePath = `${unitPath}.sources.${sourceIndex}`;
        validateExactKeys(source, SOURCE_KEYS, findings, sourcePath);
        validateExactKeys(source.access, ['state', 'checkedAt', 'note'], findings, `${sourcePath}.access`);
        validateExactKeys(source.rights, ['state', 'numericValueAllowed', 'summaryAllowed', 'note'], findings, `${sourcePath}.rights`);
        validateExactKeys(source.observationPeriod, ['start', 'end'], findings, `${sourcePath}.observationPeriod`);
        if (!source.id.includes(pairToken) || source.segmentApplicability.length !== 1 || source.segmentApplicability[0] !== unit.segmentId) {
            productionFinding(findings, 'PBRM-PRODUCTION-PAIR', sourcePath, 'source is not pair-local');
        }
        if (!configIndex.geographiesById.has(source.geographyId) || !configIndex.populationsById.has(source.populationId) || !configIndex.sourcePoliciesById.has(source.policyId)) {
            productionFinding(findings, 'PBRM-PRODUCTION-REFERENCE', sourcePath, 'source config reference unresolved');
        }
        if (!categorySourceIds.has(source.id)) productionFinding(findings, 'PBRM-PRODUCTION-REVERSE', sourcePath, 'source has no category reverse reference');
        if (!rental.validateMarketPayload.safeSourceUrl(source.url).ok || (source.methodologyUrl !== null && !rental.validateMarketPayload.safeSourceUrl(source.methodologyUrl).ok)) {
            productionFinding(findings, 'PBRM-PRODUCTION-SOURCE-SAFETY', `${sourcePath}.url`, 'unsafe source URL');
        }
        if (!Number.isFinite(Date.parse(source.retrievedAt)) || !Number.isFinite(Date.parse(source.access.checkedAt))) {
            productionFinding(findings, 'PBRM-PRODUCTION-CLOCK', sourcePath, 'retrieval/access clock invalid');
        }
        if (source.state !== 'eligible' && source.rights.numericValueAllowed !== false) {
            productionFinding(findings, 'PBRM-PRODUCTION-RIGHTS', `${sourcePath}.rights.numericValueAllowed`, 'non-eligible source cannot allow numeric evidence');
        }
    });

    function validateSourceRefs(sourceRefs, referencePath, positiveEvidence) {
        sourceRefs.forEach((reference, referenceIndex) => {
            validateExactKeys(reference, ['sourceId', 'role'], findings, `${referencePath}.${referenceIndex}`);
            const source = sources.get(reference.sourceId);
            if (!source) productionFinding(findings, 'PBRM-PRODUCTION-REFERENCE', `${referencePath}.${referenceIndex}`, 'source reference unresolved');
            else if (source.state !== 'eligible' && reference.role !== 'attempt') productionFinding(findings, 'PBRM-PRODUCTION-ATTEMPT', `${referencePath}.${referenceIndex}`, 'attempted source used as positive evidence');
            else if (positiveEvidence && reference.role !== 'attempt' && source.rights.numericValueAllowed !== true && source.rights.summaryAllowed !== true) {
                productionFinding(findings, 'PBRM-PRODUCTION-RIGHTS', `${referencePath}.${referenceIndex}`, 'source rights do not support evidence');
            }
        });
    }

    unit.claims.forEach((claim, claimIndex) => {
        const claimPath = `${unitPath}.claims.${claimIndex}`;
        validateExactKeys(claim, CLAIM_KEYS, findings, claimPath);
        if (!claim.id.includes(pairToken) || !configIndex.geographiesById.has(claim.geographyId) || !configIndex.populationsById.has(claim.populationId)) {
            productionFinding(findings, 'PBRM-PRODUCTION-PAIR', claimPath, 'claim is not pair-local or config-resolvable');
        }
        validateSourceRefs(claim.sourceRefs, `${claimPath}.sourceRefs`, claim.kind !== 'unknown');
        requireReferences(claim.metricObservationIds, metrics, findings, `${claimPath}.metricObservationIds`);
        requireReferences(claim.supportsClaimIds, claims, findings, `${claimPath}.supportsClaimIds`);
        requireReferences(claim.contradictsClaimIds, claims, findings, `${claimPath}.contradictsClaimIds`);
        if (claim.evidenceClass === 'modeled-output') productionFinding(findings, 'PBRM-PRODUCTION-CLASS', `${claimPath}.evidenceClass`, 'source claim cannot be modeled output');
    });

    unit.metricObservations.forEach((metric, metricIndex) => {
        const metricPath = `${unitPath}.metricObservations.${metricIndex}`;
        validateExactKeys(metric, METRIC_KEYS, findings, metricPath);
        if (!metric.id.includes(pairToken) || metric.evidenceClass !== 'observed' || !configIndex.metricDefinitionsById.has(metric.metricDefinitionId)) {
            productionFinding(findings, 'PBRM-PRODUCTION-METRIC', metricPath, 'production metric identity/class invalid');
        }
        validateSourceRefs(metric.sourceRefs, `${metricPath}.sourceRefs`, true);
        metric.sourceRefs.forEach((reference) => {
            const source = sources.get(reference.sourceId);
            if (source && source.rights.numericValueAllowed !== true) productionFinding(findings, 'PBRM-PRODUCTION-RIGHTS', metricPath, 'numeric metric source lacks numeric rights');
        });
    });

    unit.forecastMethods.forEach((method, methodIndex) => {
        const methodPath = `${unitPath}.forecastMethods.${methodIndex}`;
        if (!method.id.includes(pairToken) || method.pairKey !== unit.pairKey) productionFinding(findings, 'PBRM-PRODUCTION-PAIR', methodPath, 'forecast method is not pair-local');
        requireReferences(method.sourceIds, sources, findings, `${methodPath}.sourceIds`);
    });
    unit.scenarios.forEach((scenario, scenarioIndex) => {
        const scenarioPath = `${unitPath}.scenarios.${scenarioIndex}`;
        validateExactKeys(scenario, SCENARIO_KEYS, findings, scenarioPath);
        if (!scenario.id.includes(pairToken) || scenario.pairKey !== unit.pairKey || !configIndex.scenariosById.has(scenario.scenarioSlotId) || !methods.has(scenario.forecastMethodId)) {
            productionFinding(findings, 'PBRM-PRODUCTION-SCENARIO', scenarioPath, 'scenario identity/method invalid');
        }
        requireReferences(scenario.observedBaselineRefs, metrics, findings, `${scenarioPath}.observedBaselineRefs`);
        ['baselineGapClaimIds', 'assumptionClaimIds', 'inferenceClaimIds', 'falsifierClaimIds'].forEach((key) => requireReferences(scenario[key], claims, findings, `${scenarioPath}.${key}`));
    });
    if (!scenarios.has(unit.initialSelection.scenarioId)) productionFinding(findings, 'PBRM-PRODUCTION-SCENARIO', `${unitPath}.initialSelection.scenarioId`, 'initial scenario unresolved');

    requireReferences(unit.thesis.changeViewClaimIds, claims, findings, `${unitPath}.thesis.changeViewClaimIds`);
    ['summaryClaimId', 'strongestSupportClaimId', 'strongestConflictOrUnknownClaimId'].forEach((key) => {
        if (unit.thesis[key] !== null && !claims.has(unit.thesis[key])) productionFinding(findings, 'PBRM-PRODUCTION-REFERENCE', `${unitPath}.thesis.${key}`, 'thesis claim unresolved');
    });
    ['catalystClaimIds', 'riskClaimIds', 'unknownClaimIds'].forEach((key) => requireReferences(unit.thesis[key], claims, findings, `${unitPath}.thesis.${key}`));

    requireReferences(unit.acquisitionSample.sourceIds, sources, findings, `${unitPath}.acquisitionSample.sourceIds`);
    requireReferences(unit.acquisitionSample.legalUnknownIds, legal, findings, `${unitPath}.acquisitionSample.legalUnknownIds`);
    requireReferences(unit.acquisitionBaseline.assumptionClaimIds, claims, findings, `${unitPath}.acquisitionBaseline.assumptionClaimIds`);
    requireReferences(unit.acquisitionBaseline.legalUnknownIds, legal, findings, `${unitPath}.acquisitionBaseline.legalUnknownIds`);
    if (unit.acquisitionBaseline.sampleId !== unit.acquisitionSample.sampleId) productionFinding(findings, 'PBRM-PRODUCTION-REFERENCE', `${unitPath}.acquisitionBaseline.sampleId`, 'acquisition sample mismatch');

    unit.legalFacts.forEach((record, index) => {
        const recordPath = `${unitPath}.legalFacts.${index}`;
        if (!record.id.includes(pairToken) || record.pairKey !== unit.pairKey || !configIndex.legalFieldsById.has(record.legalFieldId)) productionFinding(findings, 'PBRM-PRODUCTION-PAIR', recordPath, 'legal record invalid');
        requireReferences(record.sourceIds, sources, findings, `${recordPath}.sourceIds`);
    });
    unit.drivers.forEach((record, index) => {
        const recordPath = `${unitPath}.drivers.${index}`;
        if (!record.id.includes(pairToken) || record.pairKey !== unit.pairKey) productionFinding(findings, 'PBRM-PRODUCTION-PAIR', recordPath, 'driver invalid');
        requireReferences(record.sourceIds, sources, findings, `${recordPath}.sourceIds`);
    });
    unit.unknowns.forEach((record, index) => {
        const recordPath = `${unitPath}.unknowns.${index}`;
        if (!record.id.includes(pairToken) || record.pairKey !== unit.pairKey) productionFinding(findings, 'PBRM-PRODUCTION-PAIR', recordPath, 'unknown record invalid');
        requireReferences(record.sourceIds, sources, findings, `${recordPath}.sourceIds`);
    });

    const market = configIndex.marketsById.get(unit.marketId);
    const profile = configIndex.profilesById.get(market.profileId);
    const requiredLegalIds = profile.requiredLegalFieldIds.filter((id) => configIndex.legalFieldsById.get(id).requiredForSegmentIds.includes(unit.segmentId));
    const requiredFixedIds = profile.requiredFixedRiskCostFieldIds.filter((id) => configIndex.costFieldsById.get(id).requiredForSegmentIds.includes(unit.segmentId));
    const requiredRiskIds = profile.requiredRiskFieldIds.filter((id) => configIndex.riskFieldsById.get(id).requiredForSegmentIds.includes(unit.segmentId));
    const actualLegalIds = unit.legalFacts.map((record) => record.legalFieldId);
    const actualFixedIds = unit.fixedRiskCostBaseline.lines.map((record) => record.costFieldId);
    const actualRiskIds = unit.riskAssumptionBaseline.riskLines.map((record) => record.riskFieldId);
    if (requiredLegalIds.some((id) => !actualLegalIds.includes(id))) productionFinding(findings, 'PBRM-PRODUCTION-LEGAL', `${unitPath}.legalFacts`, 'required legal field missing');
    if (requiredFixedIds.some((id) => !actualFixedIds.includes(id)) || new Set(actualFixedIds).size !== actualFixedIds.length) productionFinding(findings, 'PBRM-PRODUCTION-COST', `${unitPath}.fixedRiskCostBaseline.lines`, 'required fixed/risk cost fields must appear and fields cannot duplicate');
    if (requiredRiskIds.some((id) => !actualRiskIds.includes(id)) || new Set(actualRiskIds).size !== actualRiskIds.length) productionFinding(findings, 'PBRM-PRODUCTION-RISK', `${unitPath}.riskAssumptionBaseline.riskLines`, 'required risk fields must appear and fields cannot duplicate');
    unit.fixedRiskCostBaseline.lines.forEach((line, index) => {
        requireReferences(line.sourceIds, sources, findings, `${unitPath}.fixedRiskCostBaseline.lines.${index}.sourceIds`);
        requireReferences(line.assumptionClaimIds, claims, findings, `${unitPath}.fixedRiskCostBaseline.lines.${index}.assumptionClaimIds`);
        if (line.valueState === 'missing' && line.annualUsd !== null) productionFinding(findings, 'PBRM-PRODUCTION-COST', `${unitPath}.fixedRiskCostBaseline.lines.${index}`, 'missing cost must be null');
    });
    unit.riskAssumptionBaseline.riskLines.forEach((line, index) => {
        requireReferences(line.sourceIds, sources, findings, `${unitPath}.riskAssumptionBaseline.riskLines.${index}.sourceIds`);
        requireReferences(line.assumptionClaimIds, claims, findings, `${unitPath}.riskAssumptionBaseline.riskLines.${index}.assumptionClaimIds`);
        if (line.valueState === 'missing' && line.value !== null) productionFinding(findings, 'PBRM-PRODUCTION-RISK', `${unitPath}.riskAssumptionBaseline.riskLines.${index}`, 'missing risk value must be null');
    });

    if (/^large-luxury-[0-9]+plus$/.test(unit.segmentId)) {
        if (unit.luxuryQualification.disposition !== 'unknown' || unit.metricObservations.length !== 0 || unit.acquisitionBaseline.state !== 'unavailable' || unit.acquisitionBaseline.purchasePriceUsd !== null) {
            productionFinding(findings, 'PBRM-PRODUCTION-LUXURY', unitPath, 'luxury unknown/no-substitution contract violated');
        }
        if (!['sparse', 'unclean', 'unavailable'].includes(unit.acquisitionSample.state) || unit.acquisitionSample.status !== 'active-ask') {
            productionFinding(findings, 'PBRM-PRODUCTION-LUXURY', `${unitPath}.acquisitionSample`, 'luxury acquisition sample must be sparse/unclean active asks');
        }
        if (unit.scenarios.length !== 1 || unit.scenarios[0].scenarioSlotId !== 'scenario-slot:assumption-sensitivity' ||
            unit.scenarios[0].baseOccupancy !== null || unit.scenarios[0].baseAdrUsd !== null ||
            !['baseOccupancy', 'baseAdrUsd', 'purchasePriceUsd', 'variableOperatingExpenseRatio', 'annualFixedRiskCostUsd'].every((id) => unit.scenarios[0].requiredUserInputIds.includes(id))) {
            productionFinding(findings, 'PBRM-PRODUCTION-LUXURY', `${unitPath}.scenarios`, 'luxury scenario must require explicit user base/cost inputs');
        }
    } else {
        const slots = unit.scenarios.map((scenario) => scenario.scenarioSlotId).sort();
        const expectedSlots = ['scenario-slot:rest-2026-base', 'scenario-slot:2027-downside', 'scenario-slot:2027-base', 'scenario-slot:2027-upside'].sort();
        if (JSON.stringify(slots) !== JSON.stringify(expectedSlots) || unit.scenarios.some((scenario) => !scenario.assumptionClaimIds.length || !scenario.inferenceClaimIds.length || !scenario.falsifierClaimIds.length)) {
            productionFinding(findings, 'PBRM-PRODUCTION-SCENARIO', `${unitPath}.scenarios`, 'whole-market scenario matrix or lineage incomplete');
        }
    }
}

function validateScope2Production(config, configIndex, lines, findings) {
    config.marketCatalog.forEach((market) => {
        const payloadPath = path.join(root, market.payloadPath);
        if (!fs.existsSync(payloadPath)) return;
        let payload;
        try {
            payload = readJson(payloadPath);
        } catch (error) {
            productionFinding(findings, 'PBRM-PRODUCTION-PARSE', market.payloadPath, error.message);
            lines.push(`[pbrm-validator] production-${market.marketId}=FAIL parse`);
            return;
        }
        const result = rental.validateMarketPayload(payload, configIndex, market.marketId);
        if (!result.ok) findings.push(...result.errors.map((error) => ({ ...error, path: `${market.payloadPath}:${error.path}` })));
        if (payload.configVersion !== config.configVersion || payload.schemaVersion !== config.contracts.marketPayload || JSON.stringify(payload).includes('TEST FIXTURE')) {
            productionFinding(findings, 'PBRM-PRODUCTION-IDENTITY', market.payloadPath, 'production version or fixture authority invalid');
        }
        payload.units.forEach((unit, index) => validateProductionUnit(unit, `${market.payloadPath}:units.${index}`, configIndex, findings));
        lines.push(`[pbrm-validator] production-${market.marketId}=${result.ok ? 'PASS' : 'FAIL'} units=${payload.units.length}`);
    });

    const runbookPath = path.join(root, 'notes/place-based-rental-market-research.md');
    const promptPath = path.join(root, '.github/prompts/place-based-rental-market-update.prompt.md');
    if (fs.existsSync(runbookPath) && fs.existsSync(promptPath)) {
        const runbook = fs.readFileSync(runbookPath, 'utf8');
        const prompt = fs.readFileSync(promptPath, 'utf8');
        const requiredRunbookText = [
            'palm-springs-rental-market.payload.json', 'ocean-shores-rental-market.payload.json',
            'palm-springs-ca::whole-market', 'palm-springs-ca::large-luxury-5plus',
            'ocean-shores-wa::whole-market', 'ocean-shores-wa::large-luxury-4plus',
            'lodging performance', 'legal and active supply', 'housing and acquisition',
            'travel, access, and feeder markets', 'macro and financing', 'hotel competition',
            'events and seasonality', 'operating costs', 'physical risks',
            'Dirty-Proposal Refusal', 'invocation-owned restoration', 'UNCOMMITTED FOR REVIEW',
            'Do not auto-commit, stage, push, deploy'
        ];
        const missingText = requiredRunbookText.filter((text) => !runbook.includes(text));
        if (missingText.length) productionFinding(findings, 'PBRM-PRODUCTION-RUNBOOK', 'notes/place-based-rental-market-research.md', `missing runbook contracts: ${missingText.join(', ')}`);
        const requiredPromptText = ['palm-springs-rental-market.payload.json', 'ocean-shores-rental-market.payload.json', 'UNCOMMITTED FOR REVIEW', 'Do not stage, commit, push, deploy'];
        const missingPromptText = requiredPromptText.filter((text) => !prompt.includes(text));
        if (missingPromptText.length) productionFinding(findings, 'PBRM-PRODUCTION-PROMPT', '.github/prompts/place-based-rental-market-update.prompt.md', `missing prompt contracts: ${missingPromptText.join(', ')}`);
        lines.push(`[pbrm-validator] runbook-prompt=${missingText.length || missingPromptText.length ? 'FAIL' : 'PASS'} writeSet=2`);
    }
}

function validateScope1(options = {}) {
    const lines = [];
    const findings = [];
    const productionConfigPath = path.join(root, 'place-based-rental-market.config.json');
    const fixtureConfigPath = path.join(fixtureRoot, 'config.v2.json');
    const productionConfig = readJson(productionConfigPath);
    const fixtureConfig = readJson(fixtureConfigPath);
    const productionConfigValidation = rental.validateConfig(productionConfig);
    const fixtureConfigValidation = rental.validateConfig(fixtureConfig);
    if (!productionConfigValidation.ok) findings.push(...productionConfigValidation.errors);
    if (!fixtureConfigValidation.ok) findings.push(...fixtureConfigValidation.errors);
    const fixtureIndex = fixtureConfigValidation.ok ? rental.indexConfig(fixtureConfig) : null;
    const productionIndex = productionConfigValidation.ok ? rental.indexConfig(productionConfig) : null;
    lines.push(`[pbrm-validator] production-config=${productionConfigValidation.ok ? 'PASS' : 'FAIL'} path=${relative(productionConfigPath)}`);
    lines.push(`[pbrm-validator] fixture-config=${fixtureConfigValidation.ok ? 'PASS' : 'FAIL'} path=${relative(fixtureConfigPath)}`);

    if (options.payloadPath && options.configPath) {
        const candidate = validateCandidate(options.payloadPath, options.configPath, options.expectedMarketId || 'palm-springs-ca');
        if (!candidate.ok) findings.push(...(candidate.configValidation.errors || []), ...((candidate.payloadValidation && candidate.payloadValidation.errors) || []));
        lines.push('[pbrm-validator] input-mode=legacy-two-argument-candidate');
        lines.push(`[pbrm-validator] candidate-config=${relative(options.configPath)}`);
        lines.push(`[pbrm-validator] candidate-payload=${relative(options.payloadPath)}`);
        lines.push(`[pbrm-validator] candidate-market=${options.expectedMarketId || 'palm-springs-ca'}`);
        lines.push(`[pbrm-validator] candidate=${candidate.ok ? 'PASS' : 'FAIL'}`);
        return { ok: findings.length === 0, lines, findings };
    }

    const palm = readJson(path.join(fixtureRoot, 'palm.valid.payload.json'));
    const comparedPalm = readJson(path.join(fixtureRoot, 'palm.compared.payload.json'));
    const ocean = readJson(path.join(fixtureRoot, 'ocean.valid.payload.json'));
    const palmValidation = rental.validateMarketPayload(palm, fixtureIndex, 'palm-springs-ca');
    const comparedPalmValidation = rental.validateMarketPayload(comparedPalm, fixtureIndex, 'palm-springs-ca');
    const oceanValidation = rental.validateMarketPayload(ocean, fixtureIndex, 'ocean-shores-wa');
    if (!palmValidation.ok) findings.push(...palmValidation.errors);
    if (!comparedPalmValidation.ok) findings.push(...comparedPalmValidation.errors);
    if (!oceanValidation.ok) findings.push(...oceanValidation.errors);
    lines.push(`[pbrm-validator] palm-fixture=${palmValidation.ok ? 'PASS' : 'FAIL'} units=${palm.units.length}`);
    const comparedFixtureReceipt = validateComparedFixture(comparedPalm, fixtureIndex, findings);
    lines.push(`[pbrm-validator] palm-compared-fixture=${comparedPalmValidation.ok ? 'PASS' : 'FAIL'} units=${comparedPalm.units.length} comparedUnits=${comparedFixtureReceipt.comparedUnits} records=${comparedFixtureReceipt.recordCount}`);
    lines.push(`[pbrm-validator] ocean-fixture=${oceanValidation.ok ? 'PASS' : 'FAIL'} units=${ocean.units.length}`);

    const closedMatrix = readJson(path.join(fixtureRoot, 'invalid-closed-schema.json'));
    let closedRejected = 0;
    for (const recipe of closedMatrix.cases) {
        const candidate = mutate(clone(recipe.target === 'config' ? fixtureConfig : palm), recipe);
        const result = recipe.target === 'config' ? rental.validateConfig(candidate) : rental.validateMarketPayload(candidate, fixtureIndex, 'palm-springs-ca');
        if (!result.ok && hasFinding(result, recipe.expectedCode, recipe.expectedPath)) closedRejected += 1;
        else findings.push({ code: 'PBRM-VALIDATOR-EXPECTED-REJECTION', path: recipe.id, message: JSON.stringify(result.errors) });
    }
    lines.push(`[pbrm-validator] closed-schema-rejections=${closedRejected}/${closedMatrix.cases.length}`);

    const pairLeak = rental.validateMarketPayload(readJson(path.join(fixtureRoot, 'invalid-pair-leak.json')), fixtureIndex, 'palm-springs-ca');
    const pairLeakRejected = !pairLeak.ok && hasFinding(pairLeak, 'PBRM-PAYLOAD-PAIR-LEAK');
    if (!pairLeakRejected) findings.push({ code: 'PBRM-VALIDATOR-PAIR-LEAK', path: 'invalid-pair-leak.json', message: 'expected pair leak rejection' });
    lines.push(`[pbrm-validator] pair-leak=${pairLeakRejected ? 'REJECTED' : 'ACCEPTED'}`);

    const broadFixture = readJson(path.join(fixtureRoot, 'broad-to-luxury-substitution.json'));
    const broadCandidate = clone(palm);
    broadCandidate.units.find((unit) => unit.segmentId === 'large-luxury-5plus').metricObservations.push(broadFixture.observation);
    const broadResult = rental.validateMarketPayload(broadCandidate, fixtureIndex, 'palm-springs-ca');
    const broadRejected = !broadResult.ok && hasFinding(broadResult, broadFixture.expectedCode);
    if (!broadRejected) findings.push({ code: 'PBRM-VALIDATOR-BROAD-LUXURY', path: 'broad-to-luxury-substitution.json', message: 'expected broad substitution rejection' });
    lines.push(`[pbrm-validator] broad-to-luxury=${broadRejected ? 'REJECTED' : 'ACCEPTED'}`);

    const occupancy = rental.computeAdjustedOccupancy(0.4, 0.1, 0.25);
    const invalidOccupancy = rental.computeAdjustedOccupancy(0.4, 0.1, -1);
    const payment = rental.computeMonthlyPayment(400000, 0.06, 30);
    const zeroPayment = rental.computeMonthlyPayment(400000, 0, 30);
    try {
        assert.equal(occupancy.ok, true);
        assert.ok(Math.abs(occupancy.value - (0.4 * 1.1 / 1.25)) < 1e-12);
        assert.equal(invalidOccupancy.errors[0].code, 'PBRM-MODEL-OCCUPANCY-DENOMINATOR');
        assert.equal(payment.branch, 'amortizing');
        assert.equal(zeroPayment.branch, 'zero-rate');
    } catch (error) {
        findings.push({ code: 'PBRM-VALIDATOR-EQUATION', path: 'rlrental.js', message: error.message });
    }
    lines.push(`[pbrm-validator] occupancy-equation=${occupancy.ok ? 'PASS' : 'FAIL'} value=${occupancy.value}`);
    lines.push(`[pbrm-validator] occupancy-denominator=${invalidOccupancy.ok ? 'ACCEPTED' : 'REJECTED'}`);
    lines.push(`[pbrm-validator] amortization=${payment.ok ? 'PASS' : 'FAIL'} branch=${payment.branch}`);
    lines.push(`[pbrm-validator] zero-rate=${zeroPayment.ok ? 'PASS' : 'FAIL'} branch=${zeroPayment.branch}`);

    const unsafeFixture = readJson(path.join(fixtureRoot, 'unsafe-source.json'));
    const unsafeCorrect = unsafeFixture.cases.every((candidate) => rental.validateMarketPayload.safeSourceUrl(candidate.url).ok === (candidate.reason === null));
    if (!unsafeCorrect) findings.push({ code: 'PBRM-VALIDATOR-SOURCE-SAFETY', path: 'unsafe-source.json', message: 'unsafe source matrix mismatch' });
    lines.push(`[pbrm-validator] unsafe-source-matrix=${unsafeCorrect ? 'PASS' : 'FAIL'} cases=${unsafeFixture.cases.length}`);

    const migration = validateMigrationClassification();
    if (!migration.ok) findings.push({ code: 'PBRM-VALIDATOR-MIGRATION', path: 'palm-springs-rental-market.config.json', message: 'legacy field classification incomplete' });
    lines.push(`[pbrm-validator] v1-field-classification=${migration.ok ? 'PASS' : 'FAIL'} fields=${migration.classified} legacyPresent=${migration.legacyPresent}`);

    const htmlPath = path.join(root, 'palm-springs-rental-market-lab.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    const scriptOrder = ['rldata.js', 'rlapp.js', 'rlcontracts.js', 'rlrental.js', 'rlnav.js'].map((name) => html.indexOf(`src="${name}"`));
    const orderValid = scriptOrder.every((position) => position >= 0) && scriptOrder.every((position, index) => index === 0 || position > scriptOrder[index - 1]);
    const duplicateLogic = /function\s+(?:validateResearchConfig|validateResearchPayload|computeAdjustedOccupancy|computeMonthlyPayment|computeRentalModel)\s*\(/.test(html);
    const routeAdapter = /RLRENTAL\.mountRoute\s*\(/.test(html) && /marketId:\s*"palm-springs-ca"/.test(html);
    if (!orderValid) findings.push({ code: 'PBRM-VALIDATOR-ROUTE-ORDER', path: 'palm-springs-rental-market-lab.html', message: 'shared script order invalid' });
    if (duplicateLogic) findings.push({ code: 'PBRM-VALIDATOR-DUPLICATE-LOGIC', path: 'palm-springs-rental-market-lab.html', message: 'page-local contract or equation logic remains' });
    if (!routeAdapter) findings.push({ code: 'PBRM-VALIDATOR-ROUTE-ADAPTER', path: 'palm-springs-rental-market-lab.html', message: 'shared route adapter missing' });
    lines.push(`[pbrm-validator] palm-script-order=${orderValid ? 'PASS' : 'FAIL'}`);
    lines.push(`[pbrm-validator] palm-duplicate-contract-logic=${duplicateLogic ? 'FOUND' : 'NONE'}`);
    lines.push(`[pbrm-validator] palm-route-adapter=${routeAdapter ? 'PASS' : 'FAIL'}`);

    const rentalSource = fs.readFileSync(path.join(root, 'rlrental.js'), 'utf8');
    const auditSlotIds = [
        'researchInventoryReceipt', 'changeAccountingAuditReceipt', 'attemptedResearchReceipt',
        'evidenceClassAuditReceipt', 'unitIndependenceReceipt', 'acquisitionAuditReceipt',
        'scenarioAuditReceipt'
    ];
    const auditSlotsPresent = auditSlotIds.every((id) => html.includes(`id="${id}"`));
    const auditTextOnly = auditSlotIds.every((id) => rentalSource.includes(`setText("${id}"`)) && !/\.innerHTML\s*=|insertAdjacentHTML\s*\(|document\.write\s*\(/.test(rentalSource);
    const comparedAdapterMapped = html.includes('comparedPayloads:') && html.includes('tests/fixtures/place-based-rental-market/palm.compared.payload.json');
    if (!auditSlotsPresent) findings.push({ code: 'PBRM-VALIDATOR-AUDIT-SLOTS', path: 'palm-springs-rental-market-lab.html', message: 'research audit output slots missing' });
    if (!auditTextOnly) findings.push({ code: 'PBRM-VALIDATOR-AUDIT-TEXT', path: 'rlrental.js', message: 'research audit must render through textContent-only setText calls' });
    if (!comparedAdapterMapped) findings.push({ code: 'PBRM-VALIDATOR-FIXTURE-MAP', path: 'palm-springs-rental-market-lab.html', message: 'closed compared fixture adapter mapping missing' });
    lines.push(`[pbrm-validator] research-audit-slots=${auditSlotsPresent ? 'PASS' : 'FAIL'} count=${auditSlotIds.length}`);
    lines.push(`[pbrm-validator] research-audit-text-only=${auditTextOnly ? 'PASS' : 'FAIL'}`);
    lines.push(`[pbrm-validator] compared-fixture-adapter=${comparedAdapterMapped ? 'PASS' : 'FAIL'}`);
    const metricIdentityMarketBranches = productionConfig.marketCatalog
        .map((market) => market.marketId)
        .filter((marketId) => branchesMetricIdentityOnMarket(rentalSource, marketId));
    if (metricIdentityMarketBranches.length) {
        findings.push({
            code: 'PBRM-VALIDATOR-METRIC-IDENTITY-AUTHORITY',
            path: 'rlrental.js',
            message: `metric identity branches on configured market IDs: ${metricIdentityMarketBranches.join(',')}`
        });
    }
    lines.push(`[pbrm-validator] metric-identity-config-authority=${metricIdentityMarketBranches.length ? 'FAIL' : 'PASS'} marketBranches=${metricIdentityMarketBranches.length}`);
    const configuredMarketIds = productionConfig.marketCatalog.map((market) => market.marketId);
    const branchDiscriminatorCases = configuredMarketIds.flatMap((marketId) => [
        `metricDefinitionId: unit.marketId === "${marketId}" ? "configured" : "fallback"`,
        `switch (unit.marketId) { case "${marketId}": metricDefinitionId = "configured"; }`
    ]);
    const branchDiscriminatorPasses = branchDiscriminatorCases.every((source, index) =>
        branchesMetricIdentityOnMarket(source, configuredMarketIds[Math.floor(index / 2)]));
    if (!branchDiscriminatorPasses) {
        findings.push({
            code: 'PBRM-VALIDATOR-METRIC-IDENTITY-DISCRIMINATOR',
            path: 'scripts/validate-place-based-rental-market.mjs',
            message: 'metric identity market-branch discriminator accepted an adversarial branch'
        });
    }
    lines.push(`[pbrm-validator] metric-identity-branch-discriminator=${branchDiscriminatorPasses ? 'PASS' : 'FAIL'} cases=${branchDiscriminatorCases.length}`);

    const compatibilitySource = fs.readFileSync(path.join(root, 'scripts/validate-palm-springs-rental-market.mjs'), 'utf8');
    const compatibilityDelegates = /validate-place-based-rental-market\.mjs/.test(compatibilitySource) && !/function\s+(?:validateConfig|validateMarketPayload|computeAdjustedOccupancy|computeMonthlyPayment|computeRentalResult)\s*\(/.test(compatibilitySource);
    if (!compatibilityDelegates) findings.push({ code: 'PBRM-VALIDATOR-COMPAT-DUPLICATION', path: 'scripts/validate-palm-springs-rental-market.mjs', message: 'compatibility wrapper must delegate only' });
    lines.push(`[pbrm-validator] compatibility-delegation=${compatibilityDelegates ? 'PASS' : 'FAIL'}`);

    const requiredScope2Paths = [
        'palm-springs-rental-market.payload.json',
        'ocean-shores-rental-market.payload.json',
        'notes/place-based-rental-market-research.md',
        '.github/prompts/place-based-rental-market-update.prompt.md'
    ];
    const missingScope2Paths = requiredScope2Paths.filter((filePath) => !fs.existsSync(path.join(root, filePath)));
    missingScope2Paths.forEach((filePath) => findings.push({
        code: 'PBRM-VALIDATOR-SCOPE-2-ARTIFACT',
        path: filePath,
        message: 'required Scope 2 production artifact missing'
    }));
    if (missingScope2Paths.length === 0 && productionIndex) validateScope2Production(productionConfig, productionIndex, lines, findings);
    const oceanRouteAbsent = !fs.existsSync(path.join(root, 'ocean-shores-rental-market-lab.html'));
    lines.push(`[pbrm-validator] scope-2-artifacts=${missingScope2Paths.length ? 'MISSING' : 'PRESENT'} missing=${missingScope2Paths.length}`);
    lines.push(`[pbrm-validator] ocean-production-route=${oceanRouteAbsent ? 'NOT_APPLICABLE_SCOPE_1' : 'PRESENT'}`);
    lines.push(`[pbrm-validator] findings=${findings.length}`);
    lines.push(`[pbrm-validator] ${findings.length ? 'FAIL' : 'OK'}`);
    return { ok: findings.length === 0, lines, findings };
}

export function runPlaceBasedRentalMarketValidation(options = {}) {
    return validateScope1(options);
}

function emit(result) {
    for (const line of result.lines) console.log(line);
    for (const finding of result.findings) console.error(`[pbrm-validator] finding=${finding.code} path=${finding.path} message=${finding.message}`);
    return result.ok ? 0 : 1;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
    const args = process.argv.slice(2);
    if (args.length !== 0) {
        console.error('usage: node scripts/validate-place-based-rental-market.mjs');
        process.exitCode = 2;
    } else process.exitCode = emit(runPlaceBasedRentalMarketValidation());
}