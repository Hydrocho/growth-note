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

  function renderCollection(containerId, items, pathFactory, emptyText) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = emptyText;
      container.appendChild(empty);
      return;
    }

    for (const item of items) {
      const cell = document.createElement("div");
      cell.className = "collection-item";
      const img = document.createElement("img");
      img.src = pathFactory(item);
      img.alt = "보상";
      cell.appendChild(img);
      container.appendChild(cell);
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
    setText("settings-student-name", displayName);
    setText("settings-student-id", student.school_id || "-");

    document.getElementById("level-progress").style.width = `${progress.percent}%`;
    const circle = document.getElementById("xp-progress-circle");
    if (circle) {
      const circumference = 282.74;
      const offset = circumference * (1 - (progress.percent || 0) / 100);
      circle.style.strokeDashoffset = offset;
    }
    setImage("current-avatar", avatarPath);
    setImage("current-pet", petPath);

    renderCollection("avatar-grid", avatars, window.GrowthNoteRules.avatarImagePath, "아직 획득한 아바타가 없습니다.");
    renderCollection("pet-grid", pets, window.GrowthNoteRules.petImagePath, "아직 획득한 마이펫이 없습니다.");
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

  document.getElementById("logout-button").addEventListener("click", function () {
    sessionStorage.removeItem("growth-note-student-id");
    sessionStorage.removeItem("growth-note-demo-student");
    window.location.href = "student-login.html";
  });

  loadDashboard();
})();
