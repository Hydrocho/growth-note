const assert = require("assert");
const fs = require("fs");
const path = require("path");

const js = fs.readFileSync(path.join(__dirname, "../../assets/js/student.js"), "utf8");

assert(
  js.includes('statusText.innerHTML = "오늘의 마이펫 뽑기를 완료했어요.<br>내일 다시 만나요.";'),
  "daily draw done status should put the tomorrow message on the second line"
);

assert(
  !js.includes('statusText.textContent = "오늘의 마이펫 뽑기를 완료했어요. 내일 다시 만나요.";'),
  "daily draw done status should not render as one continuous line"
);

console.log("daily-draw-status.test.js passed");
