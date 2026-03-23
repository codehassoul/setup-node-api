#!/usr/bin/env node

const { Command } = require("commander");
const createProject = require("../src/commands/create");

const program = new Command();

program
  .name("setup-node-api")
  .description("CLI to create a Node.js Express API")
  .version("1.0.0");

program
  .argument("<project-name>", "Name of the project")
  .option("--no-install", "Skip installing dependencies")
  .option("--port <number>", "Set server port")
  .option("--typescript", "Use TypeScript template")
  .action(async (projectName, options) => {
    await createProject(projectName, options);
  });

program.parse(process.argv);
