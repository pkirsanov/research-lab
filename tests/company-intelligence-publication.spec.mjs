/* Company Intelligence is intentionally dormant until its coupled publication
 * package can be regenerated. Keep that state deploy-safe: no public registry,
 * navigation card, or Pages artifact may expose a partially acknowledged pair. */
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROUTE = 'company-intelligence-lab.html';
const TOOL_ID = 'company-intelligence-lab';
const DORMANT_PATHS = Object.freeze([ROUTE, 'rlcompanyintel.js', 'company-intelligence.config.json']);
const readJson = (relative) => JSON.parse(readFileSync(join(ROOT, relative), 'utf8'));

test('Regression: dormant Company Intelligence has no public registry or catalogue route', async ({ page }) => {
  expect(readJson('tools.json').tools.filter((tool) => tool.id === TOOL_ID)).toHaveLength(0);
  const site = await startStaticServer({ root: ROOT });
  try {
    await page.goto(`${site.baseUrl}/index.html`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator(`.card[data-tool-id="${TOOL_ID}"]`)).toHaveCount(0);
    await page.locator('#rlnav-launcher').click();
    await expect(page.locator(`#rlnav a.rlnav-item[href="${ROUTE}"]`)).toHaveCount(0);
  } finally { await site.close(); }
});

test('Regression: Pages excludes the dormant Company Intelligence dependency set', async ({ request }) => {
  const destination = `.rl-company-dormant-site-${process.pid}`;
  const siteRoot = join(ROOT, destination);
  let site;
  try {
    const builder = await import('../scripts/build-pages-site.mjs');
    const plan = builder.buildPagesSite({ root: ROOT, destination });
    expect(plan.companyPublication.active).toBe(false);
    expect(plan.companyPublication.requiredPaths).toEqual([]);
    for (const relative of DORMANT_PATHS) expect(existsSync(join(siteRoot, relative))).toBe(false);
    site = await startStaticServer({ root: siteRoot });
    for (const relative of DORMANT_PATHS) expect((await request.get(`${site.baseUrl}/${relative}`)).status()).toBe(404);
  } finally {
    if (site) await site.close();
    if (existsSync(siteRoot)) rmSync(siteRoot, { recursive: true, force: true });
  }
});
