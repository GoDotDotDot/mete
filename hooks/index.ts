import Events from 'events';

export class Hooks {
  private events: Events;

  constructor() {
    this.events = new Events();
  }

  register<T>(key: string, fn: (args: T) => T) {
    this.events.on(key, fn);
  }

  emitSync<T>(key: string, args: any): T {
    this.events.listeners(key).forEach(listener => {
      args = listener(args);
    });

    return args;
  }

  async emit<T>(key: string, args: any): Promise<T> {
    for (const listener of this.events.listeners(key)) {
      args = await listener(args);
    }

    return args;
  }

  has(key: string) {
    return Boolean(this.events.listeners(key).length);
  }
}

export default new Hooks();
