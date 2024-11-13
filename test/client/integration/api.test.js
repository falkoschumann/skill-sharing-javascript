import { describe, expect, test } from 'vitest';

import { LongPollingClient } from '@muspellheim/shared';

import { Api } from '../../../src/infrastructure/api.js';
import { Talk } from '../../../src/domain/talks.js';

describe('API', () => {
  test('Gets talks', async () => {
    const talk = Talk.createTestInstance();
    const client = LongPollingClient.createNull({
      fetchResponse: {
        status: 200,
        headers: { etag: '1' },
        body: JSON.stringify([talk]),
      },
    });
    const api = new Api(client, null);
    const events = [];
    const result = new Promise((resolve) =>
      client.addEventListener('message', () => resolve()),
    );
    api.addEventListener('talks-updated', (event) => events.push(event));

    await api.connectTalks();
    await result;

    expect(events).toEqual([
      expect.objectContaining({
        talks: [talk],
      }),
    ]);
    client.close();
  });

  test('Puts talk', async () => {
    const api = Api.createNull();
    const talksPut = api.trackTalksPut();

    await api.putTalk({
      title: 'title-1',
      presenter: 'presenter-1',
      summary: 'summary-1',
    });

    expect(talksPut.data).toEqual([
      { title: 'title-1', presenter: 'presenter-1', summary: 'summary-1' },
    ]);
  });

  test('Deletes talk', async () => {
    const api = Api.createNull();
    const talksDeleted = api.trackTalksDeleted();

    await api.deleteTalk('title-1');

    expect(talksDeleted.data).toEqual([{ title: 'title-1' }]);
  });

  test('Posts comment', async () => {
    const api = Api.createNull();
    const commentsPosted = api.trackCommentsPosted();

    await api.postComment('title-1', {
      author: 'author-1',
      message: 'message-1',
    });

    expect(commentsPosted.data).toEqual([
      { title: 'title-1', author: 'author-1', message: 'message-1' },
    ]);
  });
});
