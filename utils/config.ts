import os from 'os';
import { join } from 'path';
import { CONFIG_NAME } from '@/common/constant';
import { Config } from '@/inerface';
import { warning } from './log';

export function getConfig<K extends string & keyof Config>(
  dir: string,
  key: K,
): Config[K];
export function getConfig(dir: string): Config;
export function getConfig(...args) {
  const [dir, key] = args;
  if (!dir) {
    throw Error('Please specify dir in first params.');
  }

  try {
    // eslint-disable-next-line
    let config = require(dir);
    if (typeof config === 'function') {
      config = config();
    }

    config = config.__esModule ? config.default : config;

    return key ? config[key] : config;
  } catch (err) {
    warning(`Warning: Cannot find global config file in ${dir}.`);
  }
}

export function getGlobalConfig(): Config;
export function getGlobalConfig<K extends string & keyof Config>(
  key: K,
): Config[K];
export function getGlobalConfig(...args): Config {
  const cfgPath = join(os.homedir(), CONFIG_NAME);
  const key = args[0];
  return getConfig(cfgPath, key);
}

export function getCwdConfig(): Config;
export function getCwdConfig<K extends string & keyof Config>(
  key: K,
): Config[K];
export function getCwdConfig(...args): Config {
  const cfgPath = join(process.cwd(), CONFIG_NAME);
  const key = args[0];
  return getConfig(cfgPath, key);
}
