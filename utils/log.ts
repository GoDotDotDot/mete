import chalk from 'chalk';

export function warning(content: string) {
  console.log(chalk.yellowBright('Warning: ' + content));
}

export function error(content: string | Error) {
  console.log(chalk.redBright('Error: ' + content));
}
