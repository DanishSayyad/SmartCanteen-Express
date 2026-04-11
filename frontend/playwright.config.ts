import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: [
    {
      command:
        '/bin/zsh -lc "docker compose up -d --build app"',
      cwd: '..',
      url: 'http://127.0.0.1:8080/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 240_000
    },
    {
      command:
        '/bin/zsh -lc "VITE_API_BASE_URL=http://127.0.0.1:8080/api VITE_BACKEND_BASE_URL=http://127.0.0.1:8080 VITE_PAYMENT_MODE=fake VITE_ENABLE_QA_TOOLS=true pnpm dev"',
      cwd: '.',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000
    }
  ]
});
