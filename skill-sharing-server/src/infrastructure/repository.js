import { readFile, writeFile } from 'node:fs/promises';

export class AbstractRepository {
  async findAll() {
    return [];
  }

  // eslint-disable-next-line no-unused-vars
  async findByTitle(title) {
    return undefined;
  }

  // eslint-disable-next-line no-unused-vars
  async add({ title, presenter, summary, comments }) {
    return;
  }

  // eslint-disable-next-line no-unused-vars
  async remove(title) {
    return;
  }
}

export class Repository extends AbstractRepository {
  #fileName;

  constructor({ fileName = './data/talks.json' } = {}) {
    super();
    this.#fileName = fileName;
  }

  async findAll() {
    let talks = await this.#load();
    let list = [];
    for (let title of Object.keys(talks)) {
      list.push(talks[title]);
    }
    return list;
  }

  async findByTitle(title) {
    let talks = await this.#load();
    return talks[title];
  }

  async add(talk) {
    let talks = await this.#load();
    talks[talk.title] = talk;
    await this.#store(talks);
  }

  async remove(title) {
    let talks = await this.#load();
    delete talks[title];
    await this.#store(talks);
  }

  async #load() {
    try {
      let json = await readFile(this.#fileName, 'utf-8');
      return JSON.parse(json);
    } catch {
      return {};
    }
  }

  async #store(talksMap) {
    let json = JSON.stringify(talksMap);
    await writeFile(this.#fileName, json, 'utf-8');
  }
}
