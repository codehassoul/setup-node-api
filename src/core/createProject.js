const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const { createProjectFolder } = require("./services/projectService");
const { copyTemplate } = require("./services/templateService");
const { installDependencies } = require("./services/installService");
const { updatePackageMetadata } = require("./services/packageService");

function info(message) {
  console.log(message);
}

function success(message) {
  console.log(chalk.green(message));
}

function warn(message) {
  console.log(chalk.yellow(message));
}

async function createProject(projectName, options = {}) {
  const projectPath = path.join(process.cwd(), projectName);
  const templateName = options.typescript ? "node-api-ts" : "node-api";
  const templateRoot = options.templateRoot ?? path.join(__dirname, "../../templates");
  const templatePath = path.join(templateRoot, templateName);

  info(`\nCreating Node API: ${projectName}\n`);

  if (!fs.existsSync(templatePath)) {
    throw new Error("Template not found");
  }

  createProjectFolder(projectPath);
  success("Project folder created");

  copyTemplate(templatePath, projectPath);
  success("Template copied");
  updatePackageMetadata(projectPath, projectName, {
    cors: options.cors,
    typescript: options.typescript,
  });
  success("Project files customized");

  if (options.port) {
    fs.writeFileSync(
      path.join(projectPath, ".env"),
      `PORT=${options.port}\n`
    );
    success(`Set port to ${options.port}`);
  }

  if (options.install !== false) {
    await installDependencies(projectPath);
  } else {
    warn("Skipped dependency installation");
  }

  success("\nProject ready.\n");
}

module.exports = createProject;
