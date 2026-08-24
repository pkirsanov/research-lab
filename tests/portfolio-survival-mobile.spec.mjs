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

const ROUTES = ['brief', 'risk-xray', 'path-lab', 'diversification', 'allocation', 'dossier'];
const TABS = [
  'workspaceTabBrief', 'workspaceTabRiskXray', 'workspaceTabPathLab',
  'workspaceTabDiversification', 'workspaceTabAllocation', 'workspaceTabDossier'
];
const BRIEF_CONFIG = JSON.parse(readFileSync(resolve(ROOT, 'market-brief.config.json'), 'utf8'));
const BRIEF_SNAPSHOT = JSON.parse(readFileSync(resolve(ROOT, 'market-brief.snapshot.json'), 'utf8'));
const OWNER_WINDOW = BRIEF_CONFIG.windows.find((entry) => entry.id === BRIEF_SNAPSHOT.window);
if (!OWNER_WINDOW) throw new Error('the committed snapshot window is required for TP-26-04');
const OWNER_EVIDENCE_DAY = new Date(Date.parse(`${BRIEF_SNAPSHOT.asOf.slice(0, 10)}T00:00:00.000Z`) - 86400000)
  .toISOString().slice(0, 10);

/* A sentinel that could only come from personal state. If one of these ever
   appears in a public read or a publisher input, the boundary has failed. */
const SENTINEL_NAME = 'ZZSENTINELPORTFOLIO';

async function openLab(page, hash = 'brief') {
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

async function seedOwnerEvidence(page) {
  await page.evaluate((day) => {
    window.RLDATA.putBars('MSFT', '1d', [{ t: Date.parse(`${day}T00:00:00.000Z`), c: 100 }], 'tp-26-owner-fixture');
  }, OWNER_EVIDENCE_DAY);
  await page.locator('#briefWindow').selectOption(OWNER_WINDOW.id);
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
  for (const route of ROUTES.filter((name) => name !== 'brief')) {
    await page.locator(`#${TABS[ROUTES.indexOf(route)]}`).click();
    await expect(page.locator(`[data-power-evidence="${route}"]`)).toBeVisible();
  }

  /* Simple must genuinely hide it again — otherwise the two modes are one mode. */
  await page.locator('#modeSimple').click();
  await expect(page.locator('[data-power-evidence="risk-xray"]')).toBeHidden();

  await page.locator('#workspaceTabAllocation').click();
  await page.locator('#workspaceTabBrief').click();
  await expect(page).toHaveURL(new RegExp('#brief$'));

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

test('Regression: SCN-008-052 owning tool consumes ReturnContext and restores Portfolio Brief focus', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openLab(page);
  await importValid(page, 'TP-26-04 owner return');
  await seedOwnerEvidence(page);

  const ownerLink = page.locator('#briefLanes li[data-subject="MSFT"] a[data-owner-handoff]');
  await expect(ownerLink, 'a real held action must expose its registry-selected owning tool').toBeVisible();
  const href = await ownerLink.getAttribute('href');
  const ownerToolId = await ownerLink.getAttribute('data-owner-handoff');
  const actionId = await ownerLink.getAttribute('data-owner-action');
  const disclosureId = await ownerLink.getAttribute('data-owner-disclosure');
  const focusRestoreId = await ownerLink.getAttribute('data-owner-focus');
  expect(href).toMatch(/^[a-z0-9-]+\.html#power$/);
  expect(href).not.toContain('?');

  const disclosure = page.locator(`[id="${disclosureId}"]`);
  await disclosure.locator('summary').click();
  await expect(disclosure).toHaveAttribute('open', '');
  await ownerLink.focus();
  await expect(ownerLink).toBeFocused();
  await ownerLink.click();

  const destination = new URL(page.url());
  expect(destination.pathname.endsWith(`/${href.split('#')[0]}`)).toBe(true);
  expect(destination.search).toBe('');
  expect(destination.hash).toBe('#power');
  expect(page.url()).not.toContain(actionId);

  const strip = page.locator('#rlreturn-strip');
  await expect(strip, 'the owning page must render the consumed private context').toBeVisible();
  await expect(strip.locator('b')).toHaveText('From Portfolio Brief');
  await expect(strip.locator('.rlreturn-owner')).toContainText(ownerToolId);
  await expect(strip).toHaveAttribute('data-action-id', actionId);
  await expect(strip).toHaveAttribute('data-focus-restore-id', focusRestoreId);
  expect(await page.evaluate(() => sessionStorage.getItem('rlReturnContextV1')),
    'the owner consumes ReturnContext exactly once').toBeNull();

  const returnLink = page.locator('#rlreturn-back');
  await expect(returnLink).toHaveAttribute('href', 'portfolio-survival-allocation-lab.html#brief');
  await returnLink.click();
  await expect(page).toHaveURL(`${server.baseUrl}/portfolio-survival-allocation-lab.html#brief`);
  await expect(page.locator('#workspaceCompute')).toHaveAttribute('data-return-restored', actionId);
  await expect(page.locator(`[id="${disclosureId}"]`)).toHaveAttribute('open', '');
  await expect(page.locator(`[id="${focusRestoreId}"]`)).toBeFocused();
  expect(await page.evaluate(() => history.state && history.state.portfolioReturnFocus),
    'the focus restore record is removed from the source history entry after use').toBeUndefined();

  console.log(`[TP-26-04] owner=${ownerToolId} action=${actionId} destination=${href}`);
  console.log(`[TP-26-04] restored=${focusRestoreId} disclosure=${disclosureId} privateUrlFields=0`);
});

test('Regression: SCN-008-036 every canvas is synchronous nonblank and equivalent to its table at desktop and mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openLab(page);
  await importValid(page, 'TP-16-06 canvas parity');

  for (const size of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size);
    for (const route of ROUTES.filter((name) => name !== 'brief')) {
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
    /* Scoped to THIS page's controls. The shared shell renders its own chrome, whose sizing is
       Feature 012's contract to keep, not this scope's to assert over. */
    const small = await page.evaluate(() => Array.from(document.querySelectorAll('[aria-label="Portfolio workspace"] [role="tab"], #modeSeg button'))
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
  await page.locator('#fullClearConfirmation').fill('CLEAR ALL LOCAL DATA');
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

/* ------------------------------------------------------------------ TP-27-03
   Feature 008 Scope 27 — SCN-008-053, the responsive half.

   The other Scope 27 rows ask whether a reader who navigates by keyboard or
   listens rather than looks reaches the same answer. This one asks the reader
   who ENLARGES the page: 200% zoom, a 390x844 phone, WCAG 1.4.12 text-spacing
   overrides, and a maximum-length portfolio label flowing through every
   identity surface at once. A layout that computes the right answer and then
   hides it behind an overlap, a clip, or a sideways document scroll has not
   given the reader the answer.

   Containment is the distinction that makes this row honest rather than
   merely strict. A wide table is fine INSIDE its own scroller and a defect
   when it widens the DOCUMENT, because only the second makes the reader drag
   the whole page sideways to finish a row. So `overflow: hidden` (content the
   reader can never reach) is separated from `auto`/`scroll` (content the
   reader reaches inside the region), and body-level overflow is asserted on
   its own. */

/* WCAG 1.4.12. Applied for the whole traversal, not toggled per assertion:
   spacing is a persistent reading preference, not a momentary state. */
const TEXT_SPACING_OVERRIDE = `* { line-height: 1.5 !important; letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important; }
  p, li { margin-bottom: 2em !important; }`;

/* 200% zoom is not a separate rendering mode: doubling the zoom halves the CSS
   viewport the layout is solved against. 720x500 is 1440x1000 read at 200%.
   Desktop is carried as a control so a probe that silently stopped inspecting
   anything cannot be mistaken for a layout that holds. */
const LAYOUTS = [
  { name: 'desktop-1440x1000', width: 1440, height: 1000 },
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'zoom200-720x500', width: 720, height: 500 },
  { name: 'zoom200-mobile-390x422', width: 390, height: 422 }
];

/* The longest label the name field accepts, as one unbroken token. A hyphenated
   string would give the line breaker escape hatches the real stress case does
   not have, and `overflow-wrap: anywhere` is exactly what this asserts. */
const LONG_LABEL = `TP-27-03 ${'X'.repeat(111)}`;

async function probeLayout(page, where) {
  return page.evaluate((label) => {
    const doc = document.documentElement;
    const main = document.querySelector('main');
    const tablist = document.querySelector('[aria-label="Portfolio workspace"]');
    const visible = (node) => node.getClientRects().length > 0;
    const nameOf = (node) => `${node.tagName.toLowerCase()}#${node.id || '(anonymous)'}`;

    /* Clipping: content the reader can never reach by any gesture. */
    const clipCandidates = Array.from(main.querySelectorAll(
      '.identity, .state-message, .subtle, .microcopy, .truth-word, .route-states > li, h2, h3, table, th, td'
    )).filter(visible);
    const clipped = clipCandidates.filter((node) => {
      const style = getComputedStyle(node);
      return (style.overflowX === 'hidden' && node.scrollWidth - node.clientWidth > 1)
        || (style.overflowY === 'hidden' && node.scrollHeight - node.clientHeight > 1);
    }).map(nameOf);

    /* Overlap: two regions on the same pixels hide text rather than move it.
       Ancestor/descendant pairs are skipped because containment is not
       collision, and a 1px epsilon keeps subpixel adjacency from reading as a
       hit. */
    const regions = [
      ['workspaceIdentity', document.getElementById('workspaceIdentity')],
      ['workspaceCompute', document.getElementById('workspaceCompute')],
      ['modeSeg', document.getElementById('modeSeg')],
      ['tablist', tablist],
      ...Array.from(tablist.querySelectorAll('[role="tab"]')).map((tab) => [tab.id, tab]),
      ['activePanel', document.querySelector('#workspaceGrid [role="tabpanel"]:not([hidden])')]
    ].filter((entry) => entry[1] && visible(entry[1]));

    const overlaps = [];
    let compared = 0;
    for (let i = 0; i < regions.length; i += 1) {
      for (let j = i + 1; j < regions.length; j += 1) {
        const [aName, a] = regions[i];
        const [bName, b] = regions[j];
        if (a.contains(b) || b.contains(a)) continue;
        compared += 1;
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        if (!(ra.bottom <= rb.top + 1 || rb.bottom <= ra.top + 1
          || ra.right <= rb.left + 1 || rb.right <= ra.left + 1)) overlaps.push(`${aName}|${bName}`);
      }
    }

    /* Touch targets, scoped to the controls THIS scope owns. The shared shell
       renders its own chrome, whose sizing is Feature 012's contract to keep. */
    const targets = Array.from(document.querySelectorAll(
      '[aria-label="Portfolio workspace"] [role="tab"], #modeSeg button, .sheet-close'
    )).filter(visible).map((node) => ({ id: node.id, height: node.getBoundingClientRect().height }));

    /* A table is allowed to be wider than the phone; it is not allowed to be
       wider than the phone with nowhere to scroll. */
    const tables = Array.from(main.querySelectorAll('table')).filter(visible).map((table) => {
      let ancestor = table.parentElement;
      let contained = false;
      while (ancestor && ancestor !== document.body) {
        const style = getComputedStyle(ancestor);
        if (style.overflowX === 'auto' || style.overflowX === 'scroll') { contained = true; break; }
        ancestor = ancestor.parentElement;
      }
      const holder = table.parentElement;
      return {
        id: table.id || '(anonymous)',
        wider: holder ? table.getBoundingClientRect().width > holder.clientWidth + 1 : false,
        contained,
        rows: table.querySelectorAll('tbody tr').length
      };
    });

    const grid = document.getElementById('workspaceGrid');
    const diag = {
      docScrollWidth: doc.scrollWidth,
      docClientWidth: doc.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      gridWidth: grid ? Math.round(grid.getBoundingClientRect().width) : -1,
      gridMinWidth: grid ? getComputedStyle(grid).minWidth : 'none',
      mainWidth: Math.round(main.getBoundingClientRect().width),
      mainOverflowX: getComputedStyle(main).overflowX,
      bodyOverflowX: getComputedStyle(document.body).overflowX,
      htmlOverflowX: getComputedStyle(doc).overflowX
    };

    return {
      label,
      bodyOverflow: doc.scrollWidth - doc.clientWidth,
      inspected: clipCandidates.length,
      clipped,
      compared,
      overlaps,
      targets,
      tables,
      diag
    };
  }, where);
}

function assertLayoutHolds(reading, context) {
  /* An empty candidate set would satisfy every verdict below without having
     looked at a single node, so each population is asserted before its verdict. */
  expect(reading.inspected, `${context}: the clipping probe must have surfaces to inspect`).toBeGreaterThan(0);
  expect(reading.compared, `${context}: the overlap probe must have region pairs to compare`).toBeGreaterThan(0);
  expect(reading.targets.length, `${context}: the touch-target probe must find the workspace controls`)
    .toBeGreaterThanOrEqual(8);

  expect(reading.clipped, `${context}: no surface may clip content out of reach`).toEqual([]);
  expect(reading.overlaps, `${context}: no two workspace regions may overlap`).toEqual([]);
  expect(reading.bodyOverflow, `${context}: the document must not scroll sideways`).toBeLessThanOrEqual(1);
  expect(reading.targets.filter((target) => target.height < 44),
    `${context}: every workspace control must stay at least 44px tall`).toEqual([]);
  expect(reading.tables.filter((table) => table.wider && !table.contained),
    `${context}: a table wider than its holder must live in a scroller`).toEqual([]);
}

test('Regression: SCN-008-053 zoom mobile and long content have no overlap clipping or body overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openLab(page);
  await importValid(page, LONG_LABEL);

  /* The label must actually have reached a rendered surface, otherwise the
     traversal below stresses the short fixture string and proves nothing about
     long content. `#workspaceIdentity` carries Scope 26's content hash, so the
     user-supplied label is read from the revision line that actually shows it. */
  await expect(page.locator('#currentRevision'), 'the maximum-length label must reach a rendered surface')
    .toContainText('X'.repeat(111));

  await page.addStyleTag({ content: TEXT_SPACING_OVERRIDE });
  await page.addStyleTag({ content: '#workspaceGrid { min-width: 2400px !important; }' });

  let tablesSeen = 0;
  for (const layout of LAYOUTS) {
    await page.setViewportSize({ width: layout.width, height: layout.height });
    const perRoute = [];

    for (const route of ROUTES) {
      const tab = TABS[ROUTES.indexOf(route)];
      await page.locator(`#${tab}`).click();
      /* A tab click sets `location.hash` and the route is applied from the
         queued `hashchange` handler, so the click resolves BEFORE the panel
         swaps. Measuring here without settling reads the previous tab. */
      await expect(page.locator(`#${tab}`), 'the routed tab must settle before it is measured')
        .toHaveAttribute('aria-selected', 'true');

      const reading = await probeLayout(page, `${layout.name} ${route}`);
      tablesSeen += reading.tables.length;
      perRoute.push(`${route}:tables=${reading.tables.length}/wide=${reading.tables.filter((t) => t.wider).length}`);
      assertLayoutHolds(reading, `${layout.name} ${route}`);
    }

    const summary = await probeLayout(page, layout.name);
    console.log(`[TP-27-03] ${layout.name} bodyOverflow=${summary.bodyOverflow} inspected=${summary.inspected} `
      + `compared=${summary.compared} clipped=${summary.clipped.length} overlaps=${summary.overlaps.length} `
      + `targets=${summary.targets.length} minTarget=${Math.min(...summary.targets.map((t) => t.height))}`);
    console.log(`[TP-27-03] ${layout.name} ${perRoute.join(' ')}`);
    console.log(`[TP-27-03-DIAG] ${layout.name} ${JSON.stringify(summary.diag)}`);
  }

  /* Tables are the widest thing on the page, so a traversal that met none has
     not exercised the containment rule it just asserted. */
  expect(tablesSeen, 'the traversal must actually meet tables across the six tabs').toBeGreaterThan(0);
  console.log(`[TP-27-03] tablesSeen=${tablesSeen} across ${LAYOUTS.length} projections x ${ROUTES.length} tabs`);

  /* A sheet is the one surface that can widen the document after the layout has
     already settled, so it is opened at the narrowest projection. */
  await page.setViewportSize({ width: 390, height: 422 });
  await page.locator('#openPrivacy').click();
  await expect(page.locator('#privacyPanel')).toBeVisible();
  const sheet = await probeLayout(page, 'sheet-open-390x422');
  expect(sheet.targets.some((target) => target.id === 'closePrivacy'),
    'the open sheet must expose its own close control as a touch target').toBe(true);
  assertLayoutHolds(sheet, 'sheet-open-390x422');
  console.log(`[TP-27-03] sheet-open-390x422 bodyOverflow=${sheet.bodyOverflow} `
    + `clipped=${sheet.clipped.length} overlaps=${sheet.overlaps.length} targets=${sheet.targets.length}`);

  await page.locator('#closePrivacy').click();
  await expect(page.locator('#privacyPanel')).toBeHidden();
});
