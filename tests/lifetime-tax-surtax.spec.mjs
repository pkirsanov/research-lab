import { expect, test } from './playwright-runtime.mjs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './provider-credentials.support.mjs';
import { declareOrdinaryHousehold, openLifetimeTax, openPower } from './lifetime-tax.support.mjs';

/* Feature 022 Scope 02 — the three persistent regression titles named by TP-02-15,
   TP-02-16 and TP-02-17. Those rows named this file and this file did not exist, so all
   three commands resolved to `No tests found` and reported nothing while appearing to be
   planned coverage.

   Every surtax figure asserted here is transcribed from IRS Publication 505 (2026),
   chapter 2, Expected Taxes and Credits — Lines 4–11c, Step 5 item 4 (Additional
   Medicare Tax) and item 5 (Net Investment Income Tax), and is checked against the
   committed `tax-rules/federal/2026.json` before it is used — so a transposed digit in
   either place fails the parity clause rather than cancelling against itself. */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const federalPack = JSON.parse(readFileSync(join(ROOT, 'tax-rules/federal/2026.json'), 'utf8'));

/* Publication 505 (2026) states one rate and one filing-status chart per surtax. The
   qualifying-surviving-spouse row the publication also carries is deliberately absent:
   that filing status is outside this pack's four declared statuses, and the publication
   gives it a DIFFERENT threshold for each surtax, so inventing it here would be the one
   figure most likely to be wrong. */
const KNOWN_SURTAXES = {
  'net-investment-income-tax': {
    rate: 0.038,
    thresholds: {
      'single': 200000,
      'married-filing-jointly': 250000,
      'married-filing-separately': 125000,
      'head-of-household': 200000
    }
  },
  'additional-medicare-tax': {
    rate: 0.009,
    thresholds: {
      'single': 200000,
      'married-filing-jointly': 250000,
      'married-filing-separately': 125000,
      'head-of-household': 200000
    }
  }
};

const asNumber = (text) => Number(text.replace(/[$,]/g, ''));

/* The transcription is checked against the pack once, here, rather than in each test, so
   every later expectation in this file rests on a figure proven to match the committed
   pack rather than on a figure this file asserted about itself. */
const expectTranscriptionMatchesPack = () => {
  const ids = Object.keys(KNOWN_SURTAXES);
  expect(ids.length).toBe(2);
  ids.forEach((setId) => {
    const carried = federalPack.thresholdSets[setId];
    const known = KNOWN_SURTAXES[setId];
    expect(carried.contractVersion).toBe('ThresholdSet/v1');
    expect(carried.rate).toBe(known.rate);
    expect(carried.varyByFilingStatus).toBe(true);
    expect(carried.thresholds).toEqual(known.thresholds);
    /* The declared year is read off the pack's own indexing block. A set that does not
       declare 2026 refuses at resolve time, so a household settling below proves the
       declaration as well as the figure. */
    expect(carried.indexing.declaredFor).toContain(2026);
  });
};

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

test('Regression: SCN-022-004 the investment income surtax computes from a declared basis and refuses without one', async ({ page }) => {
  expectTranscriptionMatchesPack();
  const known = KNOWN_SURTAXES['net-investment-income-tax'];
  await openLifetimeTax(page, site);

  /* A household whose modified adjusted gross income is past the single threshold, with
     the ordinary portion of net investment income declared. The declared portion and the
     amount past the threshold are chosen so the CAP binds — the tax is the rate on net
     investment income rather than on the excess — because the capped direction is the one
     an implementation that forgot the `lesser of` rule gets wrong. */
  const ordinary = 260000;
  const declaredPortion = 12000;
  await declareOrdinaryHousehold(page, {
    filingStatus: 'single', deductionMode: 'itemized', itemizedAmount: 0,
    ordinary, otherNetInvestmentIncome: declaredPortion, medicareWageBasis: 0,
    bracketId: 'b3'
  });

  const modifiedAdjustedGross = ordinary;
  const excess = modifiedAdjustedGross - known.thresholds.single;
  const netInvestmentIncome = declaredPortion;
  expect(netInvestmentIncome).toBeLessThan(excess);
  const expectedTax = known.rate * Math.min(netInvestmentIncome, excess);

  /* The leg reaches Simple as its own decision-level figure rather than only as part of
     a sum, and it carries the figure the publication's own rule implies. */
  const shown = page.locator('[data-rl-value="netInvestmentIncomeSurtax"]');
  await expect(shown).toBeVisible();
  expect(asNumber(await shown.textContent())).toBeCloseTo(expectedTax, 2);

  /* Its rate, its basis, its threshold and its rule status are all on the surface. A
     figure a reader cannot check against the rule that produced it is not checkable. */
  const detail = await page.locator('#surtaxSummaryCard [data-rl-leg="net-investment-income-tax"]').textContent();
  expect(detail).toContain((known.rate * 100).toFixed(2));
  expect(detail).toContain(known.thresholds.single.toLocaleString('en-US'));

  /* The Power ledger publishes the leg inside the declared leg set the total summed. */
  await openPower(page);
  const ledgerRow = page.locator('#taxLegLedgerBody tr[data-rl-tax-leg="net-investment-income-tax"]');
  await expect(ledgerRow).toBeVisible();
  await expect(ledgerRow.locator('[data-rl-tax-leg-available="true"]')).toBeVisible();

  /* The refusal half, on the same route. Clearing the declaration makes the basis
     undeclared — not zero — so the leg refuses BY NAME, the total inherits the refusal,
     and no numeral and no zero stands in its place. */
  await page.locator('#modeSimple').click();
  await page.fill('#inputOtherNetInvestmentIncome', '');
  await page.locator('#inputOtherNetInvestmentIncome').blur();

  const refusal = page.locator('#surtaxSummaryCard [data-rl-unavailable]').first();
  await expect(refusal).toBeVisible();
  await expect(refusal).toHaveAttribute('data-rl-unavailable', 'RLTAX-INPUT-INCOMPLETE');
  const refusalText = await refusal.textContent();
  /* The refusal names the member it wants rather than reporting a generic incompleteness. */
  expect(refusalText).toContain('otherOrdinaryNetInvestmentIncome');
  /* No computed figure stands in for the refused leg. */
  expect(await page.locator('[data-rl-value="netInvestmentIncomeSurtax"]').count()).toBe(0);
  /* And the headline total inherits rather than summing the legs that remain. */
  expect(await page.locator('[data-rl-value="headlineFederalTax"]').count()).toBe(0);
});

test('Regression: SCN-022-005 the additional Medicare surtax uses only its declared wage basis', async ({ page }) => {
  expectTranscriptionMatchesPack();
  const known = KNOWN_SURTAXES['additional-medicare-tax'];
  await openLifetimeTax(page, site);

  const threshold = known.thresholds.single;
  const surtaxAt = async (wageBasis) => {
    await page.fill('#inputMedicareWageBasis', String(wageBasis));
    await page.locator('#inputMedicareWageBasis').blur();
    const node = page.locator('[data-rl-value="additionalMedicareSurtax"]');
    await expect(node).toBeVisible();
    return asNumber(await node.textContent());
  };

  await declareOrdinaryHousehold(page, {
    filingStatus: 'single', deductionMode: 'itemized', itemizedAmount: 0,
    ordinary: 60000, otherNetInvestmentIncome: 0, medicareWageBasis: 0, bracketId: 'b3'
  });

  /* Immediately below, exactly at, and immediately above the publication's threshold.
     Three distinct figures derived from the pack's own threshold rather than pinned. */
  expect(await surtaxAt(threshold - 1)).toBeCloseTo(0, 6);
  expect(await surtaxAt(threshold)).toBeCloseTo(0, 6);
  expect(await surtaxAt(threshold + 10000)).toBeCloseTo(known.rate * 10000, 2);

  /* The leg reads EXACTLY ONE workspace member. Ordinary income and the investment-income
     portion are each moved with the wage basis held, and the figure must not move. A leg
     that read gross income instead would move on the first of these. */
  const held = await surtaxAt(threshold + 10000);
  await page.fill('#inputOrdinary', '410000');
  await page.locator('#inputOrdinary').blur();
  await expect(page.locator('#truthState')).toHaveText('Settled');
  expect(asNumber(await page.locator('[data-rl-value="additionalMedicareSurtax"]').textContent()))
    .toBeCloseTo(held, 6);

  await page.fill('#inputOtherNetInvestmentIncome', '50000');
  await page.locator('#inputOtherNetInvestmentIncome').blur();
  await expect(page.locator('#truthState')).toHaveText('Settled');
  expect(asNumber(await page.locator('[data-rl-value="additionalMedicareSurtax"]').textContent()))
    .toBeCloseTo(held, 6);

  /* An undeclared wage basis refuses by name rather than computing a confident zero — the
     substitution this feature exists to prevent, because a wage earner past the threshold
     reading `$0` would be told the opposite of the truth. */
  await page.fill('#inputMedicareWageBasis', '');
  await page.locator('#inputMedicareWageBasis').blur();
  const refusal = page.locator('#surtaxSummaryCard [data-rl-unavailable]').first();
  await expect(refusal).toBeVisible();
  await expect(refusal).toHaveAttribute('data-rl-unavailable', 'RLTAX-INPUT-INCOMPLETE');
  expect(await refusal.textContent()).toContain('medicareWagesAndSelfEmploymentIncome');
  expect(await page.locator('[data-rl-value="additionalMedicareSurtax"]').count()).toBe(0);
});

test('Regression: SCN-022-006 added ordinary income moves one surtax and not the other', async ({ page }) => {
  expectTranscriptionMatchesPack();
  const niit = KNOWN_SURTAXES['net-investment-income-tax'];
  await openLifetimeTax(page, site);

  /* Both bases declared and both past their thresholds. The investment-income portion is
     large enough that the cap does NOT bind, so a rise in modified adjusted gross income
     can move that leg — if the cap bound, the leg would legitimately hold still and the
     asymmetry would be untestable here. */
  const wageBasis = niit.thresholds.single + 40000;
  await declareOrdinaryHousehold(page, {
    filingStatus: 'single', deductionMode: 'itemized', itemizedAmount: 0,
    ordinary: 210000, otherNetInvestmentIncome: 400000, medicareWageBasis: wageBasis,
    bracketId: 'b3'
  });

  const read = async (field) =>
    asNumber(await page.locator(`[data-rl-value="${field}"]`).textContent());
  const investmentBefore = await read('netInvestmentIncomeSurtax');
  const medicareBefore = await read('additionalMedicareSurtax');
  expect(medicareBefore).toBeGreaterThan(0);

  /* Ordinary income alone rises. Nothing else is touched. */
  const added = 50000;
  await page.fill('#inputOrdinary', String(210000 + added));
  await page.locator('#inputOrdinary').blur();
  await expect(page.locator('#truthState')).toHaveText('Settled');

  const investmentAfter = await read('netInvestmentIncomeSurtax');
  const medicareAfter = await read('additionalMedicareSurtax');

  /* The investment-income surtax moved, by the rate applied to the added income, because
     the measure it compares against its threshold rose. */
  expect(investmentAfter).toBeGreaterThan(investmentBefore);
  expect(investmentAfter - investmentBefore).toBeCloseTo(niit.rate * added, 2);
  /* The additional Medicare tax did not move at all, because the wage basis did not. */
  expect(medicareAfter).toBeCloseTo(medicareBefore, 6);

  /* And the page states WHICH moved and why, from the result's own structural member
     rather than from page copy a rendering change could drop. */
  const line = page.locator('#conversionAsymmetryLine [data-rl-asymmetry-moved]');
  await expect(line).toBeVisible();
  const moved = (await line.getAttribute('data-rl-asymmetry-moved')).split(',');
  const notMoved = (await line.getAttribute('data-rl-asymmetry-not-moved')).split(',');
  expect(moved).toContain('net-investment-income-tax');
  expect(notMoved).toContain('additional-medicare-tax');
  /* The two sets are disjoint: a leg cannot be declared both movable and not. */
  moved.forEach((legId) => expect(notMoved).not.toContain(legId));
  await expect(page.locator('[data-rl-value="conversionAsymmetry"]')).toBeVisible();
});

/* The browser half of this scope's privacy clause. The engine-side inventory, clear and
   export behaviour is asserted at TP-02-13; what only a real route can show is that neither
   declared basis leaves the page — in the address bar, in a request line, in a request
   REFERRER, or in a console message. The referrer channel is the one an ordinary request
   ledger misses, because a value smuggled into the page URL reaches every subsequent asset
   request as a `Referer` header even when the request URL itself is clean. */
test('Regression: SCN-022-005 neither declared surtax basis reaches a URL, a request, a referrer or a console message', async ({ page }) => {
  const issued = [];
  page.on('request', (request) => issued.push(request));
  const messages = [];
  page.on('console', (message) => messages.push(message.text()));
  page.on('pageerror', (error) => messages.push(String(error && error.message)));

  await openLifetimeTax(page, site);

  /* Two declared amounts chosen to be unmistakable in any transcript: neither is a rule
     figure, neither is any other input on this page, and neither is a substring of one. A
     match can therefore only have come from the declaration itself. */
  const declaredInvestmentBasis = 13571;
  const declaredWageBasis = 246813;
  await declareOrdinaryHousehold(page, {
    filingStatus: 'single', deductionMode: 'itemized', itemizedAmount: 0,
    ordinary: 260000, otherNetInvestmentIncome: declaredInvestmentBasis,
    medicareWageBasis: declaredWageBasis, bracketId: 'b3'
  });
  /* Both legs actually computed from the declarations, so the scan below is running against
     a page that HELD both values rather than one that never received them. */
  await expect(page.locator('[data-rl-value="netInvestmentIncomeSurtax"]')).toBeVisible();
  await expect(page.locator('[data-rl-value="additionalMedicareSurtax"]')).toBeVisible();
  await openPower(page);

  const needles = [String(declaredInvestmentBasis), String(declaredWageBasis)];
  const carriersIn = (label, text, sink) => {
    needles.forEach((needle) => {
      if (String(text).includes(needle)) sink.push(`${label}:${needle}`);
    });
  };

  /* Headers are resolved through `allHeaders()` rather than the synchronous `headers()` view,
     and EVERY header value is scanned rather than the referrer alone. Two drafts failed here
     first: the synchronous view carries no `Referer` at all on this route, and no request this
     page issues presents one even through `allHeaders()`. A referrer-only clause therefore had
     nothing to look at and would have reported a clean channel it had never read. Scanning the
     whole header set subsumes the referrer clause — a value smuggled into the page URL reaches
     subsequent requests as `Referer`, and any other header carrying it is just as much a leak —
     and it gives the scan a corpus that is provably non-empty. */
  const requests = [];
  for (const request of issued) {
    const headers = await request.allHeaders();
    requests.push({ url: request.url(), postData: request.postData() || '', headers });
  }

  const carriers = [];
  carriersIn('page-url', page.url(), carriers);
  requests.forEach((entry, index) => {
    carriersIn(`request-url[${index}]`, entry.url, carriers);
    carriersIn(`request-body[${index}]`, entry.postData, carriers);
    Object.keys(entry.headers).forEach((name) => {
      carriersIn(`request-header[${index}].${name}`, entry.headers[name], carriers);
    });
  });
  messages.forEach((text, index) => carriersIn(`console[${index}]`, text, carriers));
  expect(carriers).toEqual([]);

  /* Non-vacuity, in both channels. A clean verdict over an empty ledger would prove nothing,
     so the run must actually have observed requests AND a non-empty header corpus. */
  expect(requests.length).toBeGreaterThan(0);
  const headerValues = requests.reduce((count, entry) => count + Object.keys(entry.headers).length, 0);
  expect(headerValues).toBeGreaterThan(0);

  /* The detector is proven able to fail, without ever routing a household value through the
     page. Both control strings are built and scanned inside this test process only — nothing
     is navigated, fetched, logged or rendered — so a slipped revert cannot disclose anything.
     A scan that could not name a planted value would pass above for the wrong reason. */
  const control = [];
  carriersIn('control-referrer', `${page.url()}?basis=${declaredWageBasis}`, control);
  carriersIn('control-console', `portion ${declaredInvestmentBasis} wage ${declaredWageBasis}`, control);
  expect(control).toContain(`control-referrer:${declaredWageBasis}`);
  expect(control).toContain(`control-console:${declaredInvestmentBasis}`);
  expect(control).toContain(`control-console:${declaredWageBasis}`);
  expect(control.length).toBe(3);
});
