import fs from 'node:fs';
import path from 'node:path';

export class Repository {
  static create({ fileName = './data/talks.json' } = {}) {
    return new Repository(fileName, fs, path);
  }

  static createNull(talks = []) {
    return new Repository(
      'null-file-name.json',
      new FsStub(talks),
      new PathStub(),
    );
  }

  #fileName;
  #fs;
  #path;
  #lastStored;

  constructor(fileName, fs, path) {
    this.#fileName = fileName;
    this.#fs = fs;
    this.#path = path;
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
      const json = this.#fs.readFileSync(this.#fileName, 'utf-8');
      return JSON.parse(json);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {};
      }

      throw error;
    }
  }

  async #store(talksMap) {
    const dir = this.#path.dirname(this.#fileName);
    if (!this.#fs.existsSync(dir)) {
      this.#fs.mkdirSync(dir);
    }

    const json = JSON.stringify(talksMap);
    this.#fs.writeFileSync(this.#fileName, json, 'utf-8');
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

  readFileSync() {
    return this.#content;
  }

  writeFileSync() {}

  existsSync() {
    return false;
  }

  mkdirSync() {}
}

class PathStub {
  dirname() {
    return 'nulled-dirname';
  }
}
