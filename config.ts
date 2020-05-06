import { Hooks } from './hooks';

export interface Config {
  plugin: Array<(api: Hooks) => Promise<void> | void>;
}
