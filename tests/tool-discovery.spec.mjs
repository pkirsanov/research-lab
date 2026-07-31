/*
 * Step 8 — grouped discovery on the landing page.
 *
 * REAL-STACK, ZERO INTERCEPTION. Navigates to the REAL index.html served by the REAL static server
 * and asserts the REAL rendered discovery surface. There is NO page.route / context.route /
 * intercept / msw / nock anywhere in this file: the groups, the cards, and the filter are all the
 * shipped production code paths.
 *
 * What this protects: 23 tools used to render as one undifferentiated wall of cards with no way to
 * search them. The failure mode being locked out is a registered tool that renders NOWHERE — which
 * is why the "every registered tool is reachable" assertion counts against tools.json rather than
 * against whatever the page happened to draw.
 */
import { expect, test } from './playwright-runtime.mjs';
import { readJson, startStaticServer } from './tool-experience.support.mjs';

let site;
let registry;

test.beforeAll(async () => {
  site = await startStaticServer();
  registry = await readJson('tools.json');
});

test.afterAll(async () => {
  if (site && site.close) await site.close();
});

async function openIndex(page) {
  await page.goto(`${site.baseUrl}/index.html`);
  await expect(page.locator('#grid .card').first()).toBeVisible();
}

test('every registered tool renders inside a named group, and the groups come from the registry', async ({ page }) => {
  await openIndex(page);

  const expectedGroups = [];
  const seen = new Set();
  for (const tool of registry.tools) {
    expect(typeof tool.group, `${tool.id} declares a group`).toBe('string');
    if (!seen.has(tool.group)) { seen.add(tool.group); expectedGroups.push(tool.group); }
  }

  // Every group the registry names is on screen.
  for (const name of expectedGroups) {
    await expect(page.locator(`[data-tool-group="${name}"]`)).toHaveCount(1);
  }

  // No stray "Ungrouped" bucket — that block only appears when the registry has a defect.
  await expect(page.locator('[data-tool-group="Ungrouped"]')).toHaveCount(0);

  // Reachability: every registered id has a card, and it sits in the group the registry assigns.
  const placement = await page.evaluate(() => {
    const out = {};
    document.querySelectorAll('[data-tool-group]').forEach((section) => {
      section.querySelectorAll('.card[data-tool-id]').forEach((card) => {
        out[card.getAttribute('data-tool-id')] = section.getAttribute('data-tool-group');
      });
    });
    return out;
  });

  for (const tool of registry.tools) {
    expect(placement[tool.id], `${tool.id} is rendered on the landing page`).toBeDefined();
    expect(placement[tool.id], `${tool.id} sits in its registry group`).toBe(tool.group);
  }
  expect(Object.keys(placement).length).toBe(registry.tools.length);
});

test('within a group, the most recently updated tool comes first', async ({ page }) => {
  await openIndex(page);

  const order = await page.evaluate(() => {
    const out = {};
    document.querySelectorAll('[data-tool-group]').forEach((section) => {
      out[section.getAttribute('data-tool-group')] = Array.from(section.querySelectorAll('.card[data-tool-id]'))
        .map((card) => card.getAttribute('data-tool-id'));
    });
    return out;
  });

  const updatedById = {};
  registry.tools.forEach((tool) => { updatedById[tool.id] = tool.updated || ''; });

  for (const [name, ids] of Object.entries(order)) {
    const dated = ids.map((id) => updatedById[id]).filter(Boolean);
    const descending = dated.slice().sort().reverse();
    expect(dated, `${name} is ordered most-recent-first`).toEqual(descending);
  }
});

test('the filter narrows to matching tools and hides groups that no longer match', async ({ page }) => {
  await openIndex(page);

  const filter = page.locator('#toolFilter');
  await expect(filter).toBeVisible();

  const totalVisible = await page.locator('#grid .card:not([hidden])').count();
  expect(totalVisible).toBe(registry.tools.length);

  // "gamma" is carried by the options/flow tools, so at least one group must survive and at
  // least one unrelated group (Place-based rentals) must disappear.
  await filter.fill('gamma');
  await expect(page.locator('#grid .card:not([hidden])').first()).toBeVisible();

  const narrowed = await page.locator('#grid .card:not([hidden])').count();
  expect(narrowed).toBeGreaterThan(0);
  expect(narrowed).toBeLessThan(registry.tools.length);
  await expect(page.locator('[data-tool-group="Place-based"]')).toBeHidden();
  await expect(page.locator('#toolFilterCount')).toContainText(`of ${registry.tools.length}`);

  // ADVERSARIAL: a filter that never hides anything would satisfy "some cards are visible".
  // A term present in no tool must collapse the surface to zero — proving it really filters.
  await filter.fill('zzzz-no-such-tool-zzzz');
  await expect(page.locator('#grid .card:not([hidden])')).toHaveCount(0);
  for (const section of new Set(registry.tools.map((tool) => tool.group))) {
    await expect(page.locator(`[data-tool-group="${section}"]`)).toBeHidden();
  }

  // Clearing restores everything — the filter must not be destructive.
  await filter.fill('');
  await expect(page.locator('#grid .card:not([hidden])')).toHaveCount(registry.tools.length);
});

test('the rail navigation renders the same groups, in the same order, as the landing page', async ({ page }) => {
  await openIndex(page);

  const landing = await page.evaluate(() => Array.from(document.querySelectorAll('[data-tool-group]'))
    .map((section) => section.getAttribute('data-tool-group')));

  // Open the rail through its real launcher rather than reaching into internals.
  await page.locator('#rlnav-launcher').click();
  await expect(page.locator('#rlnav')).toBeVisible();

  const rail = await page.evaluate(() => Array.from(document.querySelectorAll('#rlnav .rlnav-group'))
    .map((node) => node.textContent.trim()));

  expect(rail).toEqual(landing);
  expect(rail).not.toContain('Ungrouped');
});
