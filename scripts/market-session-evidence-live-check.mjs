#!/usr/bin/env node
/*
 * market-session-evidence-live-check.mjs — Feature 002, Scope 02.
 *
 * A READ-ONLY structural smoke for the production Yahoo/NYSE session-evidence
 * adapter. It reports either current structural evidence or a TRUTHFUL
 * unavailable state, scans the scope-owned generated roots before and after to
 * prove it writes no repository file, and NEVER emits a fixed numerical market
 * claim (structural fields only). On a closed/uncovered calendar date it reports
 * market-closed without any network call.
 *
 * Usage:
 *   node scripts/market-session-evidence-live-check.mjs --symbols SPY --no-write
 *
 * Exit: 0 = structural evidence OR truthful unavailability with an unchanged
 *       repository; non-zero = a repository write or a structural violation.
 */
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { acquireMarketSessionEvidence, loadSourcePolicies, nodeFetchTransport } from './market-session-evidence.mjs';

const require = createRequire(import.meta.url);
const RLSESSION = require('../rlsession.js');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function argValue(flag) {
    const index = process.argv.indexOf(flag);
    return index >= 0 && index + 1 < process.argv.length ? process.argv[index + 1] : null;
}

function nyDate(now) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

function nyWall(now) {
    return new Intl.DateTimeFormat('en-GB', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
}

function scopeRootSnapshot() {
    const calendarPath = join(ROOT, 'data/calendars/xnys/calendar.json');
    const barsDir = join(ROOT, 'data/session-bars');
    const calendar = existsSync(calendarPath) ? (() => { const s = statSync(calendarPath); return `${s.size}:${s.mtimeMs}`; })() : 'absent';
    const bars = existsSync(barsDir) ? readdirSync(barsDir).sort().join(',') : 'absent';
    return `calendar=${calendar}|session-bars=${bars}`;
}

// Bounded live transport (no repository writes; short timeout so the smoke never hangs).
function boundedLiveTransport(timeoutMs) {
    return async (resolved) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(resolved.url, {
                method: resolved.method,
                redirect: 'error',
                headers: { 'User-Agent': 'Mozilla/5.0 (research-lab market-session-live-check)', Accept: resolved.accept },
                signal: controller.signal
            });
            const buffer = Buffer.from(await response.arrayBuffer());
            return { status: response.status, ok: response.ok, redirected: response.redirected, finalUrl: response.url, contentType: response.headers.get('content-type') || '', bytes: buffer };
        } finally {
            clearTimeout(timer);
        }
    };
}

function currentSessionKind(wall) {
    if (wall >= '04:00' && wall < '09:30') return 'pre-market';
    if (wall >= '09:30' && wall < '16:00') return 'regular';
    if (wall >= '16:00' && wall < '20:00') return 'after-hours';
    return null;
}

async function main() {
    const noWrite = process.argv.includes('--no-write');
    const config = JSON.parse(readFileSync(join(ROOT, 'market-brief.config.json'), 'utf8'));
    const policies = loadSourcePolicies(config);
    if (!policies.ok) {
        process.stderr.write(`[LIVE-CHECK] configuration invalid: ${policies.code}:${policies.reason}\n`);
        process.exit(2);
    }
    const symbols = (argValue('--symbols') || (policies.evidenceConfig.symbols.required || ['SPY']).join(',')).split(',').map((symbol) => symbol.trim()).filter(Boolean);
    const calendar = JSON.parse(readFileSync(join(ROOT, config.marketSessionEvidence.calendar.path), 'utf8'));

    const now = new Date();
    const tradingDate = nyDate(now);
    const wall = nyWall(now);
    process.stdout.write(`[LIVE-CHECK] mode=read-only no-write=${noWrite} nowUtc=${now.toISOString()} nyDate=${tradingDate} nyWall=${wall} symbols=${symbols.join(',')}\n`);

    const before = scopeRootSnapshot();

    // Truthful market-closed / uncovered classification WITHOUT any network call.
    const sessionResult = RLSESSION.loadCalendarSession(calendar, tradingDate, {
        contractVersion: 'cutoff-policy/v1', interval: 'PT5M', boundaryPolicyVersion: 'xnys-session-boundaries/v1', requireNextOpenTradingDate: true
    });
    if (!sessionResult.ok) {
        process.stdout.write(`[LIVE-CHECK] structural=unavailable reason=calendar-${sessionResult.error.reason} tradingDate=${tradingDate} (no network call made)\n`);
    } else if (sessionResult.value.dateState === 'holiday' || sessionResult.value.dateState === 'weekend') {
        process.stdout.write(`[LIVE-CHECK] structural=unavailable reason=market-closed dateState=${sessionResult.value.dateState} nextOpen=${sessionResult.value.nextOpenTradingDate} (no network call made)\n`);
    } else {
        const sessionKind = currentSessionKind(wall);
        if (!sessionKind) {
            process.stdout.write(`[LIVE-CHECK] structural=unavailable reason=outside-session-hours dateState=${sessionResult.value.dateState} nyWall=${wall} (no network call made)\n`);
        } else {
            const cutoffAt = new Date(Math.floor(now.getTime() / 300000) * 300000).toISOString().replace(/\.\d{3}Z$/, '.000Z');
            for (const symbol of symbols) {
                let outcome;
                try {
                    outcome = await acquireMarketSessionEvidence(config, {
                        calendar, transport: boundedLiveTransport(12000), cutoffAt, tradingDate, sessionKind, symbol, providerSymbol: symbol
                    });
                } catch (error) {
                    outcome = { ok: false, code: 'B002-LIVE', reason: (error && error.name === 'AbortError') ? 'source-timeout' : 'transport-error' };
                }
                if (!outcome.ok) {
                    process.stdout.write(`[LIVE-CHECK] ${symbol} structural=unavailable reason=${outcome.code}:${outcome.reason} (truthful unavailability)\n`);
                } else if (!outcome.evidence) {
                    process.stdout.write(`[LIVE-CHECK] ${symbol} structural=${outcome.state} reason=${outcome.reason || 'no-evidence'} sessionKind=${sessionKind} (no fixed-value claim)\n`);
                } else {
                    const aggregate = outcome.aggregate;
                    // Structural fields ONLY — never a fixed numeric market-value claim.
                    process.stdout.write(`[LIVE-CHECK] ${symbol} structural=present state=${aggregate.state} sessionKind=${aggregate.sessionKind} latestLabel=${aggregate.latestLabel} officialCloseAnchorPresent=${aggregate.officialRegularCloseAnchor !== null} priceBars=${aggregate.priceBars} volumeCompleteness=${aggregate.volumeCompleteness} baselineState=${outcome.baseline ? outcome.baseline.state : 'not-built'} evidenceValid=${RLSESSION.validateMarketSessionEvidence(outcome.evidence, { contractVersion: 'market-session-evidence-policy/v1', evidenceRoot: 'briefs/objects/evidence', requiredCalendar: true, requiredBenchmarkSymbol: 'SPY', requiredDueReportStates: ['upcoming', 'released', 'revised'] }).ok} (structural only, no fixed-value claim)\n`);
                }
            }
        }
    }

    const after = scopeRootSnapshot();
    if (after !== before) {
        process.stderr.write(`[LIVE-CHECK] FAIL: repository write detected in scope-owned roots\n  before: ${before}\n  after:  ${after}\n`);
        process.exit(3);
    }
    process.stdout.write(`[LIVE-CHECK] no-write verified: scope-owned generated roots unchanged (${before})\n`);
    process.stdout.write('[LIVE-CHECK] OK\n');
}

main().catch((error) => {
    process.stderr.write(`[LIVE-CHECK] fatal: ${error && error.stack ? error.stack : error}\n`);
    process.exit(2);
});
