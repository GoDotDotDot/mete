#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import plugin from '@/plugin';
import packageConfig from '@/package.json';

// TODO: 这个地方还可以增加自己的命令
plugin();

const program = new Command('mete');

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
  })
  .parse(process.argv);
