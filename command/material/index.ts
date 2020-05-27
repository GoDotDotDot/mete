#!/usr/bin/env node

import { Command } from 'commander';
import addCMD from './add';
import listCMD from './list';
import publishCMD from './publish';

const program = new Command('material');

program.addCommand(addCMD);
program.addCommand(listCMD);
program.addCommand(publishCMD);

program.parse(process.argv);

export default program;
