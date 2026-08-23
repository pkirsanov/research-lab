import { expect, test } from './playwright-runtime.mjs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './provider-credentials.support.mjs';
import {
  collectConsole,
  collectRequests,
  declareOrdinaryHousehold,
  declaredPackPaths,
  openLifetimeTax,
  openPower
} from './lifetime-tax.support.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BENEFIT_PACK_PATH = 'tax-rules/benefit/2026.json';

/* SUP-023-10, as replaced by SUP-024-09. See the companion definition in
   lifetime-tax-foundation.spec.mjs. */
function declaredRouteAssets() {
  const routeSource = readFileSync(join(ROOT, 'lifetime-tax-strategy-lab.html'), 'utf8');
  const config = JSON.parse(readFileSync(join(ROOT, 'lifetime-tax-strategy.config.json'), 'utf8'));
  const scripts = Array.from(routeSource.matchAll(/<script src="([^"]+)"><\/script>/g))
    .map((match) => '/' + match[1]);
  const packs = declaredPackPaths(config).map((path) => '/' + path);
  return ['/lifetime-tax-strategy-lab.html', '/lifetime-tax-strategy.config.json']
    .concat(scripts).concat(packs).concat(['/favicon.ico']);
}

/* The publication's own worked example, declared as the household would declare it. Every nominal
   amount here is the household's own input; every factor that acts on it is a pack figure. Using
   the authority's own case means the figures this route renders are checkable against figures the
   authority itself prints, rather than against figures this suite invented. */
const CASE_A_NOMINAL = [16196, 17283, 18191, 18971, 19909, 20715, 21850, 22107, 22770, 23755,
  24994, 26533, 28007, 29657, 31392, 32238, 32660, 33558, 35224, 36621, 38419, 40281, 41330,
  40826, 41914, 43354, 44839, 45544, 47298, 49085, 49783, 51651, 53677, 55848, 57590, 62889,
  66421, 69560, 73133, 75868];
const CASE_A_EARNINGS = CASE_A_NOMINAL
  .map((amount, offset) => `${1986 + offset}:${amount}`).join(',');

/* One household's benefit declarations. Exactly the four members the workspace inventories, and
   nothing else: the origin the household declares, its birth year and its claim age. */
async function declareBenefit(page, values) {
  const fill = async (selector, value) => {
    await page.fill(selector, value === undefined || value === null ? '' : String(value));
  };
  await fill('#inputBenefitStatementPia', values.statementPia);
  await fill('#inputBenefitEarningsRecord', values.earningsRecord);
  await fill('#inputBenefitBirthYear', values.birthYear);
  await fill('#inputBenefitClaimAgeMonths', values.claimAgeMonths);
}

const legSetOf = (page, selector) => page.locator(selector)
  .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-rl-leg')).sort());

const splitAttribute = (raw) => (raw === null || raw === '' ? [] : raw.split(','));

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* TP-01-20. The scope's named intended-RED assertion lives in the both-origins half: before the
   two-origin contract existed the resolver returned a figure from one of the two declarations,
   and the assertion fails on the PRESENCE of that figure. */
test('Regression: SCN-024-001 neither origin and both origins each refuse and neither shows a benefit amount', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
  await openPower(page);

  /* Neither origin declared. The refusal names both accepted declarations and defaults neither. */
  await declareBenefit(page, { birthYear: 1964, claimAgeMonths: 744 });
  const neither = page.locator('#benefitRefusal [data-rl-unavailable]');
  await expect(neither).toHaveAttribute('data-rl-unavailable', 'RLTAX-INPUT-INCOMPLETE');
  const neitherDomain = await neither.getAttribute('data-rl-unavailable-domain');
  expect(neitherDomain).toContain('neither-origin-declared');
  await expect(neither).toContainText('statementPrimaryInsuranceAmount');
  await expect(neither).toContainText('declaredEarnings');
  await expect(neither).toContainText('no typical amount is shown in their place');

  /* Both origins declared. This is the ambiguity, and it is refused rather than resolved: the
     record names the ambiguity instead of preferring either declaration, and NO figure computed
     from either one reaches the page. A precedence rule would show one here. */
  await declareBenefit(page, {
    statementPia: 2609.8, earningsRecord: CASE_A_EARNINGS, birthYear: 1964, claimAgeMonths: 744
  });
  const both = page.locator('#benefitRefusal [data-rl-unavailable]');
  await expect(both).toHaveAttribute('data-rl-unavailable', 'RLTAX-INPUT-INCOMPLETE');
  const bothDomain = await both.getAttribute('data-rl-unavailable-domain');
  expect(bothDomain).toContain('both-origins-declared');
  await expect(both).toContainText('neither takes precedence over the other');

  /* The two refusals are told apart by their DOMAIN, not by their message text, so a copy edit
     cannot collapse one into the other. */
  expect(neitherDomain).not.toBe(bothDomain);

  /* Neither refusal shows a zero, a benefit amount or any figure at all. The whole point of
     refusing the ambiguity is that no figure computed from either declaration is published. */
  expect(await page.locator('#power-benefit [data-rl-value]').count()).toBe(0);
  await expect(page.locator('#power-benefit')).not.toContainText('$0');
  expect(await page.locator('#benefitBasisBody tr').count()).toBe(0);
  expect(await page.locator('#benefitAdjustmentBody tr').count()).toBe(0);
  expect(await page.locator('#headlineBlock [data-rl-leg="social-security-benefit"]').count()).toBe(0);
});

/* TP-01-21. */
test('Regression: SCN-024-002 the computed origin publishes its bend points and refuses alone when the indexing series is absent', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
  await openPower(page);

  /* The computed origin over the publication's own worked example. Every intermediate figure the
     publication prints is rendered here, and each carries a reachable citation. */
  await declareBenefit(page, {
    earningsRecord: CASE_A_EARNINGS, birthYear: 1964, claimAgeMonths: 744
  });
  await expect(page.locator('#benefitOriginLine')).toContainText('earnings');
  const basisRows = page.locator('#benefitBasisBody tr');
  expect(await basisRows.count()).toBeGreaterThan(3);
  const basisText = await page.locator('#benefitBasisBody').innerText();
  /* The average indexed monthly earnings the authority itself publishes for this case, and the
     Primary Insurance Amount it produces under the configured display rounding. A wrong bend
     point, percentage, wage index or rounding rule at any of the three rounding sites moves at
     least one of them. The unrounded $2,609.88 and the dime-truncated $2,609.80 are asserted at
     full precision by the contract suite; this surface renders the display-rounded figure. */
  expect(basisText).toContain('5,825');
  expect(basisText).toContain('2,610');
  /* Each bend-point portion is shown with the percentage its OWN breakpoint delimits, and the
     breakpoints are the ones the pack carries rather than a single blended rate. */
  expect(basisText).toContain('1,286');
  expect(basisText).toContain('7,749');
  expect(basisText).toContain('90 percent');
  expect(basisText).toContain('32 percent');
  expect(basisText).toContain('15 percent');
  /* Declared and sourced are never rendered the same way. The figures the household supplied are
     labelled its own input and say in so many words that they carry no citation; every sourced
     bend point carries one naming both the publication and the locator it was transcribed from,
     so a reader can check the figure against the section it came from. */
  const sourcedRows = await page.locator('#benefitBasisBody tr')
    .evaluateAll((rows) => rows
      .map((row) => Array.from(row.cells).map((cell) => cell.textContent.trim()))
      .filter((cells) => cells[2] === 'sourced')
      .map((cells) => cells[3]));
  expect(sourcedRows.length).toBe(3);
  sourcedRows.forEach((citation) => {
    expect(citation).toContain('Primary Insurance Amount');
    expect(citation).toContain('PIA formula bend points');
    expect(citation).not.toContain('no citation');
  });
  expect(basisText).toContain('no citation');
  expect(basisText).toContain('your own input');

  /* The two origins fail INDEPENDENTLY. A birth year whose indexing year falls outside the wage
     series' own declared domain refuses the computed origin, naming the table rather than
     borrowing an adjacent year's factor. The declared origin is untouched by that failure. */
  await declareBenefit(page, {
    earningsRecord: CASE_A_EARNINGS, birthYear: 1900, claimAgeMonths: 744
  });
  const computedRefusal = page.locator('#benefitRefusal [data-rl-unavailable]');
  await expect(computedRefusal).toHaveAttribute('data-rl-unavailable', 'RLTAX-THRESHOLD-UNAVAILABLE');
  expect(await page.locator('#power-benefit [data-rl-value]').count()).toBe(0);
  await expect(page.locator('#power-benefit')).not.toContainText('$0');

  /* The same run, the declared origin, unchanged. The household that read a figure off its own
     statement is never told its answer is degraded because a wage series could not be read. */
  await declareBenefit(page, { statementPia: 2609.8, birthYear: 1964, claimAgeMonths: 744 });
  expect(await page.locator('#benefitRefusal [data-rl-unavailable]').count()).toBe(0);
  await expect(page.locator('#benefitOriginLine')).toContainText('statement');
  await expect(page.locator('#headlineBlock [data-rl-value="benefit-headline"]')).toHaveText('$21,912');
});

/* TP-01-22. */
test('Regression: SCN-024-003 the full retirement age row, the months counted and each factor applied are shown and an out-of-domain birth year refuses', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
  await openPower(page);

  /* An early claim. The row the sourced table supplied, the months counted between the claim age
     and that row, and each factor applied to those months are all published rather than folded
     into one multiplier. */
  await declareBenefit(page, { statementPia: 2609.8, birthYear: 1964, claimAgeMonths: 744 });
  const adjustment = await page.locator('#benefitAdjustmentBody').innerText();
  expect(adjustment).toContain('67');
  expect(adjustment).toContain('60');
  expect(adjustment).toContain('1,826');
  /* The publication's own January-first applicability note is surfaced rather than silently
     applied, because this model receives a birth YEAR and cannot apply a rule keyed to a date. */
  await expect(page.locator('#benefitApplicabilityLine')).toContainText('January 1');
  /* The record says what it is and what it is not. */
  await expect(page.locator('#benefitNoProjectionLine')).toContainText('claim age');

  /* A delayed claim past the sourced stopping age accrues no further credit, and the record SAYS
     the bound applied rather than leaving a reader to infer it from a number that stopped moving. */
  await declareBenefit(page, { statementPia: 2609.8, birthYear: 1964, claimAgeMonths: 71 * 12 });
  await expect(page.locator('#benefitStoppingAgeLine')).toContainText('past the age the source stops');
  const boundedHeadline = await page.locator('#headlineBlock [data-rl-value="benefit-headline"]').textContent();
  await declareBenefit(page, { statementPia: 2609.8, birthYear: 1964, claimAgeMonths: 70 * 12 });
  const atStoppingAge = await page.locator('#headlineBlock [data-rl-value="benefit-headline"]').textContent();
  expect(boundedHeadline).toBe(atStoppingAge);

  /* A birth year outside a sourced table's own declared domain refuses and NEVER falls through to
     an adjacent row. The delayed-credit table is closed below at its first published row, so a
     delayed claim from a birth year beneath it has no row and the adjustment refuses. */
  await declareBenefit(page, { statementPia: 2609.8, birthYear: 1900, claimAgeMonths: 69 * 12 });
  const outOfDomain = page.locator('#benefitRefusal [data-rl-unavailable]');
  await expect(outOfDomain).toHaveAttribute('data-rl-unavailable', 'RLTAX-THRESHOLD-UNAVAILABLE');
  await expect(outOfDomain).toContainText('domain');
  expect(await page.locator('#benefitAdjustmentBody tr').count()).toBe(0);
  await expect(page.locator('#power-benefit')).not.toContainText('$0');
});

/* TP-01-23. */
test('Regression: SCN-024-003 the benefit leg reaches the headline, the comparison, the curve and the export', async ({ page }) => {
  await openLifetimeTax(page, site);
  /* Every leg in this fixture settles a DISTINCT non-zero figure, so omitting any one of them
     changes a surface by an amount unique to that leg. A zero leg balances an addition check
     whether or not it was added, which is exactly how a dropped leg hides. */
  await declareOrdinaryHousehold(page, {
    ordinary: 300000, longTermCapitalGain: 120000, otherNetInvestmentIncome: 5000,
    medicareWageBasis: 400000, bracketId: 'b3'
  });
  await declareBenefit(page, { statementPia: 2609.8, birthYear: 1964, claimAgeMonths: 744 });
  await openPower(page);

  const record = splitAttribute(await page.locator('body').getAttribute('data-rl-legs-record'));
  expect(record.length).toBeGreaterThan(1);
  expect(record).toContain('social-security-benefit');

  /* Surface one: the headline. The federal figure declares the legs it summed, and the benefit
     carries its own figure BESIDE that total because it is money received rather than tax owed. */
  const headlineSummed = splitAttribute(
    await page.locator('#headlineBlock [data-rl-legs]').getAttribute('data-rl-legs'));
  const headlineOwn = await legSetOf(page, '#headlineBlock [data-rl-leg]');
  const headline = headlineSummed.concat(headlineOwn).sort();
  expect(headlineOwn).toContain('social-security-benefit');
  expect(headlineSummed).not.toContain('social-security-benefit');

  /* Surfaces two and three: the comparison table and the curve's leg contributors. */
  const comparison = await legSetOf(page, '#legCompositionBody tr[data-rl-leg]');
  const curve = await legSetOf(page, '#curveLegContributorsBody tr[data-rl-leg]');
  await expect(page.locator('#curveLegContributorsBody tr[data-rl-leg="social-security-benefit"]'))
    .toContainText('an added dollar of income cannot move it');

  /* Surface four: the export. */
  await page.locator('#exportAcknowledgement').check();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#exportPrivateFile').click()
  ]);
  const written = JSON.parse(readFileSync(await download.path(), 'utf8'));
  const exported = written.settledLegs.slice().sort();
  const exportedAttribute = splitAttribute(
    await page.locator('#privacyResult').getAttribute('data-rl-export-legs')).sort();

  /* Two-directional set identity against every one of the four surfaces, reported by naming both
     the missing leg and the surface it failed to reach. */
  const sortedRecord = record.slice().sort();
  [
    ['headline', headline],
    ['comparison', comparison],
    ['curve', curve],
    ['export', exported],
    ['export attribute', exportedAttribute]
  ].forEach(([surface, rendered]) => {
    sortedRecord.forEach((legId) => {
      expect(rendered, `the leg ${legId} is in the settled record and does not reach ${surface}`)
        .toContain(legId);
    });
    rendered.forEach((legId) => {
      expect(sortedRecord, `the leg ${legId} appears on ${surface} and is not in the settled record`)
        .toContain(legId);
    });
  });
});

/* TP-01-24. */
test('Regression: SCN-024-001 the request ledger does not grow after first paint, every entry is a declared same-origin read, and no benefit declaration reaches a URL', async ({ page }) => {
  const ledger = collectRequests(page);
  const consoleMessages = collectConsole(page);
  await openLifetimeTax(page, site);
  const afterFirstPaint = ledger.length;
  expect(afterFirstPaint).toBeGreaterThan(0);

  /* Distinctive household figures. The earnings record and the birth year are the most sensitive
     objects this program carries — an earnings record is a year-by-year employment history — so
     each is given a value that would be unmistakable anywhere it does not belong. */
  const statementSentinel = '3141.59';
  const earningsSentinel = '265358';
  const birthYearSentinel = '1964';
  await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
  await declareBenefit(page, {
    statementPia: statementSentinel, birthYear: birthYearSentinel, claimAgeMonths: 744
  });
  await openPower(page);

  /* Not one request was issued after first paint: not by the benefit settlement, not by the
     claim-age adjustment, and not by the view switch. The benefit pack is now read from disk, and
     it was read before first paint. */
  expect(ledger.length).toBe(afterFirstPaint);

  /* Every request the route did make is one the route itself declares, including the benefit pack
     — which is permitted because the configuration declares it, not because a list was edited. */
  const permitted = declaredRouteAssets();
  const paths = ledger.map((entry) => new URL(entry.url).pathname);
  paths.forEach((path) => expect(permitted).toContain(path));
  expect(paths).toContain('/' + BENEFIT_PACK_PATH);

  /* No benefit declaration reaches any URL, any request body or any console message. */
  await page.fill('#inputBenefitEarningsRecord', `2000:${earningsSentinel}`);
  await page.fill('#inputBenefitStatementPia', '');
  const sentinels = [statementSentinel, earningsSentinel, birthYearSentinel];
  ledger.forEach((entry) => {
    sentinels.forEach((sentinel) => {
      expect(entry.url).not.toContain(sentinel);
      expect(entry.postData).not.toContain(sentinel);
    });
    expect(entry.method).toBe('GET');
  });
  sentinels.forEach((sentinel) => {
    expect(consoleMessages.some((message) => message.includes(sentinel))).toBe(false);
  });
  expect(consoleMessages).toEqual([]);

  const location = await page.evaluate(() => ({
    search: window.location.search, hash: window.location.hash,
    href: window.location.href, referrer: document.referrer
  }));
  expect(location.search).toBe('');
  expect(location.href.includes(earningsSentinel)).toBe(false);
  expect(location.href.includes(statementSentinel)).toBe(false);
  expect(location.referrer).toBe('');
});
