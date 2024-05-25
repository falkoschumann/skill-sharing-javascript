import { SseEmitter } from '../infrastructure/sse-emitter.js';
import * as handler from './handler.js';
import { LongPolling } from '../infrastructure/long-polling.js';

/**
 * @typedef {import('../application/services.js').Services} Services
 * @typedef {import('express').Express} Express
 * @typedef {import('express').Response} Response
 * @typedef {import('express').Request} Request
 */

export class TalksController {
  #services;
  #longPolling;

  constructor(/** @type {Services} */ services, /** @type {Express} */ app) {
    this.#services = services;
    this.#longPolling = new LongPolling(() => this.#services.getTalks());

    app.get('/api/talks', handler.runSafe(this.#getTalks.bind(this)));
    app.get(
      '/api/talks/events',
      handler.runSafe(this.#receiveTalks.bind(this)),
    );
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

  async #getTalks(
    /** @type {Request} */ request,
    /** @type {Response} */ response,
  ) {
    if (request.headers.accept == 'text/event-stream') {
      this.#receiveTalks(request, response);
    } else {
      this.#longPolling.poll(request, response);
    }
  }

  async #receiveTalks(
    /** @type {Request} */ request,
    /** @type {Response} */ response,
  ) {
    // TODO send talks to client, when updated
    const emitter = SseEmitter.create({ response });
    const talks = await this.#services.getTalks();
    emitter.send(talks);
  }

  async #putTalk(
    /** @type {Request} */ request,
    /** @type {Response} */ response,
  ) {
    const talk = parseTalk(request);
    if (talk == null) {
      handler.reply(response, { status: 400, body: 'Bad talk data' });
    } else {
      await this.#services.submitTalk(talk);
      await this.#longPolling.send();
      handler.reply(response, { status: 204 });
    }
  }

  async #deleteTalk(
    /** @type {Request} */ request,
    /** @type {Response} */ response,
  ) {
    const title = parseTitle(request);
    await this.#services.deleteTalk({ title });
    await this.#longPolling.send();
    handler.reply(response, { status: 204 });
  }

  async #postComment(
    /** @type {Request} */ request,
    /** @type {Response} */ response,
  ) {
    const comment = parseComment(request);
    if (comment == null) {
      handler.reply(response, { status: 400, body: 'Bad comment data' });
    } else {
      const responseData = await this.#tryAddComment(comment);
      handler.reply(response, responseData);
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

function parseTitle(/** @type {Request} */ request) {
  return decodeURIComponent(request.params.title);
}

function parseTalk(/** @type {Request} */ request) {
  const title = parseTitle(request);
  const { presenter, summary } = request.body;

  if (typeof presenter == 'string' && typeof summary == 'string') {
    return { title, presenter, summary };
  }

  return null;
}

function parseComment(/** @type {Request} */ request) {
  const title = parseTitle(request);
  const { author, message } = request.body;

  if (typeof author == 'string' && typeof message == 'string') {
    return { title, comment: { author, message } };
  }

  return null;
}
