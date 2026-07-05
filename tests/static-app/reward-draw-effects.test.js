const assert = require("assert");
const fs = require("fs");
const path = require("path");

const css = fs.readFileSync(path.join(__dirname, "../../assets/css/style.css"), "utf8");
const js = fs.readFileSync(path.join(__dirname, "../../assets/js/student.js"), "utf8");

for (const copy of [
  ".reward-draw-content.revealing",
  ".reward-draw-box.opened",
  ".reward-draw-box.opened .reward-draw-gift",
  ".reward-draw-box.opened .reward-draw-count",
  ".reward-draw-box.opened + .reward-draw-result",
  "@keyframes reward-flash",
  "@keyframes pet-reveal"
]) {
  assert(css.includes(copy), `reward draw CSS should include reveal effect: ${copy}`);
}

for (const copy of [
  "font-size: 58px",
  "color: #dc2626",
  "place-items: center"
]) {
  assert(css.includes(copy), `reward draw count should be large and centered: ${copy}`);
}

assert(
  js.includes('content.classList.add("revealing")'),
  "student.js should trigger the modal reveal flash class"
);
assert(
  js.includes('content.classList.remove("revealing")'),
  "student.js should reset the modal reveal flash class"
);
assert(
  js.includes("copy.hidden = true"),
  "student.js should hide the helper copy after the reward appears"
);
assert(
  js.includes("copy.hidden = false"),
  "student.js should show the helper copy again when the modal is reused"
);

console.log("reward-draw-effects.test.js passed");
