import Events from 'events';

export interface EventParams {
  args: any;
  result: any;
}

export class Hooks {
  private events: Events;

  constructor() {
    this.events = new Events();
  }

  register(key: string, fn: (args: EventParams) => void) {
    this.events.on(key, fn);
  }

  emitSync<T>(key: string, ...args: any): T {
    let params: EventParams = { args, result: undefined };

    this.events.listeners(key).forEach(listener => {
      const result = listener(params);
      params = { args, result };
    });

    return params.result;
  }

  async emit<T>(key: string, ...args: any): Promise<T> {
    let params: EventParams = { args, result: undefined };

    for (const listener of this.events.listeners(key)) {
      const result = await listener(params);
      params = { args, result };
    }

    return params.result;
  }

  has(key: string) {
    return Boolean(this.events.listeners(key).length);
  }
}

export default new Hooks();
