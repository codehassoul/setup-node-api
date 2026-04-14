const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const createProject = require("../src/core/createProject");
const { createApp } = require("../src/core");
const { askProjectDetails } = require("../src/core/promptService");
const { handleExistingDir } = require("../src/core/services/fileService");
const { installDependencies } = require("../src/core/services/installService");
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

async function withInteractiveState(stdinIsTTY, stdoutIsTTY, run) {
  const stdinDescriptor = Object.getOwnPropertyDescriptor(process.stdin, "isTTY");
  const stdoutDescriptor = Object.getOwnPropertyDescriptor(process.stdout, "isTTY");

  Object.defineProperty(process.stdin, "isTTY", {
    configurable: true,
    value: stdinIsTTY,
  });
  Object.defineProperty(process.stdout, "isTTY", {
    configurable: true,
    value: stdoutIsTTY,
  });

  try {
    await run();
  } finally {
    if (stdinDescriptor) {
      Object.defineProperty(process.stdin, "isTTY", stdinDescriptor);
    } else {
      delete process.stdin.isTTY;
    }

    if (stdoutDescriptor) {
      Object.defineProperty(process.stdout, "isTTY", stdoutDescriptor);
    } else {
      delete process.stdout.isTTY;
    }
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
      cors: true,
      install: false,
      port: 4010,
    });

    const packageJson = JSON.parse(
      fs.readFileSync(path.join(tempRoot, "sample-api", "package.json"), "utf8")
    );
    const envFile = fs.readFileSync(path.join(tempRoot, "sample-api", ".env"), "utf8");
    const readmeFile = fs.readFileSync(
      path.join(tempRoot, "sample-api", "README.md"),
      "utf8"
    );
    const gitignoreFile = fs.readFileSync(
      path.join(tempRoot, "sample-api", ".gitignore"),
      "utf8"
    );
    const appFile = fs.readFileSync(
      path.join(tempRoot, "sample-api", "src", "app.js"),
      "utf8"
    );

    assert.equal(packageJson.name, "sample-api");
    assert.equal(packageJson.scripts.dev, "node --watch src/app.js");
    assert.equal(packageJson.dependencies.cors, "^2.8.5");
    assert.equal(envFile, "PORT=4010\n");
    assert.match(readmeFile, /# sample-api/);
    assert.match(readmeFile, /CORS is enabled/);
    assert.match(gitignoreFile, /node_modules/);
    assert.match(appFile, /app\.post\("\/echo"/);
    assert.match(appFile, /app\.use\(cors\(\)\)/);
    assert.match(appFile, /express\.json/);
    assert.match(appFile, /console\.log\(`\$\{req\.method\} \$\{req\.url\}`\)/);
    assert.match(appFile, /Not Found/);
    assert.match(appFile, /Internal Server Error/);
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
    const readmeFile = fs.readFileSync(
      path.join(tempRoot, "typed-api", "README.md"),
      "utf8"
    );
    const gitignoreFile = fs.readFileSync(
      path.join(tempRoot, "typed-api", ".gitignore"),
      "utf8"
    );
    const appFile = fs.readFileSync(
      path.join(tempRoot, "typed-api", "src", "app.ts"),
      "utf8"
    );

    assert.equal(packageJson.name, "typed-api");
    assert.equal(packageJson.main, "dist/app.js");
    assert.match(readmeFile, /# typed-api/);
    assert.match(gitignoreFile, /dist/);
    assert.match(appFile, /express\.json/);
    assert.match(appFile, /Internal Server Error/);
  });
}

async function testPromptDefaults() {
  let details;

  await withInteractiveState(false, false, async () => {
    details = await askProjectDetails({
      projectName: "plain-api",
    });
  });

  assert.deepEqual(details, {
    projectName: "plain-api",
    typescript: false,
    install: true,
    cors: false,
  });
}

async function testYesDefaults() {
  const details = await askProjectDetails({
    projectName: "fast-api",
    yes: true,
  });

  assert.deepEqual(details, {
    projectName: "fast-api",
    typescript: false,
    install: true,
    cors: false,
  });
}

async function testProjectNameValidation() {
  assert.throws(
    () => validateProjectName(""),
    /Project name cannot be empty/
  );
  assert.throws(
    () => validateProjectName("node_modules"),
    /reserved/
  );
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

    await withInteractiveState(false, false, async () => {
      await assert.rejects(
        createApp("existing-app", {
          install: false,
          typescript: false,
        }),
        /Target folder already exists|Operation cancelled|Folder already exists/
      );
    });
  });
}

async function testCreateAppRejectsInvalidProvidedNameBeforePrompting() {
  let promptWasReached = false;

  await assert.rejects(
    createApp(".git", {
      get typescript() {
        promptWasReached = true;
        return undefined;
      },
    }),
    /reserved/
  );

  assert.equal(promptWasReached, false);
}

async function testYesRequiresProjectName() {
  await assert.rejects(
    askProjectDetails({
      yes: true,
    }),
    /Project name is required when using --yes/
  );
}

async function testHandleExistingDirCancelsOverwrite() {
  await withTempDir(async (tempRoot) => {
    const existingProjectPath = path.join(tempRoot, "cancel-app");
    fs.mkdirSync(existingProjectPath, { recursive: true });

    await assert.rejects(
      handleExistingDir(existingProjectPath, {
        existsSync: () => true,
        isInteractive: () => true,
        promptOverwrite: async () => ({ overwrite: false }),
      }),
      /Operation cancelled/
    );

    assert.equal(fs.existsSync(existingProjectPath), true);
  });
}

async function testHandleExistingDirOverwritesWhenConfirmed() {
  await withTempDir(async (tempRoot) => {
    const existingProjectPath = path.join(tempRoot, "overwrite-app");
    fs.mkdirSync(existingProjectPath, { recursive: true });

    await handleExistingDir(existingProjectPath, {
      existsSync: () => true,
      isInteractive: () => true,
      promptOverwrite: async () => ({ overwrite: true }),
    });

    assert.equal(fs.existsSync(existingProjectPath), false);
  });
}

async function testInstallDependenciesFailureHandling() {
  await assert.rejects(
    installDependencies(process.cwd(), {
      runCommand: () => ({ status: 1 }),
      installCommand: { command: "npm", args: ["install"] },
    }),
    /Dependency installation failed \(npm exited with code 1\)/
  );
}

async function testInstallDependenciesUsesWindowsCommandWrapper() {
  const windowsCommand = require("../src/core/services/installService").getInstallCommand(
    "win32"
  );

  assert.equal(windowsCommand.command, "cmd.exe");
  assert.deepEqual(windowsCommand.args, ["/d", "/s", "/c", "npm install"]);
}

async function testMissingTemplateFailsClearly() {
  await withTempDir(async (tempRoot) => {
    const emptyTemplatesRoot = path.join(tempRoot, "empty-templates");
    fs.mkdirSync(emptyTemplatesRoot, { recursive: true });

    await assert.rejects(
      createProject("broken-api", {
        install: false,
        templateRoot: emptyTemplatesRoot,
      }),
      /Template not found/
    );

    assert.equal(fs.existsSync(path.join(tempRoot, "broken-api")), false);
  });
}

async function testCliHelpOutput() {
  const output = runCli(["--help"], process.cwd());

  assert.match(output, /Scaffold a Node\.js \+ Express API/);
  assert.match(output, /--typescript/);
  assert.match(output, /--no-install/);
  assert.match(output, /--cors/);
  assert.match(output, /--yes/);
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
    ["Yes-mode defaults", testYesDefaults],
    ["Project name validation", testProjectNameValidation],
    [
      "Existing-directory protection after final project resolution",
      testCreateAppRejectsExistingDirectoryAfterPromptResolution,
    ],
    [
      "Provided invalid names fail before prompting",
      testCreateAppRejectsInvalidProvidedNameBeforePrompting,
    ],
    ["Yes-mode requires project name", testYesRequiresProjectName],
    ["Overwrite prompt cancellation", testHandleExistingDirCancelsOverwrite],
    ["Overwrite prompt confirmation", testHandleExistingDirOverwritesWhenConfirmed],
    ["Dependency installation failure handling", testInstallDependenciesFailureHandling],
    ["Windows install command wrapper", testInstallDependenciesUsesWindowsCommandWrapper],
    ["Missing template handling", testMissingTemplateFailsClearly],
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
