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
const FL_REGIME_PATH = 'tax-rules/property/FL/2026.json';
const CA_REGIME_PATH = 'tax-rules/property/CA/2026.json';
const BENEFIT_PACK_PATH = 'tax-rules/benefit/2026.json';

/* SUP-023-10, as replaced by SUP-024-09. See the companion definition in
   lifetime-tax-foundation.spec.mjs. The asset set the route may request is derived from the
   route's own declarations rather than pinned as a literal, and its pack half is derived from
   every pack-path member the configuration declares rather than from a hand-listed key set. */
function declaredRouteAssets() {
  const routeSource = readFileSync(join(ROOT, 'lifetime-tax-strategy-lab.html'), 'utf8');
  const config = JSON.parse(readFileSync(join(ROOT, 'lifetime-tax-strategy.config.json'), 'utf8'));
  const scripts = Array.from(routeSource.matchAll(/<script src="([^"]+)"><\/script>/g))
    .map((match) => '/' + match[1]);
  const packs = declaredPackPaths(config).map((path) => '/' + path);
  return ['/lifetime-tax-strategy-lab.html', '/lifetime-tax-strategy.config.json']
    .concat(scripts).concat(packs).concat(['/favicon.ico']);
}

/* The fixture relief regimes. They carry invented figures and name no jurisdiction, no programme
   and no authority, so a branch that matched on a regime name would have nothing to match. Serving
   one AT a declared regime path exercises the engine's cap-basis and ceiling branches over the real
   route without inventing a tax figure and without presenting a fixture as an authority. */
const FIXTURE_REGIMES = JSON.parse(
  readFileSync(join(ROOT, 'tax-rules/fixtures/property-regimes-2999.json'), 'utf8')).regimes;

const servingFixtureRegimes = (floridaPathKey, californiaPathKey) => ({
  [FL_REGIME_PATH]: JSON.stringify(FIXTURE_REGIMES[floridaPathKey]),
  [CA_REGIME_PATH]: JSON.stringify(FIXTURE_REGIMES[californiaPathKey])
});

/* One household's property declarations. Every member here is the household's own input; the
   regime supplies every figure an authority states. The two never mix. */
async function declareProperty(page, values) {
  const fill = async (selector, value) => {
    await page.fill(selector, value === undefined || value === null ? '' : String(value));
  };
  await fill('#inputPropertyJurisdiction', values.jurisdiction);
  await fill('#inputPropertyAssessedValue', values.assessedValue);
  await fill('#inputPropertyPriorAssessedValue', values.priorAssessedValue);
  await fill('#inputPropertyAcquisitionValue', values.acquisitionValue);
  await fill('#inputPropertyLocalCombinedRate', values.localCombinedRate);
  await fill('#inputPropertyExemptionElections', values.exemptionElections);
}

const legSetOf = (page, selector) => page.locator(selector)
  .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-rl-leg')).sort());

const splitAttribute = (raw) => (raw === null || raw === '' ? [] : raw.split(','));

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* TP-01-18. */
test('Regression: SCN-023-001 a missing declaration and an unretrieved rule refuse differently and neither shows a zero', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
  await openPower(page);

  /* The household's own half is missing: a jurisdiction is declared, the assessed value is not. */
  await declareProperty(page, { jurisdiction: 'state:FL', localCombinedRate: '0.02' });
  const missingDeclaration = page.locator('#propertyRefusal [data-rl-unavailable]');
  await expect(missingDeclaration).toHaveAttribute('data-rl-unavailable', 'RLTAX-INPUT-INCOMPLETE');
  const declarationDomain = await missingDeclaration.getAttribute('data-rl-unavailable-domain');
  expect(declarationDomain).toMatch(/^property-assessment:/);
  expect(declarationDomain).toContain('assessedValue');
  await expect(missingDeclaration).toContainText('no typical value, average or estimate is substituted');

  /* Nothing stands in for the refusal. No relief step, no declaration row, no figure at all. */
  expect(await page.locator('#propertyReliefBody tr').count()).toBe(0);
  expect(await page.locator('#propertyDeclarationsBody tr').count()).toBe(0);
  expect(await page.locator('#power-property [data-rl-value]').count()).toBe(0);
  await expect(page.locator('#power-property')).not.toContainText('$0');
  expect(await page.locator('#headlineBlock [data-rl-value="propertyTax"]').count()).toBe(0);

  /* Now the household's half is complete and the STATUTE's half is what is missing: the shipped
     Florida regime carries its assessment cap as the lower of a stated three percent and a
     Consumer Price Index change that was not retrieved, so the effective cap cannot be
     established and the leg refuses rather than applying the stated ceiling as though it were
     the cap. */
  await declareProperty(page, {
    jurisdiction: 'state:FL', assessedValue: 400000, priorAssessedValue: 300000,
    acquisitionValue: 200000, localCombinedRate: '0.02', exemptionElections: 'homestead-first-tier'
  });
  const missingRule = page.locator('#propertyRefusal [data-rl-unavailable]');
  await expect(missingRule).toHaveAttribute('data-rl-unavailable', 'RLTAX-THRESHOLD-UNAVAILABLE');
  const ruleDomain = await missingRule.getAttribute('data-rl-unavailable-domain');
  expect(ruleDomain).toMatch(/^property-regime:/);
  await expect(missingRule).toContainText('no figure is derived in its place');

  /* The two refusals are separated by CONTRACT SHAPE — a different code and a different domain
     prefix — so a copy edit to either message cannot collapse one into the other. */
  expect(declarationDomain.split(':')[0]).not.toBe(ruleDomain.split(':')[0]);
  expect(await page.locator('#power-property [data-rl-value]').count()).toBe(0);
  await expect(page.locator('#power-property')).not.toContainText('$0');
});

/* TP-01-19. */
test('Regression: SCN-023-002 the exemption and the cap are applied at their declared points with reachable citations', async ({ page }) => {
  const reliefSite = await startStaticServer({
    overrides: servingFixtureRegimes('prior-assessed-value-cap', 'acquisition-value-cap')
  });
  try {
    await openLifetimeTax(page, reliefSite);
    await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
    await openPower(page);
    await declareProperty(page, {
      jurisdiction: 'state:FL', assessedValue: 400000, priorAssessedValue: 300000,
      acquisitionValue: 200000, localCombinedRate: '0.02', exemptionElections: 'fixture-exemption'
    });

    /* Every declared figure is labelled the household's own input and carries no citation. */
    const declarationRows = page.locator('#propertyDeclarationsBody tr');
    await expect(declarationRows).toHaveCount(5);
    const declaredOrigins = await page.locator('#propertyDeclarationsBody td[data-rl-origin]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-rl-origin')));
    expect(declaredOrigins).toEqual(['declared', 'declared', 'declared', 'declared', 'declared']);
    expect(await page.locator('#propertyDeclarationsBody td[data-rl-origin="sourced"]').count()).toBe(0);
    await expect(page.locator('#propertyDeclarationsBody')).toContainText('your own input');

    /* The cap is applied at the assessed value, against the basis the regime declares. */
    const capRow = page.locator('#propertyReliefBody tr').filter({ hasText: 'assessment-cap' }).first();
    await expect(capRow).toContainText('assessed-value');
    await expect(capRow).toContainText('$400,000');
    await expect(capRow).toContainText('$309,000');
    await expect(capRow).toContainText('yes');

    /* The exemption is applied next, at the assessed value, and reduces the taxable basis. */
    const exemptionRow = page.locator('#propertyReliefBody tr').filter({ hasText: 'exemptions' }).first();
    await expect(exemptionRow).toContainText('$309,000');
    await expect(exemptionRow).toContainText('$284,000');

    /* Every sourced row carries a citation with the locator it was transcribed from, and the
       citation cell is labelled sourced rather than declared. */
    const citationCells = page.locator('#propertyReliefBody td[data-rl-origin="sourced"]');
    expect(await citationCells.count()).toBeGreaterThan(0);
    const citations = await citationCells.evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
    citations.forEach((citation) => {
      expect(citation.length).toBeGreaterThan(20);
      expect(citation).toContain('fixture clause');
    });

    /* The settled figure is the taxable basis at the declared local rate and nothing else. */
    await expect(page.locator('[data-rl-value="propertyTax"]')).toHaveText('$5,680');
    await expect(page.locator('#propertyCapBasisLine')).toContainText('prior-assessed-value');
  } finally {
    await reliefSite.close();
  }
});

/* TP-01-20. */
test('Regression: SCN-023-003 an acquisition-value cap basis produces a different taxable basis and the rate ceiling is a ceiling', async ({ page }) => {
  const basisSite = await startStaticServer({
    overrides: servingFixtureRegimes('acquisition-value-cap', 'rate-ceiling')
  });
  try {
    await openLifetimeTax(page, basisSite);
    await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
    await openPower(page);

    /* One declared acquisition value far below the declared current assessed value. Under an
       acquisition-value cap basis the taxable basis follows the ACQUISITION value, so the current
       assessed value never becomes the base. */
    await declareProperty(page, {
      jurisdiction: 'state:FL', assessedValue: 400000, priorAssessedValue: 300000,
      acquisitionValue: 200000, localCombinedRate: '0.02', exemptionElections: 'fixture-exemption'
    });
    await expect(page.locator('#propertyCapBasisLine')).toContainText('acquisition-value');
    const capRow = page.locator('#propertyReliefBody tr').filter({ hasText: 'assessment-cap' }).first();
    await expect(capRow).toContainText('$206,000');
    await expect(capRow).not.toContainText('$309,000');
    await expect(page.locator('[data-rl-value="propertyTax"]')).toHaveText('$3,620');

    /* The same declarations under a prior-assessed-value basis settle a different figure, which is
       what makes the basis a real branch rather than a label. That figure is pinned exactly in the
       repository suite; here it is enough that this one is not it. */
    await expect(page.locator('[data-rl-value="propertyTax"]')).not.toHaveText('$5,680');

    /* A declared rate ABOVE the regime's ceiling is reduced to the ceiling, and the panel says so.
       The second fixture regime carries the ceiling and no exemption. */
    await declareProperty(page, {
      jurisdiction: 'state:CA', assessedValue: 400000, priorAssessedValue: 300000,
      acquisitionValue: 200000, localCombinedRate: '0.02', exemptionElections: ''
    });
    await expect(page.locator('#propertyRateCeilingLine')).toContainText('exceeds');
    await expect(page.locator('#propertyRateCeilingLine')).toContainText('ceiling bound it');
    /* The ceiling BOUND the rate; it did not become the tax. $206,000 at one percent is $2,060,
       and the declared two percent would have produced $4,120. */
    await expect(page.locator('[data-rl-value="propertyTax"]')).toHaveText('$2,060');
    await expect(page.locator('[data-rl-value="propertyTax"]')).not.toHaveText('$4,120');

    /* A declared rate BELOW the ceiling is used unchanged and the panel states that fact rather
       than passing silently — an implementation using the ceiling as the rate fails here. */
    await declareProperty(page, {
      jurisdiction: 'state:CA', assessedValue: 400000, priorAssessedValue: 300000,
      acquisitionValue: 200000, localCombinedRate: '0.005', exemptionElections: ''
    });
    await expect(page.locator('#propertyRateCeilingLine')).toContainText('below');
    await expect(page.locator('#propertyRateCeilingLine')).toContainText('used unchanged');
    await expect(page.locator('[data-rl-value="propertyTax"]')).toHaveText('$1,030');
    await expect(page.locator('[data-rl-value="propertyTax"]')).not.toHaveText('$2,060');
  } finally {
    await basisSite.close();
  }
});

/* TP-01-21. */
test('Regression: SCN-023-002 the property leg reaches the headline, the comparison, the curve and the export', async ({ page }) => {
  const legSite = await startStaticServer({
    overrides: servingFixtureRegimes('prior-assessed-value-cap', 'acquisition-value-cap')
  });
  try {
    await openLifetimeTax(page, legSite);
    /* The all-non-zero leg fixture. Every federal leg settles a DISTINCT non-zero figure and the
       property leg settles a fifth, so omitting any one of them changes the headline by an amount
       unique to that leg. A zero leg passes an addition check whether or not it was added, which
       is exactly how a dropped leg hides, so the fixture is what makes the identity below
       consequential rather than decorative. */
    await declareOrdinaryHousehold(page, {
      ordinary: 300000, longTermCapitalGain: 120000, otherNetInvestmentIncome: 5000,
      medicareWageBasis: 400000, bracketId: 'b3'
    });
    await declareProperty(page, {
      jurisdiction: 'state:FL', assessedValue: 400000, priorAssessedValue: 300000,
      acquisitionValue: 200000, localCombinedRate: '0.02', exemptionElections: 'fixture-exemption'
    });
    await openPower(page);

    /* The settled record's own declared leg set. Every surface below is read against THIS, in both
       directions, rather than against a total: a leg whose figure is zero balances an addition
       check whether or not it was added, which is how a dropped leg hides. */
    const record = splitAttribute(await page.locator('body').getAttribute('data-rl-legs-record'));
    expect(record.length).toBeGreaterThan(1);
    expect(record).toContain('property-tax');

    /* The fixture this identity is asserted against carries no zero leg and no repeated figure, so
       omitting any one leg changes the headline by an amount unique to that leg. */
    const legAmounts = await page.locator('#legCompositionBody tr[data-rl-leg] [data-rl-value]')
      .evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
    expect(legAmounts.length).toBe(record.length);
    expect(new Set(legAmounts).size).toBe(legAmounts.length);
    legAmounts.forEach((amount) => expect(amount).not.toBe('$0'));

    /* Surface one: the headline. The federal figure declares the legs it summed and the property
       leg carries its own figure beside it, because it is not part of that total. */
    const headlineSummed = splitAttribute(
      await page.locator('#headlineBlock [data-rl-legs]').getAttribute('data-rl-legs'));
    const headlineOwn = await legSetOf(page, '#headlineBlock [data-rl-leg]');
    const headline = headlineSummed.concat(headlineOwn).sort();
    await expect(page.locator('#headlineBlock [data-rl-value="propertyTax"]')).toHaveText('$5,680');

    /* Surfaces two and three: the comparison table and the curve's leg contributors. */
    const comparison = await legSetOf(page, '#legCompositionBody tr[data-rl-leg]');
    const curve = await legSetOf(page, '#curveLegContributorsBody tr[data-rl-leg]');
    await expect(page.locator('#curveLegContributorsBody tr[data-rl-leg="property-tax"]'))
      .toContainText('an added dollar of income cannot move it');

    /* Surface four: the export. The written file records the leg identities the settlement
       declared, so the export cannot silently carry fewer legs than the record. */
    await page.locator('#exportAcknowledgement').check();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#exportPrivateFile').click()
    ]);
    const written = JSON.parse(readFileSync(await download.path(), 'utf8'));
    const exported = written.settledLegs.slice().sort();
    const exportedAttribute = splitAttribute(
      await page.locator('#privacyResult').getAttribute('data-rl-export-legs')).sort();

    /* Two-directional set identity against every one of the four surfaces. A leg in the record and
       missing from a surface fails; a leg on a surface and missing from the record fails too. */
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
      expect(rendered.length).toBe(sortedRecord.length);
    });
  } finally {
    await legSite.close();
  }
});

/* TP-01-22. */
test('Regression: SCN-023-001 the request ledger does not grow after first paint, every entry is a declared same-origin read, and no property declaration reaches a URL', async ({ page }) => {
  const ledger = collectRequests(page);
  const consoleMessages = collectConsole(page);
  await openLifetimeTax(page, site);
  const afterFirstPaint = ledger.length;
  expect(afterFirstPaint).toBeGreaterThan(0);

  /* Distinctive household figures. Each one legitimately appears in the DOM and in this tool's own
     local-storage namespace. Each must appear nowhere else at all. */
  const assessedSentinel = '407311';
  const acquisitionSentinel = '203119';
  await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
  await declareProperty(page, {
    jurisdiction: 'state:FL', assessedValue: assessedSentinel, priorAssessedValue: 300000,
    acquisitionValue: acquisitionSentinel, localCombinedRate: '0.02',
    exemptionElections: 'homestead-first-tier'
  });
  await openPower(page);

  /* Not one request was issued after first paint: not by the property settlement, not by the
     regime resolution, and not by the view switch. Two regime packs are now read from disk, and
     both were read before first paint. */
  expect(ledger.length).toBe(afterFirstPaint);

  /* Every request the route did make is one the route itself declares. */
  const permitted = declaredRouteAssets();
  const paths = ledger.map((entry) => new URL(entry.url).pathname);
  paths.forEach((path) => expect(permitted).toContain(path));
  expect(paths).toContain('/' + FL_REGIME_PATH);
  expect(paths).toContain('/' + CA_REGIME_PATH);
  /* SUP-024-09. The benefit pack Feature 024 Scope 01 adds is read from disk before first paint
     exactly as the two regime packs are, and it is permitted because the configuration declares
     it — not because this list was edited to let it through. */
  expect(permitted).toContain('/' + BENEFIT_PACK_PATH);
  expect(paths).toContain('/' + BENEFIT_PACK_PATH);

  /* No household declaration reaches any URL, any request body or any console message. */
  const sentinels = [assessedSentinel, acquisitionSentinel, 'state%3AFL', 'state:FL'];
  ledger.forEach((entry) => {
    sentinels.forEach((sentinel) => {
      expect(entry.url).not.toContain(sentinel);
      expect(entry.postData).not.toContain(sentinel);
    });
    expect(entry.method).toBe('GET');
  });
  consoleMessages.forEach((message) => {
    sentinels.forEach((sentinel) => expect(message).not.toContain(sentinel));
  });

  /* Not in the address bar either — no query string, no hash carrying a declaration. */
  const address = page.url();
  sentinels.forEach((sentinel) => expect(address).not.toContain(sentinel));
  expect(new URL(address).search).toBe('');

  /* The declarations really are present in the page, so the scans above ran against a live
     household rather than against an empty one. The shipped Florida regime ships its effective
     cap unretrieved, so the leg refuses here and the refusal is what the panel carries. */
  await expect(page.locator('#power-property')).toBeVisible();
  expect(await page.locator('#propertyRefusal [data-rl-unavailable]').count()).toBe(1);
  await expect(page.locator('#inputPropertyAssessedValue')).toHaveValue(assessedSentinel);
});
