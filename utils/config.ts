import os from 'os';
import { readFileSync } from 'fs-extra';
import { join } from 'path';
import chalk from 'chalk';

export function getGlobalConfig(key?: string) {
  const cfgPath = join(os.homedir(), '.meterc');
  try {
    const cfgContent = readFileSync(cfgPath, 'utf-8');
    const config = JSON.parse(cfgContent || '{}');
    return key ? config[key] : config;
  } catch (err) {
    console.log(
      chalk.redBright(`Cannot find global config file in ${cfgPath}.`),
    );
    process.exit(-1);
  }
}
