#!/usr/bin/env node

import { spawn } from 'node:child_process';
import {
    closeSync,
    existsSync,
    mkdirSync,
    openSync,
    readdirSync,
    readFileSync,
    renameSync,
    rmSync,
    statSync,
    writeFileSync
} from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { distinctRowsBy, reassertCompanyOwnerReadDisclosure, trackedAsOfReader } from './brief-refresh.mjs';
import { RESEARCH_AGENDA_CONTRACTS, runResearchSidePool } from './research-agenda-generation.mjs';
import { BRIEF_PAYLOAD_BUDGET_CONTRACT, briefEventContractInstruction } from './validate-brief-payload.mjs';
import { attentionVerbContractInstruction } from './build-attention-items.mjs';
import { BRIEF_NARRATIVE_FIELDS_REQUIRED } from './reader-vocabulary.mjs';
import { NARRATIVE_WEB_ALLOWLIST } from './web-evidence-policy.mjs';

const ROOT = process.cwd();

/* rlcockpit.js is a UMD dual module, not ESM: createRequire takes the module.exports
   branch. Requiring it here is what makes the composer and the validator share the ONE
   output-budget measurement rather than each carrying its own character count. */
const RLCOCKPIT = createRequire(import.meta.url)(resolve(ROOT, 'rlcockpit.js'));
const PAYLOAD_PATH = resolve(ROOT, 'market-brief.payload.json');
const CONFIG_PATH = resolve(ROOT, 'market-brief.config.json');
const SNAPSHOT_PATH = resolve(ROOT, 'market-brief.snapshot.json');
const HISTORY_PATH = resolve(ROOT, 'brief-history.jsonl');
const TOOLS_PATH = resolve(ROOT, 'tools.json');
const WATCHLIST_PATH = resolve(ROOT, 'watchlist.json');
const WORK_DIR = resolve(ROOT, '.brief-work');
const TOOL_BUNDLE_PATH = process.env.BRIEF_TOOL_BUNDLE ? resolve(process.env.BRIEF_TOOL_BUNDLE) : null;
const REQUIRE_TOOL_BUNDLE = process.env.BRIEF_REQUIRE_COMPLETE_RUN === '1';
const RESEARCH_AGENDA_PATH = resolve(ROOT, 'research-agenda.json');
const RESEARCH_CACHE_PATH = process.env.BRIEF_RESEARCH_CACHE ? resolve(process.env.BRIEF_RESEARCH_CACHE) : null;
const RESEARCH_PUBLICATION_CANDIDATE_PATH = process.env.BRIEF_RESEARCH_PUBLICATION_CANDIDATE
    ? resolve(process.env.BRIEF_RESEARCH_PUBLICATION_CANDIDATE) : null;
const RESEARCH_PAYLOAD_CANDIDATE_PATH = process.env.BRIEF_RESEARCH_PAYLOAD_CANDIDATE
    ? resolve(process.env.BRIEF_RESEARCH_PAYLOAD_CANDIDATE) : null;
const RESEARCH_CACHE_VERSION = 'research-generation-cache/v2';
let researchPreparation = null;
let researchRuntime = null;
let researchTreeBaseline = null;

const copilotBin = process.env.BRIEF_COPILOT_BIN || 'copilot';
const model = process.env.BRIEF_MODEL || 'claude-opus-4.8';
const timeoutSeconds = positiveInteger(process.env.BRIEF_NARRATIVE_TIMEOUT, 1800);
const laneAttempts = Math.min(3, positiveInteger(process.env.BRIEF_LANE_ATTEMPTS, 1));
const laneConcurrency = Math.min(4, positiveInteger(process.env.BRIEF_LANE_CONCURRENCY, 4));
const exitGraceSeconds = positiveInteger(process.env.BRIEF_LANE_EXIT_GRACE, 60);
const terminateGraceSeconds = positiveInteger(process.env.BRIEF_LANE_TERMINATE_GRACE, 5);
const transientBackoffSeconds = positiveInteger(process.env.BRIEF_LANE_TRANSIENT_BACKOFF_SECONDS, 60);
const windowId = process.env.BRIEF_WINDOW || 'pre-market';
const todayEt = process.env.BRIEF_TODAY || new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());

const lanes = [
    {
        id: 'core',
        keys: ['nextSession', 'dataAsOf', 'regime', 'backdrop', 'psychology'],
        web: true,
        instructions: `Own the posture and structural frame. Author nextSession FIRST for snapshot.nextSessionDate with at most config.thresholds.nextSessionMaxActions. Every action must use hold|trim|add|hedge|rotate and include subject, rationale, horizon, structuralAnchor, trigger, invalidation, confidence, and deepLink. Keep tactical confidence at or below the configured cap. dataAsOf must truthfully label bars, options, macro, and events, and dataAsOf.labels must carry the SAME four keys as condensed reader-facing versions of those four narratives — both are required reader copy and the publish path refuses a payload that omits either. Name the regime and crowd psychology, structural trend, macro cycle, priced-in view, asymmetry, levels, and falsifiers.`
    },
    {
        id: 'signals',
        keys: ['attention', 'recommendations', 'events'],
        web: true,
        /* The events KEY NAMES are deliberately NOT written here. They are rendered by the publish
           gate's briefEventContractInstruction() from the very constants that gate refuses on, so
           the instruction and the gate cannot describe two different contracts.

           Prose alone did not hold them: the earlier instruction said "every probability is an
           estimate" and never named a key, so a run emitted `probability` for `prob`, `detail` for
           `expectedEffect`, and dropped `psychologyNote` entirely. Naming them here instead would
           fix that run and reopen the same gap the first time the contract gains a field — the
           gate would arm, this sentence would not, and the author would again be refused over a
           key nobody asked them to write. scripts/selftest.mjs asserts this literal holds no
           second copy of the key list.

           The ATTENTION terms below are the opposite case and are stated in full on purpose: they
           are decision-attention/v1 requirement NAMES, not payload key names, and the events key
           scan above must stay clean of them — so the transmission-path sentence says "declare"
           rather than "name", which is an enforced scenario key. */
        instructions: `Own actionable changes and catalysts. attention must contain at most config.thresholds.attentionMaxCards ranked items. Every attention item must concern an instrument on the committed watchlist, and its headline must carry that instrument's exact ticker: the publication gate resolves the item's subject by matching a watchlist ticker in your authored text, and refuses anything outside the watchlist scope. An item about a benchmark such as SPY, or about a macro theme, cannot be published as an attention item no matter how well authored — put that read in recommendations instead, where no such scope applies. For every attention item author only the judgement: a headline of at most 120 characters, the falsifiability triple of an escalation trigger, an invalidation and an expiry instant, and the four judgement enums — verb, horizon, severity and imminence. ${attentionVerbContractInstruction()} Author no serialized envelope field for an attention item; the publish-time build step derives each of those from a committed contract, and an attention item missing any authored judgement field is refused by the publication gate rather than defaulted. recommendations must be concrete instruments with direction, levels or relative-strength triggers, invalidation, horizon, confidence, and deepLink. A causal-rotation-lab read whose metrics.planEligible is not true belongs only in tool coverage: do not reference it or its candidate ids in attention or recommendations, because it may not consume an action slot until its owner marks it plan-eligible. events must be nearest-first and cover imminent catalysts through roughly the next 10 trading days; every scenario odds figure is a labeled estimate with its inputs shown, the scenario odds within each catalyst sum to 1, and stale or unverified facts are labeled. ${briefEventContractInstruction()}`
    },
    {
        id: 'groups',
        keys: ['groups', 'watchlistNotes'],
        web: false,
        instructions: `Own group and watchlist roll-ups. Recompute groups from snapshot.groups and current tool reads rather than carrying old numbers. Keep each registered group schema compatible with the current payload and preserve concrete breadth, notable members, structural anchors, and deep links. Cover every ticker in watchlist.json with a concise evidence-bound note; never invent position size, cost basis, or P&L.`
    },
    {
        id: 'coverage',
        keys: ['toolReads', 'toolCoverage', 'experimental'],
        web: false,
        instructions: `Own registry-wide evidence coverage. toolReads must faithfully carry the exact current Tier-A sector, ETF momentum, global rotation, and real-assets reads from snapshot.toolReads, including model-specific GLD, SLV, BTC-USD/IBIT, broad-commodity, and oil metrics. toolCoverage must contain every tools.json id exactly once and no unregistered ids, each with a specific analyzed/stale/not-relevant reason. experimental may contain only genuinely new patterns. Every item must contain exactly title, note, method, and inputs; title, note, and method are non-empty reader prose, and inputs is a non-empty string array. Do not emit the legacy id or pattern keys.`
    }
];

const researchLane = {
    id: 'research',
    keys: ['contractVersion', 'generationId', 'situations'],
    web: false,
    instructions: `Own only current situation evidence and interpretation for the selected research topics. Return contractVersion research-situation-set/v1, the supplied generationId, and one situations[] item per selected topic. Each situation must use the exact fields supplied by the input contract. Preserve every declared section. Carry evidence roles, causal paths, refuters, limitations, sources, and explicit modelInputs. Author no scenario probability, commodity range, proxy range, chart point, direction score, modelOutputs, or changeAssessment. If evidence is insufficient, set completePass false and name gaps rather than inventing a finding.`
};

function configuredResearchLane(input, topicId) {
    const policy = researchPreparation.authorInput.policy;
    return {
        ...researchLane,
        id: `research-${topicId}`,
        kind: 'research',
        input,
        attempts: policy.attempts,
        timeoutSeconds: policy.timeoutSeconds,
        maxInputBytes: policy.maxInputBytes,
        maxOutputBytes: policy.maxOutputBytes,
        policyDigest: researchPreparation.policyDigest
    };
}

const researchAcquisitionLane = {
    id: 'research-acquisition',
    keys: ['contractVersion', 'generationId', 'queries'],
    web: true,
    attempts: 1,
    timeoutSeconds: 90,
    maxInputBytes: 524288,
    maxOutputBytes: 524288,
    instructions: `Own only public source discovery for the supplied frozen query plan. Return contractVersion research-acquisition-search/v1, the supplied generationId, and exactly one queries[] row per queryPlan queryId in the same order. Each row contains exactly queryId and candidates. Each candidate contains exactly candidateId, url, title, publisher, publishedAt, sourceClass, canonicalOriginRef, supportsClaims, directionTag, and excerpts. Candidate ids begin with the queryId plus :c. Use only the query's allowed hosts, path prefixes, source classes, maxResults, cutoff, and freshness window. publishedAt is an ISO instant observed from the source. excerpts are short verbatim public-source text, never instructions or analysis. supportsClaims may name only supplied claimSpecs ids. Emit an empty candidates array when no conforming source is found. Do not author findings, probabilities, ranges, model inputs, or a response body.`
};

function positiveInteger(value, fallback) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function tail(path, maxLines = 20) {
    if (!existsSync(path)) return '';
    return readFileSync(path, 'utf8').trim().split('\n').slice(-maxLines).join('\n');
}

function laneFailureDetail(result) {
    return tail(result.stderrPath) || tail(result.stdoutPath) || result.error || `exit ${result.code}`;
}

function isTransientCopilotServiceFailure(result) {
    return /Failed to fetch GitHub CLI user login \((?:429|5\d{2})\):|GitHub returned: No server is currently available to service your request|\b(?:ECONNRESET|ETIMEDOUT|EAI_AGAIN)\b/i
        .test(laneFailureDetail(result));
}

function delay(milliseconds) {
    return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

function sameBytes(path, baseline) {
    return readFileSync(path).equals(baseline);
}

function safeClose(fd) {
    try { closeSync(fd); } catch { }
}

function readCompleteFragment(path, keys, maxBytes = Number.POSITIVE_INFINITY) {
    if (!existsSync(path)) return null;
    try {
        if (statSync(path).size > maxBytes) return null;
        const fragment = JSON.parse(readFileSync(path, 'utf8'));
        if (!hasExactFragmentKeys(fragment, keys)) return null;
        return missingRequiredLeaves(fragment, keys).length === 0 ? fragment : null;
    } catch {
        return null;
    }
}

function hasExactFragmentKeys(fragment, keys) {
    return !!fragment && typeof fragment === 'object' && !Array.isArray(fragment) &&
        Object.keys(fragment).sort().join('|') === [...keys].sort().join('|');
}

/* Owning the top-level key is not the same as answering it. `hasExactFragmentKeys`
   accepted a `regime` object with no `regime.macroCycle`, so a lane could drop a field
   the runbook asks for and still collect, publish and push; the omission only surfaced
   later as a red D13 coverage assertion against the already-committed payload. The
   required list in reader-vocabulary.mjs is the canonical answer to "which narrative
   fields must exist", so it is enforced HERE too, at the point a lane can still be
   retried. Only literal paths are checked: the wildcard patterns ('*', '[]', '**')
   describe shapes whose arity depends on the publish, and a lane that legitimately
   emits zero of them is not incomplete. */
function requiredLeavesFor(keys) {
    const owned = new Set(keys);
    return BRIEF_NARRATIVE_FIELDS_REQUIRED
        .filter((pattern) => !pattern.includes('*') && !pattern.includes('[]'))
        .map((pattern) => pattern.split('.'))
        .filter((segments) => segments.length > 1 && owned.has(segments[0]));
}

function missingRequiredLeaves(fragment, keys) {
    const missing = [];
    for (const segments of requiredLeavesFor(keys)) {
        let node = fragment;
        for (const segment of segments) {
            if (node === null || typeof node !== 'object' || !(segment in node)) { node = undefined; break; }
            node = node[segment];
        }
        if (node === undefined || node === null || node === '') missing.push(segments.join('.'));
    }
    return missing;
}

function terminateProcessGroup(child, signal) {
    try { process.kill(-child.pid, signal); }
    catch { try { child.kill(signal); } catch { } }
}

function pick(source, keys) {
    return Object.fromEntries(keys.map((key) => [key, source[key]]));
}

function readJson(path) {
    return JSON.parse(readFileSync(path, 'utf8'));
}

function captureTree(path, relative = '') {
    if (!existsSync(path)) return {};
    const captured = {};
    for (const name of readdirSync(path)) {
        const absolute = resolve(path, name);
        const childRelative = relative ? `${relative}/${name}` : name;
        if (statSync(absolute).isDirectory()) Object.assign(captured, captureTree(absolute, childRelative));
        else captured[childRelative] = readFileSync(absolute);
    }
    return captured;
}

function sameTree(path, baseline) {
    const current = captureTree(path);
    const currentKeys = Object.keys(current).sort();
    const baselineKeys = Object.keys(baseline || {}).sort();
    return JSON.stringify(currentKeys) === JSON.stringify(baselineKeys)
        && currentKeys.every((key) => current[key].equals(baseline[key]));
}

function restoreTree(path, baseline) {
    rmSync(path, { recursive: true, force: true });
    for (const [relative, bytes] of Object.entries(baseline || {})) {
        const target = resolve(path, relative);
        mkdirSync(resolve(target, '..'), { recursive: true });
        writeFileSync(target, bytes);
    }
}

function readResearchCache() {
    if (!RESEARCH_CACHE_PATH || !existsSync(RESEARCH_CACHE_PATH)) return null;
    const cached = readJson(RESEARCH_CACHE_PATH);
    const keys = Object.keys(cached || {}).sort().join('|');
    if (keys !== ['contractVersion', 'failuresByTopicId', 'generationId', 'inputFingerprint', 'policyDigest', 'researchFragment', 'retryCacheIdentity'].sort().join('|') ||
        cached.contractVersion !== RESEARCH_CACHE_VERSION || cached.generationId !== researchPreparation.generationId ||
        cached.inputFingerprint !== researchPreparation.inputFingerprint ||
        cached.policyDigest !== researchPreparation.policyDigest ||
        cached.retryCacheIdentity !== researchPreparation.retryCacheIdentity ||
                !(cached.researchFragment === null || hasExactFragmentKeys(cached.researchFragment, researchLane.keys)) ||
        !cached.failuresByTopicId || typeof cached.failuresByTopicId !== 'object' || Array.isArray(cached.failuresByTopicId) ||
        Object.values(cached.failuresByTopicId).some((reason) => typeof reason !== 'string' || !reason)) {
        throw new Error('research cache does not match the frozen generation inputs');
    }
    return cached;
}

function writeResearchCache(execution) {
    if (!RESEARCH_CACHE_PATH) return;
    const cache = {
        contractVersion: RESEARCH_CACHE_VERSION,
        generationId: researchPreparation.generationId,
        inputFingerprint: researchPreparation.inputFingerprint,
        policyDigest: researchPreparation.policyDigest,
        retryCacheIdentity: researchPreparation.retryCacheIdentity,
        failuresByTopicId: execution.failuresByTopicId,
        researchFragment: execution.authorResult && !execution.authorResult.laneError ? execution.authorResult.fragment : null
    };
    mkdirSync(resolve(RESEARCH_CACHE_PATH, '..'), { recursive: true });
    const candidatePath = RESEARCH_CACHE_PATH + '.candidate';
    writeFileSync(candidatePath, JSON.stringify(cache) + '\n');
    renameSync(candidatePath, RESEARCH_CACHE_PATH);
}

/* The memory row this run compares itself against (Feature 026 Scope 3).
   NOT simply "the run before": notes/market-brief.md §5's distinct-market-bar rule says repeated
   weekend and holiday runs over one completed close are a single observation, so the comparison
   walks back to the last row whose tracked bar differs from this one's. Four Friday runs produce
   one comparison, not four. The dedupe is brief-refresh.mjs's own `distinctRowsBy`, imported
   rather than restated, so Tier A's persistence read and this comparison cannot drift apart.
   No prior row — a first run, an empty file, a corrupt line — is absent prior state, and the
   detector answers `baseline` for it. */
function previousMemoryRow(snapshot) {
    /* The append-only ledger, NOT brief-history.recent.jsonl. The recent file is the page's
       first-load projection and carries state LABELS only; the level and flag values the change
       predicates compare live here. Reading the projection would have silently degraded every
       levelCrossed and flagRaised answer to a label comparison. */
    const abs = resolve(ROOT, 'brief-history.jsonl');
    if (!existsSync(abs)) return null;
    const symbols = Object.keys(snapshot.tracked && typeof snapshot.tracked === 'object' ? snapshot.tracked : {}).sort();
    if (!symbols.length) return null;
    const rows = [];
    for (const line of readFileSync(abs, 'utf8').split('\n')) {
        if (!line.length) continue;
        try { rows.push(JSON.parse(line)); } catch { continue; }
    }
    const readAsOf = trackedAsOfReader(symbols[0]);
    const currentAsOf = readAsOf({ tracked: snapshot.tracked });
    const distinct = distinctRowsBy(rows, readAsOf);
    for (let index = distinct.length - 1; index >= 0; index--) {
        if (readAsOf(distinct[index]) !== currentAsOf) return distinct[index];
    }
    return null;
}

function recentHistory(limit = 6) {
    const lines = readFileSync(HISTORY_PATH, 'utf8').trim().split('\n').filter(Boolean).slice(-limit);
    return lines.map((line) => {
        const row = JSON.parse(line);
        return {
            ts: row.ts,
            window: row.window,
            marketClosed: row.marketClosed,
            nextSessionDate: row.nextSessionDate,
            regimeScore: row.regimeScore,
            regimeBand: row.regimeBand,
            vix: row.vix,
            fearGreed: row.fearGreed,
            bench: row.bench,
            sectors: compactMap(row.sectors, ['rsRatio', 'rsMom', 'quad', 'accel', 'rotation', 'maStack', 'ma200Dist']),
            names: compactMap(row.names, ['px', 'mom5', 'mom21', 'mom63', 'maStack', 'ma50Dist', 'ma200Dist', 'pctFrom52wHigh']),
            groups: (row.groups || []).map((group) => ({ id: group.id, read: group.read, breadth: group.breadth }))
        };
    });
}

function compactMap(source, fields) {
    return Object.fromEntries(Object.entries(source || {}).map(([id, value]) => [id, pick(value || {}, fields)]));
}

function compactGroups(groups) {
    return (groups || []).map((group) => {
        const notableMembers = Object.entries(group.members || {})
            .map(([ticker, metrics]) => ({ ticker, ...pick(metrics, ['px', 'mom5', 'mom21', 'mom63', 'maStack', 'ma50Dist', 'ma200Dist', 'pctFrom52wHigh']) }))
            .sort((left, right) => Math.abs(right.mom21 || 0) - Math.abs(left.mom21 || 0))
            .slice(0, 5);
        return { id: group.id, label: group.label, etf: group.etf, deepLink: group.deepLink, read: group.read, breadth: group.breadth, notableMembers };
    });
}

function baseSnapshot() {
    return pick(snapshot, [
        'asOf', 'generatedAt', 'window', 'marketClosed', 'nextSessionDate',
        'dataFreshness', 'regime', 'bench'
    ]);
}

function laneInput(lane) {
    if (lane.id === 'research-acquisition') return researchPreparation.acquisitionInput;
    if (lane.kind === 'research') return lane.input;
    const current = pick(payload, lane.keys);
    const meta = { lane: lane.id, ownedKeys: lane.keys, window: windowId, todayEt };
    const commonConfig = {
        thresholds: config.thresholds,
        windows: config.windows,
        macroEvents: config.macroEvents,
        deepLinks: config.deepLinks
    };
    if (lane.id === 'core' || lane.id === 'signals') {
        return {
            meta,
            toolBriefBundle,
            snapshot: {
                ...baseSnapshot(),
                names: compactMap(snapshot.names, ['px', 'mom5', 'mom21', 'mom63', 'mom126', 'mom252', 'maStack', 'ma50Dist', 'ma200Dist', 'pctFrom52wHigh']),
                sectors: compactMap(snapshot.sectors, ['rsMom1m', 'rsMom3m', 'rsMom6m', 'rsRatio', 'rsMom', 'quad', 'accel', 'rrgState', 'rotation', 'maStack', 'ma50Dist', 'ma200Dist']),
                groups: compactGroups(snapshot.groups),
                toolReads: snapshot.toolReads
            },
            recentHistory: history,
            config: commonConfig,
            current
        };
    }
    if (lane.id === 'groups') {
        return {
            meta,
            toolBriefBundle,
            snapshot: {
                ...baseSnapshot(),
                names: compactMap(snapshot.names, ['px', 'mom5', 'mom21', 'mom63', 'maStack', 'ma50Dist', 'ma200Dist', 'pctFrom52wHigh']),
                groups: snapshot.groups,
                toolReads: snapshot.toolReads
            },
            config: { thresholds: config.thresholds, track: { groups: config.track?.groups || [] }, deepLinks: config.deepLinks },
            watchlist,
            current
        };
    }
    return {
        meta,
        toolBriefBundle,
        snapshot: { ...baseSnapshot(), toolReads: snapshot.toolReads, toolCoverage: snapshot.toolCoverage },
        tools: (tools.tools || []).map((tool) => ({ id: tool.id, title: tool.title, file: tool.file, status: tool.status })),
        config: { deepLinks: config.deepLinks },
        current: { toolCoverage: current.toolCoverage, experimental: current.experimental }
    };
}

function runLane(lane, laneAttempt) {
    const outputPath = resolve(WORK_DIR, `${lane.id}.json`);
    const inputPath = resolve(WORK_DIR, `${lane.id}.input.json`);
    const stdoutPath = resolve(WORK_DIR, `${lane.id}.attempt-${laneAttempt}.stdout.log`);
    const stderrPath = resolve(WORK_DIR, `${lane.id}.attempt-${laneAttempt}.stderr.log`);
    writeFileSync(outputPath, '{}\n');
    writeFileSync(inputPath, JSON.stringify(laneInput(lane), null, 2) + '\n');
    const inputBytes = statSync(inputPath).size;
    if (lane.maxInputBytes && inputBytes > lane.maxInputBytes) {
        return Promise.resolve({ ok: false, error: 'input-bytes-over-cap', lane, laneAttempt, outputPath, stdoutPath, stderrPath, elapsedMs: 0 });
    }

    const bundleInstruction = toolBriefBundle
        ? 'Consume every toolBriefBundle.tools outcome; preserve explicit unavailable, not-applicable, and coverage-only states rather than inventing evidence.'
        : 'This legacy ad-hoc run has no pre-final tool bundle; use only the refreshed deterministic data and owning-tool reads supplied.';
    /* The bundle's outcome CODES are contract vocabulary. They are correct in structured
       fields and wrong in a sentence a reader has to understand, so the lane must carry the
       state faithfully while naming it in plain words. The parenthetical form is called out
       explicitly because that is what a lane actually produced: it applied the translation
       and then kept the code in brackets beside it. Enforced by
       scripts/validate-brief-payload.mjs on the publish path and by
       scripts/audit-reader-legibility.mjs on the rendered page (D13). */
    const vocabularyInstruction = 'Never write a contract status code into narrative prose. Carry the state, name it in plain words: coverage-only -> "no call this cycle", not-integrated -> "does not feed the brief yet", not-applicable -> "not applicable this window", dependency-pending -> "not available in this view yet". Replace the code, do not annotate it: keeping the code beside its translation in parentheses, brackets, quotes or after a dash or semicolon is the SAME violation, so "no call this cycle (coverage-only; does not feed the brief yet)" is rejected exactly like a bare "coverage-only". Status codes belong in structured fields only, and the publish gate blocks the run on any narrative field that carries one.';
    /* A call with no attributable break level cannot ever be scored, so publishing one adds a
       claim to the ledger that the scorecard must permanently carry as not-evaluable. The
       invalidation field is what the evaluator reads for the risk side; if it carries no price,
       the call is unscoreable no matter how well argued it is.

       The instruction states the SIDE because stating "a numeric price level" alone was not
       enough. BUG-006: a published hedge carried four numerals in its invalidation field and was
       still unscoreable, because every one of them was a `below` level and a falling price is a
       hedge WORKING. recommendation-body.mjs re-attributes such a level to the trigger side, which
       is correct, and the call ended with zero invalidation levels. It also states the numeric FORM
       because the same call wrote "at/above the 765 call wall" and the extractor refuses a bare
       integer, so no `above` level survived either. Enforced by
       scripts/validate-brief-payload.mjs on the publish path (D16). */
    const evaluabilityInstruction = 'Every tactical or swing call MUST carry, in its invalidation field, a numeric price level on a named instrument that is in the committed universe, written with an explicit direction word AND on the side that would prove the call WRONG. The side is decided by the call, not by preference: for a long-biased call (add, rotate, hold) the invalidation level must be BELOW a price (for example "a daily close below 740.09"); for a short-biased call (trim, hedge) it must be ABOVE a price (for example "a daily close above ~765.0"). A level describing the call WORKING is a TRIGGER, not an invalidation, and it will not be accepted: a hedge is not invalidated by the market falling, and a long is not invalidated by the market rising. Write the number with a decimal or a leading tilde ("~765.0", "765.00"); a bare integer ("765"), a percentage, a relative-strength threshold, a moving-average name with no number, or a purely qualitative condition is NOT a level. The publish gate re-derives this from your own prose and withholds any tactical or swing call that resolves to unscoreable, so a call written with only the working side is dropped from the brief. If the thesis genuinely has no direction-correct price level, withhold the call yourself rather than publishing one that can never be scored.';
    const prompt = lane.id === 'research-acquisition' || lane.kind === 'research'
        ? `You are the ${lane.id} side process for generation ${researchPreparation.generationId}. Read only .brief-work/${lane.id}.input.json. Do not edit any tracked file. Overwrite only .brief-work/${lane.id}.json with one strict JSON object, no markdown, containing exactly these top-level keys: ${lane.keys.join(', ')}. ${lane.instructions}`
        : `You are one parallel lane of the Actionable Market Brief for window=${windowId}, today ET=${todayEt}. All allowed repository evidence, current schema examples, and relevant recent history for this lane have already been compacted into .brief-work/${lane.id}.input.json. Read that one input file and no other repository file. The deterministic data and owning-tool reads are already refreshed. ${bundleInstruction} ${vocabularyInstruction} ${evaluabilityInstruction} Structure first, tactical noise last. Count persistence by distinct market-bar dates, not repeated intraday runs. Label estimates, proxies, carried data, and unavailable inputs honestly. Do not edit market-brief.payload.json, market-brief.config.json, the tool bundle, or any other repository file. Overwrite only .brief-work/${lane.id}.json with one strict JSON object, no markdown, containing exactly these top-level keys: ${lane.keys.join(', ')}. ${lane.instructions}`;

    const args = ['-p', prompt, '--allow-all-tools', '--deny-tool=shell'];
    if (lane.web && process.env.BRIEF_NO_WEB !== '1') {
        for (const host of NARRATIVE_WEB_ALLOWLIST) args.push(`--allow-url=${host}`);
    }
    args.push('--no-ask-user', '--model', model, '--no-color', '--no-auto-update', '--log-level', 'error', '-C', ROOT);

    const stdoutFd = openSync(stdoutPath, 'w');
    const stderrFd = openSync(stderrPath, 'w');
    const startedAt = Date.now();
    const laneAttemptLimit = lane.attempts || laneAttempts;
    const laneTimeoutSeconds = lane.timeoutSeconds || timeoutSeconds;
    const policyTelemetry = lane.policyDigest ? ` policyDigest=${lane.policyDigest}` : '';
    console.log(`[brief-parallel] lane=${lane.id} started attempt=${laneAttempt}/${laneAttemptLimit} keys=${lane.keys.join(',')} inputBytes=${inputBytes}${policyTelemetry}`);

    return new Promise((resolveLane) => {
        let settled = false;
        let timedOut = false;
        let child;
        let timer;
        let readinessTimer;
        let exitGraceTimer;
        let forceKillTimer;
        let terminationReason = null;
        const finish = (result) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            clearInterval(readinessTimer);
            clearTimeout(exitGraceTimer);
            clearTimeout(forceKillTimer);
            safeClose(stdoutFd);
            safeClose(stderrFd);
            const fragment = readCompleteFragment(outputPath, lane.keys, lane.maxOutputBytes);
            const normalExit = result.code === 0 && !timedOut;
            resolveLane({
                ...result,
                ok: !!fragment,
                fragment,
                lane,
                laneAttempt,
                outputPath,
                stdoutPath,
                stderrPath,
                elapsedMs: Date.now() - startedAt,
                recovered: !!fragment && !normalExit,
                terminationReason
            });
        };

        const requestTermination = (reason) => {
            if (!child || terminationReason) return;
            terminationReason = reason;
            terminateProcessGroup(child, 'SIGTERM');
            forceKillTimer = setTimeout(() => terminateProcessGroup(child, 'SIGKILL'), terminateGraceSeconds * 1000);
        };

        try {
            child = spawn(copilotBin, args, {
                cwd: ROOT,
                detached: true,
                env: {
                    ...process.env,
                    BRIEF_LANE_ID: lane.id,
                    BRIEF_LANE_ATTEMPT: String(laneAttempt),
                    BRIEF_LANE_KEYS: JSON.stringify(lane.keys),
                    BRIEF_LANE_OUTPUT: outputPath
                },
                stdio: ['ignore', stdoutFd, stderrFd]
            });
        } catch (error) {
            finish({ ok: false, error: error.message });
            return;
        }

        readinessTimer = setInterval(() => {
            if (exitGraceTimer || !readCompleteFragment(outputPath, lane.keys, lane.maxOutputBytes)) return;
            exitGraceTimer = setTimeout(() => requestTermination('post-write-grace'), exitGraceSeconds * 1000);
        }, 250);

        timer = setTimeout(() => {
            timedOut = true;
            requestTermination('timeout');
        }, laneTimeoutSeconds * 1000);

        child.once('error', (error) => finish({ ok: false, error: error.message }));
        child.once('exit', (code, signal) => finish({
            ok: code === 0 && !timedOut,
            code,
            signal,
            error: timedOut ? `timed out after ${laneTimeoutSeconds}s` : null
        }));
    });
}

function validateLaneResult(result) {
    if (!result.ok) {
        const detail = laneFailureDetail(result);
        throw new Error(`lane ${result.lane.id} failed after ${Math.round(result.elapsedMs / 1000)}s\n${detail}`);
    }
    if (!result.fragment) {
        throw new Error(`lane ${result.lane.id} did not write one complete owned-key fragment`);
    }
    return result.fragment;
}

async function runLaneWithRetries(lane) {
    let lastError;
    let result;
    const attemptLimit = lane.attempts || laneAttempts;
    for (let attempt = 1; attempt <= attemptLimit; attempt += 1) {
        result = await runLane(lane, attempt);
        try {
            result.fragment = validateLaneResult(result);
            if (result.recovered) {
                console.log(`[brief-parallel] lane=${result.lane.id} recovered complete fragment after ${result.terminationReason || 'non-zero-exit'}`);
            }
            console.log(`[brief-parallel] lane=${result.lane.id} complete seconds=${Math.round(result.elapsedMs / 1000)}`);
            return result;
        } catch (error) {
            lastError = error;
            if (attempt < attemptLimit) {
                if (isTransientCopilotServiceFailure(result)) {
                    const backoffSeconds = transientBackoffSeconds * attempt;
                    console.log(`[brief-parallel] lane=${lane.id} attempt=${attempt}/${attemptLimit} hit a transient Copilot service failure; waiting ${backoffSeconds}s before retrying only this lane`);
                    await delay(backoffSeconds * 1000);
                } else {
                    console.log(`[brief-parallel] lane=${lane.id} attempt=${attempt}/${attemptLimit} failed; retrying only this lane`);
                }
            }
        }
    }
    return { ...result, laneError: lastError };
}

async function runLanePool(items, concurrency) {
    const results = new Array(items.length);
    let cursor = 0;
    async function worker() {
        while (cursor < items.length) {
            const index = cursor;
            cursor += 1;
            results[index] = await runLaneWithRetries(items[index]);
        }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
    return results;
}

async function runResearchPipeline() {
    const cached = readResearchCache();
    if (cached) {
        console.log(`[brief-parallel] research cache reused generation=${cached.generationId}`);
        return {
            acquisitionResult: null,
            failuresByTopicId: cached.failuresByTopicId,
            authorResult: { fragment: cached.researchFragment, laneError: null },
            cached: true
        };
    }
    const acquisitionStartedAt = Date.now();
    let acquisitionResult = null;
    if (researchPreparation.acquisitionInput) acquisitionResult = await runLaneWithRetries(researchAcquisitionLane);
    const searchFragment = acquisitionResult && !acquisitionResult.laneError ? acquisitionResult.fragment : null;
    const bound = await researchRuntime.bindResearchAgendaAcquisition({
        preparation: researchPreparation,
        searchFragment,
        deadlineAtMs: acquisitionStartedAt + researchPreparation.policy.totalAcquisitionMs
    });
    if (!bound.ok) throw new Error(`research acquisition binding failed: ${bound.error?.reason || 'unknown'}`);
    const acquisitionTelemetry = bound.value.acquisitionResult.value.telemetry;
    console.log(`[brief-parallel] research acquisition telemetry calls=${acquisitionTelemetry.calls} peakConcurrency=${acquisitionTelemetry.peakConcurrency}/${acquisitionTelemetry.concurrency} maxConcurrentFetchesPerTopic=${acquisitionTelemetry.maxConcurrentFetchesPerTopic} elapsedMs=${acquisitionTelemetry.elapsedMs} policyDigest=${acquisitionTelemetry.policyDigest}`);
    researchPreparation.authorInput = bound.value.authorInput;
    const authorTopics = researchPreparation.authorInput.selectedTopics.filter(
        (entry) => !Object.prototype.hasOwnProperty.call(bound.value.acquisitionFailuresByTopicId, entry.topic.topicId)
    );
    const authorPool = await runResearchSidePool({
        topics: authorTopics,
        generationId: researchPreparation.generationId,
        policy: researchPreparation.agendaPolicy,
        policyDigest: researchPreparation.policyDigest,
        authorFn: async (request, authorContext) => {
            const selectedTopic = authorTopics.find((entry) => entry.topic.topicId === request.topicId);
            const input = {
                ...researchPreparation.authorInput,
                selectedTopics: [selectedTopic]
            };
            const lane = configuredResearchLane(input, request.topicId);
            let laneResult = null;
            try {
                laneResult = await runLane(lane, authorContext.attempt);
                const fragment = validateLaneResult(laneResult);
                if (fragment.contractVersion !== RESEARCH_AGENDA_CONTRACTS.situationSet ||
                    fragment.generationId !== researchPreparation.generationId ||
                    !Array.isArray(fragment.situations) || fragment.situations.length !== 1 ||
                    fragment.situations[0]?.topicId !== request.topicId) {
                    throw new Error(`lane ${lane.id} did not return exactly one matching research situation`);
                }
                return fragment.situations[0];
            } finally {
                rmSync(resolve(WORK_DIR, `${lane.id}.input.json`), { force: true });
                rmSync(resolve(WORK_DIR, `${lane.id}.json`), { force: true });
            }
        }
    });
    if (!authorPool.ok) throw new Error(`research author side pool failed: ${authorPool.error?.reason || 'unknown'}`);
    const authorTelemetry = authorPool.value.telemetry;
    console.log(`[brief-parallel] research author telemetry calls=${authorTelemetry.calls} attempts=${authorTelemetry.attempts} peakConcurrency=${authorTelemetry.peakConcurrency}/${authorTelemetry.concurrency} inputBytes=${authorTelemetry.maxObservedInputBytes}/${authorTelemetry.maxInputBytes} outputBytes=${authorTelemetry.maxObservedOutputBytes}/${authorTelemetry.maxOutputBytes} elapsedMs=${authorTelemetry.elapsedMs} policyDigest=${authorTelemetry.policyDigest}`);
    const researchFragment = {
        contractVersion: RESEARCH_AGENDA_CONTRACTS.situationSet,
        generationId: researchPreparation.generationId,
        situations: authorTopics
            .map((entry) => authorPool.value.situationsByTopicId[entry.topic.topicId])
            .filter(Boolean)
    };
    writeFileSync(resolve(WORK_DIR, 'research.json'), JSON.stringify(researchFragment) + '\n');
    const authorResult = {
        fragment: researchFragment,
        laneError: null,
        telemetry: authorPool.value.telemetry
    };
    const failuresByTopicId = {
        ...bound.value.acquisitionFailuresByTopicId,
        ...authorPool.value.failuresByTopicId
    };
    const execution = {
        acquisitionResult,
        failuresByTopicId,
        authorResult
    };
    writeResearchCache(execution);
    console.log(`[brief-parallel] research cache stored generation=${researchPreparation.generationId}`);
    return execution;
}

function loadFragment(result) {
    if (result.laneError) throw result.laneError;
    return result.fragment;
}

const payloadBaseline = readFileSync(PAYLOAD_PATH);
const configBaseline = readFileSync(CONFIG_PATH);
const payload = JSON.parse(payloadBaseline.toString('utf8'));
const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8'));
const config = JSON.parse(configBaseline.toString('utf8'));
const tools = readJson(TOOLS_PATH);
const watchlist = readJson(WATCHLIST_PATH);
const history = recentHistory();
if (REQUIRE_TOOL_BUNDLE && (!TOOL_BUNDLE_PATH || !existsSync(TOOL_BUNDLE_PATH))) {
    throw new Error('BRIEF_TOOL_BUNDLE must name the validated pre-final tool brief bundle');
}
const toolBundleBaseline = TOOL_BUNDLE_PATH && existsSync(TOOL_BUNDLE_PATH) ? readFileSync(TOOL_BUNDLE_PATH) : null;
const toolBriefBundle = toolBundleBaseline ? JSON.parse(toolBundleBaseline.toString('utf8')) : null;
const expectedToolIds = (tools.tools || []).filter((tool) => tool && tool.briefing && tool.briefing.role === 'source').map((tool) => tool.id);
if (toolBriefBundle && (toolBriefBundle.contractVersion !== 'brief-tool-bundle/v1'
    || JSON.stringify(toolBriefBundle.orderedSourceToolIds) !== JSON.stringify(expectedToolIds)
    || !Array.isArray(toolBriefBundle.tools)
    || toolBriefBundle.tools.length !== expectedToolIds.length
    || toolBriefBundle.tools.some((tool, index) => !tool || tool.toolId !== expectedToolIds[index] || !tool.read || !tool.brief))) {
    throw new Error('pre-final tool brief bundle is incomplete or does not match tools.json');
}

rmSync(WORK_DIR, { recursive: true, force: true });
mkdirSync(WORK_DIR, { recursive: true });

if (existsSync(RESEARCH_AGENDA_PATH)) {
    if (!RESEARCH_PUBLICATION_CANDIDATE_PATH || !RESEARCH_PAYLOAD_CANDIDATE_PATH) {
        throw new Error('research agenda publication requires private publication and payload candidate paths');
    }
    researchRuntime = await import('./research-agenda-refresh.mjs');
    researchPreparation = researchRuntime.prepareResearchAgendaRuntime({ root: ROOT, snapshot, config, payload });
    researchTreeBaseline = captureTree(resolve(ROOT, 'research/agenda'));
}

let succeeded = false;
try {
    console.log(`[brief-parallel] starting ${lanes.length} write-disjoint lanes with maxConcurrency=${laneConcurrency} laneAttempts=${laneAttempts} exitGrace=${exitGraceSeconds}s`);
    const [results, researchExecution] = await Promise.all([
        runLanePool(lanes, laneConcurrency),
        researchPreparation ? runResearchPipeline() : Promise.resolve(null)
    ]);
    /* Lanes routinely finish by writing a complete fragment and then failing to exit, so the
       recovery path is load-bearing rather than exceptional. Report the per-run rate here so a
       trend is readable from the run log instead of re-derived by grepping per-lane lines. */
    const recoveredLanes = results.filter((result) => result && result.recovered);
    const recoveryDetail = recoveredLanes
        .map((result) => `${result.lane.id}:${result.terminationReason || 'non-zero-exit'}`)
        .join(',');
    console.log(`[brief-parallel] lane recovery summary lanes=${results.length} recovered=${recoveredLanes.length}${recoveryDetail ? ` via=${recoveryDetail}` : ''}`);
    if (!sameBytes(PAYLOAD_PATH, payloadBaseline) || !sameBytes(CONFIG_PATH, configBaseline)
        || (toolBundleBaseline && !sameBytes(TOOL_BUNDLE_PATH, toolBundleBaseline))) {
        writeFileSync(PAYLOAD_PATH, payloadBaseline);
        writeFileSync(CONFIG_PATH, configBaseline);
        throw new Error('a lane edited a protected publication file or the frozen tool bundle');
    }
    if (researchPreparation && !sameTree(resolve(ROOT, 'research/agenda'), researchTreeBaseline)) {
        restoreTree(resolve(ROOT, 'research/agenda'), researchTreeBaseline);
        throw new Error('the research lane edited protected agenda history or pointer state');
    }

    for (const result of results) Object.assign(payload, loadFragment(result));
    /* BUG-010 §3.3 — the coverage lane owns toolCoverage and may rewrite the company reason in any
       wording it likes, so the two safety-bearing facts are restored here rather than requested of
       it. Re-assertion, not a prompt constraint: a constraint asks the model to comply, this makes
       compliance structural. It throws when the entry is missing or duplicated, which lands in the
       catch below and restores the baseline — a window that cannot carry the disclosure does not
       publish. */
    const companyDisclosure = reassertCompanyOwnerReadDisclosure(payload, (relative) => readJson(resolve(ROOT, relative)));
    console.log(`[brief-parallel] company owner-read disclosure ${companyDisclosure.reasserted ? 'reasserted' : 'already present'} on ${companyDisclosure.id}`);
    payload.toolId = 'market-brief';
    payload.window = windowId;
    payload.asOf = snapshot.asOf || snapshot.generatedAt || new Date().toISOString();
    payload.generatedAt = new Date().toISOString();

    /* Cross-asset legs (Feature 026 Scope 2). Emitted BEFORE the budget block below, because
       the leg labels and every dark sentence are default-visible fields the budget measures.

       Tier A measured; this resolves. rlcockpit.js owns the one resolver, so the rule that a
       non-finite measurement raises a dark state instead of a zero has exactly one
       implementation. Dark cards are emitted ahead of the readings in the block's own key
       order, so a reader reaches what the brief cannot say before what it can.

       A snapshot predating the Tier-A measurement carries no block at all. That is not an
       excuse to omit the required slots: each one is published as a dark state naming that
       absence, which is the only path in this file that calls darkState directly. */
    const crossAssetPolicy = config['cross-asset/v1'];
    if (crossAssetPolicy && typeof crossAssetPolicy === 'object' && Array.isArray(crossAssetPolicy.legs)) {
        const measured = snapshot.crossAsset && typeof snapshot.crossAsset === 'object'
            ? snapshot.crossAsset.legs : null;
        const dark = [];
        const legs = [];
        for (const legPolicy of crossAssetPolicy.legs) {
            if (!legPolicy || typeof legPolicy.id !== 'string') continue;
            if (!measured || typeof measured !== 'object') {
                if (legPolicy.required === true) {
                    dark.push(RLCOCKPIT.darkState(legPolicy,
                        `this run's snapshot carries no cross-asset measurement, so the ${legPolicy.id} leg was never measured`,
                        legPolicy.withheld));
                }
                continue;
            }
            const resolved = RLCOCKPIT.resolveLeg(legPolicy, measured[legPolicy.id] ?? null, crossAssetPolicy.sessions);
            if (resolved === null) continue;
            if (resolved.shape === 'dark') dark.push(resolved);
            else legs.push(resolved);
        }
        payload.crossAsset = {
            contractVersion: 'cross-asset/v1',
            sessions: crossAssetPolicy.sessions,
            dark,
            legs,
            standing: snapshot.crossAsset?.standing ?? []
        };
        console.log(`[brief-parallel] cross-asset legs resolved=${legs.length} dark=${dark.length}`
            + ` required=${crossAssetPolicy.legs.filter((leg) => leg && leg.required === true).length}`);
    }

    /* Delta-only publishing (Feature 026 Scope 3). Emitted after the legs and BEFORE the budget
       block, because `changed[].line` and `rollUp.line` are declared default-visible fields the
       budget measures — and because the whole point of the roll-up is that it costs one line
       where twelve paragraphs used to sit.

       The kind is decided by rlcockpit.js from TWO STATE OBJECTS AND THE VOCABULARY. No narrative
       reaches it, which is why rewriting every sentence about an unchanged instrument cannot buy
       that instrument a paragraph. Each changed entry carries the two states it was decided from
       so the validator can RECOMPUTE the kind and refuse one it cannot reproduce — a composer
       that asserts a crossing its own states do not show is refused rather than believed.

       An unchanged instrument's symbol reaches the payload in exactly one place: the roll-up's
       drawer body, as a symbol and a state token. There is no path here that writes a sentence
       about it. */
    const changeVocabulary = config['change-vocabulary/v1'];
    if (changeVocabulary && typeof changeVocabulary === 'object' && Array.isArray(changeVocabulary.trackedSet)) {
        const priorRow = previousMemoryRow(snapshot);
        const curStates = snapshot.tracked && typeof snapshot.tracked === 'object' ? snapshot.tracked : {};
        const prevStates = priorRow && priorRow.tracked && typeof priorRow.tracked === 'object' ? priorRow.tracked : {};
        const kinds = {};
        const changed = [];
        for (const symbol of [...changeVocabulary.trackedSet].sort()) {
            const cur = curStates[symbol] ?? null;
            if (cur === null) continue;
            const prev = prevStates[symbol] ?? null;
            const kind = RLCOCKPIT.changeKind(prev, cur, changeVocabulary);
            kinds[symbol] = kind;
            if (kind === null || kind === 'baseline') continue;
            changed.push({ symbol, kind, line: `${symbol} ${kind}`, prev, cur });
        }
        const rollUp = RLCOCKPIT.rollUpFrom(curStates, kinds);
        /* A snapshot predating the Tier-A tracked block carries no memory at all. That is not an
           excuse to publish an empty roll-up claiming twelve instruments are accounted for: with
           nothing tracked this run makes NO delta claim, so it emits no changed list and no
           roll-up, and the validator has nothing to balance. The claim appears the first run Tier
           A writes a tracked block, and from then on it must balance. */
        if (Object.keys(curStates).length) {
            payload.changed = changed;
            payload.rollUp = rollUp;
        }
        console.log(`[brief-parallel] delta tracked=${Object.keys(curStates).length} changed=${changed.length} unchanged=${rollUp.count} baseline=${rollUp.baselineCount}`
            + ` balances=${RLCOCKPIT.rollUpBalances(changed.length, rollUp, Object.keys(curStates).length)}`);
    }

    /* Output budget — allocation, then measurement, then the stamp, in that order and in
       this ONE place. Both exits below derive from `payload`: the research branch spreads
       it into `finalized.transaction.payload` and the direct branch serializes it through
       the candidate-then-rename, so a stamp assigned here reaches the private candidate
       and the published file alike. Assigning at either write instead would need two
       copies of this block and they could drift.

       Allocation runs BEFORE measurement so the persisted figure describes what was
       actually published rather than what composition proposed. The measurement is taken
       before `budget` and `contractVersion` are attached, so the block never measures its
       own metadata — `disclosedTotal` stays a reader-prose figure and not a self-count.

       The measurement is written on every run, passing runs included, so a maintainer can
       judge whether the caps are right without waiting for an incident. rlcockpit.js owns
       the one measurement; nothing here re-derives a character count, and nothing here
       cuts a string — allocation demotes whole items or the validator refuses the run. */
    const outputBudgetPolicy = config['output-budget/v1'];
    if (outputBudgetPolicy && typeof outputBudgetPolicy === 'object' && !Array.isArray(outputBudgetPolicy)) {
        const selection = RLCOCKPIT.selectDefaultVisible(payload, outputBudgetPolicy);
        Object.assign(payload, selection.published);
        payload.budget = RLCOCKPIT.measureDefaultVisible(payload, outputBudgetPolicy);
        payload.contractVersion = BRIEF_PAYLOAD_BUDGET_CONTRACT;
        console.log(`[brief-parallel] output budget total=${payload.budget.total} disclosed=${payload.budget.disclosedTotal}`
            + ` demoted=${selection.demoted.length} heldBack=${selection.heldBack.length} violations=${payload.budget.violations.length}`);
    }

    if (payload.nextSession?.sessionDate !== snapshot.nextSessionDate) {
        throw new Error(`collected nextSession ${payload.nextSession?.sessionDate || '<missing>'} does not match snapshot ${snapshot.nextSessionDate}`);
    }

    if (researchPreparation) {
        const researchResult = researchExecution?.authorResult;
        const researchFragment = researchResult && !researchResult.laneError ? researchResult.fragment : null;
        const finalized = researchRuntime.finalizeResearchAgendaRuntime({
            preparation: researchPreparation,
            researchFragment,
            payload,
            acquisitionFailuresByTopicId: researchExecution?.failuresByTopicId || {},
            promote: false
        });
        if (!finalized.ok) throw new Error(`research agenda transaction failed: ${finalized.error?.reason || 'unknown'}`);
        payload.researchAgenda = finalized.transaction.payload.researchAgenda;
        payload.toolReads = finalized.transaction.payload.toolReads;
        writeFileSync(RESEARCH_PAYLOAD_CANDIDATE_PATH, JSON.stringify(finalized.transaction.payload, null, 2) + '\n');
        writeFileSync(RESEARCH_PUBLICATION_CANDIDATE_PATH, JSON.stringify({
            contractVersion: researchRuntime.RESEARCH_AGENDA_PUBLICATION_CANDIDATE_VERSION,
            candidate: finalized.candidate,
            failuresByTopicId: finalized.failuresByTopicId
        }) + '\n');
        console.log(`[brief-parallel] research agenda generation=${researchPreparation.generationId} failures=${Object.keys(finalized.failuresByTopicId).length} publication=private-candidate`);
    } else {
        const candidatePath = `${PAYLOAD_PATH}.candidate`;
        writeFileSync(candidatePath, JSON.stringify(payload, null, 2) + '\n');
        renameSync(candidatePath, PAYLOAD_PATH);
    }
    succeeded = true;
        console.log(researchPreparation
            ? `[brief-parallel] collected final payload from ${lanes.length} critical lanes plus the research side lane`
            : `[brief-parallel] collected final payload from ${lanes.length} lanes`);
} catch (error) {
    writeFileSync(PAYLOAD_PATH, payloadBaseline);
    writeFileSync(CONFIG_PATH, configBaseline);
    if (RESEARCH_PUBLICATION_CANDIDATE_PATH) rmSync(RESEARCH_PUBLICATION_CANDIDATE_PATH, { force: true });
    if (RESEARCH_PAYLOAD_CANDIDATE_PATH) rmSync(RESEARCH_PAYLOAD_CANDIDATE_PATH, { force: true });
    if (researchPreparation && researchTreeBaseline) restoreTree(resolve(ROOT, 'research/agenda'), researchTreeBaseline);
    console.error(`[brief-parallel] FAIL: ${error.message}`);
    process.exitCode = 1;
} finally {
    if (succeeded || process.env.BRIEF_KEEP_WORK !== '1') rmSync(WORK_DIR, { recursive: true, force: true });
}