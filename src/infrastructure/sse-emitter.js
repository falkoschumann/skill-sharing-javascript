export class SseEmitter {
  static create({ response, timeout } = {}) {
    return new SseEmitter(response, timeout);
  }

  #response;

  constructor(response, timeout) {
    this.#response = response
      .status(200)
      .setHeader('Content-Type', 'text/event-stream')
      .setHeader('Keep-Alive', `timeout=60`)
      .setHeader('Connection', 'keep-alive');

    if (timeout != null) {
      setTimeout(() => this.#close(), timeout);
    }
  }

  simulateTimeout() {
    this.#close();
  }

  send(/** @type {object|string} */ data, /** @type {string} */ event) {
    if (event != null) {
      this.#response.write(`event: ${event}\n`);
    }
    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }
    this.#response.write(`data: ${data}\n`);
    this.#response.write('\n');
  }

  #close() {
    this.#response.end();
  }
}
