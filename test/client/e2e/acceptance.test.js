import fs from 'node:fs/promises';
import puppeteer from 'puppeteer';
import { describe, expect, test } from 'vitest';

import { Application } from '../../../lib/ui/application.js';

/**
 * @import { Browser, Page } from 'puppeteer'
 */

describe('User Acceptance Tests', () => {
  test('Submit and comment a talk', async () => {
    await startAndStop(async (browser) => {
      const app = new SkillSharing(browser);
      await app.gotoSubmission();
      await app.setViewport({ width: 800, height: 1024 });
      await app.saveScreenshot({ name: '01-app-started' });

      await app.submitTalk({ title: 'Foobar', summary: 'Lorem ipsum' });
      await app.saveScreenshot({ name: '02-talk-submitted' });
      await app.verifyTalkAdded({ title: 'Foobar', summary: 'Lorem ipsum' });

      await app.changeUser({ name: 'Bob' });
      await app.commentOnTalk({ comment: 'Amazing!' });
      await app.saveScreenshot({ name: '03-talk-commented' });
      await app.verifyCommentAdded({ author: 'Bob', comment: 'Amazing!' });

      await app.changeUser({ name: 'Anon' });
      await app.commentOnTalk({ comment: 'Thanks.' });
      await app.saveScreenshot({ name: '04-comment-answered' });
      await app.verifyCommentAdded({ author: 'Anon', comment: 'Thanks.' });
    });
  });
});

async function startAndStop(fn) {
  const talksFile = new URL('../../../data/talks.json', import.meta.url)
    .pathname;
  const screenshotsDir = new URL('../../../screenshots', import.meta.url)
    .pathname;
  let application;
  let browser;
  try {
    await fs.mkdir(screenshotsDir, { recursive: true });
    await fs.rm(talksFile, { force: true });

    application = Application.create();
    await application.start({ port: 3333 });
    // FIXME https://pptr.dev/troubleshooting#setting-up-chrome-linux-sandbox
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    await fn(browser);
  } finally {
    await browser?.close();
    // FIXME stop server safely
    // without await open handles are not closed
    // with await the test causes a timeout
    application?.stop();
  }
}

class SkillSharing {
  #browser;
  /** @type {Page} */ #page;

  constructor(/** @type {Browser} */ browser) {
    this.#browser = browser;
  }

  async setViewport({ width, height }) {
    await this.#page.setViewport({ width, height });
  }

  async saveScreenshot({ name }) {
    await this.#page.screenshot({ path: `screenshots/${name}.png` });
  }

  async gotoSubmission() {
    this.#page = await this.#browser.newPage();
    await this.#page.goto('http://localhost:3333');
  }

  async changeUser({ name }) {
    const usernameInput = await this.#page.waitForSelector(
      's-user-field input[name="username"]',
    );
    await usernameInput.evaluate((node) => (node.value = ''));
    await usernameInput.type(name);
  }

  async submitTalk({ title, summary }) {
    const titleInput = await this.#page.waitForSelector(
      's-talk-form input[name="title"]',
    );
    await titleInput.type(title);

    const summaryInput = await this.#page.waitForSelector(
      's-talk-form textarea[name="summary"]',
    );
    await summaryInput.type(summary);

    const submitButton = await this.#page.waitForSelector(
      's-talk-form button[type="submit"]',
    );
    await submitButton.click();
  }

  async commentOnTalk({ comment }) {
    const commentInput = await this.#page.waitForSelector(
      's-talks input[name="comment"]',
    );
    await commentInput.type(comment);

    const submitButton = await this.#page.waitForSelector(
      's-talks button[type="submit"]',
    );
    await submitButton.click();
  }

  async verifyTalkAdded({ title, summary }) {
    const lastTalkTitle = await this.#page.waitForSelector(
      's-talks section.talk:last-child h2',
    );
    expect(await lastTalkTitle.evaluate((node) => node.textContent)).toContain(
      title,
    );

    const lastTalkSummary = await this.#page.waitForSelector(
      's-talks section.talk:last-child p',
    );
    expect(
      await lastTalkSummary.evaluate((node) => node.textContent),
    ).toContain(summary);
  }

  async verifyCommentAdded({ author, comment }) {
    const lastTalksCommentElement = await this.#page.waitForSelector(
      's-talks section.talk:last-child .comment:last-child',
    );
    const lastTalksComment = await lastTalksCommentElement.evaluate(
      (node) => node.textContent,
    );
    expect(lastTalksComment).toContain(author);
    expect(lastTalksComment).toContain(comment);
  }
}
