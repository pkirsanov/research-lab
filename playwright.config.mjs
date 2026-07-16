import { defineConfig } from 'playwright/test';

export default defineConfig({
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