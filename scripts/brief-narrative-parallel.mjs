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

const ROOT = process.cwd();
const PAYLOAD_PATH = resolve(ROOT, 'market-brief.payload.json');
const CONFIG_PATH = resolve(ROOT, 'market-brief.config.json');
const SNAPSHOT_PATH = resolve(ROOT, 'market-brief.snapshot.json');
const HISTORY_PATH = resolve(ROOT, 'brief-history.jsonl');
const TOOLS_PATH = resolve(ROOT, 'tools.json');
const WATCHLIST_PATH = resolve(ROOT, 'watchlist.json');
const WORK_DIR = resolve(ROOT, '.brief-work');

const copilotBin = process.env.BRIEF_COPILOT_BIN || 'copilot';
const model = process.env.BRIEF_MODEL || 'claude-opus-4.8';
const timeoutSeconds = positiveInteger(process.env.BRIEF_NARRATIVE_TIMEOUT, 1800);
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
        instructions: `Own actionable changes and catalysts. attention must contain at most config.thresholds.attentionMaxCards ranked items. recommendations must be concrete instruments with direction, levels or relative-strength triggers, invalidation, horizon, confidence, and deepLink. events must be nearest-first and cover imminent catalysts through roughly the next 10 trading days; every probability is an estimate with inputs, scenarios sum to 1, and stale or unverified facts are labeled.`
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
            sectors: row.sectors,
            names: row.names,
            groups: (row.groups || []).map((group) => ({ id: group.id, read: group.read, breadth: group.breadth }))
        };
    });
}

function baseSnapshot() {
    return pick(snapshot, [
        'asOf', 'generatedAt', 'window', 'marketClosed', 'nextSessionDate',
        'dataFreshness', 'regime', 'bench', 'names', 'sectors'
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
            snapshot: { ...baseSnapshot(), groups: snapshot.groups, toolReads: snapshot.toolReads },
            recentHistory: history,
            config: commonConfig,
            current
        };
    }
    if (lane.id === 'groups') {
        return {
            meta,
            snapshot: { ...baseSnapshot(), groups: snapshot.groups, toolReads: snapshot.toolReads },
            config: { thresholds: config.thresholds, track: { groups: config.track?.groups || [] }, deepLinks: config.deepLinks },
            watchlist,
            current
        };
    }
    return {
        meta,
        snapshot: { ...baseSnapshot(), toolReads: snapshot.toolReads, toolCoverage: snapshot.toolCoverage },
        tools: (tools.tools || []).map((tool) => ({ id: tool.id, title: tool.title, file: tool.file, status: tool.status })),
        config: { deepLinks: config.deepLinks },
        current
    };
}

function runLane(lane) {
    const outputPath = resolve(WORK_DIR, `${lane.id}.json`);
    const inputPath = resolve(WORK_DIR, `${lane.id}.input.json`);
    const stdoutPath = resolve(WORK_DIR, `${lane.id}.stdout.log`);
    const stderrPath = resolve(WORK_DIR, `${lane.id}.stderr.log`);
    writeFileSync(outputPath, '{}\n');
    writeFileSync(inputPath, JSON.stringify(laneInput(lane), null, 2) + '\n');

    const prompt = `You are one parallel lane of the Actionable Market Brief for window=${windowId}, today ET=${todayEt}. All allowed repository evidence, current schema examples, and relevant recent history for this lane have already been compacted into .brief-work/${lane.id}.input.json. Read that one input file and no other repository file. The deterministic data and owning-tool reads are already refreshed. Structure first, tactical noise last. Count persistence by distinct market-bar dates, not repeated intraday runs. Label estimates, proxies, carried data, and unavailable inputs honestly. Do not edit market-brief.payload.json, market-brief.config.json, or any other repository file. Overwrite only .brief-work/${lane.id}.json with one strict JSON object, no markdown, containing exactly these top-level keys: ${lane.keys.join(', ')}. ${lane.instructions}`;

    const args = ['-p', prompt, '--allow-all-tools', '--deny-tool=shell'];
    if (lane.web && process.env.BRIEF_NO_WEB !== '1') {
        for (const host of webAllow) args.push(`--allow-url=${host}`);
    }
    args.push('--no-ask-user', '--model', model, '--no-color', '--no-auto-update', '--log-level', 'error', '-C', ROOT);

    const stdoutFd = openSync(stdoutPath, 'w');
    const stderrFd = openSync(stderrPath, 'w');
    const startedAt = Date.now();
    console.log(`[brief-parallel] lane=${lane.id} started keys=${lane.keys.join(',')} inputBytes=${readFileSync(inputPath).length}`);

    return new Promise((resolveLane) => {
        let settled = false;
        let timedOut = false;
        let child;
        let timer;
        const finish = (result) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            safeClose(stdoutFd);
            safeClose(stderrFd);
            resolveLane({ ...result, lane, outputPath, stdoutPath, stderrPath, elapsedMs: Date.now() - startedAt });
        };

        try {
            child = spawn(copilotBin, args, {
                cwd: ROOT,
                detached: true,
                env: {
                    ...process.env,
                    BRIEF_LANE_ID: lane.id,
                    BRIEF_LANE_KEYS: JSON.stringify(lane.keys),
                    BRIEF_LANE_OUTPUT: outputPath
                },
                stdio: ['ignore', stdoutFd, stderrFd]
            });
        } catch (error) {
            finish({ ok: false, error: error.message });
            return;
        }

        timer = setTimeout(() => {
            timedOut = true;
            try { process.kill(-child.pid, 'SIGTERM'); } catch { try { child.kill('SIGTERM'); } catch { } }
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

function loadFragment(result) {
    if (!result.ok) {
        const detail = tail(result.stderrPath) || tail(result.stdoutPath) || result.error || `exit ${result.code}`;
        throw new Error(`lane ${result.lane.id} failed after ${Math.round(result.elapsedMs / 1000)}s\n${detail}`);
    }
    let fragment;
    try {
        fragment = JSON.parse(readFileSync(result.outputPath, 'utf8'));
    } catch (error) {
        throw new Error(`lane ${result.lane.id} wrote invalid JSON: ${error.message}`);
    }
    const actual = Object.keys(fragment).sort();
    const expected = [...result.lane.keys].sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`lane ${result.lane.id} owns [${expected.join(', ')}] but wrote [${actual.join(', ')}]`);
    }
    console.log(`[brief-parallel] lane=${result.lane.id} complete seconds=${Math.round(result.elapsedMs / 1000)}`);
    return fragment;
}

const payloadBaseline = readFileSync(PAYLOAD_PATH);
const configBaseline = readFileSync(CONFIG_PATH);
const payload = JSON.parse(payloadBaseline.toString('utf8'));
const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8'));
const config = JSON.parse(configBaseline.toString('utf8'));
const tools = readJson(TOOLS_PATH);
const watchlist = readJson(WATCHLIST_PATH);
const history = recentHistory();

rmSync(WORK_DIR, { recursive: true, force: true });
mkdirSync(WORK_DIR, { recursive: true });

let succeeded = false;
try {
    console.log(`[brief-parallel] starting ${lanes.length} write-disjoint lanes in parallel`);
    const results = await Promise.all(lanes.map(runLane));
    if (!sameBytes(PAYLOAD_PATH, payloadBaseline) || !sameBytes(CONFIG_PATH, configBaseline)) {
        writeFileSync(PAYLOAD_PATH, payloadBaseline);
        writeFileSync(CONFIG_PATH, configBaseline);
        throw new Error('a lane edited a protected publication file');
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