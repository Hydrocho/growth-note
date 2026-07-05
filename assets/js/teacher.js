(function () {
  "use strict";

  const ADMIN_PIN = "2468";
  const adminGate = document.getElementById("admin-gate");
  const teacherApp = document.getElementById("teacher-app");
  const adminForm = document.getElementById("admin-form");
  const adminPin = document.getElementById("admin-pin");
  const adminStatus = document.getElementById("admin-status");
  const teacherStatus = document.getElementById("teacher-status");

  // Sidebar Menu Buttons
  const menuBtnStudents = document.getElementById("menu-btn-students");
  const menuBtnPraise = document.getElementById("menu-btn-praise");
  const logoutBtn = document.getElementById("logout-btn");

  // Panels
  const panelStudents = document.getElementById("panel-students");
  const panelPraise = document.getElementById("panel-praise");

  // Filter & Search Controls
  const filterGrade = document.getElementById("filter-grade");
  const filterClass = document.getElementById("filter-class");
  const filterSearch = document.getElementById("filter-search");
  const studentTableBody = document.getElementById("student-table-body");
  const studentCountBadge = document.getElementById("student-count-badge");

  // Praise Panel Controls
  const studentPraiseSearch = document.getElementById("student-praise-search");
  const studentPraiseList = document.getElementById("student-praise-list");
  const selectedStudentTitle = document.getElementById("selected-student-title");
  const selectedStudentMeta = document.getElementById("selected-student-meta");
  const praiseResult = document.getElementById("praise-result");
  const praiseFilterGrade = document.getElementById("praise-filter-grade");
  const praiseFilterClass = document.getElementById("praise-filter-class");
  const btnPraiseMinus = document.getElementById("btn-praise-minus");
  const btnPraisePlus = document.getElementById("btn-praise-plus");
  const praiseScoreValue = document.getElementById("praise-score-value");
  const btnPraiseSubmit = document.getElementById("btn-praise-submit");
  const praiseSubmitText = document.getElementById("praise-submit-text");
  const selectedStudentsBadges = document.getElementById("selected-students-badges");

  // Modals
  const modalEdit = document.getElementById("modal-edit");
  const btnCloseEdit = document.getElementById("btn-close-edit");
  const resetPinButton = document.getElementById("reset-pin-button");
  const deleteStudentButton = document.getElementById("delete-student-button");
  const formEditStudent = document.getElementById("form-edit-student");
  const btnBulkImport = document.getElementById("btn-bulk-import");

  // Praise Result Modal Selectors
  const modalPraiseResult = document.getElementById("modal-praise-result");
  const btnClosePraiseResult = document.getElementById("btn-close-praise-result");
  const btnPraiseResultOk = document.getElementById("btn-praise-result-ok");
  const praiseResultModalBody = document.getElementById("praise-result-modal-body");

  // Bulk Import Modal selectors
  const modalBulk = document.getElementById("modal-bulk");
  const btnCloseBulk = document.getElementById("btn-close-bulk");
  const btnCancelBulk = document.getElementById("btn-cancel-bulk");
  const formBulkStudent = document.getElementById("form-bulk-student");
  const bulkInput = document.getElementById("bulk-input");

  let students = [];
  let selectedStudentIds = new Set();
  let currentPraiseScore = 10;
  let activeTab = "students"; // "students" or "praise"
  let busy = false;
  let realtimeChannel = null;

  function setStatus(target, message, isError) {
    if (!target) return;
    target.textContent = message || "";
    target.classList.toggle("error", Boolean(isError));
  }

  function setBusy(isBusy) {
    busy = isBusy;
    document.querySelectorAll("button, input, select").forEach((el) => {
      el.disabled = isBusy;
    });
  }

  // Parse grade and class from school_id (e.g., 30101 -> Grade 3, Class 01)
  function parseGradeClass(schoolId) {
    if (!schoolId || schoolId.length < 3) {
      return { grade: "", class: "" };
    }
    const grade = schoolId.charAt(0);
    const cls = parseInt(schoolId.substring(1, 3), 10);
    return { grade, class: String(cls) };
  }

  // Handle Tab Switch
  function switchTab(tabName) {
    activeTab = tabName;
    menuBtnStudents.classList.toggle("active", tabName === "students");
    menuBtnPraise.classList.toggle("active", tabName === "praise");

    panelStudents.classList.toggle("hidden", tabName !== "students");
    panelPraise.classList.toggle("hidden", tabName !== "praise");

    if (tabName === "praise") {
      renderPraisePanel();
    } else {
      renderStudentTable();
    }
  }

  // Local storage helpers for student names
  function getLocalNames() {
    try {
      const stored = localStorage.getItem("growth-note-local-names");
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error("로컬 이름을 읽는 도중 오류가 발생했습니다:", e);
      return {};
    }
  }

  function getLocalName(schoolId) {
    const names = getLocalNames();
    return names[schoolId] || "(미지정)";
  }

  function saveLocalName(schoolId, name) {
    const names = getLocalNames();
    names[schoolId] = name;
    localStorage.setItem("growth-note-local-names", JSON.stringify(names));
  }

  function deleteLocalName(schoolId) {
    const names = getLocalNames();
    delete names[schoolId];
    localStorage.setItem("growth-note-local-names", JSON.stringify(names));
  }

  // Dynamic rendering for Grade/Class select filter options
  function updateFilterOptions() {
    const prevGrade = filterGrade.value;
    const prevClass = filterClass.value;
    const prevPraiseGrade = praiseFilterGrade ? praiseFilterGrade.value : "";
    const prevPraiseClass = praiseFilterClass ? praiseFilterClass.value : "";

    const grades = new Set();
    const classes = new Set();

    students.forEach((student) => {
      const parsed = parseGradeClass(student.school_id);
      if (parsed.grade) grades.add(parsed.grade);
      if (parsed.class) classes.add(parsed.class);
    });

    const sortedGrades = Array.from(grades).sort();
    const sortedClasses = Array.from(classes).sort((a, b) => Number(a) - Number(b));

    // Grade options update
    filterGrade.innerHTML = '<option value="">학년 전체</option>';
    sortedGrades.forEach((g) => {
      const opt = document.createElement("option");
      opt.value = g;
      opt.textContent = `${g}학년`;
      filterGrade.appendChild(opt);
    });

    if (praiseFilterGrade) {
      praiseFilterGrade.innerHTML = '<option value="">학년 전체</option>';
      sortedGrades.forEach((g) => {
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = `${g}학년`;
        praiseFilterGrade.appendChild(opt);
      });
    }

    // Class options update
    filterClass.innerHTML = '<option value="">반 전체</option>';
    sortedClasses.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = `${c}반`;
      filterClass.appendChild(opt);
    });

    if (praiseFilterClass) {
      praiseFilterClass.innerHTML = '<option value="">반 전체</option>';
      sortedClasses.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = `${c}반`;
        praiseFilterClass.appendChild(opt);
      });
    }

    // Restore previous selection or default value
    if (prevGrade && sortedGrades.includes(prevGrade)) {
      filterGrade.value = prevGrade;
    } else if (sortedGrades.includes("3")) {
      filterGrade.value = "3";
    } else if (sortedGrades.length > 0) {
      filterGrade.value = sortedGrades[0];
    } else {
      filterGrade.value = "";
    }

    if (prevClass && sortedClasses.includes(prevClass)) {
      filterClass.value = prevClass;
    } else if (sortedClasses.includes("1")) {
      filterClass.value = "1";
    } else if (sortedClasses.length > 0) {
      filterClass.value = sortedClasses[0];
    } else {
      filterClass.value = "";
    }

    // Restore praise filter selection
    if (praiseFilterGrade) {
      if (prevPraiseGrade && sortedGrades.includes(prevPraiseGrade)) {
        praiseFilterGrade.value = prevPraiseGrade;
      } else {
        praiseFilterGrade.value = "";
      }
    }

    if (praiseFilterClass) {
      if (prevPraiseClass && sortedClasses.includes(prevPraiseClass)) {
        praiseFilterClass.value = prevPraiseClass;
      } else {
        praiseFilterClass.value = "";
      }
    }
  }

  // Setup Supabase Realtime Subscription for students table changes
  function setupRealtimeSubscription() {
    if (realtimeChannel) {
      realtimeChannel.unsubscribe();
      realtimeChannel = null;
    }

    try {
      const client = window.GrowthNoteSupabase.getClient();
      realtimeChannel = client
        .channel("students-realtime-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "students" }, (payload) => {
          // 실시간으로 가입/수정/삭제 등 감지 시 학생 리스트만 리로드 (바쁜 상태가 아닐 때)
          if (!busy) {
            loadStudents();
          }
        })
        .subscribe();
    } catch (e) {
      console.error("Realtime subscription failed:", e);
    }
  }

  // Load Students from Supabase and merge with Local Storage Mappings
  async function loadStudents() {
    try {
      setBusy(true);
      const client = window.GrowthNoteSupabase.getClient();
      
      // 서버에서 학생의 학번 및 XP/레벨 정보, 그리고 획득 아바타/펫의 개수(Count)만 가볍게 가져옵니다.
      // (서버에 저장되지 않는 이름/PIN 정보는 조회에서 제외하여 성능을 대폭 개선합니다.)
      const { data, error } = await client
        .from("students")
        .select(`
          id, 
          school_id, 
          total_xp, 
          level, 
          unlocked_avatars(count), 
          unlocked_pets(count)
        `)
        .order("school_id", { ascending: true });

      if (error) throw error;

      // 로컬 브라우저에 저장된 학번-이름 목록 가져오기
      const localNamesMap = getLocalNames();

      // 서버 학번과 로컬 학번을 병합하여 고유한 학번 목록 생성
      const allSchoolIds = new Set();
      (data || []).forEach((s) => {
        if (s.school_id) allSchoolIds.add(s.school_id);
      });
      Object.keys(localNamesMap).forEach((sid) => {
        allSchoolIds.add(sid);
      });

      // 학번 오름차순으로 정렬
      const sortedSchoolIds = Array.from(allSchoolIds).sort();

      // 서버 데이터를 검색하기 쉽게 Map으로 빌드
      const serverStudentMap = new Map();
      (data || []).forEach((s) => {
        serverStudentMap.set(s.school_id, s);
      });

      // 최종 학생 목록 병합 매핑
      students = sortedSchoolIds.map((schoolId) => {
        const serverStudent = serverStudentMap.get(schoolId);
        const localName = localNamesMap[schoolId] || "(미지정)";

        if (serverStudent) {
          const avatarCount = serverStudent.unlocked_avatars && serverStudent.unlocked_avatars[0]
            ? serverStudent.unlocked_avatars[0].count
            : 0;
          const petCount = serverStudent.unlocked_pets && serverStudent.unlocked_pets[0]
            ? serverStudent.unlocked_pets[0].count
            : 0;

          return {
            id: serverStudent.id,
            school_id: schoolId,
            name: localName,
            nickname: localName,
            total_xp: serverStudent.total_xp,
            level: serverStudent.level,
            avatarCount: avatarCount,
            petCount: petCount
          };
        } else {
          // 아직 회원가입을 하지 않은 미가입 상태 학생
          return {
            id: null, // 미가입 상태
            school_id: schoolId,
            name: localName,
            nickname: localName,
            total_xp: 0,
            level: 1,
            avatarCount: 0,
            petCount: 0
          };
        }
      });

      updateFilterOptions();
      renderStudentTable();
      renderPraisePanel();
    } catch (e) {
      alert("학생 목록을 가져오는 도중 오류가 발생했습니다: " + e.message);
    } finally {
      setBusy(false);
    }
  }

  // Filter and Render Student Table
  function renderStudentTable() {
    const searchVal = filterSearch.value.trim().toLowerCase();
    const gradeVal = filterGrade.value;
    const classVal = filterClass.value;

    const filtered = students.filter((student) => {
      const parsed = parseGradeClass(student.school_id);
      
      // Grade filter
      if (gradeVal && parsed.grade !== gradeVal) return false;
      // Class filter
      if (classVal && parsed.class !== classVal) return false;

      // Search match
      if (searchVal) {
        const text = `${student.school_id} ${student.name || ""}`.toLowerCase();
        if (!text.includes(searchVal)) return false;
      }

      return true;
    });

    studentCountBadge.textContent = `조회 결과: ${filtered.length}명 / 전체: ${students.length}명`;
    studentTableBody.innerHTML = "";

    if (!filtered.length) {
      studentTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state" style="text-align: center; padding: 24px;">조회된 학생이 없습니다.</td>
        </tr>
      `;
      return;
    }

    filtered.forEach((student) => {
      const tr = document.createElement("tr");

      // Checkbox
      const tdCheck = document.createElement("td");
      tdCheck.innerHTML = `<input type="checkbox" class="student-select-check" data-id="${student.id || ""}">`;
      tr.appendChild(tdCheck);

      // School ID
      const tdSchoolId = document.createElement("td");
      tdSchoolId.textContent = student.school_id;
      tr.appendChild(tdSchoolId);

      // Name
      const tdName = document.createElement("td");
      tdName.textContent = student.name || "-";
      tdName.style.fontWeight = "700";
      tdName.style.color = "var(--primary)";
      tr.appendChild(tdName);

      // Actions Column (Edit, Reset PIN, Delete)
      const tdActions = document.createElement("td");
      tdActions.className = "actions";

      // Edit Button
      const btnEdit = document.createElement("button");
      btnEdit.className = "button secondary";
      btnEdit.textContent = "수정";
      btnEdit.type = "button";
      btnEdit.addEventListener("click", () => openEditModal(student));
      tdActions.appendChild(btnEdit);

      // PIN Reset Button
      const btnReset = document.createElement("button");
      btnReset.className = "button secondary";
      btnReset.textContent = "비번초기화";
      btnReset.type = "button";
      btnReset.disabled = !student.id;
      btnReset.addEventListener("click", () => resetStudentPin(student));
      tdActions.appendChild(btnReset);

      // Delete Button
      const btnDel = document.createElement("button");
      btnDel.className = "button danger";
      btnDel.textContent = "삭제";
      btnDel.type = "button";
      btnDel.addEventListener("click", () => deleteStudent(student));
      tdActions.appendChild(btnDel);

      tr.appendChild(tdActions);



      // UUID
      const tdUuid = document.createElement("td");
      if (student.id) {
        tdUuid.innerHTML = `
          <span style="font-family: monospace; font-size: 12px; color: var(--muted);">${student.id.substring(0, 18)}...</span>
          <button class="icon-button" type="button" style="width: 26px; height: 26px; display: inline-flex; border: 0;" title="UUID 복사" onclick="navigator.clipboard.writeText('${student.id}')">
            <span class="material-symbols-outlined" style="font-size: 14px;">content_copy</span>
          </button>
        `;
      } else {
        tdUuid.innerHTML = `<span style="font-family: monospace; font-size: 12px; color: var(--text-muted); font-style: italic;">(미가입)</span>`;
      }
      tr.appendChild(tdUuid);

      // Collection
      const tdCollect = document.createElement("td");
      tdCollect.innerHTML = `
        <span class="avatar-badge-count" title="아바타 수집"><span class="material-symbols-outlined" style="font-size: 14px; font-variation-settings: 'FILL' 1;">face</span> ${student.avatarCount}</span>
        <span class="avatar-badge-count" title="마이펫 수집"><span class="material-symbols-outlined" style="font-size: 14px; font-variation-settings: 'FILL' 1;">pets</span> ${student.petCount}</span>
      `;
      tr.appendChild(tdCollect);

      // XP
      const tdXp = document.createElement("td");
      tdXp.textContent = Number(student.total_xp || 0).toLocaleString("ko-KR");
      tdXp.style.fontWeight = "800";
      tdXp.style.color = "var(--accent)";
      tr.appendChild(tdXp);

      studentTableBody.appendChild(tr);
    });
  }

  // Render Praise Panel Student list & Details (Multiple Selection Support)
  function renderPraisePanel() {
    const searchVal = studentPraiseSearch.value.trim().toLowerCase();
    const gradeVal = praiseFilterGrade.value;
    const classVal = praiseFilterClass.value;
    
    studentPraiseList.innerHTML = "";

    // 학년과 반이 모두 선택된 경우에만 학생 목록 노출
    if (!gradeVal || !classVal) {
      studentPraiseList.innerHTML = `<p class="empty-state" style="padding: 12px; grid-column: 1 / -1; text-align: center; color: var(--muted); font-weight: 700;">학년과 반을 모두 선택해야 학생 명단이 나타납니다.</p>`;
      return;
    }

    const filtered = students.filter((student) => {
      const parsed = parseGradeClass(student.school_id);
      
      // Grade filter
      if (gradeVal && parsed.grade !== gradeVal) return false;
      // Class filter
      if (classVal && parsed.class !== classVal) return false;

      // Search match
      if (searchVal) {
        const text = `${student.school_id} ${student.name || ""}`.toLowerCase();
        if (!text.includes(searchVal)) return false;
      }

      return true;
    });

    if (!filtered.length) {
      studentPraiseList.innerHTML = `<p class="empty-state" style="padding: 12px; grid-column: 1 / -1; text-align: center; color: var(--muted); font-weight: 700;">조회된 학생이 없습니다.</p>`;
      return;
    }

    filtered.forEach((student) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `student-row${selectedStudentIds.has(student.id) ? " active" : ""}`;
      
      const nameText = student.id ? student.name : `${student.name} (미가입)`;
      btn.innerHTML = `
        <span>${student.school_id} · ${nameText}</span>
        <small>${Number(student.total_xp || 0).toLocaleString("ko-KR")} XP · Lv.${student.level || 1}</small>
      `;
      
      if (!student.id) {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
      } else {
        btn.addEventListener("click", () => {
          if (selectedStudentIds.has(student.id)) {
            selectedStudentIds.delete(student.id);
          } else {
            selectedStudentIds.add(student.id);
          }
          renderPraisePanel();
          renderSelectedStudentInfo();
        });
      }
      studentPraiseList.appendChild(btn);
    });
  }

  // Render selected students detailed praise meta (Multiple students)
  function renderSelectedStudentInfo() {
    selectedStudentsBadges.innerHTML = "";

    if (selectedStudentIds.size === 0) {
      selectedStudentTitle.textContent = "학생을 선택하세요";
      selectedStudentMeta.textContent = "";
      selectedStudentMeta.style.display = "none";
      praiseResult.classList.add("hidden");
      return;
    }

    const selectedList = students.filter(s => selectedStudentIds.has(s.id));

    if (selectedList.length === 1) {
      const single = selectedList[0];
      selectedStudentTitle.textContent = `${single.school_id} · ${single.name}`;
      selectedStudentMeta.textContent = `현재 ${Number(single.total_xp || 0).toLocaleString("ko-KR")} XP · Lv.${single.level || 1}`;
      selectedStudentMeta.style.display = "block";
    } else {
      selectedStudentTitle.textContent = `${selectedList[0].name} 외 ${selectedList.length - 1}명 선택됨`;
      selectedStudentMeta.textContent = `총 ${selectedList.length}명의 학생이 선택되었습니다.`;
      selectedStudentMeta.style.display = "block";
    }

    selectedList.forEach(student => {
      const badge = document.createElement("span");
      badge.className = "count-badge";
      badge.style.background = "var(--primary-light)";
      badge.style.color = "var(--primary-dark)";
      badge.style.border = "1px solid var(--primary)";
      badge.style.padding = "4px 8px";
      badge.style.borderRadius = "4px";
      badge.style.fontSize = "12px";
      badge.style.fontWeight = "700";
      badge.style.display = "inline-flex";
      badge.style.alignItems = "center";
      badge.style.gap = "4px";
      badge.innerHTML = `
        ${student.school_id} ${student.name}
        <span class="material-symbols-outlined" style="font-size: 14px; cursor: pointer; color: var(--danger);" title="선택 해제">close</span>
      `;
      
      badge.querySelector("span").addEventListener("click", (e) => {
        e.stopPropagation();
        selectedStudentIds.delete(student.id);
        renderPraisePanel();
        renderSelectedStudentInfo();
      });
      selectedStudentsBadges.appendChild(badge);
    });

    praiseResult.classList.add("hidden");
  }

  // Score Update UI Helper
  function updatePraiseScoreUI() {
    praiseScoreValue.textContent = `+${currentPraiseScore}`;
    praiseSubmitText.textContent = `점수 부여 (+${currentPraiseScore})`;
  }

  // Praise Submit Multi logic
  async function submitPraiseScore() {
    if (selectedStudentIds.size === 0) {
      alert("점수를 부여할 학생을 먼저 선택해 주세요.");
      return;
    }

    const score = currentPraiseScore;
    const selectedList = students.filter(s => selectedStudentIds.has(s.id));
    const studentNames = selectedList.map(s => `${s.school_id} ${s.name}`).join(", ");
    
    const ok = window.confirm(`선택한 ${selectedList.length}명의 학생에게 각각 +${score}점의 칭찬 점수를 일괄 부여하시겠습니까?\n\n[대상 학생]\n${studentNames}`);
    if (!ok) return;

    try {
      setBusy(true);
      setStatus(teacherStatus, "칭찬 점수를 지급하고 있습니다...");

      // 각 학생마다 assignPraise API 호출 실행
      const promises = selectedList.map(student => 
        window.GrowthNoteRewards.assignPraise(student.id, "custom", {
          customXp: score,
          note: ""
        })
      );

      const results = await Promise.all(promises);

      // 선택 리스트 초기화
      selectedStudentIds.clear();

      // 학생 데이터 재로드
      await loadStudents();
      renderSelectedStudentInfo();

      let resultText = `<strong>총 ${results.length}명의 학생에게 칭찬 점수(+${score} XP)가 성공적으로 지급되었습니다!</strong><br><br>`;
      results.forEach((res, index) => {
        const student = selectedList[index];
        resultText += `· ${student.school_id} ${student.name}: Lv.${res.oldLevel} → Lv.${res.newLevel} ${res.reward ? `🎁 (신규 보상 언락!)` : ""}<br>`;
      });
      
      praiseResultModalBody.innerHTML = resultText;
      toggleModal(modalPraiseResult, true);
      setStatus(teacherStatus, "성공적으로 저장되었습니다.");
    } catch (e) {
      setStatus(teacherStatus, "칭찬 등록 오류: " + e.message, true);
    } finally {
      setBusy(false);
    }
  }

  async function giftPetDrawOpportunity() {
    if (selectedStudentIds.size === 0) {
      alert("뽑기권을 부여할 학생을 먼저 선택해 주세요.");
      return;
    }

    const selectedList = students.filter(s => selectedStudentIds.has(s.id));
    const studentNames = selectedList.map(s => `${s.school_id} ${s.name}`).join(", ");
    
    const ok = window.confirm(`선택한 ${selectedList.length}명의 학생에게 각각 마이펫 추가 뽑기 기회(뽑기권)를 1회씩 부여하시겠습니까?\n\n[대상 학생]\n${studentNames}`);
    if (!ok) return;

    try {
      setBusy(true);
      setStatus(teacherStatus, "마이펫 뽑기권을 지급하고 있습니다...");

      const client = window.GrowthNoteSupabase.getClient();

      // 각 학생마다 student_logs 에 로그를 남기고, students 테이블에 dummy update를 실행하여 Realtime 알림을 강제 트리거합니다.
      const promises = selectedList.map(async (student) => {
        // 1. 로그 기록 추가
        const { error: logErr } = await client.from("student_logs").insert({
          student_id: student.id,
          type: "pet_ticket_grant",
          category: "pet_ticket",
          description: "마이펫 추가 뽑기 기회 지급",
          xp_change: 0
        });
        if (logErr) throw logErr;

        // 2. students 테이블 dummy update로 실시간 갱신 트리거
        const { error: updateErr } = await client.from("students")
          .update({ total_xp: student.total_xp })
          .eq("id", student.id);
        if (updateErr) throw updateErr;
      });

      await Promise.all(promises);

      // 선택 리스트 초기화
      selectedStudentIds.clear();

      // 학생 데이터 재로드
      await loadStudents();
      renderSelectedStudentInfo();

      praiseResultModalBody.innerHTML = `<strong>총 ${selectedList.length}명의 학생에게 마이펫 추가 뽑기권이 성공적으로 지급되었습니다!</strong>`;
      toggleModal(modalPraiseResult, true);
      setStatus(teacherStatus, "성공적으로 저장되었습니다.");
    } catch (e) {
      setStatus(teacherStatus, "뽑기권 등록 오류: " + e.message, true);
    } finally {
      setBusy(false);
    }
  }

  // Open / Close Modals
  function toggleModal(modal, active) {
    modal.classList.toggle("active", active);
  }



  // Open Edit Modal
  function openEditModal(student) {
    selectedStudent = student; // 이전 학번 추적을 위해 전역 변수에 할당
    document.getElementById("edit-student-id").value = student.id;
    document.getElementById("edit-school-id").value = student.school_id;
    document.getElementById("edit-name").value = student.name === "(미지정)" ? "" : student.name;
    toggleModal(modalEdit, true);
  }

  // Submit Edit Student details
  async function handleEditStudent(e) {
    e.preventDefault();
    if (!selectedStudent) return;

    const id = document.getElementById("edit-student-id").value;
    const schoolId = window.GrowthNoteRules.normalizeStudentId(document.getElementById("edit-school-id").value);
    const name = document.getElementById("edit-name").value.trim();
    const oldSchoolId = selectedStudent.school_id;

    if (!schoolId || !name) {
      alert("학번과 이름은 필수 항목입니다.");
      return;
    }

    try {
      setBusy(true);
      
      if (id) {
        const client = window.GrowthNoteSupabase.getClient();
        // Supabase 에는 학번만 업데이트 (이름 정보 제외)
        const { error } = await client
          .from("students")
          .update({
            school_id: schoolId
          })
          .eq("id", id);

        if (error) throw error;
      }

      // 학번이 변경되었으면 기존 학번의 이름을 삭제하고 새 학번으로 저장
      if (oldSchoolId && oldSchoolId !== schoolId) {
        deleteLocalName(oldSchoolId);
      }
      saveLocalName(schoolId, name);

      toggleModal(modalEdit, false);
      alert("학생 정보가 수정되었습니다. (이름 정보는 로컬에만 저장됨)");
      await loadStudents();
    } catch (err) {
      alert("학생 정보 수정 오류: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  // Reset Student PIN
  async function resetStudentPin(student) {
    if (!student.id) {
      alert("아직 가입되지 않은 학생입니다. 학생이 먼저 회원가입을 해야 PIN을 변경할 수 있습니다.");
      return;
    }
    const displayName = student.name && student.name !== "(미지정)" ? student.name : student.school_id;
    const nextPin = window.prompt(`${displayName} (${student.school_id}) 학생의 새 PIN 비밀번호를 입력해 주세요.`, "0000");
    if (nextPin === null) return;

    const pin = nextPin.trim();
    if (!pin) {
      alert("새 비밀번호 PIN은 필수 항목입니다.");
      return;
    }

    try {
      setBusy(true);
      const client = window.GrowthNoteSupabase.getClient();
      const hashedPin = await window.GrowthNoteRules.hashPin(pin);
      const { error } = await client
        .from("students")
        .update({ pin: hashedPin })
        .eq("id", student.id);

      if (error) throw error;
      alert(`PIN이 ${pin}(으)로 성공적으로 초기화되었습니다.`);
      await loadStudents();
    } catch (err) {
      alert("비밀번호 변경 오류: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  // Delete Student
  async function deleteStudent(student) {
    const displayName = student.name && student.name !== "(미지정)" ? student.name : student.school_id;
    const ok = window.confirm(`${displayName} (${student.school_id}) 학생을 삭제하시겠습니까? 데이터(획득 보상 및 로그)가 전부 영구적으로 유실됩니다.`);
    if (!ok) return;

    try {
      setBusy(true);
      if (student.id) {
        const client = window.GrowthNoteSupabase.getClient();
        const { error } = await client
          .from("students")
          .delete()
          .eq("id", student.id);

        if (error) throw error;
      }

      // 삭제 성공 시 로컬 이름 매핑에서도 삭제
      deleteLocalName(student.school_id);

      alert("학생 데이터가 정상적으로 삭제되었습니다.");
      await loadStudents();
    } catch (err) {
      alert("학생 삭제 오류: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  // Bulk register student name mappings ONLY to local computer
  async function handleBulkImportSubmit(e) {
    e.preventDefault();
    const rawVal = bulkInput.value.trim();
    if (!rawVal) {
      alert("입력 창이 비어 있습니다. [학번 이름] 목록을 입력해 주세요.");
      return;
    }

    const lines = rawVal.split(/\r?\n/);
    const localNamesToSave = [];

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      // Split by tab or spaces
      const tokens = line.split(/[\t\s]+/);
      if (tokens.length >= 2) {
        const rawSchoolId = tokens[0].trim();
        const name = tokens[1].trim();
        const schoolId = window.GrowthNoteRules.normalizeStudentId(rawSchoolId);
        
        if (schoolId && name) {
          localNamesToSave.push({ schoolId, name });
        }
      }
    }

    if (!localNamesToSave.length) {
      alert("올바른 형식의 [학번 이름] 데이터가 발견되지 않았습니다. 형식 예: 30101 홍길동");
      return;
    }

    const confirmMsg = `입력하신 정보로 총 ${localNamesToSave.length}명의 학생 이름 정보를 로컬 컴퓨터에 일괄 등록하시겠습니까?\n\n(이름 정보는 서버에 저장되지 않고 현재 브라우저에만 안전하게 보관됩니다.)`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setBusy(true);

      // 로컬 컴퓨터에 이름 매핑 일괄 저장 (서버 데이터베이스 통신 없음)
      for (const item of localNamesToSave) {
        saveLocalName(item.schoolId, item.name);
      }

      bulkInput.value = "";
      toggleModal(modalBulk, false);
      alert(`성공적으로 ${localNamesToSave.length}명의 학생 이름 정보가 로컬 컴퓨터에 등록되었습니다.`);
      await loadStudents();
    } catch (err) {
      alert("일괄 등록 중 오류가 발생했습니다: " + err.message);
    } finally {
      setBusy(false);
    }
  }



  // Admin Verification Submit
  adminForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (adminPin.value.trim() !== ADMIN_PIN) {
      setStatus(adminStatus, "관리자 PIN 번호가 일치하지 않습니다.", true);
      adminPin.select();
      return;
    }

    adminGate.classList.add("hidden");
    teacherApp.classList.remove("hidden");
    loadStudents();
    setupRealtimeSubscription();
  });

  // Tab Menu Bindings
  menuBtnStudents.addEventListener("click", () => switchTab("students"));
  menuBtnPraise.addEventListener("click", () => switchTab("praise"));

  // Event Listeners for Filters
  filterGrade.addEventListener("change", renderStudentTable);
  filterClass.addEventListener("change", renderStudentTable);
  filterSearch.addEventListener("input", renderStudentTable);

  // Praise Filter & Search binding
  studentPraiseSearch.addEventListener("input", renderPraisePanel);
  praiseFilterGrade.addEventListener("change", renderPraisePanel);
  praiseFilterClass.addEventListener("change", renderPraisePanel);

  // Score control bindings
  btnPraiseMinus.addEventListener("click", () => {
    currentPraiseScore = Math.max(10, currentPraiseScore - 10);
    updatePraiseScoreUI();
  });
  btnPraisePlus.addEventListener("click", () => {
    currentPraiseScore = Math.min(30, currentPraiseScore + 10);
    updatePraiseScoreUI();
  });
  btnPraiseSubmit.addEventListener("click", submitPraiseScore);

  const btnPraiseGiftPet = document.getElementById("btn-praise-gift-pet");
  if (btnPraiseGiftPet) {
    btnPraiseGiftPet.addEventListener("click", giftPetDrawOpportunity);
  }

  const btnPraiseSelectAll = document.getElementById("btn-praise-select-all");
  const btnPraiseDeselectAll = document.getElementById("btn-praise-deselect-all");

  if (btnPraiseSelectAll) {
    btnPraiseSelectAll.addEventListener("click", () => {
      const searchVal = studentPraiseSearch.value.trim().toLowerCase();
      const gradeVal = praiseFilterGrade.value;
      const classVal = praiseFilterClass.value;

      if (!gradeVal || !classVal) return;

      students.forEach((student) => {
        const parsed = parseGradeClass(student.school_id);
        if (parsed.grade === gradeVal && parsed.class === classVal) {
          if (searchVal) {
            const text = `${student.school_id} ${student.name || ""}`.toLowerCase();
            if (!text.includes(searchVal)) return;
          }
          if (student.id) {
            selectedStudentIds.add(student.id);
          }
        }
      });

      renderPraisePanel();
      renderSelectedStudentInfo();
    });
  }

  if (btnPraiseDeselectAll) {
    btnPraiseDeselectAll.addEventListener("click", () => {
      selectedStudentIds.clear();
      renderPraisePanel();
      renderSelectedStudentInfo();
    });
  }

  // Modal Triggers
  btnCloseEdit.addEventListener("click", () => toggleModal(modalEdit, false));
  btnBulkImport.addEventListener("click", () => toggleModal(modalBulk, true));
  btnCloseBulk.addEventListener("click", () => toggleModal(modalBulk, false));
  btnCancelBulk.addEventListener("click", () => toggleModal(modalBulk, false));
  btnClosePraiseResult.addEventListener("click", () => toggleModal(modalPraiseResult, false));
  btnPraiseResultOk.addEventListener("click", () => toggleModal(modalPraiseResult, false));

  // Forms submit binding
  formEditStudent.addEventListener("submit", handleEditStudent);
  formBulkStudent.addEventListener("submit", handleBulkImportSubmit);

  // Logout handler
  logoutBtn.addEventListener("click", () => {
    adminForm.reset();
    adminPin.value = "";
    teacherApp.classList.add("hidden");
    adminGate.classList.remove("hidden");
    setStatus(adminStatus, "로그아웃 되었습니다.");
    if (realtimeChannel) {
      realtimeChannel.unsubscribe();
      realtimeChannel = null;
    }
  });

})();
