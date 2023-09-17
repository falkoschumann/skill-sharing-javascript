import { readFileSync } from "fs";

const fileName =
  process.env.SKILL_SHARING_TALKS_JSON_FILE || "./data/talks.json";

export function loadTalks(options = { fileName }) {
  try {
    return JSON.parse(readFileSync(options.fileName, "utf8"));
  } catch (e) {
    return [];
  }
}
