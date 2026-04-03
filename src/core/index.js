const createProject = require("./createProject");
const { askProjectDetails } = require("./promptService");
const {
  validateProjectName,
} = require("./validators/projectValidator");
const { handleExistingDir } = require("./services/fileService");
const path = require("path");

async function createApp(projectName, options = {}) {
  const finalOptions = await askProjectDetails({
    projectName,
    typescript: options.typescript,
    install: options.install,
  });

  validateProjectName(finalOptions.projectName);
  await handleExistingDir(path.join(process.cwd(), finalOptions.projectName));

  await createProject(finalOptions.projectName, {
    typescript: finalOptions.typescript,
    install: finalOptions.install,
    port: options.port,
  });
}

module.exports = { createApp };
