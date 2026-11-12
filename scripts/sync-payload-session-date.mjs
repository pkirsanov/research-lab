#!/usr/bin/env node
/*
 * Minimal Tier-A payload sync for scheduled CI deployment.
 *
 * The written (Tier-B) narrative is deliberately operator-hosted — it needs a
 * model the repo does not own (see .github/workflows/tier-a.yml). When the
 * scheduled tools-refresh workflow regenerates the Tier-A snapshot without
 * also running the narrative, the committed market-brief.payload.json retains
 * the previous window's nextSession.sessionDate, which makes the publish gate
 * (validate-brief-payload) refuse the pair:
 *
 *   nextSession.sessionDate must match snapshot.nextSessionDate
 *
 * This script performs ONLY the Tier-A-derived field sync that brief-narrative-parallel.mjs
 * line 1457-1467 also performs after its lanes complete:
 *
 *   - payload.asOf            ← snapshot.asOf      (the analyzed window's evidence cutoff)
 *   - payload.generatedAt     ← run clock
 *   - payload.nextSession.sessionDate ← snapshot.nextSessionDate
 *
 * It does NOT touch any narrative prose, actions, recommendations, events, or
 * tool reads — those are retained verbatim from the last successful narrative
 * generation. This is the same "raw-data-only" fallback described in
 * brief-refresh-and-push.sh §3, made available as a CI step.
 *
 * Exit code: 0 on success (or 0 when there is no payload to sync yet),
 *            1 if the payload or snapshot cannot be parsed.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SNAPSHOT_PATH = resolve(ROOT, 'market-brief.snapshot.json');
const PAYLOAD_PATH = resolve(ROOT, 'market-brief.payload.json');

function main() {
  if (!existsSync(SNAPSHOT_PATH)) {
    console.error('[sync-payload-session-date] market-brief.snapshot.json not found — nothing to sync');
    process.exit(1);
  }

  // If there is no payload yet, this is a fresh checkout where the narrative
  // has never run. Nothing to sync — the selftest will handle the missing-file
  // case. Exit cleanly so CI does not block on a payload that does not exist.
  if (!existsSync(PAYLOAD_PATH)) {
    console.log('[sync-payload-session-date] market-brief.payload.json not found — skipping (no prior narrative)');
    return;
  }

  const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8'));
  const payload = JSON.parse(readFileSync(PAYLOAD_PATH, 'utf8'));

  if (!snapshot.nextSessionDate) {
    console.error('[sync-payload-session-date] snapshot has no nextSessionDate');
    process.exit(1);
  }

  if (typeof snapshot.asOf !== 'string') {
    console.error('[sync-payload-session-date] snapshot has no asOf');
    process.exit(1);
  }

  const priorSessionDate = payload.nextSession?.sessionDate;
  const priorAsOf = payload.asOf;

  // Bind Tier-A-derived fields. The narrative prose (actions, thesis, etc.)
  // is intentionally retained from the last successful narrative generation.
  if (!payload.nextSession || typeof payload.nextSession !== 'object') {
    payload.nextSession = {};
  }
  payload.nextSession.sessionDate = snapshot.nextSessionDate;
  payload.asOf = snapshot.asOf;
  payload.generatedAt = new Date().toISOString();

  if (priorSessionDate !== payload.nextSession.sessionDate) {
    console.log(`[sync-payload-session-date] nextSession.sessionDate ${priorSessionDate || '<missing>'} → ${payload.nextSession.sessionDate}`);
  }
  if (priorAsOf !== payload.asOf) {
    console.log(`[sync-payload-session-date] asOf ${priorAsOf || '<missing>'} → ${payload.asOf}`);
  }
  if (priorSessionDate === payload.nextSession.sessionDate && priorAsOf === payload.asOf) {
    console.log('[sync-payload-session-date] payload already in sync — no changes');
    return;
  }

  writeFileSync(PAYLOAD_PATH, JSON.stringify(payload, null, 2) + '\n');
  console.log('[sync-payload-session-date] payload synced to snapshot');
}

main();