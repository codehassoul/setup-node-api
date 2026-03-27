#!/usr/bin/env node

const { Command } = require("commander");
const { createApp } = require("../src/core");
const {
  validateProjectName,
} = require("../src/core/validators/projectValidator");
const { handleExistingDir } = require("../src/core/services/fileService");
const path = require("path");

const program = new Command();

program
  .name("setup-node-api")
  .description("CLI to create a Node.js Express API")
  .version("1.0.0");

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
          console.log("❌ Cannot use current directory as project name.");
          process.exit(1);
        }
      }
    } catch (err) {
      console.log("❌", err.message);
      process.exit(1);
    }

    // ✅ PORT VALIDATION
    if (options.port && isNaN(options.port)) {
      console.log("❌ Port must be a number");
      process.exit(1);
    }

    // ⚠️ projectName might be undefined → that's okay (core will handle prompts)
    const projectPath = projectName
      ? path.join(process.cwd(), projectName)
      : null;

    // 🚨 EXTRA SAFETY (only if name exists)
    if (projectPath && projectPath === process.cwd()) {
      console.log("❌ Refusing to overwrite current directory.");
      process.exit(1);
    }

    // ✅ Handle overwrite ONLY if projectName exists
    if (projectPath) {
      try {
        await handleExistingDir(projectPath);
      } catch (err) {
        console.log("⚠️", err.message);
        process.exit(0);
      }
    }

    try {
      await createApp(projectName, {
        typescript: options.typescript,
        install: options.install === false ? false : undefined,
        port: options.port,
      });
    } catch (err) {
      console.log("❌ Unexpected error:", err.message);
      process.exit(1);
    }
  });

program.parse(process.argv);