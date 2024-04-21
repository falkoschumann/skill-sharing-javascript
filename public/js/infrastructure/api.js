import { ConfigurableResponses } from '../util/configurable-responses.js';
import { OutputTracker } from '../util/output-tracker.js';

const TALKS_UPDATED_EVENT = 'talks-updated';
const TALKS_GET_EVENT = 'talk-get';
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
    return new Api(globalThis.fetch.bind(globalThis));
  }

  static createNull({
    talks = {
      status: 200,
      headers: {},
      body: [],
    },
  } = {}) {
    return new Api(createFetchStub(talks));
  }

  #fetch;

  constructor(fetch) {
    super();
    this.#fetch = fetch;
  }

  async pollTalks(runs = -1) {
    // TODO extract polling logic to a separate class
    // TODO replace long polling with server-sent events (sent all talks on each update)
    let tag;
    let timeout = 0.5;
    while (runs === -1 || runs-- > 0) {
      try {
        const response = await this.#fetch('/api/talks', {
          headers: tag && {
            'If-None-Match': tag,
            Prefer: 'wait=90',
          },
        });

        if (response.status === 304) {
          this.dispatchEvent(
            new CustomEvent(TALKS_GET_EVENT, { detail: 'not modified' }),
          );
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        tag = response.headers.get('ETag');
        const talks = await response.json();
        this.dispatchEvent(new TalksUpdatedEvent(talks));

        timeout = 0.5;

        this.dispatchEvent(new CustomEvent(TALKS_GET_EVENT, { detail: talks }));
      } catch (error) {
        this.dispatchEvent(
          new CustomEvent(TALKS_GET_EVENT, { detail: error.message }),
        );
        timeout *= 2;
        if (timeout > 30) {
          timeout = 30;
        }
        await new Promise((resolve) => setTimeout(resolve, timeout * 1000));
      }
    }
  }

  trackTalksGet() {
    return OutputTracker.create(this, TALKS_GET_EVENT);
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

function createFetchStub(talks) {
  const responses = ConfigurableResponses.create(talks);
  return async function () {
    const response = responses.next();
    if (response instanceof Error) {
      throw response;
    }

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

  get ok() {
    return this.#status >= 200 && this.#status < 300;
  }

  get status() {
    return this.#status;
  }

  get headers() {
    return this.#headers;
  }

  json() {
    return this.#body;
  }
}
