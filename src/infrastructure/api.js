// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

/**
 * @import { MessageClient } from '@muspellheim/shared'
 */

import { LongPollingClient, OutputTracker } from '@muspellheim/shared';

import { Talk } from '../../shared/talks.js';

const TALKS_UPDATED_EVENT = 'talks-updated';
const TALK_PUT_EVENT = 'talk-put';
const TALK_DELETED_EVENT = 'talk-deleted';
const COMMENT_POSTED_EVENT = 'comment-posted';

export class TalksUpdatedEvent extends Event {
  constructor(talks) {
    super(TALKS_UPDATED_EVENT);
    this.talks = talks;
  }
}

export class Api extends EventTarget {
  static create() {
    return new Api(
      LongPollingClient.create(),
      globalThis.fetch.bind(globalThis),
    );
  }

  static createNull() {
    return new Api(LongPollingClient.createNull(), fetchStub);
  }

  #talksClient;
  #fetch;

  /**
   * @param {MessageClient} talksClient
   * @param {typeof globalThis.fetch} fetch
   */
  constructor(talksClient, fetch) {
    super();
    this.#talksClient = talksClient;
    this.#fetch = fetch;

    this.#talksClient.addEventListener('message', (event) => {
      const dtos = JSON.parse(event.data);
      const talks = dtos.map((dto) => Talk.create(dto));
      this.dispatchEvent(new TalksUpdatedEvent(talks));
    });
  }

  async connectTalks() {
    await this.#talksClient.connect('/api/talks');
  }

  async putTalk({ title, presenter, summary }) {
    const body = JSON.stringify({ presenter, summary });
    await this.#fetch(`/api/talks/${encodeURIComponent(title)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    this.dispatchEvent(
      new CustomEvent(TALK_PUT_EVENT, {
        detail: { title, presenter, summary },
      }),
    );
  }

  trackTalksPut() {
    return OutputTracker.create(this, TALK_PUT_EVENT);
  }

  async deleteTalk(title) {
    await this.#fetch(`/api/talks/${encodeURIComponent(title)}`, {
      method: 'DELETE',
    });
    this.dispatchEvent(
      new CustomEvent(TALK_DELETED_EVENT, { detail: { title } }),
    );
  }

  trackTalksDeleted() {
    return OutputTracker.create(this, TALK_DELETED_EVENT);
  }

  async postComment(title, { author, message }) {
    const body = JSON.stringify({ author, message });
    await this.#fetch(`/api/talks/${encodeURIComponent(title)}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    this.dispatchEvent(
      new CustomEvent(COMMENT_POSTED_EVENT, {
        detail: { title, author, message },
      }),
    );
  }

  trackCommentsPosted() {
    return OutputTracker.create(this, COMMENT_POSTED_EVENT);
  }
}

async function fetchStub() {}
