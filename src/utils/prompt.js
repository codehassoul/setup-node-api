let inquirer;

async function getInquirer() {
  if (!inquirer) {
    inquirer = (await import("inquirer")).default;
  }
  return inquirer;
}

async function askProjectDetails(options = {}) {
  const inquirer = await getInquirer();

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

  const answers = await inquirer.prompt(questions);

  return {
    projectName: options.projectName || answers.projectName,
    typescript: options.typescript ?? answers.typescript,
    install: options.install ?? answers.install,
  };
}

module.exports = { askProjectDetails };
