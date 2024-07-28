/**
 * @import { Response } from 'express'
 */

export class SseEmitter {
  static create({ response, timeout } = {}) {
    return new SseEmitter(response, timeout);
  }

  #response;
  #timeoutId;

  constructor(
    /** @type {Response} */ response,
    /** @type {?number} */ timeout,
  ) {
    this.#response = response
      .status(200)
      .setHeader('Content-Type', 'text/event-stream')
      .setHeader('Keep-Alive', `timeout=60`)
      .setHeader('Connection', 'keep-alive');

    this.#response.addListener('close', () => clearTimeout(this.#timeoutId));
    if (timeout != null) {
      this.#timeoutId = setTimeout(() => this.#close(), timeout);
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
