(function () {
  "use strict";

  const studentIdInput = document.getElementById("student-id");
  const pinInput = document.getElementById("student-pin");
  const form = document.getElementById("student-login-form");
  const status = document.getElementById("login-status");
  const loginButton = document.getElementById("login-button");
  const TEST_STUDENT_ID = "000000";
  const TEST_STUDENT_PIN = "0176";

  function setStatus(message, isError) {
    status.textContent = message || "";
    status.classList.toggle("error", Boolean(isError));
  }

  async function findStudentBySchoolId(schoolId) {
    const client = window.GrowthNoteSupabase.getClient();
    const { data, error } = await client
      .from("students")
      .select("id, school_id, name, nickname, pin")
      .eq("school_id", schoolId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const schoolId = window.GrowthNoteRules.normalizeStudentId(studentIdInput.value);
    const pin = pinInput.value.trim();

    if (!schoolId) {
      setStatus("학번 아이디를 입력하세요. 예: 30110", true);
      studentIdInput.focus();
      return;
    }

    if (!pin) {
      setStatus("PIN을 입력하세요.", true);
      pinInput.focus();
      return;
    }

    loginButton.disabled = true;
    setStatus("학생 정보를 확인하는 중입니다.");

    try {
      if (schoolId === TEST_STUDENT_ID && pin === TEST_STUDENT_PIN) {
        sessionStorage.setItem("growth-note-student-id", "demo-000000");
        sessionStorage.setItem("growth-note-demo-student", "true");
        window.location.href = "student.html";
        return;
      }

      const student = await findStudentBySchoolId(schoolId);

      if (!student) {
        setStatus("해당 학번 아이디의 학생을 찾을 수 없습니다.", true);
        studentIdInput.select();
        return;
      }

      if (pin !== String(student.pin)) {
        setStatus("PIN이 맞지 않습니다.", true);
        pinInput.select();
        return;
      }

      sessionStorage.removeItem("growth-note-demo-student");
      sessionStorage.setItem("growth-note-student-id", student.id);
      window.location.href = "student.html";
    } catch (error) {
      setStatus(window.GrowthNoteSupabase.formatError(error), true);
    } finally {
      loginButton.disabled = false;
    }
  });

  setStatus("학번 아이디와 PIN을 입력하세요. 테스트: 000000 / 0176");
})();
