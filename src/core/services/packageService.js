const fs = require("fs");
const path = require("path");

const APP_TOKENS = {
  "{{CORS_REQUIRE}}": (options) =>
    options.cors ? 'const cors = require("cors");\n' : "",
  "{{CORS_IMPORT}}": (options) =>
    options.cors ? 'import cors from "cors";\n' : "",
  "{{CORS_USE}}": (options) => (options.cors ? "app.use(cors());\n" : ""),
  "{{README_CORS_NOTE}}": (options) =>
    options.cors ? "- CORS is enabled out of the box\n" : "",
};

function replaceTemplateTokens(filePath, options) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let contents = fs.readFileSync(filePath, "utf8");

  for (const [token, buildValue] of Object.entries(APP_TOKENS)) {
    contents = contents.replaceAll(token, buildValue(options));
  }

  fs.writeFileSync(filePath, contents);
}

function updatePackageMetadata(projectPath, projectName, options = {}) {
  const packageJsonPath = path.join(projectPath, "package.json");
  const readmePath = path.join(projectPath, "README.md");
  const appPath = path.join(
    projectPath,
    "src",
    options.typescript ? "app.ts" : "app.js"
  );

  if (!fs.existsSync(packageJsonPath)) {
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  packageJson.name = projectName;

  if (options.cors) {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      cors: "^2.8.5",
    };

    if (options.typescript) {
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        "@types/cors": "^2.8.17",
      };
    }
  }

  fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

  if (fs.existsSync(readmePath)) {
    const readme = fs.readFileSync(readmePath, "utf8");
    fs.writeFileSync(readmePath, readme.replace(/{{PROJECT_NAME}}/g, projectName));
  }

  replaceTemplateTokens(readmePath, options);
  replaceTemplateTokens(appPath, options);
}

module.exports = { updatePackageMetadata };
