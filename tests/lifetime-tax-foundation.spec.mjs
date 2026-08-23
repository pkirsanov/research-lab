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
const CONFIG_PATH = 'lifetime-tax-strategy.config.json';
const PACK_PATH = 'tax-rules/federal/2026.json';

/* SUP-023-10, as replaced by SUP-024-09. The asset set the route is permitted to request, derived
   from the route itself rather than pinned as a literal: the document, every module the page
   declares in a script tag, the configuration it is required to read, and the packs that
   configuration names. Deriving it means a module added to the page is admitted by the page's own
   declaration and a request to anything the page never declared is still a failure. The favicon is
   the one member that is not a page declaration at all — the browser asks for it unprompted — so it
   is named here as the browser default rather than smuggled into the derivation.

   SUP-024-09 supersedes the pack half of that derivation, which named `packPath`, `statePackPaths`
   and `propertyPackPaths` one key at a time. Feature 024 Scope 01 adds a fourth pack family, and a
   hand-listed key set has the same defect the hand-listed module list had before SUP-023-10: it
   must be edited to admit a new family, and that edit is indistinguishable from one admitting a
   leak. The replacement derives the pack set from EVERY pack-path member `config.rules` declares —
   a string member is one path, a map member is its values — so a pack family this feature's later
   scopes add is admitted by the configuration's own declaration and never by an edit here, while a
   request to a pack the configuration never declared is still a failure. */
function declaredRouteAssets() {
  const routeSource = readFileSync(join(ROOT, 'lifetime-tax-strategy-lab.html'), 'utf8');
  const config = JSON.parse(readFileSync(join(ROOT, CONFIG_PATH), 'utf8'));
  const scripts = Array.from(routeSource.matchAll(/<script src="([^"]+)"><\/script>/g))
    .map((match) => '/' + match[1]);
  const packs = declaredPackPaths(config).map((path) => '/' + path);
  return ['/lifetime-tax-strategy-lab.html', '/' + CONFIG_PATH]
    .concat(scripts).concat(packs).concat(['/favicon.ico']);
}

/* F-REG-02. The module half of the derivation above, on its own, because the vacuity pin below
   needs to name what the boot must actually have read rather than only what it may not read.
   Derived for the same reason the permitted set is derived: a module a later scope adds moves the
   expectation with it, while a boot that stopped loading its modules still fails. */
function declaredRouteModules() {
  const routeSource = readFileSync(join(ROOT, 'lifetime-tax-strategy-lab.html'), 'utf8');
  return Array.from(routeSource.matchAll(/<script src="([^"]+)"><\/script>/g))
    .map((match) => '/' + match[1]);
}

/* SUP-023-07 and SUP-023-08. The storage inventory's promise is that every key this tool writes
   is described there. Deriving the expected row count from the inventory's own declared key set
   rather than pinning a literal means a key added by a later scope moves the expectation with it,
   while a key written without an inventory entry still fails. */
async function expectInventoryDescribesEveryDeclaredKey(page) {
  const config = JSON.parse(readFileSync(join(ROOT, CONFIG_PATH), 'utf8'));
  const declaredKeys = [config.storage.workspaceKey, config.storage.pointerKey, config.storage.probeKey];
  await expect(page.locator('#storageInventoryBody tr')).toHaveCount(declaredKeys.length);
  const rowKeys = await page.locator('#storageInventoryBody tr td:first-child')
    .evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
  declaredKeys.forEach((key) => expect(rowKeys).toContain(key));
  rowKeys.forEach((key) => expect(declaredKeys).toContain(key));
  /* The inventory must SAY that the workspace key carries household values, including the
     housing declarations this feature added, rather than merely listing the key. */
  await expect(page.locator('#storageInventoryBody')).toContainText('assessed value');
  await expect(page.locator('#storageInventoryBody')).toContainText('acquisition-debt balance');
}

const federalPack = JSON.parse(readFileSync(join(ROOT, PACK_PATH), 'utf8'));
const FIGURE_GROUPS = ['standardDeductions', 'ordinaryRateTables', 'preferentialRateTables'];

/* Counts read off the pack the page renders, so a figure the pack gains or loses moves the
   expectation with it instead of rotting into a false green. */
const packContributorCount = () =>
  federalPack.unsupportedFeatures.filter((feature) => feature.movesMarginalRate === true).length;
const packAbsentFigureCount = () => FIGURE_GROUPS.reduce((total, group) => total
  + Object.keys(federalPack[group])
    .filter((status) => federalPack[group][status].contractVersion === 'AbsentFigure/v1').length, 0);

/* The preferential tax the PACK's own table implies for a gain stacked on ordinary taxable
   income. Derived, never spelled. */
const packPreferentialTax = (ordinaryTaxable, preferential) => {
  let tax = 0;
  federalPack.preferentialRateTables.single.bands.forEach((band) => {
    const bandTop = band.upperExclusive === null ? Number.MAX_SAFE_INTEGER : band.upperExclusive;
    const from = Math.max(band.lowerInclusive, ordinaryTaxable);
    const to = Math.min(bandTop, ordinaryTaxable + preferential);
    if (to > from) tax += (to - from) * band.rate;
  });
  return tax;
};

const configWithRules = (overrides) => {
  const config = JSON.parse(readFileSync(join(ROOT, CONFIG_PATH), 'utf8'));
  config.rules = Object.assign(config.rules, overrides);
  return JSON.stringify(config);
};

/* An absent-preferential-table pack this file controls. ASC-7 forbids a retained "absent" branch
   that runs against a pack state which may be empty, so the refusal rule Feature 021 proved
   incidentally is proven here deliberately, and keeps being proven after every shipped status
   resolves. The digest is distinct and the config pin is moved with it, so the pack pointer the
   route enforces is exercised rather than bypassed. */
const ABSENT_TABLE_DIGEST = 'sha256:' + '0'.repeat(63) + '1';
const absentPreferentialTablePack = () => {
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
        locator: 'Deliberately unretrieved so the refusal branch is never vacuous.'
      }
    };
  });
  pack.contentSha256 = ABSENT_TABLE_DIGEST;
  return JSON.stringify(pack);
};
const absentPreferentialTableOverrides = () => ({
  [PACK_PATH]: absentPreferentialTablePack(),
  [CONFIG_PATH]: configWithRules({ packContentSha256: ABSENT_TABLE_DIGEST })
});

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

test('Regression: SCN-021-001 minimum viable input resolves one federal pack and names every unavailable domain', async ({ page }) => {
  await openLifetimeTax(page, site);

  /* Before any declaration the route names what is missing and shows no placeholder figure. */
  await expect(page.locator('#truthState')).toHaveText('Incomplete');
  const notice = page.locator('#incompleteStateNotice [data-rl-incomplete="true"]');
  await expect(notice).toBeVisible();
  await expect(notice).toContainText('filingStatus');
  await expect(notice).toContainText('income');
  await expect(notice).toContainText('deductionMode');
  expect(await page.locator('[data-rl-value="headlineFederalTax"]').count()).toBe(0);

  /* Exactly one pack, identified by id, version, jurisdiction, declared year, standing and digest. */
  const identity = page.locator('#packIdentityStrip');
  await expect(identity).toContainText('federal-income-tax-2026');
  await expect(identity).toContainText('federal');
  await expect(identity).toContainText('income-tax');
  await expect(identity).toContainText('2026');
  await expect(identity).toContainText('enacted-current-law');
  await expect(identity).toContainText('sha256:');

  await declareOrdinaryHousehold(page, { ordinary: 90000, bracketId: 'b3', fundingSource: 'outside-funds' });
  await expect(page.locator('[data-rl-value="headlineFederalTax"]')).toContainText('$');

  /* Every unavailable domain is named with its code, its reason and its remediation. */
  /* SUP-022-09: supersedes the rendered unavailable-contributor count of 14 and the rendered
     absent-figure count of 4; shape=derive. Both counts now follow the pack the page renders —
     Scope 01 resolves four absent figures and Scope 02 moves two surtaxes out of the contributor
     set, and a literal could only have been re-baselined. Both per-node quality clauses are
     retained unchanged, and the empty-state rule closes the blank-versus-zero hole a literal
     count of four never had to consider.
     Ledger: specs/022-federal-preferential-and-state-income-tax/spec.md#sup-022-09 */
  await openPower(page);
  const contributors = page.locator('#unavailableContributorList [data-rl-unavailable]');
  expect(packContributorCount()).toBeGreaterThan(0);
  expect(await contributors.count()).toBe(packContributorCount());
  await expect(contributors.first()).toContainText('RLTAX-');
  await expect(contributors.first()).toContainText('What would make it available:');
  const absent = page.locator('#absentFigureInventory [data-rl-unavailable]');
  expect(await absent.count()).toBe(packAbsentFigureCount());
  if (packAbsentFigureCount() > 0) {
    await expect(absent.first()).toContainText('RLTAX-THRESHOLD-UNAVAILABLE');
  } else {
    /* A zero count renders an explicit record stating so, never a blank region. */
    await expect(page.locator('#absentFigureInventory')).not.toBeEmpty();
    await expect(page.locator('#absentFigureInventory')).toContainText('carries every figure');
  }
});

test('Regression: SCN-021-002 unsupported year jurisdiction and income kind each refuse without substitution', async ({ page }) => {
  await openLifetimeTax(page, site);

  /* SUP-022-12: supersedes the visible `#headlineBlock [data-rl-unavailable]` node, its code and
     remediation text, the zero count of `[data-rl-value="headlineFederalTax"]` nodes and the
     not-`$0` clause, for the household declaring ordinary income and a long-term capital gain;
     shape=partition. Scope 01 resolves the preferential table for this filing status, so the
     route now PRICES that gain, and a page that still refused it would be the defect. The branch
     below proves the gain is priced rather than that a numeral appeared: raising it across the
     carried preferential breakpoint moves the headline by the amount the pack's own table
     implies. Every superseded clause is retained VERBATIM below, against a pack whose
     preferential table is absent by construction.
     Ledger: specs/022-federal-preferential-and-state-income-tax/spec.md#sup-022-12 */
  const ordinaryTaxable = 40000;
  const firstBreakpoint = federalPack.preferentialRateTables.single.bands[0].upperExclusive;
  const lowerBandRate = federalPack.preferentialRateTables.single.bands[0].rate;
  const upperBandRate = federalPack.preferentialRateTables.single.bands[1].rate;
  const headroom = firstBreakpoint - ordinaryTaxable;
  expect(headroom).toBeGreaterThan(0);
  const belowGain = Math.round(headroom / 2);
  const acrossGain = headroom + belowGain;

  /* The household the scenario names — ordinary income and a long-term capital gain — now
     receives a valued headline instead of a refusal. */
  await declareOrdinaryHousehold(page, { ordinary: 90000, longTermCapitalGain: 20000, bracketId: 'b3' });
  const valuedHeadline = page.locator('[data-rl-value="headlineFederalTax"]');
  await expect(valuedHeadline).toBeVisible();
  await expect(valuedHeadline).toContainText('$');
  expect(await page.locator('#headlineBlock [data-rl-unavailable]').count()).toBe(0);

  /* And the gain is PRICED rather than merely counted: raising it across the pack's own first
     carried preferential breakpoint moves the headline by exactly the amount that table implies.
     Both households sit below every declared surtax threshold, so the movement isolates the
     preferential leg. */
  const asNumber = (value) => Number(value.replace(/[$,]/g, ''));
  await declareOrdinaryHousehold(page, {
    deductionMode: 'itemized', itemizedAmount: 0, ordinary: ordinaryTaxable,
    longTermCapitalGain: belowGain, bracketId: 'b3'
  });
  const belowHeadline = asNumber(await valuedHeadline.textContent());
  await page.fill('#inputLongTermCapitalGain', String(acrossGain));
  await expect(page.locator('#truthState')).toHaveText('Settled');
  const acrossHeadline = asNumber(await valuedHeadline.textContent());
  const impliedMove = packPreferentialTax(ordinaryTaxable, acrossGain)
    - packPreferentialTax(ordinaryTaxable, belowGain);
  expect(acrossHeadline - belowHeadline).toBe(Math.round(impliedMove));
  /* The move straddles two carried bands, so a gain priced entirely at either single rate moves
     the headline by a different amount and fails here. */
  expect(impliedMove).toBeGreaterThan((acrossGain - belowGain) * lowerBandRate);
  expect(impliedMove).toBeLessThan((acrossGain - belowGain) * upperBandRate);

  /* The retained branch, verbatim, against the absent-preferential-table fixture pack. Per ASC-7
     it is asserted to have been exercised rather than left to an empty set. */
  let retainedBranchExercised = 0;
  const absentTableSite = await startStaticServer({ overrides: absentPreferentialTableOverrides() });
  try {
    await page.goto(`${absentTableSite.baseUrl}/lifetime-tax-strategy-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-rl-tax-state', 'ready', { timeout: 30000 });
    await declareOrdinaryHousehold(page, { ordinary: 90000, longTermCapitalGain: 20000, bracketId: 'b3' });
    const headline = page.locator('#headlineBlock [data-rl-unavailable]');
    await expect(headline).toBeVisible();
    await expect(headline).toContainText('RLTAX-THRESHOLD-UNAVAILABLE');
    await expect(headline).toContainText('What would make it available:');
    expect(await page.locator('[data-rl-value="headlineFederalTax"]').count()).toBe(0);
    await expect(page.locator('#headlineBlock')).not.toHaveText(/^\$0$/);
    retainedBranchExercised += 1;
  } finally {
    await absentTableSite.close();
  }
  expect(retainedBranchExercised).toBe(1);

  await page.goto(`${site.baseUrl}/lifetime-tax-strategy-lab.html`);
  await expect(page.locator('body')).toHaveAttribute('data-rl-tax-state', 'ready', { timeout: 30000 });

  /* A declared tax year and a jurisdiction the pack does not carry each refuse by their own code
     rather than resolving a neighbouring pack. */
  const wrongYear = await startStaticServer({
    overrides: { [CONFIG_PATH]: configWithRules({ declaredTaxYear: 2031 }) }
  });
  try {
    await page.goto(`${wrongYear.baseUrl}/lifetime-tax-strategy-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-rl-tax-state', 'pack-blocked', { timeout: 30000 });
    await expect(page.locator('#config-blocked-banner')).toContainText('RLTAX-YEAR-UNSUPPORTED');
    /* SUP-023-07: supersedes the pinned three-row storage-inventory count;
       shape=derive. Feature 023 Scope 01 adds household declarations to the stored workspace, and
       NFR-023-003 requires every stored key to be inventoried. A literal three cannot tell an
       inventory that grew correctly from one that stopped describing what is stored. The
       replacement derives the expected row count from the declared storage inventory itself and
       asserts two-directional key identity between the inventory rows and the keys this tool
       writes, so a stored key added without an inventory entry fails.
       Ledger: specs/023-property-tax-and-rental-income/spec.md#supersession-ledger. */
    await expectInventoryDescribesEveryDeclaredKey(page);
  } finally {
    await wrongYear.close();
  }

  const wrongJurisdiction = await startStaticServer({
    overrides: { [CONFIG_PATH]: configWithRules({ jurisdiction: 'california' }) }
  });
  try {
    await page.goto(`${wrongJurisdiction.baseUrl}/lifetime-tax-strategy-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-rl-tax-state', 'pack-blocked', { timeout: 30000 });
    await expect(page.locator('#config-blocked-banner')).toContainText('RLTAX-JURISDICTION-UNSUPPORTED');
  } finally {
    await wrongJurisdiction.close();
  }
});

test('Regression: SCN-021-003 the tax workspace resolves only its declared reads and keeps every household value local', async ({ page }) => {
  const ledger = collectRequests(page);
  const consoleMessages = collectConsole(page);
  /* F-REG-02. Responses, not just requests: a read that was ATTEMPTED and failed still appears in
     the request ledger, so only a success status proves a declared read actually resolved. */
  const responses = [];
  page.on('response', (response) => responses.push({ url: response.url(), status: response.status() }));
  await openLifetimeTax(page, site);
  const afterFirstPaint = ledger.length;

  await declareOrdinaryHousehold(page, { ordinary: SENTINEL_ORDINARY, bracketId: 'b3', fundingSource: 'withheld' });
  await openPower(page);
  await page.locator('#modeSimple').click();

  /* Every request in the whole session is a same-origin read of one declared local asset.
     F-REG-03. The superseded form refused a foreign origin with a bare `startsWith(site.baseUrl)`,
     which is a prefix test rather than an origin test: `site.baseUrl + "@evil.example"` begins
     with the whole base URL and is served by evil.example. Projecting through the shared helper
     applies both limbs, so this canary refuses the same shapes the six rows now refuse. */
  const paths = sameOriginPaths(ledger, site);
  /* SUP-023-10. The superseded clause filtered against ALLOWED_ASSET_PATHS, a hand-maintained
     literal naming the route's four modules. Feature 023 Scope 01 deliberately adds a fifth, so
     the literal no longer describes the route. The replacement DERIVES the permitted set from
     the route's own declarations, which preserves the original protection — no request may go
     anywhere the page did not declare — and strengthens it: a literal has to be hand-edited to
     admit a new module, and that edit is indistinguishable from one admitting a leak, whereas a
     derived set admits only what the page itself asks for and rots into no false green. */
  const declaredAssets = declaredRouteAssets();
  const unexpected = paths.filter((path) => !declaredAssets.includes(path));
  expect(unexpected).toEqual([]);
  /* SUP-023-10 ADVERSARIAL. A derivation that returned everything, or nothing, would pass the
     filter above for any input and prove nothing. Pin that the set really is the page's own
     declaration set: it contains the module this scope added, it contains the modules that were
     already there, and it rejects an asset the page never declared. */
  expect(declaredAssets).toContain('/rltaxproperty.js');
  expect(declaredAssets).toContain('/rltaxrules.js');
  expect(declaredAssets).toContain('/tax-rules/federal/2026.json');
  expect(declaredAssets).not.toContain('/definitely-not-declared-by-this-route.js');
  expect(ALLOWED_ASSET_PATHS.every((path) => declaredAssets.includes(path))).toBe(true);
  /* SUP-024-09 ADVERSARIAL. The superseded derivation named `packPath`, `statePackPaths` and
     `propertyPackPaths` one key at a time, so it admitted exactly three families and silently
     excluded any fourth — which is precisely how the benefit pack Feature 024 Scope 01 adds became
     an undeclared request. A replacement that merely appended a fourth key would have the same
     defect one family later, and a replacement that returned every string in the configuration
     would admit anything and prove nothing. Pin that this one reads the FAMILY SET off the
     configuration itself: the benefit family the hand-listed set missed is present; a family this
     assertion invents is derived from a configuration that declares it and from nothing else; and
     a `config.rules` member that is not a pack path is never mistaken for one. */
  const routeConfig = JSON.parse(readFileSync(join(ROOT, CONFIG_PATH), 'utf8'));
  expect(declaredAssets).toContain('/tax-rules/benefit/2026.json');
  expect(declaredPackPaths(routeConfig)).toContain('tax-rules/benefit/2026.json');
  /* Both DECLARATION SHAPES, because they are the two ways a family can be silently dropped: the
     string-shaped member whose key begins lower-case, and the map-shaped member whose values are
     the paths. A derivation matching only the capitalised form loses the federal pack itself. */
  expect(declaredPackPaths(routeConfig)).toContain(routeConfig.rules.packPath);
  expect(declaredPackPaths({ rules: { mortalityPackPaths: { 2026: 'tax-rules/mortality/2026.json' } } }))
    .toEqual(['tax-rules/mortality/2026.json']);
  expect(declaredPackPaths({ rules: { packPath: 'tax-rules/federal/2026.json' } }))
    .toEqual(['tax-rules/federal/2026.json']);
  expect(declaredPackPaths(routeConfig)).not.toContain(routeConfig.rules.packContentSha256);
  expect(declaredPackPaths({ rules: { packContentSha256: 'sha256:not-a-path', jurisdiction: 'federal' } }))
    .toEqual([]);

  /* Nothing at all is requested after first paint: entering household values, computing and
     switching view issue no request of any kind. */
  expect(ledger.length).toBe(afterFirstPaint);

  /* F-REG-02 VACUITY PIN. Every ledger assertion above is an empty-set filter over a snapshot:
     `foreign`, `unexpected` and the post-paint equality all hold for a boot that issued NO read at
     all, so a route whose transport stopped working entirely would keep this test green. That is
     the defect this pin closes. `NFR-021-009` is explicit that such a route does not satisfy it —
     "a requirement that could be satisfied by a route that reads nothing is not this requirement:
     the declared reads must still be present and resolvable" — so pin the reads the boot must
     actually have made, at the shape the route declares. Derived rather than literal, so a module
     or pack a later scope adds moves the expectation with it. */
  expect(afterFirstPaint).toBeGreaterThan(0);
  const resolvedPaths = responses
    .filter((response) => response.status >= 200 && response.status < 300)
    .map((response) => new URL(response.url).pathname);
  /* Every module the page declares really loaded. The count is measured, not assumed: it is the
     page's own script-tag set, and an empty derivation would make the forEach vacuous in exactly
     the way this pin exists to prevent. */
  const declaredModules = declaredRouteModules();
  expect(declaredModules.length).toBeGreaterThan(0);
  expect(declaredModules).toContain('/rltax.js');
  declaredModules.forEach((modulePath) => expect(resolvedPaths).toContain(modulePath));
  /* And the route's single network primitive really ran and really succeeded: the configuration
     document and the federal pack it names both returned a success status. A `file://` boot, which
     issues both requests and fails both, is rejected here — attempted is not resolved. */
  expect(resolvedPaths).toContain('/' + CONFIG_PATH);
  expect(resolvedPaths).toContain('/' + PACK_PATH);

  /* The sentinel reaches the DOM and this tool's own namespace, and nothing else. */
  expect(ledger.some((entry) => entry.url.includes(SENTINEL_ORDINARY) || entry.postData.includes(SENTINEL_ORDINARY))).toBe(false);
  expect(consoleMessages.some((message) => message.includes(SENTINEL_ORDINARY))).toBe(false);
  expect(consoleMessages).toEqual([]);

  const location = await page.evaluate(() => ({
    search: window.location.search,
    hash: window.location.hash,
    href: window.location.href,
    referrer: document.referrer
  }));
  expect(location.search).toBe('');
  expect(location.hash).toMatch(/^#(simple|power)$/);
  expect(location.href.includes(SENTINEL_ORDINARY)).toBe(false);
  expect(location.referrer.includes(SENTINEL_ORDINARY)).toBe(false);

  const storage = await page.evaluate(() => {
    const keys = [];
    let index = 0;
    for (index = 0; index < window.localStorage.length; index += 1) keys.push(window.localStorage.key(index));
    return { keys: keys.sort(), workspace: window.localStorage.getItem('rlLifetimeTaxV1.workspace') || '' };
  });
  expect(storage.keys.every((key) => key.indexOf('rlLifetimeTaxV1.') === 0 || key === 'rlLifetimeTaxDisplayMode')).toBe(true);
  expect(storage.keys.some((key) => key.indexOf('rlPortfolio') === 0 || key.indexOf('rlReturnContext') === 0)).toBe(false);
  expect(storage.workspace.includes(SENTINEL_ORDINARY)).toBe(true);
  /* SUP-023-08: supersedes the same literal in the clear-action test; shape=derive. Same cause and
     same replacement, plus the assertion the original could not make: every key the inventory
     describes is a key this tool actually wrote, so the clear action removes exactly the
     inventoried set rather than a fixed three.
     Ledger: specs/023-property-tax-and-rental-income/spec.md#supersession-ledger. */
  await expectInventoryDescribesEveryDeclaredKey(page);
  const inventoriedKeys = await page.locator('#storageInventoryBody tr td:first-child')
    .evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
  inventoriedKeys.forEach((key) => expect(storage.keys).toContain(key));
});

/* TP-01-18. */
test('Regression: SCN-021-002 the shared ledger helper refuses a declared pathname served from an undeclared origin', async ({ page }) => {
  const ledger = collectRequests(page);
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: SENTINEL_ORDINARY, bracketId: 'b3' });

  /* LIVE ARM. On the real route the helper returns the pathnames and refuses nothing, because
     every read the route makes is its own. The greater-than-zero pin is what stops this arm from
     being an assertion about an empty list. */
  const paths = sameOriginPaths(ledger, site);
  expect(paths.length).toBeGreaterThan(0);
  const declaredAssets = declaredRouteAssets();
  paths.forEach((path) => expect(declaredAssets).toContain(path));

  /* ADVERSARIAL ARM, and the reason this row exists. Six rows across Features 021-024 carry the
     words "declared same-origin read" in their titles but assert only
     `new URL(entry.url).pathname` against a declared-asset set. A pathname is not an origin, so a
     read of the route's OWN module from somebody else's host satisfies every one of them while
     carrying the household's request to a third party. Build exactly that entry — a pathname the
     route genuinely declares, an origin it never did — and prove the two checks disagree: the
     pathname-only sweep accepts it, and the shared helper refuses it. */
  const smuggled = [{ url: 'https://elsewhere.example/rltaxstrategy.js', method: 'GET', postData: '' }];
  const smuggledPath = new URL(smuggled[0].url).pathname;
  expect(declaredAssets).toContain(smuggledPath);
  expect(smuggled.map((entry) => new URL(entry.url).pathname)
    .filter((path) => !declaredAssets.includes(path))).toEqual([]);
  expect(() => sameOriginPaths(smuggled, site)).toThrow();

  /* And the refusal is about the ORIGIN, not about the entry being synthetic: the same entry
     re-based on the route's own origin passes the helper and yields the same pathname. */
  const local = [{ url: `${site.baseUrl}/rltaxstrategy.js`, method: 'GET', postData: '' }];
  expect(sameOriginPaths(local, site)).toEqual([smuggledPath]);

  /* SECOND ADVERSARIAL ARM. Refusing on `startsWith(site.baseUrl)` is not refusing on origin,
     and the difference is not academic: everything before an `@` in an authority is userinfo,
     not a host. So this URL begins with the whole base URL, carries a declared pathname, and is
     served by `evil.example`. The prefix test alone hands the household's own modules — and the
     fact that this household loaded them — to a third party. Pin both halves: the prefix limb
     genuinely accepts it, so the assertion below is not a restatement of the arm above, and the
     shipped conjunct refuses it anyway. Without this arm the parsed-origin limb is unasserted,
     and an unasserted guard can be deleted without a single assertion moving. */
  const userinfoSmuggled = `${site.baseUrl}@evil.example/rltaxstrategy.js`;
  expect(userinfoSmuggled.startsWith(site.baseUrl)).toBe(true);
  expect(new URL(userinfoSmuggled).origin).not.toBe(new URL(site.baseUrl).origin);
  expect(declaredAssets).toContain(new URL(userinfoSmuggled).pathname);
  expect(() => sameOriginPaths([{ url: userinfoSmuggled, method: 'GET', postData: '' }], site))
    .toThrow();
});
