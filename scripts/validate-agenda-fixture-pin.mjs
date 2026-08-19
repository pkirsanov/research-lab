#!/usr/bin/env node
/* Pin guard for the committed research-agenda UI fixture (BUG-012 scope 02, INV-012B-5/6).
 *
 * `tests/fixtures/research-agenda/reversal-ui.json` pins a cutoff. That cutoff used to resolve
 * against `data/bars/*.json`, which the scheduled refresh rewrites — so a committed test had an
 * input no commit controlled. `643d74bfd` rewrote the row behind the cutoff and six deterministically
 * green tests became deterministically red with no change to the test, the page or the model.
 *
 * The fixture's resolved bar inputs are now committed in `reversal-ui.bars.json` and served to the
 * page under test, so a refresh cannot move them. This guard is the other half of that decision: the
 * pin is a SNAPSHOT of published history, and if the corpus row behind it is ever rewritten again
 * that is worth knowing. It reports the divergence by NAME — fixture, symbol and row — instead of
 * letting a UI test discover it as an unbounded wait. Its verdict never changes what the committed
 * tests observe; it changes only whether the pin is still a faithful snapshot.
 *
 * Coherence of the corpus itself is NOT this script's job and is not left unguarded by the pin:
 * `validate-bars-coherence.mjs` (scope 01) scans every published row repo-wide.
 *
 * Usage:  node scripts/validate-agenda-fixture-pin.mjs
 *         exit 0 clean, exit 1 on drift, exit 2 when the pin has nothing to check.
 */

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const AGENDA_FIXTURE_PATH = 'tests/fixtures/research-agenda/reversal-ui.json';
export const AGENDA_FIXTURE_PIN_PATH = 'tests/fixtures/research-agenda/reversal-ui.bars.json';
export const AGENDA_FIXTURE_TOPIC_ID = 'geopolitical-supply-shock';

/* Exactly `rlagenda.js`'s CURRENT_BAR_ROW_FIELDS minus `t`, and that boundary is the whole design.
 *
 * `ac` is deliberately OUT. It is derived, not observed: the vendor recomputes the adjusted close of
 * every historical row the moment a new dividend or split lands, so `ac` moving is an ordinary
 * correct refresh. Three of the twelve pinned rows — PSX, XOM and COP — already carry a live
 * adjustment factor, so diffing `ac` would put this guard red on the next COP dividend while nothing
 * whatsoever was wrong. A guard that cries wolf on correct behaviour gets muted, and a muted guard
 * reports less than no guard because it also carries the belief that something is watching.
 *
 * `t` is OUT for the opposite reason: it is the row's identity. The corpus row is LOCATED by `t`, so
 * comparing it can never differ. It would read as coverage and deliver none.
 *
 * What remains is what the page hands the model and what a closed session can never legitimately
 * change. If one of these five moves, a published row was rewritten — which is BUG-012's §2.4
 * defect exactly, and the one thing here worth waking someone for. */
export const PINNED_FIELDS = Object.freeze(['o', 'h', 'l', 'c', 'v']);

/* The row-selection rule `loadFixtureBars` in research-agenda-lab.html applies. Kept identical on
   purpose: a pin resolved by a different rule would guarantee the wrong row. */
export function resolveRowAtCutoff(rows, cutoffMs) {
  const eligible = (rows || []).filter((row) => row.t <= cutoffMs);
  return eligible.length ? eligible[eligible.length - 1] : null;
}

export function sessionOf(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

/* The bar ids the fixture actually resolves, derived from the topic definition rather than listed
   by hand — a hand-kept list would silently stop covering a symbol the definition later adds. */
export function agendaFixtureBarIds(definition) {
  const ids = [];
  for (const model of definition.transmissionModels) if (!ids.includes(model.barId)) ids.push(model.barId);
  for (const proxy of definition.proxyDefinitions) if (!ids.includes(proxy.ticker)) ids.push(proxy.ticker);
  return ids;
}

export function formatAgendaFixturePinFinding(finding) {
  const where = `${finding.fixture}: ${finding.symbol} row t=${finding.timestamp} (${finding.session})`;
  if (finding.kind === 'pin-row-missing') {
    return `${where} pins no row at or before the cutoff — the fixture would boot with no bar for ${finding.symbol}`;
  }
  if (finding.kind === 'corpus-row-missing') {
    return `${where} is no longer present in ${finding.source} — the pin cannot be checked against a row that was removed`;
  }
  if (finding.kind === 'corpus-file-unreadable') {
    return `${where} could not be checked: ${finding.source} is unreadable (${finding.detail})`;
  }
  return `${where} drifted from ${finding.source} — ${finding.detail}`;
}

/* `readBarFile(symbol)` returns the parsed corpus file, or throws. Injected so the adversarial case
   can present a mutated corpus without writing to disk. */
export function findAgendaFixturePinDrift(pin, readBarFile) {
  const cutoffMs = Date.parse(pin.cutoff);
  const findings = [];
  for (const [symbol, pinned] of Object.entries(pin.bars)) {
    const pinnedRow = resolveRowAtCutoff(pinned.rows, cutoffMs);
    const source = `data/bars/${symbol}.json`;
    if (!pinnedRow) {
      findings.push({ fixture: pin.fixtureRef, symbol, timestamp: null, session: pin.cutoff, source, kind: 'pin-row-missing', detail: 'no pinned row at or before the cutoff' });
      continue;
    }
    const locate = { fixture: pin.fixtureRef, symbol, timestamp: pinnedRow.t, session: sessionOf(pinnedRow.t), source };
    let corpus;
    try {
      corpus = readBarFile(symbol);
    } catch (error) {
      findings.push({ ...locate, kind: 'corpus-file-unreadable', detail: String(error && error.message ? error.message : error) });
      continue;
    }
    const corpusRow = (corpus.rows || []).find((row) => row.t === pinnedRow.t);
    if (!corpusRow) {
      findings.push({ ...locate, kind: 'corpus-row-missing', detail: 'row absent' });
      continue;
    }
    const changed = PINNED_FIELDS
      .filter((field) => corpusRow[field] !== pinnedRow[field])
      .map((field) => `${field} ${pinnedRow[field]} -> ${corpusRow[field]}`);
    if (changed.length) findings.push({ ...locate, kind: 'row-changed', detail: changed.join(', ') });
  }
  return findings;
}

export function loadAgendaFixturePinContext(root) {
  const readJson = (relativePath) => JSON.parse(readFileSync(join(root, relativePath), 'utf8'));
  const pin = readJson(AGENDA_FIXTURE_PIN_PATH);
  const fixture = readJson(AGENDA_FIXTURE_PATH);
  const agenda = readJson('research-agenda.json');
  const topic = agenda.topics.find((entry) => entry.topicId === AGENDA_FIXTURE_TOPIC_ID);
  if (!topic) throw new Error(`research-agenda.json declares no topic ${AGENDA_FIXTURE_TOPIC_ID}`);
  return { pin, fixture, definition: readJson(topic.definitionRef), readBarFile: (symbol) => readJson(`data/bars/${symbol}.json`) };
}

/* Same result shape as `validateBarsCorpus` so the selftest can assert on it the same way. */
export function validateAgendaFixturePin(root = ROOT) {
  const context = loadAgendaFixturePinContext(root);
  const barIds = agendaFixtureBarIds(context.definition);
  const pinnedSymbols = Object.keys(context.pin.bars);
  const unpinned = barIds.filter((barId) => !pinnedSymbols.includes(barId));
  const findings = findAgendaFixturePinDrift(context.pin, context.readBarFile);
  return {
    /* Vacuous when the pin has nothing to check. An emptied pin would otherwise report its cleanest
       verdict at the exact moment it stopped covering anything, and the deployed page would fall
       back to the mutable corpus with every committed test still green. */
    vacuous: pinnedSymbols.length === 0,
    cutoff: context.pin.cutoff,
    fixture: context.pin.fixtureRef,
    comparedFields: PINNED_FIELDS,
    pinnedSymbols, checkedSymbols: pinnedSymbols.length,
    requiredSymbols: barIds, unpinned,
    driftCount: findings.length, findings
  };
}

export function formatAgendaFixturePinFindings(result, limit = 5) {
  const lines = [];
  lines.push('checked ' + result.checkedSymbols + ' pinned symbol(s) against data/bars at cutoff ' + result.cutoff
    + ', comparing ' + result.comparedFields.join('/') + ' (ac excluded: a dividend rewrites it legitimately)');
  for (const symbol of result.unpinned) lines.push('unpinned: ' + symbol + ' is resolved by the fixture but carries no pinned rows');
  if (!result.driftCount) return lines;
  lines.push(result.driftCount + ' pinned row(s) no longer match the corpus');
  for (const finding of result.findings.slice(0, limit)) lines.push(formatAgendaFixturePinFinding(finding));
  const hidden = result.driftCount - Math.min(limit, result.findings.length);
  if (hidden > 0) lines.push('... and ' + hidden + ' more');
  return lines;
}

/* ------------------------------------------------------------------------- CLI */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  const result = validateAgendaFixturePin();
  for (const line of formatAgendaFixturePinFindings(result, 20)) console.log(line);
  if (result.vacuous) {
    console.log('VACUOUS: the pin holds no symbols, so a pass here would assert nothing');
    process.exit(2);
  }
  console.log(result.driftCount === 0
    ? 'OK: every pinned row still matches the published row behind it'
    : 'FAIL: ' + result.driftCount + ' pinned row(s) drifted from data/bars');
  process.exit(result.driftCount === 0 ? 0 : 1);
}
