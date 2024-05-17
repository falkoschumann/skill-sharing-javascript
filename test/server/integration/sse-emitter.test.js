import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals';

import { SseEmitter } from '../../../src/infrastructure/sse-emitter.js';

describe('SSE emitter', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  test('Initializes response', () => {
    const response = new ResponseStub();
    const emitter = SseEmitter.create({ response });

    expect(emitter.response.statusCode).toBe(200);
    expect(emitter.response.getHeader('Content-Type')).toBe(
      'text/event-stream',
    );
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
    SseEmitter.create({ response, timeout: 20000 });

    jest.advanceTimersByTime(20000);

    expect(response.finished).toBe(true);
  });

  afterEach(() => {
    jest.useRealTimers();
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
