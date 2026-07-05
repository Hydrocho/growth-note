const assert = require("assert");
const fs = require("fs");
const path = require("path");

const js = fs.readFileSync(path.join(__dirname, "../../assets/js/student.js"), "utf8");

for (const copy of [
  "avatarX: -80",
  "petX: 0"
]) {
  assert(
    js.includes(copy),
    `student home avatar/pet pair should be centered as one visual object: ${copy}`
  );
}

assert(
  js.indexOf("avatarX: -80") < js.indexOf("petX: 0"),
  "student home layout should keep avatar and pet positioning in the same layout settings block"
);

console.log("student-home-layout.test.js passed");
