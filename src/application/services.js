import { Repository } from '../infrastructure/repository.js';

export class Services {
  static create() {
    return new Services(Repository.create());
  }

  static createNull() {
    return new Services(Repository.createNull());
  }

  #repository;

  constructor(repository) {
    this.#repository = repository;
  }

  async getTalks() {
    return await this.#repository.findAll();
  }

  async getTalk({ title }) {
    return await this.#repository.findByTitle(title);
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
}
