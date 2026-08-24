import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './provider-credentials.support.mjs';
import { openLifetimeTax, openPower } from './lifetime-tax.support.mjs';

/* BUG-020. The boundary is the ADJACENT-DOUBLE pair, not the two-orders-of-magnitude pair the
   filing round measured. Placed in BOTH the ordinary and the qualified-dividend field:

     settling  8.988465674311579e+307 + 8.988465674311579e+307 === Number.MAX_VALUE exactly
     refusing  8.98846567431158e+307  + 8.98846567431158e+307  === Infinity

   `8.98846567431158e+307` is the next representable double above `8.988465674311579e+307`, so no
   third behaviour can sit between them: a guard widened to refuse below the boundary falls the
   settling side, and a guard narrowed to admit above it falls the refusing side. Both round-trip
   exactly through `Number(String(x))`, so each survives the number input unchanged. */
const SETTLING_SIDE = '8.988465674311579e+307';
const REFUSING_SIDE = '8.98846567431158e+307';

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* The declaration, without the settled-header expectation `declareOrdinaryHousehold` carries: the
   refusing side must NOT settle, so asserting that it did would be asserting the defect. */
async function declareAt(page, amount) {
  await page.selectOption('#inputFilingStatus', 'single');
  await page.selectOption('#inputTaxYear', '2026');
  await page.selectOption('#inputDeductionMode', 'standard');
  await page.fill('#inputOrdinary', amount);
  await page.fill('#inputQualifiedDividend', amount);
  await page.fill('#inputOtherNetInvestmentIncome', '0');
  await page.fill('#inputMedicareWageBasis', '0');
}

/* Every rendered figure on the route, Simple and Power alike. `innerText` rather than
   `textContent` so a hidden section's text is not swept in as though the reader saw it — and the
   Power sections are opened first so they are genuinely visible. */
async function renderedText(page) {
  return page.locator('body').innerText();
}

test('Regression: SCN-020-01 every stage whose amount overflows the double range is refused by name', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareAt(page, REFUSING_SIDE);
  await openPower(page);

  const rows = page.locator('#settlementStagesBody tr');
  const rowCount = await rows.count();
  expect(rowCount, 'the stage table renders its stages').toBeGreaterThan(0);

  const cells = await rows.evaluateAll((nodes) => nodes.map((node) => ({
    stage: node.children[0] ? node.children[0].textContent : '',
    value: node.children[1] ? node.children[1].textContent : '',
    standing: node.children[2] ? node.children[2].textContent : ''
  })));

  /* The six stages the filing round observed carrying a non-finite amount. Each must now carry the
     named refusal, and the refusal must NAME the income sum rather than merely appear. */
  const dependent = ['CO-1', 'CO-3', 'CO-4', 'CO-5', 'CO-6', 'CO-7', 'CO-8'];
  dependent.forEach((stageId) => {
    const row = cells.find((entry) => entry.stage === stageId);
    expect(row, `stage ${stageId} is rendered`).toBeTruthy();
    expect(row.value, `stage ${stageId} carries the named refusal rather than a figure`)
      .toContain('RLTAX-FIGURE-UNREPRESENTABLE');
    /* FR-020-003: no rule standing is attached to a refused row. */
    expect(row.standing, `stage ${stageId} carries no rule-status label`)
      .not.toContain('enacted-current-law');
  });

  /* FR-020-002: the domain named is the income sum, established at the arithmetic origin rather
     than at the display seam, which cannot know which leg produced the record. */
  const originRefusals = page.locator('[data-rl-unavailable="RLTAX-FIGURE-UNREPRESENTABLE"]');
  expect(await originRefusals.count(),
    'the refusal is rendered whole somewhere on the route').toBeGreaterThan(0);
  await expect(originRefusals.first())
    .toHaveAttribute('data-rl-unavailable-domain', 'income:grossSupportedIncome');
});

test('Regression: SCN-020-02 the settlement header does not describe an unrepresentable result as settled', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareAt(page, REFUSING_SIDE);

  /* The declaration is COMPLETE — every field the route asks for is declared and readable — so
     `viable` is true and the header would read Settled on the strength of that alone. This
     assertion is what a display-only remedy cannot satisfy: guarding the formatter leaves this
     header untouched. */
  await expect(page.locator('#truthState')).not.toHaveText('Settled');
  await expect(page.locator('#truthState')).toHaveText('Incomplete');
  await expect(page.locator('#truthHeading'))
    .toHaveText('A figure this declaration implies is outside the range this tool can represent');
  await expect(page.locator('#truthDetail')).toContainText('income:grossSupportedIncome');
});

test('Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareAt(page, REFUSING_SIDE);

  const simpleText = await renderedText(page);
  await openPower(page);
  const powerText = await renderedText(page);

  /* AC-020-003 is a statement about the WHOLE route, which is what makes it more than a
     restatement of the stage-row assertion: it also covers the raw-stringification fallback in
     `stageValueText`, where `String(Infinity)` is "Infinity" and no formatter is involved. */
  [['Simple', simpleText], ['Power', powerText]].forEach(([view, body]) => {
    expect(body, `${view} renders no infinity symbol`).not.toContain('\u221e');
    expect(body, `${view} renders no NaN`).not.toMatch(/\bNaN\b/);
    expect(body, `${view} renders no stringified Infinity`).not.toMatch(/\bInfinity\b/);
  });
});

test('Regression: SCN-020-04 the settling side of the boundary settles with finite figures throughout', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareAt(page, SETTLING_SIDE);
  await expect(page.locator('#truthState')).toHaveText('Settled');
  await openPower(page);

  const cells = await page.locator('#settlementStagesBody tr').evaluateAll((nodes) =>
    nodes.map((node) => ({
      stage: node.children[0] ? node.children[0].textContent : '',
      value: node.children[1] ? node.children[1].textContent : ''
    })));

  /* Two declared amounts summing to EXACTLY Number.MAX_VALUE. A guard widened past
     non-finiteness — refusing at, say, half the representable range — starts refusing real
     households, and it falls here rather than passing because the refusing side still refuses. */
  const stageIds = cells.map((entry) => entry.stage);
  expect(stageIds, 'the stage table rendered').toContain('CO-1');
  cells.forEach((entry) => {
    expect(entry.value, `stage ${entry.stage} carries no unrepresentable refusal`)
      .not.toContain('RLTAX-FIGURE-UNREPRESENTABLE');
  });
  const body = await renderedText(page);
  expect(body, 'the settling side renders no infinity symbol').not.toContain('\u221e');
  expect(body, 'the settling side renders no NaN').not.toMatch(/\bNaN\b/);
});

test('Regression: SCN-020-05 the refusing side of the boundary refuses on the next representable double', async ({ page }) => {
  await openLifetimeTax(page, site);

  /* Driven as a PAIR in one test so the pin is the boundary rather than either side alone. The
     two amounts are adjacent doubles: `Number(REFUSING_SIDE)` is the immediate successor of
     `Number(SETTLING_SIDE)`, asserted below against the page's own arithmetic so a later edit
     cannot quietly widen the gap and leave the boundary untested. */
  const adjacency = await page.evaluate(([settling, refusing]) => {
    const low = Number(settling);
    const high = Number(refusing);
    const buffer = new Float64Array(1);
    buffer[0] = low;
    const bits = new BigUint64Array(buffer.buffer);
    bits[0] += 1n;
    return {
      lowRoundTrips: String(low) === settling,
      highRoundTrips: String(high) === refusing,
      successorIsHigh: buffer[0] === high,
      lowSumIsMax: low + low === Number.MAX_VALUE,
      highSumOverflows: !Number.isFinite(high + high)
    };
  }, [SETTLING_SIDE, REFUSING_SIDE]);
  expect(adjacency.lowRoundTrips, 'the settling amount survives the input unchanged').toBe(true);
  expect(adjacency.highRoundTrips, 'the refusing amount survives the input unchanged').toBe(true);
  expect(adjacency.successorIsHigh,
    'the refusing amount is the next representable double above the settling one, so no untested behaviour sits between them').toBe(true);
  expect(adjacency.lowSumIsMax, 'the settling pair sums to exactly Number.MAX_VALUE').toBe(true);
  expect(adjacency.highSumOverflows, 'the refusing pair sums outside the representable range').toBe(true);

  await declareAt(page, REFUSING_SIDE);
  await expect(page.locator('#truthState')).toHaveText('Incomplete');
  await openPower(page);
  const refusalCount = await page.locator('[data-rl-unavailable="RLTAX-FIGURE-UNREPRESENTABLE"]').count();
  expect(refusalCount,
    'the refusing side of the adjacent-double boundary raises the named refusal').toBeGreaterThan(0);
});

/* The pair `bug.md` reported and the scenarios name literally. The adjacent-double pair above is
   the tighter pin and the design says so; these three keep the reported reproduction asserted in
   its own right, so a reader who follows `bug.md` step for step is following something the suite
   covers rather than something inferred from a neighbouring value. */
const REPORTED_REFUSING = '9e307';
const REPORTED_SETTLING = '8.9e307';

test('Regression: SCN-020-01 the reported pair at 9e307 refuses by name on every dependent stage', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareAt(page, REPORTED_REFUSING);
  await openPower(page);

  const cells = await page.locator('#settlementStagesBody tr').evaluateAll((nodes) => nodes.map((node) => ({
    stage: node.children[0] ? node.children[0].textContent : '',
    value: node.children[1] ? node.children[1].textContent : '',
    standing: node.children[2] ? node.children[2].textContent : ''
  })));
  const dependent = ['CO-1', 'CO-3', 'CO-4', 'CO-5', 'CO-6', 'CO-7', 'CO-8'];
  dependent.forEach((stageId) => {
    const row = cells.find((entry) => entry.stage === stageId);
    expect(row, `stage ${stageId} is rendered at the reported declaration`).toBeTruthy();
    expect(row.value, `stage ${stageId} refuses by name at the reported declaration`)
      .toContain('RLTAX-FIGURE-UNREPRESENTABLE');
    expect(row.standing, `stage ${stageId} carries no rule-status label at the reported declaration`)
      .not.toContain('enacted-current-law');
  });
  const body = await renderedText(page);
  expect(body, 'the reported refusing pair renders no infinity symbol').not.toContain('\u221e');
  expect(body, 'the reported refusing pair renders no NaN').not.toMatch(/\bNaN\b/);
});

test('Regression: SCN-020-02 the settlement header at the reported 9e307 pair names the unrepresentable domain', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareAt(page, REPORTED_REFUSING);

  await expect(page.locator('#truthState')).not.toHaveText('Settled');
  await expect(page.locator('#truthDetail')).toContainText('income:grossSupportedIncome');
});

test('Regression: SCN-020-03 the reported settling pair at 8.9e307 is unchanged by the guard', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareAt(page, REPORTED_SETTLING);

  /* The pre-change observation `report.md` records for this declaration is `truth=Settled`, `inf=0`
     and `nan=0` in both views. Those three are asserted below unchanged. The two clauses after them
     are STRONGER than what was recorded: every stage carries a figure the formatter produced and
     the rule standing it came from, which is what "unchanged rounding and rule status" means and
     what the coarser pre-change record could not have shown. */
  await expect(page.locator('#truthState')).toHaveText('Settled');
  const simpleBody = await renderedText(page);
  await openPower(page);
  const powerBody = await renderedText(page);
  [['Simple', simpleBody], ['Power', powerBody]].forEach(([view, body]) => {
    expect(body, `${view} renders no infinity symbol at the reported settling pair`).not.toContain('\u221e');
    expect(body, `${view} renders no NaN at the reported settling pair`).not.toMatch(/\bNaN\b/);
  });

  const cells = await page.locator('#settlementStagesBody tr').evaluateAll((nodes) => nodes.map((node) => ({
    stage: node.children[0] ? node.children[0].textContent : '',
    value: node.children[1] ? node.children[1].textContent : '',
    standing: node.children[2] ? node.children[2].textContent : ''
  })));
  expect(cells.map((entry) => entry.stage), 'the stage table rendered').toContain('CO-1');
  const co1 = cells.find((entry) => entry.stage === 'CO-1');
  expect(co1.value, 'CO-1 carries a rounded dollar figure rather than a refusal at the reported settling pair')
    .toMatch(/^\$[\d,]+(\.\d+)?$/);
  expect(co1.standing, 'CO-1 carries the rule standing it carried before the guard')
    .toContain('enacted-current-law');
});
