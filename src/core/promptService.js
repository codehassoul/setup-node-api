let inquirer;
const { validateProjectName } = require("./validators/projectValidator");

function isInteractive() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

async function getInquirer() {
  if (!inquirer) {
    inquirer = (await import("inquirer")).default;
  }
  return inquirer;
}

async function askProjectDetails(options = {}) {
  if (options.yes) {
    if (!options.projectName) {
      throw new Error(
        "Project name is required when using --yes. Pass it as an argument."
      );
    }

    return {
      projectName: options.projectName,
      typescript: options.typescript ?? false,
      install: options.install ?? true,
      cors: options.cors ?? false,
    };
  }

  const questions = [];

  if (!options.projectName) {
    questions.push({
      type: "input",
      name: "projectName",
      message: "Enter project name:",
      validate: (input) => {
        try {
          validateProjectName(input);
          return true;
        } catch (error) {
          return error.message;
        }
      },
    });
  }

  if (options.typescript === undefined) {
    questions.push({
      type: "confirm",
      name: "typescript",
      message: "Use TypeScript?",
      default: false,
    });
  }

  if (options.install === undefined) {
    questions.push({
      type: "confirm",
      name: "install",
      message: "Install dependencies?",
      default: true,
    });
  }

  if (options.cors === undefined) {
    questions.push({
      type: "confirm",
      name: "cors",
      message: "Enable CORS?",
      default: false,
    });
  }

  if (!questions.length) {
    return {
      projectName: options.projectName,
      typescript: options.typescript,
      install: options.install,
      cors: options.cors,
    };
  }

  if (!isInteractive()) {
    if (!options.projectName) {
      throw new Error(
        "Project name is required in non-interactive mode. Pass it as an argument."
      );
    }

    return {
      projectName: options.projectName,
      typescript: options.typescript ?? false,
      install: options.install ?? true,
      cors: options.cors ?? false,
    };
  }

  const inquirer = await getInquirer();
  let answers;

  try {
    answers = await inquirer.prompt(questions);
  } catch (error) {
    if (error.name === "ExitPromptError") {
      throw new Error("Operation cancelled");
    }
    throw error;
  }

  return {
    projectName: options.projectName || answers.projectName,
    typescript: options.typescript ?? answers.typescript,
    install: options.install ?? answers.install,
    cors: options.cors ?? answers.cors,
  };
}

module.exports = { askProjectDetails };
