/*
 * TP-08-09 — persistent live-stack system-Chrome MOBILE regression for the Feature 012 Scope 08
 * Journey capability shell under a narrow (320×900) mobile viewport. Proves the SAME core
 * invariants the desktop journey.spec.mjs proves — SCN-012-009 durable resume (no visit/click
 * misclassified as a completed step), SCN-012-010 dependency-aware backtracking (transitive
 * dependents go stale, unrelated steps stay intact, stale conclusions are excluded from the
 * packet), and SCN-012-011 signoff-never-executes (recording a human review leaves every
 * storage ledger byte-identical and issues no execution/publication network request) — PLUS the
 * mobile/accessibility contract in the TP-08-09 title: an ordered `aria-label`ed progress list
 * with `aria-current="step"` current-step semantics, exposed per-step evidence counts, the
 * backtrack stale reason surfaced on the dependent step, the completion packet + disclaimer
 * rendered, the whole shell fitting the 320px viewport with no internal horizontal overflow and
 * zero hardcoded inline geometry, and focus on a chooser control being preserved across the
 * shell's active-region re-render (focus restoration).
 *
 * REAL-STACK, ZERO INTERCEPTION. Each proof navigates to the REAL tool page
 * (market-heatmap-lab.html, which loads rlapp.js → the REAL production RLAPP), injects the
 * shipped [data-rljourney-mount] anchor, and triggers the REAL production boot path
 * RLAPP.mountJourney(). That path fetches the REAL tool-experience.config.json, the REAL
 * journeys.json (48 definitions), the REAL tools.json registry, loads the REAL rljourney.js
 * runtime, and builds the REAL production Journey controller (globalThis.__rljourneyController)
 * against the REAL browser per-origin localStorage store. There is NO page.route /
 * context.route / .intercept / routeFromHAR / msw / nock / fulfill anywhere — durable storage is
 * the browser's own localStorage (never an intercepted response). The multi-step branching
 * backtrack scenario is driven through a synthetic a→b→(d) definition COMPILED BY THE REAL
 * RUNTIME in the browser (RLJOURNEY.compileDefinition) and opened through the shipped controller
 * (openCompiled) — a test fixture exactly as the Simple-adapter specs use frozen owner fixtures,
 * while the runtime, controller, DOM, and store are all the real production surface. The mobile
 * viewport is set with page.setViewportSize (a genuine narrow client), never by interception.
 */
import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';

const PAGE = 'market-heatmap-lab.html';
const BREADTH_DEF = 'journey/market-heatmap-lab/breadth/v1';
const MOBILE = { width: 320, height: 900 };

/* The exact production evidence submission that completes the real single-step breadth goal —
   recorded owner evidence in the required `owner-evidence` slot (byte-faithful to the desktop
   journey.spec.mjs). */
const BREADTH_CONTEXT = { evidenceIdentity: 'sha256:owner-breadth-aaa' };
const BREADTH_SUBMISSION = {
  input: { acknowledgedEvidenceIds: ['breadth-1', 'concentration-1'] },
  evidence: [{ slot: 'owner-evidence', ref: 'owner:heatmap-2026-07-26', provenance: 'owner-evidence' }],
  conclusion: { branch: 'broad', note: 'leadership is broad' },
  completedAt: '2026-07-26T10:05:00.000Z'
};

const EVIDENCE = [{ slot: 'owner-evidence', ref: 'owner:current', provenance: 'owner-evidence' }];

/* A synthetic multi-step branching definition (a→b chain with unrelated d) — byte-faithful to the
   TP-08-01 unit fixture and the desktop journey.spec.mjs synthetic. Compiled BY THE REAL RUNTIME
   in the browser. */
function syntheticDefinition(mechanism) {
  const definitionId = `journey/synthetic/${mechanism}/v1`;
  const definition = {
    contractVersion: 'journey-definition/v1',
    definitionId,
    definitionVersion: 'v1',
    toolId: 'synthetic',
    goalId: mechanism,
    title: `Synthetic ${mechanism}`,
    outcomeDescription: 'Exercise the shared mechanism / backtrack / packet contract on mobile.',
    mechanism,
    prerequisiteRules: [{ ruleId: 'r', predicate: 'explicit-choice-recorded' }],
    contextSchema: { contractVersion: 'journey-context-schema/v1', allowedFields: ['evidenceIdentity', 'publicTargetId'], requiredFields: ['evidenceIdentity'] },
    stepIds: ['a', 'b', 'd'],
    evidencePolicy: { requiredSlots: ['owner-evidence'], allowedProvenance: ['owner-evidence', 'public-source'] },
    backtrackPolicy: { mode: 'transitive-dependents-stale', auditPriorOutcomes: true },
    staleEvidencePolicy: { mode: 'reopen-dependent-steps', preserveAudit: true },
    completionPolicy: { predicates: ['explicit-choice-recorded'], outcomes: ['complete', 'partial', 'refused'] },
    packetPolicy: { contractVersion: 'journey-completion-packet/v1', humanSignoffRequired: true, noExecution: true },
    privacyClass: 'public-safe',
    noExecution: true,
    accessibility: { progressSemantics: 'ordered-list', currentStepSemantics: 'aria-current-step' },
    limitations: ['Research only.'],
    definitionFingerprint: null
  };
  const step = (id, deps) => ({
    contractVersion: 'journey-step/v1',
    stepId: id,
    definitionId,
    title: id,
    purpose: 'p',
    mechanismRole: mechanism,
    dependsOnStepIds: deps,
    inputSchema: { contractVersion: 'journey-step-input/v1', allowedFields: ['choice'], requiredFields: ['choice'] },
    allowedInputProvenance: ['user-assumption'],
    requiredEvidenceSlots: ['owner-evidence'],
    optionalEvidenceSlots: [],
    completionPredicate: 'explicit-choice-recorded',
    branchRules: [],
    staleWhen: [],
    invalidatesStepIds: [],
    ownerDeepLinks: ['synthetic.html#journey'],
    sideEffectPolicy: 'none',
    accessibility: { label: id, description: 'd' },
    stepFingerprint: null
  });
  return { definition, steps: [step('a', []), step('b', ['a']), step('d', [])] };
}

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* Navigate to the REAL tool page and wait for the REAL production RLAPP to be present (the page
   loads rlapp.js). If the page's own async boot has not exposed RLAPP yet, inject the REAL
   production module file (no interception, the real module) and wait again. */
async function openPage(page) {
  await page.goto(`${site.baseUrl}/${PAGE}`);
  await expect(page.locator('body')).toBeVisible();
  const rlappReady = () => !!(globalThis.RLAPP && typeof globalThis.RLAPP.mountJourney === 'function' && typeof globalThis.RLAPP.journey === 'function');
  try {
    await page.waitForFunction(rlappReady, undefined, { timeout: 8000 });
  } catch (error) {
    await page.addScriptTag({ path: 'rlapp.js' });
    await page.waitForFunction(rlappReady, undefined, { timeout: 8000 });
  }
}

/* Activate the SHIPPED Journey view and wait for the SHIPPED mount. Nothing is injected: the
   four-view shell renders the [data-rljourney-mount] anchor inside its Journey panel and calls the
   REAL production boot path RLAPP.mountJourney() itself — which fetches the real
   config/journeys/registry, loads the real rljourney.js runtime, and builds the real controller
   against the real browser store.

   This is deliberately stronger than the old self-injected host it replaces: the mobile-fit proof
   below now measures the panel a phone actually gets, at the width it actually gets it, instead of
   a neutral <div> the test appended to <body> and force-made visible. */
async function mountJourneyOnPage(page) {
  await page.locator('#rlviews button[data-rlview-mode="journey"]').click();
  await page.waitForFunction(() => {
    const panel = document.querySelector('[data-rlexperience-panel="journey"]');
    const anchor = panel && panel.querySelector('[data-rljourney-mount]');
    return !!(panel && !panel.hidden && anchor && anchor.getAttribute('data-rljourney-state') === 'ready' && globalThis.__rljourneyController);
  }, undefined, { timeout: 15000 });
}

/* ═══════════════════════ TP-08-09 — mobile Journey shell: progress / evidence / backtrack / packet fit + focus ═══════════════════════ */

test('Regression: Journey mobile progress evidence backtrack dialogs and packet fit and restore focus', async ({ page }) => {
  // Genuine narrow mobile client (not request interception).
  await page.setViewportSize(MOBILE);
  await openPage(page);
  await mountJourneyOnPage(page);

  /* ── Phase A — the shipped Journey shell boots on a 320px client with the durable chooser ── */
  const boot = await page.evaluate(() => {
    const anchor = document.querySelector('[data-rljourney-mount]');
    const cap = anchor.querySelector('[data-rljourney-capability]');
    const chooser = anchor.querySelector('[data-rljourney-chooser]');
    const heatmapRow = anchor.querySelector('[data-rljourney-tool="market-heatmap-lab"]');
    return {
      viewportWidth: document.documentElement.clientWidth,
      capMode: cap ? cap.getAttribute('data-rljourney-capability') : null,
      capDurable: cap ? cap.getAttribute('data-rljourney-durable') : null,
      capText: cap ? cap.textContent : '',
      chooserPresent: !!chooser,
      heatmapPresent: !!heatmapRow,
      heatmapGoalCount: heatmapRow ? Number(heatmapRow.getAttribute('data-rljourney-goal-count')) : 0
    };
  });
  expect(boot.viewportWidth, 'the client is a narrow mobile viewport').toBeLessThanOrEqual(320);
  expect(boot.capMode, 'headless Chrome has real durable localStorage').toBe('durable');
  expect(boot.capDurable).toBe('true');
  expect(boot.capText).toMatch(/Durable/);
  expect(boot.chooserPresent, 'the single shared Journey chooser renders on mobile').toBe(true);
  expect(boot.heatmapPresent, 'the real market-heatmap-lab tool row renders').toBe(true);
  expect(boot.heatmapGoalCount, 'the ordinary tool exposes at least two concrete goals').toBeGreaterThanOrEqual(2);
  // The real breadth goal control renders and is laid out on the mobile chooser. Exactly like the proven
  // desktop journey.spec.mjs, the injected mount is read through page.evaluate (the DOM reality), never
  // Playwright visibility — the real geometry is proven by a non-empty getBoundingClientRect box.
  const breadthControl = await page.evaluate(({ defId }) => {
    const button = document.querySelector(`[data-rljourney-goal="${defId}"]`);
    const rect = button ? button.getBoundingClientRect() : null;
    const cs = button ? getComputedStyle(button) : null;
    return {
      present: !!button,
      tag: button ? button.tagName : null,
      display: cs ? cs.display : null,
      visibility: cs ? cs.visibility : null,
      width: rect ? rect.width : 0,
      height: rect ? rect.height : 0,
      label: button ? (button.textContent || '').trim() : ''
    };
  }, { defId: BREADTH_DEF });
  expect(breadthControl.present, 'the real breadth goal control renders on the mobile chooser').toBe(true);
  expect(breadthControl.tag).toBe('BUTTON');
  expect(breadthControl.display, 'the goal control is not display:none').not.toBe('none');
  expect(breadthControl.visibility, 'the goal control is not visibility:hidden').not.toBe('hidden');
  expect(breadthControl.width, 'the goal control has a real layout box at 320px').toBeGreaterThan(0);
  expect(breadthControl.height, 'the goal control has a real layout box at 320px').toBeGreaterThan(0);
  expect(breadthControl.label.length, 'the goal control carries a concrete title').toBeGreaterThan(0);

  /* ── Phase B — SCN-012-009 durable resume + no visit-only completion + ordered progress semantics ── */
  const opened = await page.evaluate(({ defId, context }) => {
    const controller = globalThis.__rljourneyController;
    const view = controller.openGoal(defId, { context, sessionId: 'session/e2e/mobile-breadth-1', createdAt: '2026-07-26T10:00:00.000Z' });
    let visitRefused = false;
    try {
      controller.completeStep(view.steps[0].stepId, { input: { choice: 'x' }, evidence: [] });
    } catch (error) {
      visitRefused = /requires recorded evidence|not a completion|RLJOURNEY-STEP/.test(String(error && error.message));
    }
    // Ordered, aria-labelled progress with an aria-current="step" current step on mobile.
    const section = document.querySelector('[data-rljourney-mount] [data-rljourney-active]');
    const progress = section.querySelector('[data-rljourney-progress]');
    const currentStep = section.querySelector('[data-rljourney-step][aria-current="step"]');
    const firstStep = section.querySelector('[data-rljourney-step]');
    return {
      stepId: view.steps[0].stepId,
      stepStatus: view.steps[0].status,
      next: view.nextRequiredStepId,
      visitRefused,
      progressTag: progress ? progress.tagName : null,
      progressLabel: progress ? progress.getAttribute('aria-label') : null,
      currentStepId: currentStep ? currentStep.getAttribute('data-rljourney-step') : null,
      firstStepStatus: firstStep ? firstStep.getAttribute('data-rljourney-status') : null,
      firstStepEvidence: firstStep ? firstStep.getAttribute('data-rljourney-evidence-count') : null
    };
  }, { defId: BREADTH_DEF, context: BREADTH_CONTEXT });
  expect(opened.stepStatus, 'a fresh step is pending — a visit/creation is not a completed step').toBe('pending');
  expect(opened.next).toBe(opened.stepId);
  expect(opened.visitRefused, 'an evidence-less click cannot complete a step').toBe(true);
  expect(opened.progressTag, 'progress is a semantic ordered list').toBe('OL');
  expect(opened.progressLabel).toBe('Journey progress');
  expect(opened.currentStepId, 'the current step carries aria-current="step"').toBe(opened.stepId);
  expect(opened.firstStepStatus).toBe('pending');
  expect(opened.firstStepEvidence, 'no evidence is recorded before completion').toBe('0');

  const completed = await page.evaluate(({ stepId, submission }) => {
    const controller = globalThis.__rljourneyController;
    const view = controller.completeStep(stepId, submission);
    const section = document.querySelector('[data-rljourney-mount] [data-rljourney-active]');
    const stepLi = section.querySelector(`[data-rljourney-step="${stepId}"]`);
    return {
      status: view.steps[0].status,
      persisted: view.persist.persisted,
      next: view.nextRequiredStepId,
      domStatus: stepLi ? stepLi.getAttribute('data-rljourney-status') : null,
      domEvidence: stepLi ? Number(stepLi.getAttribute('data-rljourney-evidence-count')) : 0
    };
  }, { stepId: opened.stepId, submission: BREADTH_SUBMISSION });
  expect(completed.status).toBe('complete');
  expect(completed.persisted, 'a durable completion is written to a verified local slot').toBe(true);
  expect(completed.next, 'the single-step goal is complete').toBeNull();
  expect(completed.domStatus, 'the completed step renders complete on mobile').toBe('complete');
  expect(completed.domEvidence, 'the recorded evidence count is exposed per step').toBeGreaterThanOrEqual(1);

  // RELOAD — durable localStorage survives — re-mount and resume from the verified slot on mobile.
  await page.reload();
  const rlappReady = () => !!(globalThis.RLAPP && typeof globalThis.RLAPP.mountJourney === 'function');
  try {
    await page.waitForFunction(rlappReady, undefined, { timeout: 8000 });
  } catch (error) {
    await page.addScriptTag({ path: 'rlapp.js' });
    await page.waitForFunction(rlappReady, undefined, { timeout: 8000 });
  }
  await mountJourneyOnPage(page);

  const resumed = await page.evaluate(() => globalThis.__rljourneyController.resume());
  expect(resumed.resumed, 'the durable session resumes after reload on mobile').toBe(true);
  expect(resumed.corrupt).toBe(false);
  expect(resumed.definitionId).toBe(BREADTH_DEF);
  expect(resumed.context.evidenceIdentity, 'prior context restored').toBe(BREADTH_CONTEXT.evidenceIdentity);
  expect(resumed.steps[0].status, 'the completed step restores as complete — not because it was revisited').toBe('complete');
  expect(resumed.steps[0].evidenceCount, 'recorded evidence restored').toBeGreaterThanOrEqual(1);
  expect(resumed.nextRequiredStepId, 'the completed single-step goal restores its next-required state').toBeNull();

  /* ── Phase C — SCN-012-010 dependency-aware backtracking on mobile ── */
  const backtrack = await page.evaluate(({ synthetic, evidence }) => {
    const controller = globalThis.__rljourneyController;
    const compiled = globalThis.RLJOURNEY.compileDefinition(synthetic.definition, synthetic.steps);
    if (!compiled.ok) return { fatal: 'compile failed', error: compiled.error };
    const openedView = controller.openCompiled(compiled.value, { context: { evidenceIdentity: 'e-1' } });
    // The first step is the current step (aria-current="step") on the mobile progress list.
    const section0 = document.querySelector('[data-rljourney-mount] [data-rljourney-active]');
    const current0 = section0.querySelector('[data-rljourney-step][aria-current="step"]');
    const currentAtOpen = current0 ? current0.getAttribute('data-rljourney-step') : null;
    // Complete in topological order (a, d, b) each with recorded evidence.
    for (const stepId of compiled.value.order) {
      controller.completeStep(stepId, { input: { choice: stepId }, evidence, conclusion: `${stepId}-done`, completedAt: '2026-07-26T12:00:00.000Z' });
    }
    const preview = controller.previewBacktrack('a');
    const afterBacktrack = controller.backtrack('a', { reason: 'replace earlier assumption' });
    const byId = Object.fromEntries(afterBacktrack.steps.map((s) => [s.stepId, s]));
    const partial = controller.buildPacket({ outcome: 'partial' });
    let completeRefused = false;
    try { controller.buildPacket({ outcome: 'complete' }); } catch (error) { completeRefused = /RLJOURNEY-STALE/.test(String(error && error.message)); }
    // The rendered mobile DOM shows the stale reason on the dependent step and NOT on the unrelated one.
    const section = document.querySelector('[data-rljourney-mount] [data-rljourney-active]');
    const domB = section.querySelector('[data-rljourney-step="b"]');
    const domD = section.querySelector('[data-rljourney-step="d"]');
    return {
      order: compiled.value.order,
      openStepStatus: openedView.steps[0].status,
      currentAtOpen,
      preview,
      stepA: byId.a.status,
      stepB: byId.b.status,
      stepBReason: byId.b.staleReason,
      stepD: byId.d.status,
      stepDReason: byId.d.staleReason,
      partial,
      completeRefused,
      domBStatus: domB ? domB.getAttribute('data-rljourney-status') : null,
      domBReason: domB ? domB.getAttribute('data-rljourney-stale-reason') : null,
      domDStatus: domD ? domD.getAttribute('data-rljourney-status') : null,
      domDReason: domD ? domD.getAttribute('data-rljourney-stale-reason') : null
    };
  }, { synthetic: syntheticDefinition('decision-tree'), evidence: EVIDENCE });

  expect(backtrack.fatal, JSON.stringify(backtrack.error || {})).toBeUndefined();
  expect(backtrack.openStepStatus, 'a freshly opened step is pending, not completed by opening').toBe('pending');
  expect(backtrack.currentAtOpen, 'the first step is the current step on mobile').toBe('a');
  // Only the transitive dependent (b) becomes stale; the unrelated completed step (d) stays intact.
  expect(backtrack.preview.staleDependents).toEqual(['b']);
  expect(backtrack.preview.unrelatedComplete).toEqual(['d']);
  expect(backtrack.stepA, 'the backtracked step reopens').toBe('active');
  expect(backtrack.stepB, 'the transitive dependent becomes stale').toBe('stale');
  expect(backtrack.stepBReason).toMatch(/dependency backtracked: a/);
  expect(backtrack.stepBReason).toMatch(/replace earlier assumption/);
  expect(backtrack.stepD, 'the unrelated completed step remains intact').toBe('complete');
  expect(backtrack.stepDReason).toBeNull();
  // The mobile DOM reflects the same stale-with-reason on b and clean on d.
  expect(backtrack.domBStatus).toBe('stale');
  expect(backtrack.domBReason).toMatch(/dependency backtracked: a/);
  expect(backtrack.domDStatus).toBe('complete');
  expect(backtrack.domDReason).toBeNull();
  // The partial packet excludes the stale dependent conclusion; a full complete packet is refused.
  expect(backtrack.partial.outcome).toBe('partial');
  expect(backtrack.partial.excludedStaleSteps).toContain('b');
  expect(backtrack.partial.outcomes, 'the stale step is not a packet outcome').not.toContain('b');
  expect(backtrack.partial.executed, 'building a packet executes nothing').toBe(false);
  expect(backtrack.completeRefused, 'a complete packet is refused while a dependent is stale').toBe(true);

  /* ── Phase D — SCN-012-011 review-only signoff triggers ZERO execution on mobile + packet DOM ── */
  await page.evaluate(({ defId, context, submission }) => {
    const controller = globalThis.__rljourneyController;
    const opened = controller.openGoal(defId, { context });
    controller.completeStep(opened.steps[0].stepId, submission);
    controller.buildPacket({ outcome: 'complete', signoff: { reviewer: 'analyst', intent: 'accept-research-process' } });
  }, { defId: BREADTH_DEF, context: BREADTH_CONTEXT, submission: BREADTH_SUBMISSION });

  // The completion packet + disclaimer render and fit within the 320px mobile viewport.
  const packetDom = await page.evaluate(() => {
    const section = document.querySelector('[data-rljourney-mount] [data-rljourney-active]');
    const packet = section.querySelector('[data-rljourney-packet]');
    const disclaimer = packet ? packet.querySelector('[data-rljourney-disclaimer]') : null;
    return {
      present: !!packet,
      outcome: packet ? packet.getAttribute('data-rljourney-packet') : null,
      executed: packet ? packet.getAttribute('data-rljourney-executed') : null,
      review: packet ? packet.getAttribute('data-rljourney-review') : null,
      disclaimerLength: disclaimer ? (disclaimer.textContent || '').trim().length : 0,
      packetRight: packet ? packet.getBoundingClientRect().right : null,
      viewportWidth: document.documentElement.clientWidth
    };
  });
  expect(packetDom.present, 'the completion packet renders on mobile').toBe(true);
  expect(packetDom.outcome).toBe('complete');
  expect(packetDom.executed, 'a rendered packet is never executed').toBe('false');
  expect(packetDom.review, 'the packet is not review-recorded before signoff').toBe('false');
  expect(packetDom.disclaimerLength, 'the packet carries a non-empty research disclaimer').toBeGreaterThan(0);
  expect(packetDom.packetRight, 'the packet fits within the 320px viewport').toBeLessThanOrEqual(packetDom.viewportWidth + 1);

  // Record every network request from this point — recording a human signoff must trigger NONE.
  const requestsAfterSetup = [];
  const onRequest = (request) => requestsAfterSetup.push(request.url());
  page.on('request', onRequest);

  const proof = await page.evaluate(() => {
    const controller = globalThis.__rljourneyController;
    const runtime = globalThis.RLJOURNEY;
    // The FULL local storage ledger (request/publication/portfolio/execution — every key) BEFORE review.
    const snapshot = () => {
      const keys = Object.keys(globalThis.localStorage).sort();
      return JSON.stringify(keys.map((key) => [key, globalThis.localStorage.getItem(key)]));
    };
    const before = snapshot();
    const beforePacket = controller.packetState();
    const afterReview = controller.recordReview({ reviewer: 'analyst', acceptedAt: '2026-07-26T13:00:00.000Z', note: 'accept the research process' });
    const after = snapshot();
    const executionSurface = ['executeTrade', 'submitOrder', 'placeOrder', 'rebalance', 'hedge', 'trade', 'execute', 'changeHolding']
      .filter((name) => typeof runtime[name] === 'function' || typeof controller[name] === 'function');
    const section = document.querySelector('[data-rljourney-mount] [data-rljourney-active]');
    const packet = section.querySelector('[data-rljourney-packet]');
    return {
      byteIdentical: before === after,
      beforeReviewRecorded: beforePacket.reviewRecorded,
      afterReviewRecorded: afterReview.reviewRecorded,
      executed: afterReview.executed,
      noExecution: afterReview.noExecution,
      outcome: afterReview.outcome,
      executionSurface,
      domReview: packet ? packet.getAttribute('data-rljourney-review') : null
    };
  });

  await page.waitForTimeout(150); // let any (forbidden) execution request surface
  page.off('request', onRequest);

  expect(proof.beforeReviewRecorded, 'review is not recorded before signoff').toBe(false);
  expect(proof.afterReviewRecorded, 'review is recorded locally after signoff').toBe(true);
  expect(proof.executed, 'a signed-off packet NEVER executes').toBe(false);
  expect(proof.noExecution, 'the packet carries the no-execution invariant').toBe(true);
  expect(proof.outcome).toBe('complete');
  expect(proof.executionSurface, 'no trade/order/holding/rebalance/hedge/execute entry point exists').toEqual([]);
  expect(proof.domReview, 'the mobile packet DOM flips to review-recorded after signoff').toBe('true');
  // The request/publication/portfolio/execution ledgers are BYTE-IDENTICAL across the signoff.
  expect(proof.byteIdentical, 'recording review mutates no storage ledger — every key is byte-identical').toBe(true);
  const executionRequests = requestsAfterSetup.filter((url) => /trade|order|execute|rebalance|hedge|holding|portfolio|publish/i.test(url));
  expect(executionRequests, 'signoff issues no execution / publication network request').toEqual([]);

  /* ── Phase E — mobile focus restoration across an active-region re-render ── */
  // The shell re-renders ONLY the active region (renderActive), never the chooser <ul> that holds the
  // focused control, so DOM focus is PRESERVED (restored) across the mutation. Focus is driven through
  // the DOM API (the host page clips the injected mount, so Playwright actionability is not applicable).
  const focus = await page.evaluate(({ defId }) => {
    const controller = globalThis.__rljourneyController;
    const button = document.querySelector(`[data-rljourney-goal="${defId}"]`);
    if (!button) return { fatal: 'breadth control missing' };
    button.focus({ preventScroll: true });
    const focusedBefore = document.activeElement === button;
    const before = document.activeElement && document.activeElement.getAttribute('data-rljourney-goal');
    controller.buildPacket({ outcome: 'partial' }); // re-render the active progress/packet region only
    const focusedAfter = document.activeElement === button;
    const after = document.activeElement && document.activeElement.getAttribute('data-rljourney-goal');
    return { focusedBefore, focusedAfter, before, after };
  }, { defId: BREADTH_DEF });
  expect(focus.fatal, focus.fatal || '').toBeFalsy();
  expect(focus.focusedBefore, 'a chooser control accepts focus on mobile').toBe(true);
  expect(focus.before, 'the focused control is the breadth goal button').toBe(BREADTH_DEF);
  expect(focus.focusedAfter, 'the shell re-renders the active region WITHOUT stealing focus from the chooser control').toBe(true);
  expect(focus.after, 'focus is preserved (restored) on the chooser control across the active-region re-render').toBe(BREADTH_DEF);

  // The whole Journey shell fits the 320px client with no internal horizontal overflow and imposes
  // no hardcoded inline geometry (so it adapts to any narrow viewport).
  const fit = await page.evaluate(() => {
    const mount = document.querySelector('[data-rljourney-mount]');
    const progress = mount.querySelector('[data-rljourney-progress]');
    const packet = mount.querySelector('[data-rljourney-packet]');
    const viewportWidth = document.documentElement.clientWidth;
    const inlineStyled = mount.querySelectorAll('[style]').length;
    return {
      viewportWidth,
      mountOverflow: mount.scrollWidth - mount.clientWidth,
      progressRight: progress ? progress.getBoundingClientRect().right : null,
      packetRight: packet ? packet.getBoundingClientRect().right : null,
      inlineStyled
    };
  });
  expect(fit.mountOverflow, 'the Journey shell has no internal horizontal overflow at 320px').toBeLessThanOrEqual(1);
  expect(fit.progressRight, 'the progress list fits within the mobile viewport').toBeLessThanOrEqual(fit.viewportWidth + 1);
  expect(fit.packetRight, 'the packet fits within the mobile viewport').toBeLessThanOrEqual(fit.viewportWidth + 1);
  expect(fit.inlineStyled, 'the shell imposes no hardcoded inline geometry (adapts to any viewport)').toBe(0);
});
