import { Hooks } from './hooks';

export interface Config {
  name: string;
  version: string;
  tags?: string[];
  type: string;
  registry?: string;
  plugin?: Array<(api: Hooks) => Promise<void> | void>;
  author?: string;
}

export interface ResponseData {
  code?: number;
  msg?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export interface MaterialSchema {
  name: string;
  version: string;
  type: string;
  etag: string;
  tags: string[];
  bucketName: string;
  objectName: string;
}
