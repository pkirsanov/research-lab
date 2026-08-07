/*
 * scripts/build-attention-scorecard.mjs — make the interruption tier answer for itself.
 *
 * The decision-attention tier stops the reader up to four times a day. A tier that interrupts and
 * never counts its own false alarms is a notification channel wearing a research badge, so this
 * reduces the append-only attention outcome ledger into market-brief.attention-scorecard.json:
 * of the times this tier stopped you, how often was it right?
 *
 * Honesty rules, in order of importance:
 *   - The rate, the minimum closed sample, the terminal outcome vocabulary and the refusal to
 *     publish below that minimum are ALL rlattention.js's. Nothing here restates them. A rule
 *     stated twice is a rule that will eventually disagree with itself.
 *   - A supersession is a bookkeeping close, not evidence that the interruption was warranted.
 *     Superseded items leave the evaluable denominator and are reported as their own count, so
 *     they are never silently dropped and never quietly inflate the rate.
 *   - Each breakdown bucket earns its own rate against its own sample. A thin bucket may not
 *     borrow its parent's sufficient sample to publish a number it has not earned.
 *   - This lane is DISJOINT from the lane that scores the brief's directional calls. The two
 *     records are presented separately and are never summed, never merged, and never written by
 *     each other. This file has no write path into that lane and imports nothing that does.
 *   - Nothing is defaulted. A missing ledger line, an unreadable record, an absent decision
 *     window or an absent time fails loudly rather than shrinking the denominator in silence.
 *
 *   CLI: node scripts/build-attention-scorecard.mjs --as-of <ISO instant> [--dry-run] [--root <path>]
 */
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const MODULE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* the same frozen module the tool page calls: the rules travel with the module, not with the
   caller, so a staged root supplies DATA while the repository module supplies JUDGEMENT. */
const RLATTN = require(path.join(MODULE_ROOT, 'rlattention.js'));

export const ATTENTION_SCORECARD_CONTRACT = 'attention-scorecard/v1';
export const ATTENTION_LEDGER_PATH = 'market-brief.attention-outcomes.jsonl';
export const ATTENTION_SCORECARD_PATH = 'market-brief.attention-scorecard.json';

/* ── refusals ────────────────────────────────────────────────────────────── */

function refuse(field, reason) {
  return { ok: false, code: 'ATTN-LEDGER', field, reason };
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/* ── ledger ──────────────────────────────────────────────────────────────── */

/**
 * Every stored outcome record, in append order.
 *
 * A ledger that has never been appended to is empty. That is a STATE, not a read failure, and it
 * is the only absence tolerated here — a line that exists but cannot be parsed throws, because
 * silently skipping it would shrink the denominator and flatter the rate.
 */
export function readAttentionLedger(root) {
  const abs = path.join(root, ATTENTION_LEDGER_PATH);
  if (!existsSync(abs)) return [];

  const rows = [];
  readFileSync(abs, 'utf8').split('\n').forEach((line, index) => {
    if (line.trim().length === 0) return;
    let row;
    try {
      row = JSON.parse(line);
    } catch (cause) {
      throw new Error(
        `${ATTENTION_LEDGER_PATH}:${index + 1} is not valid JSON. The ledger cannot be reduced from a line it `
        + 'cannot read, and skipping the line would quietly remove a closure from the denominator.',
        { cause }
      );
    }
    if (!isPlainObject(row)) {
      throw new Error(`${ATTENTION_LEDGER_PATH}:${index + 1} is not an outcome record object`);
    }
    rows.push(row);
  });
  return rows;
}

/* A record's identity is its content, so it is reproducible from the line itself and needs no
   clock and no randomness. Keys are sorted because authoring order is not identity. */
function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (isPlainObject(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function deriveRecordId(record) {
  return `atn-${createHash('sha256').update(canonicalJson(record)).digest('hex').slice(0, 24)}`;
}

/* The outcome CLASS vocabulary is the module's; this only checks the record declares one of them
   and carries the fields the reduction groups on. */
function validateOutcomeRecord(record) {
  if (!isPlainObject(record)) return refuse('record', 'an outcome record is an object');
  if (!isNonEmptyString(record.contractVersion)) {
    return refuse('contractVersion', 'an outcome record names the contract it was derived under');
  }
  if (!isNonEmptyString(record.itemId)) {
    return refuse('itemId', 'an outcome record identifies the item it closes, otherwise "exactly one per item" cannot be enforced');
  }
  if (!isNonEmptyString(record.state)) {
    return refuse('state', 'an outcome record carries the terminal state the item reached');
  }
  if (!isNonEmptyString(record.closedAt)) {
    return refuse('closedAt', 'an outcome record carries the instant the item closed');
  }
  if (!isNonEmptyString(record.outcomeClass) || RLATTN.TERMINAL_OUTCOME_CLASSES.indexOf(record.outcomeClass.trim()) === -1) {
    return refuse('outcomeClass', 'the outcome class is outside the vocabulary the attention module declares');
  }
  if (!isNonEmptyString(record.decisionWindow)) {
    return refuse('decisionWindow', 'an outcome record names the decision window it is grouped under');
  }
  if (!isNonEmptyString(record.channel)) {
    return refuse('channel', 'an outcome record names the transmission channel it is grouped under');
  }
  return null;
}

/**
 * Append one outcome record.
 *
 * Exactly one record exists per terminated item: a second close of the same item is a DUPLICATE
 * and is refused at write time. A revised judgement is a CORRECTION — a new line naming the stored
 * record it corrects. The original line is never rewritten, so both survive and the history of the
 * revision is readable.
 */
export function appendOutcomeRecord(root, record) {
  const invalid = validateOutcomeRecord(record);
  if (invalid) return invalid;

  const existing = readAttentionLedger(root);
  const correctionOf = isNonEmptyString(record.correctionOf) ? record.correctionOf.trim() : null;

  if (correctionOf === null) {
    const prior = existing.filter((row) => row.itemId === record.itemId && !isNonEmptyString(row.correctionOf));
    if (prior.length > 0) {
      return refuse(
        'itemId',
        `an outcome record for ${record.itemId} is already stored. Exactly one record exists per terminated item; `
        + 'a revised judgement appends as a correction naming the record it corrects, rather than as a second close.'
      );
    }
  } else if (!existing.some((row) => row.recordId === correctionOf)) {
    return refuse(
      'correctionOf',
      `no stored record carries the identity ${correctionOf}. A correction references the line it corrects, `
      + 'otherwise the revision cannot be read back against the original.'
    );
  }

  /* identity is derived, never supplied: a caller cannot mint a record id that disagrees with the
     bytes it is stored under. */
  const base = { ...record, correctionOf };
  delete base.recordId;
  const recordId = deriveRecordId(base);
  if (existing.some((row) => row.recordId === recordId)) {
    return refuse('recordId', 'this exact record is already stored; an append-only ledger never stores one line twice');
  }

  const stored = Object.freeze({ ...base, recordId });
  const abs = path.join(root, ATTENTION_LEDGER_PATH);
  const current = existsSync(abs) ? readFileSync(abs, 'utf8') : '';
  const separator = current.length > 0 && !current.endsWith('\n') ? '\n' : '';
  appendFileSync(abs, `${separator}${JSON.stringify(stored)}\n`, 'utf8');

  return { ok: true, record: stored };
}

/* ── reduction ───────────────────────────────────────────────────────────── */

/* A correction replaces the record it names. The corrected line stays on disk — the ledger is
   append-only — but it leaves the reduction, so a revised judgement is counted once, not twice. */
function applyCorrections(rows) {
  const corrected = new Set(rows.map((row) => row.correctionOf).filter(isNonEmptyString));
  return rows.filter((row) => !corrected.has(row.recordId));
}

/* The successor reference is written by the attention module's superseding edge and by nothing
   else, so this reads a fact the module recorded rather than restating a rule about it. */
function isSupersededClose(row) {
  return isNonEmptyString(row.supersededBy);
}

/**
 * One interruption-rate record over a set of closures.
 *
 * The rate, the sample, the effective count, the minimum and the withholding decision are all
 * returned by the attention module. This adds only the supersession split, which the module does
 * not know about, and restates the module's sufficiency verdict in the negative for the reader.
 */
function summarise(rows, asOf) {
  const evaluable = rows.filter((row) => !isSupersededClose(row));
  const supersededCount = rows.length - evaluable.length;
  const rate = RLATTN.computeInterruptionRate(evaluable, null, asOf);
  return { ...rate, insufficientSample: !rate.sufficientSample, supersededCount };
}

/* Buckets are keyed by the vocabulary id the record carries. There is no catch-all bucket: a
   record with no key is a malformed record, and bucketing it under "unspecified" would hide that. */
function groupSummary(rows, field, asOf) {
  const groups = new Map();
  for (const row of rows) {
    const key = row[field];
    if (!isNonEmptyString(key)) {
      throw new Error(
        `${ATTENTION_LEDGER_PATH} holds a record for ${row.itemId || 'an unnamed item'} with no ${field}. `
        + 'Every closure is grouped under a named vocabulary id; there is no catch-all bucket to hide it in.'
      );
    }
    const id = key.trim();
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(row);
  }
  const out = {};
  for (const id of [...groups.keys()].sort()) out[id] = summarise(groups.get(id), asOf);
  return out;
}

export function buildAttentionScorecard(root, options = {}) {
  const asOf = options.asOf;
  if (!isNonEmptyString(asOf)) {
    throw new Error(
      'buildAttentionScorecard requires an explicit asOf instant. The reduction reads its time from its input '
      + 'rather than from a clock, so the same ledger always reduces to the same record.'
    );
  }
  /* the instant predicate is the module's too: if the module refuses to stamp the record with this
     value, it is not an instant, and a scorecard stamped null is a scorecard that cannot be aged. */
  if (RLATTN.computeInterruptionRate([], null, asOf).asOf === null) {
    throw new Error(`asOf must be an ISO instant the attention module accepts. Received: ${JSON.stringify(asOf)}`);
  }

  const rows = applyCorrections(readAttentionLedger(root));

  return {
    contractVersion: ATTENTION_SCORECARD_CONTRACT,
    generatedAt: asOf,
    overall: summarise(rows, asOf),
    byDecisionWindow: groupSummary(rows, 'decisionWindow', asOf),
    byChannel: groupSummary(rows, 'channel', asOf)
  };
}

function canonicalBytes(value) {
  // Minified: machine-read on every cockpit load and counted against the declared first-load
  // budget, so indentation buys nothing.
  return Buffer.from(`${JSON.stringify(value)}\n`, 'utf8');
}

export function runBuildAttentionScorecard(root, options = {}) {
  const log = options.log || (() => { });
  const scorecard = buildAttentionScorecard(root, options);
  const overall = scorecard.overall;

  log(`[attention-scorecard] ${overall.closedSample} evaluable closure(s); ${overall.supersededCount} superseded and excluded`);
  log(`[attention-scorecard] ${overall.rate === null
    ? `rate withheld — ${overall.closedSample} closed against a minimum of ${overall.minClosedSample}`
    : `${Math.round(overall.rate * 1000) / 10}% of closed interruptions turned out to matter`}`);

  if (options.dryRun) {
    log('[attention-scorecard] --dry-run: nothing written');
    return { ok: true, scorecard, dryRun: true };
  }
  writeFileSync(path.join(root, ATTENTION_SCORECARD_PATH), canonicalBytes(scorecard));
  log(`[attention-scorecard] wrote ${ATTENTION_SCORECARD_PATH}`);
  return { ok: true, scorecard };
}

function argValue(args, name) {
  const inline = args.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
}

function mainCli(argv) {
  const args = argv.slice(2);
  const asOf = argValue(args, '--as-of');
  if (!isNonEmptyString(asOf)) {
    console.error('build-attention-scorecard: --as-of <ISO instant> is required. The reduction takes its time from '
      + 'its caller so that the same ledger always produces the same record.');
    return 2;
  }
  const rootArg = argValue(args, '--root');
  const root = path.resolve(isNonEmptyString(rootArg) ? rootArg : '.');
  const result = runBuildAttentionScorecard(root, {
    asOf, dryRun: args.includes('--dry-run'), log: (line) => console.log(line)
  });
  return result.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(mainCli(process.argv));
}
