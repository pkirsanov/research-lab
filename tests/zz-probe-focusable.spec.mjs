/* TEMPORARY PROBE — deleted before this session ends. Walks the real tab ring in each mode and
   compares it against the rendered focusable inventory, so the keyboard assertion can be written
   against what the page really does rather than a guess. */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from './playwright-runtime.mjs';
import { startStaticServer } from './provider-credentials.support.mjs';

const ROUTE = 'company-intelligence-lab.html';

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

test('probe: tab ring versus rendered focusable inventory', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(`${site.baseUrl}/${ROUTE}?symbol=MSFT`);
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });

    for (const mode of ['simple', 'power']) {
        if (mode === 'power') {
            await page.locator('#mode-power').click();
            await expect(page.locator('body')).toHaveAttribute('data-mode', 'power');
        }

        const expected = await page.evaluate(() => {
            const all = Array.prototype.slice.call(document.querySelectorAll('*'));
            return Array.prototype.slice.call(
                document.querySelectorAll('a[href], button, input, select, textarea, summary, [tabindex]'))
                .filter((node) => {
                    const rect = node.getBoundingClientRect();
                    return rect.width > 0 || rect.height > 0;
                })
                .map((node) => ({
                    docIndex: all.indexOf(node),
                    tag: node.tagName.toLowerCase(),
                    id: node.id || null,
                    inNav: !!node.closest('nav, header, footer, [data-rlnav]'),
                    label: (node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40)
                }));
        });

        await page.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
        const walk = [];
        let firstIndex = null;
        for (let step = 0; step < 400; step++) {
            await page.keyboard.press('Tab');
            const landed = await page.evaluate(() => {
                const node = document.activeElement;
                if (!node || node === document.body || node === document.documentElement) return null;
                const all = Array.prototype.slice.call(document.querySelectorAll('*'));
                return { docIndex: all.indexOf(node), id: node.id || null, tag: node.tagName.toLowerCase() };
            });
            if (landed === null) continue;
            if (firstIndex === null) firstIndex = landed.docIndex;
            else if (landed.docIndex === firstIndex) break;
            walk.push(landed);
        }

        const reached = new Set(walk.map((entry) => entry.docIndex));
        const missed = expected.filter((entry) => !reached.has(entry.docIndex));
        const missedOutsideNav = missed.filter((entry) => !entry.inNav);
        console.log(`MODE=${mode} expectedRendered=${expected.length} walked=${walk.length} missed=${missed.length} missedOutsideNav=${missedOutsideNav.length}`);
        console.log(`MODE=${mode} MISSED=${JSON.stringify(missed.slice(0, 30).map((e) => `${e.tag}#${e.id || '-'}${e.inNav ? '[nav]' : ''}:${e.label}`))}`);
    }
});
