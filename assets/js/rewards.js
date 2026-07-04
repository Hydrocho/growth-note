(function (root) {
  "use strict";

  function avatarKey(item) {
    return `${item.gender || "1"}_${item.avatar_id}`;
  }

  function petKey(item) {
    return item.pet_id;
  }

  function chooseFrom(items, random) {
    if (!items.length) return null;
    const index = Math.floor(random() * items.length);
    return items[Math.max(0, Math.min(items.length - 1, index))];
  }

  function selectNextReward(options) {
    const rules = root.GrowthNoteRules;
    const ownedAvatars = options.ownedAvatars || [];
    const ownedPets = options.ownedPets || [];
    const random = options.random || Math.random;

    const ownedAvatarKeys = new Set(ownedAvatars.map(avatarKey));
    const ownedPetKeys = new Set(ownedPets.map(petKey));
    const availableAvatars = rules.AVATAR_POOL.filter((item) => !ownedAvatarKeys.has(avatarKey(item)));
    const availablePets = rules.PET_POOL.filter((item) => !ownedPetKeys.has(petKey(item)));

    const preferAvatar = random() < 0.5;
    const firstType = preferAvatar ? "avatar" : "pet";
    const attempts = firstType === "avatar" ? ["avatar", "pet"] : ["pet", "avatar"];

    for (const type of attempts) {
      if (type === "avatar" && availableAvatars.length) {
        return { type, item: chooseFrom(availableAvatars, random) };
      }
      if (type === "pet" && availablePets.length) {
        return { type, item: chooseFrom(availablePets, random) };
      }
    }

    return null;
  }

  async function assignPraise(studentId, praiseItemId) {
    const rules = root.GrowthNoteRules;
    const client = root.GrowthNoteSupabase.getClient();
    const praise = rules.PRAISE_ITEMS.find((item) => item.id === praiseItemId);

    if (!praise) {
      throw new Error("Unknown praise item.");
    }

    const { data: student, error: studentError } = await client
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    if (studentError) throw studentError;

    const [{ data: ownedAvatars, error: avatarError }, { data: ownedPets, error: petError }] =
      await Promise.all([
        client.from("unlocked_avatars").select("avatar_id, gender").eq("student_id", studentId),
        client.from("unlocked_pets").select("pet_id").eq("student_id", studentId)
      ]);

    if (avatarError) throw avatarError;
    if (petError) throw petError;

    const oldXp = Number(student.total_xp || 0);
    const oldLevel = Number(student.level || rules.calculateLevel(oldXp));
    const newXp = oldXp + praise.xp;
    const newLevel = rules.calculateLevel(newXp);
    const reward = selectNextReward({
      ownedAvatars: ownedAvatars || [],
      ownedPets: ownedPets || []
    });

    const studentUpdate = {
      total_xp: newXp,
      level: newLevel
    };

    if (reward && reward.type === "avatar") {
      studentUpdate.current_avatar_num = `${reward.item.gender}_${reward.item.avatar_id}`;
      studentUpdate.display_avatar_type = "library";
    }

    if (reward && reward.type === "pet") {
      studentUpdate.current_pet_num = reward.item.pet_id;
    }

    const { error: updateError } = await client
      .from("students")
      .update(studentUpdate)
      .eq("id", studentId);

    if (updateError) throw updateError;

    if (reward && reward.type === "avatar") {
      const { error } = await client.from("unlocked_avatars").insert({
        student_id: studentId,
        avatar_id: reward.item.avatar_id,
        gender: reward.item.gender,
        quantity: 1
      });
      if (error) throw error;
    }

    if (reward && reward.type === "pet") {
      const { error } = await client.from("unlocked_pets").insert({
        student_id: studentId,
        pet_id: reward.item.pet_id,
        quantity: 1
      });
      if (error) throw error;
    }

    const rewardId = reward
      ? reward.type === "avatar"
        ? `${reward.item.gender}_${reward.item.avatar_id}`
        : reward.item.pet_id
      : null;

    const { error: logError } = await client.from("student_logs").insert({
      student_id: studentId,
      type: "praise",
      category: praise.id,
      description: praise.label,
      xp_change: praise.xp,
      reward_type: reward ? reward.type : null,
      reward_id: rewardId,
      level_before: oldLevel,
      level_after: newLevel
    });

    if (logError) throw logError;

    return {
      praise,
      oldXp,
      newXp,
      oldLevel,
      newLevel,
      reward
    };
  }

  root.GrowthNoteRewards = {
    selectNextReward,
    assignPraise
  };
})(typeof window !== "undefined" ? window : globalThis);

