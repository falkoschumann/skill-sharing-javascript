// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

/**
 * @import { Service } from '../application/service.js'
 * @import { Express, Response, Request } from 'express'
 */

import {
  LongPolling,
  runSafe,
  reply,
  SseEmitter,
} from '@muspellheim/shared/node';

// TODO Review code

export class TalksController {
  #services;
  #longPolling;

  constructor(/** @type {Service} */ services, /** @type {Express} */ app) {
    this.#services = services;
    this.#longPolling = new LongPolling(async () => {
      const result = await this.#services.getTalks();
      return result.talks;
    });

    app.get('/api/talks', runSafe(this.#getTalks.bind(this)));
    app.get('/api/talks/:title', runSafe(this.#getTalks.bind(this)));
    app.get('/api/talks/events', runSafe(this.#eventStreamTalks.bind(this)));
    app.put('/api/talks/:title', runSafe(this.#putTalk.bind(this)));
    app.delete('/api/talks/:title', runSafe(this.#deleteTalk.bind(this)));
    app.post(
      '/api/talks/:title/comments',
      runSafe(this.#postComment.bind(this)),
    );
  }

  async #getTalks(
    /** @type {Request} */ request,
    /** @type {Response} */ response,
  ) {
    const title = parseTitle(request);
    if (title != null) {
      const result = await this.#services.getTalks({ title });
      if (result.talks.length > 0) {
        reply(response, {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.talks[0]),
        });
      } else {
        reply(response, { status: 404, body: `Talk not found: "${title}".` });
      }
    } else if (request.headers.accept == 'text/event-stream') {
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
    const emitter = new SseEmitter();
    emitter.extendResponse(response);
    const result = await this.#services.getTalks();
    emitter.send(result.talks);
  }

  async #putTalk(
    /** @type {Request} */ request,
    /** @type {Response} */ response,
  ) {
    const talk = parseTalk(request);
    if (talk == null) {
      reply(response, { status: 400, body: 'Bad talk data' });
    } else {
      await this.#services.submitTalk(talk);
      await this.#longPolling.send();
      reply(response, { status: 204 });
    }
  }

  async #deleteTalk(
    /** @type {Request} */ request,
    /** @type {Response} */ response,
  ) {
    const title = parseTitle(request);
    await this.#services.deleteTalk({ title });
    await this.#longPolling.send();
    reply(response, { status: 204 });
  }

  async #postComment(
    /** @type {Request} */ request,
    /** @type {Response} */ response,
  ) {
    const comment = parseComment(request);
    if (comment == null) {
      reply(response, { status: 400, body: 'Bad comment data' });
    } else {
      const responseData = await this.#tryAddComment(comment);
      reply(response, responseData);
    }
  }

  async #tryAddComment({ title, comment }) {
    const status = await this.#services.addComment({ title, comment });
    if (status.isSuccess) {
      await this.#longPolling.send();
      return { status: 204 };
    } else {
      return { status: 404, body: status.errorMessage };
    }
  }
}

function parseTitle(/** @type {Request} */ request) {
  if (request.params.title == null) {
    return null;
  }

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
