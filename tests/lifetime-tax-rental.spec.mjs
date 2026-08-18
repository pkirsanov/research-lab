import { expect, test } from './playwright-runtime.mjs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './provider-credentials.support.mjs';
import {
  declareOrdinaryHousehold,
  openLifetimeTax,
  openPower
} from './lifetime-tax.support.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FEDERAL_PACK_PATH = 'tax-rules/federal/2026.json';
const FEDERAL_PACK = JSON.parse(readFileSync(join(ROOT, FEDERAL_PACK_PATH), 'utf8'));

/* The shipped pack ships the special allowance, its phase-out range and its reduction rate ABSENT,
   because the only retrievable edition of the authority declares another tax year. A loss ladder
   therefore cannot be exercised over the real route against the shipped pack at all. Serving a
   fixture pack AT the declared pack path is how the ladder is exercised over the real route without
   inventing a tax figure and without presenting a fixture as an authority: the figures below are the
   implementer's own, they are reachable only from this spec, and the shipped pack is unchanged. */
function packServing(mutate) {
  const pack = JSON.parse(readFileSync(join(ROOT, FEDERAL_PACK_PATH), 'utf8'));
  mutate(pack);
  return { [FEDERAL_PACK_PATH]: JSON.stringify(pack) };
}

const withFixtureAllowance = (pack) => {
  pack.lossLimitPolicy.specialAllowance.maximumAmounts = {
    amount: 20000, sourceRef: 'irs-p925-2025',
    locator: 'fixture maximum, the implementer\u2019s own figure and not an authority\u2019s'
  };
  pack.lossLimitPolicy.specialAllowance.phaseOutRange = {
    startsAbove: 80000, exhaustedAtOrAbove: 120000, sourceRef: 'irs-p925-2025',
    locator: 'fixture range, the implementer\u2019s own figures and not an authority\u2019s'
  };
  pack.lossLimitPolicy.specialAllowance.reductionRate = {
    rate: 0.5, sourceRef: 'irs-p925-2025',
    locator: 'fixture rate, the implementer\u2019s own figure and not an authority\u2019s'
  };
};

/* One household's rental declarations. Every member here is the household's own input; the pack
   supplies every figure an authority states. The two never mix. */
async function declareRental(page, values) {
  const fill = async (selector, value) => {
    await page.fill(selector, value === undefined || value === null ? '' : String(value));
  };
  await fill('#inputRentalIncome', values.rentalIncome);
  await fill('#inputRentalOperatingExpenses', values.operatingExpenses);
  await fill('#inputRentalDepreciableBasis', values.depreciableBasis);
  await fill('#inputRentalPlacedInServiceMonth', values.placedInServiceMonth);
  await fill('#inputRentalRecoveryYearOrdinal', values.recoveryYearOrdinal);
  await fill('#inputRentalAtRiskAmount', values.atRiskAmount);
  await fill('#inputRentalModifiedAdjustedGrossIncome', values.modifiedAdjustedGrossIncome);
  await fill('#inputRentalOpeningSuspendedLoss', values.openingSuspendedLoss);
  if (values.activeParticipation !== undefined) {
    await page.selectOption('#inputRentalActiveParticipation', values.activeParticipation);
  }
}

const PROFITABLE_RENTAL = {
  rentalIncome: 40000, operatingExpenses: 9350, depreciableBasis: 160000,
  placedInServiceMonth: 2, recoveryYearOrdinal: 1, atRiskAmount: 500000,
  modifiedAdjustedGrossIncome: 90000, openingSuspendedLoss: 0, activeParticipation: 'yes'
};

const LOSS_RENTAL = Object.assign({}, PROFITABLE_RENTAL, {
  rentalIncome: 10000, operatingExpenses: 30000, atRiskAmount: 12000
});

const splitAttribute = (raw) => (raw === null || raw === '' ? [] : raw.split(','));

/* SUP-023-13: supersedes `await expect(page.locator('[data-rl-leg="rental-net"]')).toHaveCount(1)`;
   shape=derive. The literal pinned the rental leg to ONE node on the page, which was true only
   while the leg reached the headline alone; Scope 04 gives it the comparison and curve surfaces
   NFR-023-006 requires, so the literal now fails BECAUSE the leg reached more of them. The
   replacement keeps every protection the literal had — the leg is still asserted present, and
   still asserted not duplicated — and adds the two the literal could not express: the surface set
   is read from the page's own `data-rl-leg-surfaces` declaration instead of a hand-maintained
   number, and the leg is required to appear exactly once PER SURFACE with no node outside a
   declared surface. A bare 3 would have to be hand-edited again by the next scope that adds a
   surface, and that edit is indistinguishable from one hiding a leg that stopped rendering.
   Ledger: specs/023-property-tax-and-rental-income/spec.md#supersession-ledger */
async function legSurfaceCensus(page, legId) {
  return page.evaluate(({ leg }) => {
    const surfaces = (document.body.getAttribute('data-rl-leg-surfaces') || '')
      .split(',').filter((entry) => entry.length > 0);
    const findings = [];
    surfaces.forEach((surface) => {
      const hosts = Array.from(document.querySelectorAll(`[data-rl-leg-surface="${surface}"]`));
      if (hosts.length !== 1) {
        findings.push(`${surface}: ${hosts.length} elements declare this surface`);
        return;
      }
      const found = hosts[0].querySelectorAll(`[data-rl-leg="${leg}"]`).length;
      if (found !== 1) findings.push(`${surface}: the leg appears ${found} times on this surface`);
    });
    const exported = (document.body.getAttribute('data-rl-legs-record') || '')
      .split(',').filter((entry) => entry.length > 0);
    if (exported.indexOf(leg) < 0) findings.push('export: the leg is absent from the exported leg record');
    const total = document.querySelectorAll(`[data-rl-leg="${leg}"]`).length;
    if (total !== surfaces.length) {
      findings.push(`stray: ${total} nodes carry the leg against ${surfaces.length} declared surfaces`);
    }
    return { surfaces, total, exported, findings };
  }, { leg: legId });
}

/* The same derivation, run against a page whose first declared surface was deliberately damaged.
   `drop` removes the leg from that surface and `duplicate` renders it twice there; both must be
   reported by the name of the surface, which is what proves the census discriminates rather than
   returning an empty finding list for everything. */
async function damageFirstSurface(page, legId, mode) {
  return page.evaluate(({ leg, how }) => {
    const surface = (document.body.getAttribute('data-rl-leg-surfaces') || '')
      .split(',').filter((entry) => entry.length > 0)[0];
    const host = document.querySelector(`[data-rl-leg-surface="${surface}"]`);
    const node = host.querySelector(`[data-rl-leg="${leg}"]`);
    if (how === 'drop') node.remove();
    else host.appendChild(node.cloneNode(true));
    return surface;
  }, { leg: legId, how: mode });
}

/* Undo an adversarial DOM damage by forcing a real re-render. Re-entering the same declarations
   does NOT re-render: the page's declaration-signature guard deliberately no-ops on an unchanged
   signature, which is what keeps a control from detaching mid-interaction. Moving a declared
   figure away and back changes the signature twice, so the render that rebuilds the leg surfaces
   actually runs. */
async function rerenderFromDeclarations(page) {
  await page.fill('#inputRentalOperatingExpenses', String(PROFITABLE_RENTAL.operatingExpenses + 1));
  await page.fill('#inputRentalOperatingExpenses', String(PROFITABLE_RENTAL.operatingExpenses));
}

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* TP-03-21. */
test('Regression: SCN-023-007 a long-term rental settles after sourced depreciation and refuses without it', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 90000, bracketId: 'b3' });
  await openPower(page);
  await declareRental(page, PROFITABLE_RENTAL);

  /* The settlement reaches the page, and the two sourced parameters are rendered WITH the section
     each was transcribed from. A parameter rendered without its locator would be a figure the
     reader cannot check. */
  const recoveryRows = page.locator('#rentalCostRecoveryBody tr');
  await expect(recoveryRows.first()).toBeVisible();
  const period = FEDERAL_PACK.costRecovery.recoveryPeriod.years;
  const convention = FEDERAL_PACK.costRecovery.convention.conventionId;
  await expect(page.locator('#rentalCostRecoveryBody tr[data-rl-recovery="0"] td').nth(1))
    .toContainText(String(period));
  await expect(page.locator('#rentalCostRecoveryBody tr[data-rl-recovery="1"] td').nth(1))
    .toContainText(convention);
  const periodCitation = await page.locator('#rentalCostRecoveryBody tr[data-rl-recovery="0"] td')
    .nth(2).textContent();
  expect(periodCitation).toContain(FEDERAL_PACK.costRecovery.recoveryPeriod.locator.slice(0, 40));
  await expect(page.locator('#rentalCostRecoveryBody tr[data-rl-recovery="0"] td').nth(2))
    .toHaveAttribute('data-rl-origin', 'sourced');

  /* The net leg is published, and the declared half is labelled the household's own input. */
  /* SUP-023-13 replacement. */
  await expect.poll(async () => (await legSurfaceCensus(page, 'rental-net')).findings).toEqual([]);
  expect((await legSurfaceCensus(page, 'rental-net')).surfaces.length).toBeGreaterThan(0);
  const declaredOrigins = await page.locator('#rentalDeclarationsBody td[data-rl-origin]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-rl-origin')));
  expect(declaredOrigins.length).toBeGreaterThan(0);
  expect(declaredOrigins.every((origin) => origin === 'declared')).toBe(true);

  /* A pack whose recovery period was not retrieved refuses the depreciation AND the leg, and shows
     no settlement without cost recovery. */
  const absentPeriod = packServing((pack) => {
    pack.costRecovery.recoveryPeriod = {
      contractVersion: 'AbsentFigure/v1', code: 'RLTAX-THRESHOLD-UNAVAILABLE',
      domain: 'cost-recovery:recoveryPeriod',
      reason: 'This fixture pack deliberately carries no recovery period.',
      whatWouldMakeItAvailable: 'Retrieve the recovery period from its primary source.',
      missingSource: {
        title: 'Absent recovery-period fixture pointer', url: 'https://www.irs.gov/publications/p527',
        documentKind: 'publication', locator: 'Deliberately unretrieved.'
      }
    };
  });
  const absentPeriodSite = await startStaticServer({ overrides: absentPeriod });
  try {
    await openLifetimeTax(page, absentPeriodSite);
    await declareOrdinaryHousehold(page, { ordinary: 90000, bracketId: 'b3' });
    await openPower(page);
    await declareRental(page, PROFITABLE_RENTAL);
    const refusal = page.locator('#rentalRefusal [data-rl-unavailable]');
    await expect(refusal).toHaveAttribute('data-rl-unavailable', 'RLTAX-THRESHOLD-UNAVAILABLE');
    await expect(page.locator('#rentalCostRecoveryBody tr')).toHaveCount(0);
    await expect(page.locator('[data-rl-leg="rental-net"]')).toHaveCount(0);
  } finally {
    await absentPeriodSite.close();
  }
});

/* TP-03-22. */
test('Regression: SCN-023-008 the limit ladder is applied in order and every disallowed amount is published', async ({ page }) => {
  const ladderSite = await startStaticServer({ overrides: packServing(withFixtureAllowance) });
  try {
    await openLifetimeTax(page, ladderSite);
    await declareOrdinaryHousehold(page, { ordinary: 90000, bracketId: 'b3' });
    await openPower(page);
    await declareRental(page, LOSS_RENTAL);

    /* The ladder is rendered in APPLIED ORDER, with the at-risk limit first, and the orders are read
       from the pack rather than from the order the rows happen to be built in. */
    const ladderRows = page.locator('#rentalLimitLadderBody tr');
    const packOrder = FEDERAL_PACK.lossLimitPolicy.limits
      .slice().sort((left, right) => left.appliedOrder - right.appliedOrder)
      .map((row) => row.limitId);
    await expect(ladderRows).toHaveCount(packOrder.length);
    const renderedOrder = await ladderRows
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-rl-limit')));
    expect(renderedOrder).toEqual(packOrder);
    expect(renderedOrder[0]).toBe('at-risk');

    /* Every limit publishes its before, allowed and disallowed amounts, and the three reconcile in
       the rendered figures rather than only in the record behind them. */
    const money = (raw) => Number(String(raw).replace(/[^0-9.-]/g, ''));
    for (const limitId of packOrder) {
      const cells = page.locator(`#rentalLimitLadderBody tr[data-rl-limit="${limitId}"] td`);
      const before = money(await cells.nth(2).textContent());
      const allowed = money(await cells.nth(3).textContent());
      const disallowed = money(await cells.nth(4).textContent());
      expect(Math.abs((allowed + disallowed) - before)).toBeLessThan(1);
      await expect(page.locator(`[data-rl-disallowed="${limitId}"]`)).toHaveCount(1);
      await expect(cells.nth(5)).toHaveText('suspended');
    }

    /* The special allowance and its phase-out are stated rather than left to be inferred. */
    await expect(page.locator('#rentalAllowanceLine')).toContainText('allowance applied');
  } finally {
    await ladderSite.close();
  }
});

/* TP-03-23. */
test('Regression: SCN-023-009 the suspended loss closes for the declared year and no future year appears', async ({ page }) => {
  const carrySite = await startStaticServer({ overrides: packServing(withFixtureAllowance) });
  try {
    await openLifetimeTax(page, carrySite);
    await declareOrdinaryHousehold(page, { ordinary: 90000, bracketId: 'b3' });
    await openPower(page);
    await declareRental(page, Object.assign({}, LOSS_RENTAL, {
      atRiskAmount: 1000000, modifiedAdjustedGrossIncome: 60000, openingSuspendedLoss: 5000
    }));

    /* The opening figure is the household's declaration and is labelled as such. */
    const declaredRows = await page.locator('#rentalDeclarationsBody tr')
      .evaluateAll((nodes) => nodes.map((node) => node.textContent));
    expect(declaredRows.some((row) => /Opening suspended loss/.test(row))).toBe(true);
    expect(declaredRows.every((row) => !/Publication|section/.test(row))).toBe(true);

    /* The closing figure is published for the declared year only. */
    await expect(page.locator('#rentalCarryforwardLine')).toContainText('Closing suspended loss for the declared year');
    await expect(page.locator('#rentalNoProjectionLine'))
      .toContainText('No following year is computed, displayed or implied');

    /* No year other than the declared one appears in the rental section, where a computed figure
       for another year would be the projection FR-023-020 forbids. Provenance is excluded, because
       a publication edition names the source of a parameter rather than a projected year. */
    const declaredYear = String(FEDERAL_PACK.effectiveTaxYears[0]);
    const strayYears = await page.evaluate((year) => {
      const section = document.getElementById('power-rental');
      const clone = section.cloneNode(true);
      clone.querySelectorAll('[data-rl-origin="sourced"]').forEach((node) => node.remove());
      const matches = (clone.textContent || '').match(/\b(19|20)\d{2}\b/g) || [];
      return Array.from(new Set(matches.filter((match) => match !== year)));
    }, declaredYear);
    expect(strayYears).toEqual([]);
  } finally {
    await carrySite.close();
  }
});

/* TP-03-24. */
test('Regression: SCN-023-007 the rental leg reaches the headline, the comparison, the curve and the export', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 90000, bracketId: 'b3' });
  await openPower(page);
  await declareRental(page, PROFITABLE_RENTAL);

  /* The record's declared leg set is the set every surface is checked against. It is read from the
     page's own published set rather than pinned as a literal, so a leg a later scope adds is
     absorbed rather than requiring this assertion to be edited. */
  const declaredLegs = splitAttribute(await page.locator('body').getAttribute('data-rl-legs-record'));
  expect(declaredLegs).toContain('rental-net');

  /* The headline carries the rental leg as its own figure. */
  /* SUP-023-13 replacement. */
  await expect.poll(async () => (await legSurfaceCensus(page, 'rental-net')).findings).toEqual([]);
  const census = await legSurfaceCensus(page, 'rental-net');
  expect(census.surfaces.length).toBeGreaterThan(0);
  expect(census.total).toBe(census.surfaces.length);
  await expect(page.locator('[data-rl-value="rentalNet"]')).toHaveCount(1);

  /* SUP-023-13 adversarial cases. A leg dropped from one declared surface, and a leg rendered
     twice on one, are each reported by the NAME of that surface. Both damages are applied to the
     live page and then undone by a re-render, so the derivation is exercised rather than
     described. */
  const droppedSurface = await damageFirstSurface(page, 'rental-net', 'drop');
  const afterDrop = await legSurfaceCensus(page, 'rental-net');
  expect(afterDrop.findings.some((entry) => entry.indexOf(droppedSurface + ':') === 0)).toBe(true);
  expect(afterDrop.findings.some((entry) => entry.indexOf('stray:') === 0)).toBe(true);
  await rerenderFromDeclarations(page);
  await expect.poll(async () => (await legSurfaceCensus(page, 'rental-net')).findings).toEqual([]);

  const duplicatedSurface = await damageFirstSurface(page, 'rental-net', 'duplicate');
  const afterDuplicate = await legSurfaceCensus(page, 'rental-net');
  expect(afterDuplicate.findings.some((entry) => entry === `${duplicatedSurface}: the leg appears 2 times on this surface`)).toBe(true);
  await rerenderFromDeclarations(page);
  await expect.poll(async () => (await legSurfaceCensus(page, 'rental-net')).findings).toEqual([]);

  /* The Simple field set the page publishes contains the rental field, and it is derived from the
     page rather than pinned. */
  const simpleFields = splitAttribute(await page.locator('body').getAttribute('data-rl-simple-fields'));
  expect(simpleFields).toContain('rentalNet');

  /* The Power section that owns the withheld detail is declared and present, and the withheld
     detail links to it. */
  const powerSections = splitAttribute(await page.locator('body').getAttribute('data-rl-power-sections'));
  expect(powerSections).toContain('power-rental');
  await expect(page.locator('#power-rental')).toHaveCount(1);
  await expect(page.locator('#powerLinkRows button[data-power-section="power-rental"]')).toHaveCount(1);
});
