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
    await expect(nextSession).toContainText(publication.payload.nextSession.thesis);
    await expect(nextSession).toContainText(publication.payload.nextSession.actions[0].subject);
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