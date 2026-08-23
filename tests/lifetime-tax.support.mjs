import { expect } from './playwright-runtime.mjs';

export const LIFETIME_TAX_ROUTE = '/lifetime-tax-strategy-lab.html';

/* A distinctive household figure. It legitimately appears in the DOM and in this tool's own
   local-storage namespace, which is the point. It must appear nowhere else. */
export const SENTINEL_ORDINARY = '123457';

/* Every local asset the route is allowed to read. The ledger assertion is that nothing outside
   this closed set is ever requested, and that NOTHING AT ALL is requested after first paint. */
export const ALLOWED_ASSET_PATHS = [
  '/lifetime-tax-strategy-lab.html',
  '/rltaxrules.js',
  '/rltaxworkspace.js',
  '/rltax.js',
  '/rltaxstrategy.js',
  '/lifetime-tax-strategy.config.json',
  '/tax-rules/federal/2026.json',
  '/favicon.ico'
];

/* SUP-024-09. Every pack path the configuration declares, whatever family it belongs to. A member
   of `config.rules` whose name ends in `packPath`/`PackPath` is one declared path; a member whose
   name ends in `PackPaths` is a map whose values are declared paths. Nothing else in `config.rules`
   is a path and nothing else is read \u2014 `packContentSha256` in particular is not.

   This is the pack half of the permitted-asset derivation the three privacy-ledger specs share.
   Deriving the FAMILY SET as well as the paths is the point: SUP-023-10 already derived the paths
   but named the three families one key at a time, so a feature adding a fourth had to hand-edit
   three copies of that key list, and such an edit is indistinguishable from one admitting a leak.
   Reading the families off the configuration means a pack family is admitted by the page's own
   declaration and a request to a pack the configuration never declared is still a failure. */
export function declaredPackPaths(config) {
  return Object.keys(config.rules).filter((key) => /[Pp]ackPaths?$/.test(key)).sort()
    .reduce((paths, key) => {
      const declared = config.rules[key];
      return paths.concat(typeof declared === 'string'
        ? [declared]
        : Object.keys(declared).map((inner) => declared[inner]));
    }, []);
}

export function collectRequests(page) {
  const ledger = [];
  page.on('request', (request) => ledger.push({
    url: request.url(),
    method: request.method(),
    postData: request.postData() || ''
  }));
  return ledger;
}

/* TP-01-18. The ORIGIN half of the ledger contract, folded into the shared surface rather than
   repeated per row. A row that compares `new URL(entry.url).pathname` against its declared-asset
   set constrains the path and nothing else, so a read of
   `https://elsewhere.example/rltaxstrategy.js` — a declared pathname served from an origin the
   route never declared — satisfies it. That is the shape a leak takes: the household's own
   modules, fetched from somewhere that can log the fetch. This helper refuses on origin FIRST and
   only then hands back the pathnames, so every caller gains the origin constraint by calling it.
   The message names the offending URLs because the pathname alone cannot show what went wrong. */
export function sameOriginPaths(ledger, site) {
  const foreign = ledger.filter((entry) => !entry.url.startsWith(site.baseUrl));
  expect(foreign.map((entry) => entry.url),
    'every request the route issued is same-origin: a declared pathname served from an undeclared origin is a leak')
    .toEqual([]);
  return ledger.map((entry) => new URL(entry.url).pathname);
}

export function collectConsole(page) {
  const messages = [];
  page.on('console', (message) => messages.push(message.text()));
  return messages;
}

export async function openLifetimeTax(page, site) {
  await page.goto(`${site.baseUrl}${LIFETIME_TAX_ROUTE}`);
  await expect(page.locator('body')).toHaveAttribute('data-rl-tax-state', 'ready', { timeout: 30000 });
  return page;
}

/* A minimum-viable single household with only ordinary income: the one shape the shipped pack
   can settle end to end, because its preferential rate table is a declared AbsentFigure. */
export async function declareOrdinaryHousehold(page, options) {
  const settings = options || {};
  await page.selectOption('#inputFilingStatus', settings.filingStatus || 'single');
  await page.selectOption('#inputTaxYear', '2026');
  await page.selectOption('#inputDeductionMode', settings.deductionMode || 'standard');
  if (settings.itemizedAmount !== undefined) await page.fill('#inputItemizedAmount', String(settings.itemizedAmount));
  await page.fill('#inputOrdinary', String(settings.ordinary === undefined ? SENTINEL_ORDINARY : settings.ordinary));
  if (settings.qualifiedDividend !== undefined) await page.fill('#inputQualifiedDividend', String(settings.qualifiedDividend));
  if (settings.longTermCapitalGain !== undefined) await page.fill('#inputLongTermCapitalGain', String(settings.longTermCapitalGain));
  /* Fixture Input Completion Register (scope 02, FIC-1/FIC-4): this test household declares both
     surtax bases at zero. A zero is a real declaration of no such amount, so both surtax legs
     compute a real zero and no pre-existing settled figure moves. */
  await page.fill('#inputOtherNetInvestmentIncome', settings.otherNetInvestmentIncome === undefined
    ? '0' : String(settings.otherNetInvestmentIncome));
  await page.fill('#inputMedicareWageBasis', settings.medicareWageBasis === undefined
    ? '0' : String(settings.medicareWageBasis));
  if (settings.fundingSource) await page.selectOption('#inputFundingSource', settings.fundingSource);
  if (settings.bracketId) await page.selectOption('#inputBracket', settings.bracketId);
  await expect(page.locator('#truthState')).toHaveText('Settled');
}

export async function openPower(page) {
  await page.locator('#modePower').click();
  await expect(page.locator('#modePower')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#power')).toBeVisible();
}

export function tableRows(page, tbodyId) {
  return page.locator(`#${tbodyId} tr`);
}

export async function rowByFirstCell(page, tbodyId, label) {
  return page.locator(`#${tbodyId} tr`).filter({ has: page.locator(`td:text-is("${label}")`) }).first();
}
