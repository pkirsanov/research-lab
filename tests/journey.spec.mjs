/*
 * TP-08-04 … TP-08-08 — persistent live-stack system-Chrome regressions for the Feature 012 Scope 08
 * Journey capability shell (SCN-012-009, SCN-012-010, SCN-012-011, SCN-012-032 + the shared mechanism
 * contract).
 *
 * REAL-STACK, ZERO INTERCEPTION. Each test navigates to a REAL tool page (market-heatmap-lab.html,
 * which loads rlapp.js and therefore brings up the REAL production RLAPP), injects the shipped
 * [data-rljourney-mount] anchor, and triggers the REAL production boot path RLAPP.mountJourney(). That
 * path fetches the REAL tool-experience.config.json, the REAL journeys.json (48 definitions), the REAL
 * tools.json registry, loads the REAL rljourney.js runtime, and builds the REAL production Journey
 * controller (RLAPP.journey) against the REAL browser per-origin localStorage store. There is NO
 * page.route / context.route / intercept / routeFromHAR / msw / nock / fulfill anywhere — durable
 * storage is the browser's own localStorage (not an intercepted response), and a "session only" state
 * is produced by a genuine browser CAPABILITY refusal (a throwing localStorage stub), never by request
 * interception.
 *
 * The single-step production definitions (journey/market-heatmap-lab/breadth/v1) drive the durable
 * resume + no-execution proofs against a REAL registry goal. The multi-step branching scenarios
 * (SCN-012-010 transitive-stale backtracking; the shared four-mechanism contract) are driven through a
 * synthetic a→b→(d) definition COMPILED BY THE REAL RUNTIME in the browser (RLJOURNEY.compileDefinition)
 * and opened through the shipped controller (openCompiled) — the definition is a test fixture exactly as
 * the Simple-adapter specs use frozen owner fixtures, while the runtime, controller, DOM, and store are
 * all the real production surface.
 */
import { expect, test } from './playwright-runtime.mjs';
import { readJson, startStaticServer } from './tool-experience.support.mjs';

const PAGE = 'market-heatmap-lab.html';
const BREADTH_DEF = 'journey/market-heatmap-lab/breadth/v1';
const MECHANISMS = ['wizard', 'checklist', 'decision-tree', 'scenario-lab'];

/* The exact production evidence submission the TP-08-03 storage test uses to complete the real
   single-step breadth goal — recorded owner evidence in the required `owner-evidence` slot. */
const BREADTH_CONTEXT = { evidenceIdentity: 'sha256:owner-breadth-aaa' };
const BREADTH_SUBMISSION = {
  input: { acknowledgedEvidenceIds: ['breadth-1', 'concentration-1'] },
  evidence: [{ slot: 'owner-evidence', ref: 'owner:heatmap-2026-07-26', provenance: 'owner-evidence' }],
  conclusion: { branch: 'broad', note: 'leadership is broad' },
  completedAt: '2026-07-26T10:05:00.000Z'
};

/* A synthetic multi-step branching definition (a→b chain with unrelated d) for a given mechanism —
   byte-faithful to the TP-08-01 unit fixture. Compiled BY THE REAL RUNTIME in the browser. */
function syntheticDefinition(mechanism) {
  const definitionId = `journey/synthetic/${mechanism}/v1`;
  const definition = {
    contractVersion: 'journey-definition/v1',
    definitionId,
    definitionVersion: 'v1',
    toolId: 'synthetic',
    goalId: mechanism,
    title: `Synthetic ${mechanism}`,
    outcomeDescription: 'Exercise the shared mechanism / backtrack / packet contract.',
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

const EVIDENCE = [{ slot: 'owner-evidence', ref: 'owner:current', provenance: 'owner-evidence' }];

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* Navigate to the REAL tool page and wait for the REAL production RLAPP to be present (the page loads
   rlapp.js). If the page's own async boot has not exposed RLAPP yet, inject the REAL production module
   file (no interception, the real module) and wait again. */
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

/* Inject the shipped [data-rljourney-mount] anchor and trigger the REAL production boot mount path
   RLAPP.mountJourney() — which fetches the real config/journeys/registry, loads the real rljourney.js
   runtime, and builds the real controller against the real browser store. Waits for the shipped
   ready state and the controller handle the boot path itself publishes. */
async function mountJourneyOnPage(page) {
  await page.evaluate(() => {
    let anchor = document.querySelector('[data-rljourney-mount]');
    if (!anchor) {
      anchor = document.createElement('section');
      anchor.setAttribute('data-rljourney-mount', 'test');
      document.body.appendChild(anchor);
    }
    anchor.removeAttribute('data-rljourney-state');
    globalThis.__rljourneyController = null;
    globalThis.RLAPP.mountJourney();
  });
  await page.waitForFunction(() => {
    const anchor = document.querySelector('[data-rljourney-mount]');
    return !!(anchor && anchor.getAttribute('data-rljourney-state') === 'ready' && globalThis.__rljourneyController);
  }, undefined, { timeout: 12000 });
}

/* ═══════════════ Step 8 — the journey surface must SHIP, not be test-injected ═══════════════ */

test('the [data-rljourney-mount] anchor is shipped by the four-view shell, and the goal chooser mounts itself', async ({ page }) => {
  await page.goto(`${site.baseUrl}/${PAGE}`);
  await expect(page.locator('body')).toBeVisible();

  /* Route to the shipped Journey view exactly as a user would — the shell owns #journey routing.
     NOTHING is injected here: no addScriptTag, no createElement, no setAttribute. If the anchor
     only existed because the other tests in this file build it, this test fails. */
  await page.locator('#rlviews button[data-rlview-mode="journey"]').click();

  const anchor = page.locator('[data-rlexperience-panel="journey"] [data-rljourney-mount]');
  await expect(anchor).toHaveCount(1);
  await expect(anchor).toHaveAttribute('data-rljourney-state', 'ready', { timeout: 15000 });

  /* Mounted means the REAL chooser is on screen listing REAL registry goals, not a placeholder. */
  const surface = await page.evaluate(() => {
    const host = document.querySelector('[data-rljourney-mount]');
    const panel = document.querySelector('[data-rlexperience-panel="journey"]');
    return {
      controllerLive: !!globalThis.__rljourneyController,
      hostHasContent: host.textContent.trim().length > 0,
      goalCount: host.querySelectorAll('[data-rljourney-goal]').length,
      panelText: panel.textContent
    };
  });

  expect(surface.controllerLive).toBe(true);
  expect(surface.hostHasContent).toBe(true);
  expect(surface.goalCount).toBeGreaterThan(0);

  /* ADVERSARIAL: the old copy promised the runtime was coming later. If that sentence is still on
     screen the panel is still the placeholder and the mount did not really happen — this assertion
     is what would fail if someone reverted the wiring but left the anchor behind. */
  expect(surface.panelText).not.toContain('Runtime activation is delivered');
});

/* ═══════════════════════ TP-08-04 — SCN-012-009 durable resume ═══════════════════════ */

test('Regression: SCN-012-009 Journey reload restores evidence-complete progress and never completes visits', async ({ page }) => {
  await openPage(page);
  await mountJourneyOnPage(page);

  // Real capability + a visit/creation is NOT a completed step + an evidence-less "click" is refused.
  const created = await page.evaluate(({ defId, context }) => {
    const controller = globalThis.__rljourneyController;
    const capability = controller.capability();
    const opened = controller.openGoal(defId, { context, sessionId: 'session/e2e/breadth-1', createdAt: '2026-07-26T10:00:00.000Z' });
    let visitRefused = false;
    try {
      controller.completeStep(opened.steps[0].stepId, { input: { choice: 'x' }, evidence: [] });
    } catch (error) {
      visitRefused = /requires recorded evidence|not a completion|RLJOURNEY-STEP/.test(String(error && error.message));
    }
    return { capability, stepStatus: opened.steps[0].status, stepId: opened.steps[0].stepId, next: opened.nextRequiredStepId, visitRefused };
  }, { defId: BREADTH_DEF, context: BREADTH_CONTEXT });

  expect(created.capability.durable, 'headless Chrome has real durable localStorage').toBe(true);
  expect(created.capability.mode).toBe('durable');
  expect(created.stepStatus, 'a fresh session step is pending — a visit/creation is not a completed step').toBe('pending');
  expect(created.next).toBe(created.stepId);
  expect(created.visitRefused, 'an evidence-less click cannot complete a step').toBe(true);

  // Complete the real step with recorded owner evidence and persist to the durable slot.
  const persisted = await page.evaluate(({ stepId, submission }) => {
    const controller = globalThis.__rljourneyController;
    const view = controller.completeStep(stepId, submission);
    return { status: view.steps[0].status, evidenceCount: view.steps[0].evidenceCount, persist: view.persist, next: view.nextRequiredStepId };
  }, { stepId: created.stepId, submission: BREADTH_SUBMISSION });
  expect(persisted.status).toBe('complete');
  expect(persisted.evidenceCount).toBeGreaterThanOrEqual(1);
  expect(persisted.persist.persisted, 'a durable completion is written to a verified local slot').toBe(true);
  expect(persisted.next, 'the single-step goal is complete').toBeNull();

  // RELOAD — durable localStorage survives — then re-mount and resume from the verified slot.
  await page.reload();
  const rlappReady = () => !!(globalThis.RLAPP && typeof globalThis.RLAPP.mountJourney === 'function');
  try {
    await page.waitForFunction(rlappReady, undefined, { timeout: 8000 });
  } catch (error) {
    await page.addScriptTag({ path: 'rlapp.js' });
    await page.waitForFunction(rlappReady, undefined, { timeout: 8000 });
  }
  await mountJourneyOnPage(page);

  const resumed = await page.evaluate(() => {
    const controller = globalThis.__rljourneyController;
    const view = controller.resume();
    return view;
  });
  expect(resumed.resumed, 'the durable session resumes after reload').toBe(true);
  expect(resumed.corrupt).toBe(false);
  expect(resumed.definitionId).toBe(BREADTH_DEF);
  expect(resumed.context.evidenceIdentity, 'prior context restored').toBe(BREADTH_CONTEXT.evidenceIdentity);
  expect(resumed.steps[0].status, 'the completed step restores as complete — not because it was revisited').toBe('complete');
  expect(resumed.steps[0].evidenceCount, 'recorded evidence restored').toBeGreaterThanOrEqual(1);
  expect(resumed.nextRequiredStepId, 'the completed single-step goal restores its next-required state').toBeNull();
});

/* ═══════════════════════ TP-08-04b — session-only capability (browser-disabled storage) ═══════════════════════ */

test('Regression: SCN-012-009 disabled browser storage reports session-only and never claims durable persistence', async ({ page }) => {
  await openPage(page);
  // Genuine browser CAPABILITY refusal (not request interception): replace localStorage with a throwing
  // stub BEFORE the controller probes it. The store capability probe write/read-back throws → session-only.
  await page.evaluate(() => {
    const throwing = {
      getItem() { throw new Error('SecurityError: storage is disabled'); },
      setItem() { throw new Error('SecurityError: storage is disabled'); },
      removeItem() { throw new Error('SecurityError: storage is disabled'); }
    };
    try { Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { return throwing; } }); } catch (error) { globalThis.localStorage = throwing; }
  });
  await mountJourneyOnPage(page);

  const state = await page.evaluate(({ defId, context }) => {
    const controller = globalThis.__rljourneyController;
    const capability = controller.capability();
    const opened = controller.openGoal(defId, { context });
    // Safe export must still work under session-only mode.
    const view = controller.completeStep(opened.steps[0].stepId, {
      input: { acknowledgedEvidenceIds: ['breadth-1'] },
      evidence: [{ slot: 'owner-evidence', ref: 'owner:x', provenance: 'owner-evidence' }],
      completedAt: '2026-07-26T11:00:00.000Z'
    });
    const exported = controller.exportCurrent();
    const anchor = document.querySelector('[data-rljourney-mount]');
    const capHost = anchor.querySelector('[data-rljourney-capability]');
    return {
      capability,
      persist: view.persist,
      capabilityAttr: capHost ? capHost.getAttribute('data-rljourney-capability') : null,
      durableAttr: capHost ? capHost.getAttribute('data-rljourney-durable') : null,
      capText: capHost ? capHost.textContent : '',
      exportedJson: !!(exported && exported.json)
    };
  }, { defId: BREADTH_DEF, context: BREADTH_CONTEXT });

  expect(state.capability.durable, 'disabled storage is not durable').toBe(false);
  expect(state.capability.mode).toBe('session-only');
  expect(state.capabilityAttr).toBe('session-only');
  expect(state.durableAttr).toBe('false');
  expect(state.capText, 'the shell visibly says Session only before start').toMatch(/Session only/);
  expect(state.persist.persisted, 'session-only mode never claims durable persistence').toBe(false);
  expect(state.persist.mode).toBe('session-only');
  expect(state.exportedJson, 'safe export still works under session-only mode').toBe(true);
});

/* ═══════════════════════ TP-08-05 — SCN-012-010 dependency-aware backtracking ═══════════════════════ */

test('Regression: SCN-012-010 backtracking stales only dependent steps and excludes stale packet outcomes', async ({ page }) => {
  await openPage(page);
  await mountJourneyOnPage(page);

  const result = await page.evaluate(({ synthetic, evidence }) => {
    const controller = globalThis.__rljourneyController;
    const compiled = globalThis.RLJOURNEY.compileDefinition(synthetic.definition, synthetic.steps);
    if (!compiled.ok) return { fatal: 'compile failed', error: compiled.error };
    controller.openCompiled(compiled.value, { context: { evidenceIdentity: 'e-1' } });
    // Complete in topological order a → d → b (order is a,d,b), each with recorded evidence.
    const order = compiled.value.order;
    for (const stepId of order) {
      controller.completeStep(stepId, { input: { choice: stepId }, evidence, conclusion: `${stepId}-done`, completedAt: '2026-07-26T12:00:00.000Z' });
    }
    const preview = controller.previewBacktrack('a');
    const afterBacktrack = controller.backtrack('a', { reason: 'replace earlier assumption' });
    const byId = Object.fromEntries(afterBacktrack.steps.map((s) => [s.stepId, s]));
    // A completion packet cannot carry stale dependent conclusions.
    const partial = controller.buildPacket({ outcome: 'partial' });
    let completeRefused = false;
    try { controller.buildPacket({ outcome: 'complete' }); } catch (error) { completeRefused = /RLJOURNEY-STALE/.test(String(error && error.message)); }
    // The rendered DOM must show the stale reason on the dependent step and NOT on the unrelated one.
    const section = document.querySelector('[data-rljourney-mount] [data-rljourney-active]');
    const domB = section.querySelector('[data-rljourney-step="b"]');
    const domD = section.querySelector('[data-rljourney-step="d"]');
    return {
      order,
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

  expect(result.fatal, JSON.stringify(result.error || {})).toBeUndefined();
  // Only the transitive dependent (b) becomes stale; the unrelated completed step (d) stays intact.
  expect(result.preview.staleDependents).toEqual(['b']);
  expect(result.preview.unrelatedComplete).toEqual(['d']);
  expect(result.stepA, 'the backtracked step reopens').toBe('active');
  expect(result.stepB, 'the transitive dependent becomes stale').toBe('stale');
  expect(result.stepBReason).toMatch(/dependency backtracked: a/);
  expect(result.stepBReason).toMatch(/replace earlier assumption/);
  expect(result.stepD, 'the unrelated completed step remains intact').toBe('complete');
  expect(result.stepDReason).toBeNull();
  // The DOM reflects the same stale-with-reason on b and clean on d.
  expect(result.domBStatus).toBe('stale');
  expect(result.domBReason).toMatch(/dependency backtracked: a/);
  expect(result.domDStatus).toBe('complete');
  expect(result.domDReason).toBeNull();
  // The partial packet excludes the stale dependent conclusion; a full complete packet is refused.
  expect(result.partial.outcome).toBe('partial');
  expect(result.partial.excludedStaleSteps).toContain('b');
  expect(result.partial.outcomes, 'the stale step is not a packet outcome').not.toContain('b');
  expect(result.partial.executed, 'building a packet executes nothing').toBe(false);
  expect(result.completeRefused, 'a complete packet is refused while a dependent is stale').toBe(true);
});

/* ═══════════════════════ TP-08-06 — SCN-012-011 review-only signoff, ZERO execution ═══════════════════════ */

test('Regression: SCN-012-011 human review changes only local packet state and triggers no execution', async ({ page }) => {
  await openPage(page);
  await mountJourneyOnPage(page);

  // Complete the real single-step breadth goal and build a complete packet ready for signoff.
  await page.evaluate(({ defId, context, submission }) => {
    const controller = globalThis.__rljourneyController;
    const opened = controller.openGoal(defId, { context });
    controller.completeStep(opened.steps[0].stepId, submission);
    // A complete packet is built WITH the human signoff object; recording the review comes next.
    controller.buildPacket({ outcome: 'complete', signoff: { reviewer: 'analyst', intent: 'accept-research-process' } });
  }, { defId: BREADTH_DEF, context: BREADTH_CONTEXT, submission: BREADTH_SUBMISSION });

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
    // Record the human signoff of the RESEARCH PROCESS.
    const afterReview = controller.recordReview({ reviewer: 'analyst', acceptedAt: '2026-07-26T13:00:00.000Z', note: 'accept the research process' });
    const after = snapshot();
    // There is NO execution entry point anywhere on the runtime or controller.
    const executionSurface = ['executeTrade', 'submitOrder', 'placeOrder', 'rebalance', 'hedge', 'trade', 'execute', 'changeHolding']
      .filter((name) => typeof runtime[name] === 'function' || typeof controller[name] === 'function');
    return {
      before,
      after,
      byteIdentical: before === after,
      beforeReviewRecorded: beforePacket.reviewRecorded,
      afterReviewRecorded: afterReview.reviewRecorded,
      executed: afterReview.executed,
      noExecution: afterReview.noExecution,
      outcome: afterReview.outcome,
      executionSurface
    };
  });

  await page.waitForTimeout(150); // let any (forbidden) execution request surface
  page.off('request', onRequest);

  // The packet's review state flips locally; nothing executes.
  expect(proof.beforeReviewRecorded, 'review is not recorded before signoff').toBe(false);
  expect(proof.afterReviewRecorded, 'review is recorded locally after signoff').toBe(true);
  expect(proof.executed, 'a signed-off packet NEVER executes').toBe(false);
  expect(proof.noExecution, 'the packet carries the no-execution invariant').toBe(true);
  expect(proof.outcome).toBe('complete');
  expect(proof.executionSurface, 'no trade/order/holding/rebalance/hedge/execute entry point exists').toEqual([]);
  // The request/publication/portfolio/execution ledgers are BYTE-IDENTICAL across the signoff.
  expect(proof.byteIdentical, 'recording review mutates no storage ledger — every key is byte-identical').toBe(true);
  expect(proof.before).toBe(proof.after);
  // Recording the human signoff issued ZERO execution / publication network requests (no external side effect).
  const executionRequests = requestsAfterSetup.filter((url) => /trade|order|execute|rebalance|hedge|holding|portfolio|publish/i.test(url));
  expect(executionRequests, 'signoff issues no execution / publication network request').toEqual([]);
});

/* ═══════════════════════ TP-08-07 — SCN-012-032 every registered tool exposes concrete goals ═══════════════════════ */

test('Regression: SCN-012-032 every registered tool exposes concrete goals through one Journey shell', async ({ page }) => {
  await openPage(page);
  await mountJourneyOnPage(page);

  const chooser = await page.evaluate(() => {
    const anchor = document.querySelector('[data-rljourney-mount]');
    const tools = Array.from(anchor.querySelectorAll('[data-rljourney-tool]')).map((li) => {
      const goals = Array.from(li.querySelectorAll('[data-rljourney-goal]')).map((btn) => ({
        definitionId: btn.getAttribute('data-rljourney-goal'),
        toolId: btn.getAttribute('data-rljourney-tool-id'),
        mechanism: btn.getAttribute('data-rljourney-mechanism'),
        title: (btn.textContent || '').trim()
      }));
      return {
        registryId: li.getAttribute('data-rljourney-tool'),
        kind: li.getAttribute('data-rljourney-kind'),
        goalCount: Number(li.getAttribute('data-rljourney-goal-count')),
        goals
      };
    });
    return { toolCount: tools.length, tools };
  });

  const config = readJson('tool-experience.config.json');
  const registryTools = readJson('tools.json').tools;
  const MECH = new Set(['wizard', 'checklist', 'decision-tree', 'scenario-lab', 'composition']);
  const GENERIC = /example|generic|placeholder|goal-one|goal-two|sample|\btbd\b|\btodo\b|\bdemo\b/i;

  // Every registered tool renders exactly one chooser row in the single shared shell.
  expect(chooser.toolCount, 'the shell renders one row per registered tool').toBe(registryTools.length);

  const byId = Object.fromEntries(chooser.tools.map((row) => [row.registryId, row]));
  for (const tool of registryTools) {
    const row = byId[tool.id];
    expect(row, `${tool.id} has a chooser row`).toBeTruthy();
    const kind = (tool.experience && tool.experience.kind) || 'ordinary';
    if (kind === 'market-action-center') {
      // Market Action Center (market-brief) maps to exactly the four explicit global goals.
      expect(row.goalCount, `${tool.id} (Center) maps to exactly four global goals`).toBe(4);
      expect(row.goals).toHaveLength(4);
    } else {
      // Every ordinary tool has at least two concrete goals.
      expect(row.goalCount, `${tool.id} has at least two concrete goals`).toBeGreaterThanOrEqual(2);
      expect(row.goals.length).toBeGreaterThanOrEqual(2);
    }
    // Each goal is concrete: a real definitionId, a mechanism from the closed set, a non-generic title.
    for (const goal of row.goals) {
      expect(goal.definitionId, `${tool.id} goal has a real definition id`).toBeTruthy();
      expect(MECH.has(goal.mechanism), `${tool.id} goal has a concrete mechanism (${goal.mechanism})`).toBe(true);
      expect(goal.title.length, `${tool.id} goal has a title`).toBeGreaterThan(0);
      expect(GENERIC.test(goal.definitionId), `${tool.id} goal ${goal.definitionId} is not generic/example-only`).toBe(false);
      // The machine goalId is enforced non-generic by the runtime; the human title must not BE a bare
      // placeholder word (legitimate prose substrings like "out-of-sample" are fine).
      expect(['example', 'generic', 'placeholder', 'sample', 'tbd', 'todo', 'demo', 'goal'], `${tool.id} goal title "${goal.title}" is not a bare placeholder`).not.toContain(goal.title.trim().toLowerCase());
    }
  }

  // The Center's exact identity: market-brief is the market-action-center with four goals.
  const centerId = config.viewSets['market-action-center-four-view/v1'].registryToolId;
  expect(centerId).toBe('market-brief');
  expect(byId[centerId].kind).toBe('market-action-center');
  expect(byId[centerId].goalCount).toBe(4);
});

/* ═══════════════════════ TP-08-08 — one shared mechanism / evidence / backtrack / packet contract ═══════════════════════ */

test('Regression: wizard checklist decision tree and scenario lab share evidence completion backtrack and packet rules', async ({ page }) => {
  await openPage(page);
  await mountJourneyOnPage(page);

  const results = await page.evaluate(({ mechanisms, evidence }) => {
    const controller = globalThis.__rljourneyController;
    const runtime = globalThis.RLJOURNEY;
    function synthetic(mechanism) {
      const definitionId = `journey/synthetic/${mechanism}/v1`;
      const definition = {
        contractVersion: 'journey-definition/v1', definitionId, definitionVersion: 'v1', toolId: 'synthetic', goalId: mechanism,
        title: `Synthetic ${mechanism}`, outcomeDescription: 'Shared contract.', mechanism,
        prerequisiteRules: [{ ruleId: 'r', predicate: 'explicit-choice-recorded' }],
        contextSchema: { contractVersion: 'journey-context-schema/v1', allowedFields: ['evidenceIdentity', 'publicTargetId'], requiredFields: ['evidenceIdentity'] },
        stepIds: ['a', 'b', 'd'],
        evidencePolicy: { requiredSlots: ['owner-evidence'], allowedProvenance: ['owner-evidence', 'public-source'] },
        backtrackPolicy: { mode: 'transitive-dependents-stale', auditPriorOutcomes: true },
        staleEvidencePolicy: { mode: 'reopen-dependent-steps', preserveAudit: true },
        completionPolicy: { predicates: ['explicit-choice-recorded'], outcomes: ['complete', 'partial', 'refused'] },
        packetPolicy: { contractVersion: 'journey-completion-packet/v1', humanSignoffRequired: true, noExecution: true },
        privacyClass: 'public-safe', noExecution: true,
        accessibility: { progressSemantics: 'ordered-list', currentStepSemantics: 'aria-current-step' },
        limitations: ['Research only.'], definitionFingerprint: null
      };
      const step = (id, deps) => ({
        contractVersion: 'journey-step/v1', stepId: id, definitionId, title: id, purpose: 'p', mechanismRole: mechanism,
        dependsOnStepIds: deps, inputSchema: { contractVersion: 'journey-step-input/v1', allowedFields: ['choice'], requiredFields: ['choice'] },
        allowedInputProvenance: ['user-assumption'], requiredEvidenceSlots: ['owner-evidence'], optionalEvidenceSlots: [],
        completionPredicate: 'explicit-choice-recorded', branchRules: [], staleWhen: [], invalidatesStepIds: [],
        ownerDeepLinks: ['synthetic.html#journey'], sideEffectPolicy: 'none', accessibility: { label: id, description: 'd' }, stepFingerprint: null
      });
      return { definition, steps: [step('a', []), step('b', ['a']), step('d', [])] };
    }
    const out = {};
    for (const mechanism of mechanisms) {
      const spec = synthetic(mechanism);
      const compiled = runtime.compileDefinition(spec.definition, spec.steps);
      if (!compiled.ok) { out[mechanism] = { fatal: compiled.error }; continue; }
      controller.openCompiled(compiled.value, { context: { evidenceIdentity: 'e-1' } });
      // Common evidence rule: an evidence-less completion is refused for EVERY mechanism.
      let visitRefused = false;
      try { controller.completeStep('a', { input: { choice: 'a' }, evidence: [] }); } catch (error) { visitRefused = /RLJOURNEY-STEP/.test(String(error && error.message)); }
      // Common completion: complete in topological order with recorded evidence.
      for (const stepId of compiled.value.order) {
        controller.completeStep(stepId, { input: { choice: stepId }, evidence, conclusion: `${stepId}`, completedAt: '2026-07-26T14:00:00.000Z' });
      }
      // Common backtrack rule: backtracking a stales its transitive dependent b, keeps unrelated d.
      const afterBacktrack = controller.backtrack('a', { reason: 'shared backtrack' });
      const byId = Object.fromEntries(afterBacktrack.steps.map((s) => [s.stepId, s]));
      // Common packet rule: a typed partial packet excludes the stale step and executes nothing.
      const packet = controller.buildPacket({ outcome: 'partial' });
      out[mechanism] = {
        visitRefused,
        mechanism: compiled.value.mechanism,
        bStatus: byId.b.status,
        dStatus: byId.d.status,
        packetOutcome: packet.outcome,
        excludedStale: packet.excludedStaleSteps,
        packetOutcomes: packet.outcomes,
        executed: packet.executed,
        noExecution: packet.noExecution
      };
    }
    return out;
  }, { mechanisms: MECHANISMS, evidence: EVIDENCE });

  for (const mechanism of MECHANISMS) {
    const row = results[mechanism];
    expect(row.fatal, `${mechanism} compiles: ${JSON.stringify(row.fatal || {})}`).toBeUndefined();
    expect(row.mechanism, `${mechanism} keeps its declared mechanism`).toBe(mechanism);
    expect(row.visitRefused, `${mechanism}: an evidence-less completion is refused (shared evidence rule)`).toBe(true);
    expect(row.bStatus, `${mechanism}: backtrack stales the transitive dependent (shared backtrack rule)`).toBe('stale');
    expect(row.dStatus, `${mechanism}: the unrelated step stays complete (shared backtrack rule)`).toBe('complete');
    expect(row.packetOutcome, `${mechanism}: a typed partial packet is built (shared packet rule)`).toBe('partial');
    expect(row.excludedStale, `${mechanism}: the stale step is excluded from the packet`).toContain('b');
    expect(row.packetOutcomes, `${mechanism}: the stale step is not a packet outcome`).not.toContain('b');
    expect(row.executed, `${mechanism}: building a packet executes nothing`).toBe(false);
    expect(row.noExecution, `${mechanism}: the packet carries no-execution`).toBe(true);
  }
});
