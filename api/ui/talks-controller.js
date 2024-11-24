// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

/**
 * @import { Service } from '../application/service.js'
 * @import express from 'express'
 */

import {
  LongPolling,
  runSafe,
  reply,
  SseEmitter,
} from '@muspellheim/shared/node';
import {
  AddCommentCommand,
  DeleteTalkCommand,
  SubmitTalkCommand,
  TalksQuery,
} from '../../shared/messages.js';

export class TalksController {
  #services;
  #longPolling;

  /**
   * @param {Service} services
   * @param {express.Express}  app
   */
  constructor(services, app) {
    this.#services = services;
    // TODO Align long polling with SSE emitter
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

  /**
   * @param {express.Request} request
   * @param {express.Response} response
   */
  async #getTalks(request, response) {
    const query = parseTalksQuery(request);
    if (query.title != null) {
      const result = await this.#services.getTalks(query);
      if (result.talks.length > 0) {
        reply(response, {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.talks[0]),
        });
      } else {
        reply(response, {
          status: 404,
          body: `Talk not found: "${query.title}".`,
        });
      }
    } else if (request.headers.accept == 'text/event-stream') {
      this.#eventStreamTalks(request, response);
    } else {
      this.#longPolling.poll(request, response);
    }
  }

  /**
   * @param {express.Request} request
   * @param {express.Response} response
   */
  async #eventStreamTalks(request, response) {
    // TODO send talks to client when updated
    const emitter = new SseEmitter();
    emitter.extendResponse(response);
    const result = await this.#services.getTalks();
    emitter.send(result.talks);
  }

  /**
   * @param {express.Request} request
   * @param {express.Response} response
   */
  async #putTalk(request, response) {
    const command = parseSubmitTalkCommand(request);
    if (command != null) {
      await this.#services.submitTalk(command);
      await this.#longPolling.send();
      reply(response, { status: 204 });
    } else {
      reply(response, { status: 400, body: 'Bad submit talk command.' });
    }
  }

  /**
   * @param {express.Request} request
   * @param {express.Response} response
   */
  async #deleteTalk(request, response) {
    const command = parseDeleteTalkCommand(request);
    await this.#services.deleteTalk(command);
    await this.#longPolling.send();
    reply(response, { status: 204 });
  }

  /**
   * @param {express.Request} request
   * @param {express.Response} response
   */
  async #postComment(request, response) {
    const command = parseAddCommentCommand(request);
    if (command != null) {
      const status = await this.#services.addComment(command);
      if (status.isSuccess) {
        await this.#longPolling.send();
        reply(response, { status: 204 });
      } else {
        reply(response, { status: 404, body: status.errorMessage });
      }
    } else {
      reply(response, { status: 400, body: 'Bad add comment command.' });
    }
  }
}

/**
 * @param {express.Request} request
 */
function parseTalksQuery(request) {
  if (request.params.title == null) {
    return TalksQuery.create();
  }

  const title = decodeURIComponent(request.params.title);
  return TalksQuery.create({ title });
}

/**
 * @param {express.Request} request
 */
function parseSubmitTalkCommand(request) {
  const title = decodeURIComponent(request.params.title);
  const { presenter, summary } = request.body;
  if (typeof presenter == 'string' && typeof summary == 'string') {
    return SubmitTalkCommand.create({ title, presenter, summary });
  }

  return null;
}

/**
 * @param {express.Request} request
 */
function parseDeleteTalkCommand(request) {
  const title = decodeURIComponent(request.params.title);
  return DeleteTalkCommand.create({ title });
}

/**
 * @param {express.Request} request
 */
function parseAddCommentCommand(request) {
  const title = decodeURIComponent(request.params.title);
  const { author, message } = request.body;
  if (typeof author == 'string' && typeof message == 'string') {
    return AddCommentCommand.create({ title, comment: { author, message } });
  }

  return null;
}
