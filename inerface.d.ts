import { Hooks } from './hooks';

export interface Config {
  name: string;
  version: string;
  type: 'component' | 'block' | 'scaffold' | 'page';
  registry: string;
  plugin: Array<(api: Hooks) => Promise<void> | void>;
  author?: string;
}

export interface ResponseData {
  code?: number;
  msg?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}
