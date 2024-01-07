import fs from 'node:fs';
import path from 'node:path';

export class Repository {
  #fileName;
  #fs;
  #path;
  #lastStored;

  static create({ fileName = './data/talks.json' } = {}) {
    return new Repository(fileName, fs, path);
  }

  static createNull(talks = []) {
    let mappedTalks = {};
    for (let talk of talks) {
      mappedTalks[talk.title] = talk;
    }
    let stored = JSON.stringify(mappedTalks);
    return new Repository(
      'nulled-file-name.json',
      new FsStub(stored),
      new PathStub(),
    );
  }

  constructor(fileName, fs, path) {
    this.#fileName = fileName;
    this.#fs = fs;
    this.#path = path;
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
      let json = this.#fs.readFileSync(this.#fileName, 'utf-8');
      return JSON.parse(json);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {};
      }
      throw error;
    }
  }

  async #store(talksMap) {
    let dir = this.#path.dirname(this.#fileName);
    if (!this.#fs.existsSync(dir)) {
      this.#fs.mkdirSync(dir);
    }

    let json = JSON.stringify(talksMap);
    this.#fs.writeFileSync(this.#fileName, json, 'utf-8');
    this.#lastStored = json;
  }

  get lastStored() {
    if (this.#lastStored != null) {
      return JSON.parse(this.#lastStored);
    }

    return this.#lastStored;
  }
}

class FsStub {
  #fileContent;

  constructor(fileContent) {
    this.#fileContent = fileContent;
  }

  readFileSync() {
    return this.#fileContent;
  }

  writeFileSync() {}

  existsSync() {
    return true;
  }

  mkdirSync() {}
}

class PathStub {
  dirname() {
    return 'nulled-dirname';
  }
}
