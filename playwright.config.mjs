import { defineConfig } from 'playwright/test';

export default defineConfig({
  testMatch: '**/*.spec.mjs',
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