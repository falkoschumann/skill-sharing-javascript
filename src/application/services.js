import { HealthRegistry } from '@muspellheim/shared';
import { Repository } from '../infrastructure/repository.js';

// TODO handle errors

export class Services {
  static create({ healthRegistry = HealthRegistry.create() } = {}) {
    return new Services(Repository.create(), healthRegistry);
  }

  static createNull() {
    return new Services(Repository.createNull(), HealthRegistry.create());
  }

  #repository;

  constructor(
    /** @type {Repository} */ repository,
    /** @type {HealthRegistry} */ healthRegistry,
  ) {
    this.#repository = repository;

    healthRegistry.register('repository', repository);
  }

  async getTalks() {
    return await this.#repository.findAll();
  }

  async submitTalk({ title, presenter, summary }) {
    const talk = { title, presenter, summary, comments: [] };
    await this.#repository.add(talk);
  }

  async deleteTalk({ title }) {
    await this.#repository.remove(title);
  }

  async addComment({ title, comment: { author, message } }) {
    const talk = await this.#repository.findByTitle(title);
    if (talk == null) {
      return { isSuccessful: false };
    }

    talk.comments.push({ author, message });
    await this.#repository.add(talk);
    return { isSuccessful: true };
  }

  async getMetrics() {
    let talksCount = 0;
    let commentsCount = 0;
    const presenters = new Set();

    for (const talk of await this.#repository.findAll()) {
      talksCount++;
      presenters.add(talk.presenter);
      commentsCount += talk.comments.length;
    }

    return { talksCount, presentersCount: presenters.size, commentsCount };
  }
}
