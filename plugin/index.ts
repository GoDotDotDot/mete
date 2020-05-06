import { CONFIG_NAME } from '@/common/constant';
import hooks from '@/hooks';
import { join } from 'path';
import { existsSync } from 'fs-extra';
import { Config } from '@/config';

const dir = join(process.cwd(), CONFIG_NAME);

let plugins = [];

if (existsSync(dir)) {
  // eslint-disable-next-line
  const cfgFile = require(dir);

  let config: Config;

  if (typeof cfgFile === 'function') {
    config = cfgFile(hooks);
  } else {
    config = cfgFile;
  }

  plugins = config.plugin || [];
}

async function main() {
  for (const plugin of plugins) {
    await plugin(hooks);
  }
}

export default main;
