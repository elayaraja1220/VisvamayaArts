import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
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
const temporaryDirectory = mkdtempSync(
  path.join(tmpdir(), "vismayam-build-"),
);
const rootBuild = path.join(temporaryDirectory, "root");
const demoBuild = path.join(temporaryDirectory, "demo");
let rootBuildReady = false;

function build(basePath, label) {
  rmSync(outputDirectory, { recursive: true, force: true });

  const result = spawnSync(
    process.execPath,
    [nextCli, "build", "--webpack"],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        NEXT_PUBLIC_BASE_PATH: basePath,
      },
      stdio: "inherit",
    },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${label} build failed with exit code ${result.status}.`);
  }
}

try {
  build("", "Root");
  cpSync(outputDirectory, rootBuild, { recursive: true });
  rootBuildReady = true;

  build("/demo", "Demo");
  cpSync(outputDirectory, demoBuild, { recursive: true });

  rmSync(outputDirectory, { recursive: true, force: true });
  cpSync(rootBuild, outputDirectory, { recursive: true });
  cpSync(demoBuild, path.join(outputDirectory, "demo"), {
    recursive: true,
  });

  console.log("Created root and /demo static exports in out/.");
} catch (error) {
  if (rootBuildReady) {
    rmSync(outputDirectory, { recursive: true, force: true });
    cpSync(rootBuild, outputDirectory, { recursive: true });
  }

  throw error;
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
