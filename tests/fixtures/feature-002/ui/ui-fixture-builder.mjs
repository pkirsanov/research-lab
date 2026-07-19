/*
 * Feature 002 Scope 10 — shared-brief UI fixture builder.
 *
 * Emits a coherent, byte-deterministic `briefs/` static-artifact graph with REAL SHA-256 hashes
 * so the production `rlbrief.js` verifier (content-type + byte-cap + contract + path + run +
 * SHA-256) renders it exactly as it would render a real published run. The repo ships no
 * `briefs/` graph (cutover is deferred), so the browser tests serve THIS fixture from a temp dir.
 *
 * Hashes are computed bottom-up: an object's bytes are hashed BEFORE its ref (path + sha256) is
 * embedded in its parent, so pointer -> manifest -> read/brief/final -> evidence all reconcile.
 * The builder derives the ordered source tool IDs from the live registry (never a literal count).
 */
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const REGISTRY = JSON.parse(readFileSync(join(ROOT, 'tools.json'), 'utf8'));
const ENTRIES = Array.isArray(REGISTRY) ? REGISTRY : (REGISTRY.tools || REGISTRY.registry || []);
const FINAL_ENTRY = ENTRIES.find((e) => e.briefing && e.briefing.role === 'final-aggregator');
const SOURCE_ENTRIES = ENTRIES.filter((e) => e.briefing && e.briefing.role === 'source');

function sha256(text) { return 'sha256:' + createHash('sha256').update(text, 'utf8').digest('hex'); }
function ref(files, path, obj, extra) {
    const text = JSON.stringify(obj);
    files.set(path, text);
    return Object.assign({ path, sha256: sha256(text), bytes: Buffer.byteLength(text, 'utf8') }, extra || {});
}
function jsonlRef(files, path, rows) {
    const text = rows.map((r) => JSON.stringify(r)).join('\n');
    files.set(path, text);
    return { path, sha256: sha256(text), bytes: Buffer.byteLength(text, 'utf8') };
}

/* the bounded read.display block for a session variant (values are display strings, not computed). */
function sessionDisplay(session) {
    if (session === 'pre-market') {
        return {
            kind: 'pre-market',
            officialClose: { value: '452.10', at: '2026-07-14T20:00:00.000Z' },
            indicative: { latest: '454.30', latestAt: '2026-07-15T11:25:00.000Z' }
        };
    }
    if (session === 'after-hours') {
        return {
            kind: 'after-hours',
            officialClose: { value: '455.00', at: '2026-07-15T20:00:00.000Z' },
            indicative: { latest: '454.10', latestAt: '2026-07-15T22:30:00.000Z' }
        };
    }
    if (session === 'regular') {
        return { kind: 'regular', indicative: { latest: '453.50', latestAt: '2026-07-15T17:45:00.000Z' } };
    }
    return null;
}
function comparableDisplay(variant) {
    if (variant === 'thin') return { state: 'thin', sample: 6, coverage: 0.45, median: 98000, percentile: 55, relativeVolume: 1.02, unusualness: 'not-qualified', volumeState: 'partial' };
    return { state: 'qualified', sample: 12, coverage: 0.8, median: 100000, percentile: 65, relativeVolume: 1.1, unusualness: 'ordinary', volumeState: 'partial' };
}
function reportDisplay(state) {
    if (state === 'upcoming') return { reportType: 'CPI', state: 'upcoming' };
    if (state === 'released') return { reportType: 'CPI', state: 'released', metrics: [{ metricId: 'headline-mom-sa', actual: '0.3', consensus: '0.2', previous: '0.1', surprise: '0.1', unit: '%' }] };
    if (state === 'disputed') return { reportType: 'CPI', state: 'disputed', sourceRecords: [{ sourceId: 'bls-public-api-v2', value: '0.3', at: '2026-07-15T12:30:00.000Z' }, { sourceId: 'manual-consensus-artifact', value: '0.4', at: '2026-07-15T12:31:00.000Z' }] };
    if (state === 'revised') return { reportType: 'CPI', state: 'revised', metrics: [{ metricId: 'headline-mom-sa', actual: '0.4', consensus: '0.2', previous: '0.1', surprise: '0.2', unit: '%' }], revision: { originalValue: '0.3', originalAt: '2026-07-15T12:30:00.000Z', revisionNumber: 1, value: '0.4', at: '2026-07-16T12:30:00.000Z' } };
    return null;
}
function reactionDisplay() {
    return { state: 'complete', baseline: '452.00', segments: [{ sessionKind: 'regular', latest: '454.50', cutoffAt: '2026-07-15T17:00:00.000Z' }, { sessionKind: 'after-hours', latest: '455.20', cutoffAt: '2026-07-15T22:00:00.000Z', revision: '1' }] };
}

/**
 * Build a coherent brief graph.
 * opts: { runId, cutoffAt, toolId (focus source), session, comparable, report, reaction, lowNoise,
 *         calendar, window, priorThesis, addedSource, corrupt, omitPointer }
 */
export function buildGraph(opts = {}) {
    const files = new Map();
    const runId = opts.runId || 'run-2026-07-15T0730';
    const cutoffAt = opts.cutoffAt || '2026-07-15T11:30:00.000Z';
    const month = '2026-07';
    const focusId = opts.toolId || 'sector-research-lab';
    const session = opts.session || 'pre-market';
    const registryFingerprint = 'sha256:' + 'ab'.repeat(32);

    const sourceIds = SOURCE_ENTRIES.map((e) => e.id);
    const addedId = 'added-source-fixture-lab';
    const overrideEntry = opts.addedSource
        ? { id: addedId, title: 'Added Source Fixture', file: 'added-source-fixture-lab.html', briefing: { role: 'source', profile: 'live-market', readAdapter: 'added-source-fixture-v1', readContractVersion: 'tool-model-read/v1', freshnessPolicy: 'daily-market-bars-v1', recommendationPolicy: 'market-action-v1', budgetPolicy: 'live-market-v1' } }
        : null;
    const allSourceIds = opts.addedSource ? sourceIds.concat(addedId) : sourceIds.slice();
    const participantCount = allSourceIds.length + 1;
    const sourceCount = allSourceIds.length;

    const profileOf = (id) => {
        if (id === addedId) return 'live-market';
        const e = SOURCE_ENTRIES.find((x) => x.id === id);
        return (e && e.briefing.profile) || 'live-market';
    };

    /* ── evidence objects (referenced by the focus read; loaded on disclosure) ── */
    const evidenceRefs = [];
    const focusProfile = profileOf(focusId);
    const wantSession = focusProfile === 'live-market' && (opts.report == null) && !opts.reaction;
    if (wantSession) {
        const aggRef = ref(files, `briefs/objects/evidence/sessions/SPY/agg-${session}.json`, {
            contractVersion: 'session-aggregate/v1', symbol: 'SPY', sessionKind: session === 'regular' ? 'regular' : session,
            tradingDate: '2026-07-15', state: session === 'after-hours' ? 'available' : 'partial', cutoffAt,
            latest: sessionDisplay(session) ? sessionDisplay(session).indicative.latest : null,
            officialRegularCloseAnchor: session === 'pre-market' ? { tradingDate: '2026-07-14', close: '452.10', at: '2026-07-14T20:00:00.000Z' } : null,
            reasonCodes: ['session-open'], observationRefs: [], sourceRefs: ['sha256:' + 'cd'.repeat(32)]
        }, { evidenceType: 'session-aggregate', state: session === 'after-hours' ? 'available' : 'partial', cutoffAt });
        evidenceRefs.push(aggRef);
        const cmpRef = ref(files, `briefs/objects/evidence/sessions/SPY/cmp-${session}.json`, {
            contractVersion: 'comparable-volume-baseline/v1', state: comparableDisplay(opts.comparable).state,
            unusualness: comparableDisplay(opts.comparable).unusualness, cutoffAt,
            eligibleSessionCount: comparableDisplay(opts.comparable).sample, coverage: comparableDisplay(opts.comparable).coverage,
            median: comparableDisplay(opts.comparable).median, midrankPercentile: comparableDisplay(opts.comparable).percentile,
            eligibleSessions: [], excludedSessions: []
        }, { evidenceType: 'comparable-volume-baseline', state: comparableDisplay(opts.comparable).state, cutoffAt });
        evidenceRefs.push(cmpRef);
    }
    if (opts.report) {
        const rd = reportDisplay(opts.report);
        const repRef = ref(files, `briefs/objects/evidence/reports/bls-cpi-2026-06/rep-${opts.report}.json`, {
            contractVersion: 'released-report-evidence/v1', reportId: 'bls:cpi:2026-06', reportType: 'CPI', reportPeriod: '2026-06',
            state: rd.state, metrics: rd.metrics || [], sourceRecords: rd.sourceRecords || [], revisionNumber: rd.revision ? rd.revision.revisionNumber : 0, cutoffAt, reasonCodes: []
        }, { evidenceType: 'released-report-evidence', state: rd.state, cutoffAt });
        evidenceRefs.push(repRef);
    }
    if (opts.reaction) {
        const reactRef = ref(files, `briefs/objects/evidence/reactions/bls-cpi-2026-06/SPY/react.json`, {
            contractVersion: 'event-market-reaction/v1', reactionId: 'react-1', symbol: 'SPY', state: 'complete', cutoffAt,
            preReleaseBaseline: { value: '452.00' }, segments: [], reasonCodes: []
        }, { evidenceType: 'event-market-reaction', state: 'complete', cutoffAt });
        evidenceRefs.push(reactRef);
    }

    /* ── the focus source read (rich display) + brief ── */
    const eligible = focusProfile === 'live-market' && !opts.lowNoise;
    const display = {};
    if (wantSession && sessionDisplay(session)) { display.session = sessionDisplay(session); display.comparableVolume = comparableDisplay(opts.comparable); }
    if (opts.report) display.report = reportDisplay(opts.report);
    if (opts.reaction) display.reaction = reactionDisplay();
    if (opts.lowNoise) display.lowNoise = true;
    if (focusProfile === 'live-market') {
        display.calendar = opts.calendar
            ? { dateState: opts.calendar, closureLabel: opts.calendar === 'holiday' ? 'Independence Day (observed)' : null, nextOpenTradingDate: '2026-07-16', officialCloseAt: opts.calendar === 'early-close' ? '2026-07-15T17:00:00.000Z' : null }
            : { dateState: 'regular', nextOpenTradingDate: '2026-07-16' };
    }

    function buildReadBrief(id, rich) {
        const profile = profileOf(id);
        const isEligible = rich ? eligible : false;
        const read = {
            contractVersion: 'tool-model-read/v1', toolId: id, profile, role: 'source', runId, status: opts.readStatus || 'fresh',
            evaluatedAt: cutoffAt, modelAsOf: '2026-07-15T11:00:00.000Z', sourceAsOf: '2026-07-15T11:25:00.000Z', freshUntil: '2026-07-15T13:00:00.000Z',
            summary: (rich && opts.unsafe) ? `<script>alert(document.domain)</script> ${id} owner-model read` : `${id} owner-model read for the ${session} window.`,
            facts: [], sources: rich ? [{ sourceId: 'yahoo-chart', asOf: '2026-07-15T11:25:00.000Z', citation: (rich && opts.unsafe) ? 'javascript:alert(1)' : 'https://query1.finance.yahoo.com/v8/finance/chart/SPY' }] : [],
            recommendationEligibility: { eligible: isEligible, reasonCode: isEligible ? 'live-eligible' : 'not-eligible', actionFamilies: isEligible ? ['rotate'] : [], subjectBoundary: 'sector-etfs' },
            evidenceInterpretations: rich && isEligible ? [{ conclusion: 'supporting', ownerModel: 'sector-owning-model/v3', evidenceRefs: [], actionEligibilityEffect: 'permits' }] : [],
            evidenceRefs: rich ? evidenceRefs.map((r) => ({ contractVersion: 'evidence-reference/v1', evidenceType: r.evidenceType, path: r.path, sha256: r.sha256, state: r.state, cutoffAt: r.cutoffAt })) : [],
            evidenceBoundary: ['Educational research only.'], limitations: ['Best-effort public data; extended-hours coverage may be partial.'],
            deepLink: `${id}.html`, marketSessionEvidenceRef: null,
            display: rich ? display : undefined, fingerprint: 'sha256:' + '11'.repeat(32)
        };
        const readRef = ref(files, `briefs/objects/reads/${id}/read.json`, read);
        const recs = (rich && isEligible) ? [{ originRecommendationKey: 'sha256:' + '22'.repeat(32), actionFamily: 'rotate', subjects: ['XLK', 'XLF'], horizon: 'swing', trigger: 'XLK/XLF ratio holds above the 21-day mean', invalidation: 'ratio breaks the 50-day support', confidenceScore: 64 }] : [];
        const brief = {
            contractVersion: 'tool-brief/v1', toolId: id, profile, runId, readRef: { path: readRef.path, sha256: readRef.sha256 },
            outcome: recs.length ? 'newly-authored' : (opts.lowNoise ? 'no-recommendation' : (rich ? 'coverage-only' : 'coverage-only')),
            status: 'validated', summary: (rich && opts.unsafe) ? `<script>alert(document.domain)</script> ${id} authored brief text` : `${id} brief: ${recs.length ? 'rotation lean into strength' : 'no action this window'}.`,
            decisionRationale: 'Bounded by the cited owner read facts.', recommendations: recs, nextSteps: [], windowUse: rich ? 'primary' : 'context',
            noRecommendationReason: recs.length ? undefined : (opts.lowNoise ? 'unusual evidence did not meet the owner action gate' : 'no eligible action for this profile'),
            evidenceBoundary: ['Educational research only.'], limitations: []
        };
        const briefRef = ref(files, `briefs/objects/tool-briefs/${id}/brief.json`, brief);
        return { read: { path: readRef.path, sha256: readRef.sha256 }, brief: { path: briefRef.path, sha256: briefRef.sha256 }, outcome: brief.outcome, profile };
    }

    const sourcesMap = {};
    for (const id of allSourceIds) {
        const rb = buildReadBrief(id, id === focusId);
        sourcesMap[id] = { read: rb.read, brief: rb.brief, outcome: rb.outcome, freshness: 'current', evidenceApplicable: rb.profile === 'live-market' };
    }

    /* ── final brief (Market Brief) ── */
    const coverage = allSourceIds.map((id) => ({ toolId: id, outcome: profileOf(id) === 'off-theme' ? 'coverage-only' : 'included' }))
        .concat([{ toolId: FINAL_ENTRY.id, outcome: 'aggregated' }]);
    const finalActions = opts.lowNoise ? [] : [{ actionFamily: 'rotate', subjects: ['XLK', 'XLF'], aggregationGroup: 'grp-rotation-1', ownerInterpretationRefs: ['oi-sector-1'] }];
    const windowContext = {
        window: opts.window || 'pre-market', scheduledFor: '2026-07-15T11:30:00.000Z', cutoffAt,
        officialClose: (opts.window === 'after-hours') ? { value: '455.00', at: '2026-07-15T20:00:00.000Z' } : (session === 'pre-market' ? { value: '452.10', at: '2026-07-14T20:00:00.000Z' } : null)
    };
    if (opts.window === 'morning') {
        if (opts.priorThesis === 'insufficient') { /* omit priorWindowThesis => insufficient */ }
        else windowContext.priorWindowThesis = { summary: 'Pre-market rotation lean into tech strength', ownerState: 'confirmed', cutoffAt: '2026-07-15T11:30:00.000Z' };
    }
    const final = {
        contractVersion: 'final-brief/v1', runId, runFingerprint: 'sha256:' + '33'.repeat(32), cutoffAt,
        registry: { participantCount, sourceCount, fingerprint: registryFingerprint },
        coverage, finalActions,
        conflicts: opts.conflict ? [{ subjects: ['XLE'], reason: 'two owners disagree on energy direction' }] : [],
        excluded: [{ toolId: 'waterfront-polo-lab', reason: 'off-theme' }],
        windowContext, lowNoise: !!opts.lowNoise
    };
    const finalRef = ref(files, `briefs/objects/final-briefs/final.json`, final);

    /* ── history partitions + index + history pointer ── */
    const toolRows = [
        { eventType: 'authored', occurredAt: '2026-07-15T11:30:00.000Z', stream: `tools/${focusId}`, detail: 'newly authored' },
        { eventType: 'reaffirmed', occurredAt: '2026-07-15T15:30:00.000Z', stream: `tools/${focusId}`, detail: 'unchanged evidence' }
    ];
    const evidenceRows = [
        { eventType: 'report.released', occurredAt: '2026-07-15T12:30:00.000Z', stream: 'evidence', detail: 'CPI headline released' },
        { eventType: 'report.revised', occurredAt: '2026-07-16T12:30:00.000Z', stream: 'evidence', detail: 'CPI revision appended' }
    ];
    const finalRows = [{ eventType: 'final.published', occurredAt: '2026-07-15T11:31:00.000Z', stream: 'final', detail: 'pre-market final' }];
    const recRows = [{ eventType: 'proposed', occurredAt: '2026-07-15T11:30:00.000Z', stream: 'recommendations', detail: 'rotate XLK/XLF' }];

    const toolPart = jsonlRef(files, `briefs/history/tools/${focusId}/${month}.jsonl`, toolRows);
    const evPart = jsonlRef(files, `briefs/history/evidence/${month}.jsonl`, evidenceRows);
    const finalPart = jsonlRef(files, `briefs/history/final/${month}.jsonl`, finalRows);
    const recPart = jsonlRef(files, `briefs/history/recommendations/${month}.jsonl`, recRows);
    if (opts.corrupt === 'malformed-partition') files.set(`briefs/history/tools/${focusId}/${month}.jsonl`, JSON.stringify(toolRows[0]) + '\n{not valid json');

    const indexObj = {
        contractVersion: 'brief-index/v1', canonicalMonth: month,
        partitions: [
            { stream: `tools/${focusId}`, month, path: toolPart.path, sha256: toolPart.sha256, rows: toolRows.length },
            { stream: 'evidence', month, path: evPart.path, sha256: evPart.sha256, rows: evidenceRows.length },
            { stream: 'final', month, path: finalPart.path, sha256: finalPart.sha256, rows: finalRows.length },
            { stream: 'recommendations', month, path: recPart.path, sha256: recPart.sha256, rows: recRows.length }
        ]
    };
    const indexRef = ref(files, `briefs/indexes/idx-2026-07/history.json`, indexObj);
    const recIndexRef = ref(files, `briefs/indexes/idx-2026-07/recommendations.json`, { contractVersion: 'brief-index/v1', canonicalMonth: month, partitions: [{ stream: 'recommendations', month, path: recPart.path, sha256: recPart.sha256, rows: recRows.length }] });
    ref(files, `briefs/history-current.json`, { contractVersion: 'brief-history-pointer/v1', index: { path: indexRef.path, sha256: indexRef.sha256 }, recommendationIndex: { path: recIndexRef.path, sha256: recIndexRef.sha256 } });

    /* ── evidence bundle + manifest + current pointer ── */
    const bundleRef = ref(files, `briefs/objects/evidence/bundle.json`, {
        contractVersion: 'market-session-evidence/v1', evidenceId: 'bundle-1', runId, cutoffAt,
        calendarSessionRef: { path: 'briefs/objects/evidence/calendars/cal.json', sha256: 'sha256:' + '44'.repeat(32) },
        state: opts.calendar === 'holiday' ? 'available' : 'available', reasonCodes: opts.calendar === 'holiday' ? ['calendar-closed'] : []
    }, { state: 'available', cutoffAt });
    const calRef = ref(files, `briefs/objects/evidence/calendars/cal.json`, {
        contractVersion: 'calendar-session/v1', calendarId: 'XNYS', calendarVersion: '2026.1', timeZone: 'America/New_York',
        tradingDate: '2026-07-15', dateState: opts.calendar || 'regular',
        closureLabel: opts.calendar === 'holiday' ? 'Independence Day (observed)' : null,
        nextOpenTradingDate: opts.calendar === 'holiday' ? '2026-07-16' : '2026-07-16'
    });

    const inventory = [];
    for (const [path, text] of files) {
        if (path === 'briefs/current.json' || path === 'briefs/runs/2026-07/' + runId + '/manifest.json') continue;
        inventory.push({ path, bytes: Buffer.byteLength(text, 'utf8'), sha256: sha256(text) });
    }
    const manifest = {
        contractVersion: 'brief-run-manifest/v1', runKey: runId, runId, runFingerprint: 'sha256:' + '55'.repeat(32),
        generation: 1, window: opts.window || 'pre-market', canonicalMonth: month, cutoffAt,
        registry: { participantCount, sourceCount, fingerprint: registryFingerprint }, inventory
    };
    const manifestRef = ref(files, `briefs/runs/2026-07/${runId}/manifest.json`, manifest);

    const pointer = {
        contractVersion: 'brief-current-pointer/v1', generation: 1, runId, cutoffAt, window: opts.window || 'pre-market',
        manifest: { path: manifestRef.path, sha256: manifestRef.sha256 },
        final: { path: finalRef.path, sha256: finalRef.sha256 },
        registry: { participantCount, sourceCount, fingerprint: registryFingerprint },
        evidenceBundle: { path: bundleRef.path, sha256: bundleRef.sha256, state: 'available', cutoffAt },
        sources: sourcesMap
    };
    /* corruption hooks for the fail-closed / state-matrix tests */
    if (opts.corrupt === 'read-hash' && pointer.sources[focusId]) pointer.sources[focusId].read.sha256 = 'sha256:' + '00'.repeat(32);
    if (opts.corrupt === 'final-hash') pointer.final.sha256 = 'sha256:' + '00'.repeat(32);
    if (opts.corrupt === 'mixed-run') { const bad = JSON.parse(files.get(finalRef.path)); bad.runId = 'run-OTHER'; const t = JSON.stringify(bad); files.set(finalRef.path, t); pointer.final.sha256 = sha256(t); }
    if (!opts.omitPointer) files.set('briefs/current.json', JSON.stringify(pointer));

    const registryOverride = overrideEntry ? { ...REGISTRY, tools: ENTRIES.concat([overrideEntry]) } : null;
    return { files, pointer, focusId, addedSourceId: opts.addedSource ? addedId : null, registryOverride, participantCount, sourceCount, month };
}

export function writeGraphToTemp(files) {
    const dir = mkdtempSync(join(tmpdir(), 'rlbrief-ui-'));
    for (const [rel, text] of files) {
        const abs = join(dir, rel);
        mkdirSync(dirname(abs), { recursive: true });
        writeFileSync(abs, text);
    }
    return dir;
}
export function removeTemp(dir) { try { rmSync(dir, { recursive: true, force: true }); } catch (e) { /* best-effort */ } }
export { ROOT, ENTRIES, SOURCE_ENTRIES, FINAL_ENTRY };
