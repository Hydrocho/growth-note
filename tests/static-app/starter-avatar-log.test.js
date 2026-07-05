const assert = require("assert");
const fs = require("fs");
const path = require("path");

const js = fs.readFileSync(path.join(__dirname, "../../assets/js/student.js"), "utf8");
const start = js.indexOf("async function grantStarterAvatar");
const end = js.indexOf("function openRewardDrawModal", start);
const grantStarterAvatar = js.slice(start, end);

assert(start !== -1 && end !== -1, "student.js should include grantStarterAvatar before reward modal code");

for (const copy of [
  'client.from("student_logs").insert',
  'type: "starter_avatar"',
  'category: "starter_avatar"',
  'description: "첫 아바타 선택"',
  'xp_change: 10',
  'reward_type: "avatar"',
  'reward_id: `${selectedGender}_${avatarId}`'
]) {
  assert(
    grantStarterAvatar.includes(copy),
    `grantStarterAvatar should record starter avatar log: ${copy}`
  );
}

assert(
  grantStarterAvatar.indexOf('client.from("student_logs").insert') >
    grantStarterAvatar.indexOf('client.from("students")'),
  "starter avatar log should be written after student avatar update"
);

console.log("starter-avatar-log.test.js passed");
