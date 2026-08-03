/**
 * Reader-legibility audit — renders EVERY registered tool page in a real browser,
 * activates EVERY view the page exposes, and reports what a human actually sees.
 *
 * This exists because the rest of the suite audits contract conformance: it asserts
 * that a projection has the right shape, not that a reader can act on it. A product
 * can be 100% green and 100% unusable. This audit reads the rendered text instead.
 *
 * D13 — framework vocabulary must never reach the reader. Gate codes, compute-identity
 * digests, spec/scope numbers, capability slugs and raw contract ids belong in Power
 * evidence disclosures, never in a default view.
 *
 * Usage:  node scripts/audit-reader-legibility.mjs [--json]
 * Exit :  0 clean · 1 findings · 2 audit could not run
 */

import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { startStaticServer } from '../tests/provider-credentials.support.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const asJson = process.argv.includes('--json');
const explain = process.argv.includes('--explain');
const onlyIdx = process.argv.indexOf('--only');
const onlyFilter = onlyIdx >= 0 ? process.argv[onlyIdx + 1] : null;

/* Each pattern is a leak of framework vocabulary into product copy. `label` is what
   gets reported; `re` is what proves it. Kept literal so a finding is never inferred. */
const LEAKS = [
  { id: 'compute-digest', label: 'compute-identity digest', re: /sha256:[0-9a-f]{8,}/ },
  { id: 'gate-code', label: 'gate/refusal code', re: /\bE0\d{2}-[A-Z]/ },
  { id: 'dependency-slug', label: 'dependency slug', re: /dependency-pending|feature-0\d{2}\b/ },
  { id: 'withheld-list', label: 'withheld-capability list', re: /\bWithheld:/ },
  { id: 'acceptance-gate', label: 'acceptance-gate predicate', re: /\bAcceptance gate:/ },
  { id: 'scope-number', label: 'Bubbles scope number', re: /\bScope \d{1,2}\b/ },
  { id: 'generic-heading', label: 'generic Simple heading', re: /\bSimple model result\b/ },
  { id: 'contract-unit', label: 'raw contract id as a unit', re: /\b[a-z]+-[a-z]+-(decimal|ratio|score|count|bps)\b/ },
  { id: 'contract-version', label: 'contract version slug', re: /\b[a-z-]+\/v\d\b/ },
  { id: 'integration-state', label: 'integration-state jargon', re: /not-integrated|coverage-only/ }
];

function findLeaks(text, view) {
  /* D13 puts provenance in Power on purpose. A compute digest or a contract version is
     evidence there, not a leak; everywhere else it is framework vocabulary in reader copy. */
  const provenanceAllowed = view === 'Power';
  const provenanceClasses = new Set(['compute-digest', 'contract-version']);
  const found = [];
  for (const leak of LEAKS) {
    if (provenanceAllowed && provenanceClasses.has(leak.id)) continue;
    const m = text.match(leak.re);
    if (m) found.push({ id: leak.id, label: leak.label, sample: m[0] });
  }
  return found;
}

const registry = JSON.parse(readFileSync(resolve(ROOT, 'tools.json'), 'utf8'));
const allPages = registry.tools.map((t) => ({ id: t.id, file: t.file, group: t.group }));
const pages = onlyFilter ? allPages.filter((p) => p.id.includes(onlyFilter)) : allPages;

/* Returns the selector that matched, or null. Callers treat a non-null return as
   "this view is reachable by a reader" — so a false positive here silently
   invents a view that does not exist. --explain prints the matched selector so
   that claim stays auditable. */
async function activateView(page, label) {
  /* Three tab shapes coexist: the MAC shell (data-rlview-mode), the legacy segmented
     control (#simpleTab/#powerTab) and generic role=tab buttons. A hidden-but-present
     tab still counts as a declared view, so a failed click falls back to a DOM click. */
  const key = label.toLowerCase().replace(/\s+/g, '-');
  const candidates = [
    `[data-rlview-mode="${key}"]`,
    `[data-rlexperience-mode="${key}"]`,
    `#${key}Tab`,
    `[role="tab"]:has-text("${label}")`,
    `button:has-text("${label}")`
  ];
  for (const sel of candidates) {
    const el = page.locator(sel).first();
    if (!(await el.count().catch(() => 0))) continue;
    try {
      await el.click({ timeout: 1500 });
    } catch {
      const clicked = await el.evaluate((node) => { node.click(); return true; }).catch(() => false);
      if (!clicked) continue;
    }
    await page.waitForTimeout(350);
    return sel;
  }
  return null;
}

async function visibleText(page) {
  return page.evaluate(() => {
    const panels = document.querySelectorAll('[data-rlexperience-panel]:not([hidden]), main, body');
    const node = panels[0] || document.body;
    return (node.innerText || '').replace(/\s+/g, ' ').trim();
  }).catch(() => '');
}

/* Scoping rule: a tool page shows ITS OWN journeys, brief and actions. Only the Action
   Center is global. A tool page that lists every tool's goals is a directory, not guidance.
   These counts make that rule measurable instead of a matter of opinion. */
async function scopeCounts(page) {
  return page.evaluate(() => {
    const count = (sel) => document.querySelectorAll(sel).length;
    const briefMounts = Array.from(document.querySelectorAll('[data-rlbrief-mount]'));
    return {
      journeyToolRows: count('[data-rljourney-tool]'),
      journeyGoalButtons: count('[data-rljourney-goal]'),
      briefMounts: briefMounts.length,
      briefToolIds: Array.from(new Set(briefMounts.map((n) => n.getAttribute('data-tool-id') || '?'))).join('+'),
      briefParts: count('[data-rlbrief-part]'),
      matrixCells: count('[data-mac-cell]'),
      matrixOwnedCells: count('[data-mac-cell][data-mac-owner]:not([data-mac-owner=""])'),
      matrixCoveredCells: count('[data-mac-cell][data-mac-state="current"]')
    };
  }).catch(() => null);
}

async function main() {
  let site;
  let browser;
  try {
    site = await startStaticServer();
  } catch (error) {
    console.error(`audit-reader-legibility: static server failed: ${error.message}`);
    process.exit(2);
  }
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch {
    try {
      browser = await chromium.launch({ headless: true });
    } catch (error) {
      console.error(`audit-reader-legibility: no browser available: ${error.message}`);
      await site.close();
      process.exit(2);
    }
  }

  const VIEWS = ['Simple', 'Power', 'Brief', 'Journey', 'Portfolio', 'Red Alert'];
  const report = [];

  for (const spec of pages) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const entry = { id: spec.id, group: spec.group, views: {}, error: null };
    try {
      await page.goto(`${site.baseUrl}/${spec.file}`, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(1200);
      for (const view of VIEWS) {
        const matchedBy = await activateView(page, view);
        if (!matchedBy) continue;
        const text = await visibleText(page);
        entry.views[view] = {
          chars: text.length,
          matchedBy,
          leaks: findLeaks(text, view),
          head: text.slice(0, 220)
        };
        if (explain) console.log(`    [explain] ${spec.id} ${view} <- ${matchedBy}`);
        if (view === 'Journey' || view === 'Brief' || view === 'Portfolio') {
          entry.views[view].scope = await scopeCounts(page);
        }
      }
      if (!Object.keys(entry.views).length) {
        const text = await visibleText(page);
        entry.views['(no view tabs)'] = { chars: text.length, leaks: findLeaks(text, null), head: text.slice(0, 220) };
      }
    } catch (error) {
      entry.error = error.message.split('\n')[0];
    }
    report.push(entry);
    await context.close();
  }

  await browser.close();
  await site.close();

  if (asJson) {
    console.log(JSON.stringify({ contractVersion: 'reader-legibility-audit/v1', report }, null, 2));
  } else {
    let totalLeaks = 0;
    const byLeak = new Map();
    console.log('=== reader-legibility audit — every registered tool, every view ===\n');
    for (const entry of report) {
      const viewNames = Object.keys(entry.views);
      const leakCount = viewNames.reduce((n, v) => n + entry.views[v].leaks.length, 0);
      totalLeaks += leakCount;
      const flag = entry.error ? 'ERROR' : (leakCount ? `${leakCount} leak(s)` : 'clean');
      console.log(`${entry.id.padEnd(34)} views=[${viewNames.join('|') || 'none'}] ${flag}`);
      const jScope = entry.views.Journey && entry.views.Journey.scope;
      const bScope = entry.views.Brief && entry.views.Brief.scope;
      const pScope = entry.views.Portfolio && entry.views.Portfolio.scope;
      if (jScope || bScope || pScope) {
        console.log(`    scope: journeyToolRows=${jScope ? jScope.journeyToolRows : '-'}`
          + ` journeyGoals=${jScope ? jScope.journeyGoalButtons : '-'}`
          + ` briefMounts=${bScope ? bScope.briefMounts : '-'}`
          + ` briefTools=${bScope ? bScope.briefToolIds : '-'}`
          + ` matrixCells=${pScope ? pScope.matrixCells : '-'}`
          + ` owned=${pScope ? pScope.matrixOwnedCells : '-'}`
          + ` covered=${pScope ? pScope.matrixCoveredCells : '-'}`);
      }
      if (entry.error) console.log(`    ! ${entry.error}`);
      for (const v of viewNames) {
        for (const leak of entry.views[v].leaks) {
          byLeak.set(leak.id, (byLeak.get(leak.id) || 0) + 1);
          console.log(`    ${v}: ${leak.label} -> "${leak.sample}"`);
        }
      }
    }
    console.log('\n=== leak class totals (page-view occurrences) ===');
    for (const [id, n] of [...byLeak.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${String(n).padStart(4)}  ${id}`);
    }
    const withViews = report.filter((r) => Object.keys(r.views).some((v) => v !== '(no view tabs)')).length;
    const errored = report.filter((r) => r.error).length;
    console.log(`\npages audited: ${report.length}   with view tabs: ${withViews}   errored: ${errored}   total leaks: ${totalLeaks}`);
    if (totalLeaks) console.log('\nD13 VIOLATED — framework vocabulary is reaching the reader.');
  }

  const failing = report.some((r) => r.error || Object.values(r.views).some((v) => v.leaks.length));
  process.exit(failing ? 1 : 0);
}

main().catch((error) => {
  console.error(`audit-reader-legibility: ${error.stack || error.message}`);
  process.exit(2);
});
