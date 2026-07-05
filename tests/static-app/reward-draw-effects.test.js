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
  "top: 12px",
  "right: 12px",
  "font-size: 30px",
  "color: #dc2626",
  "background: rgba(255, 255, 255, 0.92)"
]) {
  assert(css.includes(copy), `reward draw count should be compact and visible: ${copy}`);
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
assert(
  js.includes("window.setInterval(() => tick(1), 1000)"),
  "student.js should count down automatically once per second"
);
assert(
  js.includes("box.onclick = () => tick(2)"),
  "student.js should keep tap acceleration for opening the box"
);

console.log("reward-draw-effects.test.js passed");
