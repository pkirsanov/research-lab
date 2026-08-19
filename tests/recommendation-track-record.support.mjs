/*
 * tests/recommendation-track-record.support.mjs — shared substrate for Feature 015.
 *
 * Loader, exact-code assertion helper, byte-comparison helper. It carries NO assertions of its
 * own and is imported, never run directly: an assertion registered at import time would shift
 * every importing file's total and make the captured-baseline arithmetic unreadable.
 *
 * Importing this module registers zero tests, prints nothing, and opens no file — every read is
 * lazy and inside a function. Ordering is content-derived rather than inherited from
 * directory-read order, so determinism is a property of this code and not of the filesystem.
 * Every date comes from an input; nothing here reads a clock.
 *
 * Scopes 02 - 10 import this module. A changed signature fails nine files at once, presenting as
 * nine unrelated defects rather than one substrate defect — which is why T-01-C1 asserts this
 * export surface directly and runs before any broad rerun.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));

/** Repository root, derived from this file's location. Path arithmetic only — opens nothing. */
export const REPO_ROOT = path.resolve(HERE, '..');

export const FIXTURE_ROOT = path.join(REPO_ROOT, 'tests', 'fixtures', 'recommendation-track-record');
export const CLAIM_FIXTURE_DIR = path.join(FIXTURE_ROOT, 'claims');
export const EXPECTED_SUFFIX = '.expected.json';

/** The module under test, loaded lazily so importing this file opens nothing. */
export function loadClaimsModule() {
  return require('../rlclaims.js');
}

/** The rlcontracts.js source text, so the action vocabulary is read from its single definition. */
export function foundationSourceText() {
  return fs.readFileSync(path.join(REPO_ROOT, 'rlcontracts.js'), 'utf8');
}

export function foundationActionVocabulary() {
  return loadClaimsModule().readFoundationActionVocabulary(foundationSourceText());
}

/**
 * The committed bars listing, returned as raw filenames so the caller derives the symbol set
 * through the module under test rather than through a second implementation here.
 */
export function barsDirectoryListing() {
  return fs.readdirSync(path.join(REPO_ROOT, 'data', 'bars')).sort();
}

export function committedSeries() {
  return loadClaimsModule().enumerateCommittedSeries(barsDirectoryListing());
}

export function toolsRegistry() {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'tools.json'), 'utf8'));
}

/**
 * Load every claim fixture with its `*.expected.json` sibling resolved.
 *
 * Ordering is by fixture name, which is content-derived and stable across runs and machines.
 * A fixture whose sibling is missing throws here rather than loading as "no expectation at
 * all", which would let a negative input pass for the wrong reason while reporting green.
 */
export function loadClaimFixtures() {
  const names = fs
    .readdirSync(CLAIM_FIXTURE_DIR)
    .filter((f) => f.endsWith('.json') && !f.endsWith(EXPECTED_SUFFIX))
    .map((f) => f.slice(0, -'.json'.length))
    .sort();
  return Object.freeze(names.map((name) => Object.freeze(loadClaimFixture(name))));
}

export function loadClaimFixture(name) {
  const inputPath = path.join(CLAIM_FIXTURE_DIR, `${name}.json`);
  const expectedPath = path.join(CLAIM_FIXTURE_DIR, `${name}${EXPECTED_SUFFIX}`);
  if (!fs.existsSync(expectedPath)) {
    throw new Error(`fixture "${name}" has no ${EXPECTED_SUFFIX} sibling — an unexpected input is not a test`);
  }
  return {
    name,
    input: JSON.parse(fs.readFileSync(inputPath, 'utf8')),
    expected: JSON.parse(fs.readFileSync(expectedPath, 'utf8')),
  };
}

/**
 * Assert an exact refusal: the reason string AND the field that caused it.
 * "Some refusal occurred" is not coverage — a wrong-field refusal is a different defect.
 */
export function assertRefusal(outcome, expectedReason, expectedField, label = 'refusal') {
  assert.ok(outcome, `${label}: expected a refusal record, got ${JSON.stringify(outcome)}`);
  assert.equal(outcome.reason, expectedReason, `${label}: reason`);
  assert.equal(outcome.field, expectedField, `${label}: field`);
}

/** Assert a mint produced no refusal at all. */
export function assertEvaluable(minted, label = 'mint') {
  assert.equal(minted.ok, true, `${label}: expected ok mint`);
  assert.equal(
    minted.claim.notEvaluable,
    null,
    `${label}: expected an evaluable claim, got ${JSON.stringify(minted.claim.notEvaluable)}`,
  );
}

/** Read raw bytes at a path, or null when absent. Never creates anything. */
export function readBytes(absolutePath) {
  return fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, 'utf8') : null;
}

/** Byte comparison used by the content-addressed-write rows. */
export function bytesEqual(left, right) {
  return left !== null && right !== null && left === right;
}

export function assertBytesUnchanged(before, after, label = 'on-disk bytes') {
  assert.ok(bytesEqual(before, after), `${label}: expected byte-identical content across the attempted write`);
}

/**
 * A disposable store root. Claim objects under test are written here, never into the committed
 * `briefs/objects/claims/` tree, so a test run leaves the repository byte-identical. It lives
 * under the OS temp dir rather than inside the repo: a run killed between the write and the
 * cleanup would otherwise leave a `git status --porcelain` entry outside this scope's allowed
 * file families, which is the very property T-01-C2 asserts.
 */
export function withDisposableStore(run) {
  const root = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'rtr-store-'));
  try {
    return run({ root, ports: filePorts(root) });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

/** Filesystem ports in the shape `writeClaimObject` requires. */
export function filePorts(root) {
  return {
    root,
    existsSync: fs.existsSync,
    readFileSync: fs.readFileSync,
    writeFileSync: fs.writeFileSync,
    mkdirSync: fs.mkdirSync,
  };
}

/**
 * Build a mint input from a fixture. Every date is taken from the fixture; nothing defaults to
 * "now", because a loader that reached for a clock would make the determinism rows
 * intermittently green — strictly worse than failing.
 *
 * `magnitudeUnit`, `signConvention` and `direction` are read from the fixture's binding block
 * when present. They are mint inputs rather than authored-action fields, and routing them
 * through the fixture keeps every negative input a declarative JSON literal — a vocabulary
 * violation expressed in test code instead would not be loadable by the fixture-sweep rows.
 * `??` is deliberate: `direction: 0` is a meaningful declared value, and `||` would erase it.
 */
export function mintInputFrom(fixture, overrides = {}) {
  const binding = fixture.input.binding ?? {};
  const input = {
    action: fixture.input.action,
    proposalRunId: binding.proposalRunId ?? null,
    proposalEventId: binding.proposalEventId ?? null,
    proposedAt: binding.proposedAt ?? null,
    resolutionDate: binding.resolutionDate ?? null,
    entryDate: binding.entryDate ?? null,
    entryBasis: binding.entryBasis ?? 'close',
    committedSeries: committedSeries(),
    toolsRegistry: toolsRegistry(),
    actionVocabulary: foundationActionVocabulary(),
  };
  if (binding.magnitudeUnit !== undefined) input.magnitudeUnit = binding.magnitudeUnit;
  if (binding.signConvention !== undefined) input.signConvention = binding.signConvention;
  if (binding.direction !== undefined) input.direction = binding.direction;
  return { ...input, ...overrides };
}
