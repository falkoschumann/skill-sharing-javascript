import * as handler from './handler.js';

/**
 * @typedef {import('../application/services.js').Services} Services
 * @typedef {import('express').Express} Express
 * @typedef {import('express').Response} Response
 * @typedef {import('express').Request} Request
 */

export class MetricsController {
  #services;

  constructor(/** @type {Services} */ services, /** @type {Express} */ app) {
    this.#services = services;
    app.get('/metrics', handler.runSafe(this.#getMetrics.bind(this)));
  }

  async #getMetrics(
    /** @type {Request} */ request,
    /** @type {Response} */ response,
  ) {
    const metrics = await this.#services.getMetrics();
    const timestamp = new Date().getTime();
    let body = `# TYPE talks_count gauge\ntalks_count ${metrics.talksCount} ${timestamp}\n\n`;
    body += `# TYPE presenters_count gauge\npresenters_count ${metrics.presentersCount} ${timestamp}\n\n`;

    handler.reply(response, { body });
  }
}
