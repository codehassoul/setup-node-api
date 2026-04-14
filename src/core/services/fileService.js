const fs = require("fs");

function isInteractive() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

async function handleExistingDir(projectPath, dependencies = {}) {
  const existsSync = dependencies.existsSync ?? fs.existsSync;
  const removeDirSync = dependencies.removeDirSync ?? fs.rmSync;
  const promptOverwrite =
    dependencies.promptOverwrite ??
    (async () => {
      const { default: inquirer } = await import("inquirer");
      return inquirer.prompt([
        {
          type: "confirm",
          name: "overwrite",
          message: "Folder already exists. Overwrite?",
          default: false,
        },
      ]);
    });
  const isInteractiveFn = dependencies.isInteractive ?? isInteractive;

  if (!existsSync(projectPath)) return;

  if (!isInteractiveFn()) {
    throw new Error(
      "Target folder already exists. Remove it first or rerun this command in an interactive terminal."
    );
  }

  let answer;

  try {
    answer = await promptOverwrite();
  } catch (err) {
    if (err.name === "ExitPromptError") {
      throw new Error("Operation cancelled");
    }
    throw err;
  }

  if (!answer.overwrite) {
    throw new Error("Operation cancelled");
  }

  removeDirSync(projectPath, { recursive: true, force: true });
  console.log("Existing folder removed\n");
}

module.exports = { handleExistingDir };
