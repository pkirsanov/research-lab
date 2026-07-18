import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { gunzipSync } from 'node:zlib';

import '../rlcompany.js';
import { buildCompanyFundamentalsOwnerRead } from '../scripts/brief-refresh.mjs';

const company = globalThis.RLCOMPANY;

async function loadMaterializedFixture() {
    const pointer = JSON.parse(await readFile(new URL('../data/company-fundamentals/companies/sec-cik-0000789019/current.json', import.meta.url), 'utf8'));
    company.validateCompanyCurrentPointer(pointer, 'sec-cik-0000789019');
    const manifest = JSON.parse(await readFile(new URL(`../${pointer.manifestPath}`, import.meta.url), 'utf8'));
    const objects = {};
    const queue = [manifest.identityRef, manifest.summaryRef, manifest.dossierRef, manifest.ownerReadRef].concat(manifest.sourceRefs, manifest.historyRefs);
    if (manifest.modelPackRef) queue.push(manifest.modelPackRef);
    while (queue.length) {
        const ref = queue.shift();
        if (objects[ref.objectId]) continue;
        const value = JSON.parse(await readFile(new URL(`../${ref.path}`, import.meta.url), 'utf8'));
        objects[ref.objectId] = value;
        (function collectRefs(candidate) {
            if (candidate?.contractVersion === 'company-object-ref/v1') {
                queue.push(candidate);
                return;
            }
            if (Array.isArray(candidate)) candidate.forEach(collectRefs);
            else if (candidate && typeof candidate === 'object') Object.values(candidate).forEach(collectRefs);
        }(value));
    }
    const capture = JSON.parse(await readFile(new URL('./fixtures/company-fundamentals/source-qualified/sec-submissions-msft.extract.json', import.meta.url), 'utf8'));
    return {
        manifest,
        objects,
        sourceExtract: {
            completeResponse: capture.completeResponse,
            payloadPath: capture.payloadPath,
            sha256: capture.contentSha256
        }
    };
}

const fixture = await loadMaterializedFixture();

test('retained SEC payload is byte-hash coherent and production-parseable', async () => {
    const capture = JSON.parse(await readFile(new URL('./fixtures/company-fundamentals/source-qualified/sec-submissions-msft.extract.json', import.meta.url), 'utf8'));
    const encodedPayload = await readFile(new URL(`../${capture.payloadPath}`, import.meta.url), 'utf8');
    const sourceBytes = gunzipSync(Buffer.from(encodedPayload, 'base64'));
    const normalized = company.parseSecSubmissionsResponse(sourceBytes.toString('utf8'), {
        sourceUrl: capture.sourceUrl,
        cik: capture.cik,
        retrievedAt: capture.retrievedAt,
        mediaType: capture.mediaType,
        rights: capture.rights,
        requestIdentityPolicy: capture.requestIdentityPolicy
    });

    assert.equal(company.sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    assert.deepEqual(Object.keys(capture).sort(), [
        'byteLength',
        'cik',
        'completeResponse',
        'contentSha256',
        'contractVersion',
        'httpStatus',
        'mediaType',
        'payloadEncoding',
        'payloadPath',
        'requestIdentityPolicy',
        'requestStartedAt',
        'retrievedAt',
        'rights',
        'sourceUrl'
    ].sort());
    assert.equal(capture.completeResponse, true);
    assert.equal(capture.requestIdentityPolicy, 'sec-user-agent-required/v1');
    assert.equal(capture.requestStartedAt <= capture.retrievedAt, true);
    assert.equal(sourceBytes.length, capture.byteLength);
    assert.equal(`sha256:${createHash('sha256').update(sourceBytes).digest('hex')}`, capture.contentSha256);
    assert.equal(normalized.contentSha256, capture.contentSha256);
    assert.equal(normalized.cik, capture.cik);
});

test('production SEC parser hashes raw bytes and normalizes aligned issuer and filing fields', () => {
    const rawResponse = JSON.stringify({
        cik: '0000789019',
        name: 'MICROSOFT CORP',
        tickers: ['MSFT'],
        exchanges: ['Nasdaq'],
        fiscalYearEnd: '0630',
        filings: {
            recent: {
                accessionNumber: ['0000000000-26-000001', '0001193125-26-191507'],
                filingDate: ['2026-05-01', '2026-04-29'],
                reportDate: ['2026-05-01', '2026-03-31'],
                acceptanceDateTime: ['2026-05-01T12:00:00.000Z', '2026-04-29T20:06:24.000Z'],
                form: ['8-K', '10-Q'],
                primaryDocument: ['event.htm', 'msft-20260331.htm'],
                primaryDocDescription: ['Current report', '10-Q']
            }
        }
    });
    const provenance = {
        sourceUrl: 'https://data.sec.gov/submissions/CIK0000789019.json',
        cik: '0000789019',
        retrievedAt: '2026-07-16T21:26:24Z',
        mediaType: 'application/json',
        rights: 'redistributable-structured',
        requestIdentityPolicy: 'sec-user-agent-required/v1'
    };
    const normalized = company.parseSecSubmissionsResponse(rawResponse, provenance);

    assert.equal(normalized.contentSha256, `sha256:${company.sha256Hex(rawResponse)}`);
    assert.equal(normalized.issuerName, 'MICROSOFT CORP');
    assert.equal(normalized.fiscalYearEnd, '06-30');
    assert.equal(normalized.latestQuarterlyFiling.accessionNumber, '0001193125-26-191507');
    assert.equal(normalized.latestQuarterlyFiling.form, '10-Q');
    assert.deepEqual(normalized.provenance, provenance);

    const misaligned = JSON.parse(rawResponse);
    misaligned.filings.recent.reportDate.pop();
    assert.throws(
        () => company.parseSecSubmissionsResponse(JSON.stringify(misaligned), provenance),
        ({ code }) => code === 'C010-SOURCE-SCHEMA'
    );

    const missingForm = JSON.parse(rawResponse);
    delete missingForm.filings.recent.form;
    assert.throws(
        () => company.parseSecSubmissionsResponse(JSON.stringify(missingForm), provenance),
        ({ code }) => code === 'C010-SOURCE-SCHEMA'
    );
});

test('Scope 01 config declares every policy and fails loud on version or reference drift', async () => {
    const config = JSON.parse(await readFile(new URL('../company-fundamentals.config.json', import.meta.url), 'utf8'));
    const validation = company.validateCompanyConfig(config);

    assert.equal(validation.ok, true, JSON.stringify(validation.errors));
    assert.equal(company.companyObjectSha256(config), 'sha256:65d294cf8fe302d0a7a98f4f272025e8b913604b538dcac6af566c3ce1eae7fd');
    assert.equal(config.sec.request.minIntervalMs, 125);
    assert.deepEqual(
        validation.value.freshnessPolicies.map(({ evidenceClass }) => evidenceClass).sort(),
        [...company.EVIDENCE_CLASSES].sort()
    );
    assert.equal(validation.value.freshnessPolicies.every(({ status, maxAgeHours }) => status === 'active' && Number.isInteger(maxAgeHours)), true);
    assert.equal(validation.value.materialityPolicy.status, 'active');
    assert.equal(validation.value.materialityPolicy.rules[0].policyVersion, 'company-brief-ranking/v1');
    assert.deepEqual(validation.value.feature002.briefSubjects, ['sec-cik-0000789019']);

    const unknownVersion = structuredClone(config);
    unknownVersion.contractVersion = 'company-fundamentals-config/v2';
    assert.deepEqual(company.validateCompanyConfig(unknownVersion).errors.map(({ code }) => code), ['C010-CONFIG-VERSION']);

    const danglingSource = structuredClone(config);
    danglingSource.companies[0].identitySourceIds = ['source-not-registered'];
    assert.equal(company.validateCompanyConfig(danglingSource).errors.some(({ code }) => code === 'C010-CONFIG-REFERENCE'), true);

    const missingFreshnessClass = structuredClone(config);
    missingFreshnessClass.freshnessPolicies = missingFreshnessClass.freshnessPolicies.slice(1);
    assert.equal(company.validateCompanyConfig(missingFreshnessClass).errors.some(({ code, observed }) => code === 'C010-CONFIG-SCHEMA' && observed === 'missing freshness policy'), true);

    const malformedRegistryItems = [
        ['mappings', { mappingId: 'mapping-incomplete' }],
        ['formulas', { formulaId: 'formula-incomplete' }],
        ['peers', { peerSetId: 'peer-set-incomplete' }]
    ];
    for (const [registry, item] of malformedRegistryItems) {
        const malformed = structuredClone(config);
        malformed[registry] = [item];
        assert.equal(
            company.validateCompanyConfig(malformed).errors.some(({ code, affectedRefs }) => code === 'C010-CONFIG-SCHEMA' && affectedRefs.includes(Object.values(item)[0])),
            true,
            `${registry} must validate every item, not only its ID`
        );
    }

    const malformedArchetypes = structuredClone(config);
    malformedArchetypes.archetypes.definitions = [{ archetypeId: 'archetype-incomplete' }];
    malformedArchetypes.archetypes.assignments = [{ assignmentId: 'assignment-incomplete' }];
    assert.equal(company.validateCompanyConfig(malformedArchetypes).errors.some(({ code, affectedRefs }) => code === 'C010-CONFIG-SCHEMA' && affectedRefs.includes('archetype-incomplete')), true);
    assert.equal(company.validateCompanyConfig(malformedArchetypes).errors.some(({ code, affectedRefs }) => code === 'C010-CONFIG-SCHEMA' && affectedRefs.includes('assignment-incomplete')), true);

    const populatedRegistries = structuredClone(config);
    populatedRegistries.mappings = [{
        mappingId: 'mapping-revenue',
        mappingVersion: 'us-gaap-revenue/v1',
        sourceId: 'sec-companyfacts-msft',
        sourceConcept: 'us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax',
        normalizedConcept: 'revenue',
        evidenceClass: 'reported',
        transformation: { sign: 1, scalePower10: 0, aggregation: 'none' },
        status: 'accepted'
    }];
    populatedRegistries.formulas = [{
        formulaId: 'formula-direction',
        formulaVersion: 'direction/v1',
        inputMappingIds: ['mapping-revenue'],
        outputConcept: 'fundamental-direction',
        expression: 'withhold-unless-comparable-revenue',
        status: 'accepted'
    }];
    populatedRegistries.archetypes.definitions = [{
        archetypeId: 'archetype-software-platform',
        archetypeVersion: 'software-platform/v1',
        label: 'Software platform',
        status: 'accepted',
        kpiPriorities: [{
            kpiId: 'kpi-direction',
            label: 'Fundamental direction',
            normalizedConcept: 'fundamental-direction',
            formulaId: 'formula-direction'
        }],
        diagnosticPolicies: [{
            policyId: 'policy-preferred-stock',
            policyVersion: 'preferred-stock/v1',
            concept: 'preferred-stock',
            applicability: 'always'
        }]
    }];
    populatedRegistries.archetypes.assignments = [{
        companyId: 'sec-cik-0000789019',
        primaryArchetypeId: 'archetype-software-platform',
        secondaryArchetypeIds: [],
        status: 'accepted',
        rationale: 'Explicit foundation cross-reference test.'
    }];
    populatedRegistries.peers = [{
        peerSetId: 'peer-set-software-platform',
        peerSetVersion: 'software-platform/v1',
        purpose: 'Foundation compatibility contract',
        subjectCompanyId: 'sec-cik-0000789019',
        companyIds: ['sec-cik-0000789019'],
        archetypeIds: ['archetype-software-platform'],
        status: 'validated'
    }];
    assert.equal(company.validateCompanyConfig(populatedRegistries).ok, true, JSON.stringify(company.validateCompanyConfig(populatedRegistries).errors));

    const danglingRegistryRefs = [
        ['mapping source', (candidate) => { candidate.mappings[0].sourceId = 'source-unknown'; }, 'source-unknown'],
        ['formula mapping', (candidate) => { candidate.formulas[0].inputMappingIds = ['mapping-unknown']; }, 'mapping-unknown'],
        ['assignment company', (candidate) => { candidate.archetypes.assignments[0].companyId = 'company-unknown'; }, 'company-unknown'],
        ['assignment archetype', (candidate) => { candidate.archetypes.assignments[0].primaryArchetypeId = 'archetype-unknown'; }, 'archetype-unknown'],
        ['kpi priority formula', (candidate) => { candidate.archetypes.definitions[0].kpiPriorities[0].formulaId = 'formula-unknown'; }, 'formula-unknown'],
        ['peer company', (candidate) => { candidate.peers[0].companyIds = ['company-unknown']; }, 'company-unknown'],
        ['peer archetype', (candidate) => { candidate.peers[0].archetypeIds = ['archetype-unknown']; }, 'archetype-unknown']
    ];
    for (const [label, mutate, affectedRef] of danglingRegistryRefs) {
        const candidate = structuredClone(populatedRegistries);
        mutate(candidate);
        assert.equal(
            company.validateCompanyConfig(candidate).errors.some(({ code, affectedRefs }) => code === 'C010-CONFIG-REFERENCE' && affectedRefs.includes(affectedRef)),
            true,
            `${label} must reject a dangling cross-reference`
        );
    }
});

test('exact recorded source publication validates and binds the retained response bytes', () => {
    const validation = company.validatePublicationGraph(fixture.manifest, fixture.objects);
    const accepted = company.projectAcceptedPublication(fixture.manifest, fixture.objects);
    const submissionsSource = accepted.sources.find(({ sourceKind }) => sourceKind === 'sec-submissions');

    assert.equal(validation.ok, true, JSON.stringify(validation.errors));
    assert.equal(fixture.sourceExtract.completeResponse, true);
    assert.equal(fixture.manifest.configFingerprint, 'sha256:65d294cf8fe302d0a7a98f4f272025e8b913604b538dcac6af566c3ce1eae7fd');
    assert.equal(fixture.manifest.manifestSha256, company.companyManifestSha256(fixture.manifest));
    assert.equal(accepted.identity.issuerName, 'MICROSOFT CORP');
    assert.equal(accepted.identity.cik, '0000789019');
    assert.equal(accepted.periods[0].accession, '0001193125-26-191507');
    assert.equal(submissionsSource.contentSha256, fixture.sourceExtract.sha256);
    assert.match(submissionsSource.limitations[0], /^Exact raw SEC response bytes retained/);
    assert.equal(Object.isFrozen(accepted), true);
});

test('publication contracts reject unknown versions unsafe refs wrong companies tampering and duplicates', () => {
    const unknownVersion = structuredClone(fixture.objects['identity-msft']);
    unknownVersion.contractVersion = 'company-identity/v2';
    assert.equal(company.validateCompanyIdentity(unknownVersion).errors.some(({ code }) => code === 'C010-IDENTITY-SCHEMA'), true);

    const unsafeRef = structuredClone(fixture.manifest.identityRef);
    unsafeRef.path = '../identity.json';
    assert.equal(company.validateObjectRef(unsafeRef).errors.some(({ code }) => code === 'C010-PUBLICATION-REF'), true);

    const wrongCompany = structuredClone(fixture);
    const submissionsSourceId = wrongCompany.manifest.sourceRefs.find(({ objectId }) => wrongCompany.objects[objectId].sourceKind === 'sec-submissions').objectId;
    wrongCompany.objects[submissionsSourceId].companyId = 'sec-cik-0000000001';
    const wrongCompanyErrors = company.validatePublicationGraph(wrongCompany.manifest, wrongCompany.objects).errors.map(({ code }) => code);
    assert.equal(wrongCompanyErrors.includes('C010-PUBLICATION-COMPANY'), true);
    assert.equal(wrongCompanyErrors.includes('C010-PUBLICATION-HASH'), true);

    const tampered = structuredClone(fixture);
    tampered.objects['summary-msft-foundation-g1'].direction.label = 'Available';
    assert.equal(company.validatePublicationGraph(tampered.manifest, tampered.objects).errors.some(({ code }) => code === 'C010-PUBLICATION-HASH'), true);

    const duplicateDossier = structuredClone(fixture.objects['dossier-msft-foundation-g1']);
    duplicateDossier.observations.push(structuredClone(duplicateDossier.observations[0]));
    assert.equal(company.validateCompanyDossier(duplicateDossier).errors.some(({ code }) => code === 'C010-INTEGRITY-DUPLICATE'), true);

    assert.throws(() => company.canonicalizeCompanyObject({ invalid: Number.POSITIVE_INFINITY }), ({ code }) => code === 'C010-INTEGRITY-NONFINITE');
    assert.equal(company.validateCompanyError({
        contractVersion: 'company-error/v1',
        code: 'C010-NOT-A-REAL-CODE',
        scope: 'publication',
        severity: 'blocking',
        companyId: null,
        affectedRefs: [],
        observed: 'unknown code',
        required: 'closed code family',
        preserveLastValid: true
    }).ok, false);
});

test('source decimals remain reconstructable and evidence classes and states stay closed', () => {
    const decimal = company.parseFiniteDecimal('00123.4500');
    assert.deepEqual(decimal, { ok: true, value: 123.45, source: '00123.4500' });
    assert.equal(company.parseFiniteDecimal('Infinity').ok, false);
    assert.equal(company.parseFiniteDecimal('').ok, false);

    const invalidClass = structuredClone(fixture.objects['dossier-msft-foundation-g1'].observations[0]);
    invalidClass.evidenceClass = 'test-invented-class';
    assert.equal(company.validateFactObservation(invalidClass).errors.some(({ code }) => code === 'C010-SOURCE-SCHEMA'), true);

    const unavailableWithValue = structuredClone(fixture.objects['dossier-msft-foundation-g1'].observations[0]);
    unavailableWithValue.state = 'unavailable';
    assert.equal(company.validateFactObservation(unavailableWithValue).errors.some(({ code }) => code === 'C010-INTEGRITY-DEPENDENCY'), true);
});

test('conflicted dependencies withhold only their reachable branch', () => {
    const result = company.propagateDependencyStates({
        nodes: [
            { id: 'fact-conflicted', kind: 'fact', state: 'conflicted', value: null },
            { id: 'fact-independent', kind: 'fact', state: 'available', value: '7.0' },
            { id: 'metric-dependent', kind: 'metric', state: 'available', value: '1.0' },
            { id: 'metric-independent', kind: 'metric', state: 'available', value: '7.0' }
        ],
        edges: [
            { from: 'fact-conflicted', to: 'metric-dependent' },
            { from: 'fact-independent', to: 'metric-independent' }
        ]
    });

    assert.equal(result.find(({ id }) => id === 'metric-dependent').state, 'conflicted');
    assert.equal(result.find(({ id }) => id === 'metric-dependent').value, null);
    assert.deepEqual(result.find(({ id }) => id === 'metric-dependent').missingFactIds, ['fact-conflicted']);
    assert.equal(result.find(({ id }) => id === 'metric-independent').state, 'available');
    assert.equal(result.find(({ id }) => id === 'metric-independent').value, '7.0');
});

test('same-origin loader resolves a current pointer and canonical objects without credentials', async () => {
    const observedRequests = [];
    const pointer = {
        contractVersion: 'company-current-pointer/v1',
        companyId: fixture.manifest.companyId,
        generation: fixture.manifest.generation,
        publicationId: fixture.manifest.publicationId,
        manifestPath: `data/company-fundamentals/objects/${fixture.manifest.manifestSha256.slice(7)}.json`,
        manifestSha256: fixture.manifest.manifestSha256,
        selectedAt: '2026-07-16T21:26:24Z'
    };
    const objectByPath = new Map(Object.values(fixture.objects).map((object) => [
        `data/company-fundamentals/objects/${company.companyObjectSha256(object).slice(7)}.json`,
        object
    ]));
    const fetchPublication = async (url, init) => {
        observedRequests.push({ url, init });
        const path = new URL(url).pathname.slice(1);
        let body;
        if (path.endsWith('/current.json')) body = JSON.stringify(pointer);
        else if (path === pointer.manifestPath) body = JSON.stringify(fixture.manifest);
        else if (objectByPath.has(path)) body = company.canonicalizeCompanyObject(objectByPath.get(path));
        else return new Response('', { status: 404, headers: { 'content-type': 'application/json' } });
        return new Response(body, { status: 200, headers: { 'content-type': 'application/json; charset=utf-8' } });
    };
    const accepted = await company.loadCompanyPublication({
        baseUrl: 'https://research-lab.example/company-fundamentals-lab.html',
        path: 'data/company-fundamentals/companies/sec-cik-0000789019/current.json',
        companyId: 'sec-cik-0000789019',
        fetchImpl: fetchPublication
    });

    assert.equal(observedRequests[0].url, 'https://research-lab.example/data/company-fundamentals/companies/sec-cik-0000789019/current.json');
    assert.equal(observedRequests.some(({ url }) => url === `https://research-lab.example/${pointer.manifestPath}`), true);
    assert.equal(observedRequests.some(({ url }) => /\/data\/company-fundamentals\/objects\/[a-f0-9]{64}\.json$/.test(url)), true);
    observedRequests.forEach(({ init }) => assert.deepEqual(init, {
        method: 'GET', cache: 'no-store', credentials: 'omit', redirect: 'error', headers: { Accept: 'application/json' }
    }));
    assert.equal(accepted.companyId, 'sec-cik-0000789019');

    let unsafePathFetchCalled = false;
    await assert.rejects(() => company.loadCompanyPublication({
        baseUrl: 'https://research-lab.example/company-fundamentals-lab.html',
        path: '../current.json',
        companyId: 'sec-cik-0000789019',
        fetchImpl: async () => {
            unsafePathFetchCalled = true;
            throw new Error('unsafe path must fail before fetch');
        }
    }), ({ code }) => code === 'C010-PUBLICATION-REF');
    assert.equal(unsafePathFetchCalled, false);

    await assert.rejects(() => company.loadCompanyPublication({
        baseUrl: 'https://research-lab.example/company-fundamentals-lab.html',
        path: 'data/company-fundamentals/companies/sec-cik-0000789019/current.json',
        companyId: 'sec-cik-0000789019',
        fetchImpl: async () => new Response(JSON.stringify(pointer), {
            status: 200,
            headers: { 'content-type': 'text/plain' }
        })
    }), ({ code }) => code === 'C010-PUBLICATION-CONTENT-TYPE');

    const tamperedObjectPath = fixture.manifest.identityRef.path;
    await assert.rejects(() => company.loadCompanyPublication({
        baseUrl: 'https://research-lab.example/company-fundamentals-lab.html',
        path: 'data/company-fundamentals/companies/sec-cik-0000789019/current.json',
        companyId: 'sec-cik-0000789019',
        fetchImpl: async (url, init) => {
            const path = new URL(url).pathname.slice(1);
            if (path !== tamperedObjectPath) return fetchPublication(url, init);
            const tamperedIdentity = structuredClone(fixture.objects[fixture.manifest.identityRef.objectId]);
            tamperedIdentity.issuerName = `${tamperedIdentity.issuerName} TAMPERED`;
            return new Response(JSON.stringify(tamperedIdentity), {
                status: 200,
                headers: { 'content-type': 'application/json' }
            });
        }
    }), ({ code }) => code === 'C010-PUBLICATION-HASH');

    const wrongCompanyPointer = structuredClone(pointer);
    wrongCompanyPointer.companyId = 'sec-cik-0000000001';
    await assert.rejects(() => company.loadCompanyPublication({
        baseUrl: 'https://research-lab.example/company-fundamentals-lab.html',
        path: 'data/company-fundamentals/companies/sec-cik-0000789019/current.json',
        companyId: 'sec-cik-0000789019',
        fetchImpl: async () => new Response(JSON.stringify(wrongCompanyPointer), {
            status: 200,
            headers: { 'content-type': 'application/json' }
        })
    }), ({ code }) => code === 'C010-PUBLICATION-COMPANY');
});

test('fixture projection withholds only revenue-dependent outputs and resolves its exact claim trace', () => {
    const accepted = company.projectAcceptedPublication(fixture.manifest, fixture.objects);
    const simple = company.selectSimpleView(accepted);
    const trace = company.selectSourcesView(accepted, 'claim-direction');

    assert.deepEqual(simple.dependencyResults.map(({ id, state }) => [id, state]), [
        ['fact-issuer-name', 'available'],
        ['fact-revenue', 'unavailable'],
        ['metric-direction', 'unavailable'],
        ['model-brief-eligibility', 'unavailable'],
        ['identity-summary', 'available']
    ]);
    assert.equal(simple.dependencyResults.find(({ id }) => id === 'identity-summary').value, 'MICROSOFT CORP | MSFT');
    assert.equal(simple.dependencyResults.find(({ id }) => id === 'metric-direction').value, null);
    assert.deepEqual(simple.dependencyResults.find(({ id }) => id === 'model-brief-eligibility').missingFactIds, ['fact-revenue']);
    assert.deepEqual(trace.observations, []);
    assert.deepEqual(trace.sourceRequirements.map(({ sourceId }) => sourceId), ['sec-companyfacts-msft']);
    assert.equal(trace.transformations[0].id, 'mapping-revenue');
    assert.equal(trace.transformations[1].id, 'formula-direction-foundation');
    assert.deepEqual(trace.consumers.map(({ consumerId }) => consumerId), ['simple-direction', 'foundation-owner-read']);
    assert.equal(trace.restatements[0].state, 'none-recorded');
    assert.equal(trace.conflicts[0].state, 'none-recorded');
    assert.equal(trace.unavailableLinks[0].requiredSourceId, 'sec-companyfacts-msft');
    assert.equal(trace.unavailableLinks[0].sourceConcept, 'us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax');
    assert.equal(trace.unavailableLinks[0].periodId, 'period-msft-fy2026-q3');
    assert.match(trace.unavailableLinks[0].reason, /Scope 01 retains exact SEC Submissions response bytes only/);
});

test('SCN-010-026 missing facts withhold only dependency-reachable outputs', () => {
    const result = company.propagateDependencyStates({
        nodes: [
            { id: 'fact-revenue', kind: 'fact', state: 'unavailable', value: null },
            { id: 'fact-cash', kind: 'fact', state: 'available', value: '125.00' },
            { id: 'metric-growth', kind: 'metric', state: 'available', value: '99.9' },
            { id: 'model-revenue', kind: 'model', state: 'available', value: '999.00' },
            { id: 'metric-liquidity', kind: 'metric', state: 'available', value: '2.50' }
        ],
        edges: [
            { from: 'fact-revenue', to: 'metric-growth' },
            { from: 'metric-growth', to: 'model-revenue' },
            { from: 'fact-cash', to: 'metric-liquidity' }
        ]
    });

    assert.deepEqual(result.map(({ id, state }) => [id, state]), [
        ['fact-revenue', 'unavailable'],
        ['fact-cash', 'available'],
        ['metric-growth', 'unavailable'],
        ['model-revenue', 'unavailable'],
        ['metric-liquidity', 'available']
    ]);
    assert.equal(result.find(({ id }) => id === 'metric-growth').value, null);
    assert.equal(result.find(({ id }) => id === 'model-revenue').value, null);
    assert.deepEqual(result.find(({ id }) => id === 'model-revenue').missingFactIds, ['fact-revenue']);
    assert.equal(result.find(({ id }) => id === 'metric-liquidity').value, '2.50');
});

test('SCN-010-029 material claims resolve the complete source and consumer chain', () => {
    const sourcesView = company.selectSourcesView({
        companyId: 'sec-cik-0000789019',
        claims: [{
            claimId: 'claim-direction',
            observationIds: ['obs-revenue'],
            transformationIds: ['mapping-revenue', 'formula-growth'],
            consumerIds: ['simple-direction', 'brief-change'],
            restatementIds: ['restatement-revenue'],
            conflictIds: ['conflict-revenue'],
            unavailableLinkIds: ['obs-margin']
        }],
        observations: [{
            observationId: 'obs-revenue',
            sourceRef: { objectId: 'source-10q' },
            periodRef: { objectId: 'period-2026-q2' },
            sourceConcept: 'us-gaap:RevenueFromContractWithCustomerExcludingAssessedTax',
            state: 'available'
        }],
        sources: [{
            sourceId: 'source-10q',
            rights: 'redistributable-structured',
            limitations: ['Filed values can be amended.']
        }],
        periods: [{ periodId: 'period-2026-q2', end: '2026-06-30', kind: 'quarter' }],
        mappings: [{ mappingId: 'mapping-revenue', normalizedConcept: 'revenue', mappingVersion: 'us-gaap-2026.1' }],
        formulas: [{ formulaId: 'formula-growth', formulaVersion: 'growth/v1', interpretation: 'Quarter-over-quarter revenue growth' }],
        consumers: [
            { consumerId: 'simple-direction', surface: 'simple' },
            { consumerId: 'brief-change', surface: 'brief' }
        ],
        restatements: [{ restatementId: 'restatement-revenue', state: 'superseded' }],
        conflicts: [{ conflictId: 'conflict-revenue', state: 'resolved-with-limitation' }],
        unavailableLinks: [{
            unavailableLinkId: 'obs-margin',
            concept: 'margin',
            requiredSourceId: 'source-10q',
            sourceConcept: 'us-gaap:OperatingIncomeLoss',
            periodId: 'period-2026-q2',
            reason: 'required observation missing'
        }]
    }, 'claim-direction');

    assert.equal(sourcesView.focusRef, 'claim-direction');
    assert.deepEqual(sourcesView.observations.map(({ observationId }) => observationId), ['obs-revenue']);
    assert.equal(sourcesView.observations[0].source.sourceId, 'source-10q');
    assert.equal(sourcesView.observations[0].period.periodId, 'period-2026-q2');
    assert.deepEqual(sourcesView.transformations.map(({ id, kind }) => [id, kind]), [
        ['mapping-revenue', 'mapping'],
        ['formula-growth', 'formula']
    ]);
    assert.deepEqual(sourcesView.consumers.map(({ consumerId }) => consumerId), ['simple-direction', 'brief-change']);
    assert.equal(sourcesView.rights[0].rights, 'redistributable-structured');
    assert.equal(sourcesView.restatements[0].restatementId, 'restatement-revenue');
    assert.equal(sourcesView.conflicts[0].conflictId, 'conflict-revenue');
    assert.equal(sourcesView.unavailableLinks[0].reason, 'required observation missing');
});

function objectRefFor(objectId, value) {
    const sha256 = company.companyObjectSha256(value);
    return { contractVersion: 'company-object-ref/v1', path: `data/company-fundamentals/objects/${sha256.slice(7)}.json`, sha256, objectId };
}

function statementObservation(observationId, value, state, sourceConcept) {
    const template = structuredClone(fixture.objects['dossier-msft-foundation-g1'].observations[0]);
    return {
        ...template,
        observationId,
        evidenceClass: 'reported',
        periodRef: objectRefFor('period-msft-fy2026-q3', fixture.objects['period-msft-fy2026-q3']),
        sourceConcept,
        value,
        valueType: 'decimal',
        unit: 'USD',
        currency: 'USD',
        decimals: '-6',
        signConvention: 'positive-natural',
        state
    };
}

test('TP-1-01 SCN-010-004 reporting periods classify exact meaning and never show YTD or instant as a standalone quarter', () => {
    const periodIds = ['period-msft-fy2026-q3', 'period-msft-fy2025-annual', 'period-msft-fy2026-q3-ytd', 'period-msft-fy2026-q3-instant'];
    const classified = periodIds.map((id) => company.classifyReportingPeriod(fixture.objects[id]));

    assert.deepEqual(classified.map(({ classification }) => classification), ['quarter', 'annual', 'year-to-date', 'instant']);
    // A YTD or instant observation is never eligible to appear as a standalone quarter.
    assert.deepEqual(classified.map(({ standaloneQuarter }) => standaloneQuarter), [true, false, false, false]);

    const [quarter, annual, yearToDate, instant] = classified;
    // A computed delta requires matching duration and comparability; cross-class periods never share a basis.
    assert.notEqual(quarter.comparabilityKey, annual.comparabilityKey);
    assert.notEqual(quarter.comparabilityKey, yearToDate.comparabilityKey);
    assert.notEqual(quarter.comparabilityKey, instant.comparabilityKey);
    assert.notEqual(annual.comparabilityKey, yearToDate.comparabilityKey);

    // The classification preserves the exact real SEC filing provenance of each period.
    assert.equal(fixture.objects['period-msft-fy2026-q3'].accession, '0001193125-26-191507');
    assert.equal(fixture.objects['period-msft-fy2025-annual'].form, '10-K');
    assert.equal(instant.start, null);
    assert.equal(instant.durationDays, null);

    // An invalid or fabricated period shape is rejected fail-loud, not silently classified.
    const brokenKind = structuredClone(fixture.objects['period-msft-fy2026-q3']);
    brokenKind.kind = 'invented-kind';
    assert.throws(() => company.classifyReportingPeriod(brokenKind), ({ code }) => code === 'C010-PERIOD-SCHEMA');
});

test('TP-1-01 SCN-010-006 and SCN-010-025 reconciliation restates amendments and keeps genuine conflicts visible without averaging', () => {
    const restated = company.reconcileFactObservations({
        factId: 'fact-total-assets',
        normalizedConcept: 'total-assets',
        mappingId: 'mapping-total-assets',
        mappingVersion: 'us-gaap-assets/v1',
        transformation: { sign: 1, scalePower10: 0, aggregation: 'none' },
        observations: [
            statementObservation('obs-assets-original', '500000000000', 'restated', 'us-gaap:Assets'),
            statementObservation('obs-assets-amended', '512000000000', 'current', 'us-gaap:Assets')
        ],
        amendments: [{ originalObservationId: 'obs-assets-original', amendingObservationId: 'obs-assets-amended' }]
    });
    assert.equal(restated.normalizedFact.resolutionState, 'restated');
    assert.equal(restated.normalizedFact.currentObservationId, 'obs-assets-amended');
    assert.deepEqual(restated.normalizedFact.observationIds, ['obs-assets-original', 'obs-assets-amended']);
    assert.equal(restated.changeEvent, 'restatement');
    assert.equal(restated.averaged, false);
    assert.equal(company.validateNormalizedFact(restated.normalizedFact).ok, true);

    const conflicted = company.reconcileFactObservations({
        factId: 'fact-total-assets',
        normalizedConcept: 'total-assets',
        mappingId: 'mapping-total-assets',
        mappingVersion: 'us-gaap-assets/v1',
        transformation: { sign: 1, scalePower10: 0, aggregation: 'none' },
        observations: [
            statementObservation('obs-assets-a', '500000000000', 'current', 'us-gaap:Assets'),
            statementObservation('obs-assets-b', '540000000000', 'current', 'us-gaap:Assets')
        ],
        amendments: []
    });
    assert.equal(conflicted.normalizedFact.resolutionState, 'conflicted');
    assert.equal(conflicted.normalizedFact.currentObservationId, null);
    assert.deepEqual(conflicted.conflictingObservationIds, ['obs-assets-a', 'obs-assets-b']);
    assert.equal(conflicted.changeEvent, 'conflict');
    // A conflict is NEVER collapsed into an average or any synthesized value.
    assert.equal(conflicted.averaged, false);
    assert.equal(conflicted.restatement, null);
    assert.equal(company.validateNormalizedFact(conflicted.normalizedFact).ok, true);

    const reconciled = company.reconcileFactObservations({
        factId: 'fact-total-assets',
        normalizedConcept: 'total-assets',
        mappingId: 'mapping-total-assets',
        mappingVersion: 'us-gaap-assets/v1',
        transformation: { sign: 1, scalePower10: 0, aggregation: 'none' },
        observations: [statementObservation('obs-assets-only', '512000000000', 'current', 'us-gaap:Assets')],
        amendments: []
    });
    assert.equal(reconciled.normalizedFact.resolutionState, 'reconciled');
    assert.equal(reconciled.normalizedFact.currentObservationId, 'obs-assets-only');

    // An invalid observation is rejected fail-loud rather than reconciled.
    assert.throws(() => company.reconcileFactObservations({
        factId: 'fact-total-assets',
        normalizedConcept: 'total-assets',
        mappingId: 'mapping-total-assets',
        mappingVersion: 'us-gaap-assets/v1',
        transformation: { sign: 1, scalePower10: 0, aggregation: 'none' },
        observations: [{ contractVersion: 'fact-observation/v1', observationId: 'obs-broken' }],
        amendments: []
    }), ({ code }) => code === 'C010-SOURCE-SCHEMA');
});

test('TP-1-01 SCN-010-005 and SCN-010-026 statement integrity fires balance-sheet imbalance and passes clean statements while keeping source facts inspectable', () => {
    const imbalance = company.evaluateStatementIntegrity({
        companyId: 'sec-cik-0000789019',
        periodId: 'period-msft-fy2026-q3-instant',
        assets: { observationId: 'obs-assets', value: '600000000000', decimals: '-6' },
        liabilities: { observationId: 'obs-liabilities', value: '200000000000', decimals: '-6' },
        equity: { observationId: 'obs-equity', value: '250000000000', decimals: '-6' }
    });
    assert.equal(imbalance.withinTolerance, false);
    assert.equal(imbalance.error.code, 'C010-INTEGRITY-BALANCE-SHEET');
    assert.deepEqual(imbalance.error.affectedRefs, ['obs-assets', 'obs-liabilities', 'obs-equity']);
    assert.match(imbalance.error.observed, /difference 150000000000/);
    assert.match(imbalance.error.required, /summed XBRL rounding interval 1500000/);
    assert.equal(imbalance.difference, '150000000000');
    assert.equal(imbalance.allowedInterval, '1500000');
    // The source facts remain inspectable; only dependent conclusions are blocked.
    assert.deepEqual(Object.keys(imbalance.sourceFacts), ['assets', 'liabilities', 'equity']);
    assert.equal(imbalance.sourceFacts.assets.value, '600000000000');
    assert.deepEqual(imbalance.blockedConclusions, ['resilience-diagnostics', 'dependent-model', 'company-brief']);

    // A copied accepted set whose totals reconcile within the summed XBRL rounding interval stays clean.
    const clean = company.evaluateStatementIntegrity({
        companyId: 'sec-cik-0000789019',
        periodId: 'period-msft-fy2026-q3-instant',
        assets: { observationId: 'obs-assets', value: '512163000000', decimals: '-6' },
        liabilities: { observationId: 'obs-liabilities', value: '205753000000', decimals: '-6' },
        equity: { observationId: 'obs-equity', value: '306410000000', decimals: '-6' }
    });
    assert.equal(clean.withinTolerance, true);
    assert.equal(clean.error, null);
    assert.deepEqual(clean.blockedConclusions, []);
    assert.equal(clean.difference, '0');

    // The new balance-sheet integrity code is part of the closed error family.
    assert.equal(company.ERROR_CODES.includes('C010-INTEGRITY-BALANCE-SHEET'), true);
    const closedError = company.makeError('C010-INTEGRITY-BALANCE-SHEET', 'integrity', 'blocking', 'sec-cik-0000789019', ['obs-assets'], 'x', 'y', true);
    assert.equal(company.validateCompanyError(closedError).ok, true);
});

/* ---------------- Scope 2: derived metrics, diagnostics, archetype-prioritized Simple cockpit ---------------- */

const scope2Config = JSON.parse(await readFile(new URL('../company-fundamentals.config.json', import.meta.url), 'utf8'));
const scope2Accepted = company.projectAcceptedPublication(fixture.manifest, fixture.objects);

function derivedMetricInput(inputId, ref, concept, value, state, unit, periodId) {
    return { inputId, ref, concept, unit: unit || 'USD', periodId: periodId || 'period-msft-fy2026-q3', value, state };
}

function softwarePlatformArchetypeView() {
    return {
        contractVersion: 'company-archetype-view/v1',
        companyId: 'sec-cik-0000789019',
        status: 'accepted',
        primaryArchetypeId: 'archetype-software-platform',
        rationale: 'Recurring-revenue cloud software issuer.',
        definition: {
            archetypeId: 'archetype-software-platform',
            archetypeVersion: 'software-platform/v1',
            label: 'Software platform',
            status: 'accepted',
            kpiPriorities: [
                { kpiId: 'kpi-cloud', label: 'Cloud revenue', normalizedConcept: 'cloud-revenue', formulaId: null },
                { kpiId: 'kpi-backlog', label: 'Commercial backlog', normalizedConcept: 'commercial-backlog', formulaId: null },
                { kpiId: 'kpi-capex', label: 'Capital expenditure', normalizedConcept: 'capital-expenditure', formulaId: null },
                { kpiId: 'kpi-depreciation', label: 'Depreciation', normalizedConcept: 'depreciation', formulaId: null },
                { kpiId: 'kpi-margin', label: 'Operating margin', normalizedConcept: 'operating-margin', formulaId: 'formula-operating-margin' },
                { kpiId: 'kpi-cash-conversion', label: 'Cash conversion', normalizedConcept: 'cash-conversion', formulaId: 'formula-cash-conversion' },
                { kpiId: 'kpi-dilution', label: 'Dilution', normalizedConcept: 'dilution', formulaId: 'formula-net-share-change' }
            ],
            diagnosticPolicies: [
                { policyId: 'policy-preferred-stock', policyVersion: 'preferred-stock/v1', concept: 'preferred-stock', applicability: 'always' },
                { policyId: 'policy-capital-allocation', policyVersion: 'capital-allocation/v1', concept: 'capital-allocation-buyback', applicability: 'when-repurchase-flows-present' }
            ]
        }
    };
}

function unitEconomicsArchetypeView() {
    return {
        contractVersion: 'company-archetype-view/v1',
        companyId: 'sec-cik-0000789019',
        status: 'accepted',
        primaryArchetypeId: 'archetype-unit-economics',
        rationale: 'Constructed second archetype for KPI-priority divergence proof.',
        definition: {
            archetypeId: 'archetype-unit-economics',
            archetypeVersion: 'unit-economics/v1',
            label: 'Unit economics',
            status: 'accepted',
            kpiPriorities: [
                { kpiId: 'kpi-restaurant-count', label: 'Restaurant count', normalizedConcept: 'restaurant-count', formulaId: null },
                { kpiId: 'kpi-same-store-sales', label: 'Same-store sales', normalizedConcept: 'same-store-sales', formulaId: null },
                { kpiId: 'kpi-lease-obligations', label: 'Lease obligations', normalizedConcept: 'lease-obligations', formulaId: null }
            ],
            diagnosticPolicies: [
                { policyId: 'policy-lease-vs-debt', policyVersion: 'lease-vs-debt/v1', concept: 'lease-separation', applicability: 'always' }
            ]
        }
    };
}

test('TP-2-01 SCN-010-010 evaluateDiagnostic renders the raw record before any evidenced contextual adjustment', () => {
    const diagnostic = company.evaluateDiagnostic({
        checkId: 'check-interest-coverage',
        policyId: 'policy-interest-coverage',
        policyVersion: 'interest-coverage/v1',
        concept: 'interest-coverage',
        periodId: 'period-msft-fy2026-q3',
        raw: {
            formula: 'operating-income / interest-expense',
            threshold: '3.0',
            operation: 'ratio',
            inputs: [
                { inputId: 'operating-income', ref: 'obs-operating-income', concept: 'operating-income', unit: 'USD', periodId: 'period-msft-fy2026-q3', value: '30000000000', state: 'available' },
                { inputId: 'interest-expense', ref: 'obs-interest-expense', concept: 'interest-expense', unit: 'USD', periodId: 'period-msft-fy2026-q3', value: '500000000', state: 'available' }
            ]
        },
        contextualAdjustment: {
            adjustmentId: 'adj-lease-interest',
            amount: '250000000',
            rationale: 'Add back capitalized lease interest disclosed in the notes.',
            sourceRefs: ['obs-lease-note'],
            sensitivity: 'A 10% change in lease interest moves coverage by 0.2x.',
            applicability: 'Applies only while operating leases remain material.'
        },
        interpretationMode: null
    });

    assert.equal(diagnostic.contractVersion, 'company-diagnostic-check/v1');
    // The raw record renders first with value, formula, threshold, input refs, and period.
    assert.equal(diagnostic.raw.formula, 'operating-income / interest-expense');
    assert.equal(diagnostic.raw.threshold, '3.0');
    assert.deepEqual(diagnostic.raw.inputRefs, ['obs-operating-income', 'obs-interest-expense']);
    assert.equal(diagnostic.raw.period, 'period-msft-fy2026-q3');
    assert.equal(diagnostic.raw.value, '60');
    assert.equal(diagnostic.raw.state, 'available');
    assert.equal(diagnostic.presence, 'present');
    // The contextual adjustment renders separately and never erases the raw record.
    assert.equal(diagnostic.contextual.amount, '250000000');
    assert.equal(diagnostic.contextual.rationale, 'Add back capitalized lease interest disclosed in the notes.');
    assert.deepEqual(diagnostic.contextual.sourceRefs, ['obs-lease-note']);
    assert.match(diagnostic.contextual.sensitivity, /coverage by 0.2x/);
    assert.match(diagnostic.contextual.applicability, /operating leases remain material/);
    // No universal score is emitted anywhere on the diagnostic.
    assert.equal(Object.prototype.hasOwnProperty.call(diagnostic, 'score'), false);
    assert.equal(Object.isFrozen(diagnostic), true);
});

test('TP-2-01 SCN-010-011 omitted preferred stock is absent from the eligible source and never zero or pass', () => {
    const preferred = company.evaluateDiagnostic({
        checkId: 'check-preferred-stock',
        policyId: 'policy-preferred-stock',
        policyVersion: 'preferred-stock/v1',
        concept: 'preferred-stock',
        periodId: 'period-msft-fy2026-q3-instant',
        raw: {
            formula: 'preferred-stock-present-or-explicit-zero',
            threshold: null,
            operation: 'presence-check',
            inputs: []
        },
        contextualAdjustment: null,
        interpretationMode: null
    });

    assert.equal(preferred.presence, 'absent-from-eligible-source');
    assert.equal(preferred.raw.state, 'absent-from-eligible-source');
    // No numeric zero, positive interpretation, or summary pass is emitted.
    assert.equal(preferred.raw.value, null);
    assert.notEqual(preferred.raw.value, '0');
    assert.equal(preferred.contextual, null);
    assert.equal(/\bpass\b/i.test(JSON.stringify(preferred)), false);
    assert.equal(/beneficial|positive/i.test(String(preferred.interpretation || '')), false);
});

test('TP-2-01 SCN-010-012 buyback interpretation cites net share change and dilution and keeps gross flows distinct', () => {
    const buyback = company.evaluateDiagnostic({
        checkId: 'check-capital-allocation',
        policyId: 'policy-capital-allocation',
        policyVersion: 'capital-allocation/v1',
        concept: 'capital-allocation-buyback',
        periodId: 'period-msft-fy2026-q3',
        raw: {
            formula: 'net-share-change = shares-issued - shares-repurchased; dilution = share-based-comp / diluted-shares',
            threshold: null,
            operation: 'none',
            inputs: [
                { inputId: 'gross-repurchases', ref: 'obs-repurchase-outlay', concept: 'repurchase-outlay', unit: 'USD', periodId: 'period-msft-fy2026-q3', value: '10000000000', state: 'available', flowKind: 'period-flow' },
                { inputId: 'treasury-stock', ref: 'obs-treasury-stock', concept: 'treasury-stock', unit: 'USD', periodId: 'period-msft-fy2026-q3-instant', value: '85000000000', state: 'available', flowKind: 'balance' },
                { inputId: 'shares-issued', ref: 'obs-shares-issued', concept: 'shares-issued', unit: 'shares', periodId: 'period-msft-fy2026-q3', value: '30000000', state: 'available', flowKind: 'period-flow' },
                { inputId: 'shares-repurchased', ref: 'obs-shares-repurchased', concept: 'shares-repurchased', unit: 'shares', periodId: 'period-msft-fy2026-q3', value: '20000000', state: 'available', flowKind: 'period-flow' },
                { inputId: 'share-based-comp', ref: 'obs-sbc', concept: 'share-based-comp', unit: 'USD', periodId: 'period-msft-fy2026-q3', value: '2500000000', state: 'available', flowKind: 'period-flow' },
                { inputId: 'diluted-shares', ref: 'obs-diluted-shares', concept: 'diluted-shares', unit: 'shares', periodId: 'period-msft-fy2026-q3', value: '7500000000', state: 'available', flowKind: 'balance' }
            ]
        },
        contextualAdjustment: null,
        interpretationMode: 'capital-allocation'
    });

    // Gross repurchase outlay and treasury balance remain distinct from period share flows.
    assert.equal(buyback.capitalAllocation.grossRepurchaseOutlay.value, '10000000000');
    assert.equal(buyback.capitalAllocation.grossRepurchaseOutlay.flowKind, 'period-flow');
    assert.equal(buyback.capitalAllocation.treasuryStockBalance.value, '85000000000');
    assert.equal(buyback.capitalAllocation.treasuryStockBalance.flowKind, 'balance');
    // Net share change and dilution are the interpretation basis, not repurchase existence.
    assert.equal(buyback.capitalAllocation.netShareChange, '10000000');
    assert.equal(buyback.capitalAllocation.dilutionShareBasedComp, '2500000000');
    assert.equal(buyback.capitalAllocation.dilutedShares, '7500000000');
    assert.match(buyback.interpretation, /net share change/i);
    assert.match(buyback.interpretation, /dilution/i);
    // Repurchase existence alone is never treated as beneficial.
    assert.equal(/beneficial|value-accretive|shareholder-friendly/i.test(buyback.interpretation), false);
});

test('TP-2-01 evaluateDerivedMetric exposes formula and inputs with qualifications and never emits a universal score', () => {
    const cashConversion = company.evaluateDerivedMetric({
        metricId: 'metric-cash-conversion',
        formulaId: 'formula-cash-conversion',
        formulaVersion: 'cash-conversion/v1',
        outputConcept: 'cash-conversion',
        unit: 'ratio',
        periodId: 'period-msft-fy2026-q3',
        operation: 'ratio',
        inputs: [
            derivedMetricInput('in-ocf', 'fact-operating-cash-flow', 'operating-cash-flow', '36000000000', 'available'),
            derivedMetricInput('in-ni', 'fact-net-income', 'net-income', '24000000000', 'available')
        ],
        qualifications: []
    });

    assert.equal(cashConversion.contractVersion, 'company-derived-metric/v1');
    assert.equal(cashConversion.formulaId, 'formula-cash-conversion');
    assert.equal(cashConversion.expression, 'operating-cash-flow / net-income');
    assert.deepEqual(cashConversion.inputs.map((input) => input.ref), ['fact-operating-cash-flow', 'fact-net-income']);
    assert.equal(cashConversion.value, '1.5');
    assert.equal(cashConversion.state, 'available');
    assert.equal(Object.prototype.hasOwnProperty.call(cashConversion, 'score'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(cashConversion, 'universalScore'), false);

    // An invalid (zero) denominator blocks the value and records an explicit qualification rather than a fabricated result.
    const invalidDenominator = company.evaluateDerivedMetric({
        metricId: 'metric-cash-conversion',
        formulaId: 'formula-cash-conversion',
        formulaVersion: 'cash-conversion/v1',
        outputConcept: 'cash-conversion',
        unit: 'ratio',
        periodId: 'period-msft-fy2026-q3',
        operation: 'ratio',
        inputs: [
            derivedMetricInput('in-ocf', 'fact-operating-cash-flow', 'operating-cash-flow', '36000000000', 'available'),
            derivedMetricInput('in-ni', 'fact-net-income', 'net-income', '0', 'available')
        ],
        qualifications: []
    });
    assert.equal(invalidDenominator.value, null);
    assert.equal(invalidDenominator.state, 'blocked');
    assert.equal(invalidDenominator.qualifications.some((entry) => entry.rule === 'invalid-denominator'), true);

    // A missing input withholds the metric without a carried or zero value.
    const missingInput = company.evaluateDerivedMetric({
        metricId: 'metric-cash-conversion',
        formulaId: 'formula-cash-conversion',
        formulaVersion: 'cash-conversion/v1',
        outputConcept: 'cash-conversion',
        unit: 'ratio',
        periodId: 'period-msft-fy2026-q3',
        operation: 'ratio',
        inputs: [
            derivedMetricInput('in-ocf', 'fact-operating-cash-flow', 'operating-cash-flow', null, 'unavailable'),
            derivedMetricInput('in-ni', 'fact-net-income', 'net-income', '24000000000', 'available')
        ],
        qualifications: []
    });
    assert.equal(missingInput.value, null);
    assert.equal(missingInput.state, 'unavailable');
    assert.equal(missingInput.qualifications.some((entry) => entry.rule === 'missing-input'), true);
});

test('TP-2-01 SCN-010-001 archetype-prioritized Simple view orders software drivers and keeps separate clocks', () => {
    const archetypeView = company.resolveArchetypeView(scope2Config, 'sec-cik-0000789019');
    assert.equal(archetypeView.status, 'accepted');
    assert.equal(archetypeView.primaryArchetypeId, 'archetype-software-platform');

    const simple = company.selectSimpleView(scope2Accepted, archetypeView);
    assert.equal(simple.archetype.status, 'accepted');
    assert.equal(simple.archetype.label, 'Software platform');
    assert.deepEqual(
        simple.kpiPriorities.map((kpi) => kpi.normalizedConcept),
        ['cloud-revenue', 'commercial-backlog', 'capital-expenditure', 'depreciation', 'operating-margin', 'cash-conversion', 'dilution']
    );
    // No captured company-facts observation exists yet, so every software KPI is honestly unavailable with an evidence requirement.
    assert.equal(simple.kpiPriorities.every((kpi) => kpi.state === 'unavailable' && typeof kpi.evidenceRequirement === 'string'), true);
    // The four cockpit clocks stay separate and equal the owner objects.
    assert.equal(simple.clocks.statementCutoff, scope2Accepted.ownerRead.statementCutoff);
    assert.equal(simple.clocks.modelCutoff, scope2Accepted.ownerRead.modelCutoff);
    assert.equal(simple.clocks.briefCutoff, scope2Accepted.ownerRead.briefCutoff);
    assert.equal(simple.clocks.marketCutoff, scope2Accepted.ownerRead.marketCutoff);
    // Shared statements and dependency trace remain available under the lens.
    assert.equal(simple.dependencyResults.find((result) => result.id === 'identity-summary').value, 'MICROSOFT CORP | MSFT');
});

test('TP-2-01 SCN-010-008 archetypes change KPI priority while shared financial facts stay byte-equivalent', () => {
    const before = JSON.stringify(scope2Accepted);
    const software = company.selectSimpleView(scope2Accepted, softwarePlatformArchetypeView());
    const unitEconomics = company.selectSimpleView(scope2Accepted, unitEconomicsArchetypeView());
    const after = JSON.stringify(scope2Accepted);

    // The archetype changes KPI priority.
    assert.notDeepEqual(
        software.kpiPriorities.map((kpi) => kpi.normalizedConcept),
        unitEconomics.kpiPriorities.map((kpi) => kpi.normalizedConcept)
    );
    assert.equal(software.kpiPriorities[0].normalizedConcept, 'cloud-revenue');
    assert.equal(unitEconomics.kpiPriorities[0].normalizedConcept, 'restaurant-count');
    // The shared financial facts, IDs, values, periods, units, and sources remain byte-equivalent across archetypes.
    assert.equal(before, after);
    assert.deepEqual(software.identity, unitEconomics.identity);
    assert.deepEqual(software.evidenceCoverage, unitEconomics.evidenceCoverage);
    assert.deepEqual(software.claims, unitEconomics.claims);
    assert.deepEqual(software.dependencyResults, unitEconomics.dependencyResults);
    assert.equal(JSON.stringify(software.dependencyResults), JSON.stringify(company.selectSimpleView(scope2Accepted).dependencyResults));
});

test('TP-2-01 SCN-010-009 an unclassified company keeps shared facts and inherits no default lens', () => {
    const unclassifiedView = company.resolveArchetypeView({
        archetypes: {
            definitions: [],
            assignments: [{ companyId: 'sec-cik-0000789019', primaryArchetypeId: null, secondaryArchetypeIds: [], status: 'unclassified', rationale: 'No archetype evidence is accepted yet.' }]
        }
    }, 'sec-cik-0000789019');
    assert.equal(unclassifiedView.status, 'unclassified');
    assert.equal(unclassifiedView.definition, null);

    const simple = company.selectSimpleView(scope2Accepted, unclassifiedView);
    // Shared statements and the source trace remain available.
    assert.equal(simple.dependencyResults.find((result) => result.id === 'identity-summary').value, 'MICROSOFT CORP | MSFT');
    assert.equal(simple.evidenceCoverage.length >= 1, true);
    // KPI priorities, archetype diagnostics, and any company-specific lens are unavailable with evidence requirements.
    assert.equal(simple.archetype.status, 'unclassified');
    assert.equal(simple.archetype.label, null);
    assert.deepEqual(simple.kpiPriorities, []);
    assert.equal(simple.kpiAvailability.state, 'unavailable');
    assert.equal(typeof simple.kpiAvailability.evidenceRequirement, 'string');
    assert.deepEqual(simple.diagnostics, []);
    assert.equal(simple.diagnosticsAvailability.state, 'unavailable');
    assert.equal(typeof simple.diagnosticsAvailability.evidenceRequirement, 'string');
});

test('TP-2-01 populated Scope 2 config resolves an accepted archetype view and derived formulas', () => {
    const validation = company.validateCompanyConfig(scope2Config);
    assert.equal(validation.ok, true, JSON.stringify(validation.errors));
    const softwareArchetype = scope2Config.archetypes.definitions.find((definition) => definition.archetypeId === 'archetype-software-platform');
    assert.equal(Array.isArray(softwareArchetype.kpiPriorities) && softwareArchetype.kpiPriorities.length > 0, true);
    assert.equal(Array.isArray(softwareArchetype.diagnosticPolicies) && softwareArchetype.diagnosticPolicies.length > 0, true);
    assert.equal(scope2Config.formulas.length > 0, true);
    assert.equal(scope2Config.archetypes.assignments.some((assignment) => assignment.companyId === 'sec-cik-0000789019' && assignment.primaryArchetypeId === 'archetype-software-platform'), true);
});

// ---------------------------------------------------------------------------
// Scope 3 (Increment A): MSFT linked model and user-owned accepted state.
// TP-3-01 exercises production evaluateModel, reduceScenarioDraft,
// reduceCompanySelection, reduceProposalDecision, and deriveForecastError over
// constructed model fixtures plus the regenerated model-pack publication.
// ---------------------------------------------------------------------------

function ordinaryModelDefinition() {
    return {
        modelDefinitionId: 'model-ordinary-company-three-statement',
        modelVersion: 'ordinary-company-three-statement/v1',
        family: 'ordinary-company-three-statement',
        label: 'Ordinary company three-statement model',
        status: 'accepted',
        drivers: [
            { driverId: 'driver-base-revenue', concept: 'base-revenue', unit: 'USD-millions', editable: true },
            { driverId: 'driver-revenue-growth', concept: 'revenue-growth', unit: 'ratio', editable: true },
            { driverId: 'driver-operating-margin', concept: 'operating-margin', unit: 'ratio', editable: true },
            { driverId: 'driver-tax-rate', concept: 'tax-rate', unit: 'ratio', editable: true },
            { driverId: 'driver-depreciation-rate', concept: 'depreciation-rate', unit: 'ratio', editable: true },
            { driverId: 'driver-capex-intensity', concept: 'capex-intensity', unit: 'ratio', editable: true },
            { driverId: 'driver-diluted-shares', concept: 'diluted-shares', unit: 'shares-millions', editable: true },
            { driverId: 'driver-net-cash', concept: 'net-cash', unit: 'USD-millions', editable: true },
            { driverId: 'driver-fcf-multiple', concept: 'fcf-multiple', unit: 'multiple', editable: true }
        ],
        nodes: [
            { nodeId: 'node-revenue', kind: 'statement', concept: 'revenue', unit: 'USD-millions', operation: 'grow', inputs: ['driver-base-revenue', 'driver-revenue-growth'] },
            { nodeId: 'node-operating-income', kind: 'statement', concept: 'operating-income', unit: 'USD-millions', operation: 'product', inputs: ['node-revenue', 'driver-operating-margin'] },
            { nodeId: 'node-tax-expense', kind: 'statement', concept: 'tax-expense', unit: 'USD-millions', operation: 'product', inputs: ['node-operating-income', 'driver-tax-rate'] },
            { nodeId: 'node-net-income', kind: 'statement', concept: 'net-income', unit: 'USD-millions', operation: 'difference', inputs: ['node-operating-income', 'node-tax-expense'] },
            { nodeId: 'node-depreciation', kind: 'cash', concept: 'depreciation', unit: 'USD-millions', operation: 'product', inputs: ['node-revenue', 'driver-depreciation-rate'] },
            { nodeId: 'node-operating-cash-flow', kind: 'cash', concept: 'operating-cash-flow', unit: 'USD-millions', operation: 'sum', inputs: ['node-net-income', 'node-depreciation'] },
            { nodeId: 'node-capex', kind: 'cash', concept: 'capital-expenditure', unit: 'USD-millions', operation: 'product', inputs: ['node-revenue', 'driver-capex-intensity'] },
            { nodeId: 'node-free-cash-flow', kind: 'cash', concept: 'free-cash-flow', unit: 'USD-millions', operation: 'difference', inputs: ['node-operating-cash-flow', 'node-capex'] },
            { nodeId: 'node-ending-cash', kind: 'balance', concept: 'ending-net-cash', unit: 'USD-millions', operation: 'sum', inputs: ['driver-net-cash', 'node-free-cash-flow'] },
            { nodeId: 'node-operating-margin-kpi', kind: 'kpi', concept: 'operating-margin', unit: 'ratio', operation: 'ratio', inputs: ['node-operating-income', 'node-revenue'] },
            { nodeId: 'node-fcf-margin', kind: 'kpi', concept: 'free-cash-flow-margin', unit: 'ratio', operation: 'ratio', inputs: ['node-free-cash-flow', 'node-revenue'] },
            { nodeId: 'node-eps', kind: 'per-share', concept: 'earnings-per-share', unit: 'USD-per-share', operation: 'ratio', inputs: ['node-net-income', 'driver-diluted-shares'] },
            { nodeId: 'node-fcf-per-share', kind: 'per-share', concept: 'free-cash-flow-per-share', unit: 'USD-per-share', operation: 'ratio', inputs: ['node-free-cash-flow', 'driver-diluted-shares'] },
            { nodeId: 'node-enterprise-value', kind: 'valuation', concept: 'enterprise-value', unit: 'USD-millions', operation: 'product', inputs: ['node-free-cash-flow', 'driver-fcf-multiple'] },
            { nodeId: 'node-equity-value', kind: 'valuation', concept: 'equity-value', unit: 'USD-millions', operation: 'sum', inputs: ['node-enterprise-value', 'driver-net-cash'] },
            { nodeId: 'node-value-per-share', kind: 'valuation', concept: 'value-per-share', unit: 'USD-per-share', operation: 'ratio', inputs: ['node-equity-value', 'driver-diluted-shares'] }
        ]
    };
}

function acceptedBaselineAssumptions() {
    return {
        'driver-base-revenue': '200000',
        'driver-revenue-growth': '0.1',
        'driver-operating-margin': '0.4',
        'driver-tax-rate': '0.25',
        'driver-depreciation-rate': '0.1',
        'driver-capex-intensity': '0.2',
        'driver-diluted-shares': '8000',
        'driver-net-cash': '50000',
        'driver-fcf-multiple': '20'
    };
}

function acceptedBaselineOutputs() {
    return {
        'node-revenue': '220000',
        'node-operating-income': '88000',
        'node-tax-expense': '22000',
        'node-net-income': '66000',
        'node-depreciation': '22000',
        'node-operating-cash-flow': '88000',
        'node-capex': '44000',
        'node-free-cash-flow': '44000',
        'node-ending-cash': '94000',
        'node-operating-margin-kpi': '0.4',
        'node-fcf-margin': '0.2',
        'node-eps': '8.25',
        'node-fcf-per-share': '5.5',
        'node-enterprise-value': '880000',
        'node-equity-value': '930000',
        'node-value-per-share': '116.25'
    };
}

function acceptedScenarioRevision(revision) {
    const assumptions = acceptedBaselineAssumptions();
    const outputs = acceptedBaselineOutputs();
    return {
        contractVersion: 'company-scenario-revision/v1',
        scenarioRevisionId: `scenario-msft-base-r${revision || 4}`,
        scenarioId: 'scenario-msft-base',
        revision: revision || 4,
        companyId: 'sec-cik-0000789019',
        name: 'Microsoft base case',
        owner: 'local-user',
        state: 'active',
        modelDefinitionId: 'model-ordinary-company-three-statement',
        historicalCutoff: '2026-03-31',
        assumptions: Object.keys(assumptions).map((driverId) => ({ driverId, value: assumptions[driverId] })),
        outputs: Object.keys(outputs).map((nodeId) => ({ nodeId, value: outputs[nodeId] })),
        parentRevisionId: null,
        createdAt: '2026-07-17T06:00:00Z'
    };
}

function baselineTuple() {
    return { assumptions: acceptedBaselineAssumptions(), outputs: acceptedBaselineOutputs() };
}

test('TP-3-01 SCN-010-014 evaluateModel recomputes only dependency-reachable nodes from one draft tuple and never mutates history', () => {
    const modelDefinition = ordinaryModelDefinition();
    const baseline = baselineTuple();
    const baselineBefore = JSON.stringify(baseline);

    // Editing revenue growth cascades through every downstream node kind.
    const draftAssumptions = { ...acceptedBaselineAssumptions(), 'driver-revenue-growth': '0.2' };
    const evaluation = company.evaluateModel({ modelDefinition, baseline, draft: { changedDriverId: 'driver-revenue-growth', assumptions: draftAssumptions } });
    assert.equal(evaluation.contractVersion, 'company-model-evaluation/v1');
    const outputById = Object.fromEntries(evaluation.outputs.map((output) => [output.nodeId, output]));
    assert.equal(outputById['node-revenue'].value, '240000');
    assert.equal(outputById['node-net-income'].value, '72000');
    assert.equal(outputById['node-free-cash-flow'].value, '48000');
    assert.equal(outputById['node-ending-cash'].value, '98000');
    assert.equal(outputById['node-eps'].value, '9');
    assert.equal(outputById['node-value-per-share'].value, '126.25');
    // Every node kind is represented and reachable from a revenue-growth edit.
    assert.deepEqual(
        Array.from(new Set(evaluation.outputs.map((output) => output.kind))).sort(),
        ['balance', 'cash', 'kpi', 'per-share', 'statement', 'valuation']
    );
    assert.equal(evaluation.reachableNodeIds.length, 16);
    assert.equal(evaluation.unchangedNodeIds.length, 0);
    assert.equal(evaluation.outputs.every((output) => output.recomputed === true), true);
    // History (the baseline tuple) is never mutated.
    assert.equal(JSON.stringify(baseline), baselineBefore);
});

test('TP-3-01 SCN-010-014 a valuation-only driver edit leaves unreachable history unchanged', () => {
    const modelDefinition = ordinaryModelDefinition();
    const baseline = baselineTuple();
    const draftAssumptions = { ...acceptedBaselineAssumptions(), 'driver-fcf-multiple': '25' };
    const evaluation = company.evaluateModel({ modelDefinition, baseline, draft: { changedDriverId: 'driver-fcf-multiple', assumptions: draftAssumptions } });
    const outputById = Object.fromEntries(evaluation.outputs.map((output) => [output.nodeId, output]));

    // Only the valuation nodes that consume the multiple recompute.
    assert.deepEqual([...evaluation.reachableNodeIds].sort(), ['node-enterprise-value', 'node-equity-value', 'node-value-per-share']);
    assert.equal(outputById['node-enterprise-value'].value, '1100000');
    assert.equal(outputById['node-equity-value'].value, '1150000');
    assert.equal(outputById['node-value-per-share'].value, '143.75');
    assert.equal(outputById['node-enterprise-value'].recomputed, true);
    // Statement, cash, balance, KPI, and per-share history is carried unchanged.
    assert.equal(outputById['node-revenue'].value, '220000');
    assert.equal(outputById['node-revenue'].recomputed, false);
    assert.equal(outputById['node-eps'].value, '8.25');
    assert.equal(outputById['node-eps'].recomputed, false);
    assert.equal(evaluation.unchangedNodeIds.length, 13);
});

test('TP-3-01 SCN-010-014 an invalid driver blocks reachable outputs with an explicit dependency path', () => {
    const modelDefinition = ordinaryModelDefinition();
    const baseline = baselineTuple();
    const draftAssumptions = { ...acceptedBaselineAssumptions(), 'driver-diluted-shares': '0' };
    const evaluation = company.evaluateModel({ modelDefinition, baseline, draft: { changedDriverId: 'driver-diluted-shares', assumptions: draftAssumptions } });
    const outputById = Object.fromEntries(evaluation.outputs.map((output) => [output.nodeId, output]));

    assert.deepEqual([...evaluation.reachableNodeIds].sort(), ['node-eps', 'node-fcf-per-share', 'node-value-per-share']);
    const eps = outputById['node-eps'];
    assert.equal(eps.state, 'blocked');
    assert.equal(eps.value, null);
    assert.match(eps.reason, /denominator|invalid|zero/i);
    assert.deepEqual(eps.dependencyPath, ['driver-diluted-shares', 'node-eps']);
    assert.deepEqual(outputById['node-value-per-share'].dependencyPath, ['driver-diluted-shares', 'node-value-per-share']);
    assert.equal(outputById['node-value-per-share'].state, 'blocked');
    // Unreachable equity value keeps its immutable baseline value.
    assert.equal(outputById['node-equity-value'].value, '930000');
});

test('TP-3-01 SCN-010-014 evaluateModel rejects a cyclic model definition with an explicit code', () => {
    const cyclic = ordinaryModelDefinition();
    cyclic.nodes.push({ nodeId: 'node-cycle-a', kind: 'kpi', concept: 'cycle-a', unit: 'ratio', operation: 'sum', inputs: ['node-cycle-b', 'driver-net-cash'] });
    cyclic.nodes.push({ nodeId: 'node-cycle-b', kind: 'kpi', concept: 'cycle-b', unit: 'ratio', operation: 'sum', inputs: ['node-cycle-a', 'driver-net-cash'] });
    const baseline = baselineTuple();
    baseline.outputs['node-cycle-a'] = '0';
    baseline.outputs['node-cycle-b'] = '0';
    assert.throws(
        () => company.evaluateModel({ modelDefinition: cyclic, baseline, draft: { changedDriverId: 'driver-net-cash', assumptions: acceptedBaselineAssumptions() } }),
        ({ code }) => code === 'C010-MODEL-CYCLE'
    );
});

test('TP-3-01 SCN-010-014 reduceScenarioDraft creates a draft and never changes the active revision', () => {
    const modelDefinition = ordinaryModelDefinition();
    const activeRevision = acceptedScenarioRevision(4);
    const activeBefore = JSON.stringify(activeRevision);
    const draft = company.reduceScenarioDraft({ activeRevision, modelDefinition, editAssumption: { driverId: 'driver-revenue-growth', value: '0.2' } });

    assert.equal(draft.contractVersion, 'company-scenario-draft/v1');
    assert.equal(draft.state, 'draft');
    assert.equal(draft.baseRevision, 4);
    assert.equal(draft.changedDriverId, 'driver-revenue-growth');
    const draftOutputs = Object.fromEntries(draft.evaluation.outputs.map((output) => [output.nodeId, output.value]));
    assert.equal(draftOutputs['node-eps'], '9');
    // The active revision remains byte-identical; a draft is not a new revision.
    assert.equal(JSON.stringify(activeRevision), activeBefore);
    assert.equal(draft.revision, undefined);
});

test('TP-3-01 SCN-010-013 reduceCompanySelection keeps assumptions active and raises separate pending proposals', () => {
    const modelDefinition = ordinaryModelDefinition();
    const activeRevision = acceptedScenarioRevision(4);
    const activeBefore = JSON.stringify(activeRevision);
    const result = company.reduceCompanySelection({
        activeRevision,
        modelDefinition,
        acceptedPublication: {
            publicationId: 'company-publication-sec-cik-0000789019-g1',
            generation: 1,
            manifestSha256: `sha256:${'a'.repeat(64)}`,
            evidenceChanges: [
                { concept: 'operating-margin', direction: 'increase', priorValue: '0.4', currentValue: '0.42', sourceRef: 'sec-companyfacts-msft' },
                { concept: 'revenue-growth', direction: 'increase', priorValue: '0.1', currentValue: '0.12', sourceRef: 'sec-companyfacts-msft' }
            ]
        }
    });

    assert.equal(result.contractVersion, 'company-selection-result/v1');
    assert.equal(result.rebased, false);
    // The active revision identity and values are unchanged (no rebasing on refresh).
    assert.equal(JSON.stringify(result.activeRevision), activeBefore);
    assert.equal(JSON.stringify(activeRevision), activeBefore);
    // Each affected driver gets a separate pending proposal requiring a user decision.
    assert.equal(result.proposals.length, 2);
    assert.equal(result.proposals.every((proposal) => proposal.decisionState === 'pending' && proposal.resultingRevision === null), true);
    const marginProposal = result.proposals.find((proposal) => proposal.affectedDriverId === 'driver-operating-margin');
    assert.equal(marginProposal.proposedValue, '0.42');
    assert.equal(marginProposal.contractVersion, 'company-model-impact-proposal/v1');
});

test('TP-3-01 SCN-010-023 reduceProposalDecision is inert until accept or edit-confirm and rejection records no revision', () => {
    const modelDefinition = ordinaryModelDefinition();
    const activeRevision = acceptedScenarioRevision(4);
    const activeBefore = JSON.stringify(activeRevision);
    const proposal = {
        contractVersion: 'company-model-impact-proposal/v1',
        proposalId: 'proposal-driver-operating-margin-1',
        companyId: 'sec-cik-0000789019',
        scenarioId: 'scenario-msft-base',
        baseRevision: 4,
        affectedDriverId: 'driver-operating-margin',
        concept: 'operating-margin',
        direction: 'increase',
        priorValue: '0.4',
        currentValue: '0.42',
        proposedValue: '0.42',
        rationale: 'A newer eligible filing reports a higher operating margin.',
        confidence: { band: 'medium', low: '0.41', high: '0.43' },
        invalidation: 'A later restatement lowers the reported margin.',
        decisionState: 'pending',
        resultingRevision: null
    };

    // Accept creates exactly one new immutable revision R5 and leaves R4 unchanged.
    const accepted = company.reduceProposalDecision({ activeRevision, proposal, modelDefinition, decision: { kind: 'accept', confirmedAt: '2026-07-17T07:00:00Z' } });
    assert.equal(accepted.revisionsCreated, 1);
    assert.equal(accepted.decisionState, 'accepted');
    assert.equal(accepted.newRevision.revision, 5);
    assert.equal(accepted.newRevision.parentRevisionId, activeRevision.scenarioRevisionId);
    const acceptedMargin = accepted.newRevision.assumptions.find((assumption) => assumption.driverId === 'driver-operating-margin').value;
    assert.equal(acceptedMargin, '0.42');
    // Accepting the proposal recomputes the dependent outputs into the new revision.
    assert.equal(accepted.newRevision.outputs.find((output) => output.nodeId === 'node-operating-income').value, '92400');
    assert.equal(JSON.stringify(activeRevision), activeBefore);

    // Edit-and-confirm applies the user's edited value in exactly one new revision.
    const edited = company.reduceProposalDecision({ activeRevision, proposal, modelDefinition, decision: { kind: 'edit-confirm', editedValue: '0.45', confirmedAt: '2026-07-17T07:05:00Z' } });
    assert.equal(edited.revisionsCreated, 1);
    assert.equal(edited.decisionState, 'edited-and-confirmed');
    assert.equal(edited.newRevision.assumptions.find((assumption) => assumption.driverId === 'driver-operating-margin').value, '0.45');
    assert.equal(JSON.stringify(activeRevision), activeBefore);

    // Rejection records the decision with no revision change.
    const rejected = company.reduceProposalDecision({ activeRevision, proposal, modelDefinition, decision: { kind: 'reject', confirmedAt: '2026-07-17T07:10:00Z' } });
    assert.equal(rejected.revisionsCreated, 0);
    assert.equal(rejected.decisionState, 'rejected');
    assert.equal(rejected.newRevision, null);
    assert.equal(JSON.stringify(activeRevision), activeBefore);
});

test('TP-3-01 SCN-010-016 deriveForecastError separates estimate and actual classes and derives only when comparable', () => {
    const estimate = {
        observationId: 'obs-estimate-revenue-fy2026-q4',
        evidenceClass: 'estimate',
        definition: 'total-revenue',
        unit: 'USD',
        currency: 'USD',
        periodId: 'period-msft-fy2026-q4',
        value: '75000',
        sourceRef: 'source-estimate-set',
        clocks: { reportingPeriodEnd: '2026-06-30', sourcePublishedAt: '2026-05-01T00:00:00Z', acceptedAt: '2026-05-01T00:00:00Z', retrievedAt: '2026-05-01T00:00:00Z', observedAt: null }
    };
    const actual = {
        observationId: 'obs-actual-revenue-fy2026-q4',
        evidenceClass: 'reported',
        definition: 'total-revenue',
        unit: 'USD',
        currency: 'USD',
        periodId: 'period-msft-fy2026-q4',
        value: '78000',
        sourceRef: 'sec-companyfacts-msft',
        clocks: { reportingPeriodEnd: '2026-06-30', sourcePublishedAt: '2026-07-30T00:00:00Z', acceptedAt: '2026-07-30T00:00:00Z', retrievedAt: '2026-07-30T00:00:00Z', observedAt: null }
    };
    const comparable = company.deriveForecastError({ estimate, actual });
    assert.equal(comparable.contractVersion, 'company-forecast-error/v1');
    assert.equal(comparable.comparable, true);
    assert.equal(comparable.forecastError.value, '3000');
    // The estimate and actual keep their own classes, sources, and clocks.
    assert.equal(comparable.estimate.evidenceClass, 'estimate');
    assert.equal(comparable.actual.evidenceClass, 'reported');
    assert.notEqual(comparable.estimate.sourceRef, comparable.actual.sourceRef);
    assert.notEqual(comparable.estimate.clocks.acceptedAt, comparable.actual.clocks.acceptedAt);

    // A period mismatch is not comparable and derives no forecast error.
    const mismatched = company.deriveForecastError({ estimate, actual: { ...actual, periodId: 'period-msft-fy2027-q1' } });
    assert.equal(mismatched.comparable, false);
    assert.equal(mismatched.forecastError, null);
    assert.match(mismatched.reason, /period/i);
    // A currency mismatch is likewise not comparable.
    const currencyMismatch = company.deriveForecastError({ estimate, actual: { ...actual, currency: 'EUR' } });
    assert.equal(currencyMismatch.comparable, false);
    assert.match(currencyMismatch.reason, /currency/i);
});

test('TP-3-01 SCN-010-013/014 the regenerated publication exposes a non-null hash-valid model pack that recomputes from one generation', () => {
    const config = scope2Config;
    assert.equal(company.validateCompanyConfig(config).ok, true);
    assert.ok(config.model && Array.isArray(config.model.definitions) && config.model.definitions.length >= 1, 'config.model definitions are populated');
    assert.ok(Array.isArray(config.model.scenarios) && config.model.scenarios.length >= 1, 'config.model scenarios are populated');

    assert.notEqual(fixture.manifest.modelPackRef, null);
    const modelPack = fixture.objects[fixture.manifest.modelPackRef.objectId];
    assert.ok(modelPack, 'model pack object is reachable in the publication graph');
    assert.equal(modelPack.contractVersion, 'company-model-pack/v1');
    assert.equal(company.companyObjectSha256(modelPack), fixture.manifest.modelPackRef.sha256);
    assert.equal(modelPack.generation, fixture.manifest.generation);

    // The published accepted scenario recomputes to the published baseline outputs from one generation.
    const baseline = { assumptions: Object.fromEntries(modelPack.acceptedScenario.assumptions.map((a) => [a.driverId, a.value])), outputs: Object.fromEntries(modelPack.baselineOutputs.map((o) => [o.nodeId, o.value])) };
    const marginDriver = modelPack.modelDefinition.drivers.find((driver) => driver.concept === 'operating-margin');
    const draftAssumptions = { ...baseline.assumptions };
    const recompute = company.evaluateModel({ modelDefinition: modelPack.modelDefinition, baseline, draft: { changedDriverId: marginDriver.driverId, assumptions: draftAssumptions } });
    // Re-evaluating with the unchanged accepted tuple reproduces the published outputs exactly.
    recompute.outputs.filter((output) => output.recomputed).forEach((output) => {
        assert.equal(output.value, baseline.outputs[output.nodeId], `recomputed ${output.nodeId} matches the published baseline`);
    });
});

/* ---------------- Scope 4: Detailed workspaces, peers, export, and the committed owner read ---------------- */

test('TP-4-01 SCN-010-028 selectPeersView admits only comparable observations and never inserts a zero for a missing or non-comparable member', () => {
    // A software-platform peer set with declared members; some observations are comparable, some qualified, some excluded,
    // and one declared member is missing entirely. The peer observations are constructed and are not MSFT-reported values.
    const peerSet = {
        peerSetId: 'peers-msft-software-platform',
        subjectCompanyId: 'sec-cik-0000789019',
        purpose: 'Software-platform gross-margin level context for Microsoft.',
        companyIds: ['sec-cik-0000789019', 'peer-software-alpha', 'peer-software-beta', 'peer-software-gamma', 'peer-software-delta', 'peer-software-epsilon']
    };
    const view = company.selectPeersView({
        peerSet,
        statistic: { concept: 'gross-margin', unit: 'ratio', operation: 'median' },
        observations: [
            { companyId: 'peer-software-alpha', value: '0.68', eligibility: 'comparable', reason: 'Same archetype and reporting basis; constructed demonstration value, not an MSFT-reported figure.' },
            { companyId: 'peer-software-beta', value: '0.72', eligibility: 'comparable', reason: 'Same archetype and reporting basis; constructed demonstration value.' },
            { companyId: 'peer-software-gamma', value: '0.64', eligibility: 'comparable', reason: 'Same archetype and reporting basis; constructed demonstration value.' },
            { companyId: 'peer-software-delta', value: '0.30', eligibility: 'qualified', reason: 'Different segment mix; kept visible but excluded from the level statistic.' },
            { companyId: 'peer-software-epsilon', value: '0.95', eligibility: 'excluded', reason: 'Non-comparable revenue-recognition basis.', outlier: true }
        ]
    });

    // Only the three comparable observations enter the named statistic and the sample size.
    assert.equal(view.statistic.operation, 'median');
    assert.equal(view.statistic.sampleSize, 3);
    assert.deepEqual(view.statistic.memberCompanyIds.slice().sort(), ['peer-software-alpha', 'peer-software-beta', 'peer-software-gamma']);
    assert.equal(view.statistic.value, '0.68'); // median of 0.64, 0.68, 0.72

    // Qualified and excluded rows and outliers remain visible with their exact reasons.
    assert.deepEqual(view.qualified.map((row) => row.companyId), ['peer-software-delta']);
    assert.deepEqual(view.excluded.map((row) => row.companyId), ['peer-software-epsilon']);
    assert.deepEqual(view.outliers.map((row) => row.companyId), ['peer-software-epsilon']);
    assert.ok(view.qualified[0].reason.includes('excluded from the level statistic'));
    assert.ok(view.excluded[0].reason.includes('Non-comparable'));

    // A declared member with no observation is reported as missing and NEVER as a zero data point.
    assert.deepEqual(view.missing, ['sec-cik-0000789019']);
    assert.equal(view.statistic.memberCompanyIds.includes('sec-cik-0000789019'), false);
    assert.equal(view.statistic.memberCompanyIds.includes('peer-software-delta'), false);
    assert.equal(view.statistic.memberCompanyIds.includes('peer-software-epsilon'), false);
    const flattened = JSON.stringify(view);
    assert.equal(/"value":\s*"0(?:\.0+)?"/.test(flattened) || view.comparable.some((row) => row.value === '0'), false, 'no zero was inserted for a missing or non-comparable member');
});

test('TP-4-01 SCN-010-028 the configured software-platform peer set is a valid proposed peer set', () => {
    const peerSets = (scope2Config.peers || []);
    assert.equal(company.validateCompanyConfig(scope2Config).ok, true);
    const msftPeers = peerSets.find((set) => set.subjectCompanyId === 'sec-cik-0000789019');
    assert.ok(msftPeers, 'the config declares a Microsoft peer set');
    assert.equal(msftPeers.status, 'proposed');
    assert.ok(msftPeers.archetypeIds.includes('archetype-software-platform'));
    assert.ok(Array.isArray(msftPeers.companyIds) && msftPeers.companyIds.length >= 1);
});

test('TP-4-01 SCN-010-015 buildAcceptedExport is a pure projection of one accepted generation with clocks and classes and no private data', () => {
    const exportBundle = company.buildAcceptedExport(scope2Accepted);
    assert.equal(exportBundle.contractVersion, 'company-accepted-export/v1');
    assert.equal(exportBundle.companyId, scope2Accepted.companyId);
    assert.equal(exportBundle.publicationId, scope2Accepted.publicationId);
    assert.equal(exportBundle.generation, scope2Accepted.generation);
    assert.equal(exportBundle.manifestSha256, scope2Accepted.manifestSha256);
    assert.equal(exportBundle.containsPrivateData, false);
    // The export carries every published class and clock, so a downstream reader sees the same evidence the Simple cockpit does.
    assert.equal(exportBundle.view.clocks.statementCutoff, scope2Accepted.ownerRead.statementCutoff);
    assert.equal(exportBundle.view.clocks.modelCutoff, scope2Accepted.ownerRead.modelCutoff);
    assert.equal(exportBundle.view.clocks.briefCutoff, scope2Accepted.ownerRead.briefCutoff);
    assert.equal(exportBundle.view.clocks.marketCutoff, scope2Accepted.ownerRead.marketCutoff);
    assert.deepEqual(exportBundle.view.limitations, scope2Accepted.ownerRead.limitations);
    assert.equal(exportBundle.view.periods.length, scope2Accepted.periods.length);
    assert.ok(exportBundle.view.modelPack && exportBundle.view.modelPack.modelPackId === scope2Accepted.modelPack.modelPackId);
    // A pure projection never carries a local scenario draft or a credential.
    const serialized = JSON.stringify(exportBundle);
    assert.equal(/scenarioDraft|localDraft|credential|token|secret|password/i.test(serialized), false, 'the export carries no private draft or credential');
    // buildAcceptedExport must not refetch: passing a frozen accepted state is enough.
    assert.throws(() => company.buildAcceptedExport({ contractVersion: 'wrong' }), ({ code }) => code === 'C010-PUBLICATION-SCHEMA');
});

test('TP-4-01 SCN-010-015 buildFundamentalsToolRead recomputes the committed owner read from the accepted generation and rejects drift', () => {
    const readId = fixture.manifest.ownerReadRef.objectId;
    const modelPackRef = fixture.manifest.modelPackRef;
    const recomputed = company.buildFundamentalsToolRead({ accepted: scope2Accepted, readId, modelPackRef });
    assert.equal(recomputed.contractVersion, 'fundamentals-tool-read/v1');
    assert.equal(recomputed.readId, readId);
    // The recompute equals the committed owner read byte-for-byte under canonical hashing (a faithful projection).
    assert.equal(company.companyObjectSha256(recomputed), company.companyObjectSha256(scope2Accepted.ownerRead));
    // The committed owner read carries the model pack ref so the publication graph reaches it.
    assert.ok(recomputed.modelPackRef && recomputed.modelPackRef.objectId === modelPackRef.objectId);
    // No private data leaves through the owner read.
    assert.equal(/credential|token|secret|password/i.test(JSON.stringify(recomputed)), false);
    // Drift: a tampered accepted status is NOT echoed — the recompute is derived from the dependency results, so it stays honest and mismatches the tampered owner read.
    const tampered = { ...scope2Accepted, ownerRead: { ...scope2Accepted.ownerRead, status: 'available', direction: 'Up' } };
    const recomputedFromTampered = company.buildFundamentalsToolRead({ accepted: tampered, readId, modelPackRef });
    assert.equal(recomputedFromTampered.status, 'partial');
    assert.notEqual(company.companyObjectSha256(recomputedFromTampered), company.companyObjectSha256(tampered.ownerRead));
});

test('TP-4-01 SCN-010-015 the Simple selector, source trace, peers, export, and owner read all derive from one accepted tuple with matching shared values', () => {
    // One accepted state feeds every Detailed selector; no selector refetches or reinterprets a shared value.
    const accepted = scope2Accepted;
    const archetypeView = company.resolveArchetypeView(scope2Config, accepted.companyId);
    const simple = company.selectSimpleView(accepted, archetypeView);
    const trace = company.selectSourcesView(accepted, 'claim-direction');
    const exportBundle = company.buildAcceptedExport(accepted);
    const ownerRead = company.buildFundamentalsToolRead({ accepted, readId: fixture.manifest.ownerReadRef.objectId, modelPackRef: fixture.manifest.modelPackRef });

    // Shared statement clock is identical across the Simple cockpit, the export, and the committed owner read.
    assert.equal(simple.clocks.statementCutoff, exportBundle.view.clocks.statementCutoff);
    assert.equal(simple.clocks.statementCutoff, ownerRead.statementCutoff);
    // Shared direction classification is identical across the Simple cockpit, the source trace focus, and the owner read.
    const simpleDirection = simple.dependencyResults.find((result) => result.id === 'metric-direction');
    assert.equal(simpleDirection.state, 'unavailable');
    assert.equal(ownerRead.direction, 'Unavailable');
    assert.equal(trace.focusRef, 'claim-direction');
    // The unavailable revenue chain is preserved in the trace (source requirement, transformations, consumers, unavailable link).
    assert.deepEqual(trace.sourceRequirements.map(({ sourceId }) => sourceId), ['sec-companyfacts-msft']);
    assert.ok(trace.unavailableLinks.length >= 1);
    // The shared limitations are identical between the owner read and the export projection.
    assert.deepEqual(ownerRead.limitations, exportBundle.view.limitations);
    // Missing facts are the same set the Simple dependency result reports.
    assert.deepEqual(ownerRead.missingFactIds, simpleDirection.missingFactIds);
});

/* ---------------- Scope 5: adaptive company brief, history, and Feature 002 boundary ---------------- */

function scope5RankingPolicy() {
    return {
        policyVersion: 'company-brief-ranking/v1',
        weights: {
            sourceQuality: 5,
            companyMateriality: 5,
            modelSensitivity: 4,
            novelty: 3,
            eventProximity: 2,
            unresolvedRisk: 3
        },
        dispositionMultipliers: {
            material: 1,
            conflict: 1,
            confirmation: 0.25,
            immaterial: 0,
            duplicate: 0,
            'not-evaluable': 0
        }
    };
}

function scope5Clocks() {
    return {
        statementCutoff: '2026-03-31',
        modelCutoff: '2026-04-01T00:00:00Z',
        briefCutoff: '2026-05-01T00:00:00Z',
        marketCutoff: '2026-05-02T13:30:00Z',
        retrievalCutoff: '2026-05-02T13:35:00Z'
    };
}

function scope5AcceptedState() {
    return {
        contractVersion: 'company-brief-accepted-state/v1',
        companyId: 'sec-cik-0000789019',
        archetype: {
            assignmentId: 'assignment-msft-software-platform',
            primaryArchetypeId: 'archetype-software-platform',
            status: 'accepted'
        },
        facts: [{ factId: 'fact-operating-margin', evidenceClass: 'reported', value: '0.4', periodId: 'period-msft-fy2026-q3', sourceRef: 'sec-companyfacts-msft' }],
        assumptions: [{ assumptionId: 'assumption-operating-margin', driverId: 'driver-operating-margin', value: '0.4' }],
        scenarioRevisionId: 'scenario-msft-base-r4',
        fundamentalDirection: {
            direction: 'deteriorating',
            evidenceClass: 'reported',
            sourceRef: 'sec-companyfacts-msft',
            window: 'period-msft-fy2026-q3'
        }
    };
}

function scope5Change(overrides = {}) {
    return {
        contractVersion: 'evidence-change/v1',
        changeId: 'change-operating-margin',
        evidenceClass: 'reported',
        disposition: 'material',
        sourceRef: 'sec-companyfacts-msft',
        periodOrWindow: 'period-msft-fy2026-q3',
        observed: 'Operating margin changed from 0.40 to 0.42.',
        companyMechanism: 'The margin change flows through the accepted operating-margin driver.',
        affectedClaimIds: ['claim-margin-direction'],
        affectedDriverIds: ['driver-operating-margin'],
        scoreInputs: {
            sourceQuality: 5,
            companyMateriality: 5,
            modelSensitivity: 5,
            novelty: 5,
            eventProximity: 4,
            unresolvedRisk: 2
        },
        numericSupport: {
            assumptionId: 'assumption-operating-margin',
            direction: 'increase',
            range: { low: '0.41', high: '0.43' },
            rationale: 'The sourced reported margin changed.',
            confidence: 'medium',
            invalidation: 'A later amendment reverses the reported change.'
        },
        evidenceNeeded: [],
        duplicateOf: null,
        ...overrides
    };
}

function scope5BriefRequest(changes, overrides = {}) {
    return {
        contractVersion: 'adaptive-company-brief-request/v1',
        companyId: 'sec-cik-0000789019',
        archetypeId: 'archetype-software-platform',
        priorBrief: {
            briefId: 'brief-msft-prior',
            status: 'material-update',
            thesisClaims: [{ claimId: 'claim-margin-direction', text: 'Margins are deteriorating.', status: 'supported' }],
            contentFingerprint: 'sha256:prior-brief-content'
        },
        acceptedState: scope5AcceptedState(),
        clocks: scope5Clocks(),
        coverage: [
            { evidenceClass: 'reported', state: 'current', cutoff: '2026-03-31', requiredUpdate: null },
            { evidenceClass: 'normalized', state: 'current', cutoff: '2026-03-31', requiredUpdate: null },
            { evidenceClass: 'management-claim', state: 'current', cutoff: '2026-04-25T00:00:00Z', requiredUpdate: null },
            { evidenceClass: 'market-observation', state: 'current', cutoff: '2026-05-02T13:30:00Z', requiredUpdate: null },
            { evidenceClass: 'news', state: 'current', cutoff: '2026-05-02T13:00:00Z', requiredUpdate: null },
            { evidenceClass: 'sentiment', state: 'current', cutoff: '2026-05-02T12:00:00Z', requiredUpdate: null }
        ],
        changes,
        rankingPolicy: scope5RankingPolicy(),
        ...overrides
    };
}

function extractProductionFunction(source, name) {
    const match = new RegExp(`function\\s+${name}\\s*\\(`).exec(source);
    if (!match) throw new Error(`production helper not found: ${name}`);
    let index = source.indexOf('{', match.index);
    let depth = 0;
    for (; index < source.length; index += 1) {
        if (source[index] === '{') depth += 1;
        else if (source[index] === '}') {
            depth -= 1;
            if (depth === 0) return source.slice(match.index, index + 1);
        }
    }
    throw new Error(`production helper has unbalanced braces: ${name}`);
}

test('TP-5-01 SCN-010-017 and SCN-010-022 material company evidence leads deterministically and headline volume adds no weight', () => {
    const kpi = scope5Change();
    const duplicateNews = [1, 2, 3, 4].map((index) => scope5Change({
        changeId: `change-generic-news-${index}`,
        evidenceClass: 'news',
        disposition: index === 1 ? 'immaterial' : 'duplicate',
        sourceRef: `source-generic-news-${index}`,
        periodOrWindow: '2026-05-01/2026-05-02',
        observed: 'Generic software-sector headline repeats broad commentary.',
        companyMechanism: null,
        affectedClaimIds: [],
        affectedDriverIds: [],
        scoreInputs: { sourceQuality: 1, companyMateriality: 1, modelSensitivity: 0, novelty: index === 1 ? 1 : 0, eventProximity: 3, unresolvedRisk: 1 },
        numericSupport: null,
        duplicateOf: index === 1 ? null : 'change-generic-news-1'
    }));

    const first = company.rankEvidenceChanges({ policy: scope5RankingPolicy(), changes: [duplicateNews[2], kpi, duplicateNews[0], duplicateNews[3], duplicateNews[1]] });
    const second = company.rankEvidenceChanges({ policy: scope5RankingPolicy(), changes: [duplicateNews[2], kpi, duplicateNews[0], duplicateNews[3], duplicateNews[1]] });
    assert.deepEqual(first, second);
    assert.equal(first.ranked[0].changeId, kpi.changeId);
    assert.equal(first.ranked[0].components.companyMateriality, 25);
    assert.equal(first.ranked[0].components.modelSensitivity, 20);
    assert.equal(first.ranked[0].components.headlineVolume, undefined);
    assert.equal(first.ranked.filter((entry) => entry.evidenceClass === 'news').every((entry) => entry.score === 0), true);

    const brief = company.buildAdaptiveCompanyBrief(scope5BriefRequest([duplicateNews[2], kpi, duplicateNews[0], duplicateNews[3], duplicateNews[1]]));
    assert.equal(brief.status, 'material-update');
    assert.equal(brief.materialChanges[0].changeId, kpi.changeId);
    assert.equal(brief.modelImpactProposals.length, 1);
    assert.equal(brief.modelImpactProposals[0].affectedAssumptionId, 'assumption-operating-margin');
    assert.equal(brief.materialChanges.some((entry) => entry.changeId.startsWith('change-generic-news')), false);
    assert.equal(brief.thesisClaims.some((claim) => claim.claimId === 'claim-margin-direction'), true);
});

test('TP-5-01 SCN-010-018 management language remains a claim and cannot become a reported actual', () => {
    const managementClaim = scope5Change({
        changeId: 'change-management-ai-demand',
        evidenceClass: 'management-claim',
        disposition: 'confirmation',
        sourceRef: 'source-msft-earnings-transcript',
        periodOrWindow: '2026-04-25T20:00:00Z/2026-04-25T22:00:00Z',
        observed: 'Management says AI demand remains above available capacity.',
        companyMechanism: 'Capacity constraints may affect cloud growth and capital expenditure.',
        affectedClaimIds: ['claim-cloud-demand'],
        affectedDriverIds: ['driver-cloud-growth'],
        scoreInputs: { sourceQuality: 3, companyMateriality: 4, modelSensitivity: 3, novelty: 2, eventProximity: 5, unresolvedRisk: 3 },
        numericSupport: null,
        evidenceNeeded: ['A later filing or issuer release reporting delivered capacity and revenue.']
    });
    const brief = company.buildAdaptiveCompanyBrief(scope5BriefRequest([managementClaim]));

    assert.equal(brief.reviewedEvidence[0].evidenceClass, 'management-claim');
    assert.equal(brief.reviewedEvidence[0].periodOrWindow, managementClaim.periodOrWindow);
    assert.equal(brief.reviewedEvidence[0].sourceRef, managementClaim.sourceRef);
    assert.equal(brief.watchConditions.some((watch) => watch.changeId === managementClaim.changeId), true);
    assert.equal(brief.reportedFacts.length, 0);
    assert.equal(brief.modelImpactProposals.length, 0);
    assert.equal(JSON.stringify(brief).includes('reported-actual'), false);
});

test('TP-5-01 SCN-010-019 unverified news cannot change accepted facts assumptions archetype or revision', () => {
    const acceptedState = scope5AcceptedState();
    const before = JSON.stringify(acceptedState);
    const news = scope5Change({
        changeId: 'change-unverified-acquisition-rumor',
        evidenceClass: 'news',
        disposition: 'not-evaluable',
        sourceRef: 'source-unverified-news',
        periodOrWindow: '2026-05-02T12:00:00Z/2026-05-02T13:00:00Z',
        observed: 'An unattributed item claims a possible acquisition.',
        companyMechanism: null,
        affectedClaimIds: [],
        affectedDriverIds: [],
        scoreInputs: { sourceQuality: 0, companyMateriality: 2, modelSensitivity: 0, novelty: 3, eventProximity: 5, unresolvedRisk: 4 },
        numericSupport: null,
        evidenceNeeded: ['An authoritative issuer filing or release confirming transaction terms.']
    });
    const brief = company.buildAdaptiveCompanyBrief(scope5BriefRequest([news], { acceptedState }));

    assert.equal(JSON.stringify(acceptedState), before);
    assert.equal(brief.acceptedStateFingerprint, `sha256:${company.sha256Hex(before)}`);
    assert.equal(brief.acceptedScenarioRevisionId, acceptedState.scenarioRevisionId);
    assert.equal(brief.archetypeId, acceptedState.archetype.primaryArchetypeId);
    assert.equal(brief.reportedFacts.length, 0);
    assert.equal(brief.modelImpactProposals.length, 0);
    assert.deepEqual(brief.reviewedEvidence[0].evidenceNeeded, news.evidenceNeeded);
});

test('TP-5-01 SCN-010-020 sentiment divergence preserves classes windows sources and reported direction', () => {
    const reported = scope5Change({
        changeId: 'change-reported-margin-deterioration',
        observed: 'Reported operating margin deteriorated.',
        numericSupport: null
    });
    const sentiment = scope5Change({
        changeId: 'change-positive-sentiment',
        evidenceClass: 'sentiment',
        disposition: 'conflict',
        sourceRef: 'source-sentiment-window',
        periodOrWindow: '2026-05-01T00:00:00Z/2026-05-02T12:00:00Z',
        observed: 'Positive sentiment increased.',
        companyMechanism: null,
        affectedClaimIds: ['claim-margin-direction'],
        affectedDriverIds: [],
        scoreInputs: { sourceQuality: 1, companyMateriality: 2, modelSensitivity: 0, novelty: 3, eventProximity: 4, unresolvedRisk: 4 },
        numericSupport: null
    });
    const brief = company.buildAdaptiveCompanyBrief(scope5BriefRequest([sentiment, reported]));
    const view = company.selectBriefView(brief);

    assert.deepEqual(view.evidenceClasses, ['reported', 'sentiment']);
    assert.equal(view.evidence.find((entry) => entry.evidenceClass === 'reported').sourceRef, reported.sourceRef);
    assert.equal(view.evidence.find((entry) => entry.evidenceClass === 'sentiment').periodOrWindow, sentiment.periodOrWindow);
    assert.equal(view.fundamentalDirection.direction, 'deteriorating');
    assert.equal(view.confidenceBand, 'constrained');
    assert.deepEqual(view.clocks, scope5Clocks());
});

test('TP-5-01 SCN-010-021 macro evidence is eligible only through an evidenced company mechanism', () => {
    const linked = scope5Change({
        changeId: 'change-linked-rates',
        evidenceClass: 'market-observation',
        disposition: 'material',
        sourceRef: 'source-yield-curve',
        periodOrWindow: '2026-05-02T13:30:00Z',
        observed: 'Long rates increased.',
        companyMechanism: 'The accepted valuation driver explicitly references the discount-rate exposure.',
        affectedClaimIds: ['claim-valuation-risk'],
        affectedDriverIds: ['driver-fcf-multiple'],
        scoreInputs: { sourceQuality: 4, companyMateriality: 3, modelSensitivity: 4, novelty: 3, eventProximity: 5, unresolvedRisk: 3 },
        numericSupport: null
    });
    const unlinked = scope5Change({
        ...linked,
        changeId: 'change-unlinked-rates',
        companyMechanism: null,
        affectedClaimIds: [],
        affectedDriverIds: []
    });
    const ranking = company.rankEvidenceChanges({ policy: scope5RankingPolicy(), changes: [unlinked, linked] });

    assert.equal(ranking.ranked.find((entry) => entry.changeId === linked.changeId).eligibility, 'company-mechanism');
    assert.equal(ranking.ranked.find((entry) => entry.changeId === unlinked.changeId).eligibility, 'context-only');
    assert.equal(ranking.ranked.find((entry) => entry.changeId === unlinked.changeId).score, 0);
    const brief = company.buildAdaptiveCompanyBrief(scope5BriefRequest([unlinked, linked]));
    assert.equal(brief.materialChanges.some((entry) => entry.changeId === linked.changeId), true);
    assert.equal(brief.materialChanges.some((entry) => entry.changeId === unlinked.changeId), false);
});

test('TP-5-01 SCN-010-024 stale evidence retains its original cutoff and withholds unsupported claims and proposals', () => {
    const staleChange = scope5Change({
        changeId: 'change-stale-cloud-kpi',
        evidenceClass: 'normalized',
        periodOrWindow: 'period-msft-fy2025-q4',
        observed: 'The last valid cloud KPI remains dated to FY2025 Q4.'
    });
    const coverage = [
        { evidenceClass: 'reported', state: 'current', cutoff: '2026-03-31', requiredUpdate: null },
        { evidenceClass: 'normalized', state: 'stale', cutoff: '2025-06-30', requiredUpdate: 'A current issuer KPI disclosure.' }
    ];
    const brief = company.buildAdaptiveCompanyBrief(scope5BriefRequest([staleChange], { coverage }));

    assert.equal(brief.status, 'stale');
    assert.equal(brief.coverage.find((entry) => entry.evidenceClass === 'normalized').cutoff, '2025-06-30');
    assert.equal(brief.coverage.find((entry) => entry.evidenceClass === 'normalized').requiredUpdate, 'A current issuer KPI disclosure.');
    assert.equal(brief.materialChanges.length, 0);
    assert.equal(brief.modelImpactProposals.length, 0);
    assert.deepEqual(brief.thesisClaims, scope5BriefRequest([]).priorBrief.thesisClaims);
});

test('TP-5-01 SCN-010-031 immaterial evidence produces one unchanged brief and append-only history deduplicates by semantic content', () => {
    const immaterial = scope5Change({
        changeId: 'change-immaterial-caption',
        evidenceClass: 'management-claim',
        disposition: 'immaterial',
        sourceRef: 'source-msft-presentation',
        periodOrWindow: '2026-05-01T00:00:00Z',
        observed: 'A presentation caption changed without altering a claim or model driver.',
        companyMechanism: null,
        affectedClaimIds: [],
        affectedDriverIds: [],
        scoreInputs: { sourceQuality: 3, companyMateriality: 0, modelSensitivity: 0, novelty: 1, eventProximity: 2, unresolvedRisk: 0 },
        numericSupport: null
    });
    const duplicate = scope5Change({
        ...immaterial,
        changeId: 'change-immaterial-caption-duplicate',
        disposition: 'duplicate',
        duplicateOf: immaterial.changeId
    });
    const brief = company.buildAdaptiveCompanyBrief(scope5BriefRequest([duplicate, immaterial]));

    assert.equal(brief.status, 'unchanged');
    assert.equal(brief.materialChanges.length, 0);
    assert.equal(brief.modelImpactProposals.length, 0);
    assert.equal(brief.reviewedEvidence.length, 2);
    assert.match(brief.noChangeRationale, /no thesis or model change/i);
    const originalHistory = [];
    const first = company.appendAdaptiveBriefHistory({ history: originalHistory, brief });
    const second = company.appendAdaptiveBriefHistory({ history: first.history, brief });
    assert.equal(originalHistory.length, 0);
    assert.equal(first.appended, true);
    assert.equal(first.history.length, 1);
    assert.equal(second.appended, false);
    assert.equal(second.history.length, 1);
    assert.equal(second.history[0].contentFingerprint, brief.contentFingerprint);
});

/* ---------------- Scope 6: Feature 002 consume-once owner boundary ---------------- */

function loadScope6OwnerGraph() {
    const configPath = 'company-fundamentals.config.json';
    const config = JSON.parse(readFileSync(new URL(`../${configPath}`, import.meta.url), 'utf8'));
    const pointerPath = `data/company-fundamentals/companies/${config.feature002.briefSubjects[0]}/current.json`;
    const pointer = JSON.parse(readFileSync(new URL(`../${pointerPath}`, import.meta.url), 'utf8'));
    const manifest = JSON.parse(readFileSync(new URL(`../${pointer.manifestPath}`, import.meta.url), 'utf8'));
    const owner = JSON.parse(readFileSync(new URL(`../${manifest.ownerReadRef.path}`, import.meta.url), 'utf8'));
    return { configPath, config, pointerPath, pointer, manifest, owner };
}

function projectScope6Graph(graph) {
    const values = new Map([
        [graph.configPath, structuredClone(graph.config)],
        [graph.pointerPath, structuredClone(graph.pointer)],
        [graph.pointer.manifestPath, structuredClone(graph.manifest)],
        [graph.manifest.ownerReadRef.path, structuredClone(graph.owner)]
    ]);
    const reads = [];
    const before = new Map(Array.from(values, ([path, value]) => [path, JSON.stringify(value)]));
    const projection = buildCompanyFundamentalsOwnerRead((path) => {
        reads.push(path);
        if (!values.has(path)) throw new Error(`unexpected Scope 6 read: ${path}`);
        return values.get(path);
    }, company.companyObjectSha256);
    return { projection, reads, values, before };
}

test('TP-6-01 SCN-010-030 Feature 002 reads each committed owner layer once and preserves hashes clocks limitations and owner fields', () => {
    const graph = loadScope6OwnerGraph();
    const { projection, reads, values, before } = projectScope6Graph(graph);
    const expectedPaths = [graph.configPath, graph.pointerPath, graph.pointer.manifestPath, graph.manifest.ownerReadRef.path];

    assert.deepEqual(reads, expectedPaths);
    assert.equal(new Set(reads).size, 4);
    assert.equal(graph.pointer.manifestSha256, `sha256:${graph.pointer.manifestPath.slice(-69, -5)}`);
    assert.equal(company.companyManifestSha256(graph.manifest), graph.pointer.manifestSha256);
    assert.equal(company.companyObjectSha256(graph.owner), graph.manifest.ownerReadRef.sha256);
    assert.equal(projection.source, 'company-fundamentals-owner-v1');
    assert.equal(projection.fingerprint, graph.manifest.ownerReadRef.sha256);
    assert.equal(projection.metrics.archetypeId, graph.owner.archetypeId);
    assert.equal(projection.sourceAsOf, graph.owner.statementCutoff);
    assert.equal(projection.modelAsOf, graph.owner.modelCutoff);
    assert.equal(projection.asOf, graph.owner.briefCutoff);
    assert.equal(projection.marketAsOf, graph.owner.marketCutoff);
    assert.equal(projection.evidenceCutoff, graph.owner.retrievalCutoff);
    assert.deepEqual(projection.limitations, graph.owner.limitations);
    assert.deepEqual(projection.metrics.sourceLinks, graph.owner.sourceLinks);
    assert.deepEqual(projection.metrics.disagreements, graph.owner.disagreements);
    assert.deepEqual(projection.metrics.modelImpactProposals, graph.owner.modelImpactProposals);
    assert.deepEqual(projection.recommendationEligibility, graph.owner.recommendationEligibility);
    assert.equal(projection.recommendationEligibility.eligible, false);
    for (const [path, value] of values) assert.equal(JSON.stringify(value), before.get(path), `${path} was mutated`);
});

test('TP-6-01 SCN-010-030 Feature 002 rejects hash drift and has no RLCOMPANY formula model or reducer dependency', () => {
    const graph = loadScope6OwnerGraph();
    const driftedOwner = structuredClone(graph.owner);
    driftedOwner.direction = 'improving';
    const values = new Map([
        [graph.configPath, graph.config],
        [graph.pointerPath, graph.pointer],
        [graph.pointer.manifestPath, graph.manifest],
        [graph.manifest.ownerReadRef.path, driftedOwner]
    ]);

    assert.throws(
        () => buildCompanyFundamentalsOwnerRead((path) => values.get(path), company.companyObjectSha256),
        /hash-incoherent/
    );
    assert.doesNotMatch(
        buildCompanyFundamentalsOwnerRead.toString(),
        /RLCOMPANY|evaluateModel|buildFundamentalsToolRead|rankEvidenceChanges|buildAdaptiveCompanyBrief|appendAdaptiveBriefHistory|selectResilienceView|reduce[A-Z]/
    );
});

test('TP-6-01 SCN-010-030 market-only freshness cannot promote fundamentals or mutate owner archetype proposals or recommendation eligibility', () => {
    const graph = loadScope6OwnerGraph();
    const owner = structuredClone(graph.owner);
    owner.marketCutoff = '2026-07-17T13:30:00.000Z';
    const ownerHash = company.companyObjectSha256(owner);
    const ownerObjectId = ownerHash.slice('sha256:'.length);
    const ownerRef = {
        ...graph.manifest.ownerReadRef,
        objectId: ownerObjectId,
        path: `data/company-fundamentals/objects/${ownerObjectId}.json`,
        sha256: ownerHash
    };
    const manifest = { ...structuredClone(graph.manifest), ownerReadRef: ownerRef };
    manifest.manifestSha256 = company.companyManifestSha256(manifest);
    const manifestObjectId = manifest.manifestSha256.slice('sha256:'.length);
    const pointer = {
        ...structuredClone(graph.pointer),
        manifestPath: `data/company-fundamentals/objects/${manifestObjectId}.json`,
        manifestSha256: manifest.manifestSha256
    };
    const refreshedGraph = { ...graph, pointer, manifest, owner };
    const { projection } = projectScope6Graph(refreshedGraph);

    assert.equal(projection.marketAsOf, '2026-07-17T13:30:00.000Z');
    assert.equal(projection.status, graph.owner.status);
    assert.equal(projection.metrics.direction, graph.owner.direction);
    assert.equal(projection.metrics.archetypeId, graph.owner.archetypeId);
    assert.deepEqual(projection.metrics.modelImpactProposals, graph.owner.modelImpactProposals);
    assert.deepEqual(projection.recommendationEligibility, graph.owner.recommendationEligibility);
    assert.equal(projection.recommendationEligibility.eligible, false);
});

/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE7-BEGIN */
// Scope 7 (Increment C): CMG and JPM source-qualified archetype overlays over the shared foundation.
// selectResilienceView is exercised as a production function over the REAL source-qualified publications
// materialized from the retained SEC Submissions and SEC Company Facts (XBRL) response bytes. Every value
// is read from the committed publication through the production loader and projector — there is no inline
// constructed figure. Chipotle keeps raw leverage beside the lease and repurchase context with no pass/fail
// value; JPMorgan marks the ordinary industrial heuristics inapplicable with the financial-institution
// policy id and never yields an industrial rank. Concepts the issuer does not tag (Chipotle treasury-stock,
// JPMorgan CET1/liquidity-coverage) resolve to explicit unavailable observations rather than a substitute.
async function loadCompanyConfig() {
    return JSON.parse(await readFile(new URL('../company-fundamentals.config.json', import.meta.url), 'utf8'));
}

async function loadRealPublication(companyId) {
    const pointer = JSON.parse(await readFile(new URL(`../data/company-fundamentals/companies/${companyId}/current.json`, import.meta.url), 'utf8'));
    company.validateCompanyCurrentPointer(pointer, companyId);
    const manifest = JSON.parse(await readFile(new URL(`../${pointer.manifestPath}`, import.meta.url), 'utf8'));
    const objects = {};
    const queue = [];
    const seen = new Set();
    const collect = (value) => {
        if (value?.contractVersion === 'company-object-ref/v1') { queue.push(value); return; }
        if (Array.isArray(value)) value.forEach(collect);
        else if (value && typeof value === 'object') Object.values(value).forEach(collect);
    };
    collect(manifest);
    while (queue.length) {
        const ref = queue.shift();
        if (seen.has(ref.objectId)) continue;
        seen.add(ref.objectId);
        const value = JSON.parse(await readFile(new URL(`../${ref.path}`, import.meta.url), 'utf8'));
        objects[ref.objectId] = value;
        collect(value);
    }
    // The production projector re-validates the whole graph, so a test that reads through it cannot pass on a malformed publication.
    const accepted = company.projectAcceptedPublication(manifest, objects);
    const observationsById = Object.fromEntries(accepted.observations.map((observation) => [observation.observationId, observation]));
    return { manifest, accepted, observationsById };
}

test('TP-7-01 SCN-010-002 CMG resilience overlay keeps real reported leverage beside lease and treasury context with exact refs and no pass/fail value', async () => {
    const config = await loadCompanyConfig();
    const cmgArchetype = company.resolveArchetypeView(config, 'sec-cik-0001058090');
    assert.equal(cmgArchetype.status, 'accepted');
    assert.equal(cmgArchetype.primaryArchetypeId, 'archetype-restaurant-unit-economics');

    const { accepted, observationsById } = await loadRealPublication('sec-cik-0001058090');
    assert.equal(accepted.identity.issuerName, 'CHIPOTLE MEXICAN GRILL INC');
    assert.equal(accepted.periods[0].accession, '0001058090-26-000009');
    // Real SEC 10-K balance-sheet observations (FY2025, reported 2025-12-31).
    const equity = observationsById['obs-cmg-stockholders-equity'];
    const liabilities = observationsById['obs-cmg-total-liabilities'];
    const lease = observationsById['obs-cmg-operating-lease-liability'];
    const fundedDebt = observationsById['obs-cmg-funded-debt'];
    const repurchase = observationsById['obs-cmg-common-stock-repurchase'];
    const treasury = observationsById['obs-cmg-treasury-stock'];
    assert.equal(equity.state, 'current');
    assert.equal(equity.value, '2830607000');
    assert.equal(liabilities.value, '6163924000');
    assert.equal(lease.value, '4773434000');
    // Chipotle carries no long-term debt: funded debt is a real reported zero, not a missing value.
    assert.equal(fundedDebt.state, 'current');
    assert.equal(fundedDebt.value, '0');
    // Chipotle retires repurchased shares, so there is no treasury-stock balance line — it is explicitly unavailable, not fabricated.
    assert.equal(treasury.state, 'unavailable');
    assert.equal(treasury.value, null);
    assert.equal(repurchase.value, '2425516000');

    const checks = [
        {
            checkId: 'check-cmg-cash-to-debt', policyId: 'policy-cmg-cash-to-debt', policyVersion: 'cash-to-funded-debt/v1', concept: 'cash-to-funded-debt', periodId: 'period-cmg-fy2025-annual',
            raw: {
                formula: 'cash-and-equivalents / funded-debt', threshold: null, operation: 'ratio', inputs: [
                    { inputId: 'input-cmg-cash', ref: 'obs-cmg-cash-and-equivalents', concept: 'cash-and-equivalents', unit: 'USD', periodId: 'period-cmg-fy2025-annual', value: observationsById['obs-cmg-cash-and-equivalents'].value, state: 'reconciled' },
                    { inputId: 'input-cmg-funded-debt', ref: 'obs-cmg-funded-debt', concept: 'funded-debt', unit: 'USD', periodId: 'period-cmg-fy2025-annual', value: fundedDebt.value, state: 'reconciled' }
                ]
            },
            contextualAdjustment: null
        },
        {
            checkId: 'check-cmg-liabilities-equity', policyId: 'policy-cmg-lease-adjusted-leverage', policyVersion: 'lease-adjusted-leverage/v1', concept: 'liabilities-to-equity', periodId: 'period-cmg-fy2025-annual',
            raw: {
                formula: 'total-liabilities / stockholders-equity', threshold: null, operation: 'ratio', inputs: [
                    { inputId: 'input-cmg-liabilities', ref: 'obs-cmg-total-liabilities', concept: 'total-liabilities', unit: 'USD', periodId: 'period-cmg-fy2025-annual', value: liabilities.value, state: 'reconciled' },
                    { inputId: 'input-cmg-equity', ref: 'obs-cmg-stockholders-equity', concept: 'stockholders-equity', unit: 'USD', periodId: 'period-cmg-fy2025-annual', value: equity.value, state: 'reconciled' }
                ]
            },
            contextualAdjustment: { adjustmentId: 'adjustment-cmg-lease', amount: lease.value, rationale: 'Operating-lease obligations dwarf the reported funded debt, and repurchased shares are retired rather than held in treasury.', sourceRefs: ['obs-cmg-operating-lease-liability', 'obs-cmg-common-stock-repurchase'], sensitivity: 'lease-and-repurchase-context', applicability: 'restaurant-unit-economics' }
        }
    ];
    const archetypeFacts = [
        { factId: 'fact-cmg-lease', concept: 'operating-lease-liability', label: 'Operating lease liability (SEC 10-K FY2025)', value: lease.value, unit: 'USD', state: 'reconciled', sourceRefs: ['obs-cmg-operating-lease-liability'] },
        { factId: 'fact-cmg-repurchase', concept: 'common-stock-repurchase', label: 'Common-stock repurchase (SEC 10-K FY2025)', value: repurchase.value, unit: 'USD', state: 'reconciled', sourceRefs: ['obs-cmg-common-stock-repurchase'] }
    ];
    const frozenChecks = JSON.stringify(checks);
    const view = company.selectResilienceView({ archetypeView: cmgArchetype, subjectCompanyId: 'sec-cik-0001058090', checks, archetypeFacts });
    const leverage = view.checks.find((entry) => entry.checkId === 'check-cmg-liabilities-equity');
    const cashToDebt = view.checks.find((entry) => entry.checkId === 'check-cmg-cash-to-debt');
    // The raw formula is computed from the reported observations WITHOUT adjustment (6163924000 / 2830607000).
    assert.equal(leverage.applicability, 'applicable');
    assert.equal(leverage.diagnostic.raw.value, '2.177598');
    assert.equal(leverage.diagnostic.raw.state, 'available');
    assert.deepEqual(leverage.diagnostic.raw.inputRefs, ['obs-cmg-total-liabilities', 'obs-cmg-stockholders-equity']);
    // The contextual record names the lease and repurchase effects with exact refs and carries NO pass/fail value.
    assert.notEqual(leverage.diagnostic.contextual, null);
    assert.deepEqual(leverage.diagnostic.contextual.sourceRefs, ['obs-cmg-operating-lease-liability', 'obs-cmg-common-stock-repurchase']);
    assert.equal(Object.prototype.hasOwnProperty.call(leverage.diagnostic.contextual, 'value'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(leverage.diagnostic.contextual, 'pass'), false);
    assert.equal(leverage.weaknessRank, null);
    // Chipotle is debt-free, so the cash-to-debt ratio has a zero denominator and is honestly blocked rather than reported as strength.
    assert.equal(cashToDebt.applicability, 'applicable');
    assert.equal(cashToDebt.diagnostic.raw.state, 'blocked');
    assert.equal(view.industrialRankProduced, false);
    // The production overlay never mutates its inputs.
    assert.equal(JSON.stringify(checks), frozenChecks);
    assert.ok(Object.isFrozen(view));
});

test('TP-7-01 SCN-010-003 JPM financial-institution overlay marks ordinary heuristics inapplicable with the policy id and keeps real bank facts available without an industrial rank', async () => {
    const config = await loadCompanyConfig();
    const jpmArchetype = company.resolveArchetypeView(config, 'sec-cik-0000019617');
    assert.equal(jpmArchetype.status, 'accepted');
    assert.equal(jpmArchetype.primaryArchetypeId, 'archetype-financial-institution');

    const { accepted, observationsById } = await loadRealPublication('sec-cik-0000019617');
    assert.equal(accepted.identity.issuerName, 'JPMORGAN CHASE & CO');
    assert.equal(accepted.periods[0].accession, '0001628280-26-008131');
    const deposits = observationsById['obs-jpm-total-deposits'];
    const preferred = observationsById['obs-jpm-preferred-capital'];
    const cet1 = observationsById['obs-jpm-cet1-ratio'];
    const liquidity = observationsById['obs-jpm-liquidity-coverage-ratio'];
    // Real SEC 10-K bank facts (FY2025, reported 2025-12-31).
    assert.equal(deposits.state, 'current');
    assert.equal(deposits.value, '2559320000000');
    assert.equal(preferred.value, '20045000000');
    // Basel III regulatory-capital ratios are not tagged in the US-GAAP XBRL response, so they are explicitly unavailable rather than fabricated.
    assert.equal(cet1.state, 'unavailable');
    assert.equal(cet1.value, null);
    assert.equal(liquidity.state, 'unavailable');
    assert.equal(liquidity.value, null);

    const view = company.selectResilienceView({
        archetypeView: jpmArchetype,
        subjectCompanyId: 'sec-cik-0000019617',
        checks: [
            { checkId: 'check-jpm-liabilities-equity', policyId: 'policy-jpm-ordinary-liabilities-equity', policyVersion: 'financial-institution-inapplicable/v1', concept: 'liabilities-to-equity', periodId: 'period-jpm-fy2025-annual', raw: { formula: 'total-liabilities / stockholders-equity', threshold: null, operation: 'ratio', inputs: [] } },
            { checkId: 'check-jpm-net-debt-ebitda', policyId: 'policy-jpm-net-debt-ebitda', policyVersion: 'financial-institution-inapplicable/v1', concept: 'net-debt-to-ebitda', periodId: 'period-jpm-fy2025-annual', raw: { formula: 'net-debt / ebitda', threshold: null, operation: 'ratio', inputs: [] } }
        ],
        archetypeFacts: [
            { factId: 'fact-jpm-deposits', concept: 'total-deposits', label: 'Total deposits (SEC 10-K FY2025)', value: deposits.value, unit: 'USD', state: 'reconciled', sourceRefs: ['obs-jpm-total-deposits'] },
            { factId: 'fact-jpm-preferred', concept: 'preferred-capital', label: 'Preferred capital (SEC 10-K FY2025)', value: preferred.value, unit: 'USD', state: 'reconciled', sourceRefs: ['obs-jpm-preferred-capital'] }
        ]
    });
    const ordinary = view.checks.find((entry) => entry.concept === 'liabilities-to-equity');
    const netDebt = view.checks.find((entry) => entry.concept === 'net-debt-to-ebitda');
    assert.equal(ordinary.applicability, 'inapplicable');
    assert.equal(ordinary.policyId, 'policy-jpm-ordinary-liabilities-equity');
    assert.equal(ordinary.decidingArchetypeId, 'archetype-financial-institution');
    assert.equal(ordinary.diagnostic, null);
    assert.equal(ordinary.weaknessRank, null);
    assert.equal(netDebt.applicability, 'inapplicable');
    assert.equal(netDebt.policyId, 'policy-jpm-net-debt-ebitda');
    assert.equal(netDebt.diagnostic, null);
    // Bank-specific facts stay available, and no industrial weakness rank is ever produced.
    assert.equal(view.archetypeFacts.length, 2);
    assert.ok(view.archetypeFacts.every((fact) => fact.state === 'reconciled'));
    assert.deepEqual(view.archetypeFacts.map((fact) => fact.concept), ['total-deposits', 'preferred-capital']);
    assert.equal(view.industrialRankProduced, false);
    assert.equal(view.industrialWeaknessRank, null);
});

test('TP-7-01 SCN-010-002/003 MSFT, CMG, and JPM select disjoint KPIs, diagnostics, formulas, and model families from real source-qualified facts with no fact or formula copied between issuers', async () => {
    const config = await loadCompanyConfig();
    const validation = company.validateCompanyConfig(config);
    assert.equal(validation.ok, true);
    const msft = company.resolveArchetypeView(config, 'sec-cik-0000789019');
    const cmg = company.resolveArchetypeView(config, 'sec-cik-0001058090');
    const jpm = company.resolveArchetypeView(config, 'sec-cik-0000019617');
    const kpis = (view) => view.definition.kpiPriorities.map((kpi) => kpi.kpiId);
    const policies = (view) => view.definition.diagnosticPolicies.map((policy) => policy.policyId);
    const disjoint = (a, b) => a.every((entry) => !b.includes(entry)) && b.every((entry) => !a.includes(entry));
    assert.ok(disjoint(kpis(msft), kpis(cmg)) && disjoint(kpis(msft), kpis(jpm)) && disjoint(kpis(cmg), kpis(jpm)), 'no KPI is shared between issuers');
    assert.ok(disjoint(policies(msft), policies(cmg)) && disjoint(policies(msft), policies(jpm)) && disjoint(policies(cmg), policies(jpm)), 'no diagnostic policy is shared between issuers');
    const families = config.model.definitions.map((definition) => definition.family);
    assert.ok(families.includes('ordinary-company-three-statement') && families.includes('financial-institution-balance-sheet'));
    assert.equal(new Set(families).size, families.length);
    const formulaIds = config.formulas.map((formula) => formula.formulaId);
    assert.equal(new Set(formulaIds).size, formulaIds.length);
    // Each issuer's real normalized facts are sourced from its own SEC endpoints — no CMG or JPM mapping reuses an MSFT source.
    const sourceForCompany = (companyId) => config.companies.find((entry) => entry.companyId === companyId).identitySourceIds;
    assert.ok(disjoint(sourceForCompany('sec-cik-0000789019'), sourceForCompany('sec-cik-0001058090')));
    assert.ok(disjoint(sourceForCompany('sec-cik-0000789019'), sourceForCompany('sec-cik-0000019617')));
    // The real committed publications carry issuer-specific source-qualified observations sourced from each issuer's own company-facts endpoint.
    const cmgPub = await loadRealPublication('sec-cik-0001058090');
    const jpmPub = await loadRealPublication('sec-cik-0000019617');
    const cmgFactsSource = cmgPub.accepted.sources.find((source) => source.sourceKind === 'sec-companyfacts');
    const jpmFactsSource = jpmPub.accepted.sources.find((source) => source.sourceKind === 'sec-companyfacts');
    assert.equal(cmgFactsSource.url, 'https://data.sec.gov/api/xbrl/companyfacts/CIK0001058090.json');
    assert.equal(jpmFactsSource.url, 'https://data.sec.gov/api/xbrl/companyfacts/CIK0000019617.json');
    assert.notEqual(cmgFactsSource.contentSha256, jpmFactsSource.contentSha256);
});
/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE7-END */
