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

assert(!html.includes("?源?"), "student.html should not contain mojibake title text");
assert(!html.includes("占?"), "student.html should not contain replacement characters");

for (const copy of [
  "id=\"level-guide-title\"",
  "Lv.2",
  "105 XP"
]) {
  assert(html.includes(copy), `student.html should explain level-up system: ${copy}`);
}

assert(
  !html.includes("?꾨컮? ?먮뒗 留덉씠??蹂댁긽"),
  "student.html should not say level-up grants either avatars or My Pets"
);

for (const copy of [
  "id=\"starter-avatar-modal\"",
  "data-starter-avatar=\"1\"",
  "data-starter-avatar=\"2\""
]) {
  assert(html.includes(copy), `student.html should include starter avatar selection UI: ${copy}`);
}

for (const copy of [
  "id=\"daily-pet-draw-card\"",
  "id=\"daily-pet-draw-button\"",
  "id=\"daily-pet-draw-status\"",
  "id=\"reward-draw-modal\"",
  "id=\"reward-draw-box\"",
  "id=\"reward-draw-count\"",
  "id=\"reward-draw-result-image\""
]) {
  assert(html.includes(copy), `student.html should include daily draw UI: ${copy}`);
}

console.log("student-layout.test.js passed");
