(function (root) {
  "use strict";

  const PRAISE_ITEMS = [
    { id: "presentation", label: "발표를 잘했어요", xp: 10 },
    { id: "help_friend", label: "친구를 도왔어요", xp: 10 },
    { id: "focus", label: "끝까지 집중했어요", xp: 10 },
    { id: "assignment", label: "과제를 완성했어요", xp: 20 }
  ];

  function buildLevels() {
    const levels = [];
    let currentXP = 0;

    for (let level = 1; level <= 50; level += 1) {
      levels.push({ level, threshold: currentXP });
      const increment = level === 1 ? 105 : Math.floor((level - 1) / 5) * 3 + 10;
      currentXP += increment;
    }

    return levels;
  }

  const LEVELS = buildLevels();

  function calculateLevel(totalXp) {
    const xp = Number(totalXp || 0);

    for (let i = LEVELS.length - 1; i >= 0; i -= 1) {
      if (xp >= LEVELS[i].threshold) {
        return LEVELS[i].level;
      }
    }

    return 1;
  }

  function getLevelProgress(totalXp) {
    const xp = Number(totalXp || 0);
    const currentLevel = calculateLevel(xp);
    const current = LEVELS.find((item) => item.level === currentLevel) || LEVELS[0];
    const next = LEVELS.find((item) => item.level === currentLevel + 1);

    if (!next) {
      return { currentLevel, currentXp: xp, nextXp: null, percent: 100 };
    }

    const span = next.threshold - current.threshold;
    const gained = xp - current.threshold;

    return {
      currentLevel,
      currentXp: xp,
      nextXp: next.threshold,
      percent: Math.max(0, Math.min(100, Math.round((gained / span) * 100)))
    };
  }

  function pad3(value) {
    return String(value).padStart(3, "0");
  }

  function normalizeStudentId(value) {
    const digits = String(value || "").replace(/\D/g, "");

    if (digits.length === 4) {
      return `${digits.slice(0, 1)}0${digits.slice(1)}`;
    }

    return digits;
  }

  const AVATAR_POOL = [];
  for (let gender = 1; gender <= 2; gender += 1) {
    for (let id = 1; id <= 100; id += 1) {
      AVATAR_POOL.push({ avatar_id: pad3(id), gender: String(gender) });
    }
  }

  const PET_POOL = [];
  for (let id = 1; id <= 100; id += 1) {
    PET_POOL.push({ pet_id: pad3(id) });
  }

  function avatarImagePath(avatar) {
    const gender = avatar && avatar.gender ? avatar.gender : "1";
    const avatarId = avatar && avatar.avatar_id ? avatar.avatar_id : "001";
    return `public/img/avatarLibrary_IMG/avatarLibrary_${gender}_${avatarId}.png`;
  }

  function levelAvatarImagePath(student) {
    const current = student && student.current_avatar_num ? student.current_avatar_num : "1_001";
    const parts = current.split("_");
    const gender = parts[0] === "2" ? "2" : "1";
    const level = pad3(student && student.level ? student.level : 1);
    return `public/img/avatarLevel_IMG/levelAvatar_${gender}_${level}.png`;
  }

  function petImagePath(pet) {
    const petId = pet && pet.pet_id ? pet.pet_id : "000";
    return `public/img/myPet_IMG/myPet_${petId}.png`;
  }

  root.GrowthNoteRules = {
    PRAISE_ITEMS,
    LEVELS,
    AVATAR_POOL,
    PET_POOL,
    calculateLevel,
    getLevelProgress,
    normalizeStudentId,
    avatarImagePath,
    levelAvatarImagePath,
    petImagePath
  };
})(typeof window !== "undefined" ? window : globalThis);
