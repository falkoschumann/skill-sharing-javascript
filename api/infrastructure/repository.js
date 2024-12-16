// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import fsPromise from 'node:fs/promises';
import path from 'node:path';

import { Talk } from '../../shared/talks.js';

export class RepositoryConfiguration {
  /**
   * @param {RepositoryConfiguration} [configuration]
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

  /**
   * @param {{talks?: Talk[]}} options
   */
  static createNull({ talks } = {}) {
    return new Repository(
      RepositoryConfiguration.create({ fileName: 'null-repository.json' }),
      // @ts-ignore
      new FsStub(talks),
    );
  }

  #configuration;
  #fs;

  /**
   * @param {RepositoryConfiguration} configuration
   * @param {typeof fsPromise} fs
   */
  constructor(configuration, fs) {
    this.#configuration = configuration;
    this.#fs = fs;
  }

  async findAll() {
    const mappedTalks = await this.#load();
    return unmapTalks(mappedTalks);
  }

  /**
   * @param {string} title
   */
  async findByTitle(title) {
    const talks = await this.#load();
    const talk = talks[title];
    if (talk == null) {
      return;
    }

    return Talk.create(talk);
  }

  /**
   * @param {Talk} talk
   */
  async addOrUpdate(talk) {
    const talks = await this.#load();
    talks[talk.title] = talk;
    await this.#store(talks);
  }

  /**
   * @param {string} title
   */
  async remove(title) {
    const talks = await this.#load();
    delete talks[title];
    await this.#store(talks);
  }

  /**
   * @returns {Promise<Record<string, Talk>>}
   */
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

  /**
   * @param {Record<string, Talk>} talksMap
   */
  async #store(talksMap) {
    const dirName = path.dirname(this.#configuration.fileName);
    await this.#fs.mkdir(dirName, { recursive: true });

    const json = JSON.stringify(talksMap);
    await this.#fs.writeFile(this.#configuration.fileName, json, 'utf-8');
  }
}

class FsStub {
  #fileContent;

  /**
   * @param {Talk[]} [talks=]
   */
  constructor(talks) {
    if (talks != null) {
      const mappedTalks = mapTalks(talks);
      this.#fileContent = JSON.stringify(mappedTalks);
    }
  }

  readFile() {
    if (this.#fileContent == null) {
      const err = new Error('No such file or directory');
      // @ts-ignore NodeJS error code
      err.code = 'ENOENT';
      throw err;
    }

    return this.#fileContent;
  }

  writeFile(_file, data) {
    this.#fileContent = data;
  }

  mkdir() {}
}

/**
 * @param {Talk[]} talks
 */
function mapTalks(talks) {
  /** @type {Record<string, Talk>} */
  const mappedTalks = {};
  for (const talk of talks) {
    mappedTalks[talk.title] = talk;
  }
  return mappedTalks;
}

/**
 * @param {Record<string, Talk>} talksMap
 */
function unmapTalks(talksMap) {
  return Object.values(talksMap).map((talk) => Talk.create(talk));
}
