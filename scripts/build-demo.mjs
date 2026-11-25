import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const outputDirectory = path.join(projectRoot, "out");
const nextCli = path.join(
  projectRoot,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);

rmSync(outputDirectory, { recursive: true, force: true });

const result = spawnSync(
  process.execPath,
  [nextCli, "build", "--webpack"],
  {
    cwd: projectRoot,
    env: {
      ...process.env,
      NEXT_PUBLIC_BASE_PATH: "/demo",
    },
    stdio: "inherit",
  },
);

if (result.error) throw result.error;
if (result.status !== 0) {
  throw new Error(`Demo build failed with exit code ${result.status}.`);
}

console.log("Created standalone /demo static export in out/.");
