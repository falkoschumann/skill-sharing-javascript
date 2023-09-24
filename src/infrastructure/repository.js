import { readFile, writeFile } from 'fs/promises';

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
      return [];
    }
  }

  async add(talk) {
    let json;
    let talks = [];
    try {
      json = await readFile(this.#fileName, 'utf8');
      talks = JSON.parse(json);
    } catch {
      talks = [];
    }

    talks.push(talk);
    json = JSON.stringify(talks);
    await writeFile(this.#fileName, json, 'utf-8');
  }
}
