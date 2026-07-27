import { expect, test } from './playwright-runtime.mjs';

import {
  createBriefRefreshFixture,
  readPublicationState,
  runBriefRefreshFixture,
  startBriefFixtureServer
} from './brief-refresh-atomicity.support.mjs';

// Regression: specs/_bugs/BUG-002-market-brief-session-date-drift/
test('Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot', async ({ page }) => {
  test.setTimeout(90_000);
  const fixture = createBriefRefreshFixture({ browserAssets: true });
  const result = runBriefRefreshFixture(fixture);
  const publication = readPublicationState(fixture);
  const server = await startBriefFixtureServer(fixture);
  const externalRequests = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.hostname !== '127.0.0.1') externalRequests.push(request.url());
  });

  try {
    expect(result.status).toBe(0);
    await page.goto(`${server.baseUrl}/market-brief.html`);

    const nextSession = page.locator('#nextSession');
    await expect(page.locator('#liveNote')).toContainText('live shared cache refreshed', { timeout: 45_000 });
    await expect(nextSession).toContainText(fixture.baselineDate);
    // The universal RLTKR ticker decorator injects an "Explain <ticker>" context button
    // (<button class="rltkr-context">?</button>) after every KNOWN ticker anywhere in the
    // rendered body, so the visible thesis/action prose is the published July-15 text with
    // those affordance buttons interleaved (e.g. "MSFT" renders as "MSFT?"). Strip ONLY those
    // injected buttons, then require the FULL published thesis and first-action subject to
    // render verbatim — the design.md boundary that "the visible date, thesis, and action
    // content all remain July 15". Decoration-invariant, not a relaxation: every character of
    // the published thesis and action subject must still be present, so a drifted July-16
    // payload (or a renderer that dropped/replaced the published prose) still fails.
    const renderedNextSessionText = () => nextSession.evaluate((element) => {
      const clone = element.cloneNode(true);
      clone.querySelectorAll('.rltkr-context').forEach((button) => button.remove());
      return clone.textContent || '';
    });
    await expect.poll(renderedNextSessionText, { timeout: 15_000 }).toContain(publication.payload.nextSession.thesis);
    await expect.poll(renderedNextSessionText, { timeout: 15_000 }).toContain(publication.payload.nextSession.actions[0].subject);
    await expect(nextSession.locator('.next-head .pill.warn')).toHaveCount(0);
    expect(externalRequests).toEqual([]);
    expect(publication.snapshotDate).toBe(publication.payloadDate);
    expect(publication.snapshotBytes.equals(fixture.baseline['market-brief.snapshot.json'])).toBe(true);
    expect(publication.historyBytes.equals(fixture.baseline['brief-history.jsonl'])).toBe(true);
  } finally {
    await server.close();
    fixture.cleanup();
  }
});