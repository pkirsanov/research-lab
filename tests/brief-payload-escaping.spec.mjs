import { readFileSync } from 'node:fs';

import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './provider-credentials.support.mjs';

/*
 * Step 1 security regression: Tier-B model-authored experimental text must remain DATA, never
 * markup. This is a real browser against the shipped market-brief renderer. The server substitutes
 * one whole same-origin payload file; there is no request interception in the browser.
 */

const EXPERIMENTAL = JSON.parse(readFileSync(new URL('../market-brief.experimental.json', import.meta.url), 'utf8'));
const SENTINEL = 'rl-experimental-xss-sentinel';
const MARKUP = `<img id="${SENTINEL}" src="x" onerror="globalThis.__rlInjected = true">`;

test('model-authored experimental title and note render as text, never executable markup', async ({ page }) => {
  test.setTimeout(90_000);
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  const experimental = {
    ...EXPERIMENTAL,
    items: [{ ...EXPERIMENTAL.items[0], title: `Title ${MARKUP}`, note: `Note ${MARKUP}` }]
  };
  const server = await startStaticServer({
    overrides: { 'market-brief.experimental.json': JSON.stringify(experimental) }
  });

  try {
    await page.goto(`${server.baseUrl}/market-brief.html`);
    const host = page.locator('#experimental');
    await expect(page.locator('#scorecard')).toBeVisible();
    await page.locator('#experimentalDrawer summary').click();
    expect(pageErrors, `browser errors before experimental render: ${pageErrors.join(' | ')}`).toEqual([]);
    await expect(host).toContainText(`Title ${MARKUP}`);
    await expect(host).toContainText(`Note ${MARKUP}`);

    // ADVERSARIAL: text assertions alone can pass even if an element was also created. The hostile
    // tag must not exist in the DOM and its handler must never run.
    await expect(page.locator(`#${SENTINEL}`)).toHaveCount(0);
    expect(await page.evaluate(() => globalThis.__rlInjected === true)).toBe(false);

    const cards = await host.locator('.acard').count();
    expect(cards).toBe(1);
  } finally {
    await server.close();
  }
});

test('published legacy experimental id and pattern remain visible during migration', async ({ page }) => {
  const experimental = {
    ...EXPERIMENTAL,
    items: [{
      id: 'legacy-pattern-id',
      pattern: 'Legacy pattern prose remains visible instead of becoming a blank card.',
      method: 'Compatibility-render the already-published legacy fields.',
      inputs: ['one source-qualified input']
    }]
  };
  const server = await startStaticServer({
    overrides: { 'market-brief.experimental.json': JSON.stringify(experimental) }
  });

  try {
    await page.goto(`${server.baseUrl}/market-brief.html`);
    await page.locator('#experimentalDrawer summary').click();
    await expect(page.locator('#experimental')).toContainText('legacy-pattern-id');
    await expect(page.locator('#experimental')).toContainText('Legacy pattern prose remains visible');
  } finally {
    await server.close();
  }
});

for (const failure of [
  { name: 'missing', server: { missing: ['market-brief.experimental.json'] } },
  { name: 'malformed', server: { overrides: { 'market-brief.experimental.json': '{not-json' } } }
]) {
  test(`${failure.name} experimental artifact renders unavailable, never valid emptiness`, async ({ page }) => {
    const server = await startStaticServer(failure.server);
    try {
      await page.goto(`${server.baseUrl}/market-brief.html`);
      await page.locator('#experimentalDrawer summary').click();
      const state = page.locator('#experimental [data-experimental-state="unavailable"]');
      await expect(state).toBeVisible();
      await expect(state).toContainText('Experimental analysis unavailable');
      await expect(page.locator('#experimental')).not.toContainText('Nothing experimental');
    } finally {
      await server.close();
    }
  });
}