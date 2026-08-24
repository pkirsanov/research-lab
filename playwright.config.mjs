import { defineConfig } from 'playwright/test';

export default defineConfig({
  testMatch: '**/*.spec.mjs',
  /* Match the pipeline, which pins --workers=2. Left unset, a local run defaults to half the
     CPU count, and on a 12-core machine six concurrent system-Chrome instances intermittently
     fail to signal their exit: the runner then waits five minutes and exits 1 with every test
     passed. Measured at 6/8 runs stalling at six workers, 1/3 at four, 0/3 at two. A CLI
     --workers flag still overrides this. See specs/_bugs/BUG-017-*. */
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