import { expect, test } from './playwright-runtime.mjs';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './provider-credentials.support.mjs';
import { declareOrdinaryHousehold, openLifetimeTax, openPower } from './lifetime-tax.support.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const conversionRequire = createRequire(import.meta.url);

/* SUP-023-02 and SUP-023-03. The not-modeled ledger's promise is that everything the comparison
   declines to model is disclosed, so the expectation belongs to the declaration rather than to a
   hand-counted eight. Deriving the entry set from the module the page actually renders means an
   entry added or retired by a later scope moves the expectation with it, while an entry that is
   rendered without being declared — or declared without being rendered — still fails, in both
   directions, which a literal count could never detect.
   Ledger: specs/023-property-tax-and-rental-income/spec.md#supersession-ledger. */
const declaredNotModeled = () => conversionRequire(join(ROOT, 'rltaxstrategy.js')).conversionNotModeled();

/* The federal pack is read here for the positive half of SUP-023-02: FR-023-013 removes the state
   and local tax entry from the not-modeled ledger, and a removal is only honest if the id is
   proven to have MOVED into a modelled component rather than to have quietly vanished. */
const federalPack = JSON.parse(readFileSync(join(ROOT, 'tax-rules/federal/2026.json'), 'utf8'));
const saltCappedComponentIds = () =>
  federalPack.deductionCaps['state-and-local-tax'].cappedComponentIds;

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

const FORBIDDEN_CLAIMS = ['probability', 'success rate', 'break-even', 'break even', 'track record',
  'accuracy', 'error rate', 'lifetime total', 'rank ', 'we recommend', 'recommended'];

test('Regression: SCN-021-010 two conversion policies are compared and the fill amount comes from the pack', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, {
    deductionMode: 'itemized', itemizedAmount: 0, ordinary: 60000,
    bracketId: 'b3', fundingSource: 'outside-funds'
  });

  /* The fill amount is the distance from ordinary taxable income to the pack's own b3 edge. */
  await expect(page.locator('[data-rl-value="conversionAmount"]')).toHaveText('$45,700');
  await expect(page.locator('[data-rl-value="federalTaxDifference"]')).toContainText('$');
  await expect(page.locator('[data-rl-value="effectiveMarginalRateAtEdge"]')).toContainText('24.00%');
  await expect(page.locator('[data-rl-value="effectiveMarginalRateAtEdge"]')).toContainText('incomplete');

  await openPower(page);
  const policies = page.locator('#policyComparisonBody tr');
  await expect(policies).toHaveCount(2);
  await expect(policies.nth(0)).toContainText('no-conversion');
  await expect(policies.nth(0)).toContainText('$60,000');
  await expect(policies.nth(1)).toContainText('fill-to-bracket');
  await expect(policies.nth(1)).toContainText('$105,700');
  await expect(page.locator('#heldConstantLine')).toContainText('packContentSha256');
  await expect(page.locator('#heldConstantLine')).toContainText('longTermCapitalGain');

  /* Selecting a different band from the SAME pack moves the amount, because the amount is the
     pack's edge rather than a constant of the tool's own. A band the household is already past
     is a labelled zero, not a refusal and not a negative amount. */
  await page.selectOption('#inputBracket', 'b2');
  await expect(page.locator('[data-rl-value="conversionAmount"]'))
    .toHaveText('$0 (the selected bracket is already full)');
  await page.selectOption('#inputBracket', 'b4');
  await expect(page.locator('[data-rl-value="conversionAmount"]')).toHaveText('$141,775');

  /* The unbounded top band declares no finite edge and is refused rather than guessed. */
  await page.selectOption('#inputBracket', 'b7');
  await expect(page.locator('#conversionOutcomeCard [data-rl-unavailable]').first()).toContainText('RLTAX-INPUT-INCOMPLETE');
  await expect(page.locator('#conversionOutcomeCard [data-rl-unavailable]').first()).toContainText('unbounded above');
});

test('Regression: SCN-021-011 the conversion comparison discloses everything it did not model', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, {
    deductionMode: 'itemized', itemizedAmount: 0, ordinary: 60000, bracketId: 'b3', fundingSource: 'withheld'
  });

  /* SUP-023-02: supersedes `#notModeledSummary li` `toHaveCount(8)` together with the
     `'State and local income tax'` label expectation; shape=derive.
     Cause: FR-023-013 moves that id out of the federal pack's `unsupportedFeatures[]` and into a
     named component of the itemized composition, so a clause pinning eight rows and demanding that
     label is pinning a fact that is no longer the fact. Traded for: a count derived from the
     declared entry set, two-directional id and label identity between that set and the rendered
     rows, and a POSITIVE assertion that the removed id now names the capped component family the
     pack's own cap declares. Strictly stronger because a deletion with nothing modelled in its
     place fails the positive half, and a substitution at constant count fails set identity — both
     of which the literal passed blind.
     Ledger: specs/023-property-tax-and-rental-income/spec.md#supersession-ledger. */
  const declared = declaredNotModeled();
  const summary = page.locator('#notModeledSummary li');
  await expect(summary).toHaveCount(declared.length);

  const summaryIds = await summary.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-rl-notmodeled')));
  const summaryText = await summary.evaluateAll((nodes) => nodes.map((node) => node.textContent));
  declared.forEach((entry) => {
    expect(summaryIds).toContain(entry.id);
    expect(summaryText.some((line) => line.includes(entry.label))).toBe(true);
  });
  summaryIds.forEach((id) => expect(declared.map((entry) => entry.id)).toContain(id));
  summaryText.forEach((entry) => expect(entry).toMatch(/RLTAX-[A-Z-]+$/));

  /* The positive half. FR-023-013 removes `'state-and-local-tax'` from the FEDERAL PACK's
     unsupported set, and a removal is only honest if the id is proven to have MOVED: it is absent
     from that set AND present as the capped component family the pack's own cap declares. The
     conversion ledger's separate `state-tax` entry is a different declaration, owned by a module
     this scope excludes, and it is asserted above by the derived identity rather than here. */
  expect(federalPack.unsupportedFeatures.map((entry) => entry.id)).not.toContain('state-and-local-tax');
  expect(saltCappedComponentIds()).toContain('state-income-tax');
  expect(saltCappedComponentIds()).toContain('property-tax');

  /* Adversarial: the derivation must be a real set, not a degenerate one that admits anything.
     An id the page never declared must not appear, and the declared set must be non-empty — so a
     derivation collapsing to zero rows cannot pass the identity by vacuous truth. */
  expect(declared.length).toBeGreaterThan(0);
  expect(summaryIds).not.toContain('an-entry-this-tool-never-declared');

  /* Power carries the same declared set with their reasons and their deferral codes. */
  await openPower(page);
  const detail = page.locator('#notModeledDetailBody tr');
  await expect(detail).toHaveCount(declared.length);

  /* SUP-023-03: supersedes `#notModeledDetailBody tr` `toHaveCount(8)` and the positional
     `detail.nth(0)` / `detail.nth(3)` code expectations; shape=derive.
     Cause: the same removal shortens the list and shifts every ordinal after the removed row, so
     `nth(0)` and `nth(3)` now address different entries than the clause intended. Traded for: the
     same derived count plus selection by declared entry id, with each row's code compared against
     the code that entry declares. Strictly stronger because a reordering of the ledger leaves the
     ordinal clause green while silently changing which entry it checked, and the id-addressed
     clause follows the entry instead.
     Ledger: specs/023-property-tax-and-rental-income/spec.md#supersession-ledger. */
  for (const entry of declared) {
    const row = page.locator(`#notModeledDetailBody tr[data-rl-notmodeled="${entry.id}"]`);
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(entry.label);
    await expect(row).toContainText(entry.deferralCode);
  }

  /* Adversarial: an id that is not declared addresses no row, so the id selector is proven to
     discriminate rather than to match whatever it is handed. */
  await expect(page.locator('#notModeledDetailBody tr[data-rl-notmodeled="state-and-local-tax"]'))
    .toHaveCount(0);

  const reasons = await detail.evaluateAll((rows) => rows.map((row) => row.querySelectorAll('td')[1].textContent));
  reasons.forEach((reason) => expect(reason.length).toBeGreaterThan(40));

  /* The result is stated as a single-year difference and explicitly not a recommendation. */
  await expect(page.locator('#resultKindLine')).toContainText('single-year federal tax difference');
  await expect(page.locator('#resultKindLine')).toContainText('isRecommendation is false');
  await expect(page.locator('#resultKindLine')).toContainText('not a ranking');
});

test('Regression: SCN-021-012 the comparison emits a single year federal difference and no probability or ranking', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, {
    deductionMode: 'itemized', itemizedAmount: 0, ordinary: 60000, bracketId: 'b3', fundingSource: 'outside-funds'
  });
  await openPower(page);

  const surface = (await page.locator('body').textContent()).toLowerCase();
  FORBIDDEN_CLAIMS.forEach((token) => expect(surface).not.toContain(token));
  await expect(page.locator('[data-rl-value="resultKind"]')).toHaveText('single-year federal tax difference');

  /* Declared outside-funds and declared withheld are distinguishable. */
  await expect(page.locator('#fundingSourceLine')).toContainText('outside-funds');
  await page.selectOption('#inputFundingSource', 'withheld');
  await expect(page.locator('#fundingSourceLine')).toContainText('withheld');

  /* An undeclared funding source is an explicit Unavailable naming what would make it available,
     rather than a silently assumed source. */
  await page.selectOption('#inputFundingSource', '');
  await expect(page.locator('#fundingSourceLine')).toContainText('RLTAX-INPUT-INCOMPLETE');
  await expect(page.locator('#fundingSourceLine')).toContainText('declare outside-funds or withheld');
  const undeclaredRow = page.locator('#unavailableDomainList [data-rl-unavailable-domain="conversion:fundingSource"]');
  await expect(undeclaredRow).toBeVisible();
  await undeclaredRow.focus();
  await expect(undeclaredRow).toBeFocused();
});
