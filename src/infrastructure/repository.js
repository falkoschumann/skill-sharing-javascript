import { readFile, writeFile } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export class Repository {
  #fileName;

  constructor({ fileName = './data/talks.json' } = {}) {
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
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {};
      }
      throw error;
    }
  }

  async #store(talksMap) {
    let dir = dirname(this.#fileName);
    if (!existsSync(dir)) {
      mkdirSync(dir);
    }

    let json = JSON.stringify(talksMap);
    await writeFile(this.#fileName, json, 'utf-8');
  }
}
