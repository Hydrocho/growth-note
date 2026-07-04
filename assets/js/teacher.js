(function () {
  "use strict";

  const ADMIN_PIN = "2468";
  const adminGate = document.getElementById("admin-gate");
  const teacherApp = document.getElementById("teacher-app");
  const adminForm = document.getElementById("admin-form");
  const adminPin = document.getElementById("admin-pin");
  const adminStatus = document.getElementById("admin-status");
  const teacherStatus = document.getElementById("teacher-status");
  const studentSearch = document.getElementById("student-search");
  const studentList = document.getElementById("student-list");
  const praiseButtons = document.getElementById("praise-buttons");
  const resultBox = document.getElementById("praise-result");

  let students = [];
  let selectedStudent = null;

  function setStatus(target, message, isError) {
    target.textContent = message || "";
    target.classList.toggle("error", Boolean(isError));
  }

  function studentLabel(student) {
    return `${student.school_id} · ${student.nickname || student.name || "이름 없음"}`;
  }

  function renderStudents() {
    const term = studentSearch.value.trim().toLowerCase();
    const filtered = students.filter((student) => {
      const source = `${student.school_id} ${student.name || ""} ${student.nickname || ""}`.toLowerCase();
      return source.includes(term);
    });

    studentList.innerHTML = "";

    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "검색 결과가 없습니다.";
      studentList.appendChild(empty);
      return;
    }

    for (const student of filtered) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `student-row${selectedStudent && selectedStudent.id === student.id ? " active" : ""}`;
      button.textContent = studentLabel(student);
      button.addEventListener("click", function () {
        selectedStudent = student;
        renderStudents();
        renderSelectedStudent();
      });
      studentList.appendChild(button);
    }
  }

  function renderSelectedStudent() {
    document.getElementById("selected-student-title").textContent = selectedStudent
      ? studentLabel(selectedStudent)
      : "학생을 선택하세요";
    document.getElementById("selected-student-meta").textContent = selectedStudent
      ? `현재 ${selectedStudent.total_xp || 0} XP · Lv.${selectedStudent.level || 1}`
      : "";
    resultBox.classList.add("hidden");
  }

  function renderPraiseButtons() {
    praiseButtons.innerHTML = "";

    for (const praise of window.GrowthNoteRules.PRAISE_ITEMS) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "button";
      button.textContent = `${praise.label} (+${praise.xp})`;
      button.addEventListener("click", async function () {
        if (!selectedStudent) {
          setStatus(teacherStatus, "먼저 학생을 선택하세요.", true);
          return;
        }

        button.disabled = true;
        setStatus(teacherStatus, "칭찬을 저장하는 중입니다.");

        try {
          const result = await window.GrowthNoteRewards.assignPraise(selectedStudent.id, praise.id);
          selectedStudent.total_xp = result.newXp;
          selectedStudent.level = result.newLevel;
          renderSelectedStudent();
          resultBox.classList.remove("hidden");
          resultBox.innerHTML = [
            `<strong>${selectedStudent.nickname || selectedStudent.name || "학생"}</strong>`,
            `${result.praise.label} +${result.praise.xp} XP`,
            `Lv.${result.oldLevel} → Lv.${result.newLevel}`,
            result.reward
              ? `새 보상: ${result.reward.type === "avatar" ? "아바타" : "마이펫"}`
              : "모든 보상을 이미 획득했습니다."
          ].join("<br>");
          setStatus(teacherStatus, "저장되었습니다.");
        } catch (error) {
          setStatus(teacherStatus, window.GrowthNoteSupabase.formatError(error), true);
        } finally {
          button.disabled = false;
        }
      });
      praiseButtons.appendChild(button);
    }
  }

  async function loadStudents() {
    try {
      const client = window.GrowthNoteSupabase.getClient();
      const { data, error } = await client
        .from("students")
        .select("id, school_id, name, nickname, total_xp, level")
        .order("school_id", { ascending: true });

      if (error) throw error;

      students = data || [];
      renderStudents();
      renderPraiseButtons();
      setStatus(teacherStatus, "학생을 선택하고 칭찬을 부여하세요.");
    } catch (error) {
      setStatus(teacherStatus, window.GrowthNoteSupabase.formatError(error), true);
    }
  }

  adminForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (adminPin.value.trim() !== ADMIN_PIN) {
      setStatus(adminStatus, "관리자 PIN이 맞지 않습니다.", true);
      adminPin.select();
      return;
    }

    adminGate.classList.add("hidden");
    teacherApp.classList.remove("hidden");
    loadStudents();
  });

  studentSearch.addEventListener("input", renderStudents);
})();
