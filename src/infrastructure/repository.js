import { readFile, writeFile } from 'node:fs/promises';

export class Repository {
  #fileName;

  constructor({ fileName = './data/talks.json' } = {}) {
    this.#fileName = fileName;
  }

  async findAll() {
    try {
      const json = await readFile(this.#fileName, 'utf-8');
      return JSON.parse(json);
    } catch {
      // ignore error
      return [];
    }
  }

  async add(talk) {
    const talks = await this.findAll();
    talks.push(talk);
    const json = JSON.stringify(talks);
    await writeFile(this.#fileName, json, 'utf-8');
  }
}
