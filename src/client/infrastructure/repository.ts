export class Repository {
  #key: string;

  constructor({ key = 'userName' } = {}) {
    this.#key = key;
  }

  async load(): Promise<string | null> {
    return localStorage.getItem(this.#key);
  }

  async store(userName: string): Promise<void> {
    localStorage.setItem(this.#key, userName);
  }
}
