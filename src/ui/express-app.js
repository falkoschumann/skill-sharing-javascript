import express from "express";
import { queryTalks } from "../application/services.js";

export class ExpressApp {
  #app;
  #port;

  constructor(services = { queryTalks }) {
    this.#app = express();
    this.#port = process.env.SKILL_SHARING_SERVER_PORT || 3000;

    const publicPath = process.env.SKILL_SHARING_PUBLIC_PATH || "./public";
    this.#app.use("/", express.static(publicPath));

    this.#app.get("/talks", (req, res) => {
      const talks = services.queryTalks();
      res.status(200).json(talks);
    });
  }

  get app() {
    return this.#app;
  }

  run() {
    this.#app.listen(this.#port, () => {
      console.log(`Skill Sharing app listening on port ${this.#port}`);
    });
  }
}
