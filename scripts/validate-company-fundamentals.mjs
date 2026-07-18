import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { get as httpsGet } from 'node:https';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import { gunzipSync, gzipSync } from 'node:zlib';

import '../rlcompany.js';
import { buildCompanyFundamentalsOwnerRead } from './brief-refresh.mjs';

const company = globalThis.RLCOMPANY;
const repoRootUrl = new URL('../', import.meta.url);
const configUrl = new URL('../company-fundamentals.config.json', import.meta.url);
const sourceCaptureUrl = new URL('../tests/fixtures/company-fundamentals/source-qualified/sec-submissions-msft.extract.json', import.meta.url);
const currentPointerPath = 'data/company-fundamentals/companies/sec-cik-0000789019/current.json';
const captureMode = '--capture-sec-submissions-msft';
const rebuildMode = '--rebuild-from-retained';
const capturePayloadPath = 'tests/fixtures/company-fundamentals/source-qualified/sec-submissions-msft.raw.json.gz.b64';
const capturePayloadUrl = new URL(`../${capturePayloadPath}`, import.meta.url);

// Source-qualified overlay issuers (Increment C). Each is captured and materialized from the SAME
// exact-bytes discipline as the MSFT foundation: a real SEC Submissions response proves identity and
// filing clocks, and a real SEC Company Facts (XBRL) response provides the source-qualified balance-sheet
// observations the archetype resilience overlays read. The MSFT foundation keeps its own bespoke pipeline
// so it stays byte-stable; these issuers use the generic capture + overlay builder below.
const fixtureRoot = 'tests/fixtures/company-fundamentals/source-qualified';
const overlayIssuers = {
    'sec-cik-0001058090': {
        key: 'cmg',
        cik: '0001058090',
        submissionsSourceId: 'sec-submissions-cmg',
        companyFactsSourceId: 'sec-companyfacts-cmg',
        // Real US-GAAP XBRL concepts the restaurant-unit-economics resilience overlay reads. The anchor
        // concept fixes one coherent annual balance-sheet date; every other balance fact is read at that
        // same reported date so the raw leverage ratio is internally consistent. Chipotle carries no
        // long-term debt (LongTermDebt = 0) and RETIRES repurchased shares, so there is no treasury-stock
        // balance line — the real capital-return evidence is the annual repurchase flow, and the treasury
        // balance resolves to an explicit unavailable observation instead of a substituted figure.
        conceptRequests: [
            { sourceConcept: 'us-gaap:StockholdersEquity', normalizedConcept: 'stockholders-equity', role: 'anchor', unit: 'USD', valueType: 'integer' },
            { sourceConcept: 'us-gaap:Liabilities', normalizedConcept: 'total-liabilities', role: 'balance', unit: 'USD', valueType: 'integer' },
            { sourceConcept: 'us-gaap:LongTermDebt', normalizedConcept: 'funded-debt', role: 'balance', unit: 'USD', valueType: 'integer' },
            { sourceConcept: 'us-gaap:OperatingLeaseLiabilityNoncurrent', normalizedConcept: 'operating-lease-liability', role: 'balance', unit: 'USD', valueType: 'integer' },
            { sourceConcept: 'us-gaap:CashAndCashEquivalentsAtCarryingValue', normalizedConcept: 'cash-and-equivalents', role: 'balance', unit: 'USD', valueType: 'integer' },
            { sourceConcept: 'us-gaap:CommonStockSharesIssued', normalizedConcept: 'shares-issued', role: 'count', unit: 'shares', valueType: 'integer' },
            { sourceConcept: 'us-gaap:PaymentsForRepurchaseOfCommonStock', normalizedConcept: 'common-stock-repurchase', role: 'duration', unit: 'USD', valueType: 'integer' },
            { sourceConcept: 'us-gaap:TreasuryStockCommonValue', normalizedConcept: 'treasury-stock', role: 'balance', unit: 'USD', valueType: 'integer' }
        ]
    },
    'sec-cik-0000019617': {
        key: 'jpm',
        cik: '0000019617',
        submissionsSourceId: 'sec-submissions-jpm',
        companyFactsSourceId: 'sec-companyfacts-jpm',
        // Real US-GAAP XBRL concepts the financial-institution resilience overlay reads. Bank
        // regulatory-capital ratios (CET1, liquidity coverage) are NOT tagged in the US-GAAP XBRL response
        // and resolve to explicit unavailable observations rather than a substituted value. Preferred
        // capital is carried under PreferredStockIncludingAdditionalPaidInCapitalNetOfDiscount.
        conceptRequests: [
            { sourceConcept: 'us-gaap:StockholdersEquity', normalizedConcept: 'stockholders-equity', role: 'anchor', unit: 'USD', valueType: 'integer' },
            { sourceConcept: 'us-gaap:Liabilities', normalizedConcept: 'total-liabilities', role: 'balance', unit: 'USD', valueType: 'integer' },
            { sourceConcept: 'us-gaap:Deposits', normalizedConcept: 'total-deposits', role: 'balance', unit: 'USD', valueType: 'integer' },
            { sourceConcept: 'us-gaap:PreferredStockIncludingAdditionalPaidInCapitalNetOfDiscount', normalizedConcept: 'preferred-capital', role: 'balance', unit: 'USD', valueType: 'integer' },
            { sourceConcept: 'us-gaap:LongTermDebtAndCapitalLeaseObligationsIncludingCurrentMaturities', normalizedConcept: 'long-term-debt', role: 'balance', unit: 'USD', valueType: 'integer' },
            { sourceConcept: 'jpm:CommonEquityTier1CapitalToRiskWeightedAssets', normalizedConcept: 'cet1-ratio', role: 'balance', unit: 'pure', valueType: 'decimal' },
            { sourceConcept: 'jpm:LiquidityCoverageRatio', normalizedConcept: 'liquidity-coverage-ratio', role: 'balance', unit: 'pure', valueType: 'decimal' }
        ]
    }
};

function overlaySubmissionsFixturePaths(issuer) {
    return {
        extract: `${fixtureRoot}/sec-submissions-${issuer.key}.extract.json`,
        payload: `${fixtureRoot}/sec-submissions-${issuer.key}.raw.json.gz.b64`
    };
}

function overlayCompanyFactsFixturePaths(issuer) {
    return {
        extract: `${fixtureRoot}/sec-companyfacts-${issuer.key}.extract.json`,
        payload: `${fixtureRoot}/sec-companyfacts-${issuer.key}.raw.json.gz.b64`
    };
}

function overlayPointerPath(companyId) {
    return `data/company-fundamentals/companies/${companyId}/current.json`;
}


function requireCondition(condition, code, detail) {
    if (condition) return;
    const error = new Error(detail);
    error.code = code;
    throw error;
}

function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function requestSecResponse(sourceUrl, requestPolicy, userAgent) {
    return new Promise((resolve, reject) => {
        const startedAt = new Date().toISOString();
        const request = httpsGet(sourceUrl, {
            agent: false,
            headers: {
                Accept: 'application/json',
                'Accept-Encoding': 'identity',
                'User-Agent': userAgent
            },
            timeout: requestPolicy.timeoutMs
        }, (response) => {
            const chunks = [];
            let byteLength = 0;
            response.on('data', (chunk) => {
                byteLength += chunk.length;
                if (byteLength > requestPolicy.maxResponseBytes) {
                    request.destroy(Object.assign(new Error('SEC response exceeds configured byte limit'), { code: 'C010-SOURCE-BOUNDS' }));
                    return;
                }
                chunks.push(chunk);
            });
            response.on('end', () => resolve({
                body: Buffer.concat(chunks),
                completedAt: new Date().toISOString(),
                mediaType: Array.isArray(response.headers['content-type']) ? response.headers['content-type'][0] : response.headers['content-type'],
                startedAt,
                status: response.statusCode || 0
            }));
        });
        request.on('timeout', () => request.destroy(Object.assign(new Error('SEC request exceeded configured timeout'), { code: 'C010-SOURCE-TIMEOUT' })));
        request.on('error', reject);
    });
}

function collectObjectRefs(value, refs) {
    if (value?.contractVersion === 'company-object-ref/v1') {
        refs.push(value);
        return;
    }
    if (Array.isArray(value)) value.forEach((entry) => collectObjectRefs(entry, refs));
    else if (value && typeof value === 'object') Object.values(value).forEach((entry) => collectObjectRefs(entry, refs));
}

async function readPublicationJson(path) {
    requireCondition(company.isSafeRelativePath(path) && path.startsWith('data/company-fundamentals/'), 'C010-PUBLICATION-REF', `unsafe publication path: ${path}`);
    return JSON.parse(await readFile(new URL(path, repoRootUrl), 'utf8'));
}

async function loadCurrentPublication() {
    const pointer = await readPublicationJson(currentPointerPath);
    company.validateCompanyCurrentPointer(pointer, 'sec-cik-0000789019');
    const manifest = await readPublicationJson(pointer.manifestPath);
    requireCondition(company.companyManifestSha256(manifest) === pointer.manifestSha256, 'C010-PUBLICATION-HASH', 'current pointer does not bind its manifest');
    const objects = {};
    const refs = [];
    const refsById = new Map();
    collectObjectRefs(manifest, refs);
    while (refs.length) {
        const ref = refs.shift();
        if (refsById.has(ref.objectId)) continue;
        refsById.set(ref.objectId, ref);
        const object = await readPublicationJson(ref.path);
        objects[ref.objectId] = object;
        collectObjectRefs(object, refs);
    }
    return { manifest, objects, pointer, refsById };
}

function objectRef(objectId, value) {
    const sha256 = company.companyObjectSha256(value);
    return {
        contractVersion: 'company-object-ref/v1',
        path: `data/company-fundamentals/objects/${sha256.slice(7)}.json`,
        sha256,
        objectId
    };
}

async function writeImmutablePublicationObject(value, expectedSha256) {
    const path = `data/company-fundamentals/objects/${expectedSha256.slice(7)}.json`;
    const url = new URL(path, repoRootUrl);
    try {
        const existing = JSON.parse(await readFile(url, 'utf8'));
        requireCondition(company.companyObjectSha256(existing) === expectedSha256, 'C010-PUBLICATION-HASH', `immutable path collision: ${path}`);
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        await writeFile(url, `${JSON.stringify(value, null, 4)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o644 });
    }
    return path;
}

async function materializeCapturedFoundation(config, metadata, normalized) {
    const prior = await loadCurrentPublication();
    requireCondition(
        prior.manifest.publicationId === 'company-publication-sec-cik-0000789019-g1'
        && prior.manifest.generation === 1,
        'C010-PUBLICATION-GENERATION',
        'capture mode may replace only the Scope 01 generation-1 foundation publication'
    );

    const priorSources = Object.values(prior.objects).filter((value) => value.contractVersion === 'source-artifact/v1');
    const priorSubmissionsSource = priorSources.find(({ sourceKind }) => sourceKind === 'sec-submissions');
    const priorCompanyFactsSource = priorSources.find(({ sourceKind }) => sourceKind === 'sec-companyfacts');
    const priorIdentity = prior.objects[prior.manifest.identityRef.objectId];
    const priorDossier = prior.objects[prior.manifest.dossierRef.objectId];
    const priorSummary = prior.objects[prior.manifest.summaryRef.objectId];
    const priorOwnerRead = prior.objects[prior.manifest.ownerReadRef.objectId];
    const priorHistory = prior.objects[prior.manifest.historyRefs[0].objectId];
    const priorPeriod = prior.objects[priorDossier.periodRefs[0].objectId];
    requireCondition(
        priorSubmissionsSource && priorCompanyFactsSource && priorIdentity && priorDossier && priorSummary && priorOwnerRead && priorHistory && priorPeriod,
        'C010-PUBLICATION-REF',
        'Scope 01 foundation graph is missing a required template object'
    );

    const sourceId = `source-sec-submissions-msft-${metadata.retrievedAt.slice(0, 10).replaceAll('-', '')}`;
    const acceptedAt = normalized.latestQuarterlyFiling.acceptanceDateTime;
    const reportingPeriodEnd = normalized.latestQuarterlyFiling.reportDate;
    const source = structuredClone(priorSubmissionsSource);
    source.sourceId = sourceId;
    source.url = metadata.sourceUrl;
    source.clocks = {
        reportingPeriodEnd,
        sourcePublishedAt: acceptedAt,
        acceptedAt,
        retrievedAt: metadata.retrievedAt,
        observedAt: null
    };
    source.contentSha256 = metadata.contentSha256;
    source.rights = metadata.rights;
    source.limitations = [
        'Exact raw SEC response bytes retained and verified through the production SEC Submissions parser.',
        'Scope 01 captures SEC Submissions only; no SEC Company Facts response bytes are retained.'
    ];
    const sourceRef = objectRef(sourceId, source);

    const companyFactsSource = structuredClone(priorCompanyFactsSource);
    companyFactsSource.clocks.reportingPeriodEnd = reportingPeriodEnd;
    companyFactsSource.limitations = [
        'No SEC Company Facts response bytes were retained for this publication.',
        'Scope 01 intentionally leaves Company Facts acquisition to the controlled source-ingestion scope.'
    ];
    const companyFactsSourceRef = objectRef(companyFactsSource.sourceId, companyFactsSource);

    const period = structuredClone(priorPeriod);
    period.end = reportingPeriodEnd;
    period.form = normalized.latestQuarterlyFiling.form;
    period.accession = normalized.latestQuarterlyFiling.accessionNumber;
    period.filedAt = acceptedAt;
    period.qualifications = [
        'The exact SEC Submissions response proves filing identity and period metadata; it does not contain statement observations.'
    ];
    const periodRef = objectRef(period.periodId, period);

    const identity = structuredClone(priorIdentity);
    identity.issuerName = normalized.issuerName;
    identity.ticker = normalized.tickers[0];
    identity.exchange = normalized.exchanges[0];
    identity.cik = normalized.cik;
    identity.fiscalYearEnd = normalized.fiscalYearEnd;
    identity.identitySourceRefs = [sourceRef];
    const identityRef = objectRef(prior.manifest.identityRef.objectId, identity);

    const summary = structuredClone(priorSummary);
    summary.evidenceCutoff = acceptedAt;
    summary.independentFacts[0].value = normalized.issuerName;
    const summaryRef = objectRef(prior.manifest.summaryRef.objectId, summary);

    const dossier = structuredClone(priorDossier);
    dossier.evidenceCutoff = acceptedAt;
    dossier.identityRef = identityRef;
    dossier.periodRefs = [periodRef];
    dossier.sourceRefs = [sourceRef, companyFactsSourceRef];
    dossier.observations[0].sourceRef = sourceRef;
    dossier.observations[0].value = normalized.issuerName;
    dossier.observations[0].clocks = structuredClone(source.clocks);
    dossier.normalizedFacts[0].resolutionReason = 'No source-qualified SEC Company Facts response is present in Scope 01.';
    dossier.dependencyGraph.nodes.find(({ id }) => id === 'fact-issuer-name').value = normalized.issuerName;
    dossier.dependencyGraph.nodes.find(({ id }) => id === 'identity-summary').value = `${normalized.issuerName} | ${normalized.tickers[0]}`;
    dossier.evidenceCoverage[0].cutoff = acceptedAt;
    dossier.evidenceCoverage[0].explanation = 'Exact SEC Submissions identity and quarterly filing metadata are present; Company Facts observations are unavailable.';
    dossier.unavailableLinks[0].reason = 'Scope 01 retains exact SEC Submissions response bytes only; SEC Company Facts acquisition belongs to the later controlled-ingestion scope.';
    const dossierRef = objectRef(prior.manifest.dossierRef.objectId, dossier);

    const ownerRead = structuredClone(priorOwnerRead);
    ownerRead.statementCutoff = reportingPeriodEnd;
    ownerRead.limitations = [
        'Exact SEC Submissions bytes provide identity and filing metadata only; no source-qualified financial statement observation is present.',
        'No recommendation or confident substitute is published.'
    ];
    const ownerReadRef = objectRef(prior.manifest.ownerReadRef.objectId, ownerRead);
    const historyRef = objectRef(prior.manifest.historyRefs[0].objectId, priorHistory);

    const objects = {
        [sourceId]: source,
        [companyFactsSource.sourceId]: companyFactsSource,
        [period.periodId]: period,
        [prior.manifest.identityRef.objectId]: identity,
        [prior.manifest.summaryRef.objectId]: summary,
        [prior.manifest.dossierRef.objectId]: dossier,
        [prior.manifest.ownerReadRef.objectId]: ownerRead,
        [prior.manifest.historyRefs[0].objectId]: priorHistory
    };
    const manifest = structuredClone(prior.manifest);
    manifest.createdAt = metadata.retrievedAt;
    manifest.sourceCutoff = acceptedAt;
    manifest.configFingerprint = company.companyObjectSha256(config);
    manifest.identityRef = identityRef;
    manifest.summaryRef = summaryRef;
    manifest.dossierRef = dossierRef;
    manifest.ownerReadRef = ownerReadRef;
    manifest.sourceRefs = [sourceRef, companyFactsSourceRef];
    manifest.historyRefs = [historyRef];
    manifest.manifestSha256 = company.companyManifestSha256(manifest);

    const graphValidation = company.validatePublicationGraph(manifest, objects);
    requireCondition(graphValidation.ok, 'C010-PUBLICATION-SCHEMA', JSON.stringify(graphValidation.errors));
    const accepted = company.projectAcceptedPublication(manifest, objects);
    requireCondition(
        accepted.identity.issuerName === normalized.issuerName
        && accepted.identity.cik === normalized.cik
        && accepted.periods[0].accession === normalized.latestQuarterlyFiling.accessionNumber,
        'C010-IDENTITY-CONFLICT',
        'materialized accepted state diverges from the production-normalized SEC response'
    );

    const objectDirectory = new URL('../data/company-fundamentals/objects/', import.meta.url);
    const pointerDirectory = new URL('../data/company-fundamentals/companies/sec-cik-0000789019/', import.meta.url);
    await mkdir(objectDirectory, { recursive: true });
    await mkdir(pointerDirectory, { recursive: true });
    const newPaths = new Set();
    for (const [objectId, value] of Object.entries(objects)) {
        const ref = objectRef(objectId, value);
        newPaths.add(await writeImmutablePublicationObject(value, ref.sha256));
    }
    const manifestPath = await writeImmutablePublicationObject(manifest, manifest.manifestSha256);
    newPaths.add(manifestPath);

    const pointer = {
        contractVersion: 'company-current-pointer/v1',
        companyId: manifest.companyId,
        generation: manifest.generation,
        publicationId: manifest.publicationId,
        manifestPath,
        manifestSha256: manifest.manifestSha256,
        selectedAt: metadata.retrievedAt
    };
    company.validateCompanyCurrentPointer(pointer, manifest.companyId);
    const stagedPointerUrl = new URL(`.current-${process.pid}-${Date.now()}.json`, pointerDirectory);
    await writeFile(stagedPointerUrl, `${JSON.stringify(pointer, null, 4)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o644 });
    await rename(stagedPointerUrl, new URL(currentPointerPath, repoRootUrl));

    const oldPaths = new Set([prior.pointer.manifestPath]);
    prior.refsById.forEach(({ path }) => oldPaths.add(path));
    const preservedHistoricalPaths = new Set(prior.manifest.historyRefs.map(({ path }) => path));
    if (prior.manifest.briefRef) preservedHistoricalPaths.add(prior.manifest.briefRef.path);
    let removedObjectCount = 0;
    for (const path of oldPaths) {
        if (newPaths.has(path) || preservedHistoricalPaths.has(path)) continue;
        requireCondition(/^data\/company-fundamentals\/objects\/[a-f0-9]{64}\.json$/.test(path), 'C010-PUBLICATION-REF', `refusing to remove non-object path: ${path}`);
        await rm(new URL(path, repoRootUrl), { force: true });
        removedObjectCount += 1;
    }

    return {
        manifestSha256: manifest.manifestSha256,
        objectCount: Object.keys(objects).length,
        removedObjectCount,
        sourceId
    };
}

export async function captureSecSubmissions() {
    const lines = [];
    const config = JSON.parse(await readFile(configUrl, 'utf8'));
    const configValidation = company.validateCompanyConfig(config);
    requireCondition(configValidation.ok, 'C010-CONFIG-SCHEMA', JSON.stringify(configValidation.errors));

    const configuredCompany = config.companies.find(({ companyId }) => companyId === 'sec-cik-0000789019');
    const configuredSource = config.sources.find(({ sourceId }) => sourceId === 'sec-submissions-msft');
    requireCondition(configuredCompany && configuredSource, 'C010-CONFIG-REFERENCE', 'configured MSFT SEC Submissions source is required');
    const sourceUrl = new URL(configuredSource.pathPattern, config.sec.baseUrl);
    requireCondition(
        sourceUrl.protocol === 'https:'
        && sourceUrl.hostname === 'data.sec.gov'
        && sourceUrl.username === ''
        && sourceUrl.password === ''
        && sourceUrl.search === ''
        && sourceUrl.hash === ''
        && sourceUrl.pathname === `/submissions/CIK${configuredCompany.cik}.json`,
        'C010-SOURCE-ALLOWLIST',
        'capture URL is outside the exact configured SEC Submissions allowlist'
    );

    const userAgent = process.env.SEC_USER_AGENT;
    requireCondition(
        typeof userAgent === 'string'
        && userAgent.trim().length > 0
        && /\S+@\S+\.\S+/.test(userAgent)
        && !/noreply/i.test(userAgent),
        'C010-SOURCE-IDENTITY',
        'SEC_USER_AGENT must contain a contactable process-only identity'
    );

    const requestPolicy = config.sec.request;
    let response = null;
    let attemptsUsed = 0;
    for (let attempt = 1; attempt <= requestPolicy.maxAttempts; attempt += 1) {
        await wait(requestPolicy.minIntervalMs);
        attemptsUsed = attempt;
        response = await requestSecResponse(sourceUrl, requestPolicy, userAgent);
        requireCondition(response.status < 300 || response.status >= 400, 'C010-SOURCE-REDIRECT', 'SEC redirects are forbidden');
        if (!requestPolicy.retryableStatuses.includes(response.status) || attempt === requestPolicy.maxAttempts) break;
    }

    requireCondition(response && response.status === 200, 'C010-SOURCE-HTTP', `SEC request returned status ${response?.status || 0}`);
    requireCondition(/^application\/json(?:;|$)/i.test(response.mediaType || ''), 'C010-SOURCE-MEDIA', 'SEC response media type must be application/json');
    const rawText = response.body.toString('utf8');
    requireCondition(Buffer.from(rawText, 'utf8').equals(response.body), 'C010-SOURCE-ENCODING', 'SEC response must be exact UTF-8 JSON bytes');

    const provenance = {
        sourceUrl: sourceUrl.href,
        cik: configuredCompany.cik,
        retrievedAt: response.completedAt,
        mediaType: response.mediaType,
        rights: configuredSource.rights,
        requestIdentityPolicy: 'sec-user-agent-required/v1'
    };
    const normalized = company.parseSecSubmissionsResponse(rawText, provenance);
    const metadata = {
        contractVersion: 'company-source-capture/v1',
        sourceUrl: provenance.sourceUrl,
        cik: provenance.cik,
        requestStartedAt: response.startedAt,
        retrievedAt: provenance.retrievedAt,
        mediaType: provenance.mediaType,
        rights: provenance.rights,
        requestIdentityPolicy: provenance.requestIdentityPolicy,
        httpStatus: response.status,
        contentSha256: normalized.contentSha256,
        byteLength: response.body.length,
        completeResponse: true,
        payloadPath: capturePayloadPath,
        payloadEncoding: 'gzip+base64'
    };

    const stagingParent = dirname(fileURLToPath(sourceCaptureUrl));
    await mkdir(stagingParent, { recursive: true });
    const stagingDirectory = await mkdtemp(join(stagingParent, '.capture-stage-'));
    try {
        const stagedMetadataPath = join(stagingDirectory, 'capture.json');
        const stagedPayloadPath = join(stagingDirectory, 'payload.gz.b64');
        await writeFile(stagedPayloadPath, `${gzipSync(response.body, { level: 9, mtime: 0 }).toString('base64')}\n`, { encoding: 'ascii', mode: 0o644 });
        await writeFile(stagedMetadataPath, `${JSON.stringify(metadata, null, 4)}\n`, { encoding: 'utf8', mode: 0o644 });
        await rename(stagedPayloadPath, capturePayloadUrl);
        await rename(stagedMetadataPath, sourceCaptureUrl);
    } finally {
        await rm(stagingDirectory, { recursive: true, force: true });
    }

    const publication = await materializeCapturedFoundation(config, metadata, normalized);

    lines.push('[company-fundamentals] capture identity: usable process-only value withheld');
    lines.push(`[company-fundamentals] capture source: ${sourceUrl.href}`);
    lines.push('[company-fundamentals] capture endpoint count: 1');
    lines.push('[company-fundamentals] capture redirect policy: reject');
    lines.push('[company-fundamentals] capture proxy policy: direct connection only');
    lines.push(`[company-fundamentals] capture minimum interval: ${requestPolicy.minIntervalMs}ms`);
    lines.push(`[company-fundamentals] capture attempts used: ${attemptsUsed}`);
    lines.push(`[company-fundamentals] capture HTTP status: ${response.status}`);
    lines.push(`[company-fundamentals] capture media type: ${response.mediaType}`);
    lines.push(`[company-fundamentals] capture bytes: ${response.body.length}`);
    lines.push(`[company-fundamentals] capture content hash: ${normalized.contentSha256}`);
    lines.push(`[company-fundamentals] capture CIK: ${normalized.cik}`);
    lines.push(`[company-fundamentals] capture latest quarterly filing: ${normalized.latestQuarterlyFiling.accessionNumber}`);
    lines.push('[company-fundamentals] capture parser: production SEC parser accepted exact bytes');
    lines.push('[company-fundamentals] capture metadata: tests/fixtures/company-fundamentals/source-qualified/sec-submissions-msft.extract.json');
    lines.push(`[company-fundamentals] capture payload: ${capturePayloadPath}`);
    lines.push(`[company-fundamentals] publication source artifact: ${publication.sourceId}`);
    lines.push(`[company-fundamentals] publication immutable objects: ${publication.objectCount}`);
    lines.push(`[company-fundamentals] publication manifest hash: ${publication.manifestSha256}`);
    lines.push(`[company-fundamentals] publication obsolete objects removed: ${publication.removedObjectCount}`);
    lines.push('[company-fundamentals] publication pointer: replaced last');
    lines.push('[company-fundamentals] capture result: PASS');
    return { ok: true, lines, metadata, normalized, publication };
}

export async function rebuildFoundationFromRetained() {
    const lines = [];
    const config = JSON.parse(await readFile(configUrl, 'utf8'));
    const configValidation = company.validateCompanyConfig(config);
    requireCondition(configValidation.ok, 'C010-CONFIG-SCHEMA', JSON.stringify(configValidation.errors));

    const sourceCapture = JSON.parse(await readFile(sourceCaptureUrl, 'utf8'));
    const compressedPayload = await readFile(new URL(sourceCapture.payloadPath, repoRootUrl), 'utf8');
    const sourceBytes = gunzipSync(Buffer.from(compressedPayload, 'base64'));
    const sourceRawText = sourceBytes.toString('utf8');
    const sourceContentSha256 = `sha256:${createHash('sha256').update(sourceBytes).digest('hex')}`;
    requireCondition(sourceContentSha256 === sourceCapture.contentSha256, 'C010-PUBLICATION-HASH', 'retained source bytes do not match provenance hash');
    const normalized = company.parseSecSubmissionsResponse(sourceRawText, {
        sourceUrl: sourceCapture.sourceUrl,
        cik: sourceCapture.cik,
        retrievedAt: sourceCapture.retrievedAt,
        mediaType: sourceCapture.mediaType,
        rights: sourceCapture.rights,
        requestIdentityPolicy: sourceCapture.requestIdentityPolicy
    });

    // Extract the exact real filings needed for the period set directly from the retained response bytes.
    const rawResponse = JSON.parse(sourceRawText);
    const recent = rawResponse.filings.recent;
    const filingsByForm = (form) => {
        const out = [];
        for (let index = 0; index < recent.form.length; index += 1) {
            if (recent.form[index] === form) {
                out.push({
                    accession: recent.accessionNumber[index],
                    reportDate: recent.reportDate[index],
                    filingDate: recent.filingDate[index],
                    acceptanceDateTime: recent.acceptanceDateTime[index]
                });
            }
        }
        return out;
    };
    const quarterlyFilings = filingsByForm('10-Q');
    const annualFilings = filingsByForm('10-K');
    requireCondition(quarterlyFilings.length >= 2 && annualFilings.length >= 2, 'C010-SOURCE-SCHEMA', 'retained submissions lack the real 10-Q and 10-K filings required for the period set');
    const latestQuarter = quarterlyFilings[0];
    const latestAnnual = annualFilings[0];
    const priorAnnual = annualFilings[1];
    requireCondition(latestQuarter.accession === normalized.latestQuarterlyFiling.accessionNumber, 'C010-SOURCE-SCHEMA', 'latest 10-Q does not match production-normalized filing');

    const dayAfter = (isoDate) => {
        const date = new Date(`${isoDate}T00:00:00Z`);
        date.setUTCDate(date.getUTCDate() + 1);
        return date.toISOString().slice(0, 10);
    };
    const daysBetween = (startIso, endIso) => Math.round((Date.parse(`${endIso}T00:00:00Z`) - Date.parse(`${startIso}T00:00:00Z`)) / 86400000);

    const prior = await loadCurrentPublication();
    requireCondition(
        prior.manifest.publicationId === 'company-publication-sec-cik-0000789019-g1' && prior.manifest.generation === 1,
        'C010-PUBLICATION-GENERATION',
        'rebuild targets only the Scope 1 generation-1 foundation publication'
    );
    const priorDossier = prior.objects[prior.manifest.dossierRef.objectId];
    const quarterPeriod = structuredClone(prior.objects[priorDossier.periodRefs[0].objectId]);
    requireCondition(
        quarterPeriod.periodId === 'period-msft-fy2026-q3' && quarterPeriod.accession === latestQuarter.accession,
        'C010-PERIOD-SCHEMA',
        'foundation quarter period does not match the retained latest 10-Q filing'
    );

    const annualStart = dayAfter(priorAnnual.reportDate);
    const yearToDateStart = dayAfter(latestAnnual.reportDate);
    const annualPeriod = {
        contractVersion: 'reporting-period/v1',
        periodId: 'period-msft-fy2025-annual',
        kind: 'annual',
        start: annualStart,
        end: latestAnnual.reportDate,
        durationDays: daysBetween(annualStart, latestAnnual.reportDate),
        fiscalYear: 2025,
        fiscalQuarter: null,
        form: '10-K',
        accession: latestAnnual.accession,
        filedAt: latestAnnual.acceptanceDateTime,
        amendmentState: 'original',
        comparability: 'comparable',
        qualifications: ['Real SEC 10-K annual filing identity and period metadata; no statement observation is captured in this scope.']
    };
    const yearToDatePeriod = {
        contractVersion: 'reporting-period/v1',
        periodId: 'period-msft-fy2026-q3-ytd',
        kind: 'year-to-date',
        start: yearToDateStart,
        end: latestQuarter.reportDate,
        durationDays: daysBetween(yearToDateStart, latestQuarter.reportDate),
        fiscalYear: 2026,
        fiscalQuarter: 3,
        form: '10-Q',
        accession: latestQuarter.accession,
        filedAt: latestQuarter.acceptanceDateTime,
        amendmentState: 'original',
        comparability: 'comparable',
        qualifications: ['Real SEC 10-Q year-to-date period identity; a YTD span is never a standalone quarter.']
    };
    const instantPeriod = {
        contractVersion: 'reporting-period/v1',
        periodId: 'period-msft-fy2026-q3-instant',
        kind: 'instant',
        start: null,
        end: latestQuarter.reportDate,
        durationDays: null,
        fiscalYear: 2026,
        fiscalQuarter: 3,
        form: '10-Q',
        accession: latestQuarter.accession,
        filedAt: latestQuarter.acceptanceDateTime,
        amendmentState: 'original',
        comparability: 'comparable',
        qualifications: ['Real SEC 10-Q instant balance-sheet date; an instant is never a standalone quarter.']
    };

    const periodObjects = [quarterPeriod, annualPeriod, yearToDatePeriod, instantPeriod];
    periodObjects.forEach((period) => {
        const classification = company.classifyReportingPeriod(period);
        requireCondition(
            (period.kind === 'quarter') === classification.standaloneQuarter,
            'C010-PERIOD-SCHEMA',
            `period ${period.periodId} standalone-quarter classification is incoherent`
        );
    });

    const dossier = structuredClone(priorDossier);
    dossier.periodRefs = periodObjects.map((period) => objectRef(period.periodId, period));

    const identity = structuredClone(prior.objects[prior.manifest.identityRef.objectId]);
    const summary = structuredClone(prior.objects[prior.manifest.summaryRef.objectId]);
    const history = structuredClone(prior.objects[prior.manifest.historyRefs[0].objectId]);
    const submissionsSource = structuredClone(prior.objects[prior.manifest.sourceRefs[0].objectId]);
    const companyFactsSource = structuredClone(prior.objects[prior.manifest.sourceRefs[1].objectId]);

    // Materialize the ordinary-company model pack from the accepted config model and scenario.
    // The pack is referenced by the manifest AND nested inside the owner read so the entire
    // foundation traversal reaches it. modelPackRef becomes non-null and hash-valid.
    const modelConfig = config.model;
    const modelDefinition = modelConfig.definitions.find((definition) => definition.status === 'accepted') || modelConfig.definitions[0];
    const acceptedScenarioConfig = modelConfig.scenarios.find((scenario) => scenario.companyId === prior.manifest.companyId && scenario.status === 'accepted');
    requireCondition(Boolean(modelDefinition) && Boolean(acceptedScenarioConfig), 'C010-MODEL-DEPENDENCY', 'config.model must declare an accepted definition and an accepted MSFT scenario');
    const scenarioAssumptionsMap = Object.fromEntries(acceptedScenarioConfig.assumptions.map((assumption) => [assumption.driverId, assumption.value]));
    const modelBaseline = company.computeModelBaseline(modelDefinition, scenarioAssumptionsMap);
    requireCondition(modelBaseline.blockedNodeIds.length === 0, 'C010-MODEL-DEPENDENCY', 'the accepted scenario baseline blocks a node');
    const modelBaselineOutputs = modelBaseline.outputs.map(({ nodeId, value }) => ({ nodeId, value }));
    const acceptedScenario = {
        contractVersion: 'company-scenario-revision/v1',
        scenarioRevisionId: `${acceptedScenarioConfig.scenarioId}-r${acceptedScenarioConfig.revision}`,
        scenarioId: acceptedScenarioConfig.scenarioId,
        revision: acceptedScenarioConfig.revision,
        companyId: acceptedScenarioConfig.companyId,
        name: acceptedScenarioConfig.name,
        owner: acceptedScenarioConfig.owner,
        state: 'active',
        modelDefinitionId: acceptedScenarioConfig.modelDefinitionId,
        historicalCutoff: acceptedScenarioConfig.historicalCutoff,
        assumptions: acceptedScenarioConfig.assumptions.map(({ driverId, value }) => ({ driverId, value })),
        outputs: modelBaselineOutputs,
        parentRevisionId: null,
        createdAt: prior.manifest.createdAt
    };
    const modelPack = {
        contractVersion: 'company-model-pack/v1',
        companyId: prior.manifest.companyId,
        publicationId: prior.manifest.publicationId,
        generation: prior.manifest.generation,
        modelPackId: 'model-pack-sec-cik-0000789019-g1',
        modelDefinition: structuredClone(modelDefinition),
        acceptedScenario,
        baselineOutputs: modelBaselineOutputs
    };
    const modelPackRef = objectRef(modelPack.modelPackId, modelPack);

    // Scope 5 publishes one truthful partial brief from the accepted generation. The retained SEC Submissions
    // response proves identity and filing clocks but not statement values, so no material change or confident
    // direction is fabricated. Optional classes remain independently unavailable and the user-owned model stays current.
    const preliminaryDependencyResults = company.propagateDependencyStates(dossier.dependencyGraph);
    const directionResult = preliminaryDependencyResults.find((result) => result.id === 'metric-direction');
    const archetypeAssignment = config.archetypes.assignments.find((assignment) => assignment.companyId === prior.manifest.companyId && assignment.status === 'accepted');
    requireCondition(Boolean(archetypeAssignment), 'C010-BRIEF-SCHEMA', 'Scope 5 requires one accepted company archetype assignment');
    const committedCoverage = company.EVIDENCE_CLASSES.map((evidenceClass) => {
        if (evidenceClass === 'reported') return { evidenceClass, state: 'partial', cutoff: quarterPeriod.end, requiredUpdate: 'A retained SEC Company Facts response with source-qualified statement observations.' };
        if (evidenceClass === 'user-assumption' || evidenceClass === 'model-output') return { evidenceClass, state: 'current', cutoff: acceptedScenario.historicalCutoff, requiredUpdate: null };
        return { evidenceClass, state: 'unavailable', cutoff: null, requiredUpdate: `A source-qualified ${evidenceClass} observation.` };
    });
    const committedBrief = company.buildAdaptiveCompanyBrief({
        contractVersion: 'adaptive-company-brief-request/v1',
        companyId: prior.manifest.companyId,
        archetypeId: archetypeAssignment.primaryArchetypeId,
        priorBrief: null,
        acceptedState: {
            contractVersion: 'company-brief-accepted-state/v1',
            companyId: prior.manifest.companyId,
            archetype: {
                assignmentId: `assignment-${prior.manifest.companyId}-${archetypeAssignment.primaryArchetypeId}`,
                primaryArchetypeId: archetypeAssignment.primaryArchetypeId,
                status: archetypeAssignment.status
            },
            facts: structuredClone(dossier.observations),
            assumptions: structuredClone(acceptedScenario.assumptions),
            scenarioRevisionId: acceptedScenario.scenarioRevisionId,
            fundamentalDirection: {
                direction: directionResult && directionResult.state === 'available' ? String(directionResult.value) : 'unavailable',
                evidenceClass: 'reported',
                sourceRef: companyFactsSource.sourceId,
                window: quarterPeriod.periodId
            }
        },
        clocks: {
            statementCutoff: quarterPeriod.end,
            modelCutoff: acceptedScenario.historicalCutoff,
            briefCutoff: prior.manifest.sourceCutoff,
            marketCutoff: null,
            retrievalCutoff: submissionsSource.clocks.retrievedAt
        },
        coverage: committedCoverage,
        changes: [],
        rankingPolicy: config.materialityPolicy.rules[0]
    });
    requireCondition(committedBrief.status === 'partial' && committedBrief.materialChanges.length === 0 && committedBrief.modelImpactProposals.length === 0, 'C010-BRIEF-SCHEMA', 'the committed source-bounded brief must be partial with no fabricated material change or proposal');
    const committedBriefRef = objectRef(committedBrief.briefId, committedBrief);
    const appendedHistory = company.appendAdaptiveBriefHistory({ history: Array.isArray(history.entries) ? history.entries : [], brief: committedBrief });
    history.entries = appendedHistory.history;

    // The committed owner read is PRODUCED by the production buildFundamentalsToolRead projector from the non-owner-read
    // parts of the accepted generation (dependency results + periods), and carries the nested model pack ref so the whole
    // publication graph reaches it. It is therefore recomputable and drift-rejectable by the default validation path.
    const preliminaryAccepted = {
        contractVersion: 'company-accepted-state/v1',
        companyId: prior.manifest.companyId,
        publicationId: prior.manifest.publicationId,
        generation: prior.manifest.generation,
        periods: periodObjects,
        dependencyResults: preliminaryDependencyResults,
        sources: [submissionsSource, companyFactsSource],
        conflicts: structuredClone(dossier.conflicts),
        modelPack,
        brief: committedBrief
    };
    const ownerRead = company.buildFundamentalsToolRead({ accepted: preliminaryAccepted, readId: prior.manifest.ownerReadRef.objectId, modelPackRef, briefRef: committedBriefRef });

    const objects = {};
    objects[prior.manifest.identityRef.objectId] = identity;
    objects[prior.manifest.summaryRef.objectId] = summary;
    objects[prior.manifest.dossierRef.objectId] = dossier;
    objects[prior.manifest.ownerReadRef.objectId] = ownerRead;
    objects[prior.manifest.historyRefs[0].objectId] = history;
    objects[committedBrief.briefId] = committedBrief;
    objects[submissionsSource.sourceId] = submissionsSource;
    objects[companyFactsSource.sourceId] = companyFactsSource;
    objects[modelPack.modelPackId] = modelPack;
    periodObjects.forEach((period) => { objects[period.periodId] = period; });

    const manifest = structuredClone(prior.manifest);
    manifest.configFingerprint = company.companyObjectSha256(config);
    manifest.identityRef = objectRef(prior.manifest.identityRef.objectId, identity);
    manifest.summaryRef = objectRef(prior.manifest.summaryRef.objectId, summary);
    manifest.dossierRef = objectRef(prior.manifest.dossierRef.objectId, dossier);
    manifest.ownerReadRef = objectRef(prior.manifest.ownerReadRef.objectId, ownerRead);
    manifest.modelPackRef = modelPackRef;
    manifest.briefRef = committedBriefRef;
    manifest.sourceRefs = [objectRef(submissionsSource.sourceId, submissionsSource), objectRef(companyFactsSource.sourceId, companyFactsSource)];
    manifest.historyRefs = [objectRef(prior.manifest.historyRefs[0].objectId, history)];
    manifest.manifestSha256 = company.companyManifestSha256(manifest);

    const graphValidation = company.validatePublicationGraph(manifest, objects);
    requireCondition(graphValidation.ok, 'C010-PUBLICATION-SCHEMA', JSON.stringify(graphValidation.errors));
    const accepted = company.projectAcceptedPublication(manifest, objects);
    requireCondition(
        accepted.periods[0].accession === normalized.latestQuarterlyFiling.accessionNumber
        && accepted.periods.length === 4
        && accepted.periods.map(({ kind }) => kind).join(',') === 'quarter,annual,year-to-date,instant',
        'C010-PERIOD-SCHEMA',
        'materialized multi-period accepted state diverges from the retained filing set'
    );

    const objectDirectory = new URL('../data/company-fundamentals/objects/', import.meta.url);
    const pointerDirectory = new URL('../data/company-fundamentals/companies/sec-cik-0000789019/', import.meta.url);
    await mkdir(objectDirectory, { recursive: true });
    await mkdir(pointerDirectory, { recursive: true });
    const newPaths = new Set();
    for (const [objectId, value] of Object.entries(objects)) {
        const ref = objectRef(objectId, value);
        newPaths.add(await writeImmutablePublicationObject(value, ref.sha256));
    }
    const manifestPath = `data/company-fundamentals/objects/${manifest.manifestSha256.slice(7)}.json`;
    try {
        const existingManifest = JSON.parse(await readFile(new URL(manifestPath, repoRootUrl), 'utf8'));
        requireCondition(company.companyManifestSha256(existingManifest) === manifest.manifestSha256, 'C010-PUBLICATION-HASH', `manifest path collision: ${manifestPath}`);
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        await writeFile(new URL(manifestPath, repoRootUrl), `${JSON.stringify(manifest, null, 4)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o644 });
    }
    newPaths.add(manifestPath);

    const pointer = {
        contractVersion: 'company-current-pointer/v1',
        companyId: manifest.companyId,
        generation: manifest.generation,
        publicationId: manifest.publicationId,
        manifestPath,
        manifestSha256: manifest.manifestSha256,
        selectedAt: sourceCapture.retrievedAt
    };
    company.validateCompanyCurrentPointer(pointer, manifest.companyId);
    const stagedPointerUrl = new URL(`.current-${process.pid}-${Date.now()}.json`, pointerDirectory);
    await writeFile(stagedPointerUrl, `${JSON.stringify(pointer, null, 4)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o644 });
    await rename(stagedPointerUrl, new URL(currentPointerPath, repoRootUrl));

    const oldPaths = new Set([prior.pointer.manifestPath]);
    prior.refsById.forEach(({ path }) => oldPaths.add(path));
    let removedObjectCount = 0;
    for (const path of oldPaths) {
        if (newPaths.has(path)) continue;
        requireCondition(/^data\/company-fundamentals\/objects\/[a-f0-9]{64}\.json$/.test(path), 'C010-PUBLICATION-REF', `refusing to remove non-object path: ${path}`);
        await rm(new URL(path, repoRootUrl), { force: true });
        removedObjectCount += 1;
    }

    lines.push(`[company-fundamentals] rebuild config fingerprint: ${manifest.configFingerprint}`);
    lines.push(`[company-fundamentals] rebuild reporting periods: ${accepted.periods.map(({ periodId, kind }) => `${periodId}:${kind}`).join(', ')}`);
    lines.push(`[company-fundamentals] rebuild model pack: ${modelPack.modelPackId} (${modelPack.modelDefinition.nodes.length} nodes, scenario ${acceptedScenario.scenarioRevisionId})`);
    lines.push(`[company-fundamentals] rebuild model pack ref: ${manifest.modelPackRef.sha256}`);
    lines.push(`[company-fundamentals] rebuild adaptive brief: ${committedBrief.briefId} (${committedBrief.status}, ${committedBrief.materialChanges.length} material changes, ${committedBrief.modelImpactProposals.length} proposals)`);
    lines.push(`[company-fundamentals] rebuild adaptive brief ref: ${manifest.briefRef.sha256}`);
    lines.push(`[company-fundamentals] rebuild brief history: ${history.entries.length} semantic event(s); appended=${appendedHistory.appended}`);
    lines.push(`[company-fundamentals] rebuild immutable objects: ${Object.keys(objects).length}`);
    lines.push(`[company-fundamentals] rebuild manifest hash: ${manifest.manifestSha256}`);
    lines.push(`[company-fundamentals] rebuild obsolete objects removed: ${removedObjectCount}`);
    lines.push('[company-fundamentals] rebuild pointer: replaced last');
    lines.push('[company-fundamentals] rebuild result: PASS');
    return { ok: true, lines, manifestSha256: manifest.manifestSha256, objectCount: Object.keys(objects).length, removedObjectCount };
}

// Generic exact-bytes capture for an overlay issuer (CMG/JPM) and one source kind (submissions or
// company facts). It reuses the same SEC etiquette, redirect rejection, byte/timeout bounds, and
// production parser acceptance the MSFT foundation uses, then retains the exact response bytes plus a
// provenance extract. Building the publication is a separate, network-free step.
async function captureOverlaySecArtifact(companyId, sourceKind) {
    const lines = [];
    const issuer = overlayIssuers[companyId];
    requireCondition(Boolean(issuer), 'C010-CLI', `unknown overlay issuer: ${companyId}`);
    requireCondition(sourceKind === 'sec-submissions' || sourceKind === 'sec-companyfacts', 'C010-CLI', `unknown SEC source kind: ${sourceKind}`);
    const config = JSON.parse(await readFile(configUrl, 'utf8'));
    const configValidation = company.validateCompanyConfig(config);
    requireCondition(configValidation.ok, 'C010-CONFIG-SCHEMA', JSON.stringify(configValidation.errors));

    const configuredCompany = config.companies.find(({ companyId: id }) => id === companyId);
    const sourceId = sourceKind === 'sec-submissions' ? issuer.submissionsSourceId : issuer.companyFactsSourceId;
    const configuredSource = config.sources.find(({ sourceId: id }) => id === sourceId);
    requireCondition(configuredCompany && configuredSource, 'C010-CONFIG-REFERENCE', `configured ${companyId} ${sourceKind} source is required`);
    const expectedPath = sourceKind === 'sec-submissions'
        ? `/submissions/CIK${configuredCompany.cik}.json`
        : `/api/xbrl/companyfacts/CIK${configuredCompany.cik}.json`;
    const sourceUrl = new URL(configuredSource.pathPattern, config.sec.baseUrl);
    requireCondition(
        sourceUrl.protocol === 'https:' && sourceUrl.hostname === 'data.sec.gov'
        && sourceUrl.username === '' && sourceUrl.password === '' && sourceUrl.search === '' && sourceUrl.hash === ''
        && sourceUrl.pathname === expectedPath,
        'C010-SOURCE-ALLOWLIST',
        'capture URL is outside the exact configured SEC allowlist'
    );

    const userAgent = process.env.SEC_USER_AGENT;
    requireCondition(
        typeof userAgent === 'string' && userAgent.trim().length > 0 && /\S+@\S+\.\S+/.test(userAgent) && !/noreply/i.test(userAgent),
        'C010-SOURCE-IDENTITY',
        'SEC_USER_AGENT must contain a contactable process-only identity'
    );

    const requestPolicy = config.sec.request;
    let response = null;
    let attemptsUsed = 0;
    for (let attempt = 1; attempt <= requestPolicy.maxAttempts; attempt += 1) {
        await wait(requestPolicy.minIntervalMs);
        attemptsUsed = attempt;
        response = await requestSecResponse(sourceUrl, requestPolicy, userAgent);
        requireCondition(response.status < 300 || response.status >= 400, 'C010-SOURCE-REDIRECT', 'SEC redirects are forbidden');
        if (!requestPolicy.retryableStatuses.includes(response.status) || attempt === requestPolicy.maxAttempts) break;
    }
    requireCondition(response && response.status === 200, 'C010-SOURCE-HTTP', `SEC request returned status ${response?.status || 0}`);
    requireCondition(/^application\/json(?:;|$)/i.test(response.mediaType || ''), 'C010-SOURCE-MEDIA', 'SEC response media type must be application/json');
    const rawText = response.body.toString('utf8');
    requireCondition(Buffer.from(rawText, 'utf8').equals(response.body), 'C010-SOURCE-ENCODING', 'SEC response must be exact UTF-8 JSON bytes');

    const provenance = {
        sourceUrl: sourceUrl.href,
        cik: configuredCompany.cik,
        retrievedAt: response.completedAt,
        mediaType: response.mediaType,
        rights: configuredSource.rights,
        requestIdentityPolicy: 'sec-user-agent-required/v1'
    };

    let contentSha256;
    const extra = {};
    if (sourceKind === 'sec-submissions') {
        const normalized = company.parseSecSubmissionsResponse(rawText, provenance);
        contentSha256 = normalized.contentSha256;
        extra.issuerName = normalized.issuerName;
        extra.latestQuarterlyFiling = normalized.latestQuarterlyFiling.accessionNumber;
    } else {
        const normalized = company.parseSecCompanyFactsResponse(rawText, provenance, issuer.conceptRequests);
        contentSha256 = normalized.contentSha256;
        extra.entityName = normalized.entityName;
        extra.anchor = normalized.anchor;
        extra.resolvedConcepts = normalized.observations.filter((observation) => observation.available).map((observation) => observation.sourceConcept);
        extra.unavailableConcepts = normalized.observations.filter((observation) => !observation.available).map((observation) => observation.sourceConcept);
    }

    const paths = sourceKind === 'sec-submissions' ? overlaySubmissionsFixturePaths(issuer) : overlayCompanyFactsFixturePaths(issuer);
    const metadata = {
        contractVersion: 'company-source-capture/v1',
        sourceKind,
        sourceUrl: provenance.sourceUrl,
        cik: provenance.cik,
        requestStartedAt: response.startedAt,
        retrievedAt: provenance.retrievedAt,
        mediaType: provenance.mediaType,
        rights: provenance.rights,
        requestIdentityPolicy: provenance.requestIdentityPolicy,
        httpStatus: response.status,
        contentSha256,
        byteLength: response.body.length,
        completeResponse: true,
        payloadPath: paths.payload,
        payloadEncoding: 'gzip+base64',
        ...extra
    };

    const extractUrl = new URL(`../${paths.extract}`, import.meta.url);
    const payloadUrl = new URL(`../${paths.payload}`, import.meta.url);
    const stagingParent = dirname(fileURLToPath(extractUrl));
    await mkdir(stagingParent, { recursive: true });
    const stagingDirectory = await mkdtemp(join(stagingParent, '.capture-stage-'));
    try {
        const stagedMetadataPath = join(stagingDirectory, 'capture.json');
        const stagedPayloadPath = join(stagingDirectory, 'payload.gz.b64');
        await writeFile(stagedPayloadPath, `${gzipSync(response.body, { level: 9, mtime: 0 }).toString('base64')}\n`, { encoding: 'ascii', mode: 0o644 });
        await writeFile(stagedMetadataPath, `${JSON.stringify(metadata, null, 4)}\n`, { encoding: 'utf8', mode: 0o644 });
        await rename(stagedPayloadPath, payloadUrl);
        await rename(stagedMetadataPath, extractUrl);
    } finally {
        await rm(stagingDirectory, { recursive: true, force: true });
    }

    lines.push('[company-fundamentals] capture identity: usable process-only value withheld');
    lines.push(`[company-fundamentals] capture issuer: ${companyId}`);
    lines.push(`[company-fundamentals] capture source kind: ${sourceKind}`);
    lines.push(`[company-fundamentals] capture source: ${sourceUrl.href}`);
    lines.push('[company-fundamentals] capture redirect policy: reject');
    lines.push(`[company-fundamentals] capture attempts used: ${attemptsUsed}`);
    lines.push(`[company-fundamentals] capture HTTP status: ${response.status}`);
    lines.push(`[company-fundamentals] capture media type: ${response.mediaType}`);
    lines.push(`[company-fundamentals] capture bytes: ${response.body.length}`);
    lines.push(`[company-fundamentals] capture content hash: ${contentSha256}`);
    if (sourceKind === 'sec-companyfacts') {
        lines.push(`[company-fundamentals] capture anchor: ${extra.anchor.sourceConcept} @ ${extra.anchor.end} (${extra.anchor.form} ${extra.anchor.accn})`);
        lines.push(`[company-fundamentals] capture resolved concepts: ${extra.resolvedConcepts.join(', ') || '(none)'}`);
        lines.push(`[company-fundamentals] capture unavailable concepts: ${extra.unavailableConcepts.join(', ') || '(none)'}`);
    } else {
        lines.push(`[company-fundamentals] capture latest quarterly filing: ${extra.latestQuarterlyFiling}`);
    }
    lines.push('[company-fundamentals] capture parser: production SEC parser accepted exact bytes');
    lines.push(`[company-fundamentals] capture metadata: ${paths.extract}`);
    lines.push(`[company-fundamentals] capture payload: ${paths.payload}`);
    lines.push('[company-fundamentals] capture result: PASS');
    return { ok: true, lines, metadata };
}

// Build a REAL source-qualified overlay publication (CMG/JPM) from the retained SEC bytes. Identity and
// filing clocks come from the retained SEC Submissions response; the source-qualified balance-sheet
// observations come from the retained SEC Company Facts (XBRL) response, all read at one coherent annual
// reporting date. No value is invented: a concept the issuer does not tag resolves to an explicit
// unavailable observation. The build is network-free and deterministic, so the committed publication is
// exactly reproducible from the retained bytes.
async function buildOverlayPublicationFromRetained(companyId) {
    const lines = [];
    const issuer = overlayIssuers[companyId];
    requireCondition(Boolean(issuer), 'C010-CLI', `unknown overlay issuer: ${companyId}`);
    const config = JSON.parse(await readFile(configUrl, 'utf8'));
    const configValidation = company.validateCompanyConfig(config);
    requireCondition(configValidation.ok, 'C010-CONFIG-SCHEMA', JSON.stringify(configValidation.errors));
    const configuredCompany = config.companies.find(({ companyId: id }) => id === companyId);
    const submissionsSourceCfg = config.sources.find(({ sourceId }) => sourceId === issuer.submissionsSourceId);
    const companyFactsSourceCfg = config.sources.find(({ sourceId }) => sourceId === issuer.companyFactsSourceId);
    requireCondition(configuredCompany && submissionsSourceCfg && companyFactsSourceCfg, 'C010-CONFIG-REFERENCE', 'overlay issuer config is incomplete');
    const archetypeAssignment = config.archetypes.assignments.find((assignment) => assignment.companyId === companyId && assignment.status === 'accepted');
    requireCondition(Boolean(archetypeAssignment), 'C010-CONFIG-REFERENCE', 'overlay issuer requires one accepted archetype assignment');

    async function readRetained(paths) {
        const capture = JSON.parse(await readFile(new URL(`../${paths.extract}`, import.meta.url), 'utf8'));
        const compressed = await readFile(new URL(`../${paths.payload}`, import.meta.url), 'utf8');
        const bytes = gunzipSync(Buffer.from(compressed, 'base64'));
        const rawText = bytes.toString('utf8');
        const hash = `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
        requireCondition(hash === capture.contentSha256, 'C010-PUBLICATION-HASH', `retained bytes at ${paths.payload} do not match provenance hash`);
        return { capture, rawText };
    }

    const subPaths = overlaySubmissionsFixturePaths(issuer);
    const cfPaths = overlayCompanyFactsFixturePaths(issuer);
    const { capture: subCapture, rawText: subRawText } = await readRetained(subPaths);
    const { capture: cfCapture, rawText: cfRawText } = await readRetained(cfPaths);

    const subNormalized = company.parseSecSubmissionsResponse(subRawText, {
        sourceUrl: subCapture.sourceUrl, cik: subCapture.cik, retrievedAt: subCapture.retrievedAt,
        mediaType: subCapture.mediaType, rights: subCapture.rights, requestIdentityPolicy: subCapture.requestIdentityPolicy
    });
    const cfNormalized = company.parseSecCompanyFactsResponse(cfRawText, {
        sourceUrl: cfCapture.sourceUrl, cik: cfCapture.cik, retrievedAt: cfCapture.retrievedAt,
        mediaType: cfCapture.mediaType, rights: cfCapture.rights, requestIdentityPolicy: cfCapture.requestIdentityPolicy
    }, issuer.conceptRequests);
    const anchor = cfNormalized.anchor;

    // Cross-reference the anchor 10-K filing in the SEC Submissions response for the real acceptance clock.
    const rawSubmissions = JSON.parse(subRawText);
    const recent = rawSubmissions.filings.recent;
    const annualIndex = recent.accessionNumber.findIndex((accn) => accn === anchor.accn);
    requireCondition(annualIndex !== -1, 'C010-SOURCE-SCHEMA', 'the SEC Submissions response does not list the SEC Company Facts anchor 10-K filing');
    const annualFiling = {
        accession: recent.accessionNumber[annualIndex],
        reportDate: recent.reportDate[annualIndex],
        acceptanceDateTime: recent.acceptanceDateTime[annualIndex],
        form: recent.form[annualIndex]
    };
    requireCondition(
        annualFiling.reportDate === anchor.end && (annualFiling.form === '10-K' || annualFiling.form === '10-K/A'),
        'C010-PERIOD-SCHEMA',
        'the anchor 10-K report date is incoherent between SEC Submissions and SEC Company Facts'
    );

    const publicationId = `company-publication-${companyId}-g1`;
    const daysBetween = (startIso, endIso) => Math.round((Date.parse(`${endIso}T00:00:00Z`) - Date.parse(`${startIso}T00:00:00Z`)) / 86400000);
    const fiscalYearStart = () => { const date = new Date(`${anchor.end}T00:00:00Z`); date.setUTCFullYear(date.getUTCFullYear() - 1); date.setUTCDate(date.getUTCDate() + 1); return date.toISOString().slice(0, 10); };
    const annualStart = fiscalYearStart();
    const fiscalYear = Number(anchor.end.slice(0, 4));

    const submissionsSourceId = `source-sec-submissions-${issuer.key}-${subCapture.retrievedAt.slice(0, 10).replaceAll('-', '')}`;
    const companyFactsSourceId = `source-sec-companyfacts-${issuer.key}-${cfCapture.retrievedAt.slice(0, 10).replaceAll('-', '')}`;
    const identityObjectId = `identity-${issuer.key}`;
    const annualPeriodId = `period-${issuer.key}-fy${fiscalYear}-annual`;
    const dossierId = `dossier-${issuer.key}-overlay-g1`;
    const summaryId = `summary-${issuer.key}-overlay-g1`;
    const ownerReadId = `owner-read-${issuer.key}-overlay-g1`;
    const historyId = `history-${issuer.key}-overlay-g1`;

    const submissionsClocks = {
        reportingPeriodEnd: anchor.end,
        sourcePublishedAt: annualFiling.acceptanceDateTime,
        acceptedAt: annualFiling.acceptanceDateTime,
        retrievedAt: subCapture.retrievedAt,
        observedAt: null
    };
    const companyFactsClocks = {
        reportingPeriodEnd: anchor.end,
        sourcePublishedAt: annualFiling.acceptanceDateTime,
        acceptedAt: annualFiling.acceptanceDateTime,
        retrievedAt: cfCapture.retrievedAt,
        observedAt: null
    };

    const unavailableConcepts = cfNormalized.observations.filter((observation) => !observation.available);
    const submissionsSource = {
        contractVersion: 'source-artifact/v1',
        sourceId: submissionsSourceId,
        companyId,
        sourceKind: 'sec-submissions',
        url: subCapture.sourceUrl,
        documentId: `CIK${configuredCompany.cik}-submissions`,
        clocks: submissionsClocks,
        contentSha256: subCapture.contentSha256,
        rights: submissionsSourceCfg.rights,
        availability: 'available',
        limitations: [
            'Exact raw SEC Submissions response bytes retained and verified through the production SEC Submissions parser.',
            'SEC Submissions proves issuer identity and the anchor 10-K filing metadata; the balance-sheet observations are read from the retained SEC Company Facts response.'
        ]
    };
    const companyFactsSource = {
        contractVersion: 'source-artifact/v1',
        sourceId: companyFactsSourceId,
        companyId,
        sourceKind: 'sec-companyfacts',
        url: cfCapture.sourceUrl,
        documentId: `CIK${configuredCompany.cik}-companyfacts`,
        clocks: companyFactsClocks,
        contentSha256: cfCapture.contentSha256,
        rights: companyFactsSourceCfg.rights,
        availability: 'available',
        limitations: [
            'Exact raw SEC Company Facts (XBRL) response bytes retained and verified through the production SEC Company Facts parser.',
            unavailableConcepts.length
                ? `Concepts the issuer does not tag in its US-GAAP XBRL response remain explicitly unavailable rather than substituted: ${unavailableConcepts.map((observation) => observation.sourceConcept).join(', ')}.`
                : 'Every requested balance-sheet concept resolved from the retained response at the anchor reporting date.'
        ]
    };
    const submissionsSourceRef = objectRef(submissionsSourceId, submissionsSource);
    const companyFactsSourceRef = objectRef(companyFactsSourceId, companyFactsSource);

    const identity = {
        contractVersion: 'company-identity/v1',
        companyId,
        issuerName: subNormalized.issuerName,
        ticker: subNormalized.tickers[0],
        exchange: subNormalized.exchanges[0],
        securityName: configuredCompany.securityName,
        cik: subNormalized.cik,
        reportingCurrency: configuredCompany.reportingCurrency,
        fiscalYearEnd: subNormalized.fiscalYearEnd,
        accountingBasis: configuredCompany.accountingBasis,
        identitySourceRefs: [submissionsSourceRef],
        continuity: {
            state: 'continuous',
            decision: 'accepted',
            predecessorCompanyIds: [],
            rationale: 'The production-normalized SEC CIK, issuer name, ticker, and exchange identify one filing entity and common-stock listing.'
        },
        status: 'verified'
    };
    const identityRef = objectRef(identityObjectId, identity);

    const annualPeriod = {
        contractVersion: 'reporting-period/v1',
        periodId: annualPeriodId,
        kind: 'annual',
        start: annualStart,
        end: anchor.end,
        durationDays: daysBetween(annualStart, anchor.end),
        fiscalYear,
        fiscalQuarter: null,
        form: '10-K',
        accession: anchor.accn,
        filedAt: annualFiling.acceptanceDateTime,
        amendmentState: 'original',
        comparability: 'comparable',
        qualifications: ['Real SEC 10-K annual balance-sheet reporting date; the source-qualified balance-sheet observations are read at this exact reported date.']
    };
    const annualPeriodRef = objectRef(annualPeriodId, annualPeriod);

    const issuerNameObservation = {
        contractVersion: 'fact-observation/v1',
        observationId: `obs-${issuer.key}-issuer-name`,
        companyId,
        evidenceClass: 'reported',
        sourceRef: submissionsSourceRef,
        periodRef: null,
        sourceConcept: 'sec-submissions:name',
        value: subNormalized.issuerName,
        valueType: 'string',
        unit: 'entity-name',
        currency: null,
        decimals: null,
        signConvention: 'not-applicable',
        state: 'current',
        clocks: submissionsClocks,
        definition: 'SEC filing entity name normalized from the exact captured submissions response.',
        qualifiers: ['Identity observation; not a financial statement amount.']
    };
    const balanceObservations = cfNormalized.observations.map((observation) => ({
        contractVersion: 'fact-observation/v1',
        observationId: `obs-${issuer.key}-${observation.normalizedConcept}`,
        companyId,
        evidenceClass: 'reported',
        sourceRef: companyFactsSourceRef,
        periodRef: annualPeriodRef,
        sourceConcept: observation.sourceConcept,
        value: observation.available ? observation.value : null,
        valueType: observation.valueType,
        unit: observation.unit,
        currency: observation.unit === 'USD' ? 'USD' : null,
        decimals: null,
        signConvention: observation.available ? 'as-reported' : 'not-applicable',
        state: observation.available ? 'current' : 'unavailable',
        clocks: {
            reportingPeriodEnd: anchor.end,
            sourcePublishedAt: observation.available ? annualFiling.acceptanceDateTime : null,
            acceptedAt: observation.available ? annualFiling.acceptanceDateTime : null,
            retrievedAt: observation.available ? cfCapture.retrievedAt : null,
            observedAt: null
        },
        definition: observation.available
            ? `Source-qualified ${observation.normalizedConcept} read from the retained SEC Company Facts response (${observation.sourceConcept}) at the ${observation.end} reporting date.`
            : `The issuer does not tag ${observation.sourceConcept} in its US-GAAP XBRL response; this concept is explicitly unavailable rather than substituted.`,
        qualifiers: observation.available
            ? [`Reported ${observation.form} value under ${observation.sourceConcept}; accession ${observation.accn}.`]
            : ['No source-qualified observation is published for this concept.']
    }));
    const observations = [issuerNameObservation, ...balanceObservations];

    const equityObservation = balanceObservations.find((observation) => observation.observationId === `obs-${issuer.key}-stockholders-equity`);
    const liabilitiesObservation = balanceObservations.find((observation) => observation.observationId === `obs-${issuer.key}-total-liabilities`);
    const dependencyGraph = {
        nodes: [
            { id: 'fact-issuer-name', kind: 'fact', state: 'available', value: subNormalized.issuerName },
            { id: 'fact-stockholders-equity', kind: 'fact', state: equityObservation && equityObservation.state === 'current' ? 'available' : 'unavailable', value: equityObservation && equityObservation.state === 'current' ? equityObservation.value : null },
            { id: 'fact-total-liabilities', kind: 'fact', state: liabilitiesObservation && liabilitiesObservation.state === 'current' ? 'available' : 'unavailable', value: liabilitiesObservation && liabilitiesObservation.state === 'current' ? liabilitiesObservation.value : null },
            { id: 'metric-liabilities-to-equity', kind: 'metric', state: 'available', value: 'raw-leverage-available-through-overlay' },
            { id: 'identity-summary', kind: 'projection', state: 'available', value: `${subNormalized.issuerName} | ${subNormalized.tickers[0]}` }
        ],
        edges: [
            { from: 'fact-issuer-name', to: 'identity-summary' },
            { from: 'fact-total-liabilities', to: 'metric-liabilities-to-equity' },
            { from: 'fact-stockholders-equity', to: 'metric-liabilities-to-equity' }
        ]
    };

    const reportedCurrentCount = observations.filter((observation) => observation.state === 'current').length;
    const reportedUnavailableCount = observations.filter((observation) => observation.state === 'unavailable').length;
    const unavailableLinks = unavailableConcepts.map((observation) => ({
        unavailableLinkId: `unavailable-${issuer.key}-${observation.normalizedConcept}`,
        concept: observation.normalizedConcept,
        requiredSourceId: companyFactsSourceId,
        sourceConcept: observation.sourceConcept,
        periodId: annualPeriodId,
        reason: `The issuer does not tag ${observation.sourceConcept} in its US-GAAP XBRL response for the ${anchor.end} reporting date; the concept stays explicitly unavailable.`
    }));

    const dossier = {
        contractVersion: 'company-dossier/v1',
        dossierId,
        publicationId,
        generation: 1,
        companyId,
        evidenceCutoff: annualFiling.acceptanceDateTime,
        identityRef,
        periodRefs: [annualPeriodRef],
        sourceRefs: [submissionsSourceRef, companyFactsSourceRef],
        observations,
        normalizedFacts: [],
        mappings: [],
        formulas: [],
        claims: [],
        consumers: [],
        dependencyGraph,
        evidenceCoverage: [{
            evidenceClass: 'reported',
            state: 'partial',
            currentCount: reportedCurrentCount,
            unavailableCount: reportedUnavailableCount,
            cutoff: annualFiling.acceptanceDateTime,
            explanation: 'Source-qualified SEC Company Facts balance-sheet observations are present at the anchor annual reporting date; concepts the issuer does not tag stay explicitly unavailable.'
        }],
        restatements: [{ restatementId: 'restatement-status', state: 'none-recorded', observationIds: [], explanation: 'Each balance-sheet observation is the latest-filed value at the anchor reporting date; no restatement conclusion is recorded.' }],
        conflicts: [{ conflictId: 'conflict-status', state: 'none-recorded', observationIds: [], explanation: 'No competing eligible observation was captured for the same concept and period.' }],
        unavailableLinks,
        validation: { status: 'validated', checks: ['company identity', 'source rights and clocks', 'period identity', 'source-qualified balance-sheet observations', 'explicit unavailable concepts'] }
    };
    const dossierRef = objectRef(dossierId, dossier);

    const summary = {
        contractVersion: 'company-dossier-summary/v1',
        summaryId,
        publicationId,
        generation: 1,
        companyId,
        evidenceCutoff: annualFiling.acceptanceDateTime,
        direction: { state: 'unavailable', label: 'Unavailable', reason: 'Fundamental direction is not evaluated for a balance-sheet resilience overlay publication.', missingFactIds: [] },
        independentFacts: [{ factId: 'fact-issuer-name', label: 'SEC filing entity', value: subNormalized.issuerName, state: 'current' }]
    };
    const summaryRef = objectRef(summaryId, summary);

    const ownerRead = {
        contractVersion: 'fundamentals-tool-read/v1',
        readId: ownerReadId,
        publicationId,
        generation: 1,
        companyId,
        status: 'partial',
        statementCutoff: anchor.end,
        modelCutoff: null,
        briefCutoff: null,
        marketCutoff: null,
        retrievalCutoff: cfCapture.retrievedAt,
        direction: 'Unavailable',
        missingFactIds: [],
        archetypeId: archetypeAssignment.primaryArchetypeId,
        coverage: company.EVIDENCE_CLASSES.map((evidenceClass) => (
            evidenceClass === 'reported'
                ? { evidenceClass, state: 'partial', cutoff: anchor.end, requiredUpdate: 'Additional source-qualified statement observations beyond the retained balance-sheet set.' }
                : { evidenceClass, state: 'unavailable', cutoff: null, requiredUpdate: `A source-qualified ${evidenceClass} observation.` }
        )),
        limitations: [
            'The overlay publication carries source-qualified balance-sheet observations for the resilience archetype read; it does not publish a model or brief.',
            'No recommendation or confident substitute is published.'
        ],
        sourceLinks: [
            { sourceId: submissionsSourceId, url: subCapture.sourceUrl, rights: submissionsSourceCfg.rights, clocks: submissionsClocks },
            { sourceId: companyFactsSourceId, url: cfCapture.sourceUrl, rights: companyFactsSourceCfg.rights, clocks: companyFactsClocks }
        ],
        confidenceBand: 'constrained',
        recommendationEligibility: { eligible: false, reason: 'A balance-sheet overlay publication never emits an owner recommendation.' }
    };
    const ownerReadRef = objectRef(ownerReadId, ownerRead);

    const history = {
        contractVersion: 'company-history-index/v1',
        historyId,
        publicationId,
        generation: 1,
        companyId,
        entries: []
    };
    const historyRef = objectRef(historyId, history);

    const priorPublication = await loadCurrentPublicationFor(companyId).catch(() => null);
    const manifest = {
        contractVersion: 'company-publication-manifest/v1',
        publicationId,
        generation: 1,
        companyId,
        createdAt: cfCapture.retrievedAt,
        sourceCutoff: annualFiling.acceptanceDateTime,
        configFingerprint: company.companyObjectSha256(config),
        policyVersions: {
            config: 'company-config-policy/v1',
            identity: 'company-identity-policy/v1',
            period: 'reporting-period-policy/v1',
            mapping: 'concept-mapping-policy/v1',
            dependency: 'dependency-propagation-policy/v1',
            publication: 'company-publication-policy/v1',
            rights: 'public-evidence-rights-policy/v1'
        },
        identityRef,
        summaryRef,
        dossierRef,
        modelPackRef: null,
        briefRef: null,
        ownerReadRef,
        sourceRefs: [submissionsSourceRef, companyFactsSourceRef],
        historyRefs: [historyRef],
        validation: {
            status: 'validated',
            checks: [
                'complete reachable object graph',
                'canonical object hashes',
                'source-qualified balance-sheet observations',
                'explicit unavailable concepts',
                'issuer isolation from the shared foundation'
            ]
        },
        manifestSha256: 'sha256:0000000000000000000000000000000000000000000000000000000000000000'
    };
    manifest.manifestSha256 = company.companyManifestSha256(manifest);

    const objects = {
        [submissionsSourceId]: submissionsSource,
        [companyFactsSourceId]: companyFactsSource,
        [identityObjectId]: identity,
        [annualPeriodId]: annualPeriod,
        [dossierId]: dossier,
        [summaryId]: summary,
        [ownerReadId]: ownerRead,
        [historyId]: history
    };

    const graphValidation = company.validatePublicationGraph(manifest, objects);
    requireCondition(graphValidation.ok, 'C010-PUBLICATION-SCHEMA', JSON.stringify(graphValidation.errors));
    const accepted = company.projectAcceptedPublication(manifest, objects);
    requireCondition(
        accepted.identity.issuerName === subNormalized.issuerName && accepted.identity.cik === configuredCompany.cik && accepted.periods.length === 1 && accepted.periods[0].accession === anchor.accn,
        'C010-IDENTITY-CONFLICT',
        'materialized overlay accepted state diverges from the retained SEC responses'
    );

    const objectDirectory = new URL('../data/company-fundamentals/objects/', import.meta.url);
    const pointerDirectory = new URL(`../data/company-fundamentals/companies/${companyId}/`, import.meta.url);
    await mkdir(objectDirectory, { recursive: true });
    await mkdir(pointerDirectory, { recursive: true });
    const newPaths = new Set();
    for (const [objectId, value] of Object.entries(objects)) {
        const ref = objectRef(objectId, value);
        newPaths.add(await writeImmutablePublicationObject(value, ref.sha256));
    }
    newPaths.add(await writeImmutablePublicationObject(manifest, manifest.manifestSha256));

    const pointer = {
        contractVersion: 'company-current-pointer/v1',
        companyId,
        generation: manifest.generation,
        publicationId: manifest.publicationId,
        manifestPath: `data/company-fundamentals/objects/${manifest.manifestSha256.slice(7)}.json`,
        manifestSha256: manifest.manifestSha256,
        selectedAt: cfCapture.retrievedAt
    };
    company.validateCompanyCurrentPointer(pointer, companyId);
    const stagedPointerUrl = new URL(`.current-${process.pid}-${Date.now()}.json`, pointerDirectory);
    await writeFile(stagedPointerUrl, `${JSON.stringify(pointer, null, 4)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o644 });
    await rename(stagedPointerUrl, new URL(overlayPointerPath(companyId), repoRootUrl));

    let removedObjectCount = 0;
    if (priorPublication && priorPublication.manifest.publicationId === publicationId) {
        const oldPaths = new Set([priorPublication.pointer.manifestPath]);
        priorPublication.refsById.forEach(({ path }) => oldPaths.add(path));
        for (const path of oldPaths) {
            if (newPaths.has(path)) continue;
            if (!/^data\/company-fundamentals\/objects\/[a-f0-9]{64}\.json$/.test(path)) continue;
            await rm(new URL(path, repoRootUrl), { force: true });
            removedObjectCount += 1;
        }
    }

    const resolved = cfNormalized.observations.filter((observation) => observation.available);
    lines.push(`[company-fundamentals] overlay issuer: ${companyId} (${subNormalized.issuerName})`);
    lines.push(`[company-fundamentals] overlay archetype: ${archetypeAssignment.primaryArchetypeId}`);
    lines.push(`[company-fundamentals] overlay anchor: ${anchor.sourceConcept} @ ${anchor.end} (${anchor.form} ${anchor.accn})`);
    resolved.forEach((observation) => lines.push(`[company-fundamentals] overlay reported: ${observation.normalizedConcept} = ${observation.value} ${observation.unit} (${observation.sourceConcept})`));
    unavailableConcepts.forEach((observation) => lines.push(`[company-fundamentals] overlay unavailable: ${observation.normalizedConcept} (${observation.sourceConcept}) — explicitly not tagged`));
    lines.push(`[company-fundamentals] overlay submissions source: ${submissionsSource.contentSha256}`);
    lines.push(`[company-fundamentals] overlay company-facts source: ${companyFactsSource.contentSha256}`);
    lines.push(`[company-fundamentals] overlay immutable objects: ${Object.keys(objects).length}`);
    lines.push(`[company-fundamentals] overlay manifest hash: ${manifest.manifestSha256}`);
    lines.push(`[company-fundamentals] overlay obsolete objects removed: ${removedObjectCount}`);
    lines.push('[company-fundamentals] overlay pointer: replaced last');
    lines.push('[company-fundamentals] overlay build result: PASS');
    return { ok: true, lines, manifestSha256: manifest.manifestSha256, objectCount: Object.keys(objects).length };
}

// Generic pointer loader for any company (the MSFT loadCurrentPublication is hardcoded to the foundation CIK).
async function loadCurrentPublicationFor(companyId) {
    const pointer = await readPublicationJson(overlayPointerPath(companyId));
    company.validateCompanyCurrentPointer(pointer, companyId);
    const manifest = await readPublicationJson(pointer.manifestPath);
    requireCondition(company.companyManifestSha256(manifest) === pointer.manifestSha256, 'C010-PUBLICATION-HASH', 'current pointer does not bind its manifest');
    const objects = {};
    const refs = [];
    const refsById = new Map();
    collectObjectRefs(manifest, refs);
    while (refs.length) {
        const ref = refs.shift();
        if (refsById.has(ref.objectId)) continue;
        refsById.set(ref.objectId, ref);
        const object = await readPublicationJson(ref.path);
        objects[ref.objectId] = object;
        collectObjectRefs(object, refs);
    }
    return { manifest, objects, pointer, refsById };
}

export async function validateCompanyFundamentalsFoundation() {
    const lines = [];
    const config = JSON.parse(await readFile(configUrl, 'utf8'));
    const sourceCapture = JSON.parse(await readFile(sourceCaptureUrl, 'utf8'));

    async function readPublicationJson(path) {
        requireCondition(company.isSafeRelativePath(path) && path.startsWith('data/company-fundamentals/'), 'C010-PUBLICATION-REF', `unsafe publication path: ${path}`);
        return JSON.parse(await readFile(new URL(path, repoRootUrl), 'utf8'));
    }

    function collectObjectRefs(value, refs) {
        if (value?.contractVersion === 'company-object-ref/v1') {
            refs.push(value);
            return;
        }
        if (Array.isArray(value)) value.forEach((entry) => collectObjectRefs(entry, refs));
        else if (value && typeof value === 'object') Object.values(value).forEach((entry) => collectObjectRefs(entry, refs));
    }

    lines.push('[company-fundamentals] config: parsed');
    const configValidation = company.validateCompanyConfig(config);
    requireCondition(configValidation.ok, 'C010-CONFIG-SCHEMA', JSON.stringify(configValidation.errors));
    lines.push('[company-fundamentals] config: contract valid');

    const configFingerprint = company.companyObjectSha256(config);
    lines.push('[company-fundamentals] config: canonical fingerprint calculated');

    requireCondition(sourceCapture.contractVersion === 'company-source-capture/v1', 'C010-SOURCE-SCHEMA', 'source capture contract is unknown');
    requireCondition(sourceCapture.completeResponse === true, 'C010-SOURCE-SCHEMA', 'source capture must retain the complete response');
    requireCondition(sourceCapture.sourceUrl === 'https://data.sec.gov/submissions/CIK0000789019.json', 'C010-SOURCE-SCHEMA', 'source capture URL is outside the configured SEC boundary');
    requireCondition(sourceCapture.payloadEncoding === 'gzip+base64' && company.isSafeRelativePath(sourceCapture.payloadPath), 'C010-SOURCE-SCHEMA', 'source capture payload encoding or path is invalid');
    const compressedPayload = await readFile(new URL(sourceCapture.payloadPath, repoRootUrl), 'utf8');
    const sourceBytes = gunzipSync(Buffer.from(compressedPayload, 'base64'));
    const sourceRawText = sourceBytes.toString('utf8');
    const sourceContentSha256 = `sha256:${createHash('sha256').update(sourceBytes).digest('hex')}`;
    requireCondition(sourceBytes.length === sourceCapture.byteLength, 'C010-SOURCE-SCHEMA', 'source capture byte length does not match provenance');
    requireCondition(sourceContentSha256 === sourceCapture.contentSha256, 'C010-PUBLICATION-HASH', 'source capture bytes do not match provenance hash');
    requireCondition(Buffer.from(sourceRawText, 'utf8').equals(sourceBytes), 'C010-SOURCE-SCHEMA', 'source capture is not valid UTF-8 JSON bytes');
    const normalizedSource = company.parseSecSubmissionsResponse(sourceRawText, {
        sourceUrl: sourceCapture.sourceUrl,
        cik: sourceCapture.cik,
        retrievedAt: sourceCapture.retrievedAt,
        mediaType: sourceCapture.mediaType,
        rights: sourceCapture.rights,
        requestIdentityPolicy: sourceCapture.requestIdentityPolicy
    });
    requireCondition(normalizedSource.contentSha256 === sourceContentSha256, 'C010-PUBLICATION-HASH', 'production parser content hash does not match captured bytes');
    lines.push(`[company-fundamentals] source capture: ${sourceBytes.length} exact raw SEC response bytes hash-valid`);
    lines.push('[company-fundamentals] source capture: production parser normalized issuer and filing identity');

    const currentPointer = await readPublicationJson(currentPointerPath);
    company.validateCompanyCurrentPointer(currentPointer, 'sec-cik-0000789019');
    lines.push('[company-fundamentals] current pointer: contract and content-addressed manifest path valid');

    const manifest = await readPublicationJson(currentPointer.manifestPath);
    requireCondition(company.companyManifestSha256(manifest) === currentPointer.manifestSha256, 'C010-PUBLICATION-HASH', 'current pointer does not bind the materialized manifest');
    requireCondition(manifest.configFingerprint === configFingerprint, 'C010-CONFIG-VERSION', 'materialized manifest config fingerprint does not match production config');
    lines.push('[company-fundamentals] manifest: pointer hash and config fingerprint valid');

    const objects = {};
    const refsById = new Map();
    const queue = [];
    collectObjectRefs(manifest, queue);
    while (queue.length) {
        const ref = queue.shift();
        const prior = refsById.get(ref.objectId);
        if (prior) {
            requireCondition(prior.path === ref.path && prior.sha256 === ref.sha256, 'C010-PUBLICATION-REF', `divergent ref for ${ref.objectId}`);
            continue;
        }
        refsById.set(ref.objectId, ref);
        const object = await readPublicationJson(ref.path);
        requireCondition(company.companyObjectSha256(object) === ref.sha256, 'C010-PUBLICATION-HASH', `materialized object hash mismatch: ${ref.objectId}`);
        objects[ref.objectId] = object;
        collectObjectRefs(object, queue);
    }
    lines.push(`[company-fundamentals] objects: ${Object.keys(objects).length} reachable immutable objects hash-valid`);

    const sourceArtifacts = Object.values(objects).filter((object) => (
        object.contractVersion === 'source-artifact/v1'
        && object.sourceKind === 'sec-submissions'
        && object.companyId === currentPointer.companyId
    ));
    requireCondition(sourceArtifacts.length === 1, 'C010-SOURCE-SCHEMA', 'publication must contain exactly one SEC Submissions source artifact');
    const [sourceArtifact] = sourceArtifacts;
    requireCondition(sourceArtifact.contentSha256 === sourceContentSha256, 'C010-PUBLICATION-HASH', 'SourceArtifact content hash does not bind the exact source response bytes');
    requireCondition(sourceArtifact.rights === sourceCapture.rights, 'C010-RIGHTS-SCHEMA', 'SourceArtifact rights do not match source capture rights');
    lines.push('[company-fundamentals] source artifact: hash and rights bound');

    const publicationValidation = company.validatePublicationGraph(manifest, objects);
    requireCondition(publicationValidation.ok, 'C010-PUBLICATION-SCHEMA', JSON.stringify(publicationValidation.errors));
    lines.push('[company-fundamentals] publication: complete graph valid');

    requireCondition(manifest.manifestSha256 === company.companyManifestSha256(manifest), 'C010-PUBLICATION-HASH', 'manifest hash is not canonical');
    lines.push('[company-fundamentals] publication: canonical manifest hash valid');

    const accepted = company.projectAcceptedPublication(manifest, objects);
    requireCondition(accepted.identity.issuerName === normalizedSource.issuerName, 'C010-IDENTITY-CONFLICT', 'accepted issuer name does not match production-normalized source');
    requireCondition(accepted.identity.cik === normalizedSource.cik, 'C010-IDENTITY-CONFLICT', 'accepted CIK does not match production-normalized source');
    requireCondition(accepted.identity.ticker === normalizedSource.tickers[0] && accepted.identity.exchange === normalizedSource.exchanges[0], 'C010-IDENTITY-CONFLICT', 'accepted listing does not match production-normalized source');
    requireCondition(accepted.identity.fiscalYearEnd === normalizedSource.fiscalYearEnd, 'C010-IDENTITY-CONFLICT', 'accepted fiscal year end does not match production-normalized source');
    requireCondition(accepted.periods[0].accession === normalizedSource.latestQuarterlyFiling.accessionNumber, 'C010-PERIOD-SCHEMA', 'accepted reporting period does not match production-normalized filing identity');
    requireCondition(accepted.periods[0].end === normalizedSource.latestQuarterlyFiling.reportDate && accepted.periods[0].form === normalizedSource.latestQuarterlyFiling.form, 'C010-PERIOD-SCHEMA', 'accepted reporting period or form does not match production-normalized filing identity');
    lines.push('[company-fundamentals] accepted state: source identity and period preserved');

    const direction = accepted.dependencyResults.find(({ id }) => id === 'metric-direction');
    const independent = accepted.dependencyResults.find(({ id }) => id === 'identity-summary');
    requireCondition(direction?.state === 'unavailable' && direction.value === null && direction.missingFactIds.includes('fact-revenue'), 'C010-INTEGRITY-DEPENDENCY', 'missing revenue did not withhold the dependent direction output');
    requireCondition(independent?.state === 'available' && independent.value === 'MICROSOFT CORP | MSFT', 'C010-INTEGRITY-DEPENDENCY', 'independent identity output was incorrectly withheld');
    lines.push('[company-fundamentals] SCN-010-026: dependency withholding valid');

    const trace = company.selectSourcesView(accepted, 'claim-direction');
    requireCondition(trace.observations.length === 0, 'C010-PUBLICATION-REF', 'missing revenue must not cite an unrelated observation');
    requireCondition(trace.sourceRequirements.length === 1 && trace.sourceRequirements[0].sourceId === 'sec-companyfacts-msft', 'C010-PUBLICATION-REF', 'claim trace does not preserve the unavailable Company Facts requirement');
    requireCondition(trace.transformations.length === 2 && trace.consumers.length === 2, 'C010-PUBLICATION-REF', 'claim trace omits transformations or consumers');
    requireCondition(trace.rights[0].limitations.length === 2 && trace.unavailableLinks.length === 1, 'C010-RIGHTS-SCHEMA', 'claim trace omits rights or unavailable-link limitations');
    lines.push('[company-fundamentals] SCN-010-029: source trace valid');

    // SCN-010-004: the accepted multi-period set classifies to the exact real filing kinds and never shows a YTD or instant as a standalone quarter.
    const acceptedPeriodClassifications = accepted.periods.map((period) => company.classifyReportingPeriod(period));
    requireCondition(
        acceptedPeriodClassifications.map(({ classification }) => classification).join(',') === 'quarter,annual,year-to-date,instant'
        && acceptedPeriodClassifications.every((entry) => entry.standaloneQuarter === (entry.classification === 'quarter')),
        'C010-PERIOD-SCHEMA',
        'accepted reporting periods do not classify to the exact real filing kinds or leak a YTD/instant standalone quarter'
    );
    lines.push('[company-fundamentals] SCN-010-004: reporting period classification valid');

    // SCN-010-006 and SCN-010-025: reconciliation over constructed contract observations restates amendments and keeps genuine conflicts conflicted without averaging.
    const statementObservation = (observationId, value, state) => ({
        contractVersion: 'fact-observation/v1',
        observationId,
        companyId: accepted.companyId,
        evidenceClass: 'reported',
        sourceRef: accepted.dossier.sourceRefs[1],
        periodRef: accepted.dossier.periodRefs[0],
        sourceConcept: 'us-gaap:Assets',
        value,
        valueType: 'decimal',
        unit: 'USD',
        currency: 'USD',
        decimals: '-6',
        signConvention: 'positive-natural',
        state,
        clocks: { reportingPeriodEnd: accepted.periods[0].end, sourcePublishedAt: manifest.sourceCutoff, acceptedAt: manifest.sourceCutoff, retrievedAt: sourceCapture.retrievedAt, observedAt: null },
        definition: 'Constructed Scope 1 reconciliation/integrity contract fixture derived by copying the accepted observation structure; it carries no source-qualified MSFT statement value.',
        qualifiers: ['Constructed reconciliation/integrity demonstration input; not a published MSFT statement fact.']
    });
    const reconcileRequest = (observations, amendments) => ({ factId: 'fact-total-assets', normalizedConcept: 'total-assets', mappingId: 'mapping-total-assets', mappingVersion: 'us-gaap-assets/v1', transformation: { sign: 1, scalePower10: 0, aggregation: 'none' }, observations, amendments });
    const reconciledRestatement = company.reconcileFactObservations(reconcileRequest([statementObservation('obs-assets-original', '500000000000', 'restated'), statementObservation('obs-assets-amended', '512000000000', 'current')], [{ originalObservationId: 'obs-assets-original', amendingObservationId: 'obs-assets-amended' }]));
    const reconciledConflict = company.reconcileFactObservations(reconcileRequest([statementObservation('obs-assets-a', '500000000000', 'current'), statementObservation('obs-assets-b', '540000000000', 'current')], []));
    requireCondition(
        reconciledRestatement.normalizedFact.resolutionState === 'restated'
        && reconciledRestatement.normalizedFact.currentObservationId === 'obs-assets-amended'
        && reconciledRestatement.normalizedFact.observationIds.join(',') === 'obs-assets-original,obs-assets-amended'
        && company.validateNormalizedFact(reconciledRestatement.normalizedFact).ok
        && reconciledConflict.normalizedFact.resolutionState === 'conflicted'
        && reconciledConflict.normalizedFact.currentObservationId === null
        && reconciledConflict.averaged === false
        && reconciledConflict.conflictingObservationIds.length === 2,
        'C010-MAPPING-SCHEMA',
        'reconciliation lineage did not restate an amendment or averaged a genuine conflict'
    );
    lines.push('[company-fundamentals] SCN-010-006 and SCN-010-025: reconciliation restatement and conflict lineage valid');

    // SCN-010-005: a copied accepted SEC fact set is changed so assets fall outside the summed XBRL rounding interval for liabilities and equity.
    const integrityImbalance = company.evaluateStatementIntegrity({
        companyId: accepted.companyId,
        periodId: 'period-msft-fy2026-q3-instant',
        assets: { observationId: 'obs-assets', value: '600000000000', decimals: '-6' },
        liabilities: { observationId: 'obs-liabilities', value: '200000000000', decimals: '-6' },
        equity: { observationId: 'obs-equity', value: '250000000000', decimals: '-6' }
    });
    const integrityClean = company.evaluateStatementIntegrity({
        companyId: accepted.companyId,
        periodId: 'period-msft-fy2026-q3-instant',
        assets: { observationId: 'obs-assets', value: '512163000000', decimals: '-6' },
        liabilities: { observationId: 'obs-liabilities', value: '205753000000', decimals: '-6' },
        equity: { observationId: 'obs-equity', value: '306410000000', decimals: '-6' }
    });
    requireCondition(
        integrityImbalance.withinTolerance === false
        && integrityImbalance.error.code === 'C010-INTEGRITY-BALANCE-SHEET'
        && integrityImbalance.error.affectedRefs.length === 3
        && integrityImbalance.difference === '150000000000'
        && integrityImbalance.allowedInterval === '1500000'
        && integrityImbalance.blockedConclusions.length === 3
        && Object.keys(integrityImbalance.sourceFacts).length === 3
        && integrityClean.withinTolerance === true
        && integrityClean.error === null,
        'C010-INTEGRITY-BALANCE-SHEET',
        'statement integrity did not emit C010-INTEGRITY-BALANCE-SHEET for an imbalance or blocked a clean statement'
    );
    lines.push('[company-fundamentals] SCN-010-005: statement integrity blocks imbalance and keeps source facts inspectable');

    // SCN-010-001, SCN-010-008, SCN-010-009: the archetype overlay reorders KPI drivers and keeps every shared fact byte-stable.
    const archetypeView = company.resolveArchetypeView(config, 'sec-cik-0000789019');
    const acceptedBefore = JSON.stringify(accepted);
    const softwareSimple = company.selectSimpleView(accepted, archetypeView);
    const unclassifiedSimple = company.selectSimpleView(accepted);
    const acceptedAfter = JSON.stringify(accepted);
    requireCondition(
        archetypeView.status === 'accepted'
        && archetypeView.primaryArchetypeId === 'archetype-software-platform'
        && softwareSimple.archetype.label === 'Software platform'
        && softwareSimple.kpiPriorities.map(({ normalizedConcept }) => normalizedConcept).join(',') === 'cloud-revenue,commercial-backlog,capital-expenditure,depreciation,operating-margin,cash-conversion,dilution'
        && softwareSimple.kpiPriorities.every((kpi) => kpi.state === 'unavailable' && typeof kpi.evidenceRequirement === 'string'),
        'C010-PUBLICATION-SCHEMA',
        'archetype-prioritized Simple view did not order the MSFT software drivers'
    );
    requireCondition(
        softwareSimple.clocks.statementCutoff === accepted.ownerRead.statementCutoff
        && softwareSimple.clocks.modelCutoff === accepted.ownerRead.modelCutoff
        && softwareSimple.clocks.briefCutoff === accepted.ownerRead.briefCutoff
        && softwareSimple.clocks.marketCutoff === accepted.ownerRead.marketCutoff,
        'C010-PUBLICATION-SCHEMA',
        'Simple cockpit clocks do not equal the owner objects'
    );
    requireCondition(
        acceptedBefore === acceptedAfter
        && JSON.stringify(softwareSimple.identity) === JSON.stringify(unclassifiedSimple.identity)
        && JSON.stringify(softwareSimple.evidenceCoverage) === JSON.stringify(unclassifiedSimple.evidenceCoverage)
        && JSON.stringify(softwareSimple.claims) === JSON.stringify(unclassifiedSimple.claims)
        && JSON.stringify(softwareSimple.dependencyResults) === JSON.stringify(unclassifiedSimple.dependencyResults),
        'C010-PUBLICATION-SCHEMA',
        'archetype prioritization mutated shared facts'
    );
    requireCondition(
        unclassifiedSimple.archetype.status === 'unclassified'
        && unclassifiedSimple.archetype.label === null
        && unclassifiedSimple.kpiAvailability.state === 'unavailable'
        && unclassifiedSimple.diagnosticsAvailability.state === 'unavailable'
        && unclassifiedSimple.dependencyResults.find(({ id }) => id === 'identity-summary').value === 'MICROSOFT CORP | MSFT',
        'C010-PUBLICATION-SCHEMA',
        'unclassified Simple view did not preserve shared facts while withholding the lens'
    );
    lines.push('[company-fundamentals] SCN-010-001/008/009: archetype prioritization orders KPIs, separates clocks, and keeps shared facts byte-stable');

    // SCN-010-010: the raw diagnostic record renders before any evidenced contextual adjustment.
    const coverageDiagnostic = company.evaluateDiagnostic({
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
        contextualAdjustment: { adjustmentId: 'adj-lease-interest', amount: '250000000', rationale: 'Add back capitalized lease interest disclosed in the notes.', sourceRefs: ['obs-lease-note'], sensitivity: 'A 10% change in lease interest moves coverage by 0.2x.', applicability: 'Applies only while operating leases remain material.' },
        interpretationMode: null
    });
    requireCondition(
        coverageDiagnostic.raw.value === '60'
        && coverageDiagnostic.raw.formula === 'operating-income / interest-expense'
        && coverageDiagnostic.raw.threshold === '3.0'
        && coverageDiagnostic.raw.inputRefs.join(',') === 'obs-operating-income,obs-interest-expense'
        && coverageDiagnostic.raw.period === 'period-msft-fy2026-q3'
        && coverageDiagnostic.presence === 'present'
        && coverageDiagnostic.contextual.amount === '250000000'
        && !Object.prototype.hasOwnProperty.call(coverageDiagnostic, 'score'),
        'C010-MAPPING-SCHEMA',
        'diagnostic did not render the raw record before the contextual adjustment'
    );
    // SCN-010-011: an omitted preferred-stock concept with no eligible observation is absent-from-eligible-source, never zero or pass.
    const preferredStock = company.evaluateDiagnostic({
        checkId: 'check-preferred-stock',
        policyId: 'policy-preferred-stock',
        policyVersion: 'preferred-stock/v1',
        concept: 'preferred-stock',
        periodId: 'period-msft-fy2026-q3-instant',
        raw: { formula: 'preferred-stock-present-or-explicit-zero', threshold: null, operation: 'presence-check', inputs: [] },
        contextualAdjustment: null,
        interpretationMode: null
    });
    requireCondition(
        preferredStock.presence === 'absent-from-eligible-source'
        && preferredStock.raw.state === 'absent-from-eligible-source'
        && preferredStock.raw.value === null
        && preferredStock.contextual === null
        && !/\bpass\b/i.test(JSON.stringify(preferredStock)),
        'C010-MAPPING-SCHEMA',
        'preferred-stock diagnostic emitted a zero, pass, or positive interpretation'
    );
    // SCN-010-012: buyback interpretation cites net share change and dilution, keeps gross flows distinct, and never treats repurchase as beneficial.
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
    requireCondition(
        buyback.capitalAllocation.netShareChange === '10000000'
        && buyback.capitalAllocation.grossRepurchaseOutlay.flowKind === 'period-flow'
        && buyback.capitalAllocation.treasuryStockBalance.flowKind === 'balance'
        && /net share change/i.test(buyback.interpretation)
        && /dilution/i.test(buyback.interpretation)
        && !/beneficial|value-accretive|shareholder-friendly/i.test(buyback.interpretation),
        'C010-MAPPING-SCHEMA',
        'capital-allocation interpretation did not cite net share change and dilution or treated repurchase existence as beneficial'
    );
    // Derived-metric transparency: the formula and inputs are exposed and no universal score is emitted.
    const derivedMetric = company.evaluateDerivedMetric({
        metricId: 'metric-cash-conversion',
        formulaId: 'formula-cash-conversion',
        formulaVersion: 'cash-conversion/v1',
        outputConcept: 'cash-conversion',
        unit: 'ratio',
        periodId: 'period-msft-fy2026-q3',
        operation: 'ratio',
        inputs: [
            { inputId: 'in-ocf', ref: 'fact-operating-cash-flow', concept: 'operating-cash-flow', unit: 'USD', periodId: 'period-msft-fy2026-q3', value: '36000000000', state: 'available' },
            { inputId: 'in-ni', ref: 'fact-net-income', concept: 'net-income', unit: 'USD', periodId: 'period-msft-fy2026-q3', value: '24000000000', state: 'available' }
        ],
        qualifications: []
    });
    requireCondition(
        derivedMetric.value === '1.5'
        && derivedMetric.expression === 'operating-cash-flow / net-income'
        && derivedMetric.state === 'available'
        && !Object.prototype.hasOwnProperty.call(derivedMetric, 'score')
        && !Object.prototype.hasOwnProperty.call(derivedMetric, 'universalScore'),
        'C010-MAPPING-SCHEMA',
        'derived metric did not expose its formula or emitted a universal score'
    );
    lines.push('[company-fundamentals] SCN-010-010/011/012: diagnostics render raw-before-contextual, preferred stock stays absent, and buybacks cite net share change and dilution');

    // ------------------------------------------------------------------
    // SCN-010-013/014/016/023: MSFT linked model and user-owned accepted state.
    // ------------------------------------------------------------------
    requireCondition(manifest.modelPackRef !== null, 'C010-PUBLICATION-REF', 'the regenerated publication must carry a non-null model pack ref');
    const modelPack = objects[manifest.modelPackRef.objectId];
    requireCondition(Boolean(modelPack) && modelPack.contractVersion === 'company-model-pack/v1', 'C010-PUBLICATION-SCHEMA', 'the model pack object is absent or has the wrong contract');
    requireCondition(company.companyObjectSha256(modelPack) === manifest.modelPackRef.sha256, 'C010-PUBLICATION-HASH', 'the model pack bytes do not bind the manifest model pack ref');
    requireCondition(modelPack.generation === manifest.generation && modelPack.publicationId === manifest.publicationId, 'C010-PUBLICATION-GENERATION', 'the model pack belongs to another generation');
    lines.push('[company-fundamentals] model pack: non-null hash-valid and generation-bound');

    const modelDefinition = modelPack.modelDefinition;
    const acceptedScenario = modelPack.acceptedScenario;
    const acceptedAssumptions = Object.fromEntries(acceptedScenario.assumptions.map(({ driverId, value }) => [driverId, value]));
    const baselineOutputsMap = Object.fromEntries(modelPack.baselineOutputs.map(({ nodeId, value }) => [nodeId, value]));

    // SCN-010-013/014: the accepted scenario recomputes to its published baseline from one generation.
    const rederivedBaseline = company.computeModelBaseline(modelDefinition, acceptedAssumptions);
    requireCondition(
        rederivedBaseline.outputs.length === modelPack.baselineOutputs.length
        && rederivedBaseline.outputs.every((output) => output.value === baselineOutputsMap[output.nodeId]),
        'C010-MODEL-DEPENDENCY',
        'the model pack baseline does not recompute from the accepted scenario tuple'
    );
    lines.push('[company-fundamentals] SCN-010-013/014: model pack recomputes to its published baseline from one generation');

    // SCN-010-014: a single driver edit recomputes only dependency-reachable nodes; unreachable history is carried; an invalid driver reports its dependency path and history is never mutated.
    const multipleDriver = modelDefinition.drivers.find((driver) => driver.concept === 'fcf-multiple');
    const sharesDriver = modelDefinition.drivers.find((driver) => driver.concept === 'diluted-shares');
    const baselineTuple = { assumptions: acceptedAssumptions, outputs: baselineOutputsMap };
    const baselineOutputsBefore = JSON.stringify(baselineOutputsMap);
    const valuationEdit = company.evaluateModel({ modelDefinition, baseline: baselineTuple, draft: { changedDriverId: multipleDriver.driverId, assumptions: { ...acceptedAssumptions, [multipleDriver.driverId]: '30' } } });
    requireCondition(
        valuationEdit.reachableNodeIds.every((nodeId) => modelDefinition.nodes.find((node) => node.nodeId === nodeId).kind === 'valuation')
        && valuationEdit.unchangedNodeIds.length > 0
        && valuationEdit.outputs.filter((output) => !output.recomputed).every((output) => output.value === baselineOutputsMap[output.nodeId]),
        'C010-MODEL-DEPENDENCY',
        'a valuation-only edit recomputed unreachable history or changed carried outputs'
    );
    const invalidEdit = company.evaluateModel({ modelDefinition, baseline: baselineTuple, draft: { changedDriverId: sharesDriver.driverId, assumptions: { ...acceptedAssumptions, [sharesDriver.driverId]: '0' } } });
    const blockedEps = invalidEdit.outputs.find((output) => output.nodeId === 'node-eps');
    requireCondition(
        blockedEps.state === 'blocked' && blockedEps.value === null && Array.isArray(blockedEps.dependencyPath)
        && blockedEps.dependencyPath[0] === sharesDriver.driverId && blockedEps.dependencyPath[blockedEps.dependencyPath.length - 1] === 'node-eps',
        'C010-MODEL-DEPENDENCY',
        'an invalid driver did not block a reachable node with an explicit dependency path'
    );
    requireCondition(JSON.stringify(baselineOutputsMap) === baselineOutputsBefore, 'C010-MODEL-DEPENDENCY', 'model evaluation mutated the immutable baseline history');
    lines.push('[company-fundamentals] SCN-010-014: driver edits recompute only reachable nodes and report invalid dependency paths without mutating history');

    // SCN-010-013 and SCN-010-023: evidence refresh raises separate proposals without rebasing; confirmation alone creates one revision; rejection records no change.
    const acceptedScenarioBefore = JSON.stringify(acceptedScenario);
    const selection = company.reduceCompanySelection({
        activeRevision: acceptedScenario,
        modelDefinition,
        acceptedPublication: { publicationId: manifest.publicationId, generation: manifest.generation, manifestSha256: manifest.manifestSha256, evidenceChanges: [{ concept: 'operating-margin', direction: 'increase', priorValue: '0.4', currentValue: '0.42', sourceRef: 'sec-companyfacts-msft' }] }
    });
    requireCondition(
        selection.rebased === false && JSON.stringify(selection.activeRevision) === acceptedScenarioBefore
        && selection.proposals.length === 1 && selection.proposals[0].decisionState === 'pending' && selection.proposals[0].resultingRevision === null,
        'C010-MODEL-DEPENDENCY',
        'evidence refresh rebased assumptions or failed to raise a pending proposal'
    );
    const acceptedDecision = company.reduceProposalDecision({ activeRevision: acceptedScenario, proposal: selection.proposals[0], modelDefinition, decision: { kind: 'accept', confirmedAt: manifest.createdAt } });
    const rejectedDecision = company.reduceProposalDecision({ activeRevision: acceptedScenario, proposal: selection.proposals[0], modelDefinition, decision: { kind: 'reject', confirmedAt: manifest.createdAt } });
    requireCondition(
        acceptedDecision.revisionsCreated === 1 && acceptedDecision.newRevision.revision === acceptedScenario.revision + 1 && acceptedDecision.newRevision.parentRevisionId === acceptedScenario.scenarioRevisionId
        && rejectedDecision.revisionsCreated === 0 && rejectedDecision.newRevision === null && JSON.stringify(acceptedScenario) === acceptedScenarioBefore,
        'C010-MODEL-DEPENDENCY',
        'proposal decisions did not create exactly one revision on accept or left the accepted revision changed'
    );
    lines.push('[company-fundamentals] SCN-010-013/023: refresh raises separate proposals, confirmation creates one revision, rejection records no change');

    // SCN-010-016: actual and estimate keep separate classes, sources, and clocks; forecast error derives only when comparable.
    const estimateObservation = { observationId: 'obs-estimate-revenue', evidenceClass: 'estimate', definition: 'total-revenue', unit: 'USD', currency: 'USD', periodId: 'period-msft-fy2026-q4', value: '75000', sourceRef: 'source-estimate-set', clocks: { reportingPeriodEnd: '2026-06-30', sourcePublishedAt: '2026-05-01T00:00:00Z', acceptedAt: '2026-05-01T00:00:00Z', retrievedAt: '2026-05-01T00:00:00Z', observedAt: null } };
    const actualObservation = { observationId: 'obs-actual-revenue', evidenceClass: 'reported', definition: 'total-revenue', unit: 'USD', currency: 'USD', periodId: 'period-msft-fy2026-q4', value: '78000', sourceRef: 'sec-companyfacts-msft', clocks: { reportingPeriodEnd: '2026-06-30', sourcePublishedAt: '2026-07-30T00:00:00Z', acceptedAt: '2026-07-30T00:00:00Z', retrievedAt: '2026-07-30T00:00:00Z', observedAt: null } };
    const forecast = company.deriveForecastError({ estimate: estimateObservation, actual: actualObservation });
    const incomparableForecast = company.deriveForecastError({ estimate: estimateObservation, actual: { ...actualObservation, periodId: 'period-msft-fy2027-q1' } });
    requireCondition(
        forecast.comparable === true && forecast.forecastError.value === '3000' && forecast.estimate.evidenceClass === 'estimate' && forecast.actual.evidenceClass === 'reported'
        && forecast.estimate.sourceRef !== forecast.actual.sourceRef && forecast.estimate.clocks.acceptedAt !== forecast.actual.clocks.acceptedAt
        && incomparableForecast.comparable === false && incomparableForecast.forecastError === null,
        'C010-SOURCE-SCHEMA',
        'forecast error did not keep separate classes and clocks or derived across incompatible periods'
    );
    lines.push('[company-fundamentals] SCN-010-016: actual and estimate keep separate classes and clocks with comparable-only forecast error');

    // Drift rejection: a tampered model pack fails the whole-publication hash guard.
    const tamperedModelPack = structuredClone(modelPack);
    tamperedModelPack.baselineOutputs = tamperedModelPack.baselineOutputs.map((output, index) => (index === 0 ? { ...output, value: '999999' } : output));
    const driftValidation = company.validatePublicationGraph(manifest, { ...objects, [manifest.modelPackRef.objectId]: tamperedModelPack });
    requireCondition(!driftValidation.ok && driftValidation.errors.some((error) => error.code === 'C010-PUBLICATION-HASH'), 'C010-PUBLICATION-HASH', 'a drifted model pack was not rejected by the publication hash guard');
    lines.push('[company-fundamentals] model pack: drift rejected by the whole-publication hash guard');

    // ------------------------------------------------------------------
    // SCN-010-015/028/029: Detailed one-state parity, comparable-only peers, and the committed owner-read producer.
    // ------------------------------------------------------------------
    // The committed owner read is PRODUCED by buildFundamentalsToolRead and is a faithful recompute of the accepted
    // generation; any drift in the committed owner read is rejected. This is what makes ownerReadRef a validated non-null projection.
    requireCondition(manifest.ownerReadRef !== null, 'C010-PUBLICATION-REF', 'the regenerated publication must carry a non-null owner read ref');
    const recomputedOwnerRead = company.buildFundamentalsToolRead({ accepted, readId: manifest.ownerReadRef.objectId, modelPackRef: manifest.modelPackRef, briefRef: manifest.briefRef });
    requireCondition(company.companyObjectSha256(recomputedOwnerRead) === company.companyObjectSha256(accepted.ownerRead), 'C010-PUBLICATION-HASH', 'the committed owner read is not a faithful recompute of the accepted generation');
    requireCondition(Boolean(recomputedOwnerRead.modelPackRef) && recomputedOwnerRead.modelPackRef.objectId === manifest.modelPackRef.objectId, 'C010-PUBLICATION-REF', 'the committed owner read must carry the model pack ref');
    requireCondition(!/credential|token|secret|password/i.test(JSON.stringify(recomputedOwnerRead)), 'C010-RIGHTS-SCHEMA', 'the committed owner read leaked a private field');
    lines.push('[company-fundamentals] SCN-010-015: committed owner read recomputes from one generation and rejects drift');

    // Scope 5 committed brief/history: the publication carries one partial source-bounded brief, no fabricated
    // material changes or proposals, and a semantic replay produces no duplicate history event.
    requireCondition(
        manifest.briefRef !== null
        && accepted.brief.status === 'partial'
        && accepted.brief.materialChanges.length === 0
        && accepted.brief.modelImpactProposals.length === 0
        && accepted.brief.clocks.statementCutoff === recomputedOwnerRead.statementCutoff
        && accepted.brief.clocks.modelCutoff === recomputedOwnerRead.modelCutoff
        && accepted.brief.clocks.briefCutoff === recomputedOwnerRead.briefCutoff
        && accepted.brief.clocks.marketCutoff === recomputedOwnerRead.marketCutoff
        && accepted.brief.clocks.retrievalCutoff === recomputedOwnerRead.retrievalCutoff,
        'C010-BRIEF-SCHEMA',
        'the committed adaptive brief is missing, non-partial, fabricates an update, or collapses owner clocks'
    );
    const historyIndex = objects[manifest.historyRefs[0].objectId];
    requireCondition(historyIndex.entries.length === 1 && historyIndex.entries[0].contentFingerprint === accepted.brief.contentFingerprint, 'C010-BRIEF-SCHEMA', 'the current history index does not contain exactly one semantic brief event');
    const replayedHistory = company.appendAdaptiveBriefHistory({ history: historyIndex.entries, brief: accepted.brief });
    requireCondition(replayedHistory.appended === false && replayedHistory.history.length === historyIndex.entries.length, 'C010-INTEGRITY-DUPLICATE', 'replaying identical evidence duplicated the brief history event');
    lines.push('[company-fundamentals] SCN-010-024/031: partial brief preserves five clocks and identical evidence replays without duplicate history');

    // SCN-010-015: one accepted tuple drives the Simple cockpit, the source trace, the export, and the owner read with no refetch or divergence.
    const oneStateArchetype = company.resolveArchetypeView(config, accepted.companyId);
    const oneStateSimple = company.selectSimpleView(accepted, oneStateArchetype);
    const oneStateTrace = company.selectSourcesView(accepted, 'claim-direction');
    const oneStateExport = company.buildAcceptedExport(accepted);
    requireCondition(
        oneStateSimple.clocks.statementCutoff === accepted.ownerRead.statementCutoff
        && oneStateSimple.clocks.statementCutoff === oneStateExport.view.clocks.statementCutoff
        && oneStateSimple.clocks.statementCutoff === recomputedOwnerRead.statementCutoff
        && oneStateExport.containsPrivateData === false
        && JSON.stringify(oneStateExport.view.limitations) === JSON.stringify(recomputedOwnerRead.limitations)
        && oneStateTrace.focusRef === 'claim-direction'
        && oneStateSimple.dependencyResults.find((result) => result.id === 'metric-direction').state === 'unavailable'
        && recomputedOwnerRead.direction === 'Unavailable',
        'C010-PUBLICATION-SCHEMA',
        'the Detailed selectors did not share one accepted state without divergence'
    );
    lines.push('[company-fundamentals] SCN-010-015: Simple, source trace, export, and owner read share one accepted state without refetch');

    // SCN-010-028: the configured software-platform peer set is a valid proposed set; selectPeersView admits only comparable
    // observations and never inserts a zero for a missing or non-comparable member. The peer observations are constructed and are not MSFT-reported values.
    const configuredPeerSet = (config.peers || []).find((set) => set.subjectCompanyId === accepted.companyId);
    requireCondition(Boolean(configuredPeerSet) && configuredPeerSet.status === 'proposed' && configuredPeerSet.archetypeIds.includes('archetype-software-platform'), 'C010-CONFIG-SCHEMA', 'config must declare a proposed software-platform peer set for the subject company');
    const peersView = company.selectPeersView({
        peerSet: {
            peerSetId: configuredPeerSet.peerSetId,
            subjectCompanyId: configuredPeerSet.subjectCompanyId,
            purpose: configuredPeerSet.purpose,
            companyIds: [configuredPeerSet.subjectCompanyId, 'peer-software-alpha', 'peer-software-beta', 'peer-software-gamma', 'peer-software-delta', 'peer-software-epsilon']
        },
        statistic: { concept: 'gross-margin', unit: 'ratio', operation: 'median' },
        observations: [
            { companyId: 'peer-software-alpha', value: '0.68', eligibility: 'comparable', reason: 'Same archetype and reporting basis; constructed demonstration value, not an MSFT-reported figure.' },
            { companyId: 'peer-software-beta', value: '0.72', eligibility: 'comparable', reason: 'Same archetype and reporting basis; constructed demonstration value.' },
            { companyId: 'peer-software-gamma', value: '0.64', eligibility: 'comparable', reason: 'Same archetype and reporting basis; constructed demonstration value.' },
            { companyId: 'peer-software-delta', value: '0.30', eligibility: 'qualified', reason: 'Different segment mix; kept visible but excluded from the level statistic.' },
            { companyId: 'peer-software-epsilon', value: '0.95', eligibility: 'excluded', reason: 'Non-comparable revenue-recognition basis.', outlier: true }
        ]
    });
    requireCondition(
        peersView.statistic.sampleSize === 3
        && peersView.statistic.value === '0.68'
        && peersView.statistic.memberCompanyIds.indexOf('peer-software-delta') === -1
        && peersView.statistic.memberCompanyIds.indexOf('peer-software-epsilon') === -1
        && peersView.qualified.length === 1 && peersView.excluded.length === 1 && peersView.outliers.length === 1
        && peersView.missing.length === 1 && peersView.missing[0] === accepted.companyId
        && !peersView.comparable.some((row) => row.value === '0'),
        'C010-PUBLICATION-SCHEMA',
        'peer view inserted a zero, admitted a non-comparable observation, or dropped a visible exclusion'
    );
    lines.push('[company-fundamentals] SCN-010-028: peers admit only comparable observations and keep exclusions and missing members visible with no zero insertion');

    // SCN-010-029: the direction claim resolves its full source chain — observation requirement, transformations, consumers, rights, restatements, conflicts, and unavailable links — from the accepted state with focus return.
    requireCondition(
        oneStateTrace.transformations.length === 2
        && oneStateTrace.consumers.length === 2
        && oneStateTrace.rights.length >= 1 && oneStateTrace.rights[0].limitations.length === 2
        && Array.isArray(oneStateTrace.restatements) && Array.isArray(oneStateTrace.conflicts)
        && oneStateTrace.unavailableLinks.length === 1
        && oneStateTrace.sourceRequirements.length === 1 && oneStateTrace.sourceRequirements[0].sourceId === 'sec-companyfacts-msft',
        'C010-PUBLICATION-REF',
        'the material claim did not resolve its full observation, transformation, consumer, rights, and unavailable-link chain'
    );
    lines.push('[company-fundamentals] SCN-010-029: the direction claim resolves its full transformation, consumer, rights, and unavailable-link chain');

    // SCN-010-030: Feature 002 consumes the frozen committed owner read once. The adapter owns no company
    // formulas, model evaluation, reducers, or proposal decisions; it verifies hashes and projects owner fields.
    const scope6ReadCounts = new Map();
    const scope6ReadJson = (path) => {
        scope6ReadCounts.set(path, (scope6ReadCounts.get(path) || 0) + 1);
        return JSON.parse(readFileSync(new URL(path, repoRootUrl), 'utf8'));
    };
    const scope6OwnerBefore = JSON.stringify(accepted.ownerRead);
    const scope6Projection = buildCompanyFundamentalsOwnerRead(scope6ReadJson, company.companyObjectSha256);
    const scope6ExpectedPaths = [
        'company-fundamentals.config.json',
        currentPointerPath,
        currentPointer.manifestPath,
        manifest.ownerReadRef.path
    ];
    requireCondition(
        scope6ExpectedPaths.length === 4
        && scope6ExpectedPaths.every((path) => scope6ReadCounts.get(path) === 1)
        && scope6ReadCounts.size === 4,
        'C010-PUBLICATION-REF',
        'Feature 002 did not read config, pointer, manifest, and owner object exactly once each'
    );
    requireCondition(
        currentPointer.manifestSha256 === company.companyManifestSha256(manifest)
        && scope6Projection.fingerprint === manifest.ownerReadRef.sha256
        && scope6Projection.fingerprint === company.companyObjectSha256(accepted.ownerRead),
        'C010-PUBLICATION-HASH',
        'Feature 002 accepted a non-canonical pointer, manifest, or owner hash'
    );
    requireCondition(
        scope6Projection.sourceAsOf === accepted.ownerRead.statementCutoff
        && scope6Projection.modelAsOf === accepted.ownerRead.modelCutoff
        && scope6Projection.asOf === accepted.ownerRead.briefCutoff
        && scope6Projection.marketAsOf === accepted.ownerRead.marketCutoff
        && scope6Projection.evidenceCutoff === accepted.ownerRead.retrievalCutoff
        && JSON.stringify(scope6Projection.limitations) === JSON.stringify(accepted.ownerRead.limitations)
        && JSON.stringify(scope6Projection.metrics.sourceLinks) === JSON.stringify(accepted.ownerRead.sourceLinks)
        && JSON.stringify(scope6Projection.metrics.disagreements) === JSON.stringify(accepted.ownerRead.disagreements)
        && JSON.stringify(scope6Projection.metrics.modelImpactProposals) === JSON.stringify(accepted.ownerRead.modelImpactProposals)
        && JSON.stringify(scope6Projection.recommendationEligibility) === JSON.stringify(accepted.ownerRead.recommendationEligibility),
        'C010-PUBLICATION-SCHEMA',
        'Feature 002 changed an owner clock, limitation, source link, disagreement, proposal, or recommendation boundary'
    );
    requireCondition(
        scope6Projection.status === accepted.ownerRead.status
        && scope6Projection.metrics.direction === accepted.ownerRead.direction
        && scope6Projection.metrics.archetypeId === accepted.ownerRead.archetypeId
        && scope6Projection.recommendationEligibility.eligible === false
        && JSON.stringify(accepted.ownerRead) === scope6OwnerBefore
        && !/RLCOMPANY|evaluateModel|buildFundamentalsToolRead|rankEvidenceChanges|buildAdaptiveCompanyBrief|appendAdaptiveBriefHistory|selectResilienceView|reduce[A-Z]/.test(buildCompanyFundamentalsOwnerRead.toString()),
        'C010-PUBLICATION-SCHEMA',
        'Feature 002 recomputed or mutated owner facts, archetype, proposals, recommendation eligibility, or model state'
    );
    lines.push('[company-fundamentals] SCN-010-030: Feature 002 reads config, pointer, manifest, and owner once; verifies canonical hashes; preserves five clocks, limitations, source links, disagreements, proposals, and ineligible recommendation; and has zero formula/model/reducer dependencies');

    // ------------------------------------------------------------------
    // Scope 7 (Increment C): CMG and JPM source-qualified archetype overlays.
    // The same config that binds MSFT now declares Chipotle (restaurant unit
    // economics) and JPMorgan (financial institution) as coherent, distinct
    // issuers over the SHARED foundation contracts. No fact, formula, KPI, or
    // model family is copied between issuers, and the MSFT publication is proven
    // byte-stable. The source-qualified overlay observations are constructed,
    // clearly-labeled Scope 7 fixtures (a real SEC/issuer acquisition is Scope 8).
    // ------------------------------------------------------------------
    const cmgCompanyId = 'sec-cik-0001058090';
    const jpmCompanyId = 'sec-cik-0000019617';
    const cmgConfig = config.companies.find((entry) => entry.companyId === cmgCompanyId);
    const jpmConfig = config.companies.find((entry) => entry.companyId === jpmCompanyId);
    const cmgArchetype = company.resolveArchetypeView(config, cmgCompanyId);
    const jpmArchetype = company.resolveArchetypeView(config, jpmCompanyId);
    const msftArchetype = company.resolveArchetypeView(config, accepted.companyId);
    requireCondition(
        cmgConfig?.issuerName === 'CHIPOTLE MEXICAN GRILL INC' && jpmConfig?.issuerName === 'JPMORGAN CHASE & CO'
        && cmgArchetype.status === 'accepted' && cmgArchetype.primaryArchetypeId === 'archetype-restaurant-unit-economics'
        && jpmArchetype.status === 'accepted' && jpmArchetype.primaryArchetypeId === 'archetype-financial-institution'
        && msftArchetype.primaryArchetypeId === 'archetype-software-platform',
        'C010-CONFIG-SCHEMA',
        'the shared config does not declare coherent, distinct CMG and JPM issuers over the MSFT foundation'
    );
    lines.push('[company-fundamentals] SCN-010-002/003: CMG and JPM are coherent source-qualified issuers with distinct accepted archetypes over the shared foundation');

    // SCN-010-002 & SCN-010-003 are validated over the REAL committed CMG and JPM publications materialized from
    // the retained SEC Company Facts response bytes. Each publication is loaded through the generic production
    // loader and projected through projectAcceptedPublication, so a malformed or fabricated overlay cannot pass.
    const cmgPublication = await loadCurrentPublicationFor(cmgCompanyId);
    const cmgAccepted = company.projectAcceptedPublication(cmgPublication.manifest, cmgPublication.objects);
    const cmgObs = Object.fromEntries(cmgAccepted.observations.map((observation) => [observation.observationId, observation]));
    requireCondition(
        cmgAccepted.identity.issuerName === 'CHIPOTLE MEXICAN GRILL INC'
        && cmgAccepted.periods.length === 1 && cmgAccepted.periods[0].accession === '0001058090-26-000009'
        && cmgObs['obs-cmg-stockholders-equity'].value === '2830607000'
        && cmgObs['obs-cmg-total-liabilities'].value === '6163924000'
        && cmgObs['obs-cmg-operating-lease-liability'].value === '4773434000'
        && cmgObs['obs-cmg-funded-debt'].state === 'current' && cmgObs['obs-cmg-funded-debt'].value === '0'
        && cmgObs['obs-cmg-treasury-stock'].state === 'unavailable' && cmgObs['obs-cmg-treasury-stock'].value === null,
        'C010-PUBLICATION-HASH',
        'the committed CMG publication does not carry the real source-qualified SEC balance-sheet observations'
    );
    lines.push('[company-fundamentals] SCN-010-002: the CMG publication carries real SEC 10-K balance-sheet observations (equity 2830607000, liabilities 6163924000, lease 4773434000, funded-debt 0, treasury explicitly unavailable)');
    const cmgResilience = company.selectResilienceView({
        archetypeView: cmgArchetype,
        subjectCompanyId: cmgCompanyId,
        checks: [
            {
                checkId: 'check-cmg-cash-to-debt', policyId: 'policy-cmg-cash-to-debt', policyVersion: 'cash-to-funded-debt/v1', concept: 'cash-to-funded-debt', periodId: 'period-cmg-fy2025-annual',
                raw: {
                    formula: 'cash-and-equivalents / funded-debt', threshold: null, operation: 'ratio', inputs: [
                        { inputId: 'input-cmg-cash', ref: 'obs-cmg-cash-and-equivalents', concept: 'cash-and-equivalents', unit: 'USD', periodId: 'period-cmg-fy2025-annual', value: cmgObs['obs-cmg-cash-and-equivalents'].value, state: 'reconciled' },
                        { inputId: 'input-cmg-funded-debt', ref: 'obs-cmg-funded-debt', concept: 'funded-debt', unit: 'USD', periodId: 'period-cmg-fy2025-annual', value: cmgObs['obs-cmg-funded-debt'].value, state: 'reconciled' }
                    ]
                },
                contextualAdjustment: null
            },
            {
                checkId: 'check-cmg-liabilities-equity', policyId: 'policy-cmg-lease-adjusted-leverage', policyVersion: 'lease-adjusted-leverage/v1', concept: 'liabilities-to-equity', periodId: 'period-cmg-fy2025-annual',
                raw: {
                    formula: 'total-liabilities / stockholders-equity', threshold: null, operation: 'ratio', inputs: [
                        { inputId: 'input-cmg-liabilities', ref: 'obs-cmg-total-liabilities', concept: 'total-liabilities', unit: 'USD', periodId: 'period-cmg-fy2025-annual', value: cmgObs['obs-cmg-total-liabilities'].value, state: 'reconciled' },
                        { inputId: 'input-cmg-equity', ref: 'obs-cmg-stockholders-equity', concept: 'stockholders-equity', unit: 'USD', periodId: 'period-cmg-fy2025-annual', value: cmgObs['obs-cmg-stockholders-equity'].value, state: 'reconciled' }
                    ]
                },
                contextualAdjustment: { adjustmentId: 'adjustment-cmg-lease', amount: cmgObs['obs-cmg-operating-lease-liability'].value, rationale: 'Operating-lease obligations dwarf reported funded debt, and repurchased shares are retired rather than held in treasury.', sourceRefs: ['obs-cmg-operating-lease-liability', 'obs-cmg-common-stock-repurchase'], sensitivity: 'lease-and-repurchase-context', applicability: 'restaurant-unit-economics' }
            }
        ],
        archetypeFacts: [
            { factId: 'fact-cmg-lease', concept: 'operating-lease-liability', label: 'Operating lease liability (SEC 10-K FY2025)', value: cmgObs['obs-cmg-operating-lease-liability'].value, unit: 'USD', state: 'reconciled', sourceRefs: ['obs-cmg-operating-lease-liability'] },
            { factId: 'fact-cmg-repurchase', concept: 'common-stock-repurchase', label: 'Common-stock repurchase (SEC 10-K FY2025)', value: cmgObs['obs-cmg-common-stock-repurchase'].value, unit: 'USD', state: 'reconciled', sourceRefs: ['obs-cmg-common-stock-repurchase'] }
        ]
    });
    const cmgLeverage = cmgResilience.checks.find((entry) => entry.checkId === 'check-cmg-liabilities-equity');
    const cmgCash = cmgResilience.checks.find((entry) => entry.checkId === 'check-cmg-cash-to-debt');
    requireCondition(
        cmgResilience.archetypeId === 'archetype-restaurant-unit-economics'
        && cmgLeverage.applicability === 'applicable'
        && cmgLeverage.diagnostic.raw.value === '2.177598' && cmgLeverage.diagnostic.raw.state === 'available'
        && cmgLeverage.diagnostic.contextual !== null
        && JSON.stringify(cmgLeverage.diagnostic.contextual.sourceRefs) === JSON.stringify(['obs-cmg-operating-lease-liability', 'obs-cmg-common-stock-repurchase'])
        && !Object.prototype.hasOwnProperty.call(cmgLeverage.diagnostic.contextual, 'value')
        && !Object.prototype.hasOwnProperty.call(cmgLeverage.diagnostic.contextual, 'pass')
        && !Object.prototype.hasOwnProperty.call(cmgLeverage.diagnostic.contextual, 'result')
        && cmgLeverage.weaknessRank === null
        && cmgCash.applicability === 'applicable' && cmgCash.diagnostic.raw.state === 'blocked'
        && cmgResilience.industrialRankProduced === false
        && cmgResilience.archetypeFacts.length === 2 && cmgResilience.archetypeFacts.every((fact) => fact.state === 'reconciled' && fact.sourceRefs.length === 1),
        'C010-PUBLICATION-SCHEMA',
        'CMG resilience overlay altered the real reported leverage, dropped the lease/repurchase refs, or emitted a pass/fail context value'
    );
    lines.push('[company-fundamentals] SCN-010-002: CMG raw leverage 2.177598 renders from reported observations with lease and repurchase context named beside it (cash-to-debt honestly blocked; no pass/fail value)');

    // SCN-010-003: JPMorgan marks the ordinary industrial liabilities/equity and net-debt/EBITDA heuristics inapplicable with the financial-institution policy id and never yields an industrial weakness rank, while real bank facts stay available.
    const jpmPublication = await loadCurrentPublicationFor(jpmCompanyId);
    const jpmAccepted = company.projectAcceptedPublication(jpmPublication.manifest, jpmPublication.objects);
    const jpmObs = Object.fromEntries(jpmAccepted.observations.map((observation) => [observation.observationId, observation]));
    requireCondition(
        jpmAccepted.identity.issuerName === 'JPMORGAN CHASE & CO'
        && jpmAccepted.periods.length === 1 && jpmAccepted.periods[0].accession === '0001628280-26-008131'
        && jpmObs['obs-jpm-total-deposits'].value === '2559320000000'
        && jpmObs['obs-jpm-preferred-capital'].value === '20045000000'
        && jpmObs['obs-jpm-cet1-ratio'].state === 'unavailable' && jpmObs['obs-jpm-cet1-ratio'].value === null
        && jpmObs['obs-jpm-liquidity-coverage-ratio'].state === 'unavailable' && jpmObs['obs-jpm-liquidity-coverage-ratio'].value === null,
        'C010-PUBLICATION-HASH',
        'the committed JPM publication does not carry the real source-qualified SEC bank observations or leaks a fabricated regulatory-capital ratio'
    );
    lines.push('[company-fundamentals] SCN-010-003: the JPM publication carries real SEC 10-K bank observations (deposits 2559320000000, preferred 20045000000) and keeps CET1 and liquidity-coverage explicitly unavailable');
    const jpmResilience = company.selectResilienceView({
        archetypeView: jpmArchetype,
        subjectCompanyId: jpmCompanyId,
        checks: [
            { checkId: 'check-jpm-liabilities-equity', policyId: 'policy-jpm-ordinary-liabilities-equity', policyVersion: 'financial-institution-inapplicable/v1', concept: 'liabilities-to-equity', periodId: 'period-jpm-fy2025-annual', raw: { formula: 'total-liabilities / stockholders-equity', threshold: null, operation: 'ratio', inputs: [] } },
            { checkId: 'check-jpm-net-debt-ebitda', policyId: 'policy-jpm-net-debt-ebitda', policyVersion: 'financial-institution-inapplicable/v1', concept: 'net-debt-to-ebitda', periodId: 'period-jpm-fy2025-annual', raw: { formula: 'net-debt / ebitda', threshold: null, operation: 'ratio', inputs: [] } }
        ],
        archetypeFacts: [
            { factId: 'fact-jpm-deposits', concept: 'total-deposits', label: 'Total deposits (SEC 10-K FY2025)', value: jpmObs['obs-jpm-total-deposits'].value, unit: 'USD', state: 'reconciled', sourceRefs: ['obs-jpm-total-deposits'] },
            { factId: 'fact-jpm-preferred', concept: 'preferred-capital', label: 'Preferred capital (SEC 10-K FY2025)', value: jpmObs['obs-jpm-preferred-capital'].value, unit: 'USD', state: 'reconciled', sourceRefs: ['obs-jpm-preferred-capital'] }
        ]
    });
    requireCondition(
        jpmResilience.archetypeId === 'archetype-financial-institution'
        && jpmResilience.checks.every((entry) => entry.applicability === 'inapplicable' && entry.diagnostic === null && entry.weaknessRank === null)
        && jpmResilience.checks.find((entry) => entry.concept === 'liabilities-to-equity').policyId === 'policy-jpm-ordinary-liabilities-equity'
        && jpmResilience.checks.find((entry) => entry.concept === 'net-debt-to-ebitda').policyId === 'policy-jpm-net-debt-ebitda'
        && jpmResilience.checks.every((entry) => entry.decidingArchetypeId === 'archetype-financial-institution')
        && jpmResilience.industrialRankProduced === false && jpmResilience.industrialWeaknessRank === null
        && jpmResilience.archetypeFacts.length === 2 && jpmResilience.archetypeFacts.every((fact) => fact.state === 'reconciled')
        && jpmResilience.archetypeFacts.map((fact) => fact.concept).join(',') === 'total-deposits,preferred-capital',
        'C010-PUBLICATION-SCHEMA',
        'JPM resilience overlay produced an industrial weakness rank, ran an inapplicable ordinary heuristic, or dropped an available bank fact'
    );
    lines.push('[company-fundamentals] SCN-010-003: JPM marks ordinary liabilities/equity and net-debt/EBITDA inapplicable with the financial-institution policy id and keeps bank facts available with no industrial weakness rank');

    // FR-010-050 / no-copy: MSFT, CMG, and JPM select materially different KPIs, diagnostics, and model families from the same normalized facts; no formula or fact is copied between issuers.
    const kpiIds = (archetypeView) => archetypeView.definition.kpiPriorities.map((kpi) => kpi.kpiId);
    const policyIds = (archetypeView) => archetypeView.definition.diagnosticPolicies.map((policy) => policy.policyId);
    const disjoint = (a, b) => a.every((entry) => !b.includes(entry)) && b.every((entry) => !a.includes(entry));
    const modelFamilies = config.model.definitions.map((definition) => definition.family);
    const formulaIds = config.formulas.map((formula) => formula.formulaId);
    requireCondition(
        disjoint(kpiIds(msftArchetype), kpiIds(cmgArchetype)) && disjoint(kpiIds(msftArchetype), kpiIds(jpmArchetype)) && disjoint(kpiIds(cmgArchetype), kpiIds(jpmArchetype))
        && disjoint(policyIds(msftArchetype), policyIds(cmgArchetype)) && disjoint(policyIds(msftArchetype), policyIds(jpmArchetype)) && disjoint(policyIds(cmgArchetype), policyIds(jpmArchetype))
        && new Set(modelFamilies).size === modelFamilies.length
        && modelFamilies.includes('ordinary-company-three-statement') && modelFamilies.includes('financial-institution-balance-sheet')
        && new Set(formulaIds).size === formulaIds.length,
        'C010-INTEGRITY-DUPLICATE',
        'an issuer copied a KPI, diagnostic policy, formula, or model family from another issuer'
    );
    lines.push('[company-fundamentals] FR-010-050: MSFT, CMG, and JPM select disjoint KPIs, diagnostics, formulas, and model families with no copy between issuers');

    // NFR-010-021: the MSFT publication and its accepted facts stay byte-stable after the CMG/JPM additions — only the config-fingerprint-bound manifest envelope and pointer rebind.
    requireCondition(
        manifest.configFingerprint === configFingerprint
        && manifest.modelPackRef.sha256 === 'sha256:a605661add9ef26f4090dc322794b8d918df7451670e129acf4bc9b5e0d2b4ba'
        && manifest.briefRef.sha256 === 'sha256:4f670fe7a1229431e0081a909236a85358182172f5e5ed95ae4e85d90c6c9b06'
        && company.companyObjectSha256(accepted.dossier) === manifest.dossierRef.sha256
        && company.companyObjectSha256(accepted.ownerRead) === manifest.ownerReadRef.sha256
        && accepted.identity.issuerName === 'MICROSOFT CORP',
        'C010-PUBLICATION-HASH',
        'the MSFT publication facts, model pack, brief, dossier, or owner read changed after the CMG/JPM additions'
    );
    lines.push('[company-fundamentals] NFR-010-021: MSFT dossier, owner read, model pack, and brief stay byte-stable after CMG/JPM additions');

    // SCN-010-007 (Scope 8): the cross-entity comparability boundary is proven over the REAL mixed-fiscal publications.
    // Microsoft reports on a 06-30 fiscal year while Chipotle and JPMorgan report on 12-31, so a cross-entity growth,
    // statistic, or rank over Microsoft and Chipotle is withheld as unavailable with the exact machine-readable reason
    // while every raw basis stays visible; an aligned same-currency same-fiscal Chipotle/JPMorgan equity comparison
    // genuinely computes, proving the guard discriminates instead of trivially withholding. The accessible
    // chart-equivalent table exposes each real reported value with an explicit unavailable state for the issuer that
    // does not report it.
    const crossFiscalComparability = company.evaluateComparability({
        concept: 'stockholders-equity',
        operations: ['growth', 'statistic', 'rank'],
        statistic: { operation: 'mean' },
        reconciliation: null,
        bases: [
            { basisId: 'basis-msft-equity', companyId: accepted.companyId, concept: 'stockholders-equity', unit: 'USD', currency: accepted.identity.reportingCurrency, fiscalYearEnd: accepted.identity.fiscalYearEnd, periodId: accepted.periods[0].periodId, periodEnd: accepted.periods[0].end, value: null },
            { basisId: 'basis-cmg-equity', companyId: cmgAccepted.companyId, concept: 'stockholders-equity', unit: 'USD', currency: cmgAccepted.identity.reportingCurrency, fiscalYearEnd: cmgAccepted.identity.fiscalYearEnd, periodId: 'period-cmg-fy2025-annual', periodEnd: '2025-12-31', value: cmgObs['obs-cmg-stockholders-equity'].value }
        ]
    });
    const alignedComparability = company.evaluateComparability({
        concept: 'stockholders-equity',
        operations: ['statistic', 'rank'],
        statistic: { operation: 'mean' },
        reconciliation: null,
        bases: [
            { basisId: 'basis-cmg-equity', companyId: cmgAccepted.companyId, concept: 'stockholders-equity', unit: 'USD', currency: 'USD', fiscalYearEnd: cmgAccepted.identity.fiscalYearEnd, periodId: 'period-cmg-fy2025-annual', periodEnd: '2025-12-31', value: cmgObs['obs-cmg-stockholders-equity'].value },
            { basisId: 'basis-jpm-equity', companyId: jpmAccepted.companyId, concept: 'stockholders-equity', unit: 'USD', currency: 'USD', fiscalYearEnd: jpmAccepted.identity.fiscalYearEnd, periodId: 'period-jpm-fy2025-annual', periodEnd: '2025-12-31', value: jpmObs['obs-jpm-stockholders-equity'].value }
        ]
    });
    const equityChart = company.buildAccessibleChartTable({
        caption: 'Reported stockholders equity by issuer',
        categoryLabel: 'Issuer', valueLabel: 'Stockholders equity', unit: 'USD',
        series: [
            { companyId: cmgAccepted.companyId, label: 'Chipotle', value: cmgObs['obs-cmg-stockholders-equity'].value },
            { companyId: jpmAccepted.companyId, label: 'JPMorgan', value: jpmObs['obs-jpm-stockholders-equity'].value },
            { companyId: accepted.companyId, label: 'Microsoft', value: null, note: 'Not reported in the retained SEC Submissions publication' }
        ]
    });
    requireCondition(
        accepted.identity.fiscalYearEnd === '06-30' && cmgAccepted.identity.fiscalYearEnd === '12-31' && jpmAccepted.identity.fiscalYearEnd === '12-31'
        && crossFiscalComparability.comparable === false
        && crossFiscalComparability.reasonCodes.length === 1 && crossFiscalComparability.reasonCodes[0] === 'fiscal-calendar-mismatch'
        && ['growth', 'statistic', 'rank'].every((operation) => crossFiscalComparability.operations[operation].state === 'unavailable' && crossFiscalComparability.operations[operation].value === null && crossFiscalComparability.operations[operation].reasonCodes[0] === 'fiscal-calendar-mismatch')
        && crossFiscalComparability.bases[0].valueState === 'unavailable' && crossFiscalComparability.bases[1].value === '2830607000'
        && alignedComparability.comparable === true && alignedComparability.reasonCodes.length === 0
        && alignedComparability.operations.statistic.state === 'available' && alignedComparability.operations.statistic.value === '182634303500'
        && alignedComparability.operations.rank.state === 'available' && alignedComparability.operations.rank.value[0].companyId === jpmAccepted.companyId
        && equityChart.rows.length === 3 && equityChart.rows[0].valueText === '2830607000 USD' && equityChart.rows[2].state === 'unavailable' && equityChart.rows[2].value === null,
        'C010-PUBLICATION-SCHEMA',
        'the comparability boundary silently computed a mixed-fiscal comparison, failed to compute an aligned one, or the accessible chart table dropped a real reported value'
    );
    lines.push('[company-fundamentals] SCN-010-007: mixed-fiscal MSFT/CMG comparison withholds growth, statistic, and rank with the exact fiscal-calendar reason while the aligned CMG/JPM equity statistic (182634303500) and rank compute from real reported values');

    if (!sourceArtifact.limitations.some((limitation) => limitation.startsWith('Exact raw SEC response bytes retained'))) {
        lines.push('[company-fundamentals] source capture: BLOCKED retained bytes lack accepted exact-capture provenance');
        lines.push('[company-fundamentals] validation: BLOCKED');
        return { ok: false, lines, configFingerprint, sourceContentSha256, manifestSha256: manifest.manifestSha256 };
    }
    lines.push('[company-fundamentals] source capture: exact raw SEC response bytes retained');
    lines.push('[company-fundamentals] validation: PASS');

    return { ok: true, lines, configFingerprint, sourceContentSha256, manifestSha256: manifest.manifestSha256 };
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;
if (invokedPath === import.meta.url) {
    try {
        const argumentsAfterScript = process.argv.slice(2);
        requireCondition(argumentsAfterScript.length <= 1, 'C010-CLI', 'expected no arguments or one exact mode');
        const requestedMode = argumentsAfterScript[0];
        const overlayCaptureModes = {
            '--capture-sec-submissions-cmg': ['sec-cik-0001058090', 'sec-submissions'],
            '--capture-sec-companyfacts-cmg': ['sec-cik-0001058090', 'sec-companyfacts'],
            '--capture-sec-submissions-jpm': ['sec-cik-0000019617', 'sec-submissions'],
            '--capture-sec-companyfacts-jpm': ['sec-cik-0000019617', 'sec-companyfacts']
        };
        const overlayBuildModes = {
            '--build-overlay-cmg': 'sec-cik-0001058090',
            '--build-overlay-jpm': 'sec-cik-0000019617'
        };
        let result;
        if (requestedMode === undefined) {
            result = await validateCompanyFundamentalsFoundation();
        } else if (requestedMode === captureMode) {
            result = await captureSecSubmissions();
        } else if (requestedMode === rebuildMode) {
            result = await rebuildFoundationFromRetained();
        } else if (overlayCaptureModes[requestedMode]) {
            result = await captureOverlaySecArtifact(overlayCaptureModes[requestedMode][0], overlayCaptureModes[requestedMode][1]);
        } else if (overlayBuildModes[requestedMode]) {
            result = await buildOverlayPublicationFromRetained(overlayBuildModes[requestedMode]);
        } else {
            throw Object.assign(new Error('unknown company-fundamentals validator mode'), { code: 'C010-CLI' });
        }
        result.lines.forEach((line) => console.log(line));
        if (!result.ok) process.exitCode = 1;
    } catch (error) {
        console.error(`[company-fundamentals] validation: FAIL ${error.code || 'C010-PUBLICATION-SCHEMA'} ${error.message}`);
        process.exitCode = 1;
    }
}