import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { gunzipSync } from 'node:zlib';

import '../rlcompany.js';

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
    assert.equal(company.companyObjectSha256(config), 'sha256:deacff12957dde150744e399a33b1b99c805667e7c77998707d7535e8e655c5a');
    assert.equal(config.sec.request.minIntervalMs, 125);
    assert.deepEqual(
        validation.value.freshnessPolicies.map(({ evidenceClass }) => evidenceClass).sort(),
        [...company.EVIDENCE_CLASSES].sort()
    );
    assert.equal(validation.value.materialityPolicy.status, 'not-authorized');
    assert.deepEqual(validation.value.feature002.briefSubjects, []);

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
    assert.equal(fixture.manifest.configFingerprint, 'sha256:deacff12957dde150744e399a33b1b99c805667e7c77998707d7535e8e655c5a');
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
