import { loadTalks } from "../../src/infrastructure/repository.js";

describe("repository", () => {
  describe("load talks", () => {
    test("returns empty array, if file does not exist", () => {
      const talks = loadTalks({
        fileName: "./tests/data/non-existent.json",
      });

      expect(talks).toEqual([]);
    });

    test("returns JSON content", () => {
      const talks = loadTalks({
        fileName: "./tests/data/example.json",
      });

      expect(talks).toEqual([
        {
          title: "Foobar",
          summary: "Lorem ipsum",
        },
      ]);
    });

    test("returns empty array, if file is corrupt", () => {
      const talks = loadTalks({
        fileName: "./tests/data/corrupt.json",
      });

      expect(talks).toEqual([]);
    });
  });
});
