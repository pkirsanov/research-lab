#!/usr/bin/env node

import { spawn } from 'node:child_process';
import {
    closeSync,
    existsSync,
    mkdirSync,
    openSync,
    readFileSync,
    renameSync,
    rmSync,
    writeFileSync
} from 'node:fs';
import { resolve } from 'node:path';
import { briefEventContractInstruction } from './validate-brief-payload.mjs';

const ROOT = process.cwd();
const PAYLOAD_PATH = resolve(ROOT, 'market-brief.payload.json');
const CONFIG_PATH = resolve(ROOT, 'market-brief.config.json');
const SNAPSHOT_PATH = resolve(ROOT, 'market-brief.snapshot.json');
const HISTORY_PATH = resolve(ROOT, 'brief-history.jsonl');
const TOOLS_PATH = resolve(ROOT, 'tools.json');
const WATCHLIST_PATH = resolve(ROOT, 'watchlist.json');
const WORK_DIR = resolve(ROOT, '.brief-work');
const TOOL_BUNDLE_PATH = process.env.BRIEF_TOOL_BUNDLE ? resolve(process.env.BRIEF_TOOL_BUNDLE) : null;
const REQUIRE_TOOL_BUNDLE = process.env.BRIEF_REQUIRE_COMPLETE_RUN === '1';

const copilotBin = process.env.BRIEF_COPILOT_BIN || 'copilot';
const model = process.env.BRIEF_MODEL || 'claude-opus-4.8';
const timeoutSeconds = positiveInteger(process.env.BRIEF_NARRATIVE_TIMEOUT, 1800);
const laneAttempts = Math.min(3, positiveInteger(process.env.BRIEF_LANE_ATTEMPTS, 1));
const laneConcurrency = Math.min(4, positiveInteger(process.env.BRIEF_LANE_CONCURRENCY, 4));
const exitGraceSeconds = positiveInteger(process.env.BRIEF_LANE_EXIT_GRACE, 60);
const terminateGraceSeconds = positiveInteger(process.env.BRIEF_LANE_TERMINATE_GRACE, 5);
const windowId = process.env.BRIEF_WINDOW || 'pre-market';
const todayEt = process.env.BRIEF_TODAY || new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());

const lanes = [
    {
        id: 'core',
        keys: ['nextSession', 'dataAsOf', 'regime', 'backdrop', 'psychology'],
        web: true,
        instructions: `Own the posture and structural frame. Author nextSession FIRST for snapshot.nextSessionDate with at most config.thresholds.nextSessionMaxActions. Every action must use hold|trim|add|hedge|rotate and include subject, rationale, horizon, structuralAnchor, trigger, invalidation, confidence, and deepLink. Keep tactical confidence at or below the configured cap. dataAsOf must truthfully label bars, options, macro, and events. Name the regime and crowd psychology, structural trend, macro cycle, priced-in view, asymmetry, levels, and falsifiers.`
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
           second copy of the key list. */
        instructions: `Own actionable changes and catalysts. attention must contain at most config.thresholds.attentionMaxCards ranked items. recommendations must be concrete instruments with direction, levels or relative-strength triggers, invalidation, horizon, confidence, and deepLink. events must be nearest-first and cover imminent catalysts through roughly the next 10 trading days; every scenario odds figure is a labeled estimate with its inputs shown, the scenario odds within each catalyst sum to 1, and stale or unverified facts are labeled. ${briefEventContractInstruction()}`
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
        instructions: `Own registry-wide evidence coverage. toolReads must faithfully carry the exact current Tier-A sector, ETF momentum, global rotation, and real-assets reads from snapshot.toolReads, including model-specific GLD, SLV, BTC-USD/IBIT, broad-commodity, and oil metrics. toolCoverage must contain every tools.json id exactly once and no unregistered ids, each with a specific analyzed/stale/not-relevant reason. experimental may contain only genuinely new patterns with method and inputs.`
    }
];

const webAllow = [
    'finance.yahoo.com', 'query1.finance.yahoo.com', 'query2.finance.yahoo.com',
    'production.dataviz.cnn.io', 'www.federalreserve.gov', 'www.bls.gov',
    'www.bea.gov', 'fred.stlouisfed.org', 'api.stlouisfed.org', 'www.cnbc.com',
    'www.reuters.com', 'www.marketwatch.com', 'www.investing.com',
    'www.cmegroup.com', 'www.treasurydirect.gov'
];

function positiveInteger(value, fallback) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function tail(path, maxLines = 20) {
    if (!existsSync(path)) return '';
    return readFileSync(path, 'utf8').trim().split('\n').slice(-maxLines).join('\n');
}

function sameBytes(path, baseline) {
    return readFileSync(path).equals(baseline);
}

function safeClose(fd) {
    try { closeSync(fd); } catch { }
}

function readCompleteFragment(path, keys) {
    if (!existsSync(path)) return null;
    try {
        const fragment = JSON.parse(readFileSync(path, 'utf8'));
        const actual = Object.keys(fragment).sort();
        const expected = [...keys].sort();
        return JSON.stringify(actual) === JSON.stringify(expected) ? fragment : null;
    } catch {
        return null;
    }
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
    const prompt = `You are one parallel lane of the Actionable Market Brief for window=${windowId}, today ET=${todayEt}. All allowed repository evidence, current schema examples, and relevant recent history for this lane have already been compacted into .brief-work/${lane.id}.input.json. Read that one input file and no other repository file. The deterministic data and owning-tool reads are already refreshed. ${bundleInstruction} ${vocabularyInstruction} ${evaluabilityInstruction} Structure first, tactical noise last. Count persistence by distinct market-bar dates, not repeated intraday runs. Label estimates, proxies, carried data, and unavailable inputs honestly. Do not edit market-brief.payload.json, market-brief.config.json, the tool bundle, or any other repository file. Overwrite only .brief-work/${lane.id}.json with one strict JSON object, no markdown, containing exactly these top-level keys: ${lane.keys.join(', ')}. ${lane.instructions}`;

    const args = ['-p', prompt, '--allow-all-tools', '--deny-tool=shell'];
    if (lane.web && process.env.BRIEF_NO_WEB !== '1') {
        for (const host of webAllow) args.push(`--allow-url=${host}`);
    }
    args.push('--no-ask-user', '--model', model, '--no-color', '--no-auto-update', '--log-level', 'error', '-C', ROOT);

    const stdoutFd = openSync(stdoutPath, 'w');
    const stderrFd = openSync(stderrPath, 'w');
    const startedAt = Date.now();
    console.log(`[brief-parallel] lane=${lane.id} started attempt=${laneAttempt}/${laneAttempts} keys=${lane.keys.join(',')} inputBytes=${readFileSync(inputPath).length}`);

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
            const fragment = readCompleteFragment(outputPath, lane.keys);
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
            if (exitGraceTimer || !readCompleteFragment(outputPath, lane.keys)) return;
            exitGraceTimer = setTimeout(() => requestTermination('post-write-grace'), exitGraceSeconds * 1000);
        }, 250);

        timer = setTimeout(() => {
            timedOut = true;
            requestTermination('timeout');
        }, timeoutSeconds * 1000);

        child.once('error', (error) => finish({ ok: false, error: error.message }));
        child.once('exit', (code, signal) => finish({
            ok: code === 0 && !timedOut,
            code,
            signal,
            error: timedOut ? `timed out after ${timeoutSeconds}s` : null
        }));
    });
}

function validateLaneResult(result) {
    if (!result.ok) {
        const detail = tail(result.stderrPath) || tail(result.stdoutPath) || result.error || `exit ${result.code}`;
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
    for (let attempt = 1; attempt <= laneAttempts; attempt += 1) {
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
            if (attempt < laneAttempts) {
                console.log(`[brief-parallel] lane=${lane.id} attempt=${attempt}/${laneAttempts} failed; retrying only this lane`);
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

let succeeded = false;
try {
    console.log(`[brief-parallel] starting ${lanes.length} write-disjoint lanes with maxConcurrency=${laneConcurrency} laneAttempts=${laneAttempts} exitGrace=${exitGraceSeconds}s`);
    const results = await runLanePool(lanes, laneConcurrency);
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

    for (const result of results) Object.assign(payload, loadFragment(result));
    payload.toolId = 'market-brief';
    payload.window = windowId;
    payload.asOf = snapshot.asOf || snapshot.generatedAt || new Date().toISOString();
    payload.generatedAt = new Date().toISOString();
    if (payload.nextSession?.sessionDate !== snapshot.nextSessionDate) {
        throw new Error(`collected nextSession ${payload.nextSession?.sessionDate || '<missing>'} does not match snapshot ${snapshot.nextSessionDate}`);
    }

    const candidatePath = `${PAYLOAD_PATH}.candidate`;
    writeFileSync(candidatePath, JSON.stringify(payload, null, 2) + '\n');
    renameSync(candidatePath, PAYLOAD_PATH);
    succeeded = true;
    console.log(`[brief-parallel] collected final payload from ${lanes.length} lanes`);
} catch (error) {
    writeFileSync(PAYLOAD_PATH, payloadBaseline);
    writeFileSync(CONFIG_PATH, configBaseline);
    console.error(`[brief-parallel] FAIL: ${error.message}`);
    process.exitCode = 1;
} finally {
    if (succeeded || process.env.BRIEF_KEEP_WORK !== '1') rmSync(WORK_DIR, { recursive: true, force: true });
}