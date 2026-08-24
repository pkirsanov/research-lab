import { expect, test } from './playwright-runtime.mjs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './provider-credentials.support.mjs';
import {
  ALLOWED_ASSET_PATHS,
  SENTINEL_ORDINARY,
  collectConsole,
  collectRequests,
  declareOrdinaryHousehold,
  declaredPackPaths,
  openLifetimeTax,
  openPower,
  sameOriginPaths
} from './lifetime-tax.support.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* SUP-023-10, as replaced by SUP-024-09. See the companion definition in
   lifetime-tax-foundation.spec.mjs. The pack half is derived from every pack-path member the
   configuration declares rather than from a hand-listed key set. */
function declaredRouteAssets() {
  const routeSource = readFileSync(join(ROOT, 'lifetime-tax-strategy-lab.html'), 'utf8');
  const config = JSON.parse(readFileSync(join(ROOT, 'lifetime-tax-strategy.config.json'), 'utf8'));
  const scripts = Array.from(routeSource.matchAll(/<script src="([^"]+)"><\/script>/g))
    .map((match) => '/' + match[1]);
  const packs = declaredPackPaths(config).map((path) => '/' + path);
  return ['/lifetime-tax-strategy-lab.html', '/lifetime-tax-strategy.config.json']
    .concat(scripts).concat(packs).concat(['/favicon.ico']);
}


let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

test('Regression: SCN-021-013 Simple opens first with a decision level answer and Power holds the detail', async ({ page }) => {
  await openLifetimeTax(page, site);

  /* Simple renders first with no user action at all. */
  await expect(page.locator('#modeSimple')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#simple')).toBeVisible();
  await expect(page.locator('#power')).toBeHidden();

  await declareOrdinaryHousehold(page, {
    deductionMode: 'itemized', itemizedAmount: 0, ordinary: 60000,
    bracketId: 'b3', fundingSource: 'outside-funds'
  });

  /* Simple carries the decision-level answer and nothing beyond it. */
  const declared = (await page.locator('body').getAttribute('data-rl-simple-fields')).split(',');
  const rendered = await page.locator('#simple [data-rl-value]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-rl-value')));
  expect(rendered.length).toBeGreaterThan(0);
  rendered.forEach((field) => expect(declared).toContain(field));
  await expect(page.locator('[data-rl-value="headlineFederalTax"]')).toBeVisible();
  await expect(page.locator('[data-rl-value="conversionAmount"]')).toBeVisible();
  await expect(page.locator('[data-rl-value="strongestTradeoff"]')).toBeVisible();
  await expect(page.locator('#unavailableDomainList')).toBeVisible();

  /* No candidate grid, no per-band table, no rule trace and no raw curve series in Simple. */
  expect(await page.locator('#simple canvas').count()).toBe(0);
  expect(await page.locator('#simple table').count()).toBe(0);
  await expect(page.locator('#power-bracket-detail')).toBeHidden();
  await expect(page.locator('#power-rule-ledger')).toBeHidden();
  await expect(page.locator('#power-curve')).toBeHidden();

  /* Every withheld detail carries a link to the Power section that owns it. */
  const links = page.locator('#powerLinkRows button[data-power-section]');
  const sections = (await page.locator('body').getAttribute('data-rl-power-sections')).split(',');
  /* SUP-023-06: supersedes the pinned nine-link count on the withheld-detail rows; shape=derive.
     FR-023-007 adds
     `power-property` and FR-023-014 adds `power-deduction`, so a pinned nine describes a page
     that no longer exists. The replacement derives the expected identity from the page's own
     declared section list rather than from a literal: every link must point at a declared
     section, every declared section must exist in the document, and the link set must be
     non-empty. That preserves the original protection — no detail is withheld without a route
     to it — and adds the reverse direction a count could never see: a section declared and
     never rendered now fails here.
     Ledger: specs/023-property-tax-and-rental-income/spec.md#supersession-ledger. */
  await expect(links).toHaveCount(await page.locator('#powerLinkRows li').count());
  expect(await links.count()).toBeGreaterThan(0);
  const targeted = await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-power-section')));
  targeted.forEach((section) => expect(sections).toContain(section));
  for (const section of sections) {
    expect(await page.locator(`#${section}`).count()).toBe(1);
  }
  /* SUP-023-06 ADVERSARIAL. A degenerate derivation that produced an empty declared set, or one
     that admitted any string, would pass the loop above and prove nothing. Pin that the set is
     the page's real declaration set, that it contains the two sections this feature added, and
     that a section the page never declares is rejected. */
  expect(sections).toContain('power-property');
  expect(sections).toContain('power-deduction');
  expect(sections).not.toContain('power-not-declared-by-this-route');

  /* Following one opens Power and focuses the owning section. */
  /* SUP-022-19: supersedes the positional `links.nth(3)` focus expectation; shape=derive. The
     ordinal followed whichever row happened to sit fourth, which is why the page itself carries a
     source comment forbidding insertion into the withheld-detail list — an inserted row silently
     retargeted this click, and the protection depended on a comment rather than on an assertion.
     The replacement selects the link by the target it declares, so the row may move without this
     expectation going quiet, and it pins the declared target to exactly one link first, so a
     duplicated declaration cannot let the click resolve to an arbitrary member.
     Ledger: specs/022-federal-preferential-and-state-income-tax/spec.md#supersession-ledger */
  const FOCUS_TARGET = 'power-bracket-detail';
  expect(targeted.filter((section) => section === FOCUS_TARGET).length).toBe(1);
  const targetedLink = page.locator(`#powerLinkRows button[data-power-section="${FOCUS_TARGET}"]`);
  await expect(targetedLink).toHaveCount(1);
  await targetedLink.click();
  await expect(page.locator('#modePower')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator(`#${FOCUS_TARGET}`)).toBeFocused();

  /* Power exposes the ledger, the per-band detail, the curve table, the identity and the sources. */
  await expect(page.locator('#ruleLedgerBody tr').first()).toContainText('federal-income-tax-2026');
  /* The requirement is that the ledger names EVERY feature the shipped pack declares, supported
     and unsupported alike. Reading the count off the pack keeps that the assertion instead of a
     literal that silently stops matching the data it is supposed to be checking. */
  const pack = JSON.parse(readFileSync(join(ROOT, 'tax-rules/federal/2026.json'), 'utf8'));
  expect(pack.supportedFeatures.length).toBeGreaterThan(0);
  expect(pack.unsupportedFeatures.length).toBeGreaterThan(0);
  await expect(page.locator('#featureLedgerBody tr'))
    .toHaveCount(pack.supportedFeatures.length + pack.unsupportedFeatures.length);
  const ledgerLabels = await page.locator('#featureLedgerBody tr td:first-child')
    .evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
  pack.supportedFeatures.forEach((feature) => expect(ledgerLabels).toContain(feature.label));
  pack.unsupportedFeatures.forEach((feature) => expect(ledgerLabels).toContain(feature.label));
  await expect(page.locator('#bracketDetailBody tr')).toHaveCount(7);
  /* SUP-022-16: supersedes `toHaveCount(5)` on `#reconciliationBody tr`; shape=derive. The
     expected row count is read from the settled record the page itself published, so the sixth
     leg design.md adds cannot leave the rendering and the record disagreeing in silence.
     Ledger: specs/022-federal-preferential-and-state-income-tax/spec.md#sup-022-16 */
  const publishedLegs = (await page.locator('body').getAttribute('data-rl-reconciliation-legs')).split(',');
  expect(publishedLegs.length).toBeGreaterThan(0);
  await expect(page.locator('#reconciliationBody tr')).toHaveCount(publishedLegs.length);
  const renderedLegIds = await page.locator('#reconciliationBody tr td:first-child')
    .evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
  expect(renderedLegIds).toEqual(publishedLegs);
  expect(await page.locator('#curveTextEquivalentBody tr').count()).toBeGreaterThan(50);
  /* SUP-022-17: supersedes `toHaveCount(2)` on `#sourceRecordList li`; shape=derive. The count
     follows the pack, the titles match as a set in both directions so a record substituted at
     constant count cannot pass, and the referrer guard is widened from the first link to every
     link so a source record a later scope adds cannot arrive without it.
     Ledger: specs/022-federal-preferential-and-state-income-tax/spec.md#sup-022-17 */
  expect(pack.sourceRecords.length).toBeGreaterThan(0);
  await expect(page.locator('#sourceRecordList li')).toHaveCount(pack.sourceRecords.length);
  const renderedSourceTitles = await page.locator('#sourceRecordList a')
    .evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
  const packSourceTitles = pack.sourceRecords.map((record) => record.title);
  renderedSourceTitles.forEach((title) => expect(packSourceTitles).toContain(title));
  packSourceTitles.forEach((title) => expect(renderedSourceTitles).toContain(title));
  const sourceRels = await page.locator('#sourceRecordList a')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('rel')));
  expect(sourceRels.length).toBe(pack.sourceRecords.length);
  sourceRels.forEach((rel) => expect(rel).toBe('noreferrer noopener'));

  /* Neither mode changes a conclusion: the headline is the same object in both. */
  const powerHeadline = await page.locator('[data-rl-value="headlineFederalTax"]').textContent();
  await page.locator('#modeSimple').click();
  await expect(page.locator('[data-rl-value="headlineFederalTax"]')).toHaveText(powerHeadline);
});

test('Regression: SCN-021-014 every value is explained and every unavailable state is keyboard reachable', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, {
    deductionMode: 'itemized', itemizedAmount: 0, ordinary: 60000, bracketId: 'b3'
  });

  /* Every displayed value exposes a contextual tooltip reachable by keyboard focus. */
  const values = page.locator('[data-rl-value]');
  const count = await values.count();
  expect(count).toBeGreaterThan(0);
  const coverage = await values.evaluateAll((nodes) => nodes.map((node) => {
    const id = node.getAttribute('aria-describedby');
    const tip = id ? document.getElementById(id) : null;
    return {
      field: node.getAttribute('data-rl-value'),
      focusable: node.getAttribute('tabindex') === '0',
      role: tip ? tip.getAttribute('role') : null,
      length: tip ? tip.textContent.trim().length : 0
    };
  }));
  coverage.forEach((entry) => {
    expect(entry.focusable).toBe(true);
    expect(entry.role).toBe('tooltip');
    expect(entry.length).toBeGreaterThan(40);
  });

  const first = values.first();
  await first.focus();
  await expect(first).toBeFocused();
  const describedBy = await first.getAttribute('aria-describedby');
  await expect(page.locator(`#${describedBy}`)).toBeVisible();

  /* Every chart has a text-equivalent table carrying the same points, reachable without the chart. */
  await openPower(page);
  await expect(page.locator('#curveChart')).toHaveAttribute('data-rl-curve-drawn', 'true');
  const tableRows = await page.locator('#curveTextEquivalentBody tr').count();
  expect(tableRows).toBeGreaterThan(50);
  await page.locator('#curveTextEquivalent').evaluate((node) => { node.setAttribute('tabindex', '0'); node.focus(); });
  await expect(page.locator('#curveTextEquivalent')).toBeFocused();

  /* Every unavailable domain is focusable and states its reason and its remediation. */
  const unavailable = page.locator('[data-rl-unavailable]');
  const unavailableCount = await unavailable.count();
  expect(unavailableCount).toBeGreaterThan(0);
  const rendered = await unavailable.evaluateAll((nodes) => nodes.map((node) => ({
    focusable: node.getAttribute('tabindex') === '0',
    code: node.getAttribute('data-rl-unavailable') || '',
    text: node.textContent.trim()
  })));
  rendered.forEach((entry) => {
    expect(entry.focusable).toBe(true);
    expect(entry.code).toMatch(/^RLTAX-/);
    expect(entry.text).toContain('Unavailable because');
    expect(entry.text).toContain('What would make it available:');
    expect(entry.text).not.toBe('');
    expect(entry.text).not.toBe('-');
    expect(entry.text).not.toBe('0');
    expect(entry.text).not.toBe('\u2014');
  });

  /* SUP-024-11: supersedes `await unavailable.first().focus(); await expect(unavailable.first())
     .toBeFocused();`; shape=strengthen. The superseded pair focused whichever node happened to be
     first in DOCUMENT order, which is a Simple-view node that is hidden while Power is active, so
     the focus was a silent no-op and the assertion failed on a node the user cannot reach in this
     view rather than on any real defect. The replacement is view-aware: it sweeps EVERY VISIBLE
     unavailable node in Power and then every visible one in Simple, focusing each and reading
     focus back, and requires a non-zero visible count in each view so a sweep over an empty set
     cannot pass. Strictly stronger because the superseded form proved one arbitrary node in one
     view was focusable while the replacement proves every reachable node in both views is, and
     because it is order-independent — it assumes nothing about which node is first.
     Ledger: specs/024-social-security-and-medicare/spec.md#supersession-ledger */
  const sweepVisibleUnavailable = async (view) => {
    const visible = page.locator('[data-rl-unavailable]:visible');
    const visibleCount = await visible.count();
    /* Guards the sweep against vacuous success: an empty set would satisfy every per-node
       assertion below without exercising one of them. */
    expect(visibleCount, `${view} renders at least one visible unavailable node`).toBeGreaterThan(0);
    for (let index = 0; index < visibleCount; index += 1) {
      const node = visible.nth(index);
      const code = await node.getAttribute('data-rl-unavailable');
      const domain = await node.getAttribute('data-rl-unavailable-domain');
      const body = (await node.textContent()).trim();
      const where = `${view} visible unavailable node ${index} (${code})`;
      expect(code, `${where} names its code`).toMatch(/^RLTAX-/);
      expect(domain, `${where} names its domain`).toBeTruthy();
      expect(body, `${where} states its reason`).toContain('Unavailable because');
      expect(body, `${where} states its remediation`).toContain('What would make it available:');
      /* Focus is exercised rather than inferred from the tabindex attribute, so a node that
         carries tabindex="0" but cannot actually take focus fails here. */
      await node.focus();
      await expect(node, `${where} is keyboard focusable`).toBeFocused();
    }
    return visibleCount;
  };

  const powerUnavailable = await sweepVisibleUnavailable('Power');
  await page.locator('#modeSimple').click();
  const simpleUnavailable = await sweepVisibleUnavailable('Simple');
  /* Neither view is allowed to be the only one carrying a refusal: an unavailable figure is
     decision-level information rather than a Power-only drill-down detail. */
  expect(powerUnavailable).toBeGreaterThan(0);
  expect(simpleUnavailable).toBeGreaterThan(0);
});

test('Regression: SCN-021-014 tax and account tables stay readable at the mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, {
    deductionMode: 'itemized', itemizedAmount: 0, ordinary: 60000, bracketId: 'b3'
  });
  await openPower(page);

  /* No table is horizontally trapped: each one sits inside its own scroll container rather than
     forcing the whole document into horizontal scroll. */
  const documentOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(documentOverflow).toBeLessThanOrEqual(1);

  const tableIds = ['storageInventory', 'ruleLedger', 'featureLedger', 'settlementStages',
    'bracketDetail', 'reconciliation', 'curveTextEquivalent', 'policyComparison', 'notModeledDetail'];
  const containers = await page.evaluate((ids) => ids.map((id) => {
    const table = document.getElementById(id);
    const host = table ? table.closest('.table-scroll') : null;
    return { id, hasTable: !!table, scoped: !!host, visible: !!table && table.getBoundingClientRect().width > 0 };
  }), tableIds);
  containers.forEach((entry) => {
    expect(entry.hasTable).toBe(true);
    expect(entry.scoped).toBe(true);
    expect(entry.visible).toBe(true);
  });

  /* A stable control does not resize because a label grew. */
  const before = await page.locator('#modePower').boundingBox();
  await page.fill('#inputOrdinary', '987654321');
  await expect(page.locator('#truthState')).toHaveText('Settled');
  const after = await page.locator('#modePower').boundingBox();
  expect(Math.round(after.width)).toBe(Math.round(before.width));
  expect(Math.round(after.height)).toBe(Math.round(before.height));
});

test('Regression: SCN-021-015 a private export happens only on explicit action, the request ledger does not grow after first paint, and every entry is a declared same-origin read', async ({ page }) => {
  const ledger = collectRequests(page);
  const consoleMessages = collectConsole(page);
  const downloads = [];
  page.on('download', (download) => downloads.push(download));

  await openLifetimeTax(page, site);
  const afterFirstPaint = ledger.length;
  /* TP-05-18. Without this pin every ledger assertion in this row is a filter over a snapshot that
     a boot reading NOTHING satisfies: `afterFirstPaint` would be 0, the no-growth check below would
     read `expect(0).toBe(0)`, and the declared-asset sweep would compare two empty arrays. The row
     would pass while covering nothing. */
  expect(afterFirstPaint).toBeGreaterThan(0);
  /* The sensitivity warning is rendered before any file can exist, and the control is disabled
     until the reader acknowledges it. */
  await expect(page.locator('#exportWarning')).toContainText('It is written only when you ask for it');
  await expect(page.locator('#exportPrivateFile')).toBeDisabled();
  await expect(page.locator('#privacyResult')).toContainText('No file has been written');

  await declareOrdinaryHousehold(page, {
    deductionMode: 'itemized', itemizedAmount: 0, ordinary: SENTINEL_ORDINARY,
    bracketId: 'b3', fundingSource: 'outside-funds'
  });
  expect(downloads.length).toBe(0);

  await page.locator('#exportAcknowledgement').check();
  await expect(page.locator('#exportPrivateFile')).toBeEnabled();
  expect(downloads.length).toBe(0);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#exportPrivateFile').click()
  ]);
  expect(downloads.length).toBe(1);
  expect(download.suggestedFilename()).toBe('lifetime-tax-workspace.json');

  const path = await download.path();
  const written = JSON.parse(readFileSync(path, 'utf8'));
  expect(written.contractVersion).toBe('LifetimeTaxExport/v1');
  expect(written.warning.length).toBeGreaterThan(40);
  expect(written.omittedFields).toContain('generation');
  expect(written.omittedFields).toContain('updatedAt');
  expect(written.omittedFields).toContain('declaredUnavailableDomains');
  expect(written.neverCollected).toEqual(['name', 'postal-address', 'account-number', 'tax-identifier', 'credential']);
  expect(String(written.workspace.income.ordinary)).toBe(SENTINEL_ORDINARY);
  /* The identifier scan runs over the export MINUS its own never-collected disclosure. That array
     exists to NAME the categories the tool refuses to collect, so scanning it reports the
     guarantee itself as a violation. Excluding it is sound only because the assertion directly
     above pins it to its exact five declared members, so no value can hide inside it. Everything
     else the file carries — every key and every value, including omittedFields and the whole
     workspace — still faces the unchanged scan. */
  const scanned = JSON.parse(JSON.stringify(written));
  delete scanned.neverCollected;
  const flattened = JSON.stringify(scanned).toLowerCase();
  /* The scanned surface still reaches the household members, so a real leak cannot slip past. */
  expect(flattened).toContain('"ordinary"');
  expect(flattened).toContain('"omittedfields"');
  expect(flattened).toContain(SENTINEL_ORDINARY);
  ['"name"', '"address"', '"accountnumber"', '"taxidentifier"', '"credential"', '"ssn"', '"email"']
    .forEach((identifier) => expect(flattened).not.toContain(identifier));
  await expect(page.locator('#privacyResult')).toHaveAttribute('data-rl-export-written', 'true');
  await expect(page.locator('#privacyResult')).toContainText('omits these workspace members');

  /* Not one request was issued after first paint: not by the entry pass, not by the computation,
     not by the view switch, and not by the export. */
  await openPower(page);
  expect(ledger.length).toBe(afterFirstPaint);
  /* TP-01-18. The origin half, via the shared helper. A pathname is not an origin: the sweep two
     lines down accepts `https://elsewhere.example/rltaxstrategy.js` because its PATHNAME is
     declared. This refuses it. */
  const paths = sameOriginPaths(ledger, site);
  /* SUP-023-10. See the companion replacement in lifetime-tax-foundation.spec.mjs. The permitted
     asset set is derived from the route's own script tags and its declared configuration and
     rule pack, so Scope 01's added module is absorbed without weakening the promise that nothing
     the page did not declare may ever be requested. */
  const declaredAssets = declaredRouteAssets();
  expect(paths.filter((entry) => !declaredAssets.includes(entry))).toEqual([]);
  expect(declaredAssets).toContain('/rltaxproperty.js');
  expect(declaredAssets).not.toContain('/definitely-not-declared-by-this-route.js');
  expect(ALLOWED_ASSET_PATHS.every((path) => declaredAssets.includes(path))).toBe(true);
  /* SUP-024-09 ADVERSARIAL. See the companion in lifetime-tax-foundation.spec.mjs. The benefit
     family the superseded three-key derivation excluded is present, and a member of `config.rules`
     that is not a pack path is not mistaken for one. */
  expect(declaredAssets).toContain('/tax-rules/benefit/2026.json');
  expect(declaredPackPaths({ rules: { packContentSha256: 'sha256:not-a-path' } })).toEqual([]);
  expect(ledger.some((entry) => entry.url.includes(SENTINEL_ORDINARY))).toBe(false);
  expect(ledger.some((entry) => entry.postData.includes(SENTINEL_ORDINARY))).toBe(false);
  expect(consoleMessages).toEqual([]);

  const location = await page.evaluate(() => ({
    search: window.location.search, hash: window.location.hash,
    href: window.location.href, referrer: document.referrer
  }));
  expect(location.search).toBe('');
  expect(location.hash).toMatch(/^#(simple|power)$/);
  expect(location.href.includes(SENTINEL_ORDINARY)).toBe(false);
  expect(location.referrer).toBe('');

  /* The clear removes exactly this tool's declared keys and leaves a foreign key standing. */
  await page.evaluate(() => window.localStorage.setItem('rlPortfolioWorkspaceV1.workspace', 'foreign-value'));
  await page.locator('#clearAllPrivateData').click();
  await expect(page.locator('#privacyResult')).toContainText('Removed exactly these keys');
  const remaining = await page.evaluate(() => {
    const keys = [];
    let index = 0;
    for (index = 0; index < window.localStorage.length; index += 1) keys.push(window.localStorage.key(index));
    return keys.sort();
  });
  expect(remaining).toContain('rlPortfolioWorkspaceV1.workspace');
  expect(remaining.some((key) => key.indexOf('rlLifetimeTaxV1.') === 0)).toBe(false);

  /* The tool is still absent from every registration surface after the feature is complete. */
  ['tools.json', 'index.html', 'rlnav.js', 'README.md', 'notes/README.md', 'market-brief.config.json']
    .forEach((file) => {
      const source = readFileSync(join(ROOT, file), 'utf8');
      expect(source).not.toContain('lifetime-tax');
      expect(source).not.toContain('rltaxstrategy');
    });
});
