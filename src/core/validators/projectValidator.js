function validateProjectName(name) {
  const reserved = ["node_modules", ".git", ".", ".."];

  if (!name || name.trim() === "") {
    throw new Error("Project name cannot be empty");
  }

  if (reserved.includes(name)) {
    throw new Error(`Invalid project name: "${name}" is reserved`);
  }

  if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
    throw new Error(
      "Use only letters, numbers, hyphens (-), and underscores (_)"
    );
  }
}

module.exports = { validateProjectName };