/* Feature 008 Scope 27 — TP-27-04, the SCN-008-053 adversarial mutation carrier.
 *
 * This file exists SEPARATELY from `portfolio-survival-accessibility.spec.mjs`
 * because of what it does, not because of what it covers. The regression rows in
 * that file (TP-27-01, TP-27-02) drive the SHIPPED document end to end. This row
 * drives a deliberately REDUCED copy of it, and keeping the two apart stops a
 * reader from mistaking a mutation case for a statement about the real page.
 *
 * The mutation is the point. Each case rebuilds the shipped document with one
 * accessibility affordance removed, writes that disposable copy next to the
 * original, and lets the REAL static server serve it, proving the assertions in
 * the live file discriminate rather than pass by construction.
 *
 * Nothing is intercepted. An earlier revision fulfilled the document request
 * with `page.route`, which made this an interception-based carrier inside a
 * live-category `.spec.mjs` and tripped the live-test-intercept rule. Serving a
 * real file over the real server removes the conflict at its source instead of
 * relabelling around it: the browser performs an ordinary fetch, and relative
 * asset URLs resolve exactly as they do for the shipped page. The copy is
 * removed in `afterAll` and is git-ignored so an interrupted run cannot leave
 * the working tree dirty.
 */
import { expect, test } from './playwright-runtime.mjs';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT, startPortfolioServer } from './portfolio-survival.support.mjs';

let server;

test.beforeAll(async () => {
  server = await startPortfolioServer();
});

test.afterAll(async () => {
  rmSync(MUTATION_PATH, { force: true });
  if (server) await server.close();
});

const LAB_FILE = 'portfolio-survival-allocation-lab.html';
const LAB_SOURCE = readFileSync(resolve(ROOT, LAB_FILE), 'utf8');

/* The mutated copy is a disposable SIBLING of the shipped file rather than an
   intercepted response. It must sit in the same directory so the document's
   relative asset URLs resolve identically to the real page. */
const MUTATION_FILE = '.scn-008-053-reduced-lab.html';
const MUTATION_PATH = resolve(ROOT, MUTATION_FILE);

const TABS = [
  'workspaceTabBrief', 'workspaceTabRiskXray', 'workspaceTabPathLab',
  'workspaceTabDiversification', 'workspaceTabAllocation', 'workspaceTabDossier'
];

/* Set by `serveReducedLab` and consumed by the NEXT `openLab` call, so the five
   mutation cases below keep reading as stage-then-open without every call site
   having to name the file. */
let stagedLabFile = null;

async function openLab(page, hash = 'brief') {
  const file = stagedLabFile ?? LAB_FILE;
  stagedLabFile = null;
  const response = await page.goto(`${server.baseUrl}/${file}#${hash}`);
  expect(response?.status(), 'the accessible route must be served directly').toBe(200);
  await expect(page.locator('#workspaceIdentity')).toBeVisible();
  await expect(page.locator('#portfolioName')).toBeEditable();
}

const activeId = (page) => page.evaluate(() => (document.activeElement ? document.activeElement.id : ''));

const rovingOf = (page, ids) => page.evaluate(
  (list) => list.map((id) => `${id}=${document.getElementById(id).getAttribute('tabindex')}`),
  ids
);

/* `mutate` THROWS when its anchor is missing. That is the whole anti-tautology
   guard: if the implementation is ever refactored so a mutation no longer
   applies, this test fails loudly instead of quietly passing against an
   unmodified page and certifying a check it never performed. */

function mutate(source, find, replaceWith, label) {
  if (!source.includes(find)) {
    throw new Error(`adversarial mutation "${label}" no longer matches the shipped source; ` +
      'the carrier cannot prove anything until its anchor is repaired');
  }
  const mutated = source.replace(find, replaceWith);
  if (mutated === source) throw new Error(`adversarial mutation "${label}" changed nothing`);
  return mutated;
}

async function serveReducedLab(page, mutatedHtml) {
  /* Parking on about:blank first is load-bearing, not tidiness. `page.goto` to a
     URL that differs from the current one only by fragment is a SAME-DOCUMENT
     navigation: it issues no network request, so the browser would keep the
     previous document while the assertions that follow claim to have judged a
     reduced one. Forcing a real fetch is what makes this carrier adversarial
     rather than decorative. */
  writeFileSync(MUTATION_PATH, mutatedHtml, 'utf8');
  stagedLabFile = MUTATION_FILE;
  await page.goto('about:blank');
}

/* The second half of the same guard: prove the DOCUMENT IN THE BROWSER carries
   the mutation. `mutate` proves the string was edited; only this proves the edit
   reached the page under test. */
async function expectServedMutation(page, marker, label) {
  const carriesMarker = await page.evaluate(
    (needle) => document.documentElement.outerHTML.includes(needle), marker
  );
  expect(carriesMarker, `the browser must actually have been served the "${label}" mutation`).toBe(true);
}

test('Adversarial: SCN-008-053 reduced accessibility implementations fail closed', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  /* Sanity: the four probes below must PASS against the real shipped page, or a
     later failure would prove nothing about the mutation. */
  await openLab(page);
  const healthy = await page.evaluate(() => {
    const link = document.getElementById('skipToWorkspace');
    return { skipLinkPresent: !!link };
  });
  expect(healthy.skipLinkPresent, 'the shipped page must carry the skip link').toBe(true);
  await page.locator('#workspaceTabBrief').focus();
  await page.keyboard.press('ArrowRight');
  expect(await activeId(page), 'the shipped page must move focus on ArrowRight').toBe('workspaceTabRiskXray');
  await page.locator('#openPrivacy').click();
  await page.keyboard.press('Escape');
  expect(await activeId(page), 'the shipped page must restore the invoker').toBe('openPrivacy');

  /* ---- 1. Keyboard: the roving arrow wiring removed ---- */

  const withoutArrows = mutate(
    LAB_SOURCE,
    'document.querySelector("nav.tablist").addEventListener("keydown", rovingKeydown(TAB_IDS, true));',
    '/* adversarial: tablist arrow wiring removed */',
    'keyboard'
  );
  await serveReducedLab(page, withoutArrows);
  await openLab(page);
  await expectServedMutation(page, 'adversarial: tablist arrow wiring removed', 'keyboard');
  await page.locator('#workspaceTabBrief').focus();
  await page.keyboard.press('ArrowRight');
  expect(await activeId(page), 'a tablist without arrow wiring must fail the keyboard contract')
    .not.toBe('workspaceTabRiskXray');
  expect(await rovingOf(page, TABS.slice(0, 2)), 'and it must not move the single tab stop either')
    .toEqual(['workspaceTabBrief=0', 'workspaceTabRiskXray=-1']);
  await page.unrouteAll();

  /* ---- 2. Skip link: the element removed ---- */

  const withoutSkipLink = mutate(
    LAB_SOURCE,
    '<a id="skipToWorkspace" class="skip-link" href="#briefWorkspace">Skip to the workspace panel</a>',
    '<!-- adversarial: skip link removed -->',
    'skip-link'
  );
  await serveReducedLab(page, withoutSkipLink);
  await openLab(page);
  await expectServedMutation(page, 'adversarial: skip link removed', 'skip-link');
  expect(await activeId(page), 'a freshly loaded page must not pre-focus a control').toBe('');
  await page.keyboard.press('Tab');
  expect(await activeId(page), 'a page without a skip link cannot satisfy the skip contract')
    .not.toBe('skipToWorkspace');
  await page.unrouteAll();

  /* ---- 3. Focus: invoker restoration removed from the close path ---- */

  const withoutRestore = mutate(
    LAB_SOURCE,
    'if (restoreFocus !== false) invoker.focus();',
    '/* adversarial: invoker restoration removed */',
    'focus'
  );
  await serveReducedLab(page, withoutRestore);
  await openLab(page);
  await expectServedMutation(page, 'adversarial: invoker restoration removed', 'focus');
  await page.locator('#openPrivacy').click();
  await expect(page.locator('#privacyPanel')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#privacyPanel')).toBeHidden();
  expect(await activeId(page), 'a close path that drops the invoker must fail the restoration contract')
    .not.toBe('openPrivacy');
  await page.unrouteAll();

  /* ---- 4. Motion: the reduced-motion resolution removed ---- */

  const withoutMotion = mutate(
    LAB_SOURCE,
    'body.setAttribute("data-reduced-motion", prefersReducedMotion() ? "reduce" : "no-preference");',
    '/* adversarial: motion preference no longer resolved */',
    'motion'
  );
  await serveReducedLab(page, withoutMotion);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openLab(page);
  await expectServedMutation(page, 'adversarial: motion preference no longer resolved', 'motion');
  expect(await page.evaluate(() => document.body.getAttribute('data-reduced-motion')),
    'a page that never resolves the motion preference must fail the preference contract')
    .not.toBe('reduce');
  await page.unrouteAll();
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  /* ---- 5. Colour-only meaning: the forced-colours selection border removed ---- */

  const colourOnly = mutate(
    LAB_SOURCE,
    `            .tablist button[aria-selected="true"] {
                border-bottom: 5px solid Highlight;
            }`,
    '            /* adversarial: selection reduced to colour alone */',
    'color-only'
  );
  await serveReducedLab(page, colourOnly);
  await page.emulateMedia({ forcedColors: 'active' });
  await openLab(page);
  await expectServedMutation(page, 'adversarial: selection reduced to colour alone', 'color-only');
  await page.locator('#workspaceTabRiskXray').click();
  await expect(page.locator('#workspaceTabRiskXray'), 'the route must settle before selection styling is read')
    .toHaveAttribute('aria-selected', 'true');
  const colourOnlyWidths = await page.evaluate(() => ({
    selected: Number.parseFloat(getComputedStyle(document.getElementById('workspaceTabRiskXray')).borderBottomWidth),
    unselected: Number.parseFloat(getComputedStyle(document.getElementById('workspaceTabPathLab')).borderBottomWidth)
  }));
  expect(colourOnlyWidths.selected,
    'selection carried by colour alone must fail the non-colour-meaning contract')
    .not.toBeGreaterThan(colourOnlyWidths.unselected);
  await page.unrouteAll();
  await page.emulateMedia({ forcedColors: 'none' });
});
