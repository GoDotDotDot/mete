export const HOOKS = {
  extractTarball: {
    beforeWrite: 'extractTarball@beforeWrite',
    success: 'extractTarball@sucess',
  },
  tarballDownload: { success: 'tarballDownload@success' },
  packTarball: {
    success: 'packTarball@success',
  },
};

export const CONFIG_NAME = '.meterc.js';
export const GIT_IGNORE = '.gitignore';
export const TEMP_DIR = '.mete';
export const TEMP_NAME = '.mete-tmp';
