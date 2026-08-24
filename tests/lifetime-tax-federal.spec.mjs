import { expect, test } from './playwright-runtime.mjs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './provider-credentials.support.mjs';
import { declareOrdinaryHousehold, openLifetimeTax, openPower } from './lifetime-tax.support.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const federalPack = JSON.parse(readFileSync(join(ROOT, 'tax-rules/federal/2026.json'), 'utf8'));

/* The preferential tax the PACK's own table implies for a gain stacked on top of ordinary
   taxable income. Derived from the pack rather than spelled, so a breakpoint that moves in the
   pack moves this expectation with it instead of rotting into a false green. */
const packPreferentialTax = (ordinaryTaxable, preferential) => {
  const bands = federalPack.preferentialRateTables.single.bands;
  let tax = 0;
  bands.forEach((band) => {
    const bandTop = band.upperExclusive === null ? Number.MAX_SAFE_INTEGER : band.upperExclusive;
    const from = Math.max(band.lowerInclusive, ordinaryTaxable);
    const to = Math.min(bandTop, ordinaryTaxable + preferential);
    if (to > from) tax += (to - from) * band.rate;
  });
  return tax;
};

/* The SAME pack table priced WITHOUT the stacking floor: the window still ends at the top of the
   household's preferential income, but each band is filled from its own bottom edge rather than
   from the top of ordinary income. This models the defect the floor exists to prevent, and it is
   used for one purpose only — to prove a stacking fixture is one where the two pricings actually
   differ. A fixture on which they agree cannot fail when the floor is removed, however plainly it
   is named for stacking. */
const isolatedPreferentialTax = (ordinaryTaxable, preferential) => {
  const bands = federalPack.preferentialRateTables.single.bands;
  let tax = 0;
  bands.forEach((band) => {
    const bandTop = band.upperExclusive === null ? Number.MAX_SAFE_INTEGER : band.upperExclusive;
    const to = Math.min(bandTop, ordinaryTaxable + preferential);
    if (to > band.lowerInclusive) tax += (to - band.lowerInclusive) * band.rate;
  });
  return tax;
};

const asNumber = (text) => Number(text.replace(/[$,]/g, ''));

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* Rev. Proc. 2025-32 section 4.01, single: $5,800 plus 22% of the excess over $50,400.
   The route is asserted against the authority's own cumulative statement, not against itself. */
const knownSingleOrdinaryTax = (taxable) => {
  const rows = [
    { threshold: 0, base: 0, rate: 0.10 }, { threshold: 12400, base: 1240, rate: 0.12 },
    { threshold: 50400, base: 5800, rate: 0.22 }, { threshold: 105700, base: 17966, rate: 0.24 },
    { threshold: 201775, base: 41024, rate: 0.32 }, { threshold: 256225, base: 58448, rate: 0.35 },
    { threshold: 640600, base: 192979.25, rate: 0.37 }
  ];
  let chosen = rows[0];
  rows.forEach((row) => { if (taxable >= row.threshold) chosen = row; });
  return chosen.base + chosen.rate * (taxable - chosen.threshold);
};

const dollars = (value) => '$' + Math.round(value).toLocaleString('en-US');

test('Regression: SCN-021-004 federal tax is exact below at and above a bracket edge', async ({ page }) => {
  await openLifetimeTax(page, site);

  /* An itemised deduction of zero makes the declared ordinary income equal taxable income, so the
     edge under test is the pack's own band edge rather than the deduction. */
  const edge = 105700;
  const cases = [edge - 1, edge, edge + 1];
  let index = 0;
  for (index = 0; index < cases.length; index += 1) {
    await declareOrdinaryHousehold(page, {
      deductionMode: 'itemized', itemizedAmount: 0, ordinary: cases[index], bracketId: 'b5'
    });
    await expect(page.locator('[data-rl-value="headlineFederalTax"]'))
      .toHaveText(dollars(knownSingleOrdinaryTax(cases[index])));
  }

  /* Repeating the identical entry produces the identical figure. */
  const first = await page.locator('[data-rl-value="headlineFederalTax"]').textContent();
  await page.fill('#inputOrdinary', '1');
  await page.fill('#inputOrdinary', String(edge + 1));
  await expect(page.locator('[data-rl-value="headlineFederalTax"]')).toHaveText(first);

  await openPower(page);
  const atEdgeRow = page.locator('#bracketDetailBody tr').nth(3);
  await expect(atEdgeRow).toContainText('b4');
  await expect(atEdgeRow).toContainText('24.00%');
  await expect(page.locator('#settlementStagesBody')).toContainText('enacted-current-law');
});

test('Regression: SCN-021-005 long term gains stack on ordinary income', async ({ page }) => {
  await openLifetimeTax(page, site);

  /* SUP-022-07: supersedes the refusal expectations for the gain household and the dividend
     household and the zero-valued-headline clause; shape=derive. The pack now carries the
     preferential rate table, so the scenario asserts the STACKING it was always named for: the
     headline equals the ordinary tax plus the preferential tax the pack's own table implies for
     a gain stacked on top of ordinary taxable income. No branch retains the superseded refusal
     expectations, which is why the shape is a derive and not a partition.
     Superseded clause in evaluable form: `isAbsentFigure(preferentialRateTables.single) === true`.
     That single condition is what produced every superseded expectation — a preferential table the
     pack did not carry is what made the gain household and the dividend household refuse and what
     made the headline zero-valued. Stated this way the clause is decidable against the pack as it
     stands rather than only against a page, which is what DoD item 12 clause 2 needs of a derive
     entry. */
  const ordinaryTaxable = 40000;
  const declareGain = async (gain, ordinary) => {
    await declareOrdinaryHousehold(page, {
      deductionMode: 'itemized', itemizedAmount: 0,
      ordinary: ordinary === undefined ? ordinaryTaxable : ordinary,
      longTermCapitalGain: gain, bracketId: 'b3'
    });
    return asNumber(await page.locator('[data-rl-value="headlineFederalTax"]').textContent());
  };

  /* Below the carried zero-rate breakpoint the whole gain is priced at the pack's zero rate, so
     the headline is the ordinary tax alone — a real zero rate, not a dropped leg. */
  const zeroRateEdge = federalPack.preferentialRateTables.single.bands[0].upperExclusive;
  const belowGain = Math.round((zeroRateEdge - ordinaryTaxable) / 2);
  const acrossGain = (zeroRateEdge - ordinaryTaxable) + belowGain;
  expect(belowGain).toBeGreaterThan(0);
  expect(ordinaryTaxable + acrossGain).toBeGreaterThan(zeroRateEdge);

  const belowHeadline = await declareGain(belowGain);
  expect(belowHeadline).toBe(Math.round(knownSingleOrdinaryTax(ordinaryTaxable)
    + packPreferentialTax(ordinaryTaxable, belowGain)));

  /* Raising the gain ACROSS the carried breakpoint moves the headline by exactly the amount the
     pack's table implies, so the test proves the gain stacks rather than that a number appeared.
     A gain priced at the ordinary rate, or at a single flat preferential rate, moves it by a
     different amount and fails here. */
  const acrossHeadline = await declareGain(acrossGain);
  expect(acrossHeadline).toBe(Math.round(knownSingleOrdinaryTax(ordinaryTaxable)
    + packPreferentialTax(ordinaryTaxable, acrossGain)));
  const impliedMove = packPreferentialTax(ordinaryTaxable, acrossGain)
    - packPreferentialTax(ordinaryTaxable, belowGain);
  expect(acrossHeadline - belowHeadline).toBe(Math.round(impliedMove));
  const topBandRate = federalPack.preferentialRateTables.single.bands[1].rate;
  expect(impliedMove).toBeLessThan((acrossGain - belowGain) * topBandRate);

  /* Qualified dividends pool with the gain: the same amount declared either way produces the
     identical headline. */
  await page.fill('#inputLongTermCapitalGain', '0');
  await page.fill('#inputQualifiedDividend', String(acrossGain));
  await expect(page.locator('[data-rl-value="headlineFederalTax"]'))
    .toHaveText(dollars(knownSingleOrdinaryTax(ordinaryTaxable) + packPreferentialTax(ordinaryTaxable, acrossGain)));

  /* Removing the preferential income leaves the ordinary settlement untouched. */
  await page.fill('#inputQualifiedDividend', '0');
  await expect(page.locator('[data-rl-value="headlineFederalTax"]'))
    .toHaveText(dollars(knownSingleOrdinaryTax(ordinaryTaxable)));

  /* F-01-P, the federal half. Every case above places ordinary taxable income BELOW the zero-rate
     top, and there `Math.max(ordinaryTaxableIncome, band.lowerInclusive)` always returns the band
     edge — so the stacking floor never binds and an engine that priced the gain in isolation, from
     the bottom of the schedule rather than from the top of ordinary income, satisfied all of them.
     The sibling preferential row recorded exactly this and added cases inside the fifteen percent
     band; this row, which is the one NAMED for stacking, never received the same correction, so
     removing the floor left it green. These cases place ordinary income ABOVE the zero-rate top,
     where the floor is what decides the answer. */
  const stackedOrdinary = zeroRateEdge + 10000;
  expect(stackedOrdinary).toBeGreaterThan(zeroRateEdge);
  const stackedGains = [belowGain, acrossGain];
  let stackedIndex = 0;
  for (stackedIndex = 0; stackedIndex < stackedGains.length; stackedIndex += 1) {
    const stackedGain = stackedGains[stackedIndex];
    /* Non-vacuity, asserted BEFORE the household is declared: on this fixture the two pricings
       really do disagree, so the headline assertion below is load-bearing rather than a figure
       both a stacking engine and an isolating one would produce. */
    expect(packPreferentialTax(stackedOrdinary, stackedGain))
      .not.toBe(isolatedPreferentialTax(stackedOrdinary, stackedGain));
    const stackedHeadline = await declareGain(stackedGain, stackedOrdinary);
    expect(stackedHeadline).toBe(Math.round(knownSingleOrdinaryTax(stackedOrdinary)
      + packPreferentialTax(stackedOrdinary, stackedGain)));
  }

  await openPower(page);
  /* SUP-022-21: supersedes the clause asserting `#power-rule-ledger` contains the raw member
     name `preferentialRateTables`; shape=derive. Feature 021 satisfied that string only because
     the absent-figure inventory rendered the group name of a table the pack did not carry, so
     Scope 01 resolving all four tables removes the only text that ever made it true. The
     replacement asserts what the clause was standing in for — that the Power panel names the
     preferential schedule as a carried rule with its split authority — instead of an internal
     identifier a reader never sees.
     Ledger: specs/022-federal-preferential-and-state-income-tax/spec.md#sup-022-21 */
  const preferentialFeature = federalPack.supportedFeatures
    .find((feature) => feature.id === 'preferential-rate-schedule');
  expect(preferentialFeature).toBeTruthy();
  const ledgerRows = await page.locator('#featureLedgerBody tr').evaluateAll((nodes) =>
    nodes.map((node) => Array.from(node.querySelectorAll('td')).map((cell) => cell.textContent.trim())));
  const preferentialRow = ledgerRows.find((row) => row[0] === preferentialFeature.label);
  expect(preferentialRow).toBeTruthy();
  expect(preferentialRow[1]).toBe('supported');
  /* The stage that prices it is in the pack's own declared calculation order, and the order the
     ledger renders is that same order. */
  const renderedOrder = await page.locator('#ruleLedgerBody tr')
    .evaluateAll((nodes) => nodes.map((node) =>
      Array.from(node.querySelectorAll('td')).map((cell) => cell.textContent.trim())));
  const orderRow = renderedOrder.find((row) => row[0] === 'calculationOrder');
  expect(orderRow).toBeTruthy();
  expect(orderRow[1]).toBe(federalPack.calculationOrder.join(' \u2192 '));
  /* Split-authority provenance, which is the point Scope 01 exists to make: the breakpoints and
     the top-band rate of this table cite DIFFERENT authorities, and the Power source list
     carries both. */
  const table = federalPack.preferentialRateTables.single;
  const overrideRefs = table.componentSources.map((component) => component.sourceRef);
  expect(overrideRefs.length).toBeGreaterThan(0);
  expect(overrideRefs).not.toContain(table.sourceRef);
  const citedTitles = [table.sourceRef].concat(overrideRefs).map((sourceId) => {
    const record = federalPack.sourceRecords.find((entry) => entry.sourceId === sourceId);
    expect(record).toBeTruthy();
    expect(record.retrievalOutcome).toBe('retrieved');
    expect(record.documentKind).not.toBe('newsroom-release');
    return record.title;
  });
  const renderedSourceTitles = await page.locator('#sourceRecordList a')
    .evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
  citedTitles.forEach((title) => expect(renderedSourceTitles).toContain(title));

  /* Retained, re-pointed at whatever remains absent. Every status resolved in this pack, so the
     inventory must be empty AND must say so with an explicit record rather than a blank region —
     the blank-versus-sourced-empty hole the original count never had to consider. */
  const absentGroups = ['standardDeductions', 'ordinaryRateTables', 'preferentialRateTables'];
  const packAbsent = absentGroups.reduce((total, group) => total
    + Object.keys(federalPack[group]).filter((status) =>
      federalPack[group][status].contractVersion === 'AbsentFigure/v1').length, 0);
  await expect(page.locator('#absentFigureInventory [data-rl-unavailable]')).toHaveCount(packAbsent);
  if (packAbsent === 0) {
    await expect(page.locator('#absentFigureInventory')).not.toBeEmpty();
    await expect(page.locator('#absentFigureInventory')).toContainText('carries every figure');
  } else {
    await expect(page.locator('#absentFigureInventory [data-rl-unavailable]').first()).toContainText('missing source');
  }
});

test('Regression: SCN-021-006 deduction selection is explicit and the annual result reconciles', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 150000, deductionMode: 'standard', bracketId: 'b4' });
  await openPower(page);

  /* CO-2 publishes the applied amount and the mode that produced it. */
  await expect(page.locator('#settlementStagesBody tr').nth(1)).toContainText('$16,100');
  await expect(page.locator('[data-rl-value="headlineFederalTax"]'))
    .toHaveText(dollars(knownSingleOrdinaryTax(150000 - 16100)));

  await page.selectOption('#inputDeductionMode', 'itemized');
  await page.fill('#inputItemizedAmount', '40000');
  await expect(page.locator('[data-rl-value="headlineFederalTax"]'))
    .toHaveText(dollars(knownSingleOrdinaryTax(110000)));

  /* An undeclared mode refuses rather than applying a default. */
  await page.selectOption('#inputDeductionMode', '');
  await expect(page.locator('#truthState')).toHaveText('Incomplete');
  await expect(page.locator('#incompleteStateNotice')).toContainText('deductionMode');

  await page.selectOption('#inputDeductionMode', 'standard');
  await expect(page.locator('#truthState')).toHaveText('Settled');

  /* SUP-022-15: supersedes `toHaveCount(5)` on `#reconciliationBody tr` and the literal-bounded
     `holds` loop; shape=derive. The expected row count is read from the settled record the page
     itself published, and the loop is bounded by the rendered rows, so a row the page adds can
     no longer be skipped in silence. */
  const publishedLegs = (await page.locator('body').getAttribute('data-rl-reconciliation-legs')).split(',');
  expect(publishedLegs.length).toBeGreaterThan(0);
  const legs = page.locator('#reconciliationBody tr');
  await expect(legs).toHaveCount(publishedLegs.length);
  const renderedLegRows = await legs.evaluateAll((nodes) => nodes.map((node) => node.textContent));
  expect(renderedLegRows.length).toBe(publishedLegs.length);
  renderedLegRows.forEach((row) => expect(row).toContain('holds'));
  publishedLegs.forEach((id, position) => expect(renderedLegRows[position]).toContain(id));
  await expect(page.locator('#roundingDisclosure')).toContainText('none, because the pack declares none');
  await expect(page.locator('#roundingDisclosure')).toContainText('nearest-dollar');
});
