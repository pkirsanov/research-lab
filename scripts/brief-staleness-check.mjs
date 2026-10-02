#!/usr/bin/env node
// Reports whether the PUBLISHED narrative has stopped refreshing, using the same
// freshness-policy/v1 thresholds and RLBRIEF.narrativeFreshness function the page uses,
// so the operator alert and the reader banner can never disagree.
//
// Usage: node scripts/brief-staleness-check.mjs [--root <dir>] [--notify] [--now <iso>]
// Exit: 0 fresh, 1 aging (missed a window), 2 stale/absent/unknown.
// --notify raises a macOS notification on any non-fresh state. It never fails the caller.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));

export function stalenessReport(root, nowMs = Date.now()) {
    require(resolve(HERE, '..', 'rlbrief.js'));
    const RLBRIEF = globalThis.RLBRIEF;
    let payload = null;
    try { payload = JSON.parse(readFileSync(resolve(root, 'market-brief.payload.json'), 'utf8')); } catch { payload = null; }
    let policy = null;
    try { policy = JSON.parse(readFileSync(resolve(root, 'market-brief.config.json'), 'utf8'))['freshness-policy/v1'] || null; } catch { policy = null; }
    const result = RLBRIEF.narrativeFreshness(payload, policy, nowMs);
    const exitCode = result.state === 'fresh' ? 0 : result.state === 'aging' ? 1 : 2;
    return { ...result, exitCode };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const args = process.argv.slice(2);
    const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
    const root = resolve(opt('--root') || resolve(HERE, '..'));
    const now = opt('--now') ? Date.parse(opt('--now')) : Date.now();
    const report = stalenessReport(root, now);
    const line = `[brief-staleness] state=${report.state} ageHours=${report.ageHours ?? 'n/a'} generatedAt=${report.generatedAt ?? 'none'}${report.message ? ' — ' + report.message : ''}`;
    console.log(line);
    if (args.includes('--notify') && report.exitCode !== 0 && process.platform === 'darwin') {
        const text = `Market brief ${report.state}: ${report.message || 'no generation time'}`.replace(/"/g, "'");
        spawnSync('osascript', ['-e', `display notification "${text}" with title "Research Lab brief" sound name "Basso"`], { stdio: 'ignore' });
    }
    process.exit(report.exitCode);
}
