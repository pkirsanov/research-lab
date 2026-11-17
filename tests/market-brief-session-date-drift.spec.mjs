import { expect, test } from './playwright-runtime.mjs';

import {
  createBriefRefreshFixture,
  readPublicationState,
  runBriefRefreshFixture,
  startBriefFixtureServer
} from './brief-refresh-atomicity.support.mjs';

// Regression: specs/_bugs/BUG-002-market-brief-session-date-drift/
//
// Contract (revised 2026-11-13, commits 72a2b8aa7 and 2af03de69 — see the addendum in the bug
// design.md): when Tier A advances the session date but Tier B (the narrative) does not
// converge, the scheduled run does NOT roll the pair back to the prior session. It publishes
// the fresh Tier-A snapshot/history, retains the last coherent narrative prose, and syncs the
// payload's Tier-A date fields to the snapshot so the published pair stays coherent. The
// BUG-002 drift — a payload dated for one session beside a snapshot dated for another — is
// still what must never reach the page: if the sync step or the final pair validation were
// removed, this fixture would either abort (non-zero exit) or render a mismatched pair, and
// the assertions below catch exactly that.
test('Regression BUG-002: a non-converged narrative run rolls the session forward with a coherent, date-synced pair', async ({ page }) => {
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
    // A non-converged narrative must NOT abort the scheduled publication. Refusing to publish
    // on narrative non-convergence is precisely the behavior that froze the live site on one
    // session for days; raw-data-only with a retained narrative completes with exit 0.
    expect(result.status, `wrapper exited ${result.status} (signal ${result.signal}); stderr:\n${result.stderr}\nstdout:\n${result.stdout}`).toBe(0);
    await page.goto(`${server.baseUrl}/market-brief.html`);

    const nextSession = page.locator('#nextSession');
    await expect(page.locator('#liveNote')).toContainText('live shared cache refreshed', { timeout: 45_000 });
    // The visible session date ADVANCES to the candidate: the fresh Tier-A date is what the
    // page renders, never the retained prior-session date.
    await expect(nextSession).toContainText(fixture.candidateDate);
    // The universal RLTKR ticker decorator injects an "Explain <ticker>" context button
    // (<button class="rltkr-context">?</button>) after every KNOWN ticker anywhere in the
    // rendered body, so the visible thesis/action prose is the retained published text with
    // those affordance buttons interleaved (e.g. "MSFT" renders as "MSFT?"). Strip ONLY those
    // injected buttons, then require the FULL published thesis and first-action subject to
    // render verbatim — the retained-narrative guarantee: the published prose is exactly the
    // last coherent Tier-B text, neither drifted to new wording nor dropped.
    const renderedNextSessionText = () => nextSession.evaluate((element) => {
      const clone = element.cloneNode(true);
      clone.querySelectorAll('.rltkr-context').forEach((button) => button.remove());
      return clone.textContent || '';
    });
    await expect.poll(renderedNextSessionText, { timeout: 15_000 }).toContain(publication.payload.nextSession.thesis);
    await expect.poll(renderedNextSessionText, { timeout: 15_000 }).toContain(publication.payload.nextSession.actions[0].subject);
    // The candidate snapshot is written with marketClosed=true (the baseline snapshot has
    // marketClosed=false and shows no pill), so the "latest completed bars" pill is visible
    // only when the page renders the ADVANCED candidate snapshot — this also proves the page
    // is not serving the previously published baseline bytes.
    await expect(nextSession.locator('.next-head .pill.warn')).toHaveCount(1);
    await expect(nextSession.locator('.next-head .pill.warn')).toHaveText('latest completed bars');
    expect(externalRequests).toEqual([]);
    // The BUG-002 invariant: the published pair's dates are equal, and both are the ADVANCED
    // session. If the sync step were removed or weakened, the payload would keep the
    // prior-session date beside the advanced snapshot and these assertions fail.
    expect(publication.snapshotDate).toBe(publication.payloadDate);
    expect(publication.snapshotDate).toBe(fixture.candidateDate);
    expect(publication.payloadDate).toBe(fixture.candidateDate);
    // The snapshot on disk is the advanced candidate, not the previously published bytes.
    expect(JSON.parse(publication.snapshotBytes.toString('utf8')).nextSessionDate).toBe(fixture.candidateDate);
    // brief-history.jsonl is append-only: the baseline rows survive byte-for-byte as a prefix
    // and exactly one new boundary row records the advanced candidate session.
    const baselineHistoryText = fixture.baseline['brief-history.jsonl'].toString('utf8');
    const finalHistoryText = publication.historyBytes.toString('utf8');
    expect(finalHistoryText.startsWith(baselineHistoryText)).toBe(true);
    const appendedRows = finalHistoryText
      .split('\n').filter(Boolean)
      .slice(baselineHistoryText.split('\n').filter(Boolean).length)
      .map((row) => JSON.parse(row));
    expect(appendedRows).toHaveLength(1);
    expect(appendedRows[0].nextSessionDate).toBe(fixture.candidateDate);
  } finally {
    await server.close();
    fixture.cleanup();
  }
});
