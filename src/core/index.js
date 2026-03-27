const createProject = require("./createProject");
const { askProjectDetails } = require("./promptService");

async function createApp(projectName, options = {}) {
  const finalOptions = await askProjectDetails({
    projectName,
    typescript: options.typescript,
    install: options.install,
  });

  await createProject(finalOptions.projectName, {
    typescript: finalOptions.typescript,
    install: finalOptions.install,
    port: options.port,
  });
}

module.exports = { createApp };