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

test('Regression: SCN-010-010 raw and contextual diagnostics remain side by side with complete trace', async ({ page }) => {
    const externalRequests = [];
    const runtimeErrors = [];
    page.on('request', (request) => { if (new URL(request.url()).origin !== new URL(site.baseUrl).origin) externalRequests.push(request.url()); });
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') runtimeErrors.push(message.text()); });

    await page.goto(`${site.baseUrl}/company-fundamentals-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-publication-status', 'accepted');

    const diagnostic = page.locator('[data-diagnostic="interest-coverage"]');
    // The raw record renders with value, formula, threshold, input refs, and period.
    await expect(diagnostic.locator('[data-raw-value]')).toHaveText('60');
    await expect(diagnostic.locator('[data-raw-formula]')).toContainText('operating-income / interest-expense');
    await expect(diagnostic.locator('[data-raw-threshold]')).toHaveText('3.0');
    await expect(diagnostic.locator('[data-raw-input-refs]')).toContainText('obs-operating-income');
    await expect(diagnostic.locator('[data-raw-input-refs]')).toContainText('obs-interest-expense');
    await expect(diagnostic.locator('[data-raw-period]')).toHaveText('period-msft-fy2026-q3');
    // The contextual adjustment renders separately and never erases the raw record.
    await expect(diagnostic.locator('[data-contextual-amount]')).toHaveText('250000000');
    await expect(diagnostic.locator('[data-contextual-rationale]')).toContainText('lease interest');
    await expect(diagnostic.locator('[data-contextual-sensitivity]')).toContainText('0.2x');
    await expect(diagnostic.locator('[data-contextual-applicability]')).toContainText('operating leases');
    // The raw record renders before the contextual output in DOM order.
    const order = await diagnostic.evaluate((element) => {
        const raw = element.querySelector('[data-diagnostic-raw]');
        const contextual = element.querySelector('[data-diagnostic-contextual]');
        return (raw.compareDocumentPosition(contextual) & Node.DOCUMENT_POSITION_FOLLOWING) ? 'raw-before-contextual' : 'contextual-before-raw';
    });
    expect(order).toBe('raw-before-contextual');

    expect(externalRequests).toEqual([]);
    expect(runtimeErrors).toEqual([]);
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
});

test('Regression: SCN-010-011 omitted preferred stock is absent from source and never zero or pass', async ({ page }) => {
    await page.goto(`${site.baseUrl}/company-fundamentals-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-publication-status', 'accepted');

    const preferred = page.locator('[data-diagnostic="preferred-stock"]');
    await expect(preferred.locator('[data-preferred-presence]')).toHaveText('absent-from-eligible-source');
    await expect(preferred.locator('[data-preferred-value]')).toHaveText('No value published');
    // No numeric zero, positive interpretation, or summary pass is emitted.
    await expect(preferred).not.toContainText('Pass');
    await expect(preferred.locator('[data-preferred-value]')).not.toHaveText('0');
});

test('Regression: SCN-010-012 buyback interpretation includes issuance dilution and net share change', async ({ page }) => {
    await page.goto(`${site.baseUrl}/company-fundamentals-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-publication-status', 'accepted');

    const capitalAllocation = page.locator('[data-diagnostic="capital-allocation"]');
    await expect(capitalAllocation.locator('[data-capalloc-net-share-change]')).toHaveText('10000000');
    // Gross repurchase outlay and treasury balance remain distinct from period share flows.
    await expect(capitalAllocation.locator('[data-capalloc-gross-repurchase]')).toContainText('10000000000');
    await expect(capitalAllocation.locator('[data-capalloc-gross-repurchase]')).toContainText('period-flow');
    await expect(capitalAllocation.locator('[data-capalloc-treasury]')).toContainText('85000000000');
    await expect(capitalAllocation.locator('[data-capalloc-treasury]')).toContainText('balance');
    // The interpretation cites net share change and dilution, never repurchase existence as beneficial.
    await expect(capitalAllocation.locator('[data-capalloc-interpretation]')).toContainText('net share change');
    await expect(capitalAllocation.locator('[data-capalloc-interpretation]')).toContainText('dilution');
    await expect(capitalAllocation.locator('[data-capalloc-interpretation]')).not.toContainText('beneficial');
});

test('Regression: SCN-010-001 Microsoft Simple prioritizes sourced software drivers and preserves separate clocks', async ({ page }) => {
    const externalRequests = [];
    const runtimeErrors = [];
    page.on('request', (request) => { if (new URL(request.url()).origin !== new URL(site.baseUrl).origin) externalRequests.push(request.url()); });
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') runtimeErrors.push(message.text()); });

    await page.goto(`${site.baseUrl}/company-fundamentals-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-publication-status', 'accepted');
    await expect(page.locator('[data-company-name]')).toHaveText('MICROSOFT CORP');
    await expect(page.locator('[data-archetype-lens]')).toContainText('Software platform');

    const kpis = page.locator('[data-kpi-priority]');
    await expect(kpis).toHaveCount(7);
    await expect(kpis.nth(0)).toHaveAttribute('data-kpi-concept', 'cloud-revenue');
    await expect(kpis.nth(1)).toHaveAttribute('data-kpi-concept', 'commercial-backlog');
    await expect(kpis.nth(2)).toHaveAttribute('data-kpi-concept', 'capital-expenditure');
    await expect(kpis.nth(3)).toHaveAttribute('data-kpi-concept', 'depreciation');
    await expect(kpis.nth(4)).toHaveAttribute('data-kpi-concept', 'operating-margin');
    await expect(kpis.nth(5)).toHaveAttribute('data-kpi-concept', 'cash-conversion');
    await expect(kpis.nth(6)).toHaveAttribute('data-kpi-concept', 'dilution');
    // No captured company-facts observation exists yet, so each software KPI is honestly unavailable with an evidence requirement.
    await expect(kpis.nth(0).locator('[data-kpi-state]')).toHaveText('Unavailable');
    await expect(kpis.nth(0)).toContainText('SEC Company Facts');

    // The statement, model, brief, and market clocks stay separate and equal the owner objects.
    await expect(page.locator('[data-clock-statement]')).toHaveText('2026-03-31');
    await expect(page.locator('[data-clock-model]')).toHaveText('Not established');
    await expect(page.locator('[data-clock-brief]')).toHaveText('Not established');
    await expect(page.locator('[data-clock-market]')).toContainText('Unavailable');

    expect(externalRequests).toEqual([]);
    expect(runtimeErrors).toEqual([]);
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
});

test('Regression: SCN-010-008 archetypes change KPI priority without changing shared financial facts', async ({ page }) => {
    await page.goto(`${site.baseUrl}/company-fundamentals-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-publication-status', 'accepted');

    // The accepted software archetype prioritizes software drivers.
    const kpis = page.locator('[data-kpi-priority]');
    await expect(kpis.nth(0)).toHaveAttribute('data-kpi-concept', 'cloud-revenue');
    await expect(page.locator('[data-archetype-lens]')).toContainText('Software platform');

    // The shared financial facts, identity, and dependency trace are unchanged by the lens.
    await expect(page.locator('[data-company-cik]')).toHaveText('0000789019');
    await expect(page.locator('[data-node-id="identity-summary"] [data-node-value]')).toHaveText('MICROSOFT CORP | MSFT');
    await expect(page.locator('[data-node-id="fact-revenue"] [data-node-state]')).toHaveText('Unavailable');
    // The shared-fact byte-stability guarantee is surfaced for the reader.
    await expect(page.locator('[data-shared-fact-stability]')).toContainText('byte-equivalent');
});

test('Regression: SCN-010-009 unclassified companies retain shared facts and inherit no default lens', async ({ page }) => {
    await page.goto(`${site.baseUrl}/company-fundamentals-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-publication-status', 'accepted');

    const unclassified = page.locator('[data-unclassified-demo]');
    // Shared statements and the source trace remain available under the unclassified path.
    await expect(unclassified.locator('[data-unclassified-shared]')).toContainText('MICROSOFT CORP | MSFT');
    // No default lens is inherited and KPI/diagnostic priorities are unavailable with an evidence requirement.
    await expect(unclassified.locator('[data-unclassified-lens]')).toContainText('no lens');
    await expect(unclassified.locator('[data-unclassified-kpi-state]')).toHaveText('Unavailable');
    await expect(unclassified.locator('[data-unclassified-kpi-requirement]')).toContainText('archetype assignment');
    await expect(unclassified.locator('[data-unclassified-diagnostics-state]')).toHaveText('Unavailable');
});

test('Regression: SCN-010-027 optional source failure preserves the last valid dossier without credential prompts', async ({ page }) => {
    const externalRequests = [];
    const failedRequests = [];
    const runtimeErrors = [];
    page.on('request', (request) => { if (new URL(request.url()).origin !== new URL(site.baseUrl).origin) externalRequests.push(request.url()); });
    page.on('response', (response) => { if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`); });
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') runtimeErrors.push(message.text()); });

    await page.goto(`${site.baseUrl}/company-fundamentals-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-publication-status', 'accepted');

    // The accepted dossier remains rendered even though the optional market enrichment is unavailable.
    await expect(page.locator('[data-company-name]')).toHaveText('MICROSOFT CORP');
    await expect(page.locator('[data-evidence-class="reported"] [data-coverage-state]')).toHaveText('Partial');
    await expect(page.locator('[data-node-id="identity-summary"] [data-node-value]')).toHaveText('MICROSOFT CORP | MSFT');

    // Only the optional market evidence class reports unavailable; no synthetic value appears.
    await expect(page.locator('[data-clock-market]')).toContainText('Unavailable');
    await expect(page.locator('[data-optional-market-reason]')).toContainText('optional');

    // No credential field or synthetic value appears, and no external or failed request is issued.
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
    await expect(page.locator('input[name*="credential" i], input[name*="token" i], input[name*="secret" i]')).toHaveCount(0);
    expect(externalRequests).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(runtimeErrors).toEqual([]);
});

test('Regression: SCN-010-014 one driver edit recomputes linked outputs and exposes every invalid dependency', async ({ page }) => {
    const externalRequests = [];
    const failedRequests = [];
    const runtimeErrors = [];
    page.on('request', (request) => { if (new URL(request.url()).origin !== new URL(site.baseUrl).origin) externalRequests.push(request.url()); });
    page.on('response', (response) => { if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`); });
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') runtimeErrors.push(message.text()); });

    await page.goto(`${site.baseUrl}/company-fundamentals-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-publication-status', 'accepted');

    // The accepted scenario drives a linked model whose baseline outputs cover every node kind.
    const workspace = page.locator('[data-model-workspace]');
    await expect(workspace).toHaveCount(1);
    await expect(page.locator('[data-scenario-revision]')).toHaveText('4');
    await expect(page.locator('#model-baseline-list [data-model-node="node-revenue"] [data-model-node-value]')).toHaveText('220000');
    await expect(page.locator('#model-baseline-list [data-model-node="node-value-per-share"] [data-model-node-value]')).toHaveText('116.25');

    // A valuation-only driver edit recomputes only the dependency-reachable valuation nodes.
    const valuation = page.locator('[data-model-draft="valuation"]');
    await expect(valuation.locator('[data-valuation-reachable-kinds]')).toHaveText('valuation');
    await expect(valuation.locator('[data-valuation-node="node-value-per-share"] [data-valuation-node-value]')).toHaveText('171.25');
    // Unreachable statement history is carried unchanged.
    await expect(valuation.locator('[data-valuation-carried-revenue]')).toHaveText('220000');
    await expect(valuation.locator('[data-valuation-carried-revenue-state]')).toHaveText('carried');

    // An invalid (zero) driver blocks the reachable per-share node and reports its explicit dependency path.
    const invalid = page.locator('[data-model-draft="invalid"]');
    await expect(invalid.locator('[data-blocked-eps-state]')).toHaveText('blocked');
    await expect(invalid.locator('[data-blocked-eps-value]')).toHaveText('No value published');
    await expect(invalid.locator('[data-blocked-eps-path]')).toHaveText('driver-diluted-shares \u2192 node-eps');
    await expect(invalid.locator('[data-blocked-eps-reason]')).toContainText('denominator');
    // The unreachable equity value keeps its immutable baseline.
    await expect(invalid.locator('[data-blocked-equity-value]')).toHaveText('930000');

    await expect(page.locator('input[type="password"]')).toHaveCount(0);
    expect(externalRequests).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(runtimeErrors).toEqual([]);
});

test('Regression: SCN-010-016 sourced actuals preserve prior estimates classes clocks and comparable forecast error', async ({ page }) => {
    await page.goto(`${site.baseUrl}/company-fundamentals-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-publication-status', 'accepted');

    const forecast = page.locator('[data-forecast]');
    // The estimate and actual keep separate classes and sources.
    await expect(forecast.locator('[data-forecast-estimate-class]')).toHaveText('estimate');
    await expect(forecast.locator('[data-forecast-actual-class]')).toHaveText('reported');
    await expect(forecast.locator('[data-forecast-estimate-source]')).toHaveText('source-estimate-set');
    await expect(forecast.locator('[data-forecast-actual-source]')).toHaveText('sec-companyfacts-msft');
    // The acceptance clocks stay distinct.
    await expect(forecast.locator('[data-forecast-estimate-clock]')).toHaveText('2026-05-01T00:00:00Z');
    await expect(forecast.locator('[data-forecast-actual-clock]')).toHaveText('2026-07-30T00:00:00Z');
    // The forecast error derives only when comparable.
    await expect(forecast.locator('[data-forecast-comparable]')).toHaveText('Comparable');
    await expect(forecast.locator('[data-forecast-error]')).toHaveText('3000');
    // An incompatible currency withholds the forecast error with a typed reason.
    await expect(forecast.locator('[data-forecast-incomparable]')).toContainText('currency');
});

test('Regression: SCN-010-013 evidence refresh preserves accepted user assumptions and creates pending proposals only', async ({ page }) => {
    await page.goto(`${site.baseUrl}/company-fundamentals-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-publication-status', 'accepted');

    const refresh = page.locator('[data-refresh]');
    // The accepted revision remains active and is never rebased on refresh.
    await expect(refresh.locator('[data-refresh-active-revision]')).toHaveText('4');
    await expect(refresh.locator('[data-refresh-rebased]')).toHaveText('No rebasing');
    // The affected driver receives a separate pending proposal requiring a user decision.
    const proposal = refresh.locator('[data-proposal="driver-operating-margin"]');
    await expect(proposal).toHaveCount(1);
    await expect(proposal.locator('[data-proposal-state]')).toHaveText('pending');
});

test('Regression: SCN-010-023 proposal arrival is inert and confirmation alone creates a new scenario revision', async ({ page }) => {
    await page.goto(`${site.baseUrl}/company-fundamentals-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-publication-status', 'accepted');

    const decision = page.locator('[data-proposal-decision]');
    // The active revision is unchanged before any decision and after every decision.
    await expect(decision.locator('[data-decision-active-before]')).toHaveText('4');
    await expect(decision.locator('[data-decision-active-after]')).toHaveText('4');
    // Accepting creates exactly one new immutable revision R5 whose parent is R4.
    await expect(decision.locator('[data-decision-accept-revision]')).toHaveText('5');
    await expect(decision.locator('[data-decision-accept-parent]')).toHaveText('scenario-msft-base-r4');
    // Editing-and-confirming applies the user's edited value.
    await expect(decision.locator('[data-decision-edit-value]')).toHaveText('0.45');
    // Rejecting creates no revision.
    await expect(decision.locator('[data-decision-reject-count]')).toHaveText('0');
});

test('Regression: SCN-010-015 Simple Detailed and six tabs share one state without refetch or reinterpretation', async ({ page }) => {
    const publicationRequests = [];
    const externalRequests = [];
    const failedRequests = [];
    const runtimeErrors = [];
    page.on('request', (request) => {
        const requestUrl = new URL(request.url());
        if (requestUrl.origin !== new URL(site.baseUrl).origin) externalRequests.push(request.url());
        else if (/\/data\/company-fundamentals\//.test(requestUrl.pathname)) publicationRequests.push(requestUrl.pathname);
    });
    page.on('response', (response) => { if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`); });
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') runtimeErrors.push(message.text()); });

    await page.goto(`${site.baseUrl}/company-fundamentals-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-publication-status', 'accepted');
    // The one accepted publication was loaded at boot and the page opens in the Detailed view.
    await expect(page.locator('body')).toHaveAttribute('data-view-mode', 'detailed');

    // Capture the shared statement clock from the Detailed brief workspace.
    const detailedCutoff = await page.locator('[data-clock-statement]').textContent();
    expect(detailedCutoff).toBe('2026-03-31');

    // Record how many publication requests were issued at boot, then perform mode/tab actions and prove none refetch.
    const bootPublicationRequests = publicationRequests.length;

    // Switch Simple -> Detailed; the Simple cockpit shares the exact same statement clock (no reinterpretation).
    await page.locator('[data-mode-button="simple"]').click();
    await expect(page.locator('body')).toHaveAttribute('data-view-mode', 'simple');
    const simpleCutoff = await page.locator('[data-simple-cutoff]').textContent();
    expect(simpleCutoff).toBe(detailedCutoff);
    const simpleDirection = await page.locator('[data-simple-direction]').textContent();
    await page.locator('[data-mode-button="detailed"]').click();
    await expect(page.locator('body')).toHaveAttribute('data-view-mode', 'detailed');

    // Move across all six Detailed tabs; each selects a workspace over the one accepted state.
    for (const tab of ['statements', 'resilience', 'scenarios', 'brief', 'sources', 'peers']) {
        await page.locator(`[data-detailed-tab="${tab}"]`).click();
        await expect(page.locator('body')).toHaveAttribute('data-active-tab', tab);
    }

    // No mode or tab action initiated any company publication request.
    expect(publicationRequests.length).toBe(bootPublicationRequests);

    // Shared classification matches the Simple selector: the brief direction summary equals the cockpit direction.
    await page.locator('[data-detailed-tab="brief"]').click();
    await expect(page.locator('[data-clock-statement]')).toHaveText(detailedCutoff);
    await expect(page.locator('[data-brief-direction]')).toHaveText(simpleDirection);

    await expect(page.locator('input[type="password"]')).toHaveCount(0);
    await expect(page.locator('input[name*="credential" i], input[name*="token" i], input[name*="secret" i]')).toHaveCount(0);
    expect(externalRequests).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(runtimeErrors).toEqual([]);
});

test('Regression: SCN-010-028 incompatible peers stay outside statistics and ranks with exact reasons', async ({ page }) => {
    const externalRequests = [];
    const failedRequests = [];
    const runtimeErrors = [];
    page.on('request', (request) => { if (new URL(request.url()).origin !== new URL(site.baseUrl).origin) externalRequests.push(request.url()); });
    page.on('response', (response) => { if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`); });
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') runtimeErrors.push(message.text()); });

    await page.goto(`${site.baseUrl}/company-fundamentals-lab.html`);
    await expect(page.locator('body')).toHaveAttribute('data-publication-status', 'accepted');
    await page.locator('[data-detailed-tab="peers"]').click();
    await expect(page.locator('body')).toHaveAttribute('data-active-tab', 'peers');

    const peers = page.locator('[data-peers-panel]');
    // Only the three comparable observations enter the named statistic and the sample size.
    await expect(peers.locator('[data-peers-sample-size]')).toHaveText('3');
    await expect(peers.locator('[data-peers-stat-value]')).toHaveText('0.68');
    await expect(peers.locator('[data-peers-operation]')).toHaveText('median');

    // The comparable members are exactly the three comparable observations; neither qualified nor excluded is a member.
    await expect(peers.locator('[data-peers-members]')).toContainText('peer-software-alpha');
    await expect(peers.locator('[data-peers-members]')).not.toContainText('peer-software-delta');
    await expect(peers.locator('[data-peers-members]')).not.toContainText('peer-software-epsilon');

    // A declared member with no observation is reported as missing and never inserted as a zero.
    await expect(peers.locator('[data-peers-missing]')).toContainText('sec-cik-0000789019');
    await expect(peers.locator('[data-peers-missing]')).toContainText('no observation');
    await expect(peers).not.toContainText('0.00');

    // Qualified, excluded, and outlier rows remain visible with their exact reasons.
    await expect(peers.locator('[data-peer-row="qualified"]')).toContainText('peer-software-delta');
    await expect(peers.locator('[data-peer-row="qualified"]')).toContainText('excluded from the level statistic');
    await expect(peers.locator('[data-peer-row="excluded"]')).toContainText('peer-software-epsilon');
    await expect(peers.locator('[data-peer-row="excluded"]')).toContainText('Non-comparable');
    await expect(peers.locator('[data-peers-outliers]')).toContainText('peer-software-epsilon');

    await expect(page.locator('input[type="password"]')).toHaveCount(0);
    expect(externalRequests).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(runtimeErrors).toEqual([]);
});