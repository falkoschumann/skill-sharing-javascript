export class MetricsController {
  #services;

  constructor(services, app) {
    this.#services = services;
    app.get('/metrics', this.#tryHandle(this.#getMetrics.bind(this)));
  }

  #tryHandle(handler) {
    // TODO handle exception is obsolete with with Express 5
    // TODO extract to module
    return async (req, res, next) => {
      try {
        await handler(req, res);
      } catch (error) {
        next(error);
      }
    };
  }

  #reply(
    res,
    {
      status = 200,
      headers = { 'Content-Type': 'text/plain' },
      body = '',
    } = {},
  ) {
    // TODO extract to module
    res.status(status).header(headers).send(body);
  }

  async #getMetrics(req, res) {
    const metrics = await this.#services.getMetrics();
    let body = `# TYPE talks_count gauge\ntalks_count ${metrics.talksCount}\n\n`;
    body += `# TYPE presenters_count gauge\npresenters_count ${metrics.presentersCount}\n\n`;

    this.#reply(res, { body });
  }
}
