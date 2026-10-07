import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
const folder = mkdtempSync(path.join(tmpdir(), "pops-e2e-"));
const env = {
  ...process.env,
  POPS_DATA_DIR: folder,
  POPS_E2E_DIR: folder,
  ADMIN_SETUP_CODE: randomBytes(32).toString("hex"),
  E2E_BOOTSTRAP_MOBILE_DIR: mkdtempSync(
    path.join(tmpdir(), "pops-bootstrap-mobile-e2e-"),
  ),
  E2E_BOOTSTRAP_DIR: mkdtempSync(path.join(tmpdir(), "pops-bootstrap-e2e-")),
  E2E_PASSWORD: randomBytes(32).toString("hex"),
  NEXT_TELEMETRY_DISABLED: "1",
};
try {
  const setup = spawnSync(
    process.execPath,
    ["--experimental-strip-types", "tests/setup-e2e.ts"],
    { env, stdio: "inherit" },
  );
  if (setup.status !== 0) process.exitCode = 1;
  else {
    const result = spawnSync(
      "node",
      [
        "node_modules/@playwright/test/cli.js",
        "test",
        ...process.argv.slice(2),
      ],
      { env, stdio: "inherit" },
    );
    process.exitCode = result.status ?? 1;
  }
} finally {
  rmSync(folder, { recursive: true, force: true });
  rmSync(env.E2E_BOOTSTRAP_DIR, { recursive: true, force: true });
  rmSync(env.E2E_BOOTSTRAP_MOBILE_DIR, { recursive: true, force: true });
}
