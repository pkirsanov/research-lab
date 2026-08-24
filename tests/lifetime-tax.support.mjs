import { expect } from './playwright-runtime.mjs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

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

/* The permitted-asset set, DERIVED from the route's own `<script src>` tags and from every pack
   path the configuration declares, so a pack a later scope introduces is admitted by its own
   declaration rather than by a literal edited here.

   Ten spec files held a byte-identical copy of this derivation. They are one function now, not
   because ten copies were untidy but because ten copies are ten places an admission could be
   widened, and a widened admission is exactly what this set exists to refuse. The two callers
   that parameterise the configuration path keep their own derivation: collapsing those would
   hard-code a path they deliberately made a variable. */
export function declaredRouteAssets() {
  const routeSource = readFileSync(join(ROOT, 'lifetime-tax-strategy-lab.html'), 'utf8');
  const config = JSON.parse(readFileSync(join(ROOT, 'lifetime-tax-strategy.config.json'), 'utf8'));
  const scripts = Array.from(routeSource.matchAll(/<script src="([^"]+)"><\/script>/g))
    .map((match) => '/' + match[1]);
  const packs = declaredPackPaths(config).map((path) => '/' + path);
  return ['/lifetime-tax-strategy-lab.html', '/lifetime-tax-strategy.config.json']
    .concat(scripts).concat(packs).concat(['/favicon.ico']);
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
   The message names the offending URLs because the pathname alone cannot show what went wrong.

   The refusal is a CONJUNCTION of two limbs, not one test written twice. The prefix limb is the
   original: it rejects an origin that shares no leading text with the route's own. The parsed-origin
   limb is added because a prefix is not an origin. A URL may begin with the whole base URL and
   still be served by somebody else: `http://127.0.0.1:8123@evil.example/rltaxstrategy.js` starts
   with `http://127.0.0.1:8123`, carries a declared pathname, and has origin `http://evil.example`,
   because everything before the `@` is userinfo rather than a host. The prefix limb alone admits
   it. An entry must clear BOTH limbs to be counted local. `SCN-021-002` in
   lifetime-tax-foundation.spec.mjs holds that case so the second limb is asserted rather than
   merely present. */
export function sameOriginPaths(ledger, site) {
  const routeOrigin = new URL(site.baseUrl).origin;
  const foreign = ledger.filter((entry) => !entry.url.startsWith(site.baseUrl)
    || new URL(entry.url).origin !== routeOrigin);
  expect(foreign.map((entry) => entry.url),
    'every request the route issued is same-origin: a declared pathname served from an undeclared origin is a leak')
    .toEqual([]);
  return ledger.map((entry) => new URL(entry.url).pathname);
}

/* The parts of a URL a declared household value could actually reach. The origin belongs to the
   harness, never to the household, and an ephemeral port is a decimal number that can contain a
   short declared value outright — 127.0.0.1:43131 holds "43", 127.0.0.1:19640 holds "1964".
   Scanning a whole URL for such a sentinel fails on the port, which is not what the leak
   requirement is about, so every leak scan reads the pathname, query and fragment instead. The
   origin is already constrained by sameOriginPaths, so nothing is given up here. */
export function leakCarriers(url) {
  const target = new URL(url);
  return target.pathname + target.search + target.hash;
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
