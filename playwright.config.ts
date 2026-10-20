import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Test the production bundle, the same thing the Docker image serves.
  webServer: {
    command: "bun run build && bun run start",
    url: `http://localhost:${PORT}/health`,
    env: { PORT: String(PORT) },
    reuseExistingServer: !process.env.CI,
  },
});
