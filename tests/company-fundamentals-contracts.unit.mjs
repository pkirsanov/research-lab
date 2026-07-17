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
    assert.equal(company.companyObjectSha256(config), 'sha256:e852b328e576f63638be68c6b4791e00178903b114f64ca6d1d7db7ece6a7dcb');
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
        status: 'accepted'
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
    assert.equal(fixture.manifest.configFingerprint, 'sha256:e852b328e576f63638be68c6b4791e00178903b114f64ca6d1d7db7ece6a7dcb');
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
