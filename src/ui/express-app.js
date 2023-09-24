import express from 'express';

import { queryTalks, submitTalk } from '../application/services.js';
import { Repository } from '../infrastructure/repository.js';

export class ExpressApp {
  #app;
  #port;

  constructor({
    port = 3000,
    publicPath = './public',
    repository = new Repository(),
  } = {}) {
    this.#port = port;

    this.#app = express();
    this.#app.set('x-powered-by', false);
    this.#app.use('/', express.static(publicPath));
    this.#app.use(express.json());

    this.#app.get('/api/talks', async (_, res) => {
      const talks = await queryTalks(repository);
      res.status(200).json(talks);
    });

    this.#app.put('/api/talks/:title', async (req, res) => {
      let talk = req.body;
      if (typeof talk.summary != 'string') {
        res.status(400).send();
        return;
      }

      const title = req.params.title;
      submitTalk({ title, summary: talk.summary }, repository);
      res.status(204).send();
    });
  }

  get app() {
    return this.#app;
  }

  run() {
    this.#app.listen(this.#port, () => {
      console.log(`Skill Sharing app listening on port ${this.#port}`);
    });
  }
}
