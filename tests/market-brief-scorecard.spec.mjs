import { readFileSync } from 'node:fs';

import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './provider-credentials.support.mjs';

/*
 * The scorecard is the product's one defensible claim made numeric: it publishes the brief's own
 * error rate. These specs assert the properties that make it trustworthy rather than flattering —
 * that it renders FIRST, that it shows misses, and above all that it REFUSES to print a rate the
 * sample cannot support.
 */

const REAL_SCORECARD = JSON.parse(readFileSync(new URL('../market-brief.scorecard.json', import.meta.url), 'utf8'));

/** A scorecard with a chosen resolved sample, otherwise shaped exactly like the committed one. */
function scorecardWith({ satisfied, invalidated, minResolvedSample, misses = [] }) {
  const closed = satisfied + invalidated;
  const resolved = satisfied + invalidated;
  const window = {
    days: null, closed, satisfied, invalidated, expired: 0, unresolved: 0, notEvaluable: 0,
    resolved,
    hitRate: resolved < minResolvedSample ? null : Math.round((satisfied / resolved) * 1e4) / 1e4,
    insufficientSample: resolved < minResolvedSample,
    notEvaluableShare: 0,
    byHorizon: {}, byDirection: {}, byDomain: {},
    calibration: [{
      bucket: '60-69', label: '60-69', closed, resolved, stated: 0.62,
      realised: resolved < minResolvedSample ? null : Math.round((satisfied / resolved) * 1e4) / 1e4,
      insufficientSample: resolved < minResolvedSample
    }]
  };
  return {
    contractVersion: 'brief-scorecard/v1',
    generatedAt: '2026-07-31T00:00:00.000Z',
    policy: { minResolvedSample, recentMissCount: 3, windowDays: [30, 90], note: 'test fixture' },
    openCalls: 0,
    windows: { all: window, '30d': window, '90d': window },
    recentMisses: misses
  };
}

async function openBrief(page, server) {
  await page.goto(`${server.baseUrl}/market-brief.html`);
  await expect(page.locator('#scorecard')).toBeVisible();
}

test('the scorecard renders above the attention feed and reports the committed outcome ledger', async ({ page }) => {
  test.setTimeout(90_000);
  const server = await startStaticServer();
  try {
    await openBrief(page, server);
    const scorecard = page.locator('#scorecard');
    const all = REAL_SCORECARD.windows.all;

    // The published counts, not a placeholder.
    await expect(scorecard).toContainText(`${all.resolved} resolved of ${all.closed} closed`);
    await expect(scorecard).toContainText(`${REAL_SCORECARD.openCalls} still open`);
    await expect(scorecard).toContainText('not machine-evaluable');

    // Position is the point: the track record is read BEFORE the next claim.
    const order = await page.evaluate(() => {
      const card = document.getElementById('scorecard');
      const feed = document.getElementById('attention');
      const next = document.getElementById('nextSession');
      return {
        beforeAttention: !!(card && feed) && (card.compareDocumentPosition(feed) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
        beforeNextSession: !!(card && next) && (card.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
      };
    });
    expect(order.beforeAttention).toBe(true);
    expect(order.beforeNextSession).toBe(true);

    // Every headline figure carries a contextual tooltip saying what THIS reading means.
    const untooltipped = await page.evaluate(() => {
      const pills = Array.from(document.querySelectorAll('#scorecard .scorecard-head .pill'));
      return pills.filter((pill) => !(pill.getAttribute('title') || '').trim()).length;
    });
    expect(untooltipped).toBe(0);
  } finally {
    await server.close();
  }
});

test('SCN-019-020 compact standing research read is visible on the brief and deep-links to its owner', async ({ page }) => {
  const server = await startStaticServer();
  try {
    await openBrief(page, server);
    const section = page.locator('#standingResearch');
    await expect(section).toBeVisible();
    await expect(section.locator('.research-agenda-row')).toHaveCount(3);
    // Every row is asserted as a CONTRACT, not against one authored sentence for one reason code.
    // The prior version pinned the exact prose of whichever reason the 4×/day scheduled refresh had
    // last published, so a routine producer change from `research-lane-unavailable` to
    // `situation-shape-invalid` broke it — while the defect that change actually exposed (the
    // renderer Title-Cased the unmapped slug into "Situation Shape Invalid.") was invisible to it,
    // because that is just a different string. These assertions hold for every reason code and fail
    // on the regression.
    const slugAsProse = /\b(?:[A-Z][a-z]+ ){2,}(?:Invalid|Missing|Incomplete|Elapsed|Unavailable)\b/;
    for (const topicId of ['geopolitical-supply-shock', 'defense-earnings-acceleration', 'food-inputs-outlook']) {
      const row = section.locator(`[data-research-topic="${topicId}"]`);
      await expect(row).toBeVisible();
      const text = (await row.innerText()).trim();
      // The state glyph and word are always present, and the row always carries a reader sentence.
      expect(text, `${topicId} states its topic state`).toMatch(/reviewed|unavailable|stale|deferred|not.due/i);
      expect(text, `${topicId} carries a terminated reader sentence`).toMatch(/[.!?](\s|$)/);
      expect(text, `${topicId} must not print a Title-Cased machine slug as prose: ${text}`).not.toMatch(slugAsProse);
      /* Adversarial on the raw code itself. A hyphenated code may appear ONLY inside the explicit
         "Reason code: <code>." frame the fallback uses when a producer emits a code the shared map
         has not yet been taught — that frame is honest, because it presents the code AS a code. A
         bare code dropped into the sentence is the leak. Banning every hyphenated token outright
         (the first version of this assertion) would have forbidden the honest fallback itself. */
      const codeTokens = [...text.matchAll(/\b[a-z]+(?:-[a-z]+){2,}\b/g)].map((m) => m[0]);
      for (const token of codeTokens) {
        expect(text, `${topicId} may print the code ${token} only inside the "Reason code:" frame`)
          .toContain(`Reason code: ${token}.`);
      }
    }
    const ownerLink = section.locator('[data-research-topic="geopolitical-supply-shock"] a');
    await expect(ownerLink).toHaveAttribute('href', 'research-agenda-lab.html#power/geopolitical-supply-shock');
    await ownerLink.click();
    await expect(page).toHaveURL(/research-agenda-lab\.html#power\/geopolitical-supply-shock$/);
    await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
    await expect(page.locator('body')).toHaveAttribute('data-rlview', 'power');
    await expect(page.locator('[data-public-target-id="geopolitical-supply-shock"]')).toBeFocused();
  } finally {
    await server.close();
  }
});

test('a below-minimum sample withholds the rate and shows the sample size instead', async ({ page }) => {
  test.setTimeout(90_000);
  const server = await startStaticServer({
    overrides: {
      'market-brief.scorecard.json': JSON.stringify(scorecardWith({ satisfied: 3, invalidated: 1, minResolvedSample: 20 }))
    }
  });
  try {
    await openBrief(page, server);
    const scorecard = page.locator('#scorecard');
    await expect(scorecard).toContainText('rate withheld — n = 4');
    // A 3/4 sample would render "75%" if the guard were absent. Requiring its ABSENCE is what makes
    // this test able to fail; asserting only the withheld text would pass either way.
    await expect(scorecard).not.toContainText('resolved in favour');
    await expect(scorecard).toContainText('insufficient sample');
  } finally {
    await server.close();
  }
});

test('ADVERSARIAL: an at-minimum sample DOES print the rate, so the withholding guard is not vacuous', async ({ page }) => {
  test.setTimeout(90_000);
  // Same shape, same code path, only the sample crosses the declared minimum. If the page could
  // never print a rate at all, the previous test would be trivially green and prove nothing.
  const server = await startStaticServer({
    overrides: {
      'market-brief.scorecard.json': JSON.stringify(scorecardWith({ satisfied: 12, invalidated: 8, minResolvedSample: 20 }))
    }
  });
  try {
    await openBrief(page, server);
    const scorecard = page.locator('#scorecard');
    await expect(scorecard).toContainText('resolved in favour 60%');
    await expect(scorecard).not.toContainText('rate withheld');
  } finally {
    await server.close();
  }
});

test('misses are published in full, with the level that invalidated them', async ({ page }) => {
  test.setTimeout(90_000);
  const server = await startStaticServer({
    overrides: {
      'market-brief.scorecard.json': JSON.stringify(scorecardWith({
        satisfied: 12, invalidated: 8, minResolvedSample: 20,
        misses: [{
          recommendationKey: 'sha256:test', instrument: 'SPY', direction: 'hold', horizon: 'structural',
          confidence: 62, deepLink: 'etf-momentum-lab.html',
          proposedAt: '2026-07-13T15:00:00-04:00', closedAt: '2026-07-20T13:30:00.000Z',
          reasonCode: 'invalidation-level-below-743.2',
          invalidatedBy: { instrument: 'SPY', relation: 'below', level: 743.2, close: 742.09, closedAt: '2026-07-20T13:30:00.000Z', sessionsToResolve: 1 }
        }]
      }))
    }
  });
  try {
    await openBrief(page, server);
    const scorecard = page.locator('#scorecard');
    await expect(scorecard).toContainText('Most recent misses');
    // The miss must carry its instrument, its published level, the close that broke it, and the
    // confidence it was stated at — a miss shown without its terms is not accountability.
    await expect(scorecard).toContainText('743.2');
    await expect(scorecard).toContainText('742.09');
    await expect(scorecard).toContainText('stated 62%');
    await expect(scorecard).not.toContainText('No call has been invalidated yet');
  } finally {
    await server.close();
  }
});
