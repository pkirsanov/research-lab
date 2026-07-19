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
    }
  ]
});