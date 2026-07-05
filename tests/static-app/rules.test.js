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
assert.strictEqual(global.GrowthNoteRules.needsStarterAvatarGift([]), true);
assert.strictEqual(
  global.GrowthNoteRules.needsStarterAvatarGift([{ gender: "1", avatar_id: "001" }]),
  false
);
assert.strictEqual(
  global.GrowthNoteRules.needsStarterAvatarGift([{ gender: "2", avatar_id: "001" }]),
  false
);
assert.strictEqual(
  global.GrowthNoteRules.needsStarterAvatarGift([{ gender: "1", avatar_id: "002" }]),
  true
);
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

const layout = global.GrowthNoteRules.getAvatarPetLayout({
  avatarX: -45,
  avatarY: 10,
  avatarSize: 140,
  petX: 40,
  petY: 10,
  petSize: 80,
  receiptPetX: 3,
  receiptPetY: -4
});
assert.strictEqual(layout.avatarImage.left, "123px");
assert.strictEqual(layout.avatarImage.bottom, "-10px");
assert.strictEqual(layout.avatarImage.height, "140px");
assert.strictEqual(layout.petImage.left, "208px");
assert.strictEqual(layout.petImage.bottom, "-10px");
assert.strictEqual(layout.petImage.transform, "translate(3px, -4px)");
assert.strictEqual(layout.petImage.height, "53.33333333333333px");
assert.strictEqual(layout.petImage.width, "auto");

global.ReceiptCore = {
  LAYOUT: {
    PET: { x: 11, y: -7 }
  }
};
global.ReceiptMedia = {
  normalizeImageSize(size) {
    assert.deepStrictEqual(size, { width: 64 * (2 / 3), height: 64 * (2 / 3) });
    return { width: 48 * (2 / 3), height: 52 * (2 / 3) };
  }
};

const receiptLayout = global.GrowthNoteRules.getAvatarPetLayout({
  petX: 1,
  petY: 2,
  petSize: 64,
  receiptPetX: 3,
  receiptPetY: 4
});
assert.strictEqual(receiptLayout.petImage.left, "169px");
assert.strictEqual(receiptLayout.petImage.bottom, "-2px");
assert.strictEqual(receiptLayout.petImage.transform, "translate(11px, -7px)");
assert.strictEqual(receiptLayout.petImage.width, "32px");
assert.strictEqual(receiptLayout.petImage.height, "34.666666666666664px");

console.log("rules.test.js passed");
