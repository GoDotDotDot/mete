import os from 'os';
import fs from 'fs-extra';
import { join } from 'path';
import { CONFIG_NAME, GLOBAL_CONFIG_NAME } from '@/common/constant';
import { Config } from '@/inerface';

function get(from: object, selectors) {
  return selectors.map(s =>
    s
      .replace(/\[([^\[\]]*)\]/g, '.$1.') // eslint-disable-line
      .split('.')
      .filter(t => t !== '')
      .reduce((prev, cur) => prev && prev[cur], from),
  );
}

function mapToTxt(map: Map<string, any>) {
  let str = '';
  map.forEach((value, key) => {
    str += `${key}=${value}${os.EOL}`;
  });
  return str;
}

function txtToMap(cfgPath: string) {
  const content = fs.readFileSync(cfgPath, 'utf8');

  const map = new Map();
  content.split(os.EOL).forEach(line => {
    if (!line) return;

    const [key, value] = line.split('=');
    map.set(key, value);
  });
  return map;
}

export function getConfig(dir: string, ...key: string[]): any;
export function getConfig(dir: string): Config;
export function getConfig(...args) {
  const [dir, ...key] = args;
  if (!dir) {
    throw Error('Please specify directory in first params.');
  }

  try {
    // eslint-disable-next-line
    let config = require(dir);
    if (typeof config === 'function') {
      config = config();
    }

    config = config.__esModule ? config.default : config;
    return key.length ? get(config, key) : config;
  } catch (err) {
    // nothing
  }
}

export function getGlobalConfig(
  key?: string,
): Map<keyof Config, Config[keyof Config]> | Config[keyof Config] {
  const cfgPath = join(os.homedir(), GLOBAL_CONFIG_NAME);
  if (!fs.existsSync(cfgPath)) return;

  const map = txtToMap(cfgPath);
  if (key) return map.get(key);
  return map;
}

export function setGlobalConfig(key: string, value: any) {
  const cfgPath = join(os.homedir(), GLOBAL_CONFIG_NAME);

  let map = new Map();

  if (fs.existsSync(cfgPath)) {
    map = txtToMap(cfgPath);
  }

  map.set(key, value);

  const content = mapToTxt(map);

  fs.writeFileSync(cfgPath, content, 'utf8');
}

export function removeGlobalConfig(key: string) {
  const cfgPath = join(os.homedir(), GLOBAL_CONFIG_NAME);

  if (!fs.existsSync(cfgPath)) {
    return;
  }

  const map = txtToMap(cfgPath);
  map.delete(key);

  const content = mapToTxt(map);

  fs.writeFileSync(cfgPath, content, 'utf8');
}

export function getCwdConfig(...args): any {
  const cfgPath = join(process.cwd(), CONFIG_NAME);
  return getConfig(cfgPath, ...args);
}
