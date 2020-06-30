import { CONFIG_NAME } from '@/common/constant';
import hooks from '@/hooks';
import { join } from 'path';
import { existsSync } from 'fs-extra';
import { getCwdConfig } from '@/utils/config';

function main() {
  const dir = join(process.cwd(), CONFIG_NAME);

  let plugins = [];

  if (existsSync(dir)) {
    const plugin = getCwdConfig('plugin');

    plugins = plugin ? plugin[0] || [] : [];
  }

  for (const plugin of plugins) {
    plugin(hooks);
  }
}

export default main;
