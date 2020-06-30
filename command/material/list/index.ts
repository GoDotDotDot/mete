#!/usr/bin/env node

import qs from 'querystring';
import got from 'got';
import chalk from 'chalk';
import TtyTable from 'tty-table';
import { Command } from 'commander';
import dayjs from 'dayjs';
import plugin from '@/plugin';
import { getGlobalConfig } from '@/utils/config';
import { CONFIG_NAME } from '@/common/constant';
import { error } from '@/utils/log';
import { deleteNullOrUndefinedField } from '@/utils/utils';

const program = new Command('list');

interface List {
  head: string[];
  data: string[];
}

async function getMaterialListByType(
  type: string,
  name?: string,
  tags?: string[],
  registry?: string,
): Promise<List> {
  const realRegistry = registry || getGlobalConfig('registry');
  if (!realRegistry) {
    error(
      `Please specify registry with --registry or set registry in global ${CONFIG_NAME}, see:
  ${chalk.cyan('mete config set --help')}`,
    ),
      process.exit(-1);
  }

  const url = new URL(realRegistry);

  url.pathname = '/api/material/info';
  url.search = qs.stringify(
    deleteNullOrUndefinedField({
      name,
      type,
      tags,
    }),
  );

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

  const tableHead = head.map(item => {
    let value = item;

    if (item === 'createdAt') {
      value = 'publish time';
    }

    return {
      align: 'left',
      value: value.toUpperCase(),
      headerAlign: 'left',
      headerColor: 'green',
      formatter: v => {
        if (item === 'createdAt') {
          return dayjs(v).format('YYYY-MM-DD HH:mm:ss');
        }

        if (item === 'tags') {
          return v.join(',');
        }

        return v;
      },
    };
  });

  // eslint-disable-next-line
  // @ts-ignore
  const out = TtyTable(tableHead, data, {
    borderStyle: 'none',
    compact: true,
    align: 'left',
    color: 'white',
    marginTop: 0,
    marginLeft: 0,
  }).render();

  console.log(chalk.green(out));
}

plugin();

program
  .description('list material')
  .option('-t, --type <type>', 'specify the type of material.')
  .option(
    '-n, --materail-name <materail-name>',
    'specify the name of material. You can specify the version of materail with ":", ex: mete:1.0.1, the default version is latest.',
  )
  .option(
    '-T, --tags <tags>',
    'specify the tags of material, muilt tags split with comma',
  )
  .option('--registry <registry>', 'specify the material registry.')
  .usage('[options]')

  .on('--help', () => {
    console.log('');
    console.log('Example call:');
    console.log('  $ mete material list -t plugin');
  })
  .action(async cmd => {
    const data = await getMaterialListByType(
      cmd.type,
      cmd.materailName,
      cmd.tags,
      cmd.registry,
    );

    displayMaterial(data);
  });

export default program;
