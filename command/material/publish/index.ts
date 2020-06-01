#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs-extra';
import got from 'got';
import chalk from 'chalk';
import FormData from 'form-data';
import ora from 'ora';
import prettyBytes from 'pretty-bytes';

import * as logger from '@/utils/log';
import { getCwdConfig, getGlobalConfig } from '@/utils/config';
import { ResponseData } from '@/inerface';
import { packTar } from '@/utils/tarball';
import hooks from '@/hooks';
import { HOOKS } from '@/common/constant';

hooks.register(HOOKS.packTarball.success, dir => {
  fs.remove(dir as string);
});

async function upload(registry: string, options: any) {
  const { version = '1.0.0', type = 'component', name } = options;
  const objectName = `${name}-${version}.tgz`;
  const fileName = await packTar(process.cwd(), objectName);
  const defaultUrl = '/api/material/upload';

  const url = new URL(registry);
  url.pathname = defaultUrl;

  const form = new FormData();

  form.append('version', version);
  form.append('type', type);
  form.append('name', name);

  form.append('file', fs.createReadStream(fileName));

  const spinner = ora(chalk.green('Uploading...')).start();

  const { body } = await got
    .post(url.href, {
      method: 'post',
      body: form,
      responseType: 'json',
      retry: { limit: 2, methods: ['POST'] },
    })
    .on('uploadProgress', ({ percent = 0, total = 0, transferred = 0 }) => {
      const p = chalk.cyan(`${(percent * 100).toFixed(2)}%`);
      const t = chalk.cyan(prettyBytes(total));
      const trans = chalk.cyan(prettyBytes(transferred));
      spinner.text = chalk.green(
        `Uploading Info: total: ${t}, transferred: ${trans}, percent: ${p}`,
      );
    });

  const { code, msg, data } = body as ResponseData;
  if (code) {
    spinner.fail('Upload failed! ');
    logger.error(msg);
    process.exit(0);
  }

  spinner.succeed('Upload successed!');
  console.log(data.etag);
}

const program = new Command('publish');

program
  .description('pubish material command')
  .option('-n, --name <name>', 'material name.')
  .option(
    '-t, --type <type>',
    'materail type, optional type are component, block, scaffold, page.',
  )
  .option('--registry <registry>', 'specify the material registry.')
  .action(async cmd => {
    const config = getCwdConfig();
    const { name, type, version } = config;
    const registry = cmd.registry || getGlobalConfig('registry');
    await upload(registry, { name, version, type });
    process.exit(0);
  });

export default program;
