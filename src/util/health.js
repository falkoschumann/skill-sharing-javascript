export const Status = Object.freeze({
  UP: 'UP',
  DOWN: 'DOWN',
  OUT_OF_SERVICE: 'OUT_OF_SERVICE',
  UNKNOWN: 'UNKNOWN',
});

export class Health {
  static up(/** @type {?Record<string, any>} */ details) {
    return new Health(Status.UP, details);
  }

  static down(/** @type {?Record<string, any>} */ details) {
    return new Health(Status.DOWN, details);
  }

  static outOfService(/** @type {?Record<string, any>} */ details) {
    return new Health(Status.OUT_OF_SERVICE, details);
  }

  static unknown(/** @type {?Record<string, any>} */ details) {
    return new Health(Status.UNKNOWN, details);
  }

  constructor(
    /** @type {Status} */ status = Status.UP,
    /** @type {?Record<string, any>} */ details,
  ) {
    this.status = status;
    this.details = details; /** e.g. error: "..." */
  }
}

export class HealthIndicator {
  health() {
    return Health.up();
  }
}

export class HealthRegistry {
  static create() {
    return new HealthRegistry();
  }

  /** @type {Map<string, HealthIndicator>} */ #registry = new Map();

  health() {
    if (this.#registry.size === 0) {
      return new Health();
    }

    const order = ['DOWN', 'OUT_OF_SERVICE', 'UP', 'UNKNOWN'];
    const statuses = [];
    const components = {};
    for (const [name, healthIndicator] of this.#registry.entries()) {
      components[name] = healthIndicator.health();
      statuses.push(components[name].status);
    }

    statuses.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    const status = statuses[0];
    return { status, components };
  }

  register(
    /** @type {string} */ name,
    /** @type {HealthIndicator} */ healthIndicator,
  ) {
    this.#registry.set(name, healthIndicator);
  }

  unregister(/** @type {string} */ name) {
    this.#registry.delete(name);
  }
}
