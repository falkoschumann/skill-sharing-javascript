import express, { Express, Response } from 'express';

import {
  addComment,
  deleteTalk,
  getTalk,
  getTalks,
  submitTalk,
} from '../application/services';
import { Repository } from '../infrastructure/repository';

type RestResponse = {
  status?: number;
  headers?: Record<string, string>;
  body?: string;
};

export class ExpressApp {
  #version: number;
  #waiting: Array<(response: RestResponse) => void>;
  #app: Express;

  constructor({ publicPath = './public', repository = new Repository() } = {}) {
    this.#version = 0;
    this.#waiting = [];

    this.#app = express();
    this.#app.set('x-powered-by', false);
    this.#app.use('/', express.static(publicPath));
    this.#app.use(express.json());

    this.#app.get('/api/talks', async (req, res) => {
      const tag = /"(.*)"/.exec(req.get('If-None-Match') || '');
      const wait = /\bwait=(\d+)/.exec(req.get('Prefer') || '');

      if (!tag || tag[1] !== String(this.#version)) {
        const response = await this.#talkResponse(repository);
        this.#reply(res, response);
      } else if (!wait) {
        this.#reply(res, { status: 304 });
      } else {
        const response = await this.#waitForChange(Number(wait[1]));
        this.#reply(res, response);
      }
    });

    this.#app.get('/api/talks/:title', async (req, res) => {
      const title = req.params.title;
      const talk = await getTalk({ title }, repository);
      if (talk == null) {
        this.#reply(res, { status: 404, body: `No talk '${title}' found` });
        return;
      }

      this.#reply(res, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(talk),
      });
    });

    this.#app.put('/api/talks/:title', async (req, res) => {
      const talk = req.body;
      if (
        typeof talk.presenter != 'string' ||
        typeof talk.summary != 'string'
      ) {
        this.#reply(res, { status: 400, body: 'Bad talk data' });
        return;
      }

      const title = req.params.title;
      await submitTalk(
        { title, presenter: talk.presenter, summary: talk.summary },
        repository,
      );
      this.#talksUpdated(repository);
      this.#reply(res, { status: 204 });
    });

    this.#app.delete('/api/talks/:title', async (req, res) => {
      const title = req.params.title;
      await deleteTalk({ title }, repository);
      this.#talksUpdated(repository);
      this.#reply(res, { status: 204 });
    });

    this.#app.post('/api/talks/:title/comments', async (req, res) => {
      const comment = req.body;
      if (
        typeof comment.author != 'string' ||
        typeof comment.message != 'string'
      ) {
        this.#reply(res, { status: 400, body: 'Bad comment data' });
        return;
      }

      const title = req.params.title;
      const successful = await addComment(
        {
          title,
          comment: { author: comment.author, message: comment.message },
        },
        repository,
      );
      if (!successful) {
        this.#reply(res, { status: 404, body: `No talk '${title}' found` });
        return;
      }

      this.#talksUpdated(repository);
      this.#reply(res, { status: 204 });
    });
  }

  #reply(
    res: Response,
    {
      status = 200,
      headers = { 'Content-Type': 'text/plain' },
      body = '',
    }: RestResponse = {},
  ) {
    res.status(status).header(headers).send(body);
  }

  async #talkResponse(repository: Repository) {
    const talks = await getTalks(repository);
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ETag: `"${this.#version}"`,
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify(talks),
    };
  }

  async #waitForChange(time: number): Promise<RestResponse> {
    return new Promise((resolve) => {
      this.#waiting.push(resolve);
      setTimeout(async () => {
        if (!this.#waiting.includes(resolve)) {
          return;
        }

        this.#waiting = this.#waiting.filter((r) => r !== resolve);
        resolve({ status: 304 });
      }, time * 1000);
    });
  }

  async #talksUpdated(repository: Repository) {
    this.#version++;
    const response = await this.#talkResponse(repository);
    this.#waiting.forEach((resolve) => resolve(response));
    this.#waiting = [];
  }

  get app() {
    return this.#app;
  }

  run({ port = 3000 } = {}) {
    this.#app.listen(port, () => {
      console.log(`Skill Sharing app listening on port ${port}`);
    });
  }
}
