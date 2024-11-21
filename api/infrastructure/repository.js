// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import fsPromise from 'node:fs/promises';
import path from 'node:path';

import { Talk } from '../../shared/talks.js';

export class RepositoryConfiguration {
  /**
   * @param {Partial<RepositoryConfiguration>} [configuration]
   */
  static create({ fileName = './data/talks.json' } = {}) {
    return new RepositoryConfiguration(fileName);
  }

  /**
   * @param {string} fileName
   */
  constructor(fileName) {
    this.fileName = fileName;
  }
}

export class Repository {
  static create(configuration = RepositoryConfiguration.create()) {
    return new Repository(configuration, fsPromise);
  }

  static createNull(/** @type {{talks: Talk[]}} */ { talks } = {}) {
    return new Repository(
      RepositoryConfiguration.create({ fileName: 'null-repository.json' }),
      new FsStub(talks),
    );
  }

  #configuration;
  #fs;

  constructor(
    /** @type {RepositoryConfiguration} */ configuration,
    /** @type {typeof fsPromise} */ fs,
  ) {
    this.#configuration = configuration;
    this.#fs = fs;
  }

  async findAll() {
    const talks = await this.#load();
    return Object.values(talks).map((talk) => Talk.create(talk));
  }

  async findByTitle(title) {
    const talks = await this.#load();
    const talk = talks[title];
    if (talk == null) {
      return;
    }

    return Talk.create(talk);
  }

  async addOrUpdate(talk) {
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
      const json = await this.#fs.readFile(
        this.#configuration.fileName,
        'utf-8',
      );
      return JSON.parse(json);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // No such file or directory
        return {};
      }

      throw error;
    }
  }

  async #store(talksMap) {
    const dirName = path.dirname(this.#configuration.fileName);
    await this.#fs.mkdir(dirName, { recursive: true });

    const json = JSON.stringify(talksMap);
    await this.#fs.writeFile(this.#configuration.fileName, json, 'utf-8');
  }
}

class FsStub {
  #fileContent;

  constructor(talks) {
    if (talks == null) {
      return;
    }

    const mappedTalks = {};
    for (const talk of talks) {
      mappedTalks[talk.title] = talk;
    }
    this.#fileContent = JSON.stringify(mappedTalks);
  }

  readFile() {
    if (this.#fileContent === undefined) {
      const err = new Error('No such file or directory');
      err.code = 'ENOENT';
      throw err;
    }

    return this.#fileContent;
  }

  writeFile(_file, fileContent) {
    this.#fileContent = fileContent;
  }

  mkdir() {}
}
