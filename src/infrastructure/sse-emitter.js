export class SseEmitter {
  static create({ response, timeout } = {}) {
    return new SseEmitter(response, timeout);
  }

  constructor(response, timeout) {
    this.response = response
      .status(200)
      .setHeader('Content-Type', 'text/event-stream')
      .setHeader('Keep-Alive', `timeout=60`)
      .setHeader('Connection', 'keep-alive');

    if (timeout != null) {
      setTimeout(() => response.end(), timeout);
    }
  }

  send(/** @type {object|string} */ data, /** @type {string} */ event) {
    if (event != null) {
      this.response.write(`event: ${event}\n`);
    }
    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }
    this.response.write(`data: ${data}\n`);
    this.response.write('\n');
  }
}
