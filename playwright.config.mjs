import { defineConfig } from 'playwright/test';

export default defineConfig({
  testMatch: '**/*.spec.mjs',
  /* Match the pipeline, which pins --workers=2. The knob that decides whether a run stalls is
     this worker count, not the browser project. Left unset, a local run defaults to half the
     CPU count, and on macOS a `system-chrome` run at that raised count intermittently leaves
     worker processes that never signal their exit. Playwright waits out its 300000ms teardown
     budget, reports `worker-N process did not exit within 300000ms after stop, force-killed
     it`, and exits 1 with every test passed. Holding the project fixed and moving only the
     worker count, measured at 6/8 runs stalling at six workers, 1/3 at four, 0/3 at two.
     Wall-time cost when it stalls: 343s against 81s for the same 111 tests at the two workers
     configured here, plus a non-zero exit that no test earned. A later round re-derived that
     controlled pair independently at 366s against 76s, same 111 tests, all passing in both.
     A CLI --workers flag still overrides this line, and raising it is the remaining way to
     meet the stall — so the guidance is to leave this value alone.
     Switching to --project=chromium is NOT the remedy. That project was clean at six workers,
     but on two runs only, which cannot establish that it is immune; and CI runs the suite on
     system-chrome, so moving off it trades away local/CI browser parity to dodge a condition
     two workers already avoids. The cause is upstream, not here: the force-kill is emitted by
     node_modules/playwright/lib/runner/index.js against the operator's installed Chrome, so
     this line bounds exposure rather than removing the defect.
     See specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos/. */
  workers: 2,
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