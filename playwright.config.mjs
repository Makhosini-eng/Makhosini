import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  testMatch: '**/*.spec.mjs',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    headless: true,
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'node tests/browser/approval-preview-server.mjs',
    url: 'http://127.0.0.1:4173/health',
    host: '127.0.0.1',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
