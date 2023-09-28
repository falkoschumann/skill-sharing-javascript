import { readFile, writeFile } from 'node:fs/promises';

export class Repository {
  #fileName;

  constructor({ fileName = './data/talks.json' } = {}) {
    this.#fileName = fileName;
  }

  async findAll() {
    const talks = await this.#load();
    const list = [];
    for (const title of Object.keys(talks)) {
      list.push(talks[title]);
    }
    return list;
  }

  async findByTitle(title) {
    const talks = await this.#load();
    return talks[title];
  }

  async add(talk) {
    const talks = await this.#load();
    talks[talk.title] = talk;
    await this.#store(talks);
  }

  async remove(title) {
    const talks = await this.#load();
    delete talks[title];
    await this.#store(talks);
  }

  async #load() {
    try {
      const json = await readFile(this.#fileName, 'utf-8');
      return JSON.parse(json);
    } catch (e) {
      // ignore error
      return {};
    }
  }

  async #store(talksMap) {
    const json = JSON.stringify(talksMap);
    await writeFile(this.#fileName, json, 'utf-8');
  }
}
