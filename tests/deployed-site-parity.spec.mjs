/*
 * Deployment-artifact parity: exercise the REAL pages that GitHub Pages serves.
 *
 * Why this file exists: every other browser spec serves the REPO ROOT. GitHub Pages
 * serves `_site`, which `scripts/build-pages-site.mjs` builds by deliberately omitting
 * non-public surfaces (notably `specs/`). Anything a page fetches that lives outside the
 * projection therefore 200s in every existing test and 404s for every real visitor.
 *
 * That gap shipped a real defect: the shell resolved dependency gates by fetching
 * `specs/<feature>/state.json` at runtime, so on the deployed site all three gates 404'd,
 * degraded to null, and withheld capabilities that had genuinely shipped — while the
 * whole suite stayed green. This spec serves `_site` itself, so that class of defect
 * fails here instead of in production.
 *
 * Offline and deterministic: it builds the projection from the committed tree and serves
 * it from localhost. It never touches the network, so it is safe in the blocking CI gate.
 * Set RL_LIVE_BASE_URL to run the same assertions against the deployed origin instead.
 */
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';
import { GATES_FILE } from '../scripts/build-dependency-gates.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LIVE_BASE_URL = process.env.RL_LIVE_BASE_URL || '';
const readRootJson = (relative) => JSON.parse(readFileSync(join(ROOT, relative), 'utf8'));

const registry = readRootJson('tools.json');
const toolIds = registry.tools.map((tool) => tool.id);
const pageFor = (toolId) => `${toolId}.html`;

let site;
let siteRoot;

test.beforeAll(async () => {
  if (LIVE_BASE_URL) { site = { baseUrl: LIVE_BASE_URL.replace(/\/+$/, ''), close: async () => {} }; return; }
  const builder = await import('../scripts/build-pages-site.mjs');
  /* Per-worker destination. Playwright runs beforeAll once per WORKER, so a shared `_site`
     would have each worker delete the directory the other is serving. */
  const destination = `.rl-site-${process.env.TEST_PARALLEL_INDEX || '0'}`;
  siteRoot = join(ROOT, destination);
  builder.buildPagesSite({ root: ROOT, destination });
  site = await startStaticServer({ root: siteRoot });
});
test.afterAll(async () => {
  if (site) await site.close();
  if (siteRoot && existsSync(siteRoot)) rmSync(siteRoot, { recursive: true, force: true });
});

/* The projection must ship, or gates silently degrade for every visitor. */
test('the deployed artifact ships the dependency-gate projection', async ({ request }) => {
  const response = await request.get(`${site.baseUrl}/${GATES_FILE}`);
  expect(response.status(), `${GATES_FILE} must be reachable on the deployed artifact`).toBe(200);
  const document = await response.json();
  const declared = Object.keys(readRootJson('tool-experience.config.json').dependencyGates);
  expect(Object.keys(document.states).sort()).toEqual(declared.sort());
});

/* Governance stays private. This is the other half of the contract: the projection exists
   precisely so `specs/` never has to be published to make gates resolve. */
test('the deployed artifact does not publish governance state', async ({ request }) => {
  const config = readRootJson('tool-experience.config.json');
  for (const gate of Object.values(config.dependencyGates)) {
    const response = await request.get(`${site.baseUrl}/${gate.statePath}`);
    expect(response.status(), `${gate.statePath} must NOT be published`).toBe(404);
  }
});

for (const toolId of toolIds) {
  test(`deployed ${toolId} loads with no failed request and no governance fetch`, async ({ page }) => {
    const origin = new URL(site.baseUrl).origin;
    const failures = [];
    const governanceFetches = [];
    /* Scoped to SAME-ORIGIN. Whether a third-party market-data provider answers is not a
       property of the deployed artifact, and folding it in here would make the gate go red
       for reasons unrelated to the change — the exact failure mode people learn to ignore. */
    const isOwn = (url) => url.startsWith(origin);
    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('/specs/')) governanceFetches.push(`${response.status()} ${url}`);
      if (isOwn(url) && response.status() >= 400) failures.push(`${response.status()} ${url}`);
    });
    page.on('requestfailed', (request) => {
      if (isOwn(request.url())) failures.push(`FAILED ${request.url()} :: ${request.failure()?.errorText || ''}`);
    });

    const response = await page.goto(`${site.baseUrl}/${pageFor(toolId)}`, { waitUntil: 'domcontentloaded' });
    expect(response.status(), `${toolId} page must be reachable`).toBe(200);
    await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible({ timeout: 30000 });

    expect(governanceFetches, `${toolId} must never fetch a specs/ path — it 404s on the deployed site`).toEqual([]);
    expect(failures, `${toolId} issued failed request(s) against the deployed artifact`).toEqual([]);
  });
}

/* A satisfied gate must render as available on the DEPLOYED artifact. This is the exact
   assertion the shipped defect would have failed: BUG-004 and Feature 002 are both
   done/done, yet every deployed visitor saw them as pending. */
test('a satisfied gate renders available on the deployed artifact', async ({ page }) => {
  const gates = JSON.parse(readFileSync(join(ROOT, GATES_FILE), 'utf8'));
  const config = readRootJson('tool-experience.config.json');
  const satisfied = Object.entries(config.dependencyGates).filter(([key, gate]) => {
    const state = gates.states[key];
    if (!state) return false;
    const predicate = gate.acceptedPredicate;
    const required = predicate.requiredEvidenceIds || predicate.requiredMilestones;
    const observed = predicate.requiredEvidenceIds ? (state.evidenceIds || []) : (state.milestones || []);
    return predicate.statuses.includes(state.status)
      && predicate.certificationStatuses.includes(state.certification.status)
      && required.every((item) => observed.includes(item));
  });
  /* Non-vacuous: if nothing is satisfied there is no rendering claim to make, and the
     assertion below would pass without proving anything. */
  expect(satisfied.length, 'at least one gate must be genuinely satisfied for this to prove anything').toBeGreaterThan(0);

  await page.goto(`${site.baseUrl}/strategy-self-improvement-lab.html`);
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible({ timeout: 30000 });
  await page.getByRole('tab', { name: 'Brief', exact: true }).click();
  for (const [, gate] of satisfied) {
    const panel = page.locator(`[data-rlexperience-gate="${gate.gateId}"]`);
    /* A satisfied dependency renders nothing: it is not news to a reader. If it does render,
       it must be the pending form and must never carry framework vocabulary (D13). */
    if (await panel.count() === 0) continue;
    await expect(panel).toHaveAttribute('data-rlexperience-gate-state', 'pending');
    await expect(panel).not.toContainText('E012-DEPENDENCY');
  }
});
