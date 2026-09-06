/* Feature 008 Scope 27 — SCN-008-053, the accessible six-tab interaction model.
 *
 * Every other Feature 008 spec asks whether the tool reaches the right answer.
 * This one asks whether a reader who navigates by keyboard, listens rather than
 * looks, or runs the page under reduced motion, forced colours and enlarged text
 * reaches the SAME answer by the SAME route. The accessibility layer is a
 * projection over Scope 26's immutable view model, so the contract has two
 * halves: the interaction must be complete, and the conclusion must be
 * identical to the one the default projection shows.
 */
import { expect, test } from './playwright-runtime.mjs';
import { resolve } from 'node:path';
import { FIXTURE_ROOT, startPortfolioServer } from './portfolio-survival.support.mjs';

let server;

test.beforeAll(async () => {
  server = await startPortfolioServer();
});

test.afterAll(async () => {
  if (server) await server.close();
});

const LAB_FILE = 'portfolio-survival-allocation-lab.html';

const TABS = [
  'workspaceTabBrief', 'workspaceTabRiskXray', 'workspaceTabPathLab',
  'workspaceTabDiversification', 'workspaceTabAllocation', 'workspaceTabDossier'
];
const MODES = ['modeSimple', 'modePower'];

async function openLab(page, hash = 'brief') {
  const response = await page.goto(`${server.baseUrl}/${LAB_FILE}#${hash}`);
  expect(response?.status(), 'the accessible route must be served directly').toBe(200);
  await expect(page.locator('#workspaceIdentity')).toBeVisible();
  await expect(page.locator('#portfolioName')).toBeEditable();
}

async function importValid(page, name) {
  await page.locator('#portfolioName').fill(name);
  await page.locator('#portfolioFile').setInputFiles(resolve(FIXTURE_ROOT, 'valid-portfolio.csv'));
  await expect(page.locator('#previewAccepted')).toHaveText('3');
  await page.locator('#duplicateChoice').selectOption('merge');
  await page.locator('#localOnlyAcknowledgement').check();
  await page.locator('#confirmImport').click();
  await expect(page.locator('#currentRevision')).toContainText('Current revision');
}

const activeId = (page) => page.evaluate(() => (document.activeElement ? document.activeElement.id : ''));

const rovingOf = (page, ids) => page.evaluate(
  (list) => list.map((id) => `${id}=${document.getElementById(id).getAttribute('tabindex')}`),
  ids
);

/* The decision a reader would carry away: which workspace, which revision, which
   truth state, and which projections are available on every tab. Collected the
   same way under every preference, because "the same answer" has to be checked
   against something a reader could actually disagree about. */
async function collectDecision(page) {
  const decision = {};
  for (const tab of TABS) {
    await page.locator(`#${tab}`).click();
    /* A tab click sets `location.hash`, and the route is applied from the
       `hashchange` handler, which the browser runs as a queued task. The click
       therefore RESOLVES BEFORE the selection lands. Settling on the real
       selected state — not a sleep — is what makes the snapshot below the state
       a reader would actually see; reading straight after the click samples the
       previous tab under load and turns this comparison into a coin flip. */
    await expect(page.locator(`#${tab}`), 'the routed tab must settle before it is read')
      .toHaveAttribute('aria-selected', 'true');
    decision[tab] = await page.evaluate(() => ({
      identity: document.getElementById('workspaceIdentity').textContent.trim(),
      compute: document.getElementById('workspaceCompute').getAttribute('data-workspace-identity'),
      truth: document.getElementById('truthState').textContent.trim(),
      heading: document.getElementById('truthHeading').textContent.trim(),
      selected: Array.from(document.querySelectorAll('[aria-label="Portfolio workspace"] [role="tab"]'))
        .filter((node) => node.getAttribute('aria-selected') === 'true').map((node) => node.id),
      states: Array.from(document.querySelectorAll('#routeStates .route-states > li[data-state]'))
        .map((li) => `${li.dataset.state}=${li.textContent.includes('· Available ·') ? 'available' : 'unavailable'}`)
    }));
  }
  return decision;
}

test('Regression: SCN-008-053 keyboard tabs modals and screen reader states are complete', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openLab(page);

  /* ---- The skip link is the first thing a keyboard reader meets ---- */

  /* Probed on a freshly loaded page, before any control has been driven. "First
     focusable element" is a property of document order at load, but Tab advances
     from wherever focus already sits, so importing first would measure the tab
     stop after the import control instead. `body.focus()` cannot repair that:
     <body> carries no tabindex, so focusing it is a no-op and the stale position
     survives. Ordering the probe first is the only honest reading. */
  expect(await activeId(page), 'a freshly loaded page must not pre-focus a control').toBe('');
  await page.keyboard.press('Tab');
  expect(await activeId(page), 'the skip link must be the first focusable element').toBe('skipToWorkspace');

  /* Parked off the TOP, never off the side: a horizontally displaced skip link
     widens the document, which is the body-level horizontal scrolling this scope
     forbids. Visible on focus, or it is a link no sighted keyboard user can find. */
  const skip = await page.evaluate(() => {
    const link = document.getElementById('skipToWorkspace');
    const box = link.getBoundingClientRect();
    return { top: box.top, left: box.left, href: link.getAttribute('href'), height: box.height };
  });
  expect(skip.left, 'the focused skip link must not sit outside the viewport horizontally').toBeGreaterThanOrEqual(0);
  expect(skip.top, 'the focused skip link must be on screen').toBeGreaterThanOrEqual(0);
  expect(skip.height, 'the skip link must be a 44px target').toBeGreaterThanOrEqual(44);
  expect(skip.href).toBe('#briefWorkspace');

  await importValid(page, 'TP-27-01 keyboard');

  /* ---- Mode pair: roving tabindex, arrows move focus, Enter commits ---- */

  expect(await rovingOf(page, MODES)).toEqual(['modeSimple=0', 'modePower=-1']);

  await page.locator('#modeSimple').focus();
  await page.keyboard.press('ArrowRight');
  expect(await activeId(page), 'ArrowRight must move focus across the mode pair').toBe('modePower');
  expect(await rovingOf(page, MODES), 'focus must carry the single tab stop with it')
    .toEqual(['modeSimple=-1', 'modePower=0']);

  /* Manual activation. Moving focus must NOT change the mode, or a reader cannot
     read past a control without triggering it. */
  await expect(page.locator('#modeSimple')).toHaveAttribute('aria-pressed', 'true');

  await page.keyboard.press('Enter');
  await expect(page.locator('#modePower')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#modeSimple')).toHaveAttribute('aria-pressed', 'false');

  await page.keyboard.press('ArrowLeft');
  expect(await activeId(page)).toBe('modeSimple');
  await page.keyboard.press(' ');
  await expect(page.locator('#modeSimple')).toHaveAttribute('aria-pressed', 'true');

  await page.keyboard.press('End');
  expect(await activeId(page), 'End must reach the last control in the group').toBe('modePower');
  await page.keyboard.press('Home');
  expect(await activeId(page), 'Home must reach the first control in the group').toBe('modeSimple');

  /* ---- Six workspace tabs ---- */

  await page.locator('#workspaceTabBrief').click();
  expect(await rovingOf(page, TABS), 'exactly one tab may hold the page tab order')
    .toEqual(['workspaceTabBrief=0', 'workspaceTabRiskXray=-1', 'workspaceTabPathLab=-1',
      'workspaceTabDiversification=-1', 'workspaceTabAllocation=-1', 'workspaceTabDossier=-1']);

  await page.locator('#workspaceTabBrief').focus();
  await page.keyboard.press('ArrowRight');
  expect(await activeId(page)).toBe('workspaceTabRiskXray');
  await expect(page.locator('#workspaceTabRiskXray'), 'an arrow alone must not select a tab')
    .toHaveAttribute('aria-selected', 'false');
  await expect(page.locator('#workspaceTabBrief')).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('Enter');
  await expect(page.locator('#workspaceTabRiskXray')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#routeStates')).toBeVisible();
  await expect(page.locator('#briefWorkspace')).toBeHidden();
  expect(await page.evaluate(() => document.getElementById('skipToWorkspace').getAttribute('href')),
    'skip must follow the tab the reader actually selected').toBe('#routeStates');

  /* ArrowDown is what a reader tries on a tablist that has wrapped into rows. */
  await page.locator('#workspaceTabRiskXray').focus();
  await page.keyboard.press('ArrowDown');
  expect(await activeId(page)).toBe('workspaceTabPathLab');
  await page.keyboard.press('ArrowUp');
  expect(await activeId(page)).toBe('workspaceTabRiskXray');

  await page.keyboard.press('End');
  expect(await activeId(page)).toBe('workspaceTabDossier');
  await page.keyboard.press('ArrowRight');
  expect(await activeId(page), 'the tablist must wrap forward from the last tab').toBe('workspaceTabBrief');
  await page.keyboard.press('ArrowLeft');
  expect(await activeId(page), 'the tablist must wrap backward from the first tab').toBe('workspaceTabDossier');

  await page.keyboard.press(' ');
  await expect(page.locator('#workspaceTabDossier')).toHaveAttribute('aria-selected', 'true');

  await page.keyboard.press('Home');
  expect(await activeId(page)).toBe('workspaceTabBrief');
  await page.keyboard.press('Enter');
  await expect(page.locator('#briefWorkspace')).toBeVisible();

  /* ---- Modal sheet: initial focus, trap while open only, Escape, restoration ---- */

  await expect(page.locator('#privacyPanel')).toBeHidden();
  await expect(page.locator('#openPrivacy')).toHaveAttribute('aria-expanded', 'false');

  await page.locator('#openPrivacy').click();
  await expect(page.locator('#privacyPanel')).toBeVisible();
  await expect(page.locator('#openPrivacy')).toHaveAttribute('aria-expanded', 'true');
  expect(await activeId(page), 'an opened dialog must place focus inside itself').toBe('privacyHeading');

  const dialog = await page.evaluate(() => {
    const panel = document.getElementById('privacyPanel');
    return {
      role: panel.getAttribute('role'),
      modal: panel.getAttribute('aria-modal'),
      labelledBy: panel.getAttribute('aria-labelledby'),
      open: panel.getAttribute('data-sheet-open'),
      labelText: document.getElementById(panel.getAttribute('aria-labelledby')).textContent.trim()
    };
  });
  expect(dialog).toEqual({
    role: 'dialog', modal: 'true', labelledBy: 'privacyHeading',
    open: 'true', labelText: 'Local privacy'
  });

  /* The background is not merely unfocusable, it is out of the accessibility
     tree. A trap that only caught Tab would still let a screen reader read the
     covered page and act on a control the sighted user cannot see. */
  const inertWhileOpen = await page.evaluate(() => {
    const header = document.querySelector('header.shell');
    const skipLink = document.getElementById('skipToWorkspace');
    const panel = document.getElementById('privacyPanel');
    return {
      headerInert: header.getAttribute('data-sheet-inert'),
      headerHidden: header.getAttribute('aria-hidden'),
      skipInert: skipLink.getAttribute('data-sheet-inert'),
      tablistHidden: document.querySelector('nav.tablist').getAttribute('aria-hidden'),
      panelInert: panel.getAttribute('data-sheet-inert'),
      panelHidden: panel.getAttribute('aria-hidden')
    };
  });
  expect(inertWhileOpen).toEqual({
    headerInert: 'true', headerHidden: 'true', skipInert: 'true',
    tablistHidden: 'true', panelInert: null, panelHidden: null
  });

  /* Tab must cycle inside the sheet and never land on the covered page. */
  for (let press = 0; press < 14; press += 1) {
    await page.keyboard.press('Tab');
    const inside = await page.evaluate(() => {
      const panel = document.getElementById('privacyPanel');
      return !document.activeElement || document.activeElement === document.body
        || panel.contains(document.activeElement);
    });
    expect(inside, `focus escaped the open dialog after ${press + 1} Tab presses`).toBe(true);
  }
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => document.getElementById('privacyPanel').contains(document.activeElement)),
    'Shift+Tab must wrap inside the dialog too').toBe(true);

  await page.keyboard.press('Escape');
  await expect(page.locator('#privacyPanel')).toBeHidden();
  expect(await activeId(page), 'closing must return focus to the invoking control').toBe('openPrivacy');
  await expect(page.locator('#openPrivacy')).toHaveAttribute('aria-expanded', 'false');

  /* The trap existed only while the dialog was open. */
  const releasedAfterClose = await page.evaluate(() => ({
    headerInert: document.querySelector('header.shell').getAttribute('data-sheet-inert'),
    headerHidden: document.querySelector('header.shell').getAttribute('aria-hidden'),
    tablistHidden: document.querySelector('nav.tablist').getAttribute('aria-hidden')
  }));
  expect(releasedAfterClose).toEqual({ headerInert: null, headerHidden: null, tablistHidden: null });
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.getElementById('privacyPanel').contains(document.activeElement)),
    'once closed, Tab must reach the page again').toBe(false);

  /* The sheet's own close control restores the invoker just as Escape does. */
  await page.locator('#openPrivacy').click();
  await expect(page.locator('#privacyPanel')).toBeVisible();
  await page.locator('#closePrivacy').click();
  await expect(page.locator('#privacyPanel')).toBeHidden();
  expect(await activeId(page), 'the in-sheet close control must restore the invoker').toBe('openPrivacy');

  /* ---- Screen-reader names and state announcements ---- */

  const semantics = await page.evaluate(() => {
    const tablist = document.querySelector('nav.tablist');
    return {
      tablistRole: tablist.getAttribute('role'),
      tablistName: tablist.getAttribute('aria-label'),
      modeGroupName: document.getElementById('modeSeg').getAttribute('aria-label'),
      unnamedTabs: Array.from(tablist.querySelectorAll('[role="tab"]'))
        .filter((tab) => !tab.textContent.trim()).map((tab) => tab.id),
      danglingControls: Array.from(tablist.querySelectorAll('[role="tab"][aria-controls]'))
        .filter((tab) => !document.getElementById(tab.getAttribute('aria-controls'))).map((tab) => tab.id),
      panelRoles: ['briefWorkspace', 'routeStates']
        .map((id) => `${id}=${document.getElementById(id).getAttribute('role')}`),
      liveRegions: ['truthState', 'workspaceCompute', 'privacyResult']
        .map((id) => `${id}=${document.getElementById(id).getAttribute('role') || 'none'}`)
    };
  });
  expect(semantics.tablistRole).toBe('tablist');
  expect(semantics.tablistName).toBe('Portfolio workspace');
  expect(semantics.modeGroupName).toBe('Detail level');
  expect(semantics.unnamedTabs, 'every tab needs an accessible name').toEqual([]);
  expect(semantics.danglingControls, 'aria-controls must never name a missing panel').toEqual([]);
  expect(semantics.panelRoles).toEqual(['briefWorkspace=tabpanel', 'routeStates=tabpanel']);
  expect(semantics.liveRegions, 'changing states must be announced, not silently swapped')
    .toEqual(['truthState=none', 'workspaceCompute=status', 'privacyResult=status']);

  /* Every canvas decision must also exist as text, or a reader who cannot see
     the drawing has no route to the conclusion at all. */
  await page.locator('#workspaceTabRiskXray').click();
  const canvasParity = await page.evaluate(() => Array.from(document.querySelectorAll('canvas'))
    .filter((node) => node.getClientRects().length > 0)
    .map((node) => ({
      id: node.id,
      described: !!(node.getAttribute('aria-label') || node.getAttribute('aria-labelledby')
        || node.closest('figure')?.querySelector('figcaption')
        || node.closest('[data-route]')?.querySelector('table, .route-states'))
    }))
    .filter((entry) => !entry.described));
  expect(canvasParity, 'every visible canvas needs an equivalent text route').toEqual([]);
});

test('Regression: SCN-008-053 reduced motion forced colors contrast and text spacing preserve every decision', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openLab(page);
  await importValid(page, 'TP-27-02 preferences');

  /* The reference answer, taken under no preference at all. Everything after this
     must reproduce it exactly: accessibility here is a projection, so a preference
     that changed a conclusion would mean two tools wearing one name. */
  const baseline = await collectDecision(page);
  expect(Object.keys(baseline)).toEqual(TABS);
  expect(baseline.workspaceTabBrief.compute, 'the baseline must be a real computed workspace')
    .not.toBe('none');

  /* ---- Reduced motion ---- */

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#workspaceTabBrief').click();
  expect(await page.evaluate(() => document.body.getAttribute('data-reduced-motion')),
    'the page must resolve the motion preference, not merely let CSS see it').toBe('reduce');

  /* The stylesheet and the controller must agree. A transition still running while
     the page claims "reduce" is the same defect as ignoring the preference. */
  const motion = await page.evaluate(() => {
    const sample = ['workspaceTabRiskXray', 'modePower', 'truthState']
      .map((id) => document.getElementById(id))
      .map((node) => {
        const style = getComputedStyle(node);
        return {
          id: node.id,
          transition: style.transitionDuration,
          animation: style.animationDuration
        };
      });
    return { sample, scroll: getComputedStyle(document.documentElement).scrollBehavior };
  });
  motion.sample.forEach((entry) => {
    expect(Number.parseFloat(entry.transition), `${entry.id} must not animate under reduced motion`).toBeLessThanOrEqual(0.01);
    expect(Number.parseFloat(entry.animation), `${entry.id} must not animate under reduced motion`).toBeLessThanOrEqual(0.01);
  });
  expect(motion.scroll, 'scrolling must be instant under reduced motion').toBe('auto');

  const underReducedMotion = await collectDecision(page);
  expect(underReducedMotion, 'reduced motion must not change a single decision').toEqual(baseline);

  /* ---- Forced colours ---- */

  await page.emulateMedia({ forcedColors: 'active' });
  await page.locator('#workspaceTabRiskXray').click();
  await expect(page.locator('#workspaceTabRiskXray'), 'the route must settle before selection styling is read')
    .toHaveAttribute('aria-selected', 'true');
  expect(await page.evaluate(() => document.body.getAttribute('data-forced-colors')),
    'the page must resolve the forced-colours preference').toBe('active');

  /* Forced colours replaces every author background, so any state carried by a
     background alone simply disappears. Selection and pressed-mode must survive
     as a BORDER, which forced colours preserves. */
  const forced = await page.evaluate(() => {
    const selected = document.getElementById('workspaceTabRiskXray');
    const unselected = document.getElementById('workspaceTabPathLab');
    const pressed = document.getElementById('modeSimple');
    const read = (node) => {
      const style = getComputedStyle(node);
      return {
        borderBottomWidth: Number.parseFloat(style.borderBottomWidth),
        borderTopWidth: Number.parseFloat(style.borderTopWidth),
        background: style.backgroundColor
      };
    };
    return { selected: read(selected), unselected: read(unselected), pressed: read(pressed) };
  });
  expect(forced.selected.borderBottomWidth,
    'selection must not be carried by background colour alone')
    .toBeGreaterThan(forced.unselected.borderBottomWidth);
  expect(forced.pressed.borderTopWidth, 'the pressed mode must keep a non-colour signal')
    .toBeGreaterThanOrEqual(3);

  /* The visible focus ring must survive forced colours too, and it has to be
     reached the way the reader in this scenario reaches it. The ring is
     `:focus-visible`-gated, which is the correct WCAG 2.4.7 reading: a ring is
     owed to the keyboard, and deliberately withheld from a pointer click. A bare
     programmatic `.focus()` straight after a click would therefore measure the
     browser's pointer heuristic rather than this contract. Arrive by arrow key. */
  await page.locator('#workspaceTabPathLab').focus();
  await page.keyboard.press('ArrowLeft');
  expect(await activeId(page), 'the keyboard must land on the tab under test').toBe('workspaceTabRiskXray');
  const ring = await page.evaluate(() => {
    const style = getComputedStyle(document.getElementById('workspaceTabRiskXray'));
    return { width: Number.parseFloat(style.outlineWidth), style: style.outlineStyle };
  });
  expect(ring.width, 'a focused tab must keep a visible ring under forced colours').toBeGreaterThanOrEqual(3);
  expect(ring.style, 'the ring must be a drawn outline, not a zero-width declaration').not.toBe('none');

  const underForcedColors = await collectDecision(page);
  expect(underForcedColors, 'forced colours must not change a single decision').toEqual(baseline);

  /* ---- Text spacing (WCAG 1.4.12) ---- */

  await page.addStyleTag({
    content: `* { line-height: 1.5 !important; letter-spacing: 0.12em !important;
      word-spacing: 0.16em !important; }
      p, li { margin-bottom: 2em !important; }`
  });
  await page.locator('#workspaceTabBrief').click();
  /* Settled deliberately: the clipping probe below filters on `getClientRects()`,
     so reading while the brief panel is still hidden would inspect an empty set
     and pass without having looked at anything. */
  await expect(page.locator('#briefWorkspace'), 'the brief panel must be visible before it is measured')
    .toBeVisible();

  const spacing = await page.evaluate(() => {
    const doc = document.documentElement;
    const visible = Array.from(document.querySelectorAll('#briefWorkspace .identity, #briefWorkspace .state-message, .truth-word'))
      .filter((node) => node.getClientRects().length > 0);
    const clipped = visible
      .filter((node) => {
        const style = getComputedStyle(node);
        return style.overflow === 'hidden' && node.scrollHeight - node.clientHeight > 1;
      })
      .map((node) => node.className);
    return { overflow: doc.scrollWidth - doc.clientWidth, clipped, inspected: visible.length };
  });
  /* An empty candidate set would satisfy the clipping assertion without having
     looked at a single node, so the population is asserted before the verdict. */
  expect(spacing.inspected, 'the clipping probe must actually have text surfaces to inspect').toBeGreaterThan(0);
  expect(spacing.overflow, 'text spacing overrides must not create body horizontal scrolling').toBeLessThanOrEqual(1);
  expect(spacing.clipped, 'text spacing overrides must not clip content').toEqual([]);

  const underTextSpacing = await collectDecision(page);
  expect(underTextSpacing, 'text spacing must not change a single decision').toEqual(baseline);

  /* All three preferences at once is the real reading configuration for many
     people, not three separate edge cases. */
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  const combined = await collectDecision(page);
  expect(combined, 'the combined accessibility projection must still be one answer').toEqual(baseline);
});

/* TP-27-04, the adversarial mutation carrier that proves the assertions above
   discriminate, lives in `portfolio-accessibility-mutation.spec.mjs`. It serves a
   deliberately mutated copy of the document through an intercept, which the
   canonical taxonomy classifies as MOCKED; this file stays free of intercepts so
   it reads as the live-stack carrier it is. */
