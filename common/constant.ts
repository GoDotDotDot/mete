export const HOOKS = {
  extractTarball: {
    beforeWrite: 'extractTarball@beforeWrite',
    success: 'extractTarball@sucess',
  },
  tarballDownload: { success: 'tarballDownload@success' },
};

export const CONFIG_NAME = 'mete.config.js';
