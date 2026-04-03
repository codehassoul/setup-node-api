#!/usr/bin/env node

const path = require("path");
const { Command } = require("commander");
const packageJson = require("../package.json");
const { createApp } = require("../src/core");
const {
  validateProjectName,
} = require("../src/core/validators/projectValidator");
const { handleExistingDir } = require("../src/core/services/fileService");

const program = new Command();

program
  .name("setup-node-api")
  .description("CLI to create a Node.js Express API")
  .version(packageJson.version);

program
  .argument("[project-name]", "Name of the project")
  .option("--no-install", "Skip installing dependencies")
  .option("--port <number>", "Set server port")
  .option("--typescript", "Use TypeScript template")
  .action(async (projectName, options) => {
    try {
      if (projectName !== undefined) {
        validateProjectName(projectName);

        const projectPathCheck = path.join(process.cwd(), projectName);

        if (projectPathCheck === process.cwd()) {
          console.log("Error: cannot use current directory as project name.");
          process.exit(1);
        }
      }
    } catch (err) {
      console.log("Error:", err.message);
      process.exit(1);
    }

    const parsedPort =
      options.port === undefined ? undefined : Number.parseInt(options.port, 10);

    if (
      options.port !== undefined &&
      (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535)
    ) {
      console.log("Error: port must be an integer between 1 and 65535.");
      process.exit(1);
    }

    const projectPath = projectName
      ? path.join(process.cwd(), projectName)
      : null;

    if (projectPath && projectPath === process.cwd()) {
      console.log("Error: refusing to overwrite the current directory.");
      process.exit(1);
    }

    if (projectPath) {
      try {
        await handleExistingDir(projectPath);
      } catch (err) {
        console.log("Warning:", err.message);
        process.exit(0);
      }
    }

    try {
      await createApp(projectName, {
        typescript: options.typescript,
        install: options.install === false ? false : undefined,
        port: parsedPort,
      });
    } catch (err) {
      console.log("Error:", err.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
