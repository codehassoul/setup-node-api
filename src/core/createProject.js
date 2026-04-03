const fs = require("fs");
const path = require("path");

const { createProjectFolder } = require("./services/projectService");
const { copyTemplate } = require("./services/templateService");
const { installDependencies } = require("./services/installService");
const logger = require("./logger");

async function createProject(projectName, options = {}) {
  const projectPath = path.join(process.cwd(), projectName);

  logger.info(`\nCreating Node API: ${projectName}\n`);

  createProjectFolder(projectPath);

  const templateName = options.typescript ? "node-api-ts" : "node-api";
  const templatePath = path.join(__dirname, "../../templates", templateName);

  if (!fs.existsSync(templatePath)) {
    throw new Error("Template not found");
  }

  copyTemplate(templatePath, projectPath);
  logger.success("Template copied");

  if (options.port) {
    fs.writeFileSync(
      path.join(projectPath, ".env"),
      `PORT=${options.port}\n`
    );
    logger.success(`Set port to ${options.port}`);
  }

  if (options.install !== false) {
    await installDependencies(projectPath);
  } else {
    logger.warn("Skipped dependency installation");
  }

  logger.success("\nProject ready.\n");
}

module.exports = createProject;
