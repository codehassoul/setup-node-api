const { spawnSync } = require("child_process");
const chalk = require("chalk");

function getInstallCommand(platform = process.platform) {
  if (platform === "win32") {
    return {
      command: "cmd.exe",
      args: ["/d", "/s", "/c", "npm install"],
    };
  }

  return {
    command: "npm",
    args: ["install"],
  };
}

async function installDependencies(projectPath, dependencies = {}) {
  const runCommand = dependencies.runCommand ?? spawnSync;
  const installCommand = dependencies.installCommand ?? getInstallCommand();

  console.log("Installing dependencies with npm...\n");

  const result = runCommand(installCommand.command, installCommand.args, {
    cwd: projectPath,
    stdio: "inherit",
    shell: false,
  });

  if (result.error || result.status !== 0) {
    const detail = result.error
      ? result.error.message
      : `npm exited with code ${result.status}`;
    throw new Error(
      `Dependency installation failed (${detail}). Run npm install manually.`
    );
  }

  console.log(chalk.green("Dependencies installed"));
}

module.exports = { installDependencies, getInstallCommand };
