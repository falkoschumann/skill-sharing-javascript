import * as handler from './handler.js';
import { LongPolling } from './long-polling.js';

export class TalksController {
  #services;
  #longPolling;

  constructor(services, app) {
    this.#services = services;
    this.#longPolling = new LongPolling(() => this.#services.getTalks());

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
    this.#longPolling.poll(req, res);
  }

  async #putTalk(req, res) {
    const talk = parseTalk(req);
    if (talk == null) {
      handler.reply(res, { status: 400, body: 'Bad talk data' });
    } else {
      await this.#services.submitTalk(talk);
      await this.#longPolling.send();
      handler.reply(res, { status: 204 });
    }
  }

  async #deleteTalk(req, res) {
    const title = parseTitle(req);
    await this.#services.deleteTalk({ title });
    await this.#longPolling.send();
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
      await this.#longPolling.send();
      return { status: 204 };
    } else {
      return { status: 404, body: `No talk '${title}' found` };
    }
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
