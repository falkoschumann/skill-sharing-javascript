import { describe, expect, test } from '@jest/globals';

import { SseEmitter } from '../../../src/infrastructure/sse-emitter.js';

describe('SSE emitter', () => {
  test('Initializes response', () => {
    const response = new ResponseStub();
    SseEmitter.create({ response });

    expect(response.statusCode).toBe(200);
    expect(response.getHeader('Content-Type')).toBe('text/event-stream');
  });

  test('Sends event', () => {
    const response = new ResponseStub();
    const emitter = SseEmitter.create({ response });

    emitter.send('event-data');

    expect(response.body).toBe('data: event-data\n\n');
  });

  test('Sends typed event', () => {
    const response = new ResponseStub();
    const emitter = SseEmitter.create({ response });

    emitter.send({ data: 'event-data' }, 'event-type');

    expect(response.body).toBe(
      'event: event-type\ndata: {"data":"event-data"}\n\n',
    );
  });

  test('Closes response after timeout', () => {
    const response = new ResponseStub();
    const emitter = SseEmitter.create({ response });

    emitter.simulateTimeout();

    expect(response.finished).toBe(true);
  });
});

class ResponseStub {
  body = '';
  #headers = {};

  status(code) {
    this.statusCode = code;
    return this;
  }

  setHeader(key, value) {
    this.#headers[key] = value;
    return this;
  }

  getHeader(key) {
    return this.#headers[key];
  }

  write(data) {
    this.body += data;
  }

  end() {
    this.finished = true;
  }
}
