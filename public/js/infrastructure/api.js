import { ConfigurableResponses } from '../util/configurable-responses.js';
import { OutputEvent, OutputTracker } from '../util/output-tracker.js';

const TALKS_UPDATED_EVENT = 'talks-updated';
const TALKS_GET_EVENT = 'talk-get';
const TALK_PUT_EVENT = 'talk-put';
const TALK_DELETED_EVENT = 'talk-deleted';
const COMMENT_POSTED_EVENT = 'comment-posted';

export class TalksUpdatedEvent extends Event {
  #talks;

  constructor(talks) {
    super(TALKS_UPDATED_EVENT);
    this.#talks = talks;
  }

  get talks() {
    return this.#talks;
  }
}

export class Api extends EventTarget {
  #baseUrl;
  #fetch;

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
    super();
    this.#baseUrl = baseUrl;
    this.#fetch = fetch;
  }

  async pollTalks(runs = -1) {
    let tag;
    let timeout = 0.5;
    while (runs === -1 || runs-- > 0) {
      try {
        let response = await this.#fetch(`${this.#baseUrl}/talks`, {
          headers: tag && {
            'If-None-Match': tag,
            Prefer: 'wait=90',
          },
        });

        if (response.status === 304) {
          this.dispatchEvent(new OutputEvent(TALKS_GET_EVENT, 'not modified'));
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        tag = response.headers.get('ETag');
        let talks = await response.json();
        this.dispatchEvent(new TalksUpdatedEvent(talks));

        timeout = 0.5;

        this.dispatchEvent(new OutputEvent(TALKS_GET_EVENT, talks));
      } catch (error) {
        this.dispatchEvent(new OutputEvent(TALKS_GET_EVENT, error.message));
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
    let body = JSON.stringify({ presenter, summary });
    await this.#fetch(this.#talkUrl(title), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    this.dispatchEvent(
      new OutputEvent(TALK_PUT_EVENT, { title, presenter, summary }),
    );
  }

  trackTalksPut() {
    return OutputTracker.create(this, TALK_PUT_EVENT);
  }

  async deleteTalk(title) {
    await this.#fetch(this.#talkUrl(title), { method: 'DELETE' });
    this.dispatchEvent(new OutputEvent(TALK_DELETED_EVENT, { title }));
  }

  trackTalksDeleted() {
    return OutputTracker.create(this, TALK_DELETED_EVENT);
  }

  async postComment(title, { author, message }) {
    let body = JSON.stringify({ author, message });
    await this.#fetch(this.#talkUrl(title) + '/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    this.dispatchEvent(
      new OutputEvent(COMMENT_POSTED_EVENT, { title, author, message }),
    );
  }

  trackCommentsPosted() {
    return OutputTracker.create(this, COMMENT_POSTED_EVENT);
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
    return JSON.parse(this.#body);
  }
}
