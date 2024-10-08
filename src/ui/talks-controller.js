import { LongPolling } from '@muspellheim/shared/lib/express/long-polling.js';
import { SseEmitter } from '@muspellheim/shared/lib/express/sse-emitter.js';

import * as handler from './handler.js';

/**
 * @import { Services } from '../application/services.js'
 * @import { Express, Response, Request } from 'express'
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
      handler.runSafe(this.#eventStreamTalks.bind(this)),
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
      this.#eventStreamTalks(request, response);
    } else {
      this.#longPolling.poll(request, response);
    }
  }

  async #eventStreamTalks(
    /** @type {Request} */ request,
    /** @type {Response} */ response,
  ) {
    // TODO send talks to client, when updated
    const emitter = SseEmitter.create({
      response,
      // TODO activate timeout and fix open handle
      // timeout: 5 * 60 * 1000, // 5 min
    });
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
