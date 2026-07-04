const assert = require("assert");

global.window = global;
require("../../assets/js/rules.js");
require("../../assets/js/rewards.js");

const ownedAvatars = [];
for (let gender = 1; gender <= 2; gender += 1) {
  for (let id = 1; id <= 100; id += 1) {
    ownedAvatars.push({
      avatar_id: String(id).padStart(3, "0"),
      gender: String(gender)
    });
  }
}

const petReward = global.GrowthNoteRewards.selectNextReward({
  ownedAvatars,
  ownedPets: [],
  random: () => 0
});
assert.strictEqual(petReward.type, "pet");
assert.strictEqual(petReward.item.pet_id, "001");

const avatarReward = global.GrowthNoteRewards.selectNextReward({
  ownedAvatars: [],
  ownedPets: [{ pet_id: "001" }],
  random: () => 0
});
assert.strictEqual(avatarReward.type, "avatar");
assert.strictEqual(avatarReward.item.gender, "1");
assert.strictEqual(avatarReward.item.avatar_id, "001");

const allPets = [];
for (let id = 1; id <= 100; id += 1) {
  allPets.push({ pet_id: String(id).padStart(3, "0") });
}

const completeReward = global.GrowthNoteRewards.selectNextReward({
  ownedAvatars,
  ownedPets: allPets,
  random: () => 0
});
assert.strictEqual(completeReward, null);

console.log("rewards.test.js passed");
