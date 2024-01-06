import { ConfigurableResponses } from './configurable-responses.js';
import { OutputEvent, OutputTracker } from './output-tracker.js';

const TALK_DELETED_EVENT = 'talk-deleted';
const TALK_PUT_EVENT = 'talk-put';
const COMMENT_POSTED_EVENT = 'comment-posted';

export class Api {
  #baseUrl;
  #fetch;
  #eventTarget = new EventTarget();

  static create({ baseUrl = '/api' } = {}) {
    return new Api(baseUrl, globalThis.fetch.bind(globalThis));
  }

  static createNull(
    talks = {
      status: 200,
      headers: {},
      body: '[]',
      error: undefined,
    },
  ) {
    return new Api('/api', createFetchStub(talks));
  }

  constructor(baseUrl, fetch) {
    this.#baseUrl = baseUrl;
    this.#fetch = fetch;
  }

  async getTalks(tag) {
    // TODO test if tag is defined
    let response = await this.#fetch(`${this.#baseUrl}/talks`, {
      headers: tag && {
        'If-None-Match': tag,
        Prefer: 'wait=90',
      },
    });
    let isNotModified = response.status === 304;
    // TODO check if response.ok is true
    tag = response.headers.get('ETag');
    let talks = !isNotModified ? await response.json() : [];
    return { isNotModified, tag, talks };
  }

  async putTalk({ title, presenter, summary }) {
    let body = JSON.stringify({ presenter, summary });
    await this.#fetch(this.#talkUrl(title), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    this.#eventTarget.dispatchEvent(
      new OutputEvent(TALK_PUT_EVENT, { title, presenter, summary }),
    );
  }

  trackTalksPut() {
    return OutputTracker.create(this.#eventTarget, TALK_PUT_EVENT);
  }

  async deleteTalk(title) {
    await this.#fetch(this.#talkUrl(title), { method: 'DELETE' });
    this.#eventTarget.dispatchEvent(
      new OutputEvent(TALK_DELETED_EVENT, { title }),
    );
  }

  trackTalksDeleted() {
    return OutputTracker.create(this.#eventTarget, TALK_DELETED_EVENT);
  }

  async postComment(title, { author, message }) {
    let body = JSON.stringify({ author, message });
    await this.#fetch(this.#talkUrl(title) + '/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    this.#eventTarget.dispatchEvent(
      new OutputEvent(COMMENT_POSTED_EVENT, { title, author, message }),
    );
  }

  trackCommentsPosted() {
    return OutputTracker.create(this.#eventTarget, COMMENT_POSTED_EVENT);
  }

  #talkUrl(title) {
    return `${this.#baseUrl}/talks/` + encodeURIComponent(title);
  }
}

function createFetchStub(talks) {
  let responses = ConfigurableResponses.create(talks);
  return async function () {
    let response = responses.next();
    return new ResponseStub(response);
  };
}

class ResponseStub {
  #status;
  #headers;
  #body;

  constructor({ status, headers, body }) {
    this.#status = status;
    this.#headers = new Headers(headers);
    this.#body = body;
  }

  get status() {
    return this.#status;
  }

  get headers() {
    return this.#headers;
  }

  json() {
    return JSON.parse(this.#body);
  }
}
