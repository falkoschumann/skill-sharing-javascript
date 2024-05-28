/**
 * @vitest-environment jsdom
 */

import { describe, expect, test } from 'vitest';
import { Repository } from '../../../public/js/infrastructure/repository.js';

describe('Repository', () => {
  test('Loads and store settings', async () => {
    const repository = Repository.create();

    await repository.store({ username: 'Alice' });
    const settings = await repository.load();

    expect(settings).toEqual({ username: 'Alice' });
  });

  test('Loads empty object if storage is empty', async () => {
    const repository = Repository.createNull();

    const settings = await repository.load();

    expect(settings).toEqual({});
  });

  test('Loads stored settings', async () => {
    const repository = Repository.createNull({ username: 'Alice' });

    const settings = await repository.load();

    expect(settings).toEqual({ username: 'Alice' });
  });

  test('Remember last stored settings', async () => {
    const repository = Repository.createNull();

    await repository.store({ username: 'Alice' });

    expect(repository.lastUser).toEqual({ username: 'Alice' });
  });
});
