const assert = require("assert");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "../../student.html"), "utf8");

for (const tabName of ["home", "collection", "history", "settings"]) {
  assert(
    html.includes(`data-tab-target="${tabName}"`),
    `student.html should include bottom navigation for ${tabName}`
  );
  assert(
    html.includes(`data-tab-panel="${tabName}"`),
    `student.html should include panel for ${tabName}`
  );
}

for (const label of ["홈", "보관함", "기록", "설정"]) {
  assert(html.includes(label), `student.html should include Korean tab label ${label}`);
}

assert(!html.includes("?깆"), "student.html should not contain mojibake title text");
assert(!html.includes("�"), "student.html should not contain replacement characters");

console.log("student-layout.test.js passed");
