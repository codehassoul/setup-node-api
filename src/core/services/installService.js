const { execSync } = require("child_process");

async function installDependencies(projectPath) {
  const ora = (await import("ora")).default;

  const spinner = ora({
    text: "Installing dependencies...",
    spinner: "dots",
  }).start();

  try {
    spinner.stop();

    execSync("npm install", {
      cwd: projectPath,
      stdio: "inherit",
    });

    spinner.succeed("Dependencies installed");
  } catch (error) {
    spinner.fail("Failed to install dependencies");
    throw new Error(
      "Dependencies failed. Run npm install manually."
    );
  }
}

module.exports = { installDependencies };