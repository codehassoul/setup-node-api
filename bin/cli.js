#!/usr/bin/env node

const { Command } = require("commander");
const createProject = require("../src/commands/create");
const { askProjectDetails } = require("../src/utils/prompt"); // ✅ FIXED
const fs = require("fs");
const path = require("path");

const program = new Command();

program
  .name("setup-node-api")
  .description("CLI to create a Node.js Express API")
  .version("1.0.0");

program
  .argument("[project-name]", "Name of the project") // ✅ OPTIONAL NOW
  .option("--no-install", "Skip installing dependencies")
  .option("--port <number>", "Set server port")
  .option("--typescript", "Use TypeScript template")
  .action(async (projectName, options) => {
    const args = process.argv;

    const hasTypescriptFlag = args.includes("--typescript");
    const hasNoInstallFlag = args.includes("--no-install");

    // 👉 STEP 1: get project name first
    const initialAnswers = await askProjectDetails({
      projectName,
      typescript: hasTypescriptFlag ? true : undefined,
      install: hasNoInstallFlag ? false : undefined,
    });

    const projectPath = path.join(process.cwd(), initialAnswers.projectName);

    // 👉 STEP 2: overwrite check BEFORE creation
    if (fs.existsSync(projectPath)) {
      const { default: inquirer } = await import("inquirer");
      const { overwrite } = await inquirer.prompt([
        {
          type: "confirm",
          name: "overwrite",
          message: "Folder already exists. Overwrite?",
          default: false,
        },
      ]);

      if (!overwrite) {
        console.log("⚠️ Operation cancelled");
        process.exit(0);
      }

      fs.rmSync(projectPath, { recursive: true, force: true });
      console.log("🧹 Existing folder removed\n");
    }

    // 👉 STEP 3: create project
    await createProject(initialAnswers.projectName, {
      typescript: initialAnswers.typescript,
      install: initialAnswers.install,
      port: options.port,
    });
  });

program.parse(process.argv);
