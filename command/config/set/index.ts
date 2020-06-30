#!/usr/bin/env node

import { Command } from 'commander';
import plugin from '@/plugin';
import { getGlobalConfig, setGlobalConfig } from '@/utils/config';
import { error } from '@/utils/log';

const program = new Command('set');

program
  .description('set config')
  .usage('<config name> <config value>')

  .on('--help', () => {
    console.log('');
    console.log('Example call:');
    console.log('  $ mete config set registry http://127.0.0.1:7001');
  })

  .action((cmd, arg) => {
    plugin();

    if (!arg) {
      error('please use mete config set --help');
      process.exit(-1);
    }

    const key = arg[0];
    const value = arg[1];

    setGlobalConfig(key, value);

    console.log(`${key}=${getGlobalConfig(key)}`);

    process.exit(0);
  });

export default program;
