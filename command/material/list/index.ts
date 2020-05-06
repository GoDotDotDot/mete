#!/usr/bin/env node

import qs from 'querystring';
import got from 'got';
import chalk from 'chalk';
import Table from 'cli-table';
import { Command } from 'commander';
import { getGlobalConfig } from '@/utils/config';

const program = new Command();

interface List {
  head: [];
  data: [];
}

async function getMaterialListByType(
  type: string,
  registry?: string,
  name?: string,
): Promise<List> {
  const realRegistry = registry || getGlobalConfig('registry');
  if (!realRegistry) {
    console.log(
      chalk.redBright(
        `Please specify registry with --registry or set registry in global meterc. see ${chalk.cyan(
          'mete config set --help',
        )}.`,
      ),
    );
    process.exit(-1);
  }

  const url = new URL(realRegistry);

  url.pathname = `/-/list/${type}`;
  url.search = qs.stringify({
    name,
  });

  const { code, data, msg } = await got(url.href).json();

  if (code) {
    console.log(chalk.redBright(msg));
    process.exit(-1);
  }

  return data;
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

program
  .command('component [name]')
  .option('--registry <registry>', 'Specify the material registry.')
  .action(async (_, cmd) => {
    const data = await getMaterialListByType(
      'component',
      cmd.registry,
      cmd.name,
    );

    displayMaterial(data);
  });

program.parse(process.argv);
