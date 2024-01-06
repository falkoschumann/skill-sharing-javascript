import express from 'express';

import { Repository } from '../infrastructure/repository.js';
import { TalksController } from './talks-controller.js';

export class SkillSharingApp {
  #express;

  constructor({
    publicPath = './public',
    repository = Repository.create(),
  } = {}) {
    this.#express = this.#createExpress(publicPath);
    new TalksController({ app: this.#express, repository });
  }

  get app() {
    return this.#express;
  }

  run({ port = 3000 } = {}) {
    this.#express.listen(port, () => {
      console.log(`Skill Sharing app listening on port ${port}`);
    });
  }

  #createExpress(publicPath) {
    let app = express();
    app.set('x-powered-by', false);
    app.use('/', express.static(publicPath));
    app.use(express.json());
    return app;
  }
}
