import { expect, test } from './playwright-runtime.mjs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './provider-credentials.support.mjs';
import {
  collectConsole,
  collectRequests,
  declaredPackPaths,
  declareOrdinaryHousehold,
  openLifetimeTax,
  openPower
} from './lifetime-tax.support.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* SUP-023-10, as replaced by SUP-024-09. The permitted-asset set is DERIVED from the page's own
   script tags and from every pack path the configuration declares, so the three packs this feature
   introduced are admitted by their own declaration rather than by a literal edited here. */
function declaredRouteAssets() {
  const routeSource = readFileSync(join(ROOT, 'lifetime-tax-strategy-lab.html'), 'utf8');
  const config = JSON.parse(readFileSync(join(ROOT, 'lifetime-tax-strategy.config.json'), 'utf8'));
  const scripts = Array.from(routeSource.matchAll(/<script src="([^"]+)"><\/script>/g))
    .map((match) => '/' + match[1]);
  const packs = declaredPackPaths(config).map((path) => '/' + path);
  return ['/lifetime-tax-strategy-lab.html', '/lifetime-tax-strategy.config.json']
    .concat(scripts).concat(packs).concat(['/favicon.ico']);
}

const MEDICARE_PACK = JSON.parse(readFileSync(join(ROOT, 'tax-rules/medicare/2026.json'), 'utf8'));
const PREMIUM_YEAR = MEDICARE_PACK.medicarePolicy.premiumYear;
const LOOKBACK_YEAR = PREMIUM_YEAR - MEDICARE_PACK.medicarePolicy.lookbackOffsetYears.value;
const PREMIUM_LEG_IDS = MEDICARE_PACK.medicarePolicy.taxLegs.map((leg) => leg.legId);

/* The five household declarations this feature added, exactly as the workspace inventories them.
   Every value here is the household's own input; nothing is a pack figure and nothing is recalled.
   They are distinctive on purpose, so the export row below can look for the VALUE as well as the
   member name. */
const DECLARED = {
  statementPia: 2609.8,
  birthYear: 1964,
  claimAgeMonths: 744,
  comparisonAges: '62,67,70',
  lookbackMagi: 214137
};
const RETIREMENT_MEMBERS = ['benefitStatementPrimaryInsuranceAmount', 'benefitDeclaredEarnings',
  'benefitBirthYear', 'claimAgeComparisonAges', 'lookbackModifiedAdjustedGrossIncome'];

const splitAttribute = (raw) => (raw === null || raw === '' ? [] : raw.split(','));
const legSetOf = (page, selector) => page.locator(selector)
  .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-rl-leg')).sort());

/* One complete retirement household: an ordinary income the shipped pack can settle end to end,
   a benefit origin, a claim age, a comparison age set and the lookback year the medicare pack's
   own offset requires. */
async function declareRetirementHousehold(page) {
  await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
  await page.fill('#inputBenefitStatementPia', String(DECLARED.statementPia));
  await page.fill('#inputBenefitBirthYear', String(DECLARED.birthYear));
  await page.fill('#inputBenefitClaimAgeMonths', String(DECLARED.claimAgeMonths));
  await page.fill('#inputClaimAgeComparisonAges', DECLARED.comparisonAges);
  await page.fill('#inputLookbackYear', String(LOOKBACK_YEAR));
  await page.fill('#inputLookbackModifiedAdjustedGrossIncome', String(DECLARED.lookbackMagi));
  await expect(page.locator('#truthState')).toHaveText('Settled');
}

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* TP-05-19. */
test('Regression: SCN-024-013 every declared leg reaches the headline, the comparison, the curve and the export and the headline shows the total', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareRetirementHousehold(page);
  await openPower(page);

  /* The record the settlement published, read off the page rather than composed by this spec. */
  const record = splitAttribute(
    await page.locator('body').getAttribute('data-rl-legs-record')).sort();
  expect(record.length).toBeGreaterThan(0);

  const headlineSummed = splitAttribute(
    await page.locator('#headlineBlock [data-rl-legs]').getAttribute('data-rl-legs'));
  const headlineOwn = await legSetOf(page, '#headlineBlock [data-rl-leg]');
  const headline = headlineSummed.concat(headlineOwn).sort();
  const comparison = await legSetOf(page, '#legCompositionBody tr[data-rl-leg]');
  const curve = await legSetOf(page, '#curveLegContributorsBody tr[data-rl-leg]');

  await page.locator('#exportAcknowledgement').check();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#exportPrivateFile').click()
  ]);
  const written = JSON.parse(readFileSync(await download.path(), 'utf8'));
  const exported = written.settledLegs.slice().sort();

  /* Two-directional set identity against every one of the four surfaces, reported by naming both
     the leg and the surface it failed to reach. */
  [
    ['headline', headline],
    ['comparison', comparison],
    ['curve', curve],
    ['export', exported]
  ].forEach(([surface, rendered]) => {
    record.forEach((legId) => {
      expect(rendered, `the leg ${legId} is in the settled record and does not reach ${surface}`)
        .toContain(legId);
    });
    rendered.forEach((legId) => {
      expect(record, `the leg ${legId} appears on ${surface} and is not in the settled record`)
        .toContain(legId);
    });
  });

  /* The headline figure is the settled TOTAL, not one leg. It is drawn as the `headlineFederalTax`
     Simple field, and no single-leg identity is drawn as a Simple value anywhere in Simple. */
  await page.locator('#modeSimple').click();
  await expect(page.locator('#simple [data-rl-value="headlineFederalTax"]')).toBeVisible();
  const simpleValueIds = await page.locator('#simple [data-rl-value]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-rl-value')));
  ['ordinaryTax', 'preferentialTax', 'netInvestmentIncomeTax', 'additionalMedicareTax']
    .forEach((leg) => expect(simpleValueIds).not.toContain(leg));

  /* And the total genuinely summed more than one leg, so the clause above is not passing because
     the total happens to equal the only leg there is. */
  expect(headlineSummed.length).toBeGreaterThan(1);
});

/* TP-05-20. */
test('Regression: SCN-024-013 the annual Medicare cost renders beside the headline and is labelled not part of the federal tax total', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareRetirementHousehold(page);

  const costCard = page.locator('#annualMedicareCostCard [data-rl-cost-beside-total]');
  await expect(costCard).toBeVisible();
  const costText = await costCard.innerText();
  expect(costText).toContain('not part of the federal tax total');

  /* It is a Simple decision field of its own rather than a term of the headline. */
  const headlineSummed = splitAttribute(
    await page.locator('#headlineBlock [data-rl-legs]').getAttribute('data-rl-legs'));
  expect(headlineSummed.length).toBeGreaterThan(0);
  PREMIUM_LEG_IDS.forEach((legId) => expect(headlineSummed).not.toContain(legId));

  /* And the reconciliation identity, which totals the federal tax, carries no premium leg either.
     Both sides are asserted so the clause cannot pass over an empty leg set. */
  await openPower(page);
  const reconciled = splitAttribute(
    await page.locator('body').getAttribute('data-rl-reconciliation-legs'));
  expect(reconciled.length).toBeGreaterThan(0);
  expect(PREMIUM_LEG_IDS.length).toBe(3);
  PREMIUM_LEG_IDS.forEach((legId) => expect(reconciled).not.toContain(legId));
});

/* TP-05-21. */
test('Regression: SCN-024-014 the export omits all five retirement declarations and states what it omitted', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareRetirementHousehold(page);
  /* The earnings record is the fifth declaration and is declared here as well, so the file below
     is produced with all five populated rather than with four. */
  await page.fill('#inputBenefitEarningsRecord', '1986:16196,1987:17283');
  await expect(page.locator('#truthState')).toHaveText('Settled');

  await page.locator('#exportAcknowledgement').check();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#exportPrivateFile').click()
  ]);
  const fileText = readFileSync(await download.path(), 'utf8');
  const written = JSON.parse(fileText);

  /* Each of the five asserted INDEPENDENTLY by name against the file that was actually written.
     A single combined check would pass a sanitizer that covered four. */
  RETIREMENT_MEMBERS.forEach((member) => {
    expect(Object.prototype.hasOwnProperty.call(written.workspace, member),
      `the export kept the retirement declaration ${member}`).toBe(false);
    expect(fileText, `the export names the retirement declaration ${member} in its payload`)
      .not.toContain(`"${member}":`);
    expect(written.omittedFields, `the export does not name ${member} as omitted`)
      .toContain(member);
  });

  /* No declared VALUE survives either, which a key-name check alone could not see. */
  ['2609.8', '1964', '744', '214137', '16196'].forEach((value) => {
    expect(fileText, `the export carries the declared value ${value}`).not.toContain(value);
  });

  /* And the page states what it omitted, naming all five. */
  const statement = await page.locator('#privacyResult').innerText();
  expect(statement).toContain('It omits these workspace members: ');
  RETIREMENT_MEMBERS.forEach((member) => expect(statement).toContain(member));
  await expect(page.locator('#privacyResult'))
    .toHaveAttribute('data-rl-export-written', 'true');
});

/* TP-05-22. */
test('Regression: SCN-024-015 Simple carries only decision-level fields and every withheld detail links to the Power section that owns it', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareRetirementHousehold(page);

  /* Every value Simple draws is either admitted by the page's own closed Simple field list, or is
     a leg-identity figure whose host names a leg the settled record declares. Those are the only
     two ways a figure may appear in Simple: `simpleValueNode` enforces the first, and the second
     is the leg-surface obligation that puts one node per declared leg inside `#headlineBlock`.
     Asserting membership in the field list alone would be wrong about the product, and asserting
     nothing would let an arbitrary undeclared figure into the decision view. */
  const record = splitAttribute(
    await page.locator('body').getAttribute('data-rl-legs-record'));
  expect(record.length).toBeGreaterThan(0);
  const declared = splitAttribute(
    await page.locator('body').getAttribute('data-rl-simple-fields'));
  const rendered = await page.locator('#simple [data-rl-value]').evaluateAll((nodes) => nodes
    .map((node) => {
      const host = node.closest('[data-rl-leg]');
      return { field: node.getAttribute('data-rl-value'), leg: host ? host.getAttribute('data-rl-leg') : null };
    }));
  expect(rendered.length).toBeGreaterThan(0);
  rendered.forEach((entry) => {
    const admitted = declared.indexOf(entry.field) >= 0
      || (entry.leg !== null && record.indexOf(entry.leg) >= 0);
    expect(admitted,
      `Simple draws ${entry.field}, which is neither a declared Simple field nor a figure of a declared leg`)
      .toBe(true);
  });
  /* Non-vacuous in both halves: at least one figure is admitted by the field list and at least one
     by a declared leg, so neither half is carrying the loop alone. */
  expect(rendered.some((entry) => declared.indexOf(entry.field) >= 0)).toBe(true);
  expect(rendered.some((entry) => declared.indexOf(entry.field) < 0
    && entry.leg !== null && record.indexOf(entry.leg) >= 0)).toBe(true);
  /* And a figure the page never draws is admitted by neither. */
  expect(declared).not.toContain('fieldTheRouteNeverAdmits');
  expect(record).not.toContain('leg-the-record-does-not-declare');

  /* The three decision-level fields this scope added are declared, and each one either renders its
     figure or renders a whole refusal in its place. The shipped medicare pack carries no standard
     Part D premium, so the aggregate annual cost is legitimately withheld rather than understated,
     and asserting it visible unconditionally would be asserting a figure the pack does not have. */
  for (const field of ['annualBenefit', 'taxableBenefitPortion']) {
    expect(declared, `${field} is not a declared Simple field`).toContain(field);
    await expect(page.locator(`#simple [data-rl-value="${field}"]`)).toBeVisible();
  }
  expect(declared).toContain('annualMedicareCost');
  const costCard = page.locator('#annualMedicareCostCard [data-rl-cost-beside-total]');
  await expect(costCard).toBeVisible();
  const costFigures = await page.locator('#annualMedicareCostCard [data-rl-value="annualMedicareCost"]').count();
  const costRefusals = await page.locator('#annualMedicareCostCard [data-rl-unavailable]').count();
  expect(costFigures + costRefusals,
    'the annual Medicare cost renders neither a figure nor a refusal').toBe(1);
  if (costRefusals === 1) {
    const refusalText = await page.locator('#annualMedicareCostCard [data-rl-unavailable]').innerText();
    expect(refusalText).toContain('Unavailable because');
    expect(refusalText).toContain('What would make it available:');
  }

  /* No band table, no rule trace, no per-age table and no raw curve series in Simple. */
  expect(await page.locator('#simple canvas').count()).toBe(0);
  expect(await page.locator('#simple table').count()).toBe(0);
  declared.forEach((field) => expect(field).not.toMatch(/band|curve|ledger|trace|reconcil|per-?age|average/i));

  /* Every withheld detail carries a link, every link points at a declared section, and every
     declared section is a real element. Both directions, derived from the page's own lists. */
  const sections = splitAttribute(
    await page.locator('body').getAttribute('data-rl-power-sections'));
  const links = page.locator('#powerLinkRows button[data-power-section]');
  await expect(links).toHaveCount(await page.locator('#powerLinkRows li').count());
  const targeted = await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-power-section')));
  expect(targeted.length).toBeGreaterThan(0);
  targeted.forEach((section) => expect(sections).toContain(section));
  for (const section of sections) {
    expect(targeted, `the declared section ${section} has no withheld-detail link`).toContain(section);
    expect(await page.locator(`#${section}`).count(),
      `the declared section ${section} is not an element on the page`).toBe(1);
  }
  /* The four sections this feature added are on both sides, and a section the route never declares
     is on neither, so the loops above cannot be passing over a degenerate set. */
  ['power-benefit', 'power-inclusion', 'power-claim-age', 'power-medicare'].forEach((section) => {
    expect(sections).toContain(section);
    expect(targeted).toContain(section);
  });
  expect(sections).not.toContain('power-not-declared-by-this-route');

  /* Following one opens Power and focuses the section that owns the detail. */
  await page.locator('#powerLinkRows button[data-power-section="power-medicare"]').click();
  await expect(page.locator('#modePower')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#power-medicare')).toBeFocused();
});

/* TP-05-23. */
test('Regression: SCN-024-015 every unavailable retirement item is focusable and states its code, domain, reason and remediation', async ({ page }) => {
  await openLifetimeTax(page, site);
  /* A household that declares nothing about retirement, so every new family refuses at once. */
  await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
  await openPower(page);

  const nodes = page.locator('#power [data-rl-unavailable]');
  const total = await nodes.count();
  expect(total).toBeGreaterThan(0);

  let visible = 0;
  const domains = [];
  for (let index = 0; index < total; index += 1) {
    const node = nodes.nth(index);
    if (!(await node.isVisible())) continue;
    visible += 1;
    const code = await node.getAttribute('data-rl-unavailable');
    const domain = await node.getAttribute('data-rl-unavailable-domain');
    domains.push(domain);
    expect(code, 'an unavailable item carries no code').toBeTruthy();
    expect(domain, `the unavailable item ${code} carries no domain`).toBeTruthy();

    /* Focused and read back, rather than inspected for a tabindex attribute: an inert node
       carrying tabindex would satisfy an attribute check and still not be reachable. */
    await node.focus();
    await expect(node, `the unavailable item ${code} is not focusable`).toBeFocused();

    const shown = (await node.innerText()).trim();
    expect(shown).toContain(code);
    expect(shown).toContain(domain);
    expect(shown).toContain('Unavailable because');
    expect(shown).toContain('What would make it available:');
    /* No blank, no bare dash and no zero stands in for any of the four members. */
    shown.split('\n').map((line) => line.trim()).filter((line) => line.length > 0)
      .forEach((line) => {
        expect(line, `the unavailable item ${code} renders a bare placeholder line`)
          .not.toMatch(/^(-|\u2014|0)$/);
      });
  }
  expect(visible, 'no unavailable item was visible, so the sweep proved nothing')
    .toBeGreaterThan(0);

  /* The retirement families are among them, so the sweep is over this feature's refusals rather
     than only over refusals a prior feature already covered. */
  expect(domains.some((domain) => domain.indexOf('benefit') >= 0),
    'no benefit-family refusal was rendered').toBe(true);
  expect(domains.some((domain) => domain.indexOf('lookback') >= 0),
    'no medicare-family refusal was rendered').toBe(true);
});

/* TP-05-24. */
test('Regression: SCN-024-015 a focused control survives a mode switch without being detached and a subsequent click registers', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareRetirementHousehold(page);

  const control = await page.$('#inputBenefitBirthYear');
  await control.focus();
  await expect(page.locator('#inputBenefitBirthYear')).toBeFocused();

  /* An unconditional re-render replaces the node, and a replaced node is still in the document by
     id while the handle taken before the switch is not. Holding the handle is what makes the
     difference visible. */
  await page.locator('#modePower').click();
  await expect(page.locator('#power')).toBeVisible();
  await page.locator('#modeSimple').click();
  await expect(page.locator('#simple')).toBeVisible();

  expect(await control.evaluate((node) => node.isConnected),
    'the focused control was detached by the mode switch').toBe(true);

  /* And it still works: a click reaches it and a keystroke changes the settled result. */
  const before = await page.locator('#inputBenefitBirthYear').inputValue();
  await control.click();
  await page.fill('#inputBenefitBirthYear', String(DECLARED.birthYear + 1));
  await expect(page.locator('#inputBenefitBirthYear'))
    .toHaveValue(String(DECLARED.birthYear + 1));
  expect(before).toBe(String(DECLARED.birthYear));
  await expect(page.locator('#truthState')).toHaveText('Settled');
});

/* TP-05-25. */
test('Regression: SCN-024-014 the request ledger stays empty with three new packs loaded and no retirement declaration reaches a URL', async ({ page }) => {
  const ledger = collectRequests(page);
  const consoleMessages = collectConsole(page);
  await openLifetimeTax(page, site);
  const afterFirstPaint = ledger.length;

  await declareRetirementHousehold(page);
  await openPower(page);

  /* Nothing at all is requested after first paint, whatever the household declares. */
  expect(ledger.length).toBe(afterFirstPaint);

  /* Everything the route DID read is a local asset it declared, including the three packs this
     feature added. */
  const permitted = declaredRouteAssets();
  const paths = ledger.map((request) => new URL(request.url).pathname);
  expect(paths.length).toBeGreaterThan(0);
  paths.forEach((path) => expect(permitted).toContain(path));
  ['/tax-rules/benefit/2026.json', '/tax-rules/mortality/2026.json', '/tax-rules/medicare/2026.json']
    .forEach((pack) => expect(paths, `the pack ${pack} was not loaded`).toContain(pack));

  /* No declared household value reaches any URL, any request body, the location or the console. */
  const declaredValues = [String(DECLARED.statementPia), String(DECLARED.birthYear),
    String(DECLARED.claimAgeMonths), String(DECLARED.lookbackMagi), '62,67,70'];
  ledger.forEach((request) => {
    declaredValues.forEach((value) => expect(request.url).not.toContain(value));
    expect(request.postData).toBe('');
    expect(request.method).toBe('GET');
  });
  const address = page.url();
  declaredValues.forEach((value) => expect(address).not.toContain(value));
  expect(address).not.toContain('?');
  const messages = consoleMessages.join('\n');
  declaredValues.forEach((value) => expect(messages).not.toContain(value));
});
