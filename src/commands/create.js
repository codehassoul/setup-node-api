async function createProject(projectName, options = {}) {
  const { execSync } = require("child_process");
  const chalk = require("chalk");
  const fs = require("fs");
  const path = require("path");

  const reservedNames = ["node_modules", ".git", ".", ".."];

  if (reservedNames.includes(projectName)) {
    console.log(chalk.red(`❌ Invalid project name: "${projectName}" is reserved`));
    process.exit(1);
  }

  if (!isValidProjectName(projectName)) {
    console.log(chalk.red("❌ Invalid project name"));
    console.log(
      chalk.yellow(
        "Use only letters, numbers, hyphens (-), and underscores (_)"
      )
    );
    process.exit(1);
  }

  const projectPath = path.join(process.cwd(), projectName);

  console.log(chalk.cyan(`\n🚀 Creating Node API: ${projectName}\n`));

  createProjectFolder(projectPath);

  const templateName = options.typescript ? "node-api-ts" : "node-api";
  const templatePath = path.join(__dirname, `../../templates/${templateName}`);

  // ✅ Template existence check
  if (!fs.existsSync(templatePath)) {
    console.log(chalk.red("❌ Template not found"));
    process.exit(1);
  }

  copyProjectTemplate(templatePath, projectPath);

  if (options.port) {
    const envPath = path.join(projectPath, ".env");
    fs.writeFileSync(envPath, `PORT=${options.port}\n`);
    console.log(chalk.green(`⚙️ Set port to ${options.port}`));
  }

  if (options.install !== false) {
    await installDependencies(projectPath);
  } else {
    console.log(chalk.yellow("⚠️ Skipped dependency installation"));
  }

  showNextSteps(projectName, options);

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
      console.log("⚠️ Project may be incomplete. Please check manually.");
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
      // 🔥 stop spinner before logs
      spinner.stop();

      execSync("npm install", {
        cwd: projectPath,
        stdio: "inherit",
      });

      spinner.succeed("Dependencies installed");
    } catch (error) {
      spinner.fail("Failed to install dependencies");
      console.log(
        "⚠️ Project created but dependencies failed. Run npm install manually."
      );
      process.exit(1);
    }
  }

  function showNextSteps(projectName, options = {}) {
    console.log(chalk.green("\n✨ Project ready!\n"));

    console.log(chalk.cyan("📁 Location:"));
    console.log(`   ${path.join(process.cwd(), projectName)}\n`);

    console.log(chalk.magenta("👉 Next steps:"));
    console.log(`   cd ${projectName}`);

    if (options.install === false) {
      console.log("   npm install");
    }

    console.log(options.typescript ? "   npm run dev" : "   npm start");
    console.log("");
  }

  function isValidProjectName(name) {
    return /^[a-zA-Z0-9-_]+$/.test(name);
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