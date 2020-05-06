#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .command('add <type>', 'Specify material type like component', {
    executableFile: './add/index',
  })
  .command('list [type]', 'List material', {
    executableFile: './list/index',
  })
  .parse(process.argv);

export default program;
