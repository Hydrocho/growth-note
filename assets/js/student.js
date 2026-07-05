(function () {
  "use strict";

  const studentId = sessionStorage.getItem("growth-note-student-id");
  const status = document.getElementById("student-status");

  function setStatus(message, isError) {
    status.textContent = message || "";
    status.classList.toggle("error", Boolean(isError));
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function setImage(id, src) {
    const element = document.getElementById(id);
    if (element) element.src = src;
  }

  function displayStudentName(student) {
    return student.school_id || "";
  }

  function currentAvatarPath(student, avatars) {
    if (student.display_avatar_type === "library" && student.current_avatar_num) {
      const parts = student.current_avatar_num.split("_");
      return window.GrowthNoteRules.avatarImagePath({
        gender: parts[0] || "1",
        avatar_id: parts[1] || "001"
      });
    }

    if (avatars.length) {
      return window.GrowthNoteRules.avatarImagePath(avatars[0]);
    }

    return window.GrowthNoteRules.levelAvatarImagePath(student);
  }

  // 대표 아바타 설정
  async function setDefaultAvatar(gender, avatarId) {
    const ok = window.confirm("선택한 아바타를 대표 프로필 아바타로 설정하시겠습니까?");
    if (!ok) return;

    try {
      setStatus("대표 아바타를 변경하고 있습니다...");
      const client = window.GrowthNoteSupabase.getClient();
      const { error } = await client
        .from("students")
        .update({
          current_avatar_num: `${gender}_${avatarId}`,
          display_avatar_type: "library"
        })
        .eq("id", studentId);

      if (error) throw error;
      alert("대표 아바타가 설정되었습니다.");
      loadDashboard();
    } catch (e) {
      alert("아바타 설정 실패: " + e.message);
      setStatus("아바타 설정 오류: " + e.message, true);
    }
  }

  // 대표 마이펫 설정
  async function setDefaultPet(petId) {
    const ok = window.confirm("선택한 마이펫을 함께하는 대표 마이펫으로 설정하시겠습니까?");
    if (!ok) return;

    try {
      setStatus("대표 마이펫을 변경하고 있습니다...");
      const client = window.GrowthNoteSupabase.getClient();
      const { error } = await client
        .from("students")
        .update({
          current_pet_num: petId
        })
        .eq("id", studentId);

      if (error) throw error;
      alert("대표 마이펫이 설정되었습니다.");
      loadDashboard();
    } catch (e) {
      alert("마이펫 설정 실패: " + e.message);
      setStatus("마이펫 설정 오류: " + e.message, true);
    }
  }

  function renderCollection(containerId, unlockedItems, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (type === "avatar") {
      const activeGenderBtn = document.querySelector("[data-gender-target].active");
      const currentGender = activeGenderBtn ? activeGenderBtn.dataset.genderTarget : "1";

      for (let idNum = 1; idNum <= 100; idNum++) {
        const avatarId = String(idNum).padStart(3, "0");
        const isUnlocked = unlockedItems.some(
          (item) => item.avatar_id === avatarId && String(item.gender) === String(currentGender)
        );

        const cell = document.createElement("div");
        cell.className = `collection-item${isUnlocked ? " unlocked" : " locked"}`;
        
        const img = document.createElement("img");
        if (isUnlocked) {
          img.src = `public/img/avatarLibrary_IMG/avatarLibrary_${currentGender}_${avatarId}.png`;
          img.alt = `아바타 ${avatarId}`;
          cell.style.cursor = "pointer";
          cell.title = "대표 아바타로 설정";
          cell.addEventListener("click", () => setDefaultAvatar(currentGender, avatarId));
        } else {
          img.src = `public/img/avatarLibrary_IMG/avatarLibraryShadow_${currentGender}_${avatarId}.png`;
          img.alt = "미획득 아바타";
          cell.style.opacity = "0.25"; // 미획득은 흐릿하고 어둡게 처리
        }

        cell.appendChild(img);
        


        container.appendChild(cell);
      }
    } else if (type === "pet") {
      for (let idNum = 1; idNum <= 100; idNum++) {
        const petId = String(idNum).padStart(3, "0");
        const isUnlocked = unlockedItems.some((item) => item.pet_id === petId);

        const cell = document.createElement("div");
        cell.className = `collection-item${isUnlocked ? " unlocked" : " locked"}`;

        const img = document.createElement("img");
        if (isUnlocked) {
          img.src = `public/img/myPet_IMG/myPet_${petId}.png`;
          img.alt = `마이펫 ${petId}`;
          cell.style.cursor = "pointer";
          cell.title = "대표 마이펫으로 설정";
          cell.addEventListener("click", () => setDefaultPet(petId));
        } else {
          img.src = `public/img/myPet_IMG/myPetShadow_${petId}.png`;
          img.alt = "미획득 마이펫";
          cell.style.opacity = "0.25";
        }

        cell.appendChild(img);



        container.appendChild(cell);
      }
    }
  }

  function renderLogs(logs) {
    const container = document.getElementById("log-list");
    container.innerHTML = "";

    if (!logs.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "아직 칭찬 기록이 없습니다.";
      container.appendChild(empty);
      return;
    }

    for (const log of logs) {
      const item = document.createElement("article");
      item.className = "timeline-item";
      const reward = log.reward_type ? `${log.reward_type} ${log.reward_id}` : "보상 없음";
      const date = log.created_at ? new Date(log.created_at).toLocaleString("ko-KR") : "";
      item.innerHTML = `
        <div class="timeline-icon"><span class="material-symbols-outlined">stars</span></div>
        <div>
          <strong>${log.description || log.category}</strong>
          <p>+${log.xp_change} XP · ${reward}</p>
          <time>${date}</time>
        </div>
      `;
      container.appendChild(item);
    }
  }

  function renderDashboard(model) {
    const student = model.student;
    const avatars = model.avatars;
    const pets = model.pets;
    const logs = model.logs;
    const progress = window.GrowthNoteRules.getLevelProgress(student.total_xp);
    const avatarPath = currentAvatarPath(student, avatars);
    const petPath = window.GrowthNoteRules.petImagePath(pets[0] || { pet_id: student.current_pet_num || "000" });
    const displayName = displayStudentName(student);

    setText("student-name", displayName);
    setText("student-id-inline", student.school_id || "");
    setText("home-title", `${displayName}의 성장`);
    setText("level-value", progress.currentLevel);
    setText("xp-value", Number(student.total_xp || 0).toLocaleString("ko-KR"));
    setText("next-level-value", progress.nextXp ? `다음 레벨까지 ${progress.nextXp} XP` : "최고 레벨입니다.");
    setText("reward-count", avatars.length + pets.length);
    setText("recent-praise-count", logs.length);
    setText("settings-student-id", student.school_id || "-");
    setText("settings-student-xp", `${Number(student.total_xp || 0).toLocaleString("ko-KR")} XP (Lv. ${progress.currentLevel})`);
    setText("settings-student-avatar-count", `${avatars.length} / 200`);
    setText("settings-student-pet-count", `${pets.length} / 100`);

    document.getElementById("level-progress").style.width = `${progress.percent}%`;
    const circle = document.getElementById("xp-progress-circle");
    if (circle) {
      const circumference = 282.74;
      const offset = circumference * (1 - (progress.percent || 0) / 100);
      circle.style.strokeDashoffset = offset;
    }
    setImage("current-avatar", avatarPath);
    setImage("current-pet", petPath);

    // getAvatarPetLayout 함수를 불러와서 아바타와 펫의 크기/위치 정밀 대입
    const layoutSettings = {
      avatarY: 10,
      avatarX: -45,     // 아바타 약간 왼쪽 배치
      avatarSize: 140,  // 아바타 크기
      petY: 10,
      petX: 40,        // 마이펫 약간 오른쪽 배치
      receiptPetX: 0,
      receiptPetY: 0
    };
    const layout = window.GrowthNoteRules.getAvatarPetLayout(layoutSettings);

    const avatarEl = document.getElementById("current-avatar");
    const petEl = document.getElementById("current-pet");

    if (avatarEl) {
      Object.assign(avatarEl.style, layout.avatarImage);
    }
    if (petEl) {
      const effectivePet = pets[0] ? pets[0].pet_id : (student.current_pet_num || "000");
      if (effectivePet && effectivePet !== "000") {
        petEl.style.display = "block";
        Object.assign(petEl.style, layout.petImage);
      } else {
        petEl.style.display = "none";
      }
    }

    renderCollection("avatar-grid", avatars, "avatar");
    renderCollection("pet-grid", pets, "pet");
    renderLogs(logs);
  }

  async function loadDashboard() {
    if (!studentId) {
      window.location.href = "student-login.html";
      return;
    }

    try {
      setStatus("데이터를 불러오는 중입니다.");
      const client = window.GrowthNoteSupabase.getClient();
      const [{ data: student, error: studentError }, avatarsResult, petsResult, logsResult] =
        await Promise.all([
          client.from("students").select("*").eq("id", studentId).single(),
          client.from("unlocked_avatars").select("avatar_id, gender, unlocked_at").eq("student_id", studentId).order("unlocked_at", { ascending: false }),
          client.from("unlocked_pets").select("pet_id, unlocked_at").eq("student_id", studentId).order("unlocked_at", { ascending: false }),
          client.from("student_logs").select("*").eq("student_id", studentId).order("created_at", { ascending: false }).limit(10)
        ]);

      if (studentError) throw studentError;
      if (avatarsResult.error) throw avatarsResult.error;
      if (petsResult.error) throw petsResult.error;
      if (logsResult.error) throw logsResult.error;

      renderDashboard({
        student,
        avatars: avatarsResult.data || [],
        pets: petsResult.data || [],
        logs: logsResult.data || []
      });
      setStatus("");
    } catch (error) {
      setStatus(window.GrowthNoteSupabase.formatError(error), true);
    }
  }

  function activateTab(tabName) {
    document.querySelectorAll("[data-tab-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.tabPanel === tabName);
    });
    document.querySelectorAll("[data-tab-target]").forEach((button) => {
      button.classList.toggle("active", button.dataset.tabTarget === tabName);
    });
  }

  function activateCollection(type) {
    document.querySelectorAll("[data-collection-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.collectionPanel === type);
    });
    document.querySelectorAll("[data-collection-target]").forEach((button) => {
      button.classList.toggle("active", button.dataset.collectionTarget === type);
    });

    const genderToggle = document.getElementById("avatar-gender-toggle-container");
    if (genderToggle) {
      genderToggle.style.display = type === "avatar" ? "flex" : "none";
    }
  }

  document.querySelectorAll("[data-tab-target]").forEach((button) => {
    button.addEventListener("click", () => {
      activateTab(button.dataset.tabTarget);
      loadDashboard();
    });
  });

  document.querySelectorAll("[data-collection-target]").forEach((button) => {
    button.addEventListener("click", () => activateCollection(button.dataset.collectionTarget));
  });

  const refreshBtn = document.getElementById("refresh-button");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadDashboard);
  }

  // Handle student data reset
  async function handleResetData() {
    const ok = window.confirm("데이터를 초기화하시겠습니까?\n\n보유한 모든 보상(아바타, 펫) 및 칭찬 기록이 영구히 유실됩니다.");
    if (!ok) return;

    const pin = window.prompt("본인 확인을 위해 4자리 비밀번호(PIN)를 입력해 주세요:");
    if (!pin) return;

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      alert("비밀번호는 4자리 숫자여야 합니다.");
      return;
    }

    try {
      setStatus("데이터를 검증하고 있습니다...");
      const client = window.GrowthNoteSupabase.getClient();

      // 1. 현재 학생의 정보(PIN 포함) 조회
      const { data: student, error: fetchError } = await client
        .from("students")
        .select("pin")
        .eq("id", studentId)
        .single();

      if (fetchError) throw fetchError;

      // 2. 입력된 PIN 해싱 후 비교
      const hashed = await window.GrowthNoteRules.hashPin(pin);
      if (student.pin !== hashed) {
        alert("비밀번호가 일치하지 않습니다.");
        setStatus("비밀번호가 일치하지 않습니다.", true);
        return;
      }

      setStatus("데이터를 초기화하고 있습니다...");

      // 3. 자식 테이블 데이터 삭제
      const { error: logsErr } = await client
        .from("student_logs")
        .delete()
        .eq("student_id", studentId);
      if (logsErr) throw logsErr;

      const { error: avatarsErr } = await client
        .from("unlocked_avatars")
        .delete()
        .eq("student_id", studentId);
      if (avatarsErr) throw avatarsErr;

      const { error: petsErr } = await client
        .from("unlocked_pets")
        .delete()
        .eq("student_id", studentId);
      if (petsErr) throw petsErr;

      // 4. students 테이블 레코드 기본값으로 초기화
      const { error: updateErr } = await client
        .from("students")
        .update({
          total_xp: 0,
          level: 1,
          current_avatar_num: "1_001",
          current_pet_num: "000",
          display_avatar_type: "level"
        })
        .eq("id", studentId);

      if (updateErr) throw updateErr;

      alert("데이터 초기화가 성공적으로 완료되었습니다.");
      loadDashboard();
    } catch (err) {
      alert("초기화 실패: " + err.message);
      setStatus("초기화 오류: " + err.message, true);
    }
  }

  const resetDataBtn = document.getElementById("reset-data-button");
  if (resetDataBtn) {
    resetDataBtn.addEventListener("click", handleResetData);
  }

  // 아바타 성별 토글 버튼 바인딩
  document.querySelectorAll("[data-gender-target]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-gender-target]").forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      loadDashboard(); // 성별 변경 후 도감 재렌더링
    });
  });

  document.getElementById("logout-button").addEventListener("click", function () {
    sessionStorage.removeItem("growth-note-student-id");
    sessionStorage.removeItem("growth-note-demo-student");
    window.location.href = "student-login.html";
  });

  loadDashboard();
})();
