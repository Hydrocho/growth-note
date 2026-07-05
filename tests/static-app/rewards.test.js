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

const avatarReward = global.GrowthNoteRewards.selectNextReward({
  ownedAvatars: [],
  ownedPets: [],
  random: () => 0
});
assert.strictEqual(avatarReward.type, "avatar");
assert.strictEqual(avatarReward.item.gender, "1");
assert.strictEqual(avatarReward.item.avatar_id, "001");

const dailyPetReward = global.GrowthNoteRewards.selectDailyPetReward({
  ownedPets: [],
  random: () => 0
});
assert.strictEqual(dailyPetReward.type, "pet");
assert.strictEqual(dailyPetReward.item.pet_id, "001");

const allPets = [];
for (let id = 1; id <= 100; id += 1) {
  allPets.push({ pet_id: String(id).padStart(3, "0") });
}

const completePetReward = global.GrowthNoteRewards.selectDailyPetReward({
  ownedPets: allPets,
  random: () => 0
});
assert.strictEqual(completePetReward, null);

const completeAvatarReward = global.GrowthNoteRewards.selectNextReward({
  ownedAvatars,
  ownedPets: [],
  random: () => 0
});
assert.strictEqual(completeAvatarReward, null);

function createMockClient({ student, ownedAvatars = [], ownedPets = [] }) {
  const operations = {
    studentUpdates: [],
    avatarInserts: [],
    petInserts: [],
    logInserts: []
  };

  function table(name) {
    if (name === "students") {
      return {
        select() {
          return {
            eq() {
              return {
                async single() {
                  return { data: student, error: null };
                }
              };
            }
          };
        },
        update(payload) {
          operations.studentUpdates.push(payload);
          return {
            async eq() {
              return { error: null };
            }
          };
        }
      };
    }

    if (name === "unlocked_avatars") {
      return {
        select() {
          return {
            async eq() {
              return { data: ownedAvatars, error: null };
            }
          };
        },
        async insert(payload) {
          operations.avatarInserts.push(payload);
          return { error: null };
        }
      };
    }

    if (name === "unlocked_pets") {
      return {
        select() {
          return {
            async eq() {
              return { data: ownedPets, error: null };
            }
          };
        },
        async insert(payload) {
          operations.petInserts.push(payload);
          return { error: null };
        }
      };
    }

    if (name === "student_logs") {
      return {
        async insert(payload) {
          operations.logInserts.push(payload);
          return { error: null };
        }
      };
    }

    throw new Error(`Unexpected table: ${name}`);
  }

  return {
    client: { from: table },
    operations
  };
}

(async function testPraiseRewardsOnlyOnLevelUp() {
  const noLevelUpMock = createMockClient({
    student: {
      id: "student-1",
      total_xp: 0,
      level: 1
    }
  });

  global.GrowthNoteSupabase = {
    getClient: () => noLevelUpMock.client
  };

  const noLevelUpResult = await global.GrowthNoteRewards.assignPraise(
    "student-1",
    "presentation",
    { note: "Volunteered first" }
  );

  assert.strictEqual(noLevelUpResult.oldLevel, 1);
  assert.strictEqual(noLevelUpResult.newLevel, 1);
  assert.strictEqual(noLevelUpResult.reward, null);
  assert.strictEqual(noLevelUpMock.operations.avatarInserts.length, 0);
  assert.strictEqual(noLevelUpMock.operations.petInserts.length, 0);
  assert.strictEqual(noLevelUpMock.operations.logInserts[0].description, "발표를 잘했어요 - Volunteered first");

  const levelUpMock = createMockClient({
    student: {
      id: "student-2",
      total_xp: 90,
      level: 1
    }
  });

  global.GrowthNoteSupabase = {
    getClient: () => levelUpMock.client
  };

  const originalRandom = Math.random;
  Math.random = () => 0;
  let levelUpResult;
  try {
    levelUpResult = await global.GrowthNoteRewards.assignPraise("student-2", "presentation");
  } finally {
    Math.random = originalRandom;
  }

  assert.strictEqual(levelUpResult.oldLevel, 1);
  assert.strictEqual(levelUpResult.newLevel, 2);
  assert.strictEqual(levelUpResult.reward, null);
  assert.strictEqual(levelUpMock.operations.avatarInserts.length, 0);
  assert.strictEqual(levelUpMock.operations.petInserts.length, 0);
  assert.strictEqual(levelUpMock.operations.studentUpdates[0].total_xp, 100);
  assert.strictEqual(levelUpMock.operations.studentUpdates[0].level, 2);
})();

console.log("rewards.test.js passed");
