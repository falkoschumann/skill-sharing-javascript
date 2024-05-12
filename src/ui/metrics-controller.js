import * as handler from './handler.js';

export class MetricsController {
  #services;

  constructor(services, app) {
    this.#services = services;
    app.get('/metrics', handler.runSafe(this.#getMetrics.bind(this)));
  }

  async #getMetrics(req, res) {
    const metrics = await this.#services.getMetrics();
    let body = `# TYPE talks_count gauge\ntalks_count ${metrics.talksCount}\n\n`;
    body += `# TYPE presenters_count gauge\npresenters_count ${metrics.presentersCount}\n\n`;

    handler.reply(res, { body });
  }
}
