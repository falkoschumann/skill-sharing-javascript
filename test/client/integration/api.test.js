import { describe, expect, test } from '@jest/globals';
import { Api } from '../../../public/js/infrastructure/api.js';

describe('Api', () => {
  test.todo('Get talks events');

  test('Put talk', async () => {
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

  test('Delete talk', async () => {
    const api = Api.createNull();
    const talksDeleted = api.trackTalksDeleted();

    await api.deleteTalk('title-1');

    expect(talksDeleted.data).toEqual([{ title: 'title-1' }]);
  });

  test('Post comment', async () => {
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
