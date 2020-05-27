import { CONFIG_NAME } from '@/common/constant';
import hooks from '@/hooks';
import { join } from 'path';
import { existsSync } from 'fs-extra';
import { getGlobalConfig } from '@/utils/config';

const dir = join(process.cwd(), CONFIG_NAME);

let plugins = [];

if (existsSync(dir)) {
  const config = getGlobalConfig('plugin');

  plugins = config || [];
}

async function main() {
  for (const plugin of plugins) {
    await plugin(hooks);
  }
}

export default main;
