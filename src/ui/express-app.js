import express from 'express';

import { Repository } from '../infrastructure/repository.js';
import { TalksController } from './talks-controller.js';

export class ExpressApp {
  #app;

  constructor({ publicPath = './public', repository = new Repository() } = {}) {
    this.#app = this.#createApp(publicPath);
    new TalksController({ app: this.#app, repository });
  }

  get app() {
    return this.#app;
  }

  run({ port = 3000 } = {}) {
    this.#app.listen(port, () => {
      console.log(`Skill Sharing app listening on port ${port}`);
    });
  }

  #createApp(publicPath) {
    let app = express();
    app.set('x-powered-by', false);
    app.use('/', express.static(publicPath));
    app.use(express.json());
    return app;
  }
}
