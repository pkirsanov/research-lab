import { expect, test } from './playwright-runtime.mjs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './provider-credentials.support.mjs';
import { declareOrdinaryHousehold, openLifetimeTax, openPower } from './lifetime-tax.support.mjs';

/* Feature 022 Scope 01 — the three persistent regression titles named by TP-01-13, TP-01-14 and
   TP-01-15. Those rows named this file and this file did not exist, so all three commands
   resolved to `No tests found` and reported nothing while appearing to be planned coverage.

   Every preferential figure asserted here is transcribed from the committed
   `tax-rules/federal/2026.json` and checked against that pack before it is used, so a transposed
   digit in either place fails the parity clause rather than cancelling against itself. */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const federalPack = JSON.parse(readFileSync(join(ROOT, 'tax-rules/federal/2026.json'), 'utf8'));

/* Rev. Proc. 2025-32 section 4.03 states this schedule as two amounts per filing status: the
   maximum zero rate amount and the maximum 15 percent rate amount. The top rate is carried
   separately by the table's own `componentSources` override, which is the split authority
   SCN-022-001 exists to make visible. */
const KNOWN_PREFERENTIAL_SCHEDULE = {
  'single': { maximumZeroRateAmount: 49450, maximumFifteenPercentRateAmount: 545500 },
  'married-filing-jointly': { maximumZeroRateAmount: 98900, maximumFifteenPercentRateAmount: 613700 },
  'married-filing-separately': { maximumZeroRateAmount: 49450, maximumFifteenPercentRateAmount: 306850 },
  'head-of-household': { maximumZeroRateAmount: 66200, maximumFifteenPercentRateAmount: 579600 }
};
const KNOWN_PREFERENTIAL_RATES = [0, 0.15, 0.2];

/* The preferential tax the authority's own two amounts imply for a slice sitting ON TOP of
   ordinary taxable income. Written from the transcribed schedule rather than by walking the
   pack's band objects, so it is an independent statement of the CO-7 window instead of a
   restatement of the implementation under test. */
const knownPreferentialTax = (filingStatus, ordinaryTaxableIncome, preferentialAmount) => {
  const known = KNOWN_PREFERENTIAL_SCHEDULE[filingStatus];
  const windowTop = ordinaryTaxableIncome + preferentialAmount;
  const fifteenSlice = Math.max(0, Math.min(windowTop, known.maximumFifteenPercentRateAmount)
    - Math.max(ordinaryTaxableIncome, known.maximumZeroRateAmount));
  const twentySlice = Math.max(0, windowTop
    - Math.max(ordinaryTaxableIncome, known.maximumFifteenPercentRateAmount));
  return 0.15 * fifteenSlice + 0.2 * twentySlice;
};

const asNumber = (text) => Number(text.replace(/[$,]/g, ''));
const carriedStatuses = () => Object.keys(KNOWN_PREFERENTIAL_SCHEDULE)
  .filter((status) => Array.isArray(federalPack.preferentialRateTables[status].bands));

/* The transcription is checked against the pack once, here, rather than in each test, so every
   later expectation in this file rests on a figure that was proven to match the committed pack. */
const expectTranscriptionMatchesPack = () => {
  const statuses = carriedStatuses();
  expect(statuses.length).toBeGreaterThan(0);
  statuses.forEach((status) => {
    const table = federalPack.preferentialRateTables[status];
    const known = KNOWN_PREFERENTIAL_SCHEDULE[status];
    expect(table.kind).toBe('preferential');
    expect(table.filingStatus).toBe(status);
    expect(table.bands.map((band) => band.rate)).toEqual(KNOWN_PREFERENTIAL_RATES);
    expect(table.bands[0].lowerInclusive).toBe(0);
    expect(table.bands[0].upperExclusive).toBe(known.maximumZeroRateAmount);
    expect(table.bands[1].lowerInclusive).toBe(known.maximumZeroRateAmount);
    expect(table.bands[1].upperExclusive).toBe(known.maximumFifteenPercentRateAmount);
    expect(table.bands[2].lowerInclusive).toBe(known.maximumFifteenPercentRateAmount);
    expect(table.bands[2].upperExclusive).toBeNull();
  });
};

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

test('Regression: SCN-022-001 a preferential table displays a distinct source per component', async ({ page }) => {
  expectTranscriptionMatchesPack();
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, {
    deductionMode: 'itemized', itemizedAmount: 0, ordinary: 40000,
    longTermCapitalGain: 20000, bracketId: 'b3'
  });
  await openPower(page);

  /* The served pack is the pack this file transcribed. Asserted through the identity the page
     itself renders, so every later clause is about the document under test rather than about a
     copy on disk that the browser might not have loaded. */
  const ruleLedgerRows = await page.locator('#ruleLedgerBody tr').evaluateAll((nodes) =>
    nodes.map((node) => Array.from(node.querySelectorAll('td')).map((cell) => cell.textContent.trim())));
  const shaRow = ruleLedgerRows.find((row) => row[0] === 'contentSha256');
  expect(shaRow).toBeTruthy();
  expect(shaRow[1]).toBe(federalPack.contentSha256);

  /* The split authority itself, resolved by the engine the BROWSER loaded rather than by a copy
     required into Node. Each band edge inherits the revenue-procedure record that states the
     schedule; the top band's rate carries an explicit override citing a DIFFERENT source. A table
     whose components all resolved to one authority would fail the distinctness clause, and a
     table that let a band silently inherit the other band's override would fail the origin
     clause. */
  const provenance = await page.evaluate(({ pack, statuses }) => {
    const rules = window.RLTAXRULES;
    return statuses.map((status) => {
      const table = pack.preferentialRateTables[status];
      const paths = rules.rateTableComponentPaths(table);
      const overridden = table.componentSources.map((entry) => entry.component);
      return {
        status,
        components: paths.map((path) => {
          const effective = rules.effectiveSourceFor(pack, table, path);
          return {
            path,
            unavailable: rules.isUnavailable(effective),
            origin: effective.origin || null,
            sourceRef: effective.sourceRef || null,
            title: effective.title || null,
            url: effective.url || null,
            retrievedAt: effective.retrievedAt || null,
            locator: effective.locator || null,
            declaredOverride: overridden.indexOf(path) >= 0
          };
        }),
        declaredOverridePaths: overridden.slice(),
        componentPathCount: paths.length
      };
    });
  }, { pack: federalPack, statuses: carriedStatuses() });

  expect(provenance.length).toBe(carriedStatuses().length);
  const citedSourceIds = new Set();
  provenance.forEach((entry) => {
    expect(entry.components.length).toBeGreaterThan(0);
    /* Overrides are a strict, non-empty subset of the component paths, so BOTH origins really
       occur and the origin clause below is exercised in both directions rather than being
       satisfied by a table that overrode everything or nothing. */
    expect(entry.declaredOverridePaths.length).toBeGreaterThan(0);
    expect(entry.declaredOverridePaths.length).toBeLessThan(entry.componentPathCount);
    entry.components.forEach((component) => {
      /* Every component resolves, and carries the four things the scenario names. */
      expect(component.unavailable).toBe(false);
      expect(component.title.length).toBeGreaterThan(0);
      expect(component.url.length).toBeGreaterThan(0);
      expect(component.retrievedAt.length).toBeGreaterThan(0);
      expect(component.locator.length).toBeGreaterThan(0);
      /* No component silently inherits an override it did not declare, and none declares an
         override it does not carry. */
      expect(component.origin).toBe(component.declaredOverride ? 'overridden' : 'inherited');
      citedSourceIds.add(component.sourceRef);
      /* No component displays a source that was not retrieved, and none cites a newsroom
         release — the two exclusions the scenario states. */
      const record = federalPack.sourceRecords.find((source) => source.sourceId === component.sourceRef);
      expect(record).toBeTruthy();
      expect(record.retrievalOutcome).toBe('retrieved');
      expect(record.documentKind).not.toBe('newsroom-release');
    });
    /* The distinctness the title names: the top band's rate and the breakpoints below it do NOT
       resolve to the same authority. */
    const topRate = entry.components.find((component) => component.declaredOverride && /:rate$/.test(component.path));
    const firstEdge = entry.components.find((component) => /:lowerInclusive$/.test(component.path) && !component.declaredOverride);
    expect(topRate).toBeTruthy();
    expect(firstEdge).toBeTruthy();
    expect(topRate.sourceRef).not.toBe(firstEdge.sourceRef);
    expect(topRate.title).not.toBe(firstEdge.title);
  });
  /* Non-vacuity: the components really did resolve to more than one authority, so the clause
     above is discriminating rather than satisfied by a single-source table. */
  expect(citedSourceIds.size).toBeGreaterThan(1);

  /* And both authorities are DISPLAYED. The rendered record set equals the pack's record set in
     both directions, so a source added by a later scope cannot arrive undisplayed and a record
     rendered from nowhere cannot pass. */
  const renderedTitles = await page.locator('#sourceRecordList a')
    .evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
  const packTitles = federalPack.sourceRecords.map((record) => record.title);
  expect(renderedTitles.length).toBe(federalPack.sourceRecords.length);
  packTitles.forEach((title) => expect(renderedTitles).toContain(title));
  renderedTitles.forEach((title) => expect(packTitles).toContain(title));
  [...citedSourceIds].forEach((sourceId) => {
    const record = federalPack.sourceRecords.find((source) => source.sourceId === sourceId);
    expect(renderedTitles).toContain(record.title);
  });

  /* Every rendered link carries the URL and the outbound-safety attributes, and every rendered
     entry states its retrieval outcome and retrieval date beside the title. */
  const renderedLinks = await page.locator('#sourceRecordList a').evaluateAll((nodes) =>
    nodes.map((node) => ({ href: node.getAttribute('href'), rel: node.getAttribute('rel') })));
  expect(renderedLinks.length).toBe(federalPack.sourceRecords.length);
  renderedLinks.forEach((link) => expect(link.rel).toBe('noreferrer noopener'));
  const renderedHrefs = renderedLinks.map((link) => link.href);
  [...citedSourceIds].forEach((sourceId) => {
    const record = federalPack.sourceRecords.find((source) => source.sourceId === sourceId);
    expect(renderedHrefs).toContain(record.url);
  });
  const renderedEntries = await page.locator('#sourceRecordList li')
    .evaluateAll((nodes) => nodes.map((node) => node.textContent));
  [...citedSourceIds].forEach((sourceId) => {
    const record = federalPack.sourceRecords.find((source) => source.sourceId === sourceId);
    const entry = renderedEntries.find((line) => line.indexOf(record.title) >= 0);
    expect(entry).toBeTruthy();
    expect(entry).toContain('retrieved');
    expect(entry).toContain(record.retrievedAt);
    expect(entry).toContain(record.documentKind);
  });
});

test('Regression: SCN-022-002 a household with preferential income receives a valued federal total', async ({ page }) => {
  expectTranscriptionMatchesPack();
  await openLifetimeTax(page, site);

  /* The UI half stays below every surtax threshold on purpose, so the headline moves by the
     preferential arithmetic alone and a change in it cannot be a surtax arriving unannounced. */
  const uiStatuses = ['married-filing-jointly', 'head-of-household'];
  for (const status of uiStatuses) {
    const known = KNOWN_PREFERENTIAL_SCHEDULE[status];
    const ordinary = 40000;
    const gainToZeroTop = known.maximumZeroRateAmount - ordinary;
    expect(gainToZeroTop).toBeGreaterThan(0);

    /* Both preferential members are declared on EVERY entry. Leaving one unset would carry the
       previous household's figure into the next one, which is exactly how a green suite can
       assert the wrong household without saying so. */
    const headline = async (preferential) => {
      await declareOrdinaryHousehold(page, {
        filingStatus: status, deductionMode: 'itemized', itemizedAmount: 0, ordinary, bracketId: 'b3',
        longTermCapitalGain: preferential.longTermCapitalGain,
        qualifiedDividend: preferential.qualifiedDividend
      });
      const text = await page.locator('[data-rl-value="headlineFederalTax"]').textContent();
      /* A valued record, not a refusal and not a blank. */
      expect(text).toMatch(/^\$[0-9,]+$/);
      return asNumber(text);
    };

    /* Ordinary income alone. */
    const ordinaryOnly = await headline({ longTermCapitalGain: 0, qualifiedDividend: 0 });
    expect(Number.isFinite(ordinaryOnly)).toBe(true);
    expect(ordinaryOnly).toBeGreaterThan(0);
    await expect(page.locator('#truthState')).toHaveText('Settled');

    /* A gain sitting entirely inside the pack's zero-rate band adds exactly nothing. That is a
       real sourced zero rather than a dropped leg, and it places the breakpoint precisely where
       the pack states it: one thousand dollars past it costs exactly $150. */
    const insideZeroBand = await headline({ longTermCapitalGain: gainToZeroTop, qualifiedDividend: 0 });
    expect(insideZeroBand).toBe(ordinaryOnly);
    expect(knownPreferentialTax(status, ordinary, gainToZeroTop)).toBe(0);

    const pastZeroBand = await headline({ longTermCapitalGain: gainToZeroTop + 1000, qualifiedDividend: 0 });
    expect(pastZeroBand - ordinaryOnly)
      .toBe(Math.round(knownPreferentialTax(status, ordinary, gainToZeroTop + 1000)));
    expect(pastZeroBand - ordinaryOnly).toBe(150);

    /* Qualified dividends receive identical treatment to long-term gains: the same amount
       declared either way produces the identical total. */
    const asDividend = await headline({ longTermCapitalGain: 0, qualifiedDividend: gainToZeroTop + 1000 });
    expect(asDividend).toBe(pastZeroBand);

    /* And the total is a settled, valued record carrying the pack's own rule status rather than
       a refusal that the headline quietly rendered as a number. */
    await openPower(page);
    const stageRows = await page.locator('#settlementStagesBody tr').evaluateAll((nodes) =>
      nodes.map((node) => Array.from(node.querySelectorAll('td')).map((cell) => cell.textContent.trim())));
    expect(stageRows.length).toBeGreaterThan(0);
    stageRows.forEach((row) => expect(row[2]).not.toBe('unavailable'));
    await expect(page.locator('#absentFigureInventory')).toContainText('carries every figure');
  }

  /* The exactness half, run through the engine the BROWSER loaded and the pack the page proved
     it is serving. `immediately below, exactly at, immediately above` is a one-dollar question,
     which the nearest-dollar headline cannot answer, so it is asked of the settled preferential
     record instead of the rendered figure. */
  const shaRow = await page.locator('#ruleLedgerBody tr').evaluateAll((nodes) =>
    nodes.map((node) => Array.from(node.querySelectorAll('td')).map((cell) => cell.textContent.trim()))
      .find((row) => row[0] === 'contentSha256'));
  expect(shaRow[1]).toBe(federalPack.contentSha256);

  const statuses = carriedStatuses();
  const boundaryCases = [];
  statuses.forEach((status) => {
    const known = KNOWN_PREFERENTIAL_SCHEDULE[status];
    const ordinaryTaxable = Math.floor(known.maximumZeroRateAmount / 2);
    [known.maximumZeroRateAmount, known.maximumFifteenPercentRateAmount].forEach((breakpoint) => {
      [breakpoint - 1, breakpoint, breakpoint + 1].forEach((windowTop) => {
        boundaryCases.push({ status, ordinaryTaxable, preferential: windowTop - ordinaryTaxable, windowTop });
      });
    });
  });
  expect(boundaryCases.length).toBe(statuses.length * 6);

  const settledBoundaries = await page.evaluate(({ pack, cases }) => {
    const engine = window.RLTAX;
    const rules = window.RLTAXRULES;
    const workspaces = window.RLTAXWORKSPACE;
    return cases.map((testCase) => {
      const workspace = workspaces.createEmptyWorkspace();
      workspace.filingStatus = testCase.status;
      workspace.declaredTaxYear = 2026;
      workspace.deductionMode = 'itemized';
      workspace.itemizedAmount = 0;
      workspace.income.ordinary = testCase.ordinaryTaxable;
      workspace.income.longTermCapitalGain = testCase.preferential;
      workspace.investmentIncomeBasis.otherOrdinaryNetInvestmentIncome = 0;
      workspace.wageBasis.medicareWagesAndSelfEmploymentIncome = 0;
      const settled = engine.computeAnnualFederalTax(workspace, pack);
      const asDividend = workspaces.createEmptyWorkspace();
      Object.assign(asDividend, JSON.parse(JSON.stringify(workspace)));
      asDividend.income.longTermCapitalGain = 0;
      asDividend.income.qualifiedDividend = testCase.preferential;
      const dividendSettled = engine.computeAnnualFederalTax(asDividend, pack);
      return {
        unavailable: rules.isUnavailable(settled.preferentialTax),
        preferentialTax: settled.preferentialTax.value,
        dividendTax: dividendSettled.preferentialTax.value,
        preferentialTaxableIncome: settled.preferentialTaxableIncome.value,
        ordinaryTaxableIncome: settled.ordinaryTaxableIncome.value,
        totalUnavailable: rules.isUnavailable(settled.totalFederalTax),
        ruleStatus: settled.totalFederalTax.ruleStatus || null
      };
    });
  }, { pack: federalPack, cases: boundaryCases });

  expect(settledBoundaries.length).toBe(boundaryCases.length);
  settledBoundaries.forEach((settled, index) => {
    const testCase = boundaryCases[index];
    const label = `${testCase.status}@${testCase.windowTop}`;
    expect(`${label}:unavailable=${settled.unavailable}`).toBe(`${label}:unavailable=false`);
    expect(`${label}:total=${settled.totalUnavailable}`).toBe(`${label}:total=false`);
    expect(`${label}:ruleStatus=${settled.ruleStatus}`).toBe(`${label}:ruleStatus=enacted-current-law`);
    expect(`${label}:ordinary=${settled.ordinaryTaxableIncome}`).toBe(`${label}:ordinary=${testCase.ordinaryTaxable}`);
    expect(`${label}:preferentialIncome=${settled.preferentialTaxableIncome}`).toBe(`${label}:preferentialIncome=${testCase.preferential}`);
    const expected = knownPreferentialTax(testCase.status, testCase.ordinaryTaxable, testCase.preferential);
    expect(Math.abs(settled.preferentialTax - expected)).toBeLessThan(0.0000001);
    /* Qualified dividends receive identical treatment at every one of these positions. */
    expect(Math.abs(settled.dividendTax - settled.preferentialTax)).toBeLessThan(0.0000001);
  });

  /* Adversarial: the boundary set really straddles the edges rather than sitting inside one
     band, so the exactness above is discriminating. Exactly at each zero-rate top the tax is
     zero, and one dollar past it the tax is fifteen cents — a set that never crossed an edge
     could not produce that pair. */
  statuses.forEach((status) => {
    const known = KNOWN_PREFERENTIAL_SCHEDULE[status];
    const at = boundaryCases.findIndex((testCase) =>
      testCase.status === status && testCase.windowTop === known.maximumZeroRateAmount);
    const above = boundaryCases.findIndex((testCase) =>
      testCase.status === status && testCase.windowTop === known.maximumZeroRateAmount + 1);
    expect(at).toBeGreaterThanOrEqual(0);
    expect(above).toBeGreaterThanOrEqual(0);
    expect(settledBoundaries[at].preferentialTax).toBe(0);
    expect(Math.abs(settledBoundaries[above].preferentialTax - 0.15)).toBeLessThan(0.0000001);
  });
});

test('Regression: SCN-022-003 unsupported preferential categories are named and never folded in', async ({ page }) => {
  expectTranscriptionMatchesPack();
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, {
    deductionMode: 'itemized', itemizedAmount: 0, ordinary: 40000,
    longTermCapitalGain: 30000, bracketId: 'b3'
  });
  await openPower(page);

  /* The above-rate preferential categories are derived from the pack's OWN reason text rather
     than listed here, so a category retired or added by a later scope moves this expectation
     with it instead of leaving a hand-typed list to rot. */
  const aboveRateEntries = federalPack.unsupportedFeatures.filter((entry) =>
    /sits above this pack's top carried preferential rate/.test(entry.reason));
  expect(aboveRateEntries.length).toBeGreaterThan(0);
  expect(aboveRateEntries.map((entry) => entry.id).sort())
    .toEqual(['collectibles-gain', 'qualified-small-business-stock-section-1202-gain']);

  /* Each is NAMED as unsupported with its own reason and its own code, and each declares that it
     moves the marginal rate — the disclosure that stops a reader treating the settled figure as
     the whole of their liability. */
  const ledgerRows = await page.locator('#featureLedgerBody tr').evaluateAll((nodes) =>
    nodes.map((node) => Array.from(node.querySelectorAll('td')).map((cell) => cell.textContent.trim())));
  expect(ledgerRows.length).toBe(federalPack.supportedFeatures.length + federalPack.unsupportedFeatures.length);
  const reasons = new Set();
  aboveRateEntries.forEach((entry) => {
    const row = ledgerRows.find((cells) => cells[0] === entry.label);
    expect(row).toBeTruthy();
    expect(row[1]).toBe('not supported');
    expect(row[2]).toBe('RLTAX-FEATURE-UNSUPPORTED');
    expect(row[3]).toBe('yes');
    expect(row[4]).toBe(entry.reason);
    expect(entry.reason.length).toBeGreaterThan(0);
    reasons.add(entry.reason);
  });
  /* "with its own reason" — the reasons are distinct, not one sentence repeated. */
  expect(reasons.size).toBe(aboveRateEntries.length);

  /* NEVER FOLDED IN. Two independent reasons no code path can price them into the supported
     bands: the engine declares no income kind that could carry such a gain, and the preferential
     table carries no band at the maximum rate either category is subject to, so there is no band
     for a fold to land in. */
  const engineFacts = await page.evaluate((pack) => {
    const rules = window.RLTAXRULES;
    const workspaces = window.RLTAXWORKSPACE;
    return {
      incomeKinds: rules.SUPPORTED_INCOME_KINDS.slice(),
      workspaceIncomeMembers: Object.keys(workspaces.createEmptyWorkspace().income),
      preferentialRates: Object.keys(pack.preferentialRateTables)
        .filter((status) => Array.isArray(pack.preferentialRateTables[status].bands))
        .map((status) => pack.preferentialRateTables[status].bands.map((band) => band.rate))
    };
  }, federalPack);
  ['collectibles', 'section-1202', 'section1202', 'qualified-small-business'].forEach((token) => {
    expect(engineFacts.incomeKinds.join(',')).not.toContain(token);
    expect(engineFacts.workspaceIncomeMembers.join(',').toLowerCase()).not.toContain(token.replace(/-/g, ''));
  });
  engineFacts.preferentialRates.forEach((rates) => {
    expect(rates).toEqual(KNOWN_PREFERENTIAL_RATES);
    /* 28 percent is the maximum rate both above-rate categories carry. No carried band is at it,
       so neither can be silently priced by the schedule the household did settle under. */
    expect(rates).not.toContain(0.28);
  });

  /* The third category the scenario named — unrecaptured section 1250 gain — has left the
     unsupported set. A removal is only honest if the id is proven to have MOVED rather than
     quietly vanished, so it is asserted absent from the unsupported set AND present as the
     disposition recapture category carrying its own sourced maximum rate, which is a rate the
     preferential schedule does not carry either. */
  const unsupportedIds = federalPack.unsupportedFeatures.map((entry) => entry.id);
  expect(unsupportedIds).not.toContain('unrecaptured-section-1250-gain');
  expect(federalPack.dispositionPolicy.recaptureCategory.categoryId).toBe('unrecaptured-section-1250-gain');
  expect(typeof federalPack.dispositionPolicy.recaptureCategory.maximumRate).toBe('number');
  expect(federalPack.dispositionPolicy.recaptureCategory.sourceRef.length).toBeGreaterThan(0);
  engineFacts.preferentialRates.forEach((rates) => {
    expect(rates).not.toContain(federalPack.dispositionPolicy.recaptureCategory.maximumRate);
  });

  /* NOT LABELLED A COMPLETE FEDERAL TAX. The page states its educational framing, keeps the
     unsupported categories visible beside the settled figure, and makes no completeness claim. */
  await expect(page.locator('#educationalFramingHeader')).toContainText('Not tax');
  await expect(page.locator('#educationalFramingHeader')).toContainText('does not tell you what to do');
  const notSupportedRows = ledgerRows.filter((cells) => cells[1] === 'not supported');
  expect(notSupportedRows.length).toBe(federalPack.unsupportedFeatures.length);
  expect(notSupportedRows.length).toBeGreaterThan(0);

  const pageText = await page.locator('body').innerText();
  ['complete federal tax', 'your total tax liability', 'the whole of your federal tax',
    'everything you owe', 'full federal liability'].forEach((claim) => {
    expect(pageText.toLowerCase()).not.toContain(claim);
  });

  /* Adversarial: the completeness scan is not vacuously green — it still matches the phrasing it
     exists to catch, so a page that DID claim completeness would be found. */
  expect('This is the complete federal tax you owe.'.toLowerCase()).toContain('complete federal tax');
  /* And the ledger addressing is real: a label the pack never declares selects no row, so the
     per-category assertions above followed the entries rather than passing on any row at all. */
  expect(ledgerRows.find((cells) => cells[0] === 'A category this pack never declared')).toBeFalsy();
});
