import { ConfigurableResponses } from '../util/configurable-responses.js';

export class LongPollingClient {
  static create(timeout = 1000) {
    return new LongPollingClient(timeout, globalThis.fetch.bind(globalThis));
  }

  static createNull(
    responses = {
      status: 400,
      headers: {},
      body: null,
    },
  ) {
    return new LongPollingClient(0, createFetchStub(responses));
  }

  #timeout;
  #fetch;
  #connected = false;

  constructor(timeout, fetch) {
    this.#timeout = timeout;
    this.#fetch = fetch;
  }

  get isConnected() {
    return this.#connected;
  }

  async connect(eventListener) {
    let tag;
    this.#connected = true;
    while (this.isConnected) {
      try {
        const response = await this.#fetch('/api/talks', {
          headers: tag && {
            'If-None-Match': tag,
            Prefer: 'wait=90',
          },
        });

        if (response.status === 304) {
          continue;
        }

        if (response.status >= 400 && response.status < 500) {
          // stop polling on client errors
          break;
        }

        if (!response.ok) {
          // retry on server errors
          throw new Error(
            `HTTP error: ${response.status} ${response.statusText}`,
          );
        }

        tag = response.headers.get('ETag');
        const data = await response.json();
        eventListener(new MessageEvent('message', { data }));
      } catch (error) {
        console.error(error);
        await new Promise((resolve) => setTimeout(resolve, this.#timeout));
      }
    }
  }

  async close() {
    this.#connected = false;
  }
}

function createFetchStub(response) {
  const responses = ConfigurableResponses.create(response);
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

  async json() {
    return this.#body;
  }
}
