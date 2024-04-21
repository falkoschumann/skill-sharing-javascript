import express from 'express';

import * as services from '../application/services.js';
import { Repository } from '../infrastructure/repository.js';

export class TalksController {
  static create({ app = express(), repository = Repository.create() } = {}) {
    return new TalksController(app, repository);
  }

  #version = 0;
  #waiting = [];

  constructor(app, repository) {
    this.#createRouteGetTalks(app, repository);
    this.#createRouteGetTalk(app, repository);
    this.#createRoutePutTalk(app, repository);
    this.#createRouteDeleteTalk(app, repository);
    this.#createRoutePostComment(app, repository);
  }

  #createRouteGetTalks(app, repository) {
    app.get('/api/talks', async (req, res) => {
      if (this.#isCurrentVersion(req)) {
        const response = await this.#tryLongPolling(req);
        this.#reply(res, response);
      } else {
        const response = await this.#talkResponse(repository);
        this.#reply(res, response);
      }
    });
  }

  #isCurrentVersion(req) {
    const tag = /"(.*)"/.exec(req.get('If-None-Match'));
    return tag && tag[1] === String(this.#version);
  }

  async #tryLongPolling(req) {
    const time = this.#getPollingTime(req);
    if (time == null) {
      return { status: 304 };
    }

    return this.#waitForChange(time);
  }

  #getPollingTime(req) {
    const wait = /\bwait=(\d+)/.exec(req.get('Prefer'));
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
    const talks = await services.getTalks(repository);
    const body = JSON.stringify(talks);
    return {
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
      const title = decodeURIComponent(req.params.title);
      const talk = await services.getTalk({ title }, repository);
      if (talk == null) {
        this.#reply(res, { status: 404, body: `No talk '${title}' found` });
      } else {
        this.#reply(res, {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(talk),
        });
      }
    });
  }

  #createRoutePutTalk(app, repository) {
    app.put('/api/talks/:title', async (req, res) => {
      const title = decodeURIComponent(req.params.title);
      const talk = parseTalk(req.body);
      if (talk == null) {
        this.#reply(res, { status: 400, body: 'Bad talk data' });
      } else {
        await services.submitTalk(
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
      const title = decodeURIComponent(req.params.title);
      await services.deleteTalk({ title }, repository);
      await this.#talksUpdated(repository);
      this.#reply(res, { status: 204 });
    });
  }

  #createRoutePostComment(app, repository) {
    app.post('/api/talks/:title/comments', async (req, res) => {
      const comment = parseComment(req.body);
      if (comment == null) {
        this.#reply(res, { status: 400, body: 'Bad comment data' });
      } else {
        const title = decodeURIComponent(req.params.title);
        const response = await this.#tryAddComment(
          { title, comment },
          repository,
        );
        this.#reply(res, response);
      }
    });
  }

  async #tryAddComment({ title, comment }, repository) {
    const success = await services.addComment({ title, comment }, repository);
    if (success) {
      await this.#talksUpdated(repository);
      return { status: 204 };
    } else {
      return { status: 404, body: `No talk '${title}' found` };
    }
  }

  async #talksUpdated(repository) {
    this.#version++;
    const response = await this.#talkResponse(repository);
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
