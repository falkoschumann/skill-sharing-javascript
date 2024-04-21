import express from 'express';

import { Repository } from '../infrastructure/repository.js';
import { TalksController } from './talks-controller.js';

export class Application {
  static create({
    publicPath = './public',
    app = express(),
    repository = Repository.create(),
  } = {}) {
    return new Application(publicPath, app, repository);
  }

  #app;

  constructor(publicPath, app, repository) {
    this.#app = app;
    app.set('x-powered-by', false);
    app.use('/', express.static(publicPath));
    app.use(express.json());
    TalksController.create({ app, repository });
  }

  start({ port = 3000 } = {}) {
    this.#app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  }
}
