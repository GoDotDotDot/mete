#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import packageConfig from '@/package.json';

const program = new Command('mete');

async function main() {
  program
    .command('material <command>', 'material command', {
      executableFile: '../command/material/index',
    })
    .command('config <command>', 'config command', {
      executableFile: '../command/config/index',
    })
    .version(packageConfig.version)
    .usage('<command> [options]')
    .on('command:*', function(cmd) {
      program.outputHelp();
      console.log(chalk.red(`Unknown command ${chalk.yellow(cmd.join(' '))}`));
      console.log();
      process.exitCode = 1;
    });

  await program.parseAsync(process.argv);
}

main();
