import * as handler from './handler.js';

export class MetricsController {
  #services;

  constructor(services, app) {
    this.#services = services;
    app.get('/metrics', handler.runSafe(this.#getMetrics.bind(this)));
  }

  async #getMetrics(req, res) {
    const metrics = await this.#services.getMetrics();
    const timestamp = new Date().getTime();
    let body = `# TYPE talks_count gauge\ntalks_count ${metrics.talksCount} ${timestamp}\n\n`;
    body += `# TYPE presenters_count gauge\npresenters_count ${metrics.presentersCount} ${timestamp}\n\n`;

    handler.reply(res, { body });
  }
}
