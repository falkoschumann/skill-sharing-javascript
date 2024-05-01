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
  #aboutController = new AbortController();
  #clientError;
  #tag;
  #eventListener;

  constructor(timeout, fetch) {
    this.#timeout = timeout;
    this.#fetch = fetch;
  }

  get isConnected() {
    return this.#connected;
  }

  async connect(eventListener) {
    this.#handleConnect(eventListener);
    while (this.isConnected && !this.#clientError) {
      try {
        const headers = this.#createHeaders();
        const response = await this.#fetch('/api/talks', { headers });
        await this.#handleResponse(response);
      } catch (error) {
        await this.#handleError(error);
      }
    }
  }

  async close() {
    this.#aboutController.abort();
    this.#connected = false;
  }

  #handleConnect(eventListener) {
    if (this.isConnected) {
      throw new Error('Already connected.');
    }

    this.#eventListener = eventListener;
    this.#connected = true;
    this.#clientError = false;
  }

  #createHeaders() {
    const headers = { signal: this.#aboutController.signal };
    if (this.#tag) {
      headers['If-None-Match'] = this.#tag;
      headers.Prefer = 'wait=90';
    }
    return headers;
  }

  async #handleResponse(response) {
    if (response.status === 304) {
      return;
    }

    if (response.status >= 400 && response.status < 500) {
      // stop polling on client errors
      this.#clientError = true;
      return;
    }

    if (!response.ok) {
      // retry on server errors
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    this.#tag = response.headers.get('ETag');
    const data = await response.json();
    this.#eventListener(new MessageEvent('message', { data }));
  }

  async #handleError(error) {
    console.error(error);
    await new Promise((resolve) => setTimeout(resolve, this.#timeout));
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
