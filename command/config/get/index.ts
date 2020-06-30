#!/usr/bin/env node

import { Command } from 'commander';
import plugin from '@/plugin';
import { getGlobalConfig } from '@/utils/config';
import { error } from '@/utils/log';

const program = new Command('get');

program
  .description('get config')
  .usage('<config name>')

  .on('--help', () => {
    console.log('');
    console.log('Example call:');
    console.log('  $ mete config get registry');
  })

  .action((cmd, arg) => {
    plugin();

    if (!arg) {
      error('please use mete config get --help');
      process.exit(-1);
    }

    const key = arg[0];

    let out = '';
    if (key) {
      out = `${key}=${getGlobalConfig(key) || ''}`;
    } else {
      out = getGlobalConfig(key);
    }

    console.log(out);

    process.exit(0);
  });

export default program;
