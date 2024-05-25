export class LongPollingClient {
  static create({ timeout = 1000 } = {}) {
    return new LongPollingClient(timeout, globalThis.fetch.bind(globalThis));
  }

  static createNull() {
    return new LongPollingClient(0, fetchStub);
  }

  #timeout;
  #fetch;
  #connected = false;
  #aboutController = new AbortController();
  #tag;
  #eventListener;

  constructor(
    /** @type {number} */ timeout,
    /** @type {typeof globalThis.fetch} */ fetch,
  ) {
    this.#timeout = timeout;
    this.#fetch = fetch;
  }

  get isConnected() {
    return this.#connected;
  }

  async connect(eventListener) {
    this.#handleConnect(eventListener);
    new Promise((resolve) => {
      (async () => {
        while (this.isConnected) {
          try {
            const headers = this.#createHeaders();
            const response = await this.#fetch('/api/talks', { headers });
            await this.#handleResponse(response);
          } catch (error) {
            await this.#handleError(error);
          }
        }
        resolve();
      })();
    });
  }

  async close() {
    this.#aboutController.abort();
    this.#connected = false;
  }

  simulateConnected(eventListener) {
    this.#handleConnect(eventListener);
  }

  async simulateResponse({ status, headers, body }) {
    await this.#handleResponse(new ResponseStub({ status, headers, body }));
  }

  simulateError(error) {
    this.#handleError(error);
  }

  #handleConnect(eventListener) {
    if (this.isConnected) {
      throw new Error('Already connected.');
    }

    this.#eventListener = eventListener;
    this.#connected = true;
  }

  #createHeaders() {
    const headers = { signal: this.#aboutController.signal };
    if (this.#tag) {
      headers['If-None-Match'] = this.#tag;
      headers.Prefer = 'wait=90';
    }
    return headers;
  }

  async #handleResponse(/** @type {Response} */ response) {
    if (response.status === 304) {
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

async function fetchStub(url, options) {
  await new Promise((resolve, reject) => {
    options?.signal?.addEventListener('abort', () => reject());
  });
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
