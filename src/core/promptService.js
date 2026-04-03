let inquirer;

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
  const questions = [];

  if (!options.projectName) {
    questions.push({
      type: "input",
      name: "projectName",
      message: "Enter project name:",
      validate: (input) => (input ? true : "Project name cannot be empty"),
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

  if (!questions.length) {
    return {
      projectName: options.projectName,
      typescript: options.typescript,
      install: options.install,
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
    };
  }

  const inquirer = await getInquirer();
  const answers = await inquirer.prompt(questions);

  return {
    projectName: options.projectName || answers.projectName,
    typescript: options.typescript ?? answers.typescript,
    install: options.install ?? answers.install,
  };
}

module.exports = { askProjectDetails };
