import path from 'path';
import got from 'got';
import fs from 'fs-extra';
import ora from 'ora';
import chalk from 'chalk';
import prettyBytes from 'pretty-bytes';
import ignore from 'ignore';
import tarFs from 'tar-fs';
import { createUnzip, createGzip } from 'zlib';
import { pipeline } from 'stream';

import hooks from '@/hooks';
import { HOOKS, GIT_IGNORE, TEMP_DIR, TEMP_NAME } from '@/common/constant';
import { MaterialSchema } from '@/inerface';

export interface DownloadTarball {
  url: string;
  directory: string;
}

export interface MeteData extends UrlInfo, MaterialSchema {
  type: string;
}
export interface ExtractTarball {
  filename: string;
  directory: string;
  name: string;
  meteData: MeteData;
  rewrite: boolean;
}

export function downloadTarball({
  url,
  directory,
}: DownloadTarball): Promise<{ filename: string; url: string }> {
  const writePath = path.join(directory, TEMP_NAME);
  const spinner = ora(chalk.green('Downloading...')).start();

  if (!fs.existsSync(directory)) {
    fs.mkdirpSync(directory);
  }

  return new Promise((resolve, reject) => {
    pipeline(
      got
        .stream(url)
        .on(
          'downloadProgress',
          ({ percent = 0, total = 0, transferred = 0 }) => {
            const p = chalk.cyan(`${(percent * 100).toFixed(2)}%`);
            const t = chalk.cyan(prettyBytes(total));
            const trans = chalk.cyan(prettyBytes(transferred));
            spinner.text = chalk.green(
              `Downloading Info: total: ${t}, transferred: ${trans}, percent: ${p}`,
            );
          },
        ),
      fs.createWriteStream(writePath),
      err => {
        if (err) {
          spinner.fail(chalk.redBright('Download failed.'));
          console.error(err);
          reject(err);
          return;
        }
        spinner.succeed(chalk.green('Download successed.'));
        resolve({ filename: writePath, url });
      },
    );
  });
}

export function extractTarball({
  filename,
  name,
  directory,
  meteData,
  rewrite,
}: ExtractTarball): Promise<{ entry: string[] }> {
  const whitelist = ['.tgz', '.tar'];

  const spinner = ora(chalk.green('Extracting...')).start();
  const entry = [];

  return new Promise((resolve, reject) => {
    if (!whitelist.includes(meteData.ext)) {
      let writePath = path.join(directory, name + meteData.ext);

      if (hooks.has(HOOKS.extractTarball.beforeWrite)) {
        writePath = hooks.emitSync<MeteData & { path: string }>(
          HOOKS.extractTarball.beforeWrite,
          {
            ...meteData,
            path: writePath,
          },
        ).path;
      }

      entry.push(writePath);

      const dir = path.dirname(writePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirpSync(dir);
      }

      spinner.text = `Extract file: ${writePath}`;

      pipeline(
        fs.createReadStream(filename),
        fs.createWriteStream(writePath),
        err => {
          if (err) {
            reject(err);
            spinner.fail(chalk.redBright('Extracting failed.'));
          } else {
            spinner.succeed(chalk.green('Extracting successed.'));

            resolve({ entry });
          }
        },
      );
    } else {
      pipeline(
        fs.createReadStream(filename),
        createUnzip(),
        tarFs.extract(path.join(directory), {
          map: function(header) {
            let writePath = header.name;

            if (hooks.has(HOOKS.extractTarball.beforeWrite)) {
              writePath = hooks.emitSync<MeteData & { path: string }>(
                HOOKS.extractTarball.beforeWrite,
                {
                  ...meteData,
                  path: writePath,
                  name,
                },
              ).path;
            }

            entry.push(writePath);

            // 如果本地存在该文件，询问是否覆盖
            if (
              !rewrite &&
              fs.existsSync(writePath) &&
              fs.statSync(writePath).isFile()
            ) {
              console.log('');
              console.log(
                chalk.yellowBright(
                  `Found same file: ${writePath} and will rename old filename to new filename with postfix(.backup) at default, if you don't wanna rename, please add -r or --rewrite option.`,
                ),
              );
              fs.renameSync(writePath, writePath + '.backup');
            }

            header.name = writePath;
            return header;
          },
        }),
        err => {
          if (err) {
            spinner.fail(chalk.redBright('Extracting failed.'));
            reject(err);
            return;
          }
          spinner.succeed(chalk.green('Extracting successed.'));
          resolve({ entry });
        },
      );
    }
  });
}

export interface UrlInfo {
  version: string;
  ext: string;
  name: string;
}
export function getUrlInfo(url: string): UrlInfo {
  const extName = path.extname(url);

  const basename = path.basename(url, extName);

  const nameVersion = basename.split('-');

  const version = nameVersion.pop();
  const name = nameVersion.join('-');

  return { version, ext: extName, name };
}

export async function packTar(dir: string, name: string): Promise<string> {
  const cwdDir = dir;
  const gitignoreDir = path.join(cwdDir, GIT_IGNORE);

  const ig = ignore();
  ig.add('.git');
  ig.add('.mete');

  if (fs.existsSync(gitignoreDir)) {
    const igPats = fs
      .readFileSync(gitignoreDir, 'utf-8')
      .split(/\n|\r\n/)
      .filter(_ => _ === _ || !_.startsWith('#'));
    ig.add(igPats);
  }

  return new Promise((resolve, reject) => {
    const outDir = path.join(process.cwd(), TEMP_DIR);
    const outFilename = path.join(outDir, name);

    if (!fs.existsSync(outDir)) {
      fs.mkdirpSync(outDir);
    }
    const writeStream = fs.createWriteStream(outFilename);

    const gZipStream = createGzip();

    writeStream.on('error', reject);
    writeStream.on('close', () => {
      resolve(outFilename);
      hooks.emit(HOOKS.packTarball.success, outFilename);
    });

    tarFs
      .pack(cwdDir, {
        ignore: function(name) {
          return ig.ignores(path.relative(cwdDir, name));
        },
      })
      .pipe(gZipStream)
      .pipe(writeStream);
  });
}
