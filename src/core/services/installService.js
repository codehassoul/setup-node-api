const { execSync } = require("child_process");
const chalk = require("chalk");

async function installDependencies(projectPath) {
  try {
    console.log("Installing dependencies with npm...\n");
    execSync("npm install", {
      cwd: projectPath,
      stdio: "inherit",
    });
    console.log(chalk.green("Dependencies installed"));
  } catch {
    throw new Error("Dependency installation failed. Run npm install manually.");
  }
}

module.exports = { installDependencies };
