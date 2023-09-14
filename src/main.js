import path from "path";
import url from "url";
import express from "express";

const app = express();
const port = 3000;

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/", express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Skill Sharing app listening on port ${port}`);
});
