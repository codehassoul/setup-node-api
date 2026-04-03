const fs = require("fs");

function createProjectFolder(projectPath) {
  if (fs.existsSync(projectPath)) {
    throw new Error("Folder already exists");
  }

  fs.mkdirSync(projectPath, { recursive: true });
}

module.exports = { createProjectFolder };
