import path from 'path';
import got from 'got';
import fs from 'fs-extra';
import ora from 'ora';
import chalk from 'chalk';
import { createUnzip } from 'zlib';
import prettyBytes from 'pretty-bytes';
import tar from 'tar-stream';
import hooks from '@/hooks';
import { pipeline } from 'stream';
import { HOOKS } from '@/common/constant';

export const TEMP_NAME = '.mete-tmp';

export interface DownloadTarball {
  url: string;
  directory: string;
}

export interface ExtractTarball {
  filename: string;
  directory: string;
  name: string;
  meteData: UrlInfo;
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
}: ExtractTarball): Promise<{ entry: string[] }> {
  const whitelist = ['.tgz', '.tar'];

  const spinner = ora(chalk.green('Extracting...')).start();
  const extract = tar.extract();
  const entry = [];

  return new Promise((resolve, reject) => {
    if (!whitelist.includes(meteData.ext)) {
      let writePath = path.join(directory, name + meteData.ext);

      if (hooks.has(HOOKS.extractTarball.beforeWrite)) {
        writePath = hooks.emitSync<string>(
          HOOKS.extractTarball.beforeWrite,
          writePath,
        );
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
      extract.on('entry', function(header, stream, next) {
        const realPath = header.name.replace(/^package\//, '');

        let writePath = path.join(directory, name, realPath);

        if (hooks.has(HOOKS.extractTarball.beforeWrite)) {
          writePath = hooks.emitSync<string>(
            HOOKS.extractTarball.beforeWrite,
            writePath,
          );
        }

        const dir = path.dirname(writePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirpSync(dir);
        }

        spinner.text = `Extract file: ${writePath}`;

        entry.push(writePath);

        stream.on('end', function() {
          next(); // ready for next entry
        });

        pipeline(stream, fs.createWriteStream(writePath), err => {
          if (err) {
            spinner.fail(chalk.redBright('Extracting failed.'));
            reject(err);
            return;
          }
          stream.resume();
        });
      });
      pipeline(fs.createReadStream(filename), createUnzip(), extract, err => {
        if (err) {
          spinner.fail(chalk.redBright('Extracting failed.'));
          reject(err);
          return;
        }
        spinner.succeed(chalk.green('Extracting successed.'));
        resolve({ entry });
      });
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
  const name = nameVersion.join('');

  return { version, ext: extName, name };
}
