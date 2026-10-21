import { defineConfig, devices } from "@playwright/test";

const PORT = 3123;

export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: `http://localhost:${PORT}`,
    ...devices["Pixel 7"],
  },
  // Service workers only register in production builds.
  webServer: {
    command: `pnpm build && pnpm start -p ${PORT}`,
    url: `http://localhost:${PORT}/crisis`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
