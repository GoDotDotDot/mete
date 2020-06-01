#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import packageConfig from '@/package.json';
import hooks from '@/hooks';

const program = new Command('mete');

hooks.register('aaaa', () => {
  console.log('----');
});

async function main() {
  program
    .command('material [action]', 'material action', {
      executableFile: '../command/material/index',
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
