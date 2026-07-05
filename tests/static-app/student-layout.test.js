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

for (const copy of [
  "칭찬을 받으면 XP가 쌓이고 레벨이 올라갑니다.",
  "레벨업할 때마다 새로운 아바타 또는 마이펫 보상을 받을 수 있습니다.",
  "Lv.2까지 105 XP"
]) {
  assert(html.includes(copy), `student.html should explain level-up system: ${copy}`);
}

for (const copy of [
  "id=\"starter-avatar-modal\"",
  "data-starter-avatar=\"1\"",
  "data-starter-avatar=\"2\"",
  "첫 아바타를 선택하세요",
  "성장을 함께할 첫 아바타를 선물로 받을 수 있어요."
]) {
  assert(html.includes(copy), `student.html should include starter avatar selection UI: ${copy}`);
}

console.log("student-layout.test.js passed");
