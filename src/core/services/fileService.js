const fs = require("fs");

async function handleExistingDir(projectPath) {
  if (!fs.existsSync(projectPath)) return;

  const { default: inquirer } = await import("inquirer");

  let answer;

  try {
    answer = await inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: "Folder already exists. Overwrite?",
        default: false,
      },
    ]);
  } catch (err) {
    if (err.name === "ExitPromptError") {
      throw new Error("Operation cancelled");
    }
    throw err;
  }

  if (!answer.overwrite) {
    throw new Error("Operation cancelled");
  }

  fs.rmSync(projectPath, { recursive: true, force: true });
  console.log("🧹 Existing folder removed\n");
}

module.exports = { handleExistingDir };