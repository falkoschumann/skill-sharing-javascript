import express from 'express';

import { TalksController } from './talks-controller.js';
import { Services } from '../application/services.js';

export class Application {
  static create() {
    return new Application('./public', Services.create(), express());
  }

  #app;

  constructor(publicPath, services, app) {
    this.#app = app;
    app.set('x-powered-by', false);
    app.use(express.json());
    app.use('/', express.static(publicPath));
    new TalksController(services, app);
  }

  start({ port = 3000 } = {}) {
    this.#app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  }
}
