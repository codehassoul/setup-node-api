const fs = require("fs");

function isInteractive() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

async function handleExistingDir(projectPath) {
  if (!fs.existsSync(projectPath)) return;

  if (!isInteractive()) {
    throw new Error(
      "Target folder already exists. Remove it first or rerun this command in an interactive terminal."
    );
  }

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
  console.log("Existing folder removed\n");
}

module.exports = { handleExistingDir };
