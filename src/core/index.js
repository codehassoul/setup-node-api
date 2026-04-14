const createProject = require("./createProject");
const { askProjectDetails } = require("./promptService");
const {
  validateProjectName,
} = require("./validators/projectValidator");
const { handleExistingDir } = require("./services/fileService");
const path = require("path");

async function createApp(projectName, options = {}) {
  if (projectName !== undefined) {
    validateProjectName(projectName);
  }

  const finalOptions = await askProjectDetails({
    projectName,
    yes: options.yes,
    cors: options.cors,
    typescript: options.typescript,
    install: options.install,
  });

  validateProjectName(finalOptions.projectName);
  const projectPath = path.join(process.cwd(), finalOptions.projectName);

  await handleExistingDir(projectPath);

  await createProject(finalOptions.projectName, {
    cors: finalOptions.cors,
    typescript: finalOptions.typescript,
    install: finalOptions.install,
    port: options.port,
  });
}

module.exports = { createApp };
