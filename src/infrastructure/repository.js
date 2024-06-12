import fsPromise from 'node:fs/promises';
import path from 'node:path';

import { Talk } from '../../public/js/domain/talks.js';
import { Health, Status } from '../util/health.js';

export class Repository {
  static create({ fileName = './data/talks.json' } = {}) {
    return new Repository(fileName, fsPromise);
  }

  static createNull({ talks = [] } = {}) {
    return new Repository('null-repository.json', new FsStub(talks));
  }

  #fileName;
  #fs;
  #lastStored;
  #error;

  constructor(
    /** @type {string} */ fileName,
    /** @type {typeof fsPromise} */ fs,
  ) {
    this.#fileName = fileName;
    this.#fs = fs;
  }

  async findAll() {
    try {
      let talks = await this.#load();
      talks = Object.keys(talks).map((title) => Talk.create(talks[title]));
      this.#error = undefined;
      return talks;
    } catch (error) {
      this.#error = `Find all talks failed. ${error}`;
      return [];
    }
  }

  async findByTitle(title) {
    try {
      const talks = await this.#load();
      const talk = talks[title] != null ? Talk.create(talks[title]) : undefined;
      this.#error = undefined;
      return talk;
    } catch (error) {
      this.#error = `Find talk by title failed. ${error}`;
    }
  }

  async add(talk) {
    try {
      const talks = await this.#load();
      talks[talk.title] = talk;
      await this.#store(talks);
      this.#error = undefined;
    } catch (error) {
      this.#error = `Add talk failed. ${error}`;
    }
  }

  async remove(title) {
    try {
      const talks = await this.#load();
      delete talks[title];
      await this.#store(talks);
      this.#error = undefined;
    } catch (error) {
      this.#error = `Remove talk failed. ${error}`;
    }
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

      console.log(`Error loading file: ${this.#fileName}. ${error}`);
      throw error;
    }
  }

  async #store(talksMap) {
    try {
      const pathName = path.dirname(this.#fileName);
      await this.#fs.mkdir(pathName, { recursive: true });

      const json = JSON.stringify(talksMap);
      await this.#fs.writeFile(this.#fileName, json, 'utf-8');
      this.#lastStored = talksMap;
    } catch (error) {
      console.log(`Error storing file: ${this.#fileName}. ${error}`);
      throw error;
    }
  }

  get lastStored() {
    return this.#lastStored;
  }

  health() {
    if (this.#error == null) {
      return new Health(Status.UP);
    }

    return new Health(Status.DOWN, { error: this.#error });
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
