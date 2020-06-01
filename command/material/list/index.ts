#!/usr/bin/env node

import qs from 'querystring';
import got from 'got';
import chalk from 'chalk';
import Table from 'cli-table';
import { Command } from 'commander';
import plugin from '@/plugin';
import { getGlobalConfig } from '@/utils/config';
import { CONFIG_NAME } from '@/common/constant';
import { error } from '@/utils/log';

const program = new Command('list');

interface List {
  head: string[];
  data: string[];
}

async function getMaterialListByType(
  type: string,
  registry?: string,
  name?: string,
): Promise<List> {
  const realRegistry = registry || getGlobalConfig('registry');
  if (!realRegistry) {
    error(
      `Please specify registry with --registry or set registry in global ${CONFIG_NAME} see ${chalk.cyan(
        'mete config set --help',
      )}.`,
    ),
      process.exit(-1);
  }

  const url = new URL(realRegistry);

  url.pathname = '/api/material/info';
  url.search = qs.stringify({
    name,
    type,
  });

  const { code, data, msg } = await got(url.href).json();

  if (code) {
    console.log(chalk.redBright(msg));
    process.exit(-1);
  }

  const head = ['name', 'type', 'version', 'tags', 'createdAt'];
  const list = data.map(item => head.map(col => item[col] || '-'));

  return { head, data: list };
}

function displayMaterial(list: List) {
  const { head, data } = list;

  const tableHead = head.map(item => chalk.cyan(item));

  const table = new Table({
    head: tableHead,
  });

  data.forEach(item => {
    table.push(item);
  });

  console.log(chalk.green(table.toString()));
}

plugin();

program
  .description('list material')
  .option('-t, --type <type>', 'Specify the type of material.')
  .requiredOption(
    '-n, --materail-name <materail-name>',
    'Specify the name of material. You can specify the version of materail with ":", ex: mete:1.0.01, the default version is latest.',
  )
  .option(
    '-T, --tags <tags>',
    'Specify the tags of material, muilt tags split with comma',
  )
  .option('--registry <registry>', 'Specify the material registry.')
  .action(async cmd => {
    const data = await getMaterialListByType(
      cmd.type,
      cmd.registry,
      cmd.materailName,
    );

    displayMaterial(data);
  });

export default program;
