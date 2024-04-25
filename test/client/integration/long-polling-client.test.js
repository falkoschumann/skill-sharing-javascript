import { describe, expect, test } from '@jest/globals';

import { LongPollingClient } from '../../../public/js/infrastructure/long-polling-client.js';

describe('Long polling client', () => {
  test('Stops on client error', async () => {
    const client = LongPollingClient.createNull();
    const events = [];
    client.addEventListener('message', (event) => events.push(event));

    await client.connect();

    expect(events).toEqual([]);
  });

  test('Receives a data', async () => {
    const client = LongPollingClient.createNull([
      { status: 200, headers: { etag: '1' }, body: { anwser: 42 } },
      { status: 400, headers: {}, body: [] },
    ]);
    const events = [];
    client.addEventListener('message', (event) => events.push(event));

    await client.connect();

    expect(events).toEqual([expect.objectContaining({ data: { anwser: 42 } })]);
  });

  test('Ignores not modified', async () => {
    const client = LongPollingClient.createNull([
      { status: 200, headers: { etag: '1' }, body: { counter: 1 } },
      { status: 304, headers: {}, body: null },
      { status: 200, headers: { etag: '2' }, body: { counter: 2 } },
      { status: 400, headers: {}, body: null },
    ]);
    const events = [];
    client.addEventListener('message', (event) => events.push(event));

    await client.connect();

    expect(events).toEqual([
      expect.objectContaining({ data: { counter: 1 } }),
      expect.objectContaining({ data: { counter: 2 } }),
    ]);
  });

  test('Recovers after server error', async () => {
    const client = LongPollingClient.createNull([
      { status: 200, headers: { etag: '1' }, body: { counter: 1 } },
      { status: 500, headers: {}, body: null },
      { status: 200, headers: { etag: '2' }, body: { counter: 2 } },
      { status: 400, headers: {}, body: null },
    ]);
    const events = [];
    client.addEventListener('message', (event) => events.push(event));

    await client.connect();

    expect(events).toEqual([
      expect.objectContaining({ data: { counter: 1 } }),
      expect.objectContaining({ data: { counter: 2 } }),
    ]);
  });

  test('Recovers after network error', async () => {
    const client = LongPollingClient.createNull([
      { status: 200, headers: { etag: '1' }, body: { counter: 1 } },
      new Error('network error'),
      { status: 200, headers: { etag: '2' }, body: { counter: 2 } },
      { status: 400, headers: {}, body: null },
    ]);
    const events = [];
    client.addEventListener('message', (event) => events.push(event));

    await client.connect();

    expect(events).toEqual([
      expect.objectContaining({ data: { counter: 1 } }),
      expect.objectContaining({ data: { counter: 2 } }),
    ]);
  });
});
