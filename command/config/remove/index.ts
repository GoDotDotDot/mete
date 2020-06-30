#!/usr/bin/env node

import { Command } from 'commander';
import plugin from '@/plugin';
import { removeGlobalConfig } from '@/utils/config';
import { error } from '@/utils/log';

const program = new Command('remove');

program
  .description('remove config')
  .usage('<config name>')

  .on('--help', () => {
    console.log('');
    console.log('Example call:');
    console.log('  $ mete config remove registry');
  })

  .action((cmd, arg) => {
    plugin();

    if (!arg) {
      error('please use mete config remove --help');
      process.exit(-1);
    }

    const key = arg[0];

    removeGlobalConfig(key);

    process.exit(0);
  });

export default program;
