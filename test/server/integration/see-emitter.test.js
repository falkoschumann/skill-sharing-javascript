import { describe, expect, test } from '@jest/globals';
import { SseEmitter } from '../../../src/infrastructure/sse-emitter.js';

describe('SSE emitter', () => {
  test('Send a data-only message', () => {
    const emitter = new SseEmitter();
    const response = new ServerResponseStub();
    emitter.extendReponse(response);

    emitter.send('This is a message');

    expect(response.output).toEqual('data: This is a message\n\n');
  });

  test('Send a named event', () => {
    const emitter = new SseEmitter();
    const response = new ServerResponseStub();
    emitter.extendReponse(response);

    emitter.send({ answer: 42 }, 'ping');

    expect(response.output).toEqual('event: ping\ndata: {"answer":42}\n\n');
  });
});

class ServerResponseStub {
  #output = '';

  write(chunk) {
    this.#output += chunk;
  }

  get output() {
    return this.#output;
  }
}
