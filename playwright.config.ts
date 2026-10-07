import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  testMatch: "*.spec.ts",
  workers: 1,
  fullyParallel: false,
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
      args: ["--no-sandbox"],
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: [
    {
      command: "npm run start -- --port 3100",
      url: "http://localhost:3100/login",
      reuseExistingServer: false,
      timeout: 120000,
      env: {
        POPS_DATA_DIR: process.env.POPS_E2E_DIR || "/tmp/pops-upa-e2e",
        NEXT_TELEMETRY_DISABLED: "1",
      },
    },
    {
      command: "npm run start -- --port 3101",
      url: "http://localhost:3101/login",
      reuseExistingServer: false,
      timeout: 120000,
      env: {
        POPS_DATA_DIR:
          process.env.E2E_BOOTSTRAP_DIR || "/tmp/pops-bootstrap-e2e",
        POPS_SEED_DEMO: "false",
        NEXT_TELEMETRY_DISABLED: "1",
      },
    },
    {
      command: "npm run start -- --port 3102",
      url: "http://localhost:3102/login",
      reuseExistingServer: false,
      timeout: 120000,
      env: {
        POPS_DATA_DIR:
          process.env.E2E_BOOTSTRAP_MOBILE_DIR ||
          "/tmp/pops-bootstrap-mobile-e2e",
        POPS_SEED_DEMO: "false",
        NEXT_TELEMETRY_DISABLED: "1",
      },
    },
  ],
});
