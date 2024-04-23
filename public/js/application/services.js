import { Api } from '../infrastructure/api.js';
import { Repository } from '../infrastructure/repository.js';

export class Services {
  static create(store) {
    return new Services(store);
  }

  static createNull(store) {
    return new Services(store, Repository.createNull(), Api.createNull());
  }

  #store;
  #repository;
  #api;

  constructor(store, repository = Repository.create(), api = Api.create()) {
    this.#store = store;
    this.#repository = repository;
    this.#api = api;
  }

  async changeUser({ username }) {
    this.#store.dispatch({ type: 'change-user', username });
    await this.#repository.store({ username });
  }

  async getUser() {
    // TODO rename to loadUser
    const { username = 'Anon' } = await this.#repository.load();
    this.#store.dispatch({ type: 'change-user', username });
  }

  async pollTalks(runs) {
    this.#api.addEventListener('talks-updated', (event) =>
      this.talksUpdated({ talks: event.talks }),
    );
    await this.#api.pollTalks(runs);
  }

  async talksUpdated({ talks }) {
    this.#store.dispatch({ type: 'talks-updated', talks });
  }

  async submitTalk({ title, summary }) {
    const presenter = this.#store.getState().user;
    const talk = { title, presenter, summary };
    await this.#api.putTalk(talk);
  }

  async deleteTalk({ title }) {
    await this.#api.deleteTalk(title);
  }

  async addComment({ title, comment }) {
    const author = this.#store.getState().user;
    await this.#api.postComment(title, {
      author,
      message: comment,
    });
  }
}
