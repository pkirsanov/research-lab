import { readFileSync } from 'node:fs';

import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './provider-credentials.support.mjs';

/*
 * Narrative freshness.
 *
 * The written (Tier-B) read is operator-hosted and can silently stop refreshing while the computed
 * (Tier-A) layer below it keeps updating in the browser. The failure this locks out is the page
 * presenting last week's narrative as if it were this morning's — which is not a cosmetic defect,
 * it is the product lying about the one thing a market brief is for.
 *
 * REAL-STACK, ZERO INTERCEPTION. The static server substitutes a whole payload FILE, exactly as a
 * missed publishing window would produce on the real site. There is no page.route / context.route /
 * intercept / msw / nock: the page fetches a real file over HTTP and the shipped renderer decides.
 */

const REAL_PAYLOAD = JSON.parse(readFileSync(new URL('../market-brief.page.json', import.meta.url), 'utf8'));
const POLICY = JSON.parse(readFileSync(new URL('../market-brief.config.json', import.meta.url), 'utf8'))['freshness-policy/v1'];

/** The committed payload, restamped — same content, different generation time. */
function payloadAgedHours(hours) {
  return JSON.stringify({ ...REAL_PAYLOAD, generatedAt: new Date(Date.now() - hours * 3600000).toISOString() });
}

async function openBrief(page, server) {
  await page.goto(`${server.baseUrl}/market-brief.html`);
  await expect(page.locator('#scorecard')).toBeVisible();
}

test('a narrative refreshed within the window shows no banner at all', async ({ page }) => {
  test.setTimeout(90_000);
  const server = await startStaticServer({
    overrides: { 'market-brief.page.json': payloadAgedHours(2) }
  });
  try {
    await openBrief(page, server);
    // Silence is the correct output when the read is current. A permanent "all good" strip is
    // chrome the eye learns to skip — which is exactly what you do not want the day it changes.
    await expect(page.locator('#freshbar')).toBeHidden();
  } finally {
    await server.close();
  }
});

test('a normal overnight gap does NOT raise the banner', async ({ page }) => {
  test.setTimeout(90_000);
  // The largest legitimate weekday gap is 17:00 ET to 07:30 ET (~14.5h). If the banner fired inside
  // that, it would cry wolf every single morning and be ignored on the morning it mattered.
  const server = await startStaticServer({
    overrides: { 'market-brief.page.json': payloadAgedHours(POLICY.warnAfterHours - 3.5) }
  });
  try {
    await openBrief(page, server);
    await expect(page.locator('#freshbar')).toBeHidden();
  } finally {
    await server.close();
  }
});

test('a narrative past the warn threshold says so, in plain words, above the brief', async ({ page }) => {
  test.setTimeout(90_000);
  const server = await startStaticServer({
    overrides: { 'market-brief.page.json': payloadAgedHours(POLICY.warnAfterHours + 2) }
  });
  try {
    await openBrief(page, server);
    const bar = page.locator('#freshbar');
    await expect(bar).toBeVisible();
    await expect(bar).toHaveAttribute('data-freshness', 'aging');
    await expect(bar).toContainText('missed at least one scheduled window');

    // It must be read BEFORE the claims it qualifies, not found afterwards.
    const before = await page.evaluate(() => {
      const bar = document.getElementById('freshbar');
      const card = document.getElementById('scorecard');
      return (bar.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
    });
    expect(before).toBe(true);
  } finally {
    await server.close();
  }
});

test('a long-stale narrative is called stale, not merely aging', async ({ page }) => {
  test.setTimeout(90_000);
  const server = await startStaticServer({
    overrides: { 'market-brief.page.json': payloadAgedHours(POLICY.staleAfterHours + 6) }
  });
  try {
    await openBrief(page, server);
    const bar = page.locator('#freshbar');
    await expect(bar).toBeVisible();
    await expect(bar).toHaveAttribute('data-freshness', 'stale');
    await expect(bar).toContainText('Treat it as history, not as today');
  } finally {
    await server.close();
  }
});

test('a missing narrative renders the honest not-refreshed state, never a fresh one', async ({ page }) => {
  test.setTimeout(90_000);
  // Tier-B did not publish at all this window. The computed layer below is still current, and the
  // page must say exactly that rather than silently showing whatever it last had.
  const server = await startStaticServer({
    overrides: { 'market-brief.page.json': '{}' }
  });
  try {
    await openBrief(page, server);
    const bar = page.locator('#freshbar');
    await expect(bar).toBeVisible();
    await expect(bar).toHaveAttribute('data-freshness', 'absent');
    await expect(bar).toContainText('Narrative not refreshed this window');

    // ADVERSARIAL: absence must not be silently equivalent to freshness. If the renderer treated a
    // missing generatedAt as "fresh" the banner would be hidden here and every other assertion in
    // this file would still pass, because they all use a PRESENT timestamp.
    await expect(bar).not.toHaveAttribute('data-freshness', 'fresh');
  } finally {
    await server.close();
  }
});
