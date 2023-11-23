import {
  addComment,
  deleteTalk,
  getTalk,
  getTalks,
  submitTalk,
} from '../application/services.js';
import { Repository } from '../infrastructure/repository.js';

export class TalksController {
  #version = 0;
  #waiting = [];

  constructor({ app, repository = new Repository() } = {}) {
    this.#createRoutes(app, repository);
  }

  #createRoutes(app, repository) {
    this.#createRouteGetTalks(app, repository);
    this.#createRouteGetTalk(app, repository);
    this.#createRouteSubmitTalk(app, repository);
    this.#createRouteDeleteTalk(app, repository);
    this.#createRouteAddComment(app, repository);
  }

  #createRouteGetTalks(app, repository) {
    app.get('/api/talks', async (req, res) => {
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

  #createRouteGetTalk(app, repository) {
    app.get('/api/talks/:title', async (req, res) => {
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

  #createRouteSubmitTalk(app, repository) {
    app.put('/api/talks/:title', async (req, res) => {
      let { title } = this.#getTalkParameters(req);
      let talk = parseTalk(req.body);
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

  #createRouteDeleteTalk(app, repository) {
    app.delete('/api/talks/:title', async (req, res) => {
      let { title } = this.#getTalkParameters(req);
      await deleteTalk({ title }, repository);
      await this.#talksUpdated(repository);
      this.#reply(res, { status: 204 });
    });
  }

  #createRouteAddComment(app, repository) {
    app.post('/api/talks/:title/comments', async (req, res) => {
      let comment = parseComment(req.body);
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

function parseTalk({ presenter, summary }) {
  if (typeof presenter == 'string' && typeof summary == 'string') {
    return { presenter, summary };
  }

  return null;
}

function parseComment({ author, message }) {
  if (typeof author == 'string' && typeof message == 'string') {
    return { author, message };
  }

  return null;
}
