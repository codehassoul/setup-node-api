const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const createProject = require("../src/core/createProject");
const { createApp } = require("../src/core");
const { askProjectDetails } = require("../src/core/promptService");
const { validateProjectName } = require("../src/core/validators/projectValidator");

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
  ];

  for (const [name, testFn] of tests) {
    await testFn();
    console.log(`PASS ${name}`);
  }

  console.log(`\n${tests.length} tests passed`);
}

main().catch((error) => {
  console.error("Test failure");
  console.error(error);
  process.exit(1);
});
