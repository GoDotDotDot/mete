#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import chalk from 'chalk';
import hooks from '@/hooks';
import { downloadTarball, extractTarball } from '@/utils/tarball';
import { HOOKS } from '@/common/constant';

const program = new Command();

hooks.register(HOOKS.extractTarball.success, ({ args: { filename } }) => {
  console.log(filename);
});

program
  .command('component <url>')
  .description('componnet command')
  .option('-d, --dir <directory>', 'Specify the component directory.')
  .option(
    '-n, --file-name <name>',
    'Specify the component directory name like CustomComponent.',
  )
  .action(async (url, cmd) => {
    const directory = path.join(process.cwd(), '.mete/');

    const { filename } = await downloadTarball({
      url,
      directory,
    });

    hooks.emitSync(HOOKS.tarballDownload.success, { filename });

    const extractDirectory = cmd.dir || process.cwd();
    const extractName = cmd.fileName || path.parse(url).name;

    await extractTarball({
      filename,
      directory: extractDirectory,
      name: extractName,
    });

    hooks.emitSync(HOOKS.extractTarball.success, {
      filename,
      directory: extractDirectory,
      name: extractName,
    });

    process.exit(0);
  });

program
  .command('page <url>')
  .description('componnet command')
  .action(url => {
    console.log(`material add page ${chalk.cyan(url)}`);
  });

program
  .command('block <url>')
  .description('componnet command')
  .action(url => {
    console.log(`material add block ${chalk.cyan(url)}`);
  });

program
  .command('scaffold <url>')
  .description('componnet command')
  .action(url => {
    console.log(`material add scaffold ${chalk.cyan(url)}`);
  });

program.parse(process.argv);
