const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const createProject = require("../src/core/createProject");
const { createApp } = require("../src/core");
const { askProjectDetails } = require("../src/core/promptService");
const { validateProjectName } = require("../src/core/validators/projectValidator");

const cliPath = path.join(__dirname, "..", "bin", "cli.js");
let cliSpawningUnavailable = false;

async function withTempDir(run) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "setup-node-api-"));
  const previousCwd = process.cwd();

  try {
    process.chdir(tempRoot);
    await run(tempRoot);
  } finally {
    process.chdir(previousCwd);
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function runCli(args, cwd) {
  try {
    return execFileSync(process.execPath, [cliPath, ...args], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    if (error.code === "EPERM" && !error.stdout && !error.stderr) {
      cliSpawningUnavailable = true;
      throw new Error("CLI spawning is unavailable in this environment.");
    }
    throw error;
  }
}

function runCliExpectFailure(args, cwd) {
  try {
    runCli(args, cwd);
    throw new Error("Expected CLI command to fail");
  } catch (error) {
    if (!error.stdout && !error.stderr) {
      throw error;
    }

    return {
      stdout: error.stdout ?? "",
      stderr: error.stderr ?? "",
      status: error.status,
    };
  }
}

async function maybeRunCliTest(testFn) {
  if (cliSpawningUnavailable) {
    return "CLI spawning is unavailable in this environment.";
  }

  try {
    await testFn();
    return null;
  } catch (error) {
    if (error.message === "CLI spawning is unavailable in this environment.") {
      return error.message;
    }
    throw error;
  }
}

async function testJavaScriptTemplate() {
  await withTempDir(async (tempRoot) => {
    await createProject("sample-api", {
      install: false,
      port: 4010,
    });

    const packageJson = JSON.parse(
      fs.readFileSync(path.join(tempRoot, "sample-api", "package.json"), "utf8")
    );
    const envFile = fs.readFileSync(path.join(tempRoot, "sample-api", ".env"), "utf8");

    assert.equal(packageJson.name, "sample-api");
    assert.equal(envFile, "PORT=4010\n");
  });
}

async function testTypeScriptTemplate() {
  await withTempDir(async (tempRoot) => {
    await createProject("typed-api", {
      typescript: true,
      install: false,
    });

    const packageJson = JSON.parse(
      fs.readFileSync(path.join(tempRoot, "typed-api", "package.json"), "utf8")
    );

    assert.equal(packageJson.name, "typed-api");
    assert.equal(packageJson.main, "dist/app.js");
  });
}

async function testPromptDefaults() {
  const details = await askProjectDetails({
    projectName: "plain-api",
  });

  assert.deepEqual(details, {
    projectName: "plain-api",
    typescript: false,
    install: true,
  });
}

async function testProjectNameValidation() {
  assert.throws(
    () => validateProjectName("bad name"),
    /Use only letters, numbers, hyphens \(-\), and underscores \(_\)/
  );

  assert.doesNotThrow(() => validateProjectName("good-name_123"));
}

async function testCreateAppRejectsExistingDirectoryAfterPromptResolution() {
  await withTempDir(async (tempRoot) => {
    const existingProjectPath = path.join(tempRoot, "existing-app");
    fs.mkdirSync(existingProjectPath, { recursive: true });

    await assert.rejects(
      createApp("existing-app", {
        install: false,
        typescript: false,
      }),
      /Target folder already exists|Operation cancelled|Folder already exists/
    );
  });
}

async function testCliHelpOutput() {
  const output = runCli(["--help"], process.cwd());

  assert.match(output, /Scaffold a Node\.js \+ Express API/);
  assert.match(output, /--typescript/);
  assert.match(output, /--no-install/);
}

async function testCliScaffoldsJavaScriptProject() {
  await withTempDir(async (tempRoot) => {
    const output = runCli(["cli-js-app", "--no-install", "--port", "5050"], tempRoot);

    const packageJson = JSON.parse(
      fs.readFileSync(path.join(tempRoot, "cli-js-app", "package.json"), "utf8")
    );
    const appFile = fs.readFileSync(
      path.join(tempRoot, "cli-js-app", "src", "app.js"),
      "utf8"
    );
    const envFile = fs.readFileSync(path.join(tempRoot, "cli-js-app", ".env"), "utf8");

    assert.equal(packageJson.name, "cli-js-app");
    assert.equal(packageJson.private, true);
    assert.match(appFile, /app\.get\("\/health"/);
    assert.equal(envFile, "PORT=5050\n");
    assert.match(output, /Project ready\./);
  });
}

async function testCliScaffoldsTypeScriptProject() {
  await withTempDir(async (tempRoot) => {
    runCli(["cli-ts-app", "--typescript", "--no-install"], tempRoot);

    const packageJson = JSON.parse(
      fs.readFileSync(path.join(tempRoot, "cli-ts-app", "package.json"), "utf8")
    );
    const tsconfig = fs.readFileSync(
      path.join(tempRoot, "cli-ts-app", "tsconfig.json"),
      "utf8"
    );

    assert.equal(packageJson.name, "cli-ts-app");
    assert.equal(packageJson.private, true);
    assert.match(tsconfig, /"target": "ES2020"/);
    assert.match(tsconfig, /"forceConsistentCasingInFileNames": true/);
  });
}

async function testCliRejectsInvalidPort() {
  const { stdout, status } = runCliExpectFailure(
    ["demo-app", "--no-install", "--port", "99999"],
    process.cwd()
  );

  assert.equal(status, 1);
  assert.match(stdout, /Port must be an integer between 1 and 65535\./);
}

async function main() {
  const tests = [
    ["JavaScript template customization", testJavaScriptTemplate],
    ["TypeScript template customization", testTypeScriptTemplate],
    ["Non-interactive prompt defaults", testPromptDefaults],
    ["Project name validation", testProjectNameValidation],
    [
      "Existing-directory protection after final project resolution",
      testCreateAppRejectsExistingDirectoryAfterPromptResolution,
    ],
    ["CLI help output", () => maybeRunCliTest(testCliHelpOutput)],
    [
      "CLI JavaScript scaffold smoke test",
      () => maybeRunCliTest(testCliScaffoldsJavaScriptProject),
    ],
    [
      "CLI TypeScript scaffold smoke test",
      () => maybeRunCliTest(testCliScaffoldsTypeScriptProject),
    ],
    ["CLI invalid port handling", () => maybeRunCliTest(testCliRejectsInvalidPort)],
  ];
  let passedCount = 0;
  let skippedCount = 0;

  for (const [name, testFn] of tests) {
    const note = await testFn();

    if (note) {
      skippedCount += 1;
      console.log(`SKIP ${name}: ${note}`);
      continue;
    }

    passedCount += 1;
    console.log(`PASS ${name}`);
  }

  console.log(`\n${passedCount} tests passed, ${skippedCount} skipped`);
}

main().catch((error) => {
  console.error("Test failure");
  console.error(error);
  process.exit(1);
});
