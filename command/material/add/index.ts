#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import got from 'got';
import qs from 'querystring';
import chalk from 'chalk';
import fs from 'fs-extra';
import hooks from '@/hooks';
import plugin from '@/plugin';
import { downloadTarball, extractTarball, getUrlInfo } from '@/utils/tarball';
import { HOOKS, TEMP_DIR } from '@/common/constant';
import { getCwdConfig, getGlobalConfig } from '@/utils/config';
import { error } from '@/utils/log';
import { MaterialSchema } from '@/inerface';

const program = new Command('add');

function isUrl(str) {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ); // fragment locator
  return !!pattern.test(str);
}

async function getMaterialInfo(
  name: string,
  version = 'latest',
  registry: string,
): Promise<MaterialSchema> {
  const url = new URL(registry);
  url.pathname = '/api/material/info';

  url.search = qs.stringify({
    name,
    version,
  });

  const { code, data, msg } = await got(url.href).json();

  if (code) {
    console.log(chalk.redBright(msg));
    process.exit(-1);
  }

  return data;
}

hooks.register(HOOKS.extractTarball.success, ({ entry, filename }) => {
  fs.removeSync(filename);
  console.log();
  console.log(chalk.green(entry.join('\n')));
});

plugin();

program
  .description('download material')
  .option(
    '-d, --dir <directory>',
    'specify the directory that material will download, default value is current work directory.',
  )
  .option('-n, --file-name <name>', 'specify the material name.')
  .option('--registry <registry>', 'specify the material registry.')
  .option('-r, --rewrite', 'rewrite file same name.', false)
  .usage('<material name> [options]')

  .on('--help', () => {
    console.log('');
    console.log('Example call:');
    console.log('  $ mete material add mete-work-plugin');
  })

  .action(async (cmd, arg) => {
    let url = arg[0];

    // eslint-disable-next-line
    // @ts-ignore
    let pkg: MaterialSchema = {};

    if (!isUrl(url)) {
      const registry =
        cmd.registry || getCwdConfig('registry') || getGlobalConfig('registry');
      if (!registry) {
        error(
          'registry is not found! you can specify registry with --registry option or set registry in global config file.',
        );
        process.exit(-1);
      }

      const [name, version] = url.split(':');

      pkg = await getMaterialInfo(name, version, registry);
      const server = new URL(registry);
      server.pathname = `/api/material/download/${pkg.objectName
        .split('/')
        .slice(-2)
        .join('/')}`;

      url = server.href;
    }

    const directory = path.join(process.cwd(), TEMP_DIR);

    let { filename } = await downloadTarball({
      url,
      directory,
    });

    const extractDirectory = cmd.dir || process.cwd();
    const meteData = getUrlInfo(url);
    let name = cmd.fileName || meteData.name;

    const hooksRes = hooks.emitSync(HOOKS.tarballDownload.success, {
      ...meteData,
      ...pkg,
      filename,
      name,
    });

    if (hooksRes) {
      filename = hooksRes.filename;
      name = hooksRes.name;
    }

    const { entry } = await extractTarball({
      filename,
      directory: extractDirectory,
      name,
      meteData: {
        ...meteData,
        ...pkg,
      },
      rewrite: cmd.rewrite,
    });

    hooks.emitSync(HOOKS.extractTarball.success, {
      filename,
      directory: extractDirectory,
      name,
      entry,
    });

    process.exit(0);
  });

export default program;
