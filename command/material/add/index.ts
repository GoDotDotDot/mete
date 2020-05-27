#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import chalk from 'chalk';
import hooks from '@/hooks';
import { downloadTarball, extractTarball, getUrlInfo } from '@/utils/tarball';
import { HOOKS, TEMP_DIR } from '@/common/constant';

const program = new Command('add');

hooks.register(HOOKS.extractTarball.success, ({ entry }) => {
  console.log(HOOKS.extractTarball.success, entry);
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
    const directory = path.join(process.cwd(), TEMP_DIR);

    const { filename } = await downloadTarball({
      url,
      directory,
    });

    hooks.emitSync(HOOKS.tarballDownload.success, { filename });

    const extractDirectory = cmd.dir || process.cwd();
    const meteData = getUrlInfo(url);
    const extractName = cmd.fileName || meteData.name;

    const { entry } = await extractTarball({
      filename,
      directory: extractDirectory,
      name: extractName,
      meteData,
    });

    hooks.emitSync(HOOKS.extractTarball.success, {
      filename,
      directory: extractDirectory,
      name: extractName,
      entry,
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

// program.parse(process.argv);

export default program;
