const assert = require("assert");
const fs = require("fs");
const path = require("path");

const css = fs.readFileSync(path.join(__dirname, "../../assets/css/style.css"), "utf8");

for (const copy of [
  "#avatar-grid .collection-item img",
  "#avatar-grid .collection-item.unlocked img",
  "max-width: 64%",
  "max-height: 64%",
  "width: auto",
  "height: auto"
]) {
  assert(css.includes(copy), `avatar collection images should use smaller proportional sizing: ${copy}`);
}

console.log("collection-avatar-size.test.js passed");
