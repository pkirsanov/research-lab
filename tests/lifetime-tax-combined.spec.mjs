import { expect, test } from './playwright-runtime.mjs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './provider-credentials.support.mjs';
import {
  SENTINEL_ORDINARY,
  collectConsole,
  collectRequests,
  declareOrdinaryHousehold,
  declaredPackPaths,
  openLifetimeTax,
  openPower
} from './lifetime-tax.support.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* The two shipped state packs, read here so every expectation is checked against the authority the
   pack actually carries. Nothing in this file names a rate, a bracket edge, a deduction amount or a
   tax year of its own. */
const FLORIDA_PATH = 'tax-rules/state/FL/2026.json';
const FLORIDA = JSON.parse(readFileSync(join(ROOT, FLORIDA_PATH), 'utf8'));
const CALIFORNIA = JSON.parse(readFileSync(join(ROOT, 'tax-rules/state/CA/2026.json'), 'utf8'));
const CONFIG = JSON.parse(readFileSync(join(ROOT, 'lifetime-tax-strategy.config.json'), 'utf8'));

/* SUP-024-09, as used by the state and foundation specs. The asset set the route may request is
   derived from the route's own declarations rather than pinned as a literal, so the script tag this
   scope adds is admitted by the page declaring it and not by this file listing it. */
function declaredRouteAssets() {
  const routeSource = readFileSync(join(ROOT, 'lifetime-tax-strategy-lab.html'), 'utf8');
  const scripts = Array.from(routeSource.matchAll(/<script src="([^"]+)"><\/script>/g))
    .map((match) => '/' + match[1]);
  const packs = declaredPackPaths(CONFIG).map((path) => '/' + path);
  return ['/lifetime-tax-strategy-lab.html', '/lifetime-tax-strategy.config.json']
    .concat(scripts).concat(packs).concat(['/favicon.ico']);
}

async function declareResidency(page, jurisdiction, pattern) {
  await page.fill('#inputResidencyJurisdiction', jurisdiction === null ? '' : jurisdiction);
  await page.selectOption('#inputResidencyPattern', pattern === null ? '' : pattern);
}

const amount = (shown) => Number(String(shown).replace(/[$,]/g, ''));
const rate = (shown) => Number(String(shown).replace('%', ''));

const combinedCard = (page) => page.locator('#combinedSettlementCard');
const combinedFigure = (page) => page.locator('[data-rl-value="combinedTotalTax"]');
const combinedRefusal = (page) => page.locator('#combinedSettlementCard [data-rl-unavailable]');

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* TP-05-16. */
test('Regression: SCN-022-013 the combined total is the sum of two independent settlements', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 123457, bracketId: 'b3' });

  /* The federal figure BEFORE any residency exists, captured rather than restated so the identity
     below is against what this settlement actually produced. */
  const federalBefore = await page.locator('[data-rl-value="headlineFederalTax"]').textContent();
  expect(federalBefore).toMatch(/^\$[\d,]+$/);
  /* Nothing combined is offered before a state pack resolves, and no zero stands in for one. */
  await expect(combinedFigure(page)).toHaveCount(0);

  await declareResidency(page, 'state:FL', 'full-year-resident');

  /* State tax is a SEPARATE leg. The federal total is byte-identical to the total of the same
     household settled before any residency was declared, so declaring where the household lives is
     proven to add a second settlement rather than to change the first one. */
  await expect(page.locator('[data-rl-value="headlineFederalTax"]')).toHaveText(federalBefore);

  const federalLeg = await page.locator('[data-rl-value="combinedFederalLeg"]').textContent();
  const stateLeg = await page.locator('[data-rl-value="combinedStateLeg"]').textContent();
  const combined = await combinedFigure(page).textContent();
  expect(federalLeg).toBe(federalBefore);
  /* A sourced zero is a real addend: it is added, not skipped, and the combined figure is not
     relabelled federal-only because one side happened to be zero. */
  expect(amount(stateLeg)).toBe(0);
  expect(amount(combined)).toBe(amount(federalLeg) + amount(stateLeg));
  await expect(combinedRefusal(page)).toHaveCount(0);

  /* The shape the addition branched on is stated in words, because a reader cannot tell a sourced
     zero from an unretrieved figure by looking at a numeral. */
  await expect(page.locator('[data-rl-value="stateSettlementShape"]'))
    .toContainText('carries the authority');
  const describedBy = await combinedFigure(page).getAttribute('aria-describedby');
  expect(describedBy).toBe('tip-combinedTotalTax');
  await expect(page.locator('#tip-combinedTotalTax')).toContainText('addition');

  await openPower(page);

  /* The per-leg breakdown carries the same three figures, so the decision-level line and the
     evidence view cannot disagree. */
  const powerFederal = await page.locator('[data-rl-value="combined-federal-total"]').textContent();
  const powerState = await page.locator('[data-rl-value="combined-state-total"]').textContent();
  const powerCombined = await page.locator('[data-rl-value="combined-total"]').textContent();
  expect(powerFederal).toBe(federalLeg);
  expect(powerState).toBe(stateLeg);
  expect(powerCombined).toBe(combined);
  await expect(page.locator('[data-rl-combined-leg="combined-state-total"]'))
    .toContainText('added as a real amount');

  /* The independence is a computed verdict rather than a sentence: both orders were settled and the
     serialised results compared. */
  await expect(page.locator('#combinedIndependenceLine'))
    .toContainText('settle-both-orders-and-compare');
  await expect(page.locator('#combinedIndependenceLine'))
    .toContainText('the two orders produced identical results');
  await expect(page.locator('#combinedIndependenceLine')).toContainText('false');

  /* Both packs' declared years and the agreement verdict, read off the packs themselves. */
  const packYearRows = page.locator('#combinedPackYearsBody tr');
  await expect(packYearRows).toHaveCount(3);
  await expect(packYearRows.nth(0)).toContainText(CONFIG.rules.jurisdiction);
  await expect(packYearRows.nth(1)).toContainText(FLORIDA.id);
  await expect(packYearRows.nth(1)).toContainText(FLORIDA.effectiveTaxYears.join(', '));
  await expect(packYearRows.nth(2)).toContainText('effective in both packs');

  /* The coupling this tool does NOT model is named at the same prominence as the figure, and the
     modelled list is present and empty rather than absent. */
  const coupling = page.locator('[data-rl-combined-coupling]');
  await expect(coupling).toHaveCount(1);
  await expect(coupling).toContainText('RLTAX-FEATURE-UNSUPPORTED');
  await expect(coupling).toContainText('state income tax');
  await expect(page.locator('#combinedItemizedNotice')).toContainText('not itemised');
});

/* TP-05-17. */
test('Regression: SCN-022-014 the combined curve attributes every step to a named jurisdiction', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 123457, bracketId: 'b3' });
  await declareResidency(page, 'state:FL', 'full-year-resident');
  await openPower(page);

  await expect(page.locator('#combinedCurveChart'))
    .toHaveAttribute('data-rl-combined-curve-drawn', 'true');
  const rows = page.locator('#combinedCurveTextEquivalentBody tr');
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(50);

  const grid = await rows.evaluateAll((nodes) => nodes.map((node) => Array.from(node.cells)
    .map((cell) => cell.textContent.trim())));
  expect(grid.length).toBe(rowCount);

  const jurisdictions = new Set();
  let stepRows = 0;
  grid.forEach((cells, index) => {
    const [level, federalTax, stateTax, combinedTax,
      federalRate, stateRate, combinedRate, segment, thresholds] = cells;
    const where = `combined curve row ${index} at ${level}`;

    /* Nothing renders as a blank, a bare dash or an unattributed cell. */
    cells.forEach((cell) => {
      expect(cell, `${where} renders an empty cell`).not.toBe('');
      expect(cell, `${where} renders a bare dash`).not.toBe('-');
      expect(cell, `${where} renders a bare em dash`).not.toBe('\u2014');
    });

    /* Three rates per point, and the combined rate is the SUM of the two components rather than a
       separate derivation over a coupled total. Read off the DISPLAYED figures, so the tolerance is
       the display rounding itself and nothing tighter: the table shows rates to two decimals and
       amounts to whole dollars, and summing two independently rounded values can legitimately sit
       one rounding step away from the rounded sum. The exact identity, to the pack's own
       reconciliation tolerance, is asserted against the records themselves by TP-05-08 in
       `scripts/selftest.mjs`; asserting it tighter here would be pinning the formatter. */
    expect(rate(combinedRate), `${where} combined rate is not the sum of its components`)
      .toBeCloseTo(rate(federalRate) + rate(stateRate), 1);
    expect(Math.abs(amount(combinedTax) - (amount(federalTax) + amount(stateTax))),
      `${where} combined tax is not the sum of its legs`).toBeLessThanOrEqual(1);

    /* The no-tax jurisdiction contributes a PRESENT, flat, zero series across the whole domain
       rather than an absent one: a missing line would read as a missing government. */
    expect(amount(stateTax), `${where} drops the no-tax state series`).toBe(0);
    expect(rate(stateRate), `${where} drops the no-tax state marginal series`).toBe(0);

    /* Every step names the threshold that caused it AND the jurisdiction whose pack declares it.
       An unattributable move is refused by the module rather than rendered, so a step with no
       named owner here would mean the refusal was bypassed. */
    if (segment !== 'first sampled point' && segment.indexOf('step') >= 0) {
      stepRows += 1;
      expect(thresholds, `${where} is a step with no contributing threshold`)
        .not.toBe('no threshold crossed');
      thresholds.split(' ; ').forEach((entry) => {
        const owner = entry.split(' \u00b7 ')[0];
        expect(owner, `${where} names a step owner that is not a jurisdiction`)
          .toMatch(/^(federal|state:[A-Z]{2})$/);
        jurisdictions.add(owner);
      });
    }
  });

  /* Non-vacuous: the sweep really crossed declared edges, and the attribution really named a
     jurisdiction rather than the loop passing over an empty step set. */
  expect(stepRows).toBeGreaterThan(0);
  expect(jurisdictions.has(CONFIG.rules.jurisdiction)).toBe(true);

  /* And the curve states what it cannot price rather than presenting itself as complete. */
  await expect(page.locator('#combinedCurveIncompleteLabel [data-rl-combined-curve-incomplete]'))
    .toHaveCount(1);
});

/* TP-05-18. The route resolves EACH pack for the declared year before the pair is formed, so the
   module's own `RLTAX-PACK-YEAR-MISMATCH` — which describes a defect in the RELATIONSHIP between
   two individually valid packs — is not reachable from the page: the pack that does not cover the
   declared year refuses to resolve first, under its own code. That refusal is what the household
   actually meets, so this row asserts the product obligation the scenario states — a year the two
   packs do not both cover produces NO combined figure and names the disagreement — over the real
   route. The module-level mismatch refusal itself is proven directly by TP-05-01 in
   `scripts/selftest.mjs`, which this row does not restate. */
test('Regression: SCN-022-015 a pack year mismatch refuses and shows no combined figure', async ({ page }) => {
  /* The pack is served with its declared effective years moved off the year the household declares.
     No tax figure is altered: only which years the pack states it is effective for. */
  const disagreeing = JSON.parse(JSON.stringify(FLORIDA));
  disagreeing.effectiveTaxYears = [2999];
  const mismatchedSite = await startStaticServer({
    overrides: { [FLORIDA_PATH]: JSON.stringify(disagreeing) }
  });
  try {
    await openLifetimeTax(page, mismatchedSite);
    await declareOrdinaryHousehold(page, { ordinary: 123457, bracketId: 'b3' });
    await declareResidency(page, 'state:FL', 'full-year-resident');

    /* The refusal is rendered whole, on an element a keyboard reader can reach, and it names the
       declared year that the two packs do not both cover. */
    const refusal = combinedRefusal(page);
    await expect(refusal).toHaveAttribute('data-rl-unavailable', 'RLTAX-YEAR-UNSUPPORTED');
    await expect(refusal).toHaveAttribute('data-rl-unavailable-domain',
      'declaredTaxYear:' + String(CONFIG.rules.declaredTaxYear));
    const refusalText = await refusal.innerText();
    expect(refusalText).toContain('Unavailable because');
    expect(refusalText).toContain('What would make it available:');
    await refusal.focus();
    await expect(refusal).toBeFocused();

    /* Neither jurisdiction total is presented as a combined figure, and no combined numeral appears
       anywhere in the card: a sum missing one government is refused, never shortened. */
    await expect(combinedFigure(page)).toHaveCount(0);
    await expect(page.locator('[data-rl-value="combinedFederalLeg"]')).toHaveCount(0);
    await expect(page.locator('[data-rl-value="combinedStateLeg"]')).toHaveCount(0);
    expect(await combinedCard(page).innerText()).not.toMatch(/\$\s?\d/);

    /* The federal settlement is untouched by the state axis refusing, which is the same
       independence claim read from the failing direction. */
    await expect(page.locator('[data-rl-value="headlineFederalTax"]')).toHaveText(/^\$[\d,]+$/);

    await openPower(page);
    await expect(page.locator('#combinedRefusal [data-rl-unavailable]'))
      .toHaveAttribute('data-rl-unavailable', 'RLTAX-YEAR-UNSUPPORTED');
    /* No pack pair was formed, so no year row and no curve is invented in its place. */
    await expect(page.locator('#combinedPackYearsBody tr')).toHaveCount(0);
    await expect(page.locator('#combinedLegBreakdownBody tr')).toHaveCount(0);
    await expect(page.locator('#combinedCurveTextEquivalentBody tr')).toHaveCount(0);
    await expect(page.locator('#combinedCurveChart'))
      .toHaveAttribute('data-rl-combined-curve-drawn', 'false');
    expect(await page.locator('#power-combined').innerText()).not.toContain('$0');
  } finally {
    await mismatchedSite.close();
  }

  /* POSITIVE CONTROL. A refusal assertion alone would also hold on a page that never composed a
     combined answer at all, which is exactly the gap this scope closed. The identical route served
     the UNMODIFIED pack must produce the combined surfaces, so the refusal above is proven to be
     the year disagreement rather than the absence of the feature. */
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 123457, bracketId: 'b3' });
  await declareResidency(page, 'state:FL', 'full-year-resident');
  await expect(combinedFigure(page)).toBeVisible();
  await expect(combinedRefusal(page)).toHaveCount(0);
  await openPower(page);
  await expect(page.locator('#combinedPackYearsBody tr')).toHaveCount(3);
});

/* TP-05-19. */
test('Regression: SCN-022-014 the combined curve is reachable by keyboard and has a text equivalent table', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 123457, bracketId: 'b3' });
  await declareResidency(page, 'state:FL', 'full-year-resident');
  await openPower(page);

  /* The chart is an image with a name, and that name points at the text equivalent rather than
     leaving a reader who cannot see it to discover one. */
  const chart = page.locator('#combinedCurveChart');
  await expect(chart).toHaveAttribute('role', 'img');
  await expect(chart).toHaveAttribute('tabindex', '0');
  const chartLabel = await chart.getAttribute('aria-label');
  expect(chartLabel).toContain('text-equivalent table');
  await chart.focus();
  await expect(chart).toBeFocused();

  /* The text equivalent carries an accessible label and the same rows the chart drew. */
  const table = page.locator('#combinedCurveTextEquivalent');
  const tableLabel = await table.getAttribute('aria-label');
  expect(tableLabel).toContain('jurisdiction');
  expect(await page.locator('#combinedCurveTextEquivalentBody tr').count()).toBeGreaterThan(50);
  await table.evaluate((node) => { node.setAttribute('tabindex', '0'); node.focus(); });
  await expect(table).toBeFocused();

  /* Every figure in this section carries a contextual explanation reachable by keyboard focus. */
  const coverage = await page.locator('#power-combined [data-rl-value]')
    .evaluateAll((nodes) => nodes.map((node) => {
      const id = node.getAttribute('aria-describedby');
      const tip = id ? document.getElementById(id) : null;
      return {
        field: node.getAttribute('data-rl-value'),
        focusable: node.getAttribute('tabindex') === '0',
        role: tip ? tip.getAttribute('role') : null,
        length: tip ? tip.textContent.trim().length : 0
      };
    }));
  expect(coverage.length).toBeGreaterThan(0);
  coverage.forEach((entry) => {
    expect(entry.focusable, `${entry.field} is not focusable`).toBe(true);
    expect(entry.role, `${entry.field} has no tooltip`).toBe('tooltip');
    expect(entry.length, `${entry.field} has an empty tooltip`).toBeGreaterThan(40);
  });

  /* Every deferred contributor is reachable and states its code, the pack that declared it and the
     reason it cannot be priced. It is deliberately NOT a refusal record, so it does not claim the
     refusal attribute and does not pretend to carry a remediation it has not got. */
  const contributors = page.locator('[data-rl-combined-contributor]');
  const contributorCount = await contributors.count();
  expect(contributorCount).toBeGreaterThan(0);
  for (let index = 0; index < contributorCount; index += 1) {
    const node = contributors.nth(index);
    const jurisdiction = await node.getAttribute('data-rl-combined-contributor-jurisdiction');
    expect(jurisdiction).toMatch(/^(federal|state:[A-Z]{2})$/);
    const body = (await node.innerText()).trim();
    expect(body).toContain('RLTAX-');
    expect(body).toContain('Not priced because');
    expect(body).not.toBe('');
    await node.focus();
    await expect(node).toBeFocused();
  }
  /* A contributor is not a refusal: none of them may be counted as one, because the refusal sweep
     requires a domain and a remediation that a deferred contributor legitimately has not got. */
  expect(await page.locator('[data-rl-combined-contributor][data-rl-unavailable]').count()).toBe(0);

  /* Every visible refusal in this section still carries the whole refusal surface. */
  const sectionRefusals = page.locator('#power-combined [data-rl-unavailable]');
  const refusalCount = await sectionRefusals.count();
  for (let index = 0; index < refusalCount; index += 1) {
    const body = (await sectionRefusals.nth(index).innerText()).trim();
    expect(body).toContain('Unavailable because');
    expect(body).toContain('What would make it available:');
  }
});

/* TP-05-20. */
test('Regression: SCN-022-013 the request ledger stays empty across the full combined workflow', async ({ page }) => {
  const ledger = collectRequests(page);
  const consoleMessages = collectConsole(page);
  await openLifetimeTax(page, site);
  const afterFirstPaint = ledger.length;
  expect(afterFirstPaint).toBeGreaterThan(0);

  await declareOrdinaryHousehold(page, { ordinary: Number(SENTINEL_ORDINARY), bracketId: 'b3' });
  await declareResidency(page, 'state:FL', 'full-year-resident');
  await openPower(page);
  await expect(page.locator('#combinedCurveChart'))
    .toHaveAttribute('data-rl-combined-curve-drawn', 'true');
  await page.locator('#modeSimple').click();
  await expect(combinedFigure(page)).toBeVisible();

  /* Not one request was issued after first paint: composing the combined answer and the combined
     curve settles from packs already read rather than fetching anything. */
  expect(ledger.length).toBe(afterFirstPaint);

  /* And every request the route ever made is a same-origin read of an asset the page's own
     configuration declares. The combined module is permitted because the page declares its script
     tag, not because this file lists it. */
  const permitted = declaredRouteAssets();
  expect(permitted).toContain('/rltaxcombined.js');
  expect(permitted).not.toContain('/definitely-not-declared-by-this-route.json');
  expect(ledger.filter((entry) => !entry.url.startsWith(site.baseUrl))).toEqual([]);
  ledger.forEach((entry) => {
    expect(permitted).toContain(new URL(entry.url).pathname);
    expect(entry.url).not.toContain('state:FL');
    expect(entry.url).not.toContain(encodeURIComponent('state:FL'));
    expect(entry.url).not.toContain('residency');
    expect(entry.url).not.toContain(SENTINEL_ORDINARY);
    expect(entry.postData).toBe('');
  });

  /* No household value and no residency reaches the URL, the query string or the hash. The hash
     carries the view mode and nothing else. */
  const url = page.url();
  expect(new URL(url).search).toBe('');
  expect(['#simple', '#power', '']).toContain(new URL(url).hash);
  expect(url).not.toContain(SENTINEL_ORDINARY);
  expect(url).not.toContain('state:FL');
  expect(url).not.toContain('combined');

  consoleMessages.forEach((message) => {
    expect(message).not.toContain(SENTINEL_ORDINARY);
    expect(message).not.toContain('state:FL');
    expect(message).not.toContain('residency');
  });
});

/* TP-05-21. */
test('Regression: SCN-022-013 the tool is absent from every registry and the market brief', async ({ page }) => {
  const surfaces = ['tools.json', 'index.html', 'rlnav.js', 'README.md', 'notes/README.md',
    'market-brief.config.json'];
  surfaces.forEach((file) => {
    const body = readFileSync(join(ROOT, file), 'utf8');
    expect(body, `${file} references the unregistered lifetime-tax route`).not.toContain('lifetime-tax');
    expect(body, `${file} references the combined settlement module`).not.toContain('rltaxcombined');
  });

  /* The deploy projection carries the decision explicitly rather than by omission: the page and the
     module this scope wired are both excluded, so the packaged site ships neither. */
  const exclusions = JSON.parse(readFileSync(join(ROOT, 'site-exclusions.json'), 'utf8'));
  const excluded = exclusions.files.map((entry) => entry.path);
  expect(excluded).toContain('rltaxcombined.js');
  expect(excluded).toContain('lifetime-tax-strategy-lab.html');

  /* And the live index offers no route to it, so the absence is a property of the shipped surface
     rather than of a file scan alone. */
  await page.goto(`${site.baseUrl}/index.html`);
  const hrefs = await page.locator('a[href]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
  hrefs.forEach((href) => expect(href).not.toContain('lifetime-tax'));
  expect(await page.locator('a[href*="lifetime-tax"]').count()).toBe(0);
});

/* TP-05-16 companion: the refusal-inheritance direction. A jurisdiction whose figures were never
   retrieved must make the combined total refuse with THAT jurisdiction's own reason, rather than
   silently reporting the federal leg as the whole answer. */
test('Regression: SCN-022-013 a refusing state leg makes the combined total refuse with that leg own reason', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 123457, bracketId: 'b3' });
  const federalBefore = await page.locator('[data-rl-value="headlineFederalTax"]').textContent();
  await declareResidency(page, 'state:CA', 'full-year-resident');

  /* The federal total is still byte-identical: a refusing state leg changes no federal figure. */
  await expect(page.locator('[data-rl-value="headlineFederalTax"]')).toHaveText(federalBefore);

  /* No combined numeral at all. The combined total inherits the state leg's own refusal, naming the
     source that was never retrieved rather than summarising it away. */
  await expect(combinedFigure(page)).toHaveCount(0);
  const refusal = combinedRefusal(page).first();
  await expect(refusal).toHaveAttribute('data-rl-unavailable', 'RLTAX-THRESHOLD-UNAVAILABLE');
  await expect(refusal).toHaveAttribute('data-rl-unavailable-domain', 'state-deduction:single');
  const absent = CALIFORNIA.standardDeductions.single;
  expect(absent.contractVersion).toBe('AbsentFigure/v1');
  const refusalText = await refusal.innerText();
  expect(refusalText).toContain(absent.reason);
  expect(refusalText).toContain(absent.missingSource.title);

  /* The federal addend is still published under its OWN jurisdiction label. Withholding it would
     hide which side refused; labelling it combined would be the silent drop this card prevents. */
  await expect(page.locator('[data-rl-value="combinedFederalLeg"]')).toHaveText(federalBefore);
  await expect(page.locator('[data-rl-value="combinedStateLeg"]')).toHaveCount(0);
  await expect(page.locator('[data-rl-value="stateSettlementShape"]'))
    .toContainText('refusal naming what was not retrieved');

  await openPower(page);
  /* The breakdown still shows both legs, and the combined row is a refusal rather than a number. */
  await expect(page.locator('[data-rl-combined-leg="combined-federal-total"] [data-rl-value="combined-federal-total"]'))
    .toHaveText(federalBefore);
  await expect(page.locator('[data-rl-combined-leg="combined-total"] [data-rl-value="combined-total"]'))
    .toHaveCount(0);
  await expect(page.locator('[data-rl-combined-leg="combined-total"] [data-rl-unavailable]'))
    .toHaveAttribute('data-rl-unavailable', 'RLTAX-THRESHOLD-UNAVAILABLE');

  /* The next dollar has no price in one of the two jurisdictions, so the curve refuses naming the
     state side rather than drawing a federal-only line labelled combined. */
  await expect(page.locator('#combinedCurveIncompleteLabel [data-rl-unavailable]'))
    .toHaveAttribute('data-rl-unavailable-domain', 'combined-curve:ordinary:state');
  await expect(page.locator('#combinedCurveChart'))
    .toHaveAttribute('data-rl-combined-curve-drawn', 'false');
  await expect(page.locator('#combinedCurveTextEquivalentBody tr')).toHaveCount(0);
});
