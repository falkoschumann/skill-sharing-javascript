import { describe, expect, test } from 'vitest';

import { LongPollingClient } from '@muspellheim/shared';

import { Api } from '../../../public/js/infrastructure/api.js';
import { Talk } from '../../../public/js/domain/talks.js';

describe.skip('API', () => {
  test('Gets talks', async () => {
    const client = LongPollingClient.createNull();
    const api = new Api(client, null);
    const events = [];
    api.addEventListener('talks-updated', (event) => events.push(event));

    await api.connectTalks();
    const talk = Talk.createTestInstance();
    await client.simulateResponse({
      status: 200,
      headers: { etag: '1' },
      body: [talk],
    });

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
