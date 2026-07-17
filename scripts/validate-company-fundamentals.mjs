import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { get as httpsGet } from 'node:https';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import { gunzipSync, gzipSync } from 'node:zlib';

import '../rlcompany.js';

const company = globalThis.RLCOMPANY;
const repoRootUrl = new URL('../', import.meta.url);
const configUrl = new URL('../company-fundamentals.config.json', import.meta.url);
const sourceCaptureUrl = new URL('../tests/fixtures/company-fundamentals/source-qualified/sec-submissions-msft.extract.json', import.meta.url);
const currentPointerPath = 'data/company-fundamentals/companies/sec-cik-0000789019/current.json';
const captureMode = '--capture-sec-submissions-msft';
const rebuildMode = '--rebuild-from-retained';
const capturePayloadPath = 'tests/fixtures/company-fundamentals/source-qualified/sec-submissions-msft.raw.json.gz.b64';
const capturePayloadUrl = new URL(`../${capturePayloadPath}`, import.meta.url);

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
    let removedObjectCount = 0;
    for (const path of oldPaths) {
        if (newPaths.has(path)) continue;
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
    const ownerRead = structuredClone(prior.objects[prior.manifest.ownerReadRef.objectId]);
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
    ownerRead.modelPackRef = modelPackRef;

    const objects = {};
    objects[prior.manifest.identityRef.objectId] = identity;
    objects[prior.manifest.summaryRef.objectId] = summary;
    objects[prior.manifest.dossierRef.objectId] = dossier;
    objects[prior.manifest.ownerReadRef.objectId] = ownerRead;
    objects[prior.manifest.historyRefs[0].objectId] = history;
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
    lines.push(`[company-fundamentals] rebuild immutable objects: ${Object.keys(objects).length}`);
    lines.push(`[company-fundamentals] rebuild manifest hash: ${manifest.manifestSha256}`);
    lines.push(`[company-fundamentals] rebuild obsolete objects removed: ${removedObjectCount}`);
    lines.push('[company-fundamentals] rebuild pointer: replaced last');
    lines.push('[company-fundamentals] rebuild result: PASS');
    return { ok: true, lines, manifestSha256: manifest.manifestSha256, objectCount: Object.keys(objects).length, removedObjectCount };
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
        requireCondition(argumentsAfterScript.length === 0 || argumentsAfterScript[0] === captureMode || argumentsAfterScript[0] === rebuildMode, 'C010-CLI', 'unknown company-fundamentals validator mode');
        const result = argumentsAfterScript[0] === captureMode
            ? await captureSecSubmissions()
            : argumentsAfterScript[0] === rebuildMode
                ? await rebuildFoundationFromRetained()
                : await validateCompanyFundamentalsFoundation();
        result.lines.forEach((line) => console.log(line));
        if (!result.ok) process.exitCode = 1;
    } catch (error) {
        console.error(`[company-fundamentals] validation: FAIL ${error.code || 'C010-PUBLICATION-SCHEMA'} ${error.message}`);
        process.exitCode = 1;
    }
}