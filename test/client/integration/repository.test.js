// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

/* @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';

import { Repository } from '../../../src/infrastructure/repository.js';

describe('Repository', () => {
  it('Loads and store settings', async () => {
    const repository = Repository.create();

    await repository.store({ username: 'Alice' });
    const settings = await repository.load();

    expect(settings).toEqual({ username: 'Alice' });
  });

  it('Loads empty object when storage is empty', async () => {
    const repository = Repository.createNull();

    const settings = await repository.load();

    expect(settings).toEqual({});
  });

  it('Loads stored settings', async () => {
    const repository = Repository.createNull({ username: 'Alice' });

    const settings = await repository.load();

    expect(settings).toEqual({ username: 'Alice' });
  });

  it('Remember last stored settings', async () => {
    const repository = Repository.createNull();

    await repository.store({ username: 'Alice' });

    expect(repository.lastUser).toEqual({ username: 'Alice' });
  });
});
