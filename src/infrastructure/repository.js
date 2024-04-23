import fsPromise from 'node:fs/promises';
import path from 'node:path';

export class Repository {
  static create() {
    return new Repository('./data/talks.json');
  }

  static createNull({talks = []}={}) {
    return new Repository('nulled-file-name.json', new FsStub(talks));
  }

  #fileName;
  #fs;
  #lastStored;

  constructor(fileName, fs = fsPromise) {
    this.#fileName = fileName;
    this.#fs = fs;
  }

  async findAll() {
    const talks = await this.#load();
    return Object.keys(talks).map((title) => talks[title]);
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
      const json = await this.#fs.readFile(this.#fileName, 'utf-8');
      const mappedTalks = JSON.parse(json);
      return mappedTalks;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {};
      }

      throw error;
    }
  }

  async #store(talksMap) {
    const pathName = path.dirname(this.#fileName);
    await this.#fs.mkdir(pathName, { recursive: true });

    const json = JSON.stringify(talksMap);
    await this.#fs.writeFile(this.#fileName, json, 'utf-8');
    this.#lastStored = json;
  }

  get lastStored() {
    if (this.#lastStored == null) {
      return undefined;
    }

    return JSON.parse(this.#lastStored);
  }
}

class FsStub {
  #content;

  constructor(talks) {
    const mappedTalks = {};
    for (const talk of talks) {
      mappedTalks[talk.title] = talk;
    }
    this.#content = JSON.stringify(mappedTalks);
  }

  async readFile() {
    return this.#content;
  }

  async writeFile() {}

  async mkdir() {}
}
