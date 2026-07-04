const assert = require("assert");

global.window = global;

require("../../assets/js/rules.js");

assert.strictEqual(global.GrowthNoteRules.calculateLevel(0), 1);
assert.strictEqual(global.GrowthNoteRules.calculateLevel(104), 1);
assert.strictEqual(global.GrowthNoteRules.calculateLevel(105), 2);

const progress = global.GrowthNoteRules.getLevelProgress(105);
assert.strictEqual(progress.currentLevel, 2);
assert.strictEqual(progress.currentXp, 105);
assert.strictEqual(progress.percent, 0);

assert.strictEqual(global.GrowthNoteRules.PRAISE_ITEMS.length, 4);
assert.strictEqual(global.GrowthNoteRules.AVATAR_POOL.length, 200);
assert.strictEqual(global.GrowthNoteRules.PET_POOL.length, 100);
assert.strictEqual(global.GrowthNoteRules.normalizeStudentId("30110"), "30110");
assert.strictEqual(global.GrowthNoteRules.normalizeStudentId("3-1-10"), "30110");
assert.strictEqual(global.GrowthNoteRules.normalizeStudentId("3학년 1반 10번"), "30110");
assert.strictEqual(
  global.GrowthNoteRules.avatarImagePath({ gender: "2", avatar_id: "007" }),
  "public/img/avatarLibrary_IMG/avatarLibrary_2_007.png"
);
assert.strictEqual(
  global.GrowthNoteRules.petImagePath({ pet_id: "012" }),
  "public/img/myPet_IMG/myPet_012.png"
);

console.log("rules.test.js passed");
