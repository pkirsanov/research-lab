import { test, expect } from './playwright-runtime.mjs';
import { startStaticServer } from './provider-credentials.support.mjs';

let site;

test.beforeAll(async () => {
    site = await startStaticServer();
});

test.afterAll(async () => {
    if (site) await site.close();
});

test('Regression: SCN-010-026 missing concepts remain unavailable while independent facts stay usable', async ({ page }) => {
    const externalRequests = [];
    const failedRequests = [];
    const sameOriginPaths = [];
    const runtimeErrors = [];
    page.on('request', (request) => {
        const requestUrl = new URL(request.url());
        if (requestUrl.origin !== new URL(site.baseUrl).origin) externalRequests.push(request.url());
        else sameOriginPaths.push(requestUrl.pathname);
    });
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') runtimeErrors.push(message.text());
    });
    page.on('response', (response) => {
        if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`);
    });

    await page.goto(`${site.baseUrl}/company-fundamentals-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-publication-status', /^(accepted|rejected)$/);
    const publicationStatus = await page.locator('body').getAttribute('data-publication-status');
    expect(publicationStatus, `browser publication errors: ${runtimeErrors.join(' | ')}`).toBe('accepted');
    await expect(page.locator('[data-company-name]')).toHaveText('MICROSOFT CORP');
    await expect(page.locator('[data-company-cik]')).toHaveText('0000789019');
    await expect(page.locator('[data-evidence-class="reported"] [data-coverage-state]')).toHaveText('Partial');

    const revenue = page.locator('[data-node-id="fact-revenue"]');
    const direction = page.locator('[data-node-id="metric-direction"]');
    const briefEligibility = page.locator('[data-node-id="model-brief-eligibility"]');
    const independent = page.locator('[data-node-id="identity-summary"]');
    await expect(revenue.locator('[data-node-state]')).toHaveText('Unavailable');
    await expect(revenue.locator('[data-node-value]')).toHaveText('No value published');
    await expect(direction.locator('[data-node-state]')).toHaveText('Unavailable');
    await expect(direction.locator('[data-missing-facts]')).toHaveText('fact-revenue');
    await expect(briefEligibility.locator('[data-node-state]')).toHaveText('Unavailable');
    await expect(briefEligibility.locator('[data-missing-facts]')).toHaveText('fact-revenue');
    await expect(independent.locator('[data-node-state]')).toHaveText('Available');
    await expect(independent.locator('[data-node-value]')).toHaveText('MICROSOFT CORP | MSFT');

    expect(sameOriginPaths).toContain('/data/company-fundamentals/companies/sec-cik-0000789019/current.json');
    expect(sameOriginPaths.some((path) => /^\/data\/company-fundamentals\/objects\/[a-f0-9]{64}\.json$/.test(path))).toBe(true);
    expect(sameOriginPaths.some((path) => path.endsWith('/foundation-publication.js'))).toBe(false);
    await expect(page.locator('[data-source-extract-completeness]')).toHaveText('Exact SEC response bytes');
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
    await expect(page.locator('input[name*="credential" i], input[name*="token" i], input[name*="secret" i]')).toHaveCount(0);
    expect(externalRequests).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(runtimeErrors).toEqual([]);
});

test('Regression: SCN-010-029 every material claim reaches its exact source transformation and consumer chain', async ({ page }) => {
    await page.goto(`${site.baseUrl}/company-fundamentals-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-publication-status', 'accepted');

    const trigger = page.locator('[data-trace-control="claim-direction"]');
    await trigger.focus();
    await trigger.press('Enter');

    await expect(page.locator('#sources')).toBeVisible();
    await expect(page.locator('#sources-heading')).toBeFocused();
    await expect(page.locator('[data-trace-observation]')).toContainText('No source-qualified revenue observation published');
    await expect(page.locator('[data-trace-observation]')).not.toContainText('obs-sec-issuer-name');
    await expect(page.locator('[data-trace-source]')).toContainText('sec-companyfacts-msft');
    await expect(page.locator('[data-trace-source]')).toContainText('https://data.sec.gov/api/xbrl/companyfacts/CIK0000789019.json');
    await expect(page.locator('[data-trace-period]')).toContainText('FY2026 Q3');
    await expect(page.locator('[data-trace-mapping]')).toContainText('mapping-revenue');
    await expect(page.locator('[data-trace-formula]')).toContainText('formula-direction-foundation');
    await expect(page.locator('[data-trace-consumers]')).toContainText('simple-direction');
    await expect(page.locator('[data-trace-consumers]')).toContainText('foundation-owner-read');
    await expect(page.locator('[data-trace-rights]')).toContainText('redistributable-structured');
    await expect(page.locator('[data-trace-rights]')).toContainText('No SEC Company Facts response bytes were retained');
    await expect(page.locator('[data-trace-restatements]')).toContainText('none-recorded');
    await expect(page.locator('[data-trace-conflicts]')).toContainText('none-recorded');
    await expect(page.locator('[data-trace-unavailable]')).toContainText('Scope 01 retains exact SEC Submissions response bytes only');

    await page.locator('[data-close-trace]').click();
    await expect(page.locator('#sources')).toBeHidden();
    await expect(trigger).toBeFocused();
});

test('Regression: SCN-010-004 annual quarterly YTD and instant history preserve exact period meaning', async ({ page }) => {
    await page.goto(`${site.baseUrl}/company-fundamentals-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-publication-status', 'accepted');

    await expect(page.locator('#period-rows tr')).toHaveCount(4);

    const quarter = page.locator('[data-period-id="period-msft-fy2026-q3"]');
    await expect(quarter.locator('[data-period-classification]')).toHaveText('quarter');
    await expect(quarter.locator('[data-period-standalone-quarter]')).toHaveText('Yes');
    await expect(quarter.locator('[data-period-accession]')).toHaveText('0001193125-26-191507');

    const annual = page.locator('[data-period-id="period-msft-fy2025-annual"]');
    await expect(annual.locator('[data-period-classification]')).toHaveText('annual');
    await expect(annual.locator('[data-period-standalone-quarter]')).toHaveText('No');

    const yearToDate = page.locator('[data-period-id="period-msft-fy2026-q3-ytd"]');
    await expect(yearToDate.locator('[data-period-classification]')).toHaveText('year-to-date');
    await expect(yearToDate.locator('[data-period-standalone-quarter]')).toHaveText('No');

    const instant = page.locator('[data-period-id="period-msft-fy2026-q3-instant"]');
    await expect(instant.locator('[data-period-classification]')).toHaveText('instant');
    await expect(instant.locator('[data-period-standalone-quarter]')).toHaveText('No');
});

test('Regression: SCN-010-005 statement imbalance blocks clean dependent conclusions and preserves source facts', async ({ page }) => {
    const externalRequests = [];
    const runtimeErrors = [];
    page.on('request', (request) => {
        if (new URL(request.url()).origin !== new URL(site.baseUrl).origin) externalRequests.push(request.url());
    });
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') runtimeErrors.push(message.text());
    });

    await page.goto(`${site.baseUrl}/company-fundamentals-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-publication-status', 'accepted');

    // The real MSFT balance-sheet identity is not evaluable in this scope, and its source facts stay inspectable.
    await expect(page.locator('[data-integrity-state]')).toHaveText('Not evaluable');
    await expect(page.locator('[data-integrity-source-facts]')).toContainText('Source facts remain inspectable');

    // The production integrity guard blocks a copied, changed balance sheet whose assets leave the rounding interval.
    const imbalance = page.locator('[data-demo="integrity-imbalance"]');
    await expect(imbalance.locator('[data-demo-verdict]')).toContainText('C010-INTEGRITY-BALANCE-SHEET');
    await expect(imbalance.locator('[data-demo-verdict]')).toContainText('dependent conclusions blocked');
    await expect(imbalance.locator('[data-demo-detail]')).toContainText('Difference 150000000000');
    await expect(imbalance.locator('[data-demo-detail]')).toContainText('source facts remain inspectable');

    expect(externalRequests).toEqual([]);
    expect(runtimeErrors).toEqual([]);
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
});

test('Regression: SCN-010-006 amended facts become current while original observations remain auditable', async ({ page }) => {
    await page.goto(`${site.baseUrl}/company-fundamentals-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-publication-status', 'accepted');

    const restatement = page.locator('[data-demo="restatement"]');
    await expect(restatement.locator('[data-demo-verdict]')).toHaveText('Restated');
    await expect(restatement.locator('[data-demo-detail]')).toContainText('Current observation obs-assets-amended');
    await expect(restatement.locator('[data-demo-detail]')).toContainText('obs-assets-original, obs-assets-amended');
});

test('Regression: SCN-010-025 conflicting sources remain visible and never become an average', async ({ page }) => {
    await page.goto(`${site.baseUrl}/company-fundamentals-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-publication-status', 'accepted');

    const conflict = page.locator('[data-demo="conflict"]');
    await expect(conflict.locator('[data-demo-verdict]')).toHaveText('Conflicted (no average)');
    await expect(conflict.locator('[data-demo-detail]')).toContainText('Both observations stay visible: obs-assets-a, obs-assets-b');
});