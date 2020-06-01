import Events from 'events';

export class Hooks {
  private events: Events;

  constructor() {
    this.events = new Events();
  }

  register<T>(key: string, fn: (args: T) => T) {
    this.events.on(key, fn);
  }

  emitSync<T>(key: string, args: T): T {
    this.events.listeners(key).forEach(listener => {
      args = listener(args);
    });

    return args;
  }

  async emit<T>(key: string, args: T): Promise<T> {
    for (const listener of this.events.listeners(key)) {
      args = await listener(args);
    }

    return args;
  }

  has(key: string) {
    return Boolean(this.events.listeners(key).length);
  }
}

const hooks = new Hooks();

export default hooks;
