import { describe, expect, test } from 'vitest';

import { SseClient } from '../../../public/js/infrastructure/see-client.js';

describe('SSE client', () => {
  test('Connects to the server', async () => {
    const client = SseClient.createNull();

    await client.connect(() => {});

    expect(client.isConnected).toBe(true);
  });

  test('Rejects multiple connections', async () => {
    const client = SseClient.createNull();
    await client.connect(() => {});

    const connectTwice = client.connect(() => {});

    expect(connectTwice).rejects.toThrow();
  });

  test('Closes the connection', async () => {
    const client = SseClient.createNull();
    await client.connect(() => {});

    client.close();

    expect(client.isConnected).toBe(false);
  });

  test('Receives a message', async () => {
    const client = SseClient.createNull();
    const events = [];
    await client.connect((event) => events.push(event));

    client.simulateMessage({ anwser: 42 });

    expect(events).toEqual([
      expect.objectContaining({
        data: { anwser: 42 },
      }),
    ]);
  });

  test('Receives a typed message', async () => {
    const client = SseClient.createNull();
    const events = [];
    await client.connect('ping', (event) => events.push(event));

    client.simulateMessage({ anwser: 42 }, 'ping');

    expect(events).toEqual([
      expect.objectContaining({
        data: { anwser: 42 },
      }),
    ]);
  });
});
