export const Status = Object.freeze({
  UP: 'UP',
  DOWN: 'DOWN',
  OUT_OF_SERVICE: 'OUT_OF_SERVICE',
  UNKNOWN: 'UNKNOWN',
});

export class Health {
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
    return new Health();
  }
}

export class HealthRegistry {
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
