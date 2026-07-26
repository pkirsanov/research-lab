/*
 * tests/red-alert.spec.mjs
 * ------------------------------------------------------------------------
 * Feature 012 · Scope 12 — TP-12-04 … TP-12-07 live-stack, system-chrome
 * regressions for the dynamic Red Alert view and the latent-risk Journey
 * (SCN-012-023, SCN-012-024, SCN-012-025).
 *
 * REAL-STACK, ZERO REQUEST ROUTING OR STUBBING. Each test navigates to the REAL
 * market-brief.html route over a real static HTTP server (tool-experience
 * support) and boots the REAL production runtime: the page loads rlmarketaction.js,
 * which exposes window.RLMARKETACTIONCENTER — including the REAL production Red
 * Alert engine under test (qualifyRedAlerts / renderRedAlertProjection /
 * buildLatentRiskEvidence). The Red Alert tab is opened through the REAL shell,
 * and the REAL production render is mounted into a REAL host inside the REAL
 * red-alert panel; every assertion targets the REAL rendered DOM under
 * [data-mac-redalert-probe].
 *
 * The frozen `web-evidence-bundle/v1` objects that drive qualification are produced
 * in Node beforeAll by the REAL production acquire() (scripts/web-evidence-acquire.mjs)
 * driven through each committed fixture's INJECTED transport boundary
 * (scripts/validate-web-evidence.mjs → runFixtureAcquisition) — the exact production
 * transform of the committed observation fixtures, NEVER a hand-authored bundle echo
 * and NEVER a pre-labelled verdict. They are handed as plain data to the REAL browser
 * engine, which DERIVES the qualification and the render exactly as the Node
 * functional suite does. The frozen owner/bundle FIXTURE DATA satisfies the
 * no-live-data policy; no test claims that live web acquisition ran in the browser.
 *
 * This file performs NO request routing, NO response stubbing, and NO recorded-traffic
 * replay of any kind. The only network is the real static server serving the real
 * committed page + committed scripts; the browser engine performs no fetch during
 * qualification. TP-12-07 additionally installs a PASSIVE page-level request LISTENER
 * (observation only) to prove the latent-risk Journey fires no execution/publication
 * traffic.
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';
import { loadConfig, resolveFixturePolicies, runFixtureAcquisition } from '../scripts/validate-web-evidence.mjs';

const require = createRequire(import.meta.url);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE_DIR = resolve(ROOT, 'tests/fixtures/feature-012/red-alert');
const RLJOURNEY_PATH = resolve(ROOT, 'rljourney.js');
const RA = require(resolve(ROOT, 'rlmarketaction.js'));
const JOURNEYS = JSON.parse(readFileSync(resolve(ROOT, 'journeys.json'), 'utf8'));

const PAGE = 'market-brief.html';
const LATENT_DEF_ID = 'journey/market-action/latent-risk/v1';
const RESEARCH_VERBS = RA.RESEARCH_VERBS;
/* execution verbs that a research-only Red Alert action may NEVER carry. */
const EXECUTION_VERBS = ['execute', 'order', 'buy', 'sell', 'trade', 'submit', 'place', 'publish', 'send', 'liquidate', 'unwind-live', 'send-order'];
/* browser network traffic that a NON-EXECUTING latent-risk Journey may never fire. */
const EXECUTION_TRAFFIC = /execute|order|trade|publish|submit|place-order|liquidat/i;

/* the latent-risk Journey definition + its single step, read from the committed registry. */
const LATENT_DEF = JOURNEYS.definitions.find((d) => d.definitionId === LATENT_DEF_ID);
const LATENT_STEPS = JOURNEYS.steps.filter((s) => s.definitionId === LATENT_DEF_ID);
if (!LATENT_DEF) throw new Error(`latent-risk journey definition ${LATENT_DEF_ID} is missing from journeys.json`);
if (LATENT_STEPS.length !== 1) throw new Error(`latent-risk journey must carry exactly one step, found ${LATENT_STEPS.length}`);

let site;
const fixtures = {};
const inputs = {};

/* Produce REAL frozen web-evidence-bundle/v1 objects from the committed fixtures through the REAL
   production acquire() + its injected transport boundary, and assemble the exact qualification input
   the Node functional suite (tests/red-alert.functional.mjs) drives. Only plain data crosses into the
   browser; the REAL browser engine performs the qualification + render. */
test.beforeAll(async () => {
  const policies = resolveFixturePolicies(loadConfig());
  const redAlertPolicy = policies['red-alert'];
  if (!redAlertPolicy) throw new Error('the red-alert acquisition lane policy must resolve from the committed config');

  for (const name of ['qualified-candidate', 'one-origin-weak', 'no-candidates-empty']) {
    const fixture = JSON.parse(readFileSync(resolve(FIXTURE_DIR, name + '.json'), 'utf8'));
    fixtures[name] = fixture;
    const candidateInputs = [];
    if (fixture.webEvidence && fixture.hypothesis) {
      const { acquireResult } = await runFixtureAcquisition(fixture.webEvidence, redAlertPolicy);
      if (!acquireResult || acquireResult.ok !== true) {
        const code = acquireResult && acquireResult.error ? acquireResult.error.code : 'no-result';
        throw new Error(`fixture ${name} did not freeze a production bundle: ${code}`);
      }
      candidateInputs.push(Object.assign({ bundle: acquireResult.value }, fixture.hypothesis));
    }
    inputs[name] = {
      projectionId: 'e2e/' + name,
      cutoffAt: fixture.cutoffAt,
      seeds: fixture.seeds || [],
      candidateInputs,
      channelsReviewed: fixture.channelsReviewed || []
    };
  }

  site = await startStaticServer();
});

test.afterAll(async () => { if (site) await site.close(); });

/* Navigate to the REAL market-brief.html route (an about:blank bounce guarantees a full document load
   and the Center controller re-run), wait for the REAL four-view shell + REAL Red Alert engine, then
   open the Red Alert view through the REAL tab so the panel — and the mounted render host — are the
   active, visible view. */
async function openRedAlert(page) {
  await page.goto('about:blank');
  await page.goto(`${site.baseUrl}/${PAGE}`);
  await expect(page.locator('body')).toBeVisible();
  await page.waitForFunction(() => {
    const shell = document.getElementById('rlviews');
    const api = window.RLMARKETACTIONCENTER;
    return !!(shell && shell.getAttribute('data-rlexperience-shell') === 'ready'
      && api && typeof api.qualifyRedAlerts === 'function' && typeof api.renderRedAlertProjection === 'function'
      && document.querySelector('[data-rlexperience-panel="red-alert"]'));
  }, undefined, { timeout: 15000 });
  await page.locator('#rlviews button[data-rlview-mode="red-alert"]').click();
  await page.waitForSelector('[data-rlexperience-panel="red-alert"] [data-mac-redalert]', { timeout: 15000 });
}

/* Drive the REAL browser Red Alert engine on a Node-frozen fixture input, mount the REAL production
   render into a REAL host inside the REAL (active, visible) red-alert panel, and return the derived
   projection plus observed DOM facts. This is the exact shape of the verified web-evidence.spec.mjs
   consumer drive: a Node-frozen bundle handed to a REAL browser consumer that renders it live. */
async function renderProjection(page, input) {
  return page.evaluate((incoming) => {
    const api = window.RLMARKETACTIONCENTER;
    const projRes = api.qualifyRedAlerts(incoming);
    if (!projRes || projRes.ok !== true) return { fatal: 'qualifyRedAlerts refused: ' + JSON.stringify(projRes && projRes.error) };
    const renderRes = api.renderRedAlertProjection(projRes.value);
    if (!renderRes || renderRes.ok !== true) return { fatal: 'renderRedAlertProjection refused: ' + JSON.stringify(renderRes && renderRes.error) };
    const panel = document.querySelector('[data-rlexperience-panel="red-alert"]');
    if (!panel) return { fatal: 'the real red-alert panel is missing' };
    const host = document.createElement('section');
    host.setAttribute('data-mac-redalert-probe', '1');
    host.innerHTML = renderRes.value.html;
    panel.appendChild(host);
    return {
      projection: projRes.value,
      html: host.innerHTML,
      text: host.innerText,
      scriptCount: host.querySelectorAll('script').length
    };
  }, input);
}

/* ═══════════════════════ TP-12-04 — SCN-012-023 dynamic anomaly qualifies a complete alert ═══════════════════════ */

test('Regression: SCN-012-023 dynamic anomaly and corroborated transmission qualify a complete Red Alert', async ({ page }) => {
  await openRedAlert(page);
  const out = await renderProjection(page, inputs['qualified-candidate']);
  if (out.fatal) throw new Error(out.fatal);

  // the SAFE render never injects a script.
  expect(out.scriptCount).toBe(0);

  // EXACTLY one restrained full alert row was DERIVED and is visible.
  expect(out.projection.visibleAlerts.length).toBe(1);
  const alert = page.locator('[data-mac-redalert-probe] [data-mac-redalert-alert]');
  await expect(alert).toHaveCount(1);
  await expect(alert).toBeVisible();

  // every falsifiable field is present as its own render hook.
  for (const field of ['why-now', 'trigger', 'invalidation', 'monitoring', 'resolution', 'horizon', 'uncertainty']) {
    await expect(alert.locator(`[data-mac-redalert-field="${field}"]`)).toHaveCount(1);
  }
  // thesis, restrained severity level, likelihood interval, propagation path, affected assets, channels.
  await expect(alert.locator('[data-mac-redalert-thesis]'))
    .toHaveText('Cross-currency funding stress is transmitting into carry unwinds across the current window.');
  await expect(alert.locator('[data-mac-redalert-severity][data-mac-redalert-severity-level="5"]')).toHaveCount(1);
  await expect(alert.locator('[data-mac-redalert-likelihood]')).toContainText('0.4');
  await expect(alert.locator('[data-mac-redalert-likelihood]')).toContainText('0.6');
  await expect(alert.locator('[data-mac-redalert-propagation]')).toContainText('credit-funding to fx-carry');
  await expect(alert.locator('[data-mac-redalert-assets]')).toContainText('DBC');
  await expect(alert.locator('[data-mac-redalert-channels]')).toContainText('credit-funding');

  // independent-citation and owner-evidence provenance (dynamic owner reads, not a topic seed catalog).
  const originCount = Number(await alert.locator('[data-mac-redalert-citations]').getAttribute('data-mac-redalert-origin-count'));
  expect(originCount).toBeGreaterThanOrEqual(2);
  await expect(alert.locator('[data-mac-redalert-owner-evidence]')).toContainText('market-heatmap-lab:funding-read');

  // the total is labelled an ADMISSION SCORE — never a probability / confidence / crash-odds.
  await expect(alert.locator('[data-mac-redalert-score][data-mac-redalert-score-label="admission score"]')).toHaveCount(1);
  const bodyLower = (await alert.innerText()).toLowerCase();
  expect(bodyLower).toContain('admission score');
  expect(/\bprobability\b/.test(bodyLower)).toBe(false);
  expect(/\bconfidence\b/.test(bodyLower)).toBe(false);
  expect(/crash[\s-]?odds/.test(bodyLower)).toBe(false);

  // research verbs ONLY — every action verb is a research verb and none is an execution verb.
  const actionVerbs = await alert.locator('[data-mac-redalert-action]')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-mac-redalert-action')));
  expect(actionVerbs.length).toBeGreaterThan(0);
  for (const verb of actionVerbs) {
    expect(RESEARCH_VERBS, `action verb ${verb} must be a declared research verb`).toContain(verb);
    expect(EXECUTION_VERBS, `action verb ${verb} must not be an execution verb`).not.toContain(verb);
  }

  // NO execute verb / NO alarmist presentation: the article carries the restrained presentation flags.
  await expect(alert).toHaveAttribute('data-mac-redalert-execute', 'false');
  await expect(alert).toHaveAttribute('data-mac-redalert-flashing', 'false');
  await expect(alert).toHaveAttribute('data-mac-redalert-pulse', 'false');
  await expect(alert).toHaveAttribute('data-mac-redalert-role', 'none');

  // the live-publication dependency remains an explicit Feature-002 gate (fixture proof is not publication).
  await expect(page.locator('[data-mac-redalert-probe] [data-mac-redalert-gate][data-mac-gate="dependency-pending:feature-002"]')).toHaveCount(1);
});

/* ═══════════════════════ TP-12-05 — SCN-012-024 dramatic uncorroborated candidate consumes no slot ═══════════════════════ */

test('Regression: SCN-012-024 dramatic uncorroborated candidate consumes no visible alert slot', async ({ page }) => {
  await openRedAlert(page);

  // ADVERSARIAL: the fixture hypothesis is maximally DRAMATIC — top severity with a full falsifiable
  // hypothesis. A broken corroboration gate WOULD surface it as a visible alert with its thesis text.
  expect(fixtures['one-origin-weak'].hypothesis.severity).toBe(5);

  const out = await renderProjection(page, inputs['one-origin-weak']);
  if (out.fatal) throw new Error(out.fatal);

  // ZERO visible alert slots are consumed — the single-origin claim fails corroboration.
  expect(out.projection.visibleAlerts.length).toBe(0);
  await expect(page.locator('[data-mac-redalert-probe] [data-mac-redalert-alert]')).toHaveCount(0);
  await expect(page.locator('[data-mac-redalert-probe] [data-mac-redalert-thesis]')).toHaveCount(0);

  // only a SAFE rejection count + reason class is shown — never the dramatic candidate title.
  expect(out.projection.rejections.count).toBe(1);
  expect(out.projection.rejections.byReasonClass['insufficient-corroboration']).toBeGreaterThanOrEqual(1);
  await expect(page.locator('[data-mac-redalert-probe] [data-mac-redalert-rejections][data-mac-redalert-rejection-count="1"]')).toHaveCount(1);
  await expect(page.locator('[data-mac-redalert-probe] [data-mac-redalert-rejections]')).toContainText('insufficient-corroboration');

  // the dramatic thesis text is NEVER projected onto the view (rendered DOM AND the raw safe HTML).
  const dramaticThesis = fixtures['one-origin-weak'].hypothesis.thesis;
  expect(dramaticThesis.length).toBeGreaterThan(0);
  expect(out.text.includes(dramaticThesis)).toBe(false);
  expect(out.html.includes(dramaticThesis)).toBe(false);

  // the view falls back to the honest empty state (no candidate cleared the bar this window).
  await expect(page.locator('[data-mac-redalert-probe] [data-mac-redalert-empty]')).toHaveCount(1);
});

/* ═══════════════════════ TP-12-06 — SCN-012-025 honest empty state, no illustrative topic ═══════════════════════ */

test('Regression: SCN-012-025 no qualified candidate renders cutoff coverage and no illustrative topic', async ({ page }) => {
  await openRedAlert(page);
  const out = await renderProjection(page, inputs['no-candidates-empty']);
  if (out.fatal) throw new Error(out.fatal);

  // zero admitted candidates — no alert row, no illustrative candidate thesis padded in.
  expect(out.projection.visibleAlerts.length).toBe(0);
  await expect(page.locator('[data-mac-redalert-probe] [data-mac-redalert-alert]')).toHaveCount(0);
  await expect(page.locator('[data-mac-redalert-probe] [data-mac-redalert-thesis]')).toHaveCount(0);

  // the EXACT no-qualified-alert copy, the cutoff, and the method link are shown.
  await expect(page.locator('[data-mac-redalert-probe] [data-mac-redalert-empty-statement]'))
    .toHaveText(RA.RED_ALERT_EMPTY_STATEMENT);
  await expect(page.locator('[data-mac-redalert-probe] [data-mac-redalert-empty][data-mac-redalert-cutoff="2026-07-24T20:00:00.000Z"]')).toHaveCount(1);
  const coverage = await page.locator('[data-mac-redalert-probe] [data-mac-redalert-empty-coverage]').innerText();
  // channels reviewed + owner/seed coverage (restrained counts) + method link.
  expect(coverage).toContain('breadth-market-structure');
  expect(coverage).toContain('rates-liquidity');
  expect(coverage).toContain('anomaly seed');
  expect(coverage).toContain('owner tool');
  expect(coverage).toContain('notes/market-brief.md#red-alert-qualification');

  // the DOM renders restrained COUNTS; the empty-state projection carries the owner-coverage
  // provenance (the consulted owner tool + the anomaly-seed count) that those counts summarise.
  expect(out.projection.emptyState.ownerCoverage.anomalySeedCount).toBe(1);
  expect(out.projection.emptyState.ownerCoverage.toolsConsulted).toContain('market-heatmap-lab');

  // NO illustrative topic string pads the view. Discriminating multi-word tokens are used because a
  // bare "credit" would FALSE-POSITIVE on the legitimate transmission-CHANNEL label "credit-funding"
  // (channels are classification labels only, not illustrative topics) — matching the SCN-012-025
  // functional check in tests/red-alert.functional.mjs.
  const lower = out.text.toLowerCase();
  for (const topic of ['usd/jpy', 'private credit', 'capex', 'war']) {
    expect(lower.includes(topic), `the empty state must not pad with a ${topic} illustrative topic`).toBe(false);
  }
});

/* ═══════════════════════ TP-12-07 — latent-risk Journey preserves evidence, can reject, never executes/publishes ═══════════════════════ */

test('Regression: latent-risk Journey preserves alert evidence can reject candidate and never executes or publishes', async ({ page }) => {
  await openRedAlert(page);

  // a passive request LISTENER (observation only — no routing/stubbing) proves the Journey fires no
  // execution/publication traffic. It records every request URL the page issues from here on.
  const requestLog = [];
  page.on('request', (req) => { requestLog.push(req.method() + ' ' + req.url()); });

  // inject the REAL production Journey runtime UMD (market-brief.html does not load it) → window.RLJOURNEY.
  await page.addScriptTag({ path: RLJOURNEY_PATH });
  await page.waitForFunction(() => !!(window.RLJOURNEY && typeof window.RLJOURNEY.compileDefinition === 'function'), undefined, { timeout: 15000 });

  const result = await page.evaluate(async ({ input, def, steps, cutoffAt }) => {
    const RAB = window.RLMARKETACTIONCENTER;
    const RJ = window.RLJOURNEY;
    if (!RAB || !RJ) return { fatal: `missing globals RA=${!!RAB} RJ=${!!RJ}` };

    // derive the REAL qualified alert (production, not a fixture label).
    const projRes = RAB.qualifyRedAlerts(input);
    if (!projRes.ok || projRes.value.visibleAlerts.length !== 1) return { fatal: 'qualify: ' + JSON.stringify(projRes.error || { visible: projRes.value && projRes.value.visibleAlerts.length }) };
    const alert = projRes.value.visibleAlerts[0];
    const alertBefore = JSON.stringify(alert);

    // bridge the alert's owner + public evidence into a PURE, no-execution latent-risk submission.
    const evidRes = RAB.buildLatentRiskEvidence(alert);
    if (!evidRes.ok) return { fatal: 'evidence: ' + JSON.stringify(evidRes.error) };
    const evidence = evidRes.value;

    const compiled = RJ.compileDefinition(def, steps);
    if (!compiled.ok) return { fatal: 'compile: ' + JSON.stringify(compiled.error) };

    const submission = RJ.composeEvidenceSubmission(
      { ownerRefs: evidence.ownerRefs, publicRefs: evidence.publicRefs, phaseOutcome: 'qualify-research', conclusion: 'latent-risk thesis corroborated by current owner evidence' },
      { completedAt: cutoffAt }
    );
    if (!submission.ok) return { fatal: 'submission: ' + JSON.stringify(submission.error) };

    // snapshot the FULL browser storage ledger before running the guided flow.
    const snapshotLedger = () => JSON.stringify(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)]));
    const ledgerBefore = snapshotLedger();

    const stepId = def.stepIds[0];
    const opened = RJ.createSession(compiled.value, { context: { evidenceIdentity: evidence.evidenceIdentity, publicTargetId: 'market-brief' }, sessionId: 'session/e2e/latent-risk', createdAt: cutoffAt });
    if (!opened.ok) return { fatal: 'createSession: ' + JSON.stringify(opened.error) };
    const stepped = RJ.completeStep(opened.value, stepId, submission.value);
    if (!stepped.ok) return { fatal: 'completeStep: ' + JSON.stringify(stepped.error) };

    // QUALIFY path — a complete NON-EXECUTING packet; and REJECT path — the SAME consumed evidence
    // producing a refused packet that also executes nothing.
    const completePacket = RJ.buildCompletionPacket(stepped.value, { outcome: 'complete', signoff: { reviewer: 'analyst', intent: 'accept-research-process' } });
    const refusedPacket = RJ.buildCompletionPacket(stepped.value, { outcome: 'refused' });

    const ledgerAfter = snapshotLedger();
    const alertAfter = JSON.stringify(alert);

    return {
      evidence: { noExecution: evidence.noExecution, noPublication: evidence.noPublication, evidenceIdentity: evidence.evidenceIdentity, semanticKey: alert.semanticKey, ownerRefsLen: evidence.ownerRefs.length },
      submissionSlots: submission.value.evidence.map((e) => e.slot + ':' + e.provenance),
      complete: completePacket.ok ? { outcome: completePacket.value.outcome, executed: completePacket.value.executed, noExecution: completePacket.value.noExecution } : { error: completePacket.error },
      refused: refusedPacket.ok ? { outcome: refusedPacket.value.outcome, executed: refusedPacket.value.executed, noExecution: refusedPacket.value.noExecution } : { error: refusedPacket.error },
      ledgerBefore, ledgerAfter, alertBefore, alertAfter
    };
  }, { input: inputs['qualified-candidate'], def: LATENT_DEF, steps: LATENT_STEPS, cutoffAt: fixtures['qualified-candidate'].cutoffAt });

  if (result.fatal) throw new Error(result.fatal);

  // the latent-risk evidence carries the alert's stable identity + owner refs and is no-execution / no-publication.
  expect(result.evidence.evidenceIdentity).toBe(result.evidence.semanticKey);
  expect(result.evidence.ownerRefsLen).toBeGreaterThanOrEqual(1);
  expect(result.evidence.noExecution).toBe(true);
  expect(result.evidence.noPublication).toBe(true);
  expect(result.submissionSlots.some((s) => s === 'owner-evidence:owner-evidence')).toBe(true);

  // the Journey can QUALIFY (complete) OR REJECT (refused) — and BOTH packets execute nothing.
  expect(result.complete.outcome).toBe('complete');
  expect(result.complete.executed).toBe(false);
  expect(result.complete.noExecution).toBe(true);
  expect(result.refused.outcome).toBe('refused');
  expect(result.refused.executed).toBe(false);
  expect(result.refused.noExecution).toBe(true);

  // the alert evidence is PRESERVED byte-for-byte across the qualify + reject flow (rejection mutates nothing).
  expect(result.alertAfter).toBe(result.alertBefore);

  // the NO-EXECUTION ledger is byte-identical before/after: the guided flow persisted nothing.
  expect(result.ledgerAfter).toBe(result.ledgerBefore);

  // and the passive request listener saw ZERO execution/publication traffic.
  const executionTraffic = requestLog.filter((entry) => EXECUTION_TRAFFIC.test(entry));
  expect(executionTraffic, `no execution/publication request may fire: ${JSON.stringify(executionTraffic)}`).toEqual([]);
});
