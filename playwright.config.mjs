import { defineConfig } from 'playwright/test';

export default defineConfig({
  testMatch: '**/*.spec.mjs',
  /* Scope 4 selects the rollback-gated one-worker fallback for macOS `system-chrome` runs.
    The exact 94-test workload recurred at two workers after every test passed, and the
    Foundation lifecycle candidate was rejected after two current validation failures and
    restored to its pre-candidate bytes. Playwright can wait out its unchanged 300000ms
    teardown budget, report `worker-N process did not exit within 300000ms after stop,
    force-killed it`, and exit 1 after a fully green run. Historical characterization remains
    6/8 stalls at six workers, 1/3 at four, and 0/3 at two; that 0/3 sample did not establish
    safety. The measured stalled cost was 343s against 81s for the same 111 tests. A later
    round independently measured 366s against 76s on that same workload.
    A CLI --workers flag still overrides this line, so leave the fallback value unchanged.
     Switching to --project=chromium is NOT the remedy. That project was clean at six workers,
     but on two runs only, which cannot establish that it is immune; and CI runs the suite on
     system-chrome, so moving off it trades away local/CI browser parity to dodge a condition
    this fallback only bounds. The cause is upstream, not here: the force-kill is emitted by
     node_modules/playwright/lib/runner/index.js against the operator's installed Chrome, so
     this line bounds exposure rather than removing the defect.
     See specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos/. */
  workers: 1,
  projects: [
    {
      name: 'system-chrome',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        headless: true
      }
    },
    {
      // Bundled Playwright chromium — lets the provider-credentials UI spec validate
      // locally without a system Chrome install. CI invokes --project=system-chrome
      // explicitly, so this project is inert there.
      name: 'chromium',
      use: {
        browserName: 'chromium',
        headless: true
      }
    }
  ]
});