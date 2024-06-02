import * as handler from './handler.js';

/**
 * @typedef {import('../application/services.js').Services} Services
 * @typedef {import('express').Express} Express
 * @typedef {import('express').Response} Response
 * @typedef {import('express').Request} Request
 */

export class ActuatorController {
  #services;

  constructor(/** @type {Services} */ services, /** @type {Express} */ app) {
    this.#services = services;

    app.get('/actuator', this.#getActuator.bind(this));
    app.get('/actuator/info', this.#getActuatorInfo.bind(this));
    app.get('/actuator/metrics', this.#getActuatorMetrics.bind(this));
    app.get('/actuator/health', this.#getActuatorHealth.bind(this));
    app.get(
      '/actuator/prometheus',
      handler.runSafe(this.#getMetrics.bind(this)),
    );
  }

  async #getActuator(
    /** @type {Request} */ request,
    /** @type {Response} */ response,
  ) {
    let requestedUrl =
      request.protocol + '://' + request.get('host') + request.originalUrl;
    if (!requestedUrl.endsWith('/')) {
      requestedUrl += '/';
    }
    response.status(200).json({
      _links: {
        self: { href: requestedUrl },
        info: { href: requestedUrl + 'info' },
        metrics: { href: requestedUrl + 'metrics' },
        health: { href: requestedUrl + 'health' },
        prometheus: { href: requestedUrl + 'prometheus' },
      },
    });
  }

  async #getActuatorInfo(
    /** @type {Request} */ request,
    /** @type {Response} */ response,
  ) {
    const info = {};
    info[process.env.npm_package_name] = {
      version: process.env.npm_package_version,
    };
    response.status(200).json(info);
  }

  async #getActuatorMetrics(
    /** @type {Request} */ request,
    /** @type {Response} */ response,
  ) {
    response.status(200).json({
      cpu: process.cpuUsage(),
      mem: process.memoryUsage(),
      uptime: process.uptime(),
    });
  }

  async #getActuatorHealth(
    /** @type {Request} */ request,
    /** @type {Response} */ response,
  ) {
    // TODO Create class HealthIndicator and Health
    // TODO Improve health endpoint
    // TODO Map DOWN status to 503
    // Example:
    // {
    //   "status": "UP",
    //   "components": {
    //     "realtime": {
    //       "status": "UP",
    //       "details": {
    //         "file": "realtime.csv"
    //       }
    //     }
    //   }
    // }

    response.status(200).json({
      status: 'UP',
    });
  }

  async #getMetrics(
    /** @type {Request} */ request,
    /** @type {Response} */ response,
  ) {
    // TODO count warnings and errors
    // TODO create class MeterRegistry

    const metrics = await this.#services.getMetrics();
    const timestamp = new Date().getTime();
    let body = `# TYPE talks_count gauge\ntalks_count ${metrics.talksCount} ${timestamp}\n\n`;
    body += `# TYPE presenters_count gauge\npresenters_count ${metrics.presentersCount} ${timestamp}\n\n`;
    body += `# TYPE comments_count gauge\ncomments_count ${metrics.commentsCount} ${timestamp}\n\n`;
    handler.reply(response, { body });
  }
}
