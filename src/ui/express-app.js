import express from 'express';

import { queryTalks, submitTalk } from '../application/services.js';
import { Repository } from '../infrastructure/repository.js';

export class ExpressApp {
  #app;

  constructor({ publicPath = './public', repository = new Repository() } = {}) {
    this.#app = express();
    this.#app.set('x-powered-by', false);
    this.#app.use('/', express.static(publicPath));
    this.#app.use(express.json());

    let version = 0;

    this.#app.get('/api/talks', async (_, res) => {
      const talks = await queryTalks(repository);
      res
        .status(200)
        .set('ETag', String(version))
        .set('Cache-Control', 'no-store')
        .json(talks);
    });

    this.#app.put('/api/talks/:title', async (req, res) => {
      let talk = req.body;
      if (typeof talk.summary != 'string') {
        res.status(400).send();
        return;
      }

      const title = req.params.title;
      submitTalk({ title, summary: talk.summary }, repository);
      version++;
      res.status(204).send();
    });
  }

  get app() {
    return this.#app;
  }

  start(port) {
    this.#app.listen(port, () => {
      console.log(`Skill Sharing app listening on port ${port}`);
    });
  }
}
