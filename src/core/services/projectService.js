const fs = require("fs");
const chalk = require("chalk");

function createProjectFolder(projectPath) {
  if (fs.existsSync(projectPath)) {
    throw new Error("Folder already exists");
  }

  fs.mkdirSync(projectPath, { recursive: true });
  console.log(chalk.green("📁 Project created"));
}

module.exports = { createProjectFolder };