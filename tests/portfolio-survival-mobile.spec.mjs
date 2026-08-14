/* Feature 008 Scope 16 — the integrated route in the real browser.
 *
 * Every earlier spec proves one tab. This one asks whether the SIX tabs are the
 * same tool: one identity, one conclusion, unchanged across Simple/Power, across
 * desktop and mobile, and across a deep-link return. It also holds the release
 * boundary — registration is only true if all five surfaces agree.
 */
import { expect, test } from './playwright-runtime.mjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { FIXTURE_ROOT, ROOT, startPortfolioServer } from './portfolio-survival.support.mjs';

let server;

test.beforeAll(async () => {
  server = await startPortfolioServer();
});

test.afterAll(async () => {
  if (server) await server.close();
});

const ROUTES = ['workspace', 'risk-xray', 'path-lab', 'diversification', 'allocation', 'dossier'];
const TABS = [
  'workspaceTabBrief', 'workspaceTabRiskXray', 'workspaceTabPathLab',
  'workspaceTabDiversification', 'workspaceTabAllocation', 'workspaceTabDossier'
];

/* A sentinel that could only come from personal state. If one of these ever
   appears in a public read or a publisher input, the boundary has failed. */
const SENTINEL_NAME = 'ZZSENTINELPORTFOLIO';

async function openLab(page, hash = 'workspace') {
  const response = await page.goto(`${server.baseUrl}/portfolio-survival-allocation-lab.html#${hash}`);
  expect(response?.status(), 'the integrated route must be served directly').toBe(200);
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

/* The identity a reader would use to decide whether two views describe the same
   thing. Collected from every route so a drift on ONE tab is still caught. The
   Brief tab renders its own workspace rather than a route panel, so it is read
   from the surfaces it actually has. */
async function collectIdentity(page) {
  const perRoute = {};
  for (const route of ROUTES) {
    await page.locator(`#${TABS[ROUTES.indexOf(route)]}`).click();
    await expect(page).toHaveURL(new RegExp(`#${route}$`));
    perRoute[route] = await page.evaluate((name) => {
      const identity = document.getElementById('workspaceIdentity').textContent.trim();
      const panel = document.querySelector(`[data-route="${name}"]`);
      if (!panel) {
        return {
          identity,
          revision: document.getElementById('currentRevision').textContent.trim(),
          descriptive: null,
          states: []
        };
      }
      return {
        identity,
        revision: document.getElementById('currentRevision').textContent.trim(),
        descriptive: panel.querySelector('[data-descriptive]').textContent.trim(),
        states: Array.from(panel.querySelectorAll('.route-states > li[data-state]'))
          .map((li) => `${li.dataset.state}=${li.textContent.includes('· Available ·') ? 'available' : 'unavailable'}`)
      };
    }, route);
  }
  return perRoute;
}

test('Regression: SCN-008-036 Simple Power mobile and deep link return preserve one identity', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openLab(page);
  await importValid(page, 'TP-16-05 one identity');

  /* Simple is the default. A tool that opens into the dense view has no Simple
     view at all, whatever the toggle says. */
  await expect(page.locator('#modeSimple')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#modePower')).toHaveAttribute('aria-pressed', 'false');
  const simpleDesktop = await collectIdentity(page);

  /* Power must ADD evidence, not alter a conclusion. Every route keeps the same
     citation, identity, descriptive verdict and per-state availability. */
  await page.locator('#modePower').click();
  await expect(page.locator('#modePower')).toHaveAttribute('aria-pressed', 'true');
  const powerDesktop = await collectIdentity(page);
  expect(powerDesktop).toEqual(simpleDesktop);

  /* The evidence Power adds must actually appear, or "Power" is a no-op label.
     The Brief tab renders its own workspace and has no route panel. */
  for (const route of ROUTES.filter((name) => name !== 'workspace')) {
    await page.locator(`#${TABS[ROUTES.indexOf(route)]}`).click();
    await expect(page.locator(`[data-power-evidence="${route}"]`)).toBeVisible();
  }

  /* Simple must genuinely hide it again — otherwise the two modes are one mode. */
  await page.locator('#modeSimple').click();
  await expect(page.locator('[data-power-evidence="risk-xray"]')).toBeHidden();

  /* Mobile is the same tool, not a reduced one. */
  await page.setViewportSize({ width: 390, height: 844 });
  const simpleMobile = await collectIdentity(page);
  expect(simpleMobile).toEqual(simpleDesktop);

  /* A deep link must land on the named tab and carry the same identity. The
     fixed hash is the whole contract: a link that silently returns to the
     default tab loses the reader's place. */
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${server.baseUrl}/portfolio-survival-allocation-lab.html#allocation`);
  await expect(page.locator('#workspaceTabAllocation')).toHaveAttribute('aria-selected', 'true');
  const returned = await page.evaluate(() => document.getElementById('workspaceIdentity').textContent.trim());
  expect(returned).toBe(simpleDesktop.allocation.identity);

  /* The URL carries the route and nothing else. A personal value in a hash
     leaves the device in history, referrers and shared links. */
  expect(page.url()).toBe(`${server.baseUrl}/portfolio-survival-allocation-lab.html#allocation`);
});

test('Regression: SCN-008-036 every canvas is synchronous nonblank and equivalent to its table at desktop and mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openLab(page);
  await importValid(page, 'TP-16-06 canvas parity');

  for (const size of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size);
    for (const route of ROUTES.filter((name) => name !== 'workspace')) {
      await page.locator(`#${TABS[ROUTES.indexOf(route)]}`).click();

      /* Synchronous: pixels are asserted with no wait. A chart that needs a
         settle window is a chart that can render blank for a real reader. */
      const canvases = await page.evaluate((name) => {
        const panel = document.querySelector(`[data-route="${name}"]`);
        return Array.from(panel.querySelectorAll('canvas')).map((canvas) => {
          const context = canvas.getContext('2d');
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
          let painted = 0;
          for (let i = 3; i < pixels.length; i += 4) if (pixels[i] !== 0) painted += 1;
          return {
            id: canvas.id,
            width: canvas.width,
            height: canvas.height,
            painted,
            table: canvas.dataset.rlchartMode || null,
            error: canvas.dataset.rlchartError || null
          };
        });
      }, route);

      canvases.forEach((canvas) => {
        expect(canvas.width, `${canvas.id} must have real pixels`).toBeGreaterThan(0);
        expect(canvas.height, `${canvas.id} must have real pixels`).toBeGreaterThan(0);
        expect(canvas.painted, `${canvas.id} must not be blank`).toBeGreaterThan(0);
        expect(canvas.error, `${canvas.id} must not report an adapter error`).toBeNull();
      });

      /* Table equivalence: a canvas is not readable by everyone, so a chart
         without its table is evidence only some readers can reach. */
      const tables = await page.evaluate((name) => {
        const panel = document.querySelector(`[data-route="${name}"]`);
        return Array.from(panel.querySelectorAll('table')).map((table) => ({
          id: table.id,
          headers: table.querySelectorAll('thead th').length,
          rows: table.querySelectorAll('tbody tr').length
        }));
      }, route);
      if (canvases.length > 0) {
        expect(tables.length, `${route} pairs every canvas with a table`).toBeGreaterThan(0);
        tables.forEach((table) => {
          expect(table.headers).toBeGreaterThan(0);
          expect(table.rows).toBeGreaterThan(0);
        });
      }
    }
  }
});

test('Regression: SCN-008-036 six tab keyboard layout has no overlap overflow or hidden state at desktop mobile and zoom', async ({ page }) => {
  await openLab(page);
  await importValid(page, 'TP-16-07 accessibility');

  /* One tablist, six tabs, each reachable. A tab that exists but is not in the
     tablist is unreachable by assistive technology. */
  /* Scoped to the WORKSPACE tablist. The shared shell injects its own view tabs once the tool is
     registered, so an unscoped query would assert over both and conflate two navigations. */
  const tabs = await page.evaluate(() => Array.from(document.querySelectorAll('[aria-label="Portfolio workspace"] [role="tab"]'))
    .map((tab) => ({ id: tab.id, selected: tab.getAttribute('aria-selected'), disabled: tab.disabled })));
  expect(tabs.map((tab) => tab.id)).toEqual(TABS_EXPECTED);
  tabs.forEach((tab) => expect(tab.disabled, `${tab.id} must not be disabled`).toBe(false));
  expect(tabs.filter((tab) => tab.selected === 'true')).toHaveLength(1);

  for (const size of [{ width: 1440, height: 1000 }, { width: 760, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size);

    /* Keyboard: every tab must take focus and activate. A mouse-only tablist
       excludes anyone navigating by keyboard. */
    for (const tab of TABS) {
      await page.locator(`#${tab}`).focus();
      const focused = await page.evaluate(() => document.activeElement.id);
      expect(focused).toBe(tab);
      await page.keyboard.press('Enter');
      await expect(page.locator(`#${tab}`)).toHaveAttribute('aria-selected', 'true');
    }

    /* Touch targets. 44px is the size at which a control is reliably hittable
       on a phone; smaller is a control some readers cannot use. */
    const small = await page.evaluate(() => Array.from(document.querySelectorAll('[role="tab"], #modeSeg button'))
      .map((element) => ({ id: element.id, height: element.getBoundingClientRect().height }))
      .filter((entry) => entry.height < 44));
    expect(small, 'every tab and mode control must be at least 44px tall').toEqual([]);

    /* No horizontal body overflow. A page the reader must scroll sideways to
       finish reading has lost content, not merely styling. */
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `no horizontal overflow at ${JSON.stringify(size)}`).toBeLessThanOrEqual(1);

    /* Overlap between the identity block and the tablist. Overlap hides text
       rather than merely moving it. */
    const overlapping = await page.evaluate(() => {
      const identity = document.getElementById('workspaceIdentity').getBoundingClientRect();
      const tablist = document.querySelector('[aria-label="Portfolio workspace"]').getBoundingClientRect();
      return !(identity.bottom <= tablist.top || tablist.bottom <= identity.top
        || identity.right <= tablist.left || tablist.right <= identity.left);
    });
    expect(overlapping, 'identity and tablist must not overlap').toBe(false);
  }

  /* 200% zoom is a supported reading mode, not an edge case. */
  await page.setViewportSize({ width: 720, height: 500 });
  const zoomOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(zoomOverflow, 'no horizontal overflow at 200% zoom equivalent').toBeLessThanOrEqual(1);
});

const TABS_EXPECTED = [
  'workspaceTabBrief', 'workspaceTabRiskXray', 'workspaceTabPathLab',
  'workspaceTabDiversification', 'workspaceTabAllocation', 'workspaceTabDossier'
];

test('Regression: SCN-008-036 registration rlnav tools index README and note form one atomic release transaction', async ({ page }) => {
  /* Registration is a five-surface contract. Four out of five is not a partial
     release - it is a registry that disagrees with itself, which is how a tool
     ends up reachable from one place and invisible from another. */
  const toolsRaw = JSON.parse(readFileSync(resolve(ROOT, 'tools.json'), 'utf8'));
  const tools = Array.isArray(toolsRaw) ? toolsRaw : toolsRaw.tools;
  const entries = tools.filter((tool) => tool.id === 'portfolio-survival-allocation-lab');
  expect(entries, 'exactly one tools.json entry').toHaveLength(1);
  const entry = entries[0];
  expect(entry.file).toBe('portfolio-survival-allocation-lab.html');
  expect(entry.notes).toBe('notes/portfolio-survival-allocation-lab.md');
  expect(entry.status).toBe('live');

  /* The privacy boundary is part of the REGISTRATION, not only the runtime. A
     tool holding personal holdings must not be able to contribute them to the
     public brief, and the registry is where that is declared. */
  expect(entry.briefing.role).toBe('source');
  expect(entry.briefing.readAdapter).toBe('portfolio-survival-privacy-boundary-v1');

  /* The experience contract must resolve, or the tool is registered into a
     registry that cannot run it. */
  const models = JSON.parse(readFileSync(resolve(ROOT, 'simple-models.json'), 'utf8'));
  const model = models.definitions.filter((d) => d.toolId === 'portfolio-survival-allocation-lab');
  expect(model, 'exactly one Simple model definition').toHaveLength(1);
  expect(model[0].adapterId).toBe(entry.experience.simpleAdapterId);
  expect(model[0].adapterModule).toBe(entry.experience.simpleAdapterModule);

  const journeys = JSON.parse(readFileSync(resolve(ROOT, 'journeys.json'), 'utf8'));
  const owned = journeys.definitions.filter((d) => d.toolId === 'portfolio-survival-allocation-lab');
  expect(owned.length, 'an ordinary tool declares at least two journey goals').toBeGreaterThanOrEqual(2);
  owned.forEach((definition) => {
    /* Every journey here reasons over holdings, so none may be public-safe. */
    expect(definition.privacyClass).toBe('local-private-ref');
  });

  const indexHtml = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
  expect((indexHtml.match(/id: 'portfolio-survival-allocation-lab'/g) || []).length).toBe(1);

  const rlnavJs = readFileSync(resolve(ROOT, 'rlnav.js'), 'utf8');
  expect((rlnavJs.match(/file: "portfolio-survival-allocation-lab\.html"/g) || []).length).toBe(1);

  const readme = readFileSync(resolve(ROOT, 'README.md'), 'utf8');
  expect(readme).toContain('portfolio-survival-allocation-lab.html');

  const note = readFileSync(resolve(ROOT, 'notes/portfolio-survival-allocation-lab.md'), 'utf8');
  expect(note.length, 'the handoff note must carry real content').toBeGreaterThan(500);

  /* The release is only atomic if the page is no longer withheld from the site. */
  const exclusions = JSON.parse(readFileSync(resolve(ROOT, 'site-exclusions.json'), 'utf8'));
  expect(exclusions.files.map((f) => f.path)).not.toContain('portfolio-survival-allocation-lab.html');

  /* Both routes must actually work: the landing card and the direct URL. */
  const direct = await page.goto(`${server.baseUrl}/portfolio-survival-allocation-lab.html`);
  expect(direct?.status()).toBe(200);
  await expect(page.locator('#workspaceTabBrief')).toHaveAttribute('aria-selected', 'true');
});

test('Regression: SCN-008-036 personal sentinels stay absent from complete route public reads and publisher inputs', async ({ page }) => {
  /* Every request the page makes is recorded. The assertion is not that the
     page behaved well on the paths we thought to check - it is that NO request
     carried a personal value, whichever path produced it. */
  const requests = [];
  page.on('request', (request) => requests.push({
    url: request.url(),
    method: request.method(),
    body: request.postData() || ''
  }));

  const consoleText = [];
  page.on('console', (message) => consoleText.push(message.text()));

  await openLab(page);
  await importValid(page, SENTINEL_NAME);

  for (const route of ROUTES) {
    await page.locator(`#${TABS[ROUTES.indexOf(route)]}`).click();
    await expect(page).toHaveURL(new RegExp(`#${route}$`));
  }
  await page.locator('#modePower').click();
  for (const route of ROUTES) {
    await page.locator(`#${TABS[ROUTES.indexOf(route)]}`).click();
  }

  const offenders = requests.filter((request) => request.url.includes(SENTINEL_NAME)
    || request.body.includes(SENTINEL_NAME));
  expect(offenders, 'no request may carry a personal sentinel').toEqual([]);
  expect(page.url()).not.toContain(SENTINEL_NAME);
  expect(consoleText.join(' ')).not.toContain(SENTINEL_NAME);

  /* The public generic assets are read-only inputs. If a personal value reached
     one, the publisher boundary has been crossed inside the browser. */
  const publicReads = requests.filter((request) => /market-brief|watchlist|tools\.json/.test(request.url));
  publicReads.forEach((request) => {
    expect(request.method, 'public generic assets are read-only').toBe('GET');
    expect(request.body).toBe('');
  });

  /* The tool's own public brief read must be the privacy-boundary read, never a
     personal fact. Asserted unconditionally: an absent read would let this row
     pass on a page that publishes nothing AND on a page that publishes
     holdings, which is the whole distinction it exists to make. */
  const toolRead = await page.evaluate(() => window.RLDATA.toolRead('portfolio-survival-allocation-lab'));
  expect(toolRead, 'the tool must publish its privacy-boundary read').not.toBeNull();
  expect(JSON.stringify(toolRead)).not.toContain(SENTINEL_NAME);
  expect(toolRead.availability).toBe('unavailable');
  expect(toolRead.metrics.personalDataIncluded).toBe(false);
  expect(toolRead.metrics.privacyBoundary).toBe('local-only');

  /* A full-personal clear must leave nothing behind that names the sentinel. */
  await page.locator('#openPrivacy').click();
  await page.locator('#emergencyClear').click();
  const residue = await page.evaluate((sentinel) => {
    const found = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      const value = window.localStorage.getItem(key) || '';
      if (key.includes(sentinel) || value.includes(sentinel)) found.push(key);
    }
    return found;
  }, SENTINEL_NAME);
  expect(residue, 'no personal residue may survive the clear').toEqual([]);
});
