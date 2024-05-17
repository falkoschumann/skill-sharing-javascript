import path from 'node:path';
import express from 'express';

import { Services } from '../application/services.js';
import { MetricsController } from './metrics-controller.js';
import { TalksController } from './talks-controller.js';

export class Application {
  static create() {
    return new Application(Services.create(), express());
  }

  #app;
  #server;

  constructor(services, app) {
    this.#app = app;
    app.set('x-powered-by', false);
    app.use(express.json());
    app.use('/', express.static(path.join('./public')));
    new TalksController(services, app);
    new MetricsController(services, app);
  }

  start({ port = 3000 } = {}) {
    return new Promise((resolve) => {
      this.#server = this.#app.listen(port, () => {
        console.log(`Server is listening on port ${port}.`);
        resolve();
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      this.#server.on('close', () => {
        console.log('Server stopped.');
        resolve();
      });
      this.#server.close();
    });
  }
}
