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

/* The two shipped state packs, read here so every expectation below is checked against the
   authority the pack actually carries rather than against a figure this file states. Nothing in
   this file names a rate, a bracket edge or a deduction amount. */
const FLORIDA = JSON.parse(readFileSync(join(ROOT, 'tax-rules/state/FL/2026.json'), 'utf8'));
const CALIFORNIA = JSON.parse(readFileSync(join(ROOT, 'tax-rules/state/CA/2026.json'), 'utf8'));

/* SUP-023-10, as replaced by SUP-024-09. See the companion definition in
   lifetime-tax-foundation.spec.mjs. The asset set the route may request is derived from the
   route's own declarations rather than pinned as a literal. */
function declaredRouteAssets() {
  const routeSource = readFileSync(join(ROOT, 'lifetime-tax-strategy-lab.html'), 'utf8');
  const config = JSON.parse(readFileSync(join(ROOT, 'lifetime-tax-strategy.config.json'), 'utf8'));
  const scripts = Array.from(routeSource.matchAll(/<script src="([^"]+)"><\/script>/g))
    .map((match) => '/' + match[1]);
  const packs = declaredPackPaths(config).map((path) => '/' + path);
  return ['/lifetime-tax-strategy-lab.html', '/lifetime-tax-strategy.config.json']
    .concat(scripts).concat(packs).concat(['/favicon.ico']);
}

/* The household's own residency declaration. Both members are declared separately because they
   refuse separately: a pattern this tool does not model must not be reported as an unsupported
   jurisdiction. */
async function declareResidency(page, jurisdiction, pattern) {
  await page.fill('#inputResidencyJurisdiction', jurisdiction === null ? '' : jurisdiction);
  await page.selectOption('#inputResidencyPattern', pattern === null ? '' : pattern);
}

const cardRefusal = (page) => page.locator('#stateSettlementCard [data-rl-unavailable]');
const stateFigure = (page) => page.locator('[data-rl-value="stateIncomeTax"]');

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

test('Regression: a jurisdiction that levies no individual income tax renders its sourced zero with the authority that establishes it, and never enters the federal total', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 123457, bracketId: 'b3' });

  /* The federal figure BEFORE any residency exists. It is captured rather than restated so the
     comparison below is against what this settlement actually produced. */
  const federalBefore = await page.locator('[data-rl-value="headlineFederalTax"]').textContent();
  expect(federalBefore).toMatch(/^\$[\d,]+$/);

  await declareResidency(page, 'state:FL', 'full-year-resident');

  /* A separate leg. The federal total is byte-identical to the total of the same household settled
     before any residency was declared, so the state settlement is proven not to be summed into it
     rather than merely described as separate. */
  await expect(page.locator('[data-rl-value="headlineFederalTax"]')).toHaveText(federalBefore);

  /* The sourced zero is a zero that carries its authority, so it is rendered as a figure and not
     as a refusal. */
  await expect(stateFigure(page)).toHaveText('$0');
  await expect(cardRefusal(page)).toHaveCount(0);
  await expect(page.locator('#stateSettlementCard [data-rl-state-settlement="state:FL"]')).toBeVisible();

  /* Every displayed figure carries its own contextual explanation, and the explanation says in
     words that this figure is not part of the federal one. */
  const describedBy = await stateFigure(page).getAttribute('aria-describedby');
  expect(describedBy).toBe('tip-stateIncomeTax');
  await expect(page.locator('#tip-stateIncomeTax')).toContainText('never added into the federal');

  /* The constitutional citation the pack carries, shown beside the figure rather than only in
     Power: a zero a reader cannot trace is indistinguishable from an absence. */
  const authority = FLORIDA.sourceRecords.filter((record) => record.sourceId === FLORIDA.noTaxAuthority.sourceRef)[0];
  const cardText = await page.locator('#stateSettlementCard').innerText();
  expect(cardText).toContain(FLORIDA.noTaxAuthority.locator);
  expect(FLORIDA.noTaxAuthority.locator).toContain('Article VII, Section 5');
  expect(FLORIDA.noTaxAuthority.locator).toContain('subsection (a)');
  expect(cardText).toContain(authority.title);

  await openPower(page);
  await expect(page.locator('#statePackIdentity')).toContainText('state:FL');
  await expect(page.locator('#statePackIdentity')).toContainText(FLORIDA.contentSha256);
  await expect(page.locator('#stateSeparationLine')).toContainText('No federal amount reaches it');
  await expect(page.locator('#stateAuthorityLine')).toContainText(FLORIDA.noTaxAuthority.locator);
  await expect(page.locator('#stateAuthorityLine')).toContainText(authority.url);
  await expect(page.locator('[data-rl-state-stage="total"] [data-rl-value="state-total"]')).toHaveText('$0');

  /* Named rather than silently absent: the pack states what it does not carry, and each entry
     reaches the page under its own declared id. */
  for (const notice of FLORIDA.unsupportedFeatures) {
    await expect(page.locator(`[data-rl-state-unsupported="${notice.id}"]`)).toContainText(notice.code);
  }
});

test('Regression: California renders an unavailable naming the source that was not retrieved, and shows no figure at all in its place', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 123457, bracketId: 'b3' });
  await declareResidency(page, 'state:CA', 'full-year-resident');

  /* The refusal is rendered whole: code, domain, reason and remediation, on an element a keyboard
     reader can reach. */
  const refusal = cardRefusal(page);
  await expect(refusal).toHaveAttribute('data-rl-unavailable', 'RLTAX-THRESHOLD-UNAVAILABLE');
  await expect(refusal).toHaveAttribute('data-rl-unavailable-domain', 'state-deduction:single');
  const refusalText = await refusal.innerText();
  expect(refusalText).toContain('Unavailable because');
  expect(refusalText).toContain('What would make it available:');
  await refusal.focus();
  await expect(refusal).toBeFocused();

  /* The reason and the NAMED missing source both reach the reader. The pack's own AbsentFigure
     supplies both, so an implementation that summarised the refusal would drop the retrieval this
     names as the work item. */
  const absent = CALIFORNIA.standardDeductions.single;
  expect(absent.contractVersion).toBe('AbsentFigure/v1');
  expect(refusalText).toContain(absent.reason);
  expect(refusalText).toContain(absent.missingSource.title);

  /* Nothing stands in for it. No dollar amount is rendered anywhere in the state card, so a reader
     is never shown a zero, a dash or an interpolated figure where California's tax would be. */
  await expect(stateFigure(page)).toHaveCount(0);
  expect(await page.locator('#stateSettlementCard').innerText()).not.toMatch(/\$\s?\d/);

  await openPower(page);
  await expect(page.locator('#stateRefusal [data-rl-unavailable]')).toHaveAttribute(
    'data-rl-unavailable-domain', 'state-deduction:single');
  await expect(page.locator('#statePackIdentity')).toContainText('state:CA');

  /* The pack RESOLVED and its stages exist; it is the retrieval that is missing. Each declared
     stage says it was not reached rather than being omitted or shown as a zero. */
  const stageRows = page.locator('#stateStagesBody tr[data-rl-state-stage]');
  expect(CALIFORNIA.calculationOrder.length).toBeGreaterThan(0);
  await expect(stageRows).toHaveCount(CALIFORNIA.calculationOrder.length + 1);
  for (const stageId of CALIFORNIA.calculationOrder) {
    await expect(page.locator(`[data-rl-state-stage="${stageId}"]`)).toContainText('not reached in this settlement');
  }
  await expect(page.locator('[data-rl-state-stage="total"] [data-rl-unavailable]')).toHaveCount(1);

  /* Every figure California did not retrieve is named. The count is read off the pack, so a pack
     that later carries one of them surfaces the shorter list rather than this one. */
  const absentFigureCount = JSON.stringify(CALIFORNIA).split('"AbsentFigure/v1"').length - 1;
  expect(absentFigureCount).toBe(16);
  for (const notice of CALIFORNIA.unsupportedFeatures) {
    await expect(page.locator(`[data-rl-state-unsupported="${notice.id}"]`)).toContainText(notice.code);
  }
});

test('Regression: an unshipped state, an undeclared residency and an unmodelled residency pattern refuse under three different codes and none of them shows a zero', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 123457, bracketId: 'b3' });

  /* A state with no shipped pack refuses by NAME, and the remediation names the state rather than
     the tool. */
  await declareResidency(page, 'state:NY', 'full-year-resident');
  await expect(cardRefusal(page)).toHaveAttribute('data-rl-unavailable', 'RLTAX-JURISDICTION-UNSUPPORTED');
  await expect(cardRefusal(page)).toHaveAttribute('data-rl-unavailable-domain', 'jurisdiction:state:NY');
  expect(await cardRefusal(page).innerText()).toContain('no average, national default or zero is substituted');
  await expect(stateFigure(page)).toHaveCount(0);

  /* An undeclared residency is a missing declaration, not an absence of state tax. */
  await declareResidency(page, null, 'full-year-resident');
  await expect(cardRefusal(page)).toHaveAttribute('data-rl-unavailable', 'RLTAX-INPUT-INCOMPLETE');
  await expect(cardRefusal(page)).toHaveAttribute('data-rl-unavailable-domain', 'residency:residencyJurisdiction');
  await expect(stateFigure(page)).toHaveCount(0);

  /* An undeclared PATTERN refuses under the member it is missing rather than under the
     jurisdiction. */
  await declareResidency(page, 'state:FL', null);
  await expect(cardRefusal(page)).toHaveAttribute('data-rl-unavailable-domain', 'residency:residencyPattern');

  /* And a pattern this tool does not model refuses under its OWN code while the jurisdiction is a
     fully shipped one: a part-year resident of Florida must never be told Florida is unsupported. */
  await declareResidency(page, 'state:FL', 'part-year');
  await expect(cardRefusal(page)).toHaveAttribute('data-rl-unavailable', 'RLTAX-RESIDENCY-UNSUPPORTED');
  await expect(cardRefusal(page)).toHaveAttribute('data-rl-unavailable-domain', 'residency:pattern:part-year');
  const patternText = await cardRefusal(page).innerText();
  expect(patternText).toContain('the declared jurisdiction itself may be fully supported');
  await expect(stateFigure(page)).toHaveCount(0);
  expect(await page.locator('#stateSettlementCard').innerText()).not.toMatch(/\$\s?\d/);
});

test('Regression: a residency declaration that changes nothing rebuilds nothing, and a residency that changes rebuilds the card', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 123457, bracketId: 'b3' });
  await declareResidency(page, 'state:FL', 'full-year-resident');
  await expect(stateFigure(page)).toHaveText('$0');

  /* A control fires `input` while it is edited and `change` again when focus leaves it. Rendering
     on that repeat would detach the node the reader is interacting with, so an edit that changes
     no declaration must not be an edit. The probe is written onto the live node: it survives only
     if that node was never replaced. */
  const survived = await page.evaluate(() => {
    const host = document.querySelector('#stateSettlementCard [data-rl-state-settlement]');
    host.setAttribute('data-rl-probe', 'kept');
    document.querySelector('#inputResidencyJurisdiction')
      .dispatchEvent(new Event('change', { bubbles: true }));
    document.querySelector('#inputResidencyPattern')
      .dispatchEvent(new Event('input', { bubbles: true }));
    const after = document.querySelector('#stateSettlementCard [data-rl-state-settlement]');
    return after !== null && after.getAttribute('data-rl-probe') === 'kept';
  });
  expect(survived).toBe(true);

  /* ADVERSARIAL: a guard that never re-rendered would pass the assertion above for any input. A
     declaration that really changed must rebuild the card, so the probe must be gone. */
  await page.fill('#inputResidencyJurisdiction', 'state:CA');
  await expect(page.locator('#stateSettlementCard [data-rl-probe]')).toHaveCount(0);
  await expect(cardRefusal(page)).toHaveAttribute('data-rl-unavailable-domain', 'state-deduction:single');
});

test('Regression: the residency declaration reaches no URL, no request, no console message and no export', async ({ page }) => {
  const ledger = collectRequests(page);
  const consoleMessages = collectConsole(page);
  await openLifetimeTax(page, site);
  const afterFirstPaint = ledger.length;
  expect(afterFirstPaint).toBeGreaterThan(0);

  await declareOrdinaryHousehold(page, { ordinary: 123457, bracketId: 'b3' });
  await declareResidency(page, 'state:CA', 'full-year-resident');
  await openPower(page);
  await page.locator('#modeSimple').click();

  /* Not one request was issued after first paint: declaring where the household lives settles the
     state axis from packs already read rather than fetching anything. */
  expect(ledger.length).toBe(afterFirstPaint);

  /* And every request the route ever made is a same-origin read of an asset the page's own
     configuration declares. The state packs are permitted because the configuration declares
     them, not because this file lists them. */
  const permitted = declaredRouteAssets();
  const paths = ledger.map((entry) => new URL(entry.url).pathname);
  expect(ledger.filter((entry) => !entry.url.startsWith(site.baseUrl))).toEqual([]);
  paths.forEach((path) => expect(permitted).toContain(path));
  expect(permitted).toContain('/rltaxstate.js');
  expect(permitted).toContain('/tax-rules/state/CA/2026.json');
  expect(permitted).not.toContain('/definitely-not-declared-by-this-route.json');

  /* No residency reaches a URL, a query string, a hash, a request body or a referrer. */
  const url = page.url();
  expect(url).not.toContain('state:CA');
  expect(url).not.toContain(encodeURIComponent('state:CA'));
  expect(url).not.toContain('residency');
  expect(new URL(url).search).toBe('');
  ledger.forEach((entry) => {
    /* The declaration FORM, not the two letters. A declared pack path legitimately carries the
       postal code the configuration named; what must never appear is the residency the household
       declared, in either its literal or its percent-encoded shape. */
    expect(entry.url).not.toContain('state:CA');
    expect(entry.url).not.toContain(encodeURIComponent('state:CA'));
    expect(entry.url).not.toContain('residency');
    expect(entry.postData).toBe('');
  });
  consoleMessages.forEach((message) => {
    expect(message).not.toContain('state:CA');
    expect(message).not.toContain('residency');
  });

  /* The export omits both residency members and NAMES them as omitted. A field dropped without
     being listed is the defect the omission ledger exists to prevent. */
  await page.locator('#exportAcknowledgement').check();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#exportPrivateFile').click()
  ]);
  const written = JSON.parse(readFileSync(await download.path(), 'utf8'));
  expect(written.omittedFields).toContain('residencyJurisdiction');
  expect(written.omittedFields).toContain('residencyPattern');
  expect(written.workspace.residencyJurisdiction).toBeUndefined();
  expect(written.workspace.residencyPattern).toBeUndefined();
  expect(JSON.stringify(written)).not.toContain('state:CA');
  await expect(page.locator('#privacyResult')).toContainText('residencyJurisdiction');
  await expect(page.locator('#privacyResult')).toContainText('residencyPattern');

  /* The stored workspace is the one place the declaration legitimately lives, and the inventory
     says so rather than leaving the reader to infer it. */
  await expect(page.locator('#storageInventoryBody')).toContainText('residency');
});

test('Regression: the state surfaces are absorbed by the declared Simple field set and the withheld-detail link table', async ({ page }) => {
  await openLifetimeTax(page, site);

  const simpleFields = (await page.locator('body').getAttribute('data-rl-simple-fields')).split(',');
  const powerSections = (await page.locator('body').getAttribute('data-rl-power-sections')).split(',');
  expect(simpleFields).toContain('stateIncomeTax');
  expect(powerSections).toContain('power-state');

  /* Simple stays decision-first: the state figure is a decision-level answer, and every stage,
     citation and unsupported-feature notice behind it is reachable through exactly one labelled
     link into the section that owns it. */
  const link = page.locator('#powerLinkRows button[data-power-section="power-state"]');
  await expect(link).toHaveCount(1);
  await link.click();
  await expect(page.locator('#modePower')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#power-state')).toBeFocused();

  /* Every declared Power section is a real element, so the link above cannot point at nothing. */
  for (const section of powerSections) {
    await expect(page.locator(`#${section}`)).toHaveCount(1);
  }
});
