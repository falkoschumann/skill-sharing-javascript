import { describe, expect, test } from '@jest/globals';

import { LongPollingClient } from '../../../public/js/infrastructure/long-polling-client.js';

describe('Long polling client', () => {
  test('Stops on client error', async () => {
    const client = LongPollingClient.createNull();
    const events = [];

    await client.connect((event) => events.push(event));

    expect(events).toEqual([]);
  });

  test('Connects to the server', async () => {
    const client = LongPollingClient.createNull();

    await client.connect(() => {});

    expect(client.isConnected).toBe(true);
  });

  test('Rejects multiple connections', async () => {
    const client = LongPollingClient.createNull();
    await client.connect(() => {});

    const result = client.connect(() => {});

    await expect(result).rejects.toThrow();
  });

  test('Closes the connection', async () => {
    const client = LongPollingClient.createNull();
    await client.connect(() => {});

    client.close();

    expect(client.isConnected).toBe(false);
  });

  test('Receives a message', async () => {
    const client = LongPollingClient.createNull([
      { status: 200, headers: { etag: '1' }, body: { anwser: 42 } },
      { status: 400, headers: {}, body: [] },
    ]);
    const events = [];

    await client.connect((event) => events.push(event));

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

    await client.connect((event) => events.push(event));

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

    await client.connect((event) => events.push(event));

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

    await client.connect((event) => events.push(event));

    expect(events).toEqual([
      expect.objectContaining({ data: { counter: 1 } }),
      expect.objectContaining({ data: { counter: 2 } }),
    ]);
  });
});
