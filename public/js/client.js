import { getTalks } from "./api.js";

function elt(type, props, ...children) {
  const dom = document.createElement(type);
  if (props) {
    Object.assign(dom, props);
  }
  for (const child of children) {
    if (typeof child != "string") {
      dom.appendChild(child);
    } else {
      dom.appendChild(document.createTextNode(child));
    }
  }
  return dom;
}

function renderTalk(talk) {
  return elt(
    "section",
    { className: "talk" },
    elt("h2", null, talk.title),
    elt("p", null, talk.summary),
  );
}

class SkillShareApp {
  constructor(state) {
    this.talkDom = elt("div", { className: "talks" });
    this.dom = elt("div", null, this.talkDom);
    this.syncState(state);
  }

  syncState(state) {
    if (state.talks != this.talks) {
      this.talkDom.textContent = "";
      for (const talk of state.talks) {
        this.talkDom.appendChild(renderTalk(talk));
      }
      this.talks = state.talks;
    }
  }
}

async function runApp() {
  const talks = await getTalks();
  const app = new SkillShareApp({ talks });
  document.body.appendChild(app.dom);
}

runApp();
