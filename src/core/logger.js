const chalk = require("chalk");

function info(msg) {
  console.log(msg);
}

function success(msg) {
  console.log(chalk.green(msg));
}

function error(msg) {
  console.log(chalk.red(msg));
}

function warn(msg) {
  console.log(chalk.yellow(msg));
}

module.exports = {
  info,
  success,
  error,
  warn,
};
