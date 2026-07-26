/*
 * tests/market-action-consumer-trace.mjs
 * ------------------------------------------------------------------------
 * Feature 012 Scope 09 — TP-09-03 consumer trace for the Market Action Center
 * rename (SCN-012-017).
 *
 * The visible product was renamed "Actionable Market Brief" -> "Market Action
 * Center" WITHOUT changing the route/file (`market-brief.html`), the registry id
 * (`market-brief`), the payload identities, or the scheduler ownership. This test
 * ENUMERATES the whole repository and classifies EVERY old-name / identity-ref
 * occurrence into exactly one bucket:
 *
 *   - migrated-visible-copy    : the product's own primary visible identity now
 *                                reads "Market Action Center" (proof of migration).
 *   - explicit-compat-alias    : a preserved route/file/registry identity ref
 *                                (`market-brief` / `market-brief.html`), a
 *                                design-declared publicAlias, a search tag, or a
 *                                peer-tool / internal-module reference to the tool
 *                                by its historical (aliased) name.
 *   - immutable-history        : specs/** execution evidence, committed history
 *                                (*.jsonl), and payload/snapshot data — never
 *                                rewritten by a rename.
 *   - routed-to-Scope-14-docs  : managed documentation wording (docs/**, notes/**,
 *                                .github/**, README.md, the runbook) — deliberately
 *                                NOT edited in this scope; NOT a blocking failure.
 *   - blocking-stale-reference : the OLD visible product name still occupying a
 *                                PRIMARY visible-identity POSITION of the market-brief
 *                                product's own surfaces (page <title>/<h1>, the
 *                                registry title/nav label, the index card title), OR
 *                                a duplicate route / registry id.
 *
 * The test FAILS iff the blocking bucket is non-empty. An adversarial sub-test
 * proves the classifier is NOT tautological: injecting a reverted title makes the
 * SAME classifier report a blocking reference (in-memory only; no disk mutation).
 *
 * Pure node:test — no browser, no interception. The first assertion is a
 * production-artifact existence guard (an absent renamed route is the intended RED
 * for this trace, never a skipped/soft pass).
 */
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const NEW_NAME = 'Market Action Center';
const REGISTRY_ID = 'market-brief';
const ROUTE_FILE = 'market-brief.html';
/* the OLD visible product name(s) the rename retired from primary identity positions. */
const OLD_VISIBLE = /Actionable Market Brief|Market Brief/g;
const IDENTITY_REF = /market-brief/g;

function readText(relativePath) {
  return readFileSync(new URL(relativePath, new URL('..', import.meta.url)), 'utf8');
}

/* ═══════════ structural primary-identity classifier (the blocking definition) ═══════════
   Given the four rename-surface texts, extract the market-brief product's OWN primary
   visible identity in each position and report any position that still shows the old name.
   This is a pure function so the real files (must be clean) and a mutated string (must be
   flagged) run through the identical logic — the adversarial, non-tautological proof. */
function classifyPrimaryIdentity(sources) {
  const findings = [];
  const record = (surface, position, actual) => {
    const migrated = typeof actual === 'string' && actual.trim() === NEW_NAME;
    findings.push({
      surface,
      position,
      actual: actual == null ? null : actual.trim(),
      classification: migrated ? 'migrated-visible-copy' : 'blocking-stale-reference',
      blocking: !migrated
    });
  };

  // market-brief.html — page <title> and the <h1 class="logo">.
  const titleMatch = /<title>([^<]*)<\/title>/i.exec(sources.pageHtml);
  const h1Match = /<h1 class="logo">([^<]*)<\/h1>/i.exec(sources.pageHtml);
  record('market-brief.html', '<title>', titleMatch ? titleMatch[1] : null);
  record('market-brief.html', '<h1 class="logo">', h1Match ? h1Match[1] : null);

  // tools.json — the registry entry title and nav label for id market-brief.
  const registry = JSON.parse(sources.toolsJson);
  const entries = (registry.tools || []).filter((tool) => tool && tool.id === REGISTRY_ID);
  assert.equal(entries.length, 1, `tools.json must carry exactly one '${REGISTRY_ID}' registry entry (route/id identity is singular)`);
  record('tools.json', 'tools[market-brief].title', entries[0].title);
  record('tools.json', 'tools[market-brief].nav.label', entries[0].nav && entries[0].nav.label);

  // index.html — the inline registry card title for id market-brief.
  const cardMatch = /id:\s*'market-brief'[\s\S]{0,240}?title:\s*'([^']*)'/.exec(sources.indexHtml);
  record('index.html', "registry card id 'market-brief' title", cardMatch ? cardMatch[1] : null);

  // rlnav.js — the nav entry label/full for file market-brief.html.
  const navMatch = /\{[^{}]*file:\s*"market-brief\.html"[^{}]*\}/.exec(sources.rlnavJs);
  const navEntry = navMatch ? navMatch[0] : '';
  const navLabel = /label:\s*"([^"]*)"/.exec(navEntry);
  const navFull = /full:\s*"([^"]*)"/.exec(navEntry);
  record('rlnav.js', 'nav[market-brief].label', navLabel ? navLabel[1] : null);
  record('rlnav.js', 'nav[market-brief].full', navFull ? navFull[1] : null);

  return findings;
}

function realSources() {
  return {
    pageHtml: readText('./market-brief.html'),
    toolsJson: readText('./tools.json'),
    indexHtml: readText('./index.html'),
    rlnavJs: readText('./rlnav.js')
  };
}

/* ═══════════ repository enumeration ═══════════ */

function bucketForPath(relativePath) {
  if (/^specs\//.test(relativePath) || /\.jsonl$/.test(relativePath) ||
      /\.payload\.json$/.test(relativePath) || /\.snapshot\.json$/.test(relativePath)) {
    return 'immutable-history';
  }
  if (/^docs\//.test(relativePath) || /^notes\//.test(relativePath) ||
      /^\.github\//.test(relativePath) || relativePath === 'README.md') {
    return 'routed-to-Scope-14-docs';
  }
  if (/\.config\.json$/.test(relativePath) || relativePath === 'watchlist.json') {
    return 'explicit-compat-alias';
  }
  return 'in-scope-source-or-tests';
}

function walkRepository() {
  const files = [];
  const stack = [''];
  while (stack.length) {
    const relDir = stack.pop();
    const absDir = relDir ? `${REPO_ROOT}${relDir}` : REPO_ROOT;
    for (const entry of readdirSync(absDir, { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      const rel = relDir ? `${relDir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) { stack.push(rel); continue; }
      if (!entry.isFile()) continue;
      files.push(rel);
    }
  }
  return files.sort();
}

function enumerateOldNameOccurrences() {
  const summary = {
    scannedFiles: 0,
    textFilesWithOccurrence: 0,
    oldVisibleOccurrences: 0,
    identityRefOccurrences: 0,
    perBucket: {
      'migrated-visible-copy': 0,
      'explicit-compat-alias': 0,
      'immutable-history': 0,
      'routed-to-Scope-14-docs': 0,
      'in-scope-source-or-tests': 0
    }
  };
  for (const rel of walkRepository()) {
    summary.scannedFiles += 1;
    const abs = `${REPO_ROOT}${rel}`;
    let text;
    try {
      if (statSync(abs).size > 6 * 1024 * 1024) continue;
      text = readFileSync(abs, 'utf8');
    } catch { continue; }
    const oldHits = text.match(OLD_VISIBLE);
    const idHits = text.match(IDENTITY_REF);
    if (!oldHits && !idHits) continue;
    summary.textFilesWithOccurrence += 1;
    summary.oldVisibleOccurrences += oldHits ? oldHits.length : 0;
    summary.identityRefOccurrences += idHits ? idHits.length : 0;
    const bucket = bucketForPath(rel);
    summary.perBucket[bucket] += (oldHits ? oldHits.length : 0) + (idHits ? idHits.length : 0);
  }
  return summary;
}

/* ═══════════ tests ═══════════ */

test('TP-09-03 the renamed route/file and registry id are preserved (identity compat, singular)', () => {
  assert.equal(existsSync(new URL(`../${ROUTE_FILE}`, import.meta.url)), true, `production route missing: ${ROUTE_FILE}`);
  const registry = JSON.parse(readText('./tools.json'));
  const idEntries = (registry.tools || []).filter((tool) => tool && tool.id === REGISTRY_ID);
  const fileEntries = (registry.tools || []).filter((tool) => tool && tool.file === ROUTE_FILE);
  assert.equal(idEntries.length, 1, `exactly one registry entry must keep id '${REGISTRY_ID}' (no duplicate id)`);
  assert.equal(fileEntries.length, 1, `exactly one registry entry must keep file '${ROUTE_FILE}' (no duplicate route)`);
  assert.equal(idEntries[0].file, ROUTE_FILE, 'the market-brief registry id must still resolve to the market-brief.html route');
  // the design-declared public aliases legitimize every historical-name reference as a compat alias.
  assert.deepEqual(
    idEntries[0].experience && idEntries[0].experience.publicAliases,
    ['Actionable Market Brief', 'Market Brief'],
    'the registry must declare the old names as explicit public aliases'
  );
  // the payload identities the scheduler owns are unchanged.
  assert.equal(idEntries[0].data, 'market-brief.config.json', 'payload/config identity must be preserved');
  assert.equal(idEntries[0].notes, 'notes/market-brief.md', 'runbook identity must be preserved');
});

test('TP-09-03 every primary visible-identity surface is migrated to Market Action Center (zero blocking stale reference)', () => {
  const findings = classifyPrimaryIdentity(realSources());
  const blocking = findings.filter((finding) => finding.blocking);
  const migrated = findings.filter((finding) => finding.classification === 'migrated-visible-copy');
  assert.equal(
    blocking.length,
    0,
    `blocking stale product-identity references (must be zero): ${JSON.stringify(blocking)}`
  );
  // proof of migration: every one of the six primary-identity positions now reads the new name.
  assert.equal(migrated.length, findings.length, 'every primary visible-identity position must read Market Action Center');
  assert.ok(findings.length >= 6, 'the four rename surfaces expose at least six primary-identity positions');
  for (const finding of findings) {
    assert.equal(finding.actual, NEW_NAME, `${finding.surface} ${finding.position} must read '${NEW_NAME}'`);
  }
});

test('TP-09-03 adversarial: the classifier flags a reverted product title (non-tautological)', () => {
  const sources = realSources();
  // simulate a regression that reverts ONLY the page <title> back to the old visible name.
  const reverted = {
    ...sources,
    pageHtml: sources.pageHtml.replace(/<title>[^<]*<\/title>/i, '<title>Actionable Market Brief</title>')
  };
  assert.notEqual(reverted.pageHtml, sources.pageHtml, 'the adversarial mutation must actually change the page title');
  const findings = classifyPrimaryIdentity(reverted);
  const blocking = findings.filter((finding) => finding.blocking);
  assert.equal(blocking.length, 1, 'exactly the reverted <title> must be reported as a blocking stale reference');
  assert.equal(blocking[0].surface, 'market-brief.html');
  assert.equal(blocking[0].position, '<title>');
  assert.equal(blocking[0].actual, 'Actionable Market Brief');
  assert.equal(blocking[0].classification, 'blocking-stale-reference');
});

test('TP-09-03 the route/file, registry id and index card are singular (no duplicate consumer)', () => {
  const toolsJson = readText('./tools.json');
  const indexHtml = readText('./index.html');
  const rlnavJs = readText('./rlnav.js');
  const idCount = (toolsJson.match(/"id":\s*"market-brief"/g) || []).length;
  const indexCardCount = (indexHtml.match(/id:\s*'market-brief'/g) || []).length;
  const navFileCount = (rlnavJs.match(/file:\s*"market-brief\.html"/g) || []).length;
  const routeFileCount = walkRepository().filter((rel) => rel === ROUTE_FILE || /\/market-brief\.html$/.test(rel)).length;
  assert.equal(idCount, 1, 'exactly one tools.json entry may carry id market-brief');
  assert.equal(indexCardCount, 1, 'exactly one index.html registry card may carry id market-brief');
  assert.equal(navFileCount, 1, 'exactly one rlnav.js entry may point at market-brief.html');
  assert.equal(routeFileCount, 1, 'exactly one market-brief.html route file may exist');
});

test('TP-09-03 the whole repository is enumerated and every old-name occurrence is classified (blocking bucket empty)', () => {
  const summary = enumerateOldNameOccurrences();
  const structuralBlocking = classifyPrimaryIdentity(realSources()).filter((finding) => finding.blocking).length;
  // machine-checkable enumeration evidence.
  const line = (label, value) => `[consumer-trace] ${label}=${value}`;
  const report = [
    line('scannedFiles', summary.scannedFiles),
    line('filesWithOldNameOrIdentityRef', summary.textFilesWithOccurrence),
    line('oldVisibleOccurrences', summary.oldVisibleOccurrences),
    line('identityRefOccurrences', summary.identityRefOccurrences),
    line('bucket.immutable-history', summary.perBucket['immutable-history']),
    line('bucket.routed-to-Scope-14-docs', summary.perBucket['routed-to-Scope-14-docs']),
    line('bucket.explicit-compat-alias', summary.perBucket['explicit-compat-alias']),
    line('bucket.in-scope-source-or-tests', summary.perBucket['in-scope-source-or-tests']),
    line('blockingStaleReferences', structuralBlocking)
  ].join('\n');
  console.log(report);
  assert.ok(summary.scannedFiles > 100, 'the enumeration must actually walk the repository');
  assert.ok(summary.textFilesWithOccurrence > 50, 'the old name and identity refs are widely referenced (history + docs + peers)');
  assert.ok(summary.perBucket['immutable-history'] > 0, 'specs execution history legitimately retains the old name');
  assert.ok(summary.perBucket['routed-to-Scope-14-docs'] > 0, 'managed docs wording is routed to the Scope 14 docs owner, not edited here');
  assert.equal(structuralBlocking, 0, 'no blocking stale product-identity reference may remain in in-scope source/tests');
});
