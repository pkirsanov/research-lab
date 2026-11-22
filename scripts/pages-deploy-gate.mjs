#!/usr/bin/env node
// pages-deploy-gate.mjs — schedule-run catch-up decision for the pages workflow.
//
// Why this exists: the `push` trigger on this repository never fires for commits pushed by the
// CI bot, so band data commits land on main with no pages run attached. A 30-minute schedule
// catch-up closes the gap; this script decides whether that schedule run must run the full
// verify+deploy pipeline or may exit as a no-op.
//
// The decision is by CONTENT, not by commit identity: the workflow builds the site first
// (same deterministic build as the verify job) and this script compares the two highest-
// cardinality payload files in the built site against the deployed live copies. Every data
// commit rewrites at least market-brief.page.json (fresh generatedAt), so "built == live"
// exactly means "the live site already serves this commit's content".
//
// Fail-open is the contract: any error (network down, HTTP error, missing file, unexpected
// shape) resolves to deploy=true. A gate that can only skip is a gate that cannot hide a
// stale site; a gate that occasionally over-deploys costs one 25-minute run and nothing else.
// Manual runs (push / workflow_dispatch) never consult this script at all.
//
// No npm dependencies. Node >= 18 (global fetch).
//
// Usage:  node scripts/pages-deploy-gate.mjs [--site-dir _site] [--live-base https://host/path]
// Exit:   0 with "GATE deploy=false" when the live site already matches the built site,
//         0 with "GATE deploy=true"  when a deploy is required or the comparison is uncertain.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const FETCH_TIMEOUT_MS = 20000;

// The payload files whose bytes define the published brief surface. A commit that changes
// none of them has nothing new to serve on the live site.
const PAYLOAD_FILES = Object.freeze([
  'market-brief.page.json',
  'tools.json',
]);

function parseArgs(argv) {
  const args = { siteDir: '_site', liveBase: 'https://pkirsanov.github.io/research-lab' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--site-dir') args.siteDir = argv[++i];
    else if (a === '--live-base') args.liveBase = argv[++i];
  }
  if (!args.liveBase || !/^[a-z][a-z0-9+.-]*:\/\//i.test(args.liveBase)) {
    throw new Error(`--live-base must be a full URL, got: ${args.liveBase}`);
  }
  return args;
}

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

function printDecision(deploy, reason) {
  process.stdout.write(`GATE deploy=${deploy} :: ${reason}\n`);
  process.exit(0);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const siteDir = resolve(ROOT, args.siteDir);
  const liveBase = args.liveBase.replace(/\/+$/, '');

  for (const file of PAYLOAD_FILES) {
    const localPath = join(siteDir, file);
    if (!existsSync(localPath)) {
      // The build should have produced this; missing means the build itself was wrong.
      printDecision(true, `built site missing ${file} — deploying to surface the breakage`);
    }
    const localBytes = readFileSync(localPath);
    const localHash = sha256(localBytes);

    let liveBytes;
    try {
      const res = await fetch(`${liveBase}/${file}`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) {
        printDecision(true, `live ${file} returned HTTP ${res.status} — deploying`);
      }
      liveBytes = Buffer.from(await res.arrayBuffer());
    } catch (err) {
      printDecision(true, `live ${file} unreachable (${err && err.message ? err.message : err}) — deploying`);
    }

    const liveHash = sha256(liveBytes);
    if (localHash !== liveHash) {
      printDecision(true, `${file} differs (built ${localHash.slice(0, 12)} != live ${liveHash.slice(0, 12)}) — deploying`);
    }
  }

  process.stdout.write(`GATE deploy=false :: built ${PAYLOAD_FILES.join(' + ')} identical to live site\n`);
  process.exit(0);
}

main().catch((err) => {
  // Last-resort fail-open: even a bug in this script must never suppress a deploy.
  process.stdout.write(`GATE deploy=true :: gate script error (${err && err.message ? err.message : err}) — deploying\n`);
  process.exit(0);
});
