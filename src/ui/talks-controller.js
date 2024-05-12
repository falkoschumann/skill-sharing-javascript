import * as handler from './handler.js';

export class TalksController {
  #services;
  #version = 0;
  #waiting = [];

  constructor(services, app) {
    this.#services = services;
    app.get('/api/talks', handler.runSafe(this.#getTalks.bind(this)));
    app.put('/api/talks/:title', handler.runSafe(this.#putTalk.bind(this)));
    app.delete(
      '/api/talks/:title',
      handler.runSafe(this.#deleteTalk.bind(this)),
    );
    app.post(
      '/api/talks/:title/comments',
      handler.runSafe(this.#postComment.bind(this)),
    );
  }

  async #getTalks(req, res) {
    // TODO extract long polling to class
    if (this.#isCurrentVersion(req)) {
      const response = await this.#tryLongPolling(req);
      handler.reply(res, response);
    } else {
      const response = await this.#talkResponse();
      handler.reply(res, response);
    }
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

  async #talkResponse() {
    const talks = await this.#services.getTalks();
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

  async #putTalk(req, res) {
    const talk = parseTalk(req);
    if (talk == null) {
      handler.reply(res, { status: 400, body: 'Bad talk data' });
    } else {
      await this.#services.submitTalk(talk);
      await this.#talksUpdated();
      handler.reply(res, { status: 204 });
    }
  }

  async #deleteTalk(req, res) {
    const title = parseTitle(req);
    await this.#services.deleteTalk({ title });
    await this.#talksUpdated();
    handler.reply(res, { status: 204 });
  }

  async #postComment(req, res) {
    const comment = parseComment(req);
    if (comment == null) {
      handler.reply(res, { status: 400, body: 'Bad comment data' });
    } else {
      const response = await this.#tryAddComment(comment);
      handler.reply(res, response);
    }
  }

  async #tryAddComment({ title, comment }) {
    const { isSuccessful } = await this.#services.addComment({
      title,
      comment,
    });
    if (isSuccessful) {
      await this.#talksUpdated();
      return { status: 204 };
    } else {
      return { status: 404, body: `No talk '${title}' found` };
    }
  }

  async #talksUpdated() {
    this.#version++;
    const response = await this.#talkResponse();
    this.#waiting.forEach((resolve) => resolve(response));
    this.#waiting = [];
  }
}

function parseTitle(req) {
  return decodeURIComponent(req.params.title);
}

function parseTalk(req) {
  const title = parseTitle(req);
  const { presenter, summary } = req.body;

  if (typeof presenter == 'string' && typeof summary == 'string') {
    return { title, presenter, summary };
  }

  return null;
}

function parseComment(req) {
  const title = parseTitle(req);
  const { author, message } = req.body;

  if (typeof author == 'string' && typeof message == 'string') {
    return { title, comment: { author, message } };
  }

  return null;
}
