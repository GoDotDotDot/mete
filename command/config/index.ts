#!/usr/bin/env node

import { Command } from 'commander';
import setCMD from './set/index';
import getCMD from './get/index';
import removeCMD from './remove/index';

const program = new Command('config');
program.addCommand(setCMD);
program.addCommand(getCMD);
program.addCommand(removeCMD);

program.usage('<command> [options]');

program.on('--help', () => {
  console.log('');
  console.log('Example call:');
  console.log('  $ mete config get registry');
});

program.parse(process.argv);

export default program;
