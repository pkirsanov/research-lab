import { expect, test } from './playwright-runtime.mjs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './provider-credentials.support.mjs';
import { declareOrdinaryHousehold, openLifetimeTax, openPower } from './lifetime-tax.support.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_PATH = 'lifetime-tax-strategy.config.json';
const PACK_PATH = 'tax-rules/federal/2026.json';
const federalPack = JSON.parse(readFileSync(join(ROOT, PACK_PATH), 'utf8'));

/* The contributor set the PACK declares: every unsupported feature it says moves a marginal
   rate. Read off the pack rather than spelled, so a feature that becomes computable leaves this
   set by itself and a feature the pack adds joins it. */
const packContributorDomains = () => federalPack.unsupportedFeatures
  .filter((feature) => feature.movesMarginalRate === true)
  .map((feature) => 'marginal-contributor:' + feature.id);

const labelOf = (featureId) => {
  const feature = federalPack.supportedFeatures.find((entry) => entry.id === featureId);
  expect(feature).toBeTruthy();
  return feature.label;
};

/* An absent-preferential-table pack this file controls, so the gain-curve refusal rule keeps
   being proven after every shipped status resolves (ASC-7). */
const ABSENT_TABLE_DIGEST = 'sha256:' + '0'.repeat(63) + '2';
const absentPreferentialTableOverrides = () => {
  const pack = JSON.parse(readFileSync(join(ROOT, PACK_PATH), 'utf8'));
  Object.keys(pack.preferentialRateTables).forEach((status) => {
    pack.preferentialRateTables[status] = {
      contractVersion: 'AbsentFigure/v1',
      code: 'RLTAX-THRESHOLD-UNAVAILABLE',
      domain: 'preferential-rate-table:' + status,
      reason: 'This fixture pack deliberately carries no preferential rate table.',
      whatWouldMakeItAvailable: 'Retrieve the authority stating the full preferential schedule for this filing status and the declared tax year.',
      missingSource: {
        title: 'Absent-preferential-table fixture pointer',
        url: 'https://www.irs.gov/irb/2025-45_IRB',
        documentKind: 'revenue-procedure',
        locator: 'Deliberately unretrieved so the gain-curve refusal branch is never vacuous.'
      }
    };
  });
  pack.contentSha256 = ABSENT_TABLE_DIGEST;
  const config = JSON.parse(readFileSync(join(ROOT, CONFIG_PATH), 'utf8'));
  config.rules.packContentSha256 = ABSENT_TABLE_DIGEST;
  return { [PACK_PATH]: JSON.stringify(pack), [CONFIG_PATH]: JSON.stringify(config) };
};

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

async function openCurve(page) {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 90000, bracketId: 'b3', fundingSource: 'outside-funds' });
  await openPower(page);
  await expect(page.locator('#curveChart')).toHaveAttribute('data-rl-curve-drawn', 'true');
}

/* Every text-equivalent row, read out of the DOM rather than recomputed by the test. */
async function curveRows(page) {
  return page.evaluate(() => Array.from(document.querySelectorAll('#curveTextEquivalentBody tr'))
    .map((row) => Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent)));
}

test('Regression: SCN-021-007 the next dollar is priced as a curve with named thresholds', async ({ page }) => {
  await openCurve(page);
  const rows = await curveRows(page);

  /* A curve, not a rate: many ordered points, each pricing the next dollar at its own level. */
  expect(rows.length).toBeGreaterThan(50);
  const levels = rows.map((row) => Number(row[0].replace(/[$,]/g, '')));
  expect(levels.every((level, index) => index === 0 || level > levels[index - 1])).toBe(true);
  const rates = new Set(rows.map((row) => row[2]));
  expect(rates.size).toBeGreaterThan(1);

  /* Every segment whose rate moved names its thresholds, and each carries a rule-pack source. */
  const attributed = rows.filter((row) => row[6] !== 'no threshold crossed' && row[6] !== '');
  expect(attributed.length).toBeGreaterThanOrEqual(6);
  attributed.forEach((row) => {
    expect(row[6]).toContain('(rp-2025-32 · section 4.');
  });
  expect(attributed.some((row) => row[6].includes('ordinary-2026-single lower edge of band b3'))).toBe(true);
  expect(attributed.some((row) => row[6].includes('applied standard deduction threshold'))).toBe(true);

  /* Marginal, statutory and average are three separately labelled quantities and the page never
     offers one in place of another. */
  await expect(page.locator('#curveTextEquivalent thead')).toContainText('Effective marginal rate on the next dollar');
  await expect(page.locator('#curveTextEquivalent thead')).toContainText('Statutory bracket rate');
  await expect(page.locator('#averageRateLine')).toContainText('Average federal rate across all income');
  await expect(page.locator('#marginalVersusAverage')).toContainText('effective marginal rate on the next dollar');
  await expect(page.locator('#marginalVersusAverage')).toContainText('statutory bracket rate');
  await expect(page.locator('#marginalVersusAverage')).toContainText('average federal rate across all income');

  /* The chart is a rendering of the same rows, and the table is reachable without it. */
  await expect(page.locator('#curveChart')).toHaveAttribute('aria-label', /effective marginal rate curve/i);
  await expect(page.locator('#curveChartFallback')).toBeVisible();
  const belowDeduction = rows.find((row) => row[0] === '$10,000');
  expect(belowDeduction[2]).toBe('0.00%');
  expect(belowDeduction[3]).toBe('10.00%');
});

test('Regression: SCN-021-008 a cliff renders as a step and is never smoothed', async ({ page }) => {
  await openCurve(page);
  const rows = await curveRows(page);
  const levelOf = (row) => Number(row[0].replace(/[$,]/g, ''));

  /* The first ordinary band edge sits at $12,400 of taxable income, which is $28,500 of declared
     income once the $16,100 standard deduction is applied. The pair brackets it exactly. */
  const stepIndex = rows.findIndex((row) => levelOf(row) === 28500);
  expect(stepIndex).toBeGreaterThan(0);
  const below = rows[stepIndex - 1];
  const at = rows[stepIndex];
  expect(levelOf(at) - levelOf(below)).toBe(1);
  expect(below[2]).not.toBe(at[2]);
  expect(at[5]).toContain('step');
  expect(at[6]).toContain('ordinary-2026-single lower edge of band b2');

  /* Nothing is synthesized between the two sides of the step. */
  const between = rows.filter((row) => levelOf(row) > levelOf(below) && levelOf(row) < levelOf(at));
  expect(between).toEqual([]);

  /* Every declared band edge inside the sweep gets the same treatment, and so does the applied
     deduction, whose crossing is a real rate move rather than an unexplained one. */
  const stepLevels = rows.filter((row) => row[5] && row[5].includes('step')).map(levelOf);
  expect(stepLevels).toEqual([20000, 28500, 66500, 121800, 217875, 272325]);

  /* A flat run is labelled flat, so a step cannot be confused with an ordinary interval. */
  const flat = rows.filter((row) => row[5] === 'flat');
  expect(flat.length).toBeGreaterThan(50);
});

test('Regression: SCN-021-009 unsupported thresholds are named unavailable contributors and the curve is labeled incomplete', async ({ page }) => {
  await openCurve(page);

  /* The incompleteness is a record member surfaced on the page, with its count. */
  const label = page.locator('[data-rl-curve-incomplete="true"]');
  await expect(label).toBeVisible();
  await expect(label).toContainText('incomplete by construction');

  /* SUP-022-08: supersedes the `Unavailable contributors: 14` text expectation, the
     `toHaveCount(14)` expectation and the presence of `marginal-contributor:net-investment-income-tax`
     in the rendered domain list; shape=derive. Scope 02 makes that surtax a computed leg, so it
     leaves the contributor set. A literal count could only have been re-baselined, and it would
     have passed just as happily if the contributor had been DELETED from the page and computed
     nowhere — which is the regression this replacement exists to make impossible.
     Ledger: specs/022-federal-preferential-and-state-income-tax/spec.md#sup-022-08 */
  const contributors = page.locator('#unavailableContributorList [data-rl-unavailable]');
  const renderedCount = await contributors.count();
  /* The label can never disagree with the list it labels. */
  await expect(label).toContainText('Unavailable contributors: ' + String(renderedCount));
  const domains = await contributors.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-rl-unavailable-domain')));
  /* Two-directional set identity against the pack's own declaration: neither a surfaced
     contributor with no pack entry nor a pack entry with no surfaced contributor can pass, and a
     substitution at constant count cannot hide. */
  const declared = packContributorDomains();
  expect(declared.length).toBeGreaterThan(0);
  domains.forEach((domain) => expect(declared).toContain(domain));
  declared.forEach((domain) => expect(domains).toContain(domain));
  expect(renderedCount).toBe(declared.length);
  /* SUP-024-04: supersedes the browser-side literal
     `['taxable-social-security-benefits', 'irmaa-bands', 'premium-tax-credit'].forEach((id) =>
     expect(domains).toContain('marginal-contributor:' + id))`; shape=derive. FR-024-013 models the
     first member, so a hand-maintained triple must be edited by every feature that models one of
     its members — and that edit is indistinguishable from one hiding a contributor that stopped
     rendering. The not-carried contributor set is now READ from the pack's own movesMarginalRate
     entries and asserted equal in both directions against the rendered domain set, so a member
     this feature models is absorbed by the derivation while a member it does not model is still
     required to be rendered. Scope 04's removal of `irmaa-bands` is then absorbed without a
     further entry, which is the whole point of deriving it.
     Ledger: specs/024-social-security-and-medicare/spec.md#supersession-ledger */
  const notCarriedContributorIds = declared.map((domain) => domain.replace('marginal-contributor:', ''));
  notCarriedContributorIds.forEach((id) => expect(domains).toContain('marginal-contributor:' + id));
  domains.forEach((domain) => expect(notCarriedContributorIds)
    .toContain(domain.replace('marginal-contributor:', '')));
  /* The moved member is proven MOVED rather than culled: absent from the rendered contributor set
     because the pack no longer carries it as not-modelled, and present as the pack's own inclusion
     policy. Deriving the first half from the pack is what absorbs the move; asserting the second
     half is what stops a cull passing as one. */
  expect(notCarriedContributorIds).not.toContain('taxable-social-security-benefits');
  expect(domains).not.toContain('marginal-contributor:taxable-social-security-benefits');
  /* The members this feature does NOT model are still required to render, so the removal is
     proven surgical against the shipped pack rather than against a literal. */
  expect(notCarriedContributorIds).toContain('premium-tax-credit');
  /* And the surtax is proven MOVED rather than deleted: absent from the contributor list, and
     present as a supported feature the pack declares. Its computed figure is asserted below,
     once a household declares a basis that makes it non-zero. */
  expect(domains).not.toContain('marginal-contributor:net-investment-income-tax');
  expect(domains).not.toContain('marginal-contributor:additional-medicare-tax');
  const ledgerRows = await page.locator('#featureLedgerBody tr').evaluateAll((nodes) =>
    nodes.map((node) => Array.from(node.querySelectorAll('td')).map((cell) => cell.textContent.trim())));
  const surtaxRow = ledgerRows.find((row) => row[0] === labelOf('net-investment-income-tax'));
  expect(surtaxRow).toBeTruthy();
  expect(surtaxRow[1]).toBe('supported');
  const medicareRow = ledgerRows.find((row) => row[0] === labelOf('additional-medicare-tax'));
  expect(medicareRow).toBeTruthy();
  expect(medicareRow[1]).toBe('supported');

  /* Each deferred threshold is a focusable refusal carrying its own code, reason and remediation
     rather than a zero contribution, an omission or a footnote outside the curve. */
  await expect(contributors.first()).toContainText('RLTAX-');
  await expect(contributors.first()).toContainText('Unavailable because');
  await expect(contributors.first()).toContainText('What would make it available:');
  const texts = await contributors.evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
  texts.forEach((value) => {
    expect(value.length).toBeGreaterThan(40);
    expect(value).not.toBe('0');
    expect(value).not.toBe('-');
  });

  /* Each one is reachable by keyboard. */
  await contributors.first().focus();
  await expect(contributors.first()).toBeFocused();

  /* SUP-022-13: supersedes the closing expectation that `#gainCurveBlock [data-rl-unavailable]`
     contains `RLTAX-THRESHOLD-UNAVAILABLE`; shape=relocate. Scope 01 makes the long-term gain
     curve computable, so the shipped pack renders it. The refusal is not deleted — it is
     retained verbatim below against a substituted absent-preferential-table pack, which makes it
     permanent instead of incidental to a pack state about to disappear.
     Ledger: specs/022-federal-preferential-and-state-income-tax/spec.md#sup-022-13 */
  expect(await page.locator('#gainCurveBlock [data-rl-unavailable]').count()).toBe(0);
  const gainRows = await page.evaluate(() =>
    Array.from(document.querySelectorAll('#gainCurveTextEquivalentBody tr'))
      .map((row) => Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent)));
  const levelOfRow = (row) => Number(row[0].replace(/[$,]/g, ''));
  expect(gainRows.length).toBeGreaterThan(50);
  const gainLevels = gainRows.map(levelOfRow);
  expect(gainLevels.every((level, index) => index === 0 || level > gainLevels[index - 1])).toBe(true);
  expect(new Set(gainRows.map((row) => row[2])).size).toBeGreaterThan(1);

  /* Every preferential breakpoint the pack carries that the sweep reaches renders as an EXACT
     crossing pair one probe apart, not as a grid position. The declared-gain level of a
     breakpoint is the breakpoint less the ordinary taxable income it stacks on, both read from
     the pack. A curve that dropped the preferential leg would step nowhere near here. */
  const sweep = JSON.parse(readFileSync(join(ROOT, CONFIG_PATH), 'utf8')).sweep;
  const stackedOn = 90000 - federalPack.standardDeductions.single.amount;
  const carriedBreakpoints = federalPack.preferentialRateTables.single.bands
    .map((band) => band.upperExclusive)
    .filter((edge) => edge !== null)
    .map((edge) => edge - stackedOn)
    .filter((level) => level > sweep.start && level <= sweep.end);
  expect(carriedBreakpoints.length).toBeGreaterThan(0);
  carriedBreakpoints.forEach((level) => {
    const atIndex = gainLevels.indexOf(level);
    expect(atIndex).toBeGreaterThan(0);
    expect(gainLevels[atIndex - 1]).toBe(level - sweep.probe);
    expect(gainRows[atIndex][2]).not.toBe(gainRows[atIndex - 1][2]);
    expect(gainRows[atIndex][5]).toContain('step');
  });

  /* FR-022-005's pooling rule, proven on the rendered route rather than only in the engine: the
     curve's own tax at a sampled gain level is the tax the page settles when that identical
     amount is declared as a qualified dividend instead. The engine carries one preferential
     curve kind, so the dividend twin is read off the route point for point. */
  const sampled = gainRows.find((row) => levelOfRow(row) === carriedBreakpoints[0]);
  const gainTaxAtLevel = Number(sampled[1].replace(/[$,]/g, ''));
  await declareOrdinaryHousehold(page, {
    ordinary: 90000, longTermCapitalGain: carriedBreakpoints[0], bracketId: 'b3', fundingSource: 'outside-funds'
  });
  const headline = page.locator('[data-rl-value="headlineFederalTax"]');
  await expect(headline).toHaveText('$' + gainTaxAtLevel.toLocaleString('en-US'));
  const gainHeadline = await headline.textContent();
  await page.fill('#inputLongTermCapitalGain', '0');
  await page.fill('#inputQualifiedDividend', String(carriedBreakpoints[0]));
  await expect(page.locator('#truthState')).toHaveText('Settled');
  await expect(headline).toHaveText(gainHeadline);

  /* The moved-versus-deleted proof completed: with a declared basis the surtax leg computes a
     real, non-zero figure on the page. A contributor that had merely been deleted would render
     nothing here. */
  await page.fill('#inputQualifiedDividend', '0');
  await page.fill('#inputOrdinary', '300000');
  await page.fill('#inputOtherNetInvestmentIncome', '100000');
  await page.fill('#inputMedicareWageBasis', '300000');
  await expect(page.locator('#truthState')).toHaveText('Settled');
  const stageRows = await page.locator('#settlementStagesBody tr').evaluateAll((nodes) =>
    nodes.map((node) => Array.from(node.querySelectorAll('td')).map((cell) => cell.textContent.trim())));
  const surtaxStages = stageRows.filter((row) => row[0] === 'CO-11' || row[0] === 'CO-12');
  expect(surtaxStages.length).toBe(2);
  surtaxStages.forEach((row) => {
    expect(row[1]).not.toContain('RLTAX-');
    expect(row[1]).toMatch(/^\$[0-9,]+$/);
    expect(Number(row[1].replace(/[$,]/g, ''))).toBeGreaterThan(0);
    expect(row[2]).toBe('enacted-current-law');
  });

  /* The retained refusal, verbatim, against the absent-preferential-table pack. Per ASC-7 the
     retained branch is asserted to have been exercised rather than left to an empty set. */
  let retainedBranchExercised = 0;
  const absentTableSite = await startStaticServer({ overrides: absentPreferentialTableOverrides() });
  try {
    await page.goto(`${absentTableSite.baseUrl}/lifetime-tax-strategy-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-rl-tax-state', 'ready', { timeout: 30000 });
    await declareOrdinaryHousehold(page, { ordinary: 90000, bracketId: 'b3', fundingSource: 'outside-funds' });
    await openPower(page);
    await expect(page.locator('#gainCurveBlock [data-rl-unavailable]')).toContainText('RLTAX-THRESHOLD-UNAVAILABLE');
    expect(await page.locator('#gainCurveTextEquivalentBody tr').count()).toBe(0);
    retainedBranchExercised += 1;
  } finally {
    await absentTableSite.close();
  }
  expect(retainedBranchExercised).toBe(1);
});
