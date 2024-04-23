import express from 'express';

import { TalksController } from './talks-controller.js';
import { Services } from '../application/services.js';

export class Application {
  static create({ publicPath = './public' } = {}) {
    return new Application(publicPath);
  }

  #app;

  constructor(publicPath, services = Services.create(), app = express()) {
    this.#app = app;
    app.set('x-powered-by', false);
    app.use('/', express.static(publicPath));
    app.use(express.json());
    new TalksController(services, app);
  }

  start({ port = 3000 } = {}) {
    this.#app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  }
}
