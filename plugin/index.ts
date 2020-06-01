import { CONFIG_NAME } from '@/common/constant';
import hooks from '@/hooks';
import { join } from 'path';
import { existsSync } from 'fs-extra';
import { getCwdConfig } from '@/utils/config';

const dir = join(process.cwd(), CONFIG_NAME);

let plugins = [];

if (existsSync(dir)) {
  const config = getCwdConfig('plugin');

  plugins = config || [];
}

function main() {
  for (const plugin of plugins) {
    plugin(hooks);
  }
}

export default main;
