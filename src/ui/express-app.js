import express from 'express';

import {
  addComment,
  deleteTalk,
  getTalk,
  getTalks,
  submitTalk,
} from '../application/services.js';
import { Repository } from '../infrastructure/repository.js';

export class ExpressApp {
  #version;
  #waiting;
  #app;

  constructor({ publicPath = './public', repository = new Repository() } = {}) {
    this.#version = 0;
    this.#waiting = [];
    this.#app = this.#createApp(publicPath);
    this.#createRoutes(repository);
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

  #createRoutes(repository) {
    this.#createRouteGetTalks(repository);
    this.#createRouteGetTalk(repository);
    this.#createRouteSubmitTalk(repository);
    this.#createRouteDeleteTalk(repository);
    this.#createRouteAddComment(repository);
  }

  #createRouteGetTalks(repository) {
    this.#app.get('/api/talks', async (req, res) => {
      if (this.#isCurrentVersion(req)) {
        let response = await this.#tryLongPolling(req);
        this.#reply(res, response);
      } else {
        let response = await this.#talkResponse(repository);
        this.#reply(res, response);
      }
    });
  }

  #isCurrentVersion(req) {
    let tag = /"(.*)"/.exec(req.get('If-None-Match'));
    return tag && tag[1] === String(this.#version);
  }

  async #tryLongPolling(req) {
    let time = this.#getPollingTime(req);
    if (time == null) {
      return { status: 304 };
    }

    return this.#waitForChange(time);
  }

  #getPollingTime(req) {
    let wait = /\bwait=(\d+)/.exec(req.get('Prefer'));
    return wait != null ? Number(wait[1]) : null;
  }

  async #waitForChange(time) {
    return new Promise((resolve) => {
      this.#waiting.push(resolve);
      setTimeout(async () => {
        if (this.#waiting.includes(resolve)) {
          this.#waiting = this.#waiting.filter((r) => r !== resolve);
          resolve({ status: 304 });
        }
      }, time * 1000);
    });
  }

  async #talkResponse(repository) {
    let talks = await getTalks(repository);
    let body = JSON.stringify(talks);
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ETag: `"${this.#version}"`,
        'Cache-Control': 'no-store',
      },
      body,
    };
  }

  #reply(
    res,
    {
      status = 200,
      headers = { 'Content-Type': 'text/plain' },
      body = '',
    } = {},
  ) {
    res.status(status).header(headers).send(body);
  }

  #createRouteGetTalk(repository) {
    this.#app.get('/api/talks/:title', async (req, res) => {
      let { title } = this.#getTalkParameters(req);
      let talk = await getTalk({ title }, repository);
      if (talk == null) {
        this.#reply(res, { status: 404, body: `No talk '${title}' found` });
      } else {
        this.#reply(res, {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(talk),
        });
      }
    });
  }

  #getTalkParameters(req) {
    return { title: req.params.title };
  }

  #createRouteSubmitTalk(repository) {
    this.#app.put('/api/talks/:title', async (req, res) => {
      let { title } = this.#getTalkParameters(req);
      let talk = this.#parseTalkBody(req);
      if (talk == null) {
        this.#reply(res, { status: 400, body: 'Bad talk data' });
      } else {
        await submitTalk(
          { title, presenter: talk.presenter, summary: talk.summary },
          repository,
        );
        await this.#talksUpdated(repository);
        this.#reply(res, { status: 204 });
      }
    });
  }

  #parseTalkBody(req) {
    let talk = req.body;
    if (typeof talk.presenter == 'string' && typeof talk.summary == 'string') {
      return { presenter: talk.presenter, summary: talk.summary };
    }

    return null;
  }

  #createRouteDeleteTalk(repository) {
    this.#app.delete('/api/talks/:title', async (req, res) => {
      let { title } = this.#getTalkParameters(req);
      await deleteTalk({ title }, repository);
      await this.#talksUpdated(repository);
      this.#reply(res, { status: 204 });
    });
  }

  #createRouteAddComment(repository) {
    this.#app.post('/api/talks/:title/comments', async (req, res) => {
      let comment = this.#parseCommentBody(req);
      if (comment == null) {
        this.#reply(res, { status: 400, body: 'Bad comment data' });
      } else {
        let { title } = this.#getTalkParameters(req);
        let response = await this.#tryAddComment(
          { title, comment },
          repository,
        );
        this.#reply(res, response);
      }
    });
  }

  #parseCommentBody(req) {
    let comment = req.body;
    if (
      typeof comment.author == 'string' &&
      typeof comment.message == 'string'
    ) {
      return { author: comment.author, message: comment.message };
    }

    return null;
  }

  async #tryAddComment({ title, comment }, repository) {
    let success = await addComment({ title, comment }, repository);
    if (success) {
      await this.#talksUpdated(repository);
      return { status: 204 };
    } else {
      return { status: 404, body: `No talk '${title}' found` };
    }
  }

  async #talksUpdated(repository) {
    this.#version++;
    let response = await this.#talkResponse(repository);
    this.#waiting.forEach((resolve) => resolve(response));
    this.#waiting = [];
  }
}
