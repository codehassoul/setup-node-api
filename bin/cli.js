#!/usr/bin/env node

const { Command } = require("commander");
const createProject = require("../src/commands/create");
const { askProjectDetails } = require("../src/utils/prompt");
const fs = require("fs");
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
    // 🚨 SAFETY VALIDATION
    const reservedNames = ["node_modules", ".git", ".", ".."];

    function isValidProjectName(name) {
      return /^[a-zA-Z0-9-_]+$/.test(name);
    }

    // 🔥 Empty string check
    if (projectName !== undefined && projectName.trim() === "") {
      console.log("❌ Project name cannot be empty");
      process.exit(1);
    }

    if (projectName) {
      if (reservedNames.includes(projectName)) {
        console.log(`❌ Invalid project name: "${projectName}" is reserved.`);
        process.exit(1);
      }

      if (!isValidProjectName(projectName)) {
        console.log(
          "❌ Invalid project name. Use only letters, numbers, hyphens (-), and underscores (_)"
        );
        process.exit(1);
      }

      const projectPathCheck = path.join(process.cwd(), projectName);

      if (projectPathCheck === process.cwd()) {
        console.log("❌ Cannot use current directory as project name.");
        process.exit(1);
      }
    }

    // ✅ PORT VALIDATION (before prompts)
    if (options.port && isNaN(options.port)) {
      console.log("❌ Port must be a number");
      process.exit(1);
    }

    // 🟢 PROMPTS WITH CTRL+C HANDLING
    let initialAnswers;

    try {
      initialAnswers = await askProjectDetails({
        projectName,
        typescript: options.typescript,
        install: options.install === false ? false : undefined,
      });
    } catch (err) {
      if (err.name === "ExitPromptError") {
        console.log("\n⚠️ Operation cancelled");
        process.exit(0);
      }

      console.log("❌ Unexpected error:", err.message);
      process.exit(1);
    }

    const projectPath = path.join(process.cwd(), initialAnswers.projectName);

    // 🚨 EXTRA SAFETY
    if (projectPath === process.cwd()) {
      console.log("❌ Refusing to overwrite current directory.");
      process.exit(1);
    }

    if (fs.existsSync(projectPath)) {
      const { default: inquirer } = await import("inquirer");

      let overwriteAnswer;

      try {
        overwriteAnswer = await inquirer.prompt([
          {
            type: "confirm",
            name: "overwrite",
            message: "Folder already exists. Overwrite?",
            default: false,
          },
        ]);
      } catch (err) {
        if (err.name === "ExitPromptError") {
          console.log("\n⚠️ Operation cancelled");
          process.exit(0);
        }

        console.log("❌ Unexpected error:", err.message);
        process.exit(1);
      }

      if (!overwriteAnswer.overwrite) {
        console.log("⚠️ Operation cancelled");
        process.exit(0);
      }

      // 🚨 SAFE DELETE
      if (projectPath !== process.cwd()) {
        fs.rmSync(projectPath, { recursive: true, force: true });
        console.log("🧹 Existing folder removed\n");
      } else {
        console.log("❌ Refusing to delete current directory.");
        process.exit(1);
      }
    }

    try {
      await createProject(initialAnswers.projectName, {
        typescript: initialAnswers.typescript,
        install: initialAnswers.install,
        port: options.port,
      });
    } catch (err) {
      console.log("❌ Unexpected error:", err.message);
      process.exit(1);
    }
  });

program.parse(process.argv);