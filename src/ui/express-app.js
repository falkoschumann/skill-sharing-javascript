import express from 'express';

import { queryTalks, submitTalk } from '../application/services.js';
import { Repository } from '../infrastructure/repository.js';

export class ExpressApp {
  #version;
  #waiting;
  #app;

  constructor({ publicPath = './public', repository = new Repository() } = {}) {
    this.#version = 0;
    this.#waiting = [];

    this.#app = express();
    this.#app.set('x-powered-by', false);
    this.#app.use('/', express.static(publicPath));
    this.#app.use(express.json());

    this.#app.get('/api/talks', async (req, res) => {
      const tag = /"(.*)"/.exec(req.get('If-None-Match'));
      const wait = /\bwait=(\d+)/.exec(req.get('Prefer'));

      if (!tag || tag[1] != String(this.#version)) {
        const response = await this.#talkResponse(repository);
        this.#reply(res, response);
      } else if (!wait) {
        this.#reply(res, { status: 304 });
      } else {
        const response = await this.#waitForChange(Number(wait[1]));
        this.#reply(res, response);
      }
    });

    this.#app.put('/api/talks/:title', async (req, res) => {
      let talk = req.body;
      if (typeof talk.summary != 'string') {
        res.status(400).send();
        return;
      }

      const title = req.params.title;
      await submitTalk({ title, summary: talk.summary }, repository);
      this.talkSubmitted(repository);
      res.status(204).send();
    });
  }

  #reply(
    res,
    { status = 200, headers = { 'Content-Type': 'text/plain' }, body = {} },
  ) {
    res.status(status).header(headers).json(body);
  }

  async #talkResponse(repository) {
    const talks = await queryTalks(repository);
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ETag: `"${this.#version}"`,
        'Cache-Control': 'no-store',
      },
      body: talks,
    };
  }

  #waitForChange(time) {
    return new Promise((resolve) => {
      this.#waiting.push(resolve);
      setTimeout(async () => {
        if (!this.#waiting.includes(resolve)) {
          return;
        }

        this.#waiting = this.#waiting.filter((r) => r != resolve);
        resolve({ status: 304 });
      }, time * 1000);
    });
  }

  async talkSubmitted(repository) {
    this.#version++;
    const response = await this.#talkResponse(repository);
    this.#waiting.forEach((resolve) => resolve(response));
    this.#waiting = [];
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
