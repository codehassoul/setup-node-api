async function createProject(projectName, options = {}) {
  const { execSync } = require("child_process");
  const chalk = require("chalk");
  const fs = require("fs");
  const path = require("path");

  const reservedNames = ["node_modules", ".git", ".", ".."];

  // --- VALIDATION ---

  if (reservedNames.includes(projectName)) {
    console.log(chalk.red("❌ Invalid project name"));
    console.log(
      chalk.yellow("This name is reserved. Please choose another name."),
    );
    process.exit(1);
  }

  if (!isValidProjectName(projectName)) {
    console.log(chalk.red("❌ Invalid project name"));
    console.log(
      chalk.yellow(
        "Use only letters, numbers, hyphens (-), and underscores (_)",
      ),
    );
    process.exit(1);
  }

  const projectPath = path.join(process.cwd(), projectName);

  console.log(chalk.cyan(`\n🚀 Creating Node API: ${projectName}\n`));

  // --- MAIN FLOW ---

  createProjectFolder(projectPath);

  const templateName = options.typescript ? "node-api-ts" : "node-api";

  const templatePath = path.join(__dirname, `../../templates/${templateName}`);

  copyProjectTemplate(templatePath, projectPath);

  if (options.port) {
    const envPath = path.join(projectPath, ".env");
    const envContent = `PORT=${options.port}\n`;

    fs.writeFileSync(envPath, envContent);
    console.log(chalk.green(`⚙️ Set port to ${options.port}`));
  }

  if (options.install !== false) {
    await installDependencies(projectPath);
  } else {
    console.log(chalk.yellow("⚠️ Skipped dependency installation"));
  }

  showNextSteps(projectName, options);

  // --- FUNCTIONS ---

  function createProjectFolder(projectPath) {
    if (fs.existsSync(projectPath)) {
      console.log(chalk.red("❌ Folder already exists"));
      process.exit(1);
    }

    fs.mkdirSync(projectPath, { recursive: true });
    console.log(chalk.green("📁 Project created"));
  }

  function copyProjectTemplate(templatePath, projectPath) {
    try {
      copyTemplate(templatePath, projectPath);
      console.log(chalk.green("📦 Template copied"));
    } catch (error) {
      console.log(chalk.red("❌ Failed to copy template"));
      fs.rmSync(projectPath, { recursive: true, force: true });
      process.exit(1);
    }
  }

  async function installDependencies(projectPath) {
    const ora = (await import("ora")).default;

    const spinner = ora({
      text: "Installing dependencies...",
      spinner: "dots",
    }).start();

    try {
      execSync("npm install", {
        cwd: projectPath,
        stdio: "ignore",
      });

      await new Promise((r) => setTimeout(r, 300));

      spinner.succeed("Dependencies installed");
    } catch (error) {
      spinner.fail("Failed to install dependencies");
      fs.rmSync(projectPath, { recursive: true, force: true });
      process.exit(1);
    }
  }

  function showNextSteps(projectName, options = {}) {
    console.log(chalk.magenta("👉 Next steps:"));
    console.log(`   cd ${projectName}`);

    if (options.install === false) {
      console.log("   npm install");
    }

    if (options.typescript) {
      console.log("   npm run dev");
    } else {
      console.log("   npm start");
    }

    console.log("");
  }

  function isValidProjectName(name) {
    const validNameRegex = /^[a-zA-Z0-9-_]+$/;
    return validNameRegex.test(name);
  }

  function copyTemplate(src, dest) {
    const files = fs.readdirSync(src);

    files.forEach((file) => {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);

      const stats = fs.statSync(srcPath);

      if (stats.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyTemplate(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }
}

module.exports = createProject;
