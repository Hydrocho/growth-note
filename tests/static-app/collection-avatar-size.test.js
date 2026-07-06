const assert = require("assert");
const fs = require("fs");
const path = require("path");

const css = fs.readFileSync(path.join(__dirname, "../../assets/css/style.css"), "utf8");

for (const copy of [
  "#avatar-grid .collection-item img",
  "#avatar-grid .collection-item.unlocked img",
  "width: auto",
  "height: auto",
  "max-width: none",
  "max-height: none",
  "transform: scale(0.1)",
  "transform-origin: center"
]) {
  assert(css.includes(copy), `avatar collection images should use uniform source-ratio scaling: ${copy}`);
}

assert(
  !css.includes("#avatar-grid .collection-item img,\n#avatar-grid .collection-item.unlocked img {\n  width: auto;\n  height: auto;\n  max-width: 64%;"),
  "avatar collection images should not use max-size based fitting for the scaled avatar rule"
);

console.log("collection-avatar-size.test.js passed");
