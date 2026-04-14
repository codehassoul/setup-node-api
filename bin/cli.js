#!/usr/bin/env node

const chalk = require("chalk");
const { Command } = require("commander");
const packageJson = require("../package.json");
const { createApp } = require("../src/core");

const program = new Command();

function exitWithError(message, exitCode = 1) {
  console.log(chalk.red(`Error: ${message}`));
  process.exit(exitCode);
}

function parsePort(portValue) {
  if (portValue === undefined) {
    return undefined;
  }

  const parsedPort = Number.parseInt(portValue, 10);

  if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    throw new Error("Port must be an integer between 1 and 65535.");
  }

  return parsedPort;
}

program
  .name("setup-node-api")
  .description("Scaffold a Node.js + Express API")
  .version(packageJson.version);

program
  .argument("[project-name]", "Name of the project")
  .option("--no-install", "Skip installing dependencies")
  .option("--port <number>", "Set server port")
  .option("--cors", "Enable CORS in the generated API")
  .option("--typescript", "Use TypeScript template")
  .option("-y, --yes", "Use defaults for any missing options")
  .action(async (projectName, options) => {
    let parsedPort;

    try {
      parsedPort = parsePort(options.port);
    } catch (err) {
      exitWithError(err.message);
    }

    try {
      await createApp(projectName, {
        yes: options.yes,
        cors: options.cors,
        typescript: options.typescript,
        install: options.install === false ? false : undefined,
        port: parsedPort,
      });
    } catch (err) {
      exitWithError(err.message);
    }
  });

program.parse(process.argv);
