# Daily My Pet Draw Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Korean-date daily My Pet draw on the student home screen, remove My Pets from level-up rewards, and reuse the gift-box modal for future avatar reward reveals.

**Architecture:** Keep the static app structure: HTML markup in `student.html`, behavior in `assets/js/student.js`, reward selection in `assets/js/rewards.js`, shared constants/path helpers in `assets/js/rules.js`, and styles in `assets/css/style.css`. Add a `daily_pet_draws` table with a unique `(student_id, draw_date)` constraint so Supabase prevents duplicate daily claims even when the UI is clicked repeatedly or opened on multiple devices.

**Tech Stack:** Static HTML/CSS/JavaScript, Supabase JS client v2, Postgres SQL migrations, Node `assert` static tests.

---

## File Structure

- Modify `assets/js/rewards.js`: make level-up reward selection avatar-only and add `selectDailyPetReward`.
- Modify `assets/js/student.js`: load daily draw state, compute Korean date, run daily pet draw Supabase writes, and control the reusable gift-box modal.
- Modify `student.html`: add daily draw card in the home panel and add one reusable reward draw modal.
- Modify `assets/css/style.css`: style the daily draw card and modal states.
- Modify `supabase/schema.sql`: add `daily_pet_draws` table, RLS, and anon policies.
- Create `supabase/migrations/20260705000000_add_daily_pet_draws.sql`: migration matching the schema update.
- Modify `tests/static-app/rewards.test.js`: assert avatar-only level-up and daily pet selection behavior.
- Modify `tests/static-app/student-layout.test.js`: assert the daily draw UI and reusable modal markup exist.

## Task 1: Reward Selection Tests

**Files:**
- Modify: `tests/static-app/rewards.test.js`
- Modify later: `assets/js/rewards.js`

- [ ] **Step 1: Replace reward selection expectations with avatar-only and daily-pet tests**

In `tests/static-app/rewards.test.js`, replace the first three `selectNextReward` blocks with:

```js
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
```

- [ ] **Step 2: Tighten level-up assertions**

At the end of the level-up test, replace the combined insert assertion with:

```js
  assert.strictEqual(levelUpResult.reward.type, "avatar");
  assert.strictEqual(levelUpMock.operations.avatarInserts.length, 1);
  assert.strictEqual(levelUpMock.operations.petInserts.length, 0);
  assert.strictEqual(levelUpMock.operations.studentUpdates[0].current_avatar_num, "1_001");
  assert.strictEqual(levelUpMock.operations.studentUpdates[0].display_avatar_type, "library");
```

- [ ] **Step 3: Run the failing reward test**

Run:

```bash
node tests/static-app/rewards.test.js
```

Expected: FAIL with `selectDailyPetReward` missing, or with `selectNextReward` returning a pet when avatars are exhausted.

## Task 2: Reward Selection Implementation

**Files:**
- Modify: `assets/js/rewards.js`
- Test: `tests/static-app/rewards.test.js`

- [ ] **Step 1: Replace `selectNextReward` with avatar-only logic and add `selectDailyPetReward`**

In `assets/js/rewards.js`, replace `selectNextReward` with:

```js
  function selectNextReward(options) {
    const rules = root.GrowthNoteRules;
    const ownedAvatars = options.ownedAvatars || [];
    const random = options.random || Math.random;

    const ownedAvatarKeys = new Set(ownedAvatars.map(avatarKey));
    const availableAvatars = rules.AVATAR_POOL.filter((item) => !ownedAvatarKeys.has(avatarKey(item)));

    if (!availableAvatars.length) return null;

    return { type: "avatar", item: chooseFrom(availableAvatars, random) };
  }

  function selectDailyPetReward(options) {
    const rules = root.GrowthNoteRules;
    const ownedPets = options.ownedPets || [];
    const random = options.random || Math.random;

    const ownedPetKeys = new Set(ownedPets.map(petKey));
    const availablePets = rules.PET_POOL.filter((item) => !ownedPetKeys.has(petKey(item)));

    if (!availablePets.length) return null;

    return { type: "pet", item: chooseFrom(availablePets, random) };
  }
```

- [ ] **Step 2: Export the new helper**

At the bottom of `assets/js/rewards.js`, change the export to:

```js
  root.GrowthNoteRewards = {
    selectNextReward,
    selectDailyPetReward,
    assignPraise
  };
```

- [ ] **Step 3: Run the reward test**

Run:

```bash
node tests/static-app/rewards.test.js
```

Expected: PASS and print `rewards.test.js passed`.

## Task 3: Daily Draw Schema

**Files:**
- Modify: `supabase/schema.sql`
- Create: `supabase/migrations/20260705000000_add_daily_pet_draws.sql`

- [ ] **Step 1: Add table to `supabase/schema.sql`**

After `public.unlocked_pets`, add:

```sql
create table if not exists public.daily_pet_draws (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  draw_date date not null,
  pet_id text,
  created_at timestamptz not null default now(),
  unique (student_id, draw_date)
);
```

- [ ] **Step 2: Enable RLS and policies in `supabase/schema.sql`**

After the existing `alter table public.unlocked_pets enable row level security;`, add:

```sql
alter table public.daily_pet_draws enable row level security;
```

After the existing pet policies, add:

```sql
create policy "anon read daily pet draws" on public.daily_pet_draws for select using (true);
create policy "anon insert daily pet draws" on public.daily_pet_draws for insert with check (true);
```

- [ ] **Step 3: Create migration file**

Create `supabase/migrations/20260705000000_add_daily_pet_draws.sql` with:

```sql
create table if not exists public.daily_pet_draws (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  draw_date date not null,
  pet_id text,
  created_at timestamptz not null default now(),
  unique (student_id, draw_date)
);

alter table public.daily_pet_draws enable row level security;

create policy "anon read daily pet draws" on public.daily_pet_draws for select using (true);
create policy "anon insert daily pet draws" on public.daily_pet_draws for insert with check (true);
```

- [ ] **Step 4: Verify schema contains the table and policy names**

Run:

```bash
rg -n "daily_pet_draws|anon read daily pet draws|anon insert daily pet draws" supabase
```

Expected: output from both `supabase/schema.sql` and `supabase/migrations/20260705000000_add_daily_pet_draws.sql`.

## Task 4: Student Layout Tests

**Files:**
- Modify: `tests/static-app/student-layout.test.js`
- Modify later: `student.html`

- [ ] **Step 1: Add daily draw markup assertions**

Before `console.log("student-layout.test.js passed");`, add:

```js
for (const copy of [
  "id=\"daily-pet-draw-card\"",
  "id=\"daily-pet-draw-button\"",
  "id=\"daily-pet-draw-status\"",
  "오늘의 마이펫 뽑기",
  "id=\"reward-draw-modal\"",
  "id=\"reward-draw-box\"",
  "id=\"reward-draw-count\"",
  "id=\"reward-draw-result-image\""
]) {
  assert(html.includes(copy), `student.html should include daily draw UI: ${copy}`);
}
```

- [ ] **Step 2: Update level guide copy assertion**

Replace the old level-guide line that says avatars or My Pets are received on level-up with:

```js
  "레벨업할 때마다 새로운 아바타 보상을 받을 수 있습니다."
```

- [ ] **Step 3: Run the failing layout test**

Run:

```bash
node tests/static-app/student-layout.test.js
```

Expected: FAIL because the daily draw markup has not been added yet.

## Task 5: Student HTML Markup

**Files:**
- Modify: `student.html`
- Test: `tests/static-app/student-layout.test.js`

- [ ] **Step 1: Add daily draw card inside the home panel**

In `student.html`, add this block after the `.summary-grid` section and before the closing `</section>` for `data-tab-panel="home"`:

```html
        <section id="daily-pet-draw-card" class="daily-draw-card surface-card" data-daily-draw-state="loading">
          <div class="daily-draw-copy">
            <span class="eyebrow">Daily Gift</span>
            <h2>오늘의 마이펫 뽑기</h2>
            <p id="daily-pet-draw-status">오늘 받을 수 있는 마이펫을 확인하고 있어요.</p>
          </div>
          <button id="daily-pet-draw-button" class="button daily-draw-button" type="button" disabled>
            <span class="material-symbols-outlined" aria-hidden="true">redeem</span>
            <span>뽑기</span>
          </button>
        </section>
```

- [ ] **Step 2: Add reusable reward modal before scripts**

In `student.html`, add this block after `starter-avatar-modal` and before the script tags:

```html
    <div id="reward-draw-modal" class="modal-overlay reward-draw-modal" aria-labelledby="reward-draw-title" role="dialog" aria-modal="true">
      <div class="modal-content reward-draw-content">
        <div class="modal-header">
          <h2 id="reward-draw-title">선물 상자를 열어 보세요</h2>
          <button id="reward-draw-close" class="icon-button" type="button" aria-label="닫기">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        <p id="reward-draw-copy" class="reward-draw-copy">상자를 두드리면 더 빨리 열려요.</p>
        <button id="reward-draw-box" class="reward-draw-box" type="button" aria-label="선물 상자 두드리기">
          <span id="reward-draw-count" class="reward-draw-count">10</span>
          <span class="material-symbols-outlined reward-draw-gift" aria-hidden="true">redeem</span>
        </button>
        <div id="reward-draw-result" class="reward-draw-result" hidden>
          <img id="reward-draw-result-image" alt="">
          <strong id="reward-draw-result-title"></strong>
          <p id="reward-draw-result-copy"></p>
        </div>
      </div>
    </div>
```

- [ ] **Step 3: Run the layout test**

Run:

```bash
node tests/static-app/student-layout.test.js
```

Expected: PASS if the file encoding and copy assertions match. If existing mojibake assertions fail from pre-existing encoding problems, do not hide the failure; capture the exact failing assertion for the review checkpoint.

## Task 6: Student Daily Draw State and Supabase Flow

**Files:**
- Modify: `assets/js/student.js`
- Test manually with static checks and browser/local page

- [ ] **Step 1: Add top-level state helpers**

Near the existing `studentId` and `status` constants in `assets/js/student.js`, add:

```js
  let dashboardModel = null;
  let dailyDrawInProgress = false;

  function todayKoreaDateString(now) {
    const date = now || new Date();
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date);
    const values = {};
    parts.forEach((part) => {
      if (part.type !== "literal") values[part.type] = part.value;
    });
    return `${values.year}-${values.month}-${values.day}`;
  }

  function isDuplicateDailyDrawError(error) {
    return error && (error.code === "23505" || String(error.message || "").includes("daily_pet_draws_student_id_draw_date_key"));
  }
```

- [ ] **Step 2: Add card render helper**

Add this helper before `renderDashboard`:

```js
  function renderDailyPetDraw(draws, pets) {
    const card = document.getElementById("daily-pet-draw-card");
    const button = document.getElementById("daily-pet-draw-button");
    const statusText = document.getElementById("daily-pet-draw-status");
    if (!card || !button || !statusText) return;

    const hasDrawnToday = Boolean(draws && draws.length);
    const hasEveryPet = (pets || []).length >= window.GrowthNoteRules.PET_POOL.length;

    button.disabled = hasDrawnToday || hasEveryPet || dailyDrawInProgress;

    if (hasEveryPet) {
      card.dataset.dailyDrawState = "complete";
      statusText.textContent = "모든 마이펫을 모았어요.";
      button.querySelector("span:last-child").textContent = "완료";
      return;
    }

    if (hasDrawnToday) {
      card.dataset.dailyDrawState = "done";
      statusText.textContent = "오늘의 마이펫 뽑기를 완료했어요. 내일 다시 만나요.";
      button.querySelector("span:last-child").textContent = "완료";
      return;
    }

    card.dataset.dailyDrawState = "ready";
    statusText.textContent = "하루에 한 번, 새로운 마이펫을 직접 뽑을 수 있어요.";
    button.querySelector("span:last-child").textContent = dailyDrawInProgress ? "진행 중" : "뽑기";
  }
```

- [ ] **Step 3: Include daily draws in dashboard model**

In `loadDashboard`, change the `Promise.all` destructuring to include `dailyDrawsResult` and add the query:

```js
      const today = todayKoreaDateString();
      const [{ data: student, error: studentError }, avatarsResult, petsResult, logsResult, dailyDrawsResult] =
        await Promise.all([
          client.from("students").select("*").eq("id", studentId).single(),
          client.from("unlocked_avatars").select("avatar_id, gender, unlocked_at").eq("student_id", studentId).order("unlocked_at", { ascending: false }),
          client.from("unlocked_pets").select("pet_id, unlocked_at").eq("student_id", studentId).order("unlocked_at", { ascending: false }),
          client.from("student_logs").select("*").eq("student_id", studentId).order("created_at", { ascending: false }).limit(10),
          client.from("daily_pet_draws").select("pet_id, draw_date, created_at").eq("student_id", studentId).eq("draw_date", today)
        ]);
```

After the existing result error checks, add:

```js
      if (dailyDrawsResult.error) throw dailyDrawsResult.error;
```

Pass `dailyDraws` into `renderDashboard`:

```js
        dailyDraws: dailyDrawsResult.data || []
```

- [ ] **Step 4: Store model and render daily draw state**

At the start of `renderDashboard(model)`, add:

```js
    dashboardModel = model;
```

After `renderLogs(logs);`, add:

```js
    renderDailyPetDraw(model.dailyDraws || [], pets);
```

- [ ] **Step 5: Add daily draw action**

Add this function before event listener setup:

```js
  async function drawDailyPet() {
    if (dailyDrawInProgress || !dashboardModel) return;

    const ownedPets = dashboardModel.pets || [];
    const reward = window.GrowthNoteRewards.selectDailyPetReward({ ownedPets });
    if (!reward) {
      renderDailyPetDraw(dashboardModel.dailyDraws || [], ownedPets);
      setStatus("모든 마이펫을 이미 모았어요.");
      return;
    }

    dailyDrawInProgress = true;
    renderDailyPetDraw(dashboardModel.dailyDraws || [], ownedPets);

    try {
      const today = todayKoreaDateString();
      const client = window.GrowthNoteSupabase.getClient();
      const { error: drawError } = await client.from("daily_pet_draws").insert({
        student_id: studentId,
        draw_date: today,
        pet_id: reward.item.pet_id
      });

      if (drawError) {
        if (isDuplicateDailyDrawError(drawError)) {
          setStatus("오늘의 마이펫 뽑기는 이미 완료했어요.");
          loadDashboard();
          return;
        }
        throw drawError;
      }

      const { error: petError } = await client.from("unlocked_pets").insert({
        student_id: studentId,
        pet_id: reward.item.pet_id,
        quantity: 1
      });
      if (petError) throw petError;

      const { error: updateError } = await client
        .from("students")
        .update({ current_pet_num: reward.item.pet_id })
        .eq("id", studentId);
      if (updateError) throw updateError;

      const { error: logError } = await client.from("student_logs").insert({
        student_id: studentId,
        type: "daily_pet_draw",
        category: today,
        description: "오늘의 마이펫 뽑기",
        xp_change: 0,
        reward_type: "pet",
        reward_id: reward.item.pet_id
      });
      if (logError) throw logError;

      openRewardDrawModal({
        type: "pet",
        title: "오늘의 마이펫",
        copy: "상자를 두드리면 더 빨리 열려요.",
        resultTitle: `마이펫 ${reward.item.pet_id}`,
        resultCopy: "새로운 마이펫이 함께하게 되었어요.",
        imageSrc: window.GrowthNoteRules.petImagePath(reward.item),
        onClose: loadDashboard
      });
    } catch (error) {
      setStatus("마이펫 뽑기 오류: " + error.message, true);
    } finally {
      dailyDrawInProgress = false;
      renderDailyPetDraw(dashboardModel.dailyDraws || [], dashboardModel.pets || []);
    }
  }
```

- [ ] **Step 6: Bind the draw button**

Near other event listeners, add:

```js
  const dailyPetDrawButton = document.getElementById("daily-pet-draw-button");
  if (dailyPetDrawButton) {
    dailyPetDrawButton.addEventListener("click", drawDailyPet);
  }
```

Expected intermediate result: `openRewardDrawModal` is not defined yet; that is implemented in Task 7.

## Task 7: Reusable Reward Draw Modal Controller

**Files:**
- Modify: `assets/js/student.js`

- [ ] **Step 1: Add modal controller before `drawDailyPet`**

Add:

```js
  function openRewardDrawModal(options) {
    const modal = document.getElementById("reward-draw-modal");
    const title = document.getElementById("reward-draw-title");
    const copy = document.getElementById("reward-draw-copy");
    const closeButton = document.getElementById("reward-draw-close");
    const box = document.getElementById("reward-draw-box");
    const count = document.getElementById("reward-draw-count");
    const result = document.getElementById("reward-draw-result");
    const resultImage = document.getElementById("reward-draw-result-image");
    const resultTitle = document.getElementById("reward-draw-result-title");
    const resultCopy = document.getElementById("reward-draw-result-copy");
    if (!modal || !box || !count || !result || !resultImage) return;

    let remaining = 10;
    let timerId = null;
    let isRevealed = false;

    function renderCount() {
      count.textContent = String(Math.max(0, remaining));
      box.classList.remove("tap-pop");
      window.requestAnimationFrame(() => box.classList.add("tap-pop"));
    }

    function reveal() {
      if (isRevealed) return;
      isRevealed = true;
      if (timerId) window.clearInterval(timerId);
      count.textContent = "0";
      box.classList.add("opened");
      box.disabled = true;
      result.hidden = false;
      resultImage.src = options.imageSrc;
      resultImage.alt = options.resultTitle || "";
      resultTitle.textContent = options.resultTitle || "";
      resultCopy.textContent = options.resultCopy || "";
    }

    function tick(amount) {
      if (isRevealed) return;
      remaining -= amount;
      renderCount();
      if (remaining <= 0) reveal();
    }

    function closeModal() {
      if (timerId) window.clearInterval(timerId);
      modal.classList.remove("active");
      if (typeof options.onClose === "function") options.onClose();
    }

    title.textContent = options.title || "선물 상자를 열어 보세요";
    copy.textContent = options.copy || "상자를 두드리면 더 빨리 열려요.";
    box.classList.remove("opened", "tap-pop");
    box.disabled = false;
    result.hidden = true;
    resultImage.removeAttribute("src");
    resultImage.alt = "";
    resultTitle.textContent = "";
    resultCopy.textContent = "";
    renderCount();

    box.onclick = () => tick(2);
    closeButton.onclick = closeModal;
    modal.classList.add("active");
    timerId = window.setInterval(() => tick(1), 650);
  }
```

- [ ] **Step 2: Reason about close behavior**

Confirm that `closeModal` calls `loadDashboard` only after a successful draw because `drawDailyPet` passes `onClose: loadDashboard`. Do not call `loadDashboard` inside the modal controller by default; this keeps it reusable for avatar reward reveal.

## Task 8: Daily Draw Styles

**Files:**
- Modify: `assets/css/style.css`

- [ ] **Step 1: Add daily card styles after `.summary-card strong`**

Add:

```css
.daily-draw-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  margin-top: 14px;
  background: #ffffff;
}

.daily-draw-copy {
  min-width: 0;
}

.daily-draw-copy h2 {
  margin: 4px 0 6px;
  font-size: 18px;
  line-height: 1.25;
}

.daily-draw-copy p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.45;
}

.daily-draw-button {
  min-width: 104px;
  white-space: nowrap;
}

.daily-draw-card[data-daily-draw-state="done"],
.daily-draw-card[data-daily-draw-state="complete"] {
  background: var(--surface);
}
```

- [ ] **Step 2: Add modal styles near existing modal styles**

Add before `.starter-avatar-modal`:

```css
.reward-draw-modal {
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.reward-draw-content {
  width: min(360px, 100%);
  text-align: center;
}

.reward-draw-copy {
  margin: 0 0 18px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
}

.reward-draw-box {
  width: 176px;
  height: 176px;
  margin: 0 auto;
  border: 1px solid var(--surface-highest);
  border-radius: 8px;
  background: #f0fdf4;
  color: var(--primary);
  cursor: pointer;
  display: grid;
  place-items: center;
  position: relative;
  box-shadow: 0 14px 28px rgba(6, 78, 59, 0.14);
  transition: transform 0.12s ease, background-color 0.2s ease;
}

.reward-draw-box:active,
.reward-draw-box.tap-pop {
  transform: scale(0.96) rotate(-1deg);
}

.reward-draw-box.opened {
  background: #ecfdf5;
  transform: scale(1.03);
}

.reward-draw-count {
  position: absolute;
  top: 14px;
  right: 14px;
  min-width: 42px;
  min-height: 42px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #ffffff;
  color: var(--primary);
  font-size: 22px;
  font-weight: 900;
  box-shadow: var(--shadow);
}

.reward-draw-gift {
  font-size: 86px;
  font-variation-settings: "FILL" 1;
}

.reward-draw-result {
  display: grid;
  gap: 8px;
  justify-items: center;
  margin-top: 18px;
}

.reward-draw-result[hidden] {
  display: none;
}

.reward-draw-result img {
  width: 128px;
  height: 128px;
  object-fit: contain;
  image-rendering: pixelated;
}

.reward-draw-result strong {
  color: var(--primary);
  font-size: 18px;
  font-weight: 900;
}

.reward-draw-result p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  font-weight: 700;
}
```

- [ ] **Step 3: Add mobile fallback**

Inside the existing `@media (max-width: 760px)` block, add:

```css
  .daily-draw-card {
    grid-template-columns: 1fr;
  }

  .daily-draw-button {
    width: 100%;
  }
```

## Task 9: Static Verification

**Files:**
- Test only

- [ ] **Step 1: Run rules test**

Run:

```bash
node tests/static-app/rules.test.js
```

Expected: PASS and print `rules.test.js passed`.

- [ ] **Step 2: Run rewards test**

Run:

```bash
node tests/static-app/rewards.test.js
```

Expected: PASS and print `rewards.test.js passed`.

- [ ] **Step 3: Run layout test**

Run:

```bash
node tests/static-app/student-layout.test.js
```

Expected: PASS and print `student-layout.test.js passed`. If this fails due existing mojibake strings in the file, report that separately and do not claim full verification.

- [ ] **Step 4: Run all static app tests**

Run:

```bash
Get-ChildItem tests/static-app/*.test.js | ForEach-Object { node $_.FullName }
```

Expected: every test prints its `passed` line and the command exits with code 0.

## Task 10: Manual Browser Verification

**Files:**
- No source modifications unless a manual issue is found

- [ ] **Step 1: Open the student page with a valid logged-in student session**

Use the project’s existing local/static serving method. If no dev server exists, use a simple static server from the workspace and open `student-login.html`, then log in and navigate to `student.html`.

- [ ] **Step 2: Verify pre-draw state**

Expected:

- Home shows `오늘의 마이펫 뽑기`.
- Button is enabled when no `daily_pet_draws` row exists for today.
- Button is disabled when a row exists for today.

- [ ] **Step 3: Verify gift-box interaction**

Expected:

- Modal opens with count `10`.
- Count decreases automatically.
- Tapping the gift box decreases the count faster.
- At `0`, a My Pet image is revealed.
- Closing the modal reloads the dashboard.

- [ ] **Step 4: Verify persisted result**

Expected in Supabase:

- One row in `daily_pet_draws` for `(student_id, Korean today)`.
- One matching row in `unlocked_pets`.
- `students.current_pet_num` equals the drawn pet ID.
- One `student_logs` row with `type = daily_pet_draw`, `reward_type = pet`, and `reward_id = drawn pet ID`.

- [ ] **Step 5: Verify level-up behavior**

Use teacher praise to trigger a level-up.

Expected:

- Level increases.
- `unlocked_avatars` gets a new avatar if available.
- `unlocked_pets` does not get a new row from praise.
- Teacher result text still reports a reward when an avatar is granted.

## Task 11: Commit Implementation

**Files:**
- Commit only files intentionally changed by this implementation.

- [ ] **Step 1: Review working tree**

Run:

```bash
git status --short
```

Expected: only intended files are modified or newly created. Existing unrelated user changes may still appear; do not stage unrelated files.

- [ ] **Step 2: Stage intended files**

Run:

```bash
git add assets/js/rewards.js assets/js/student.js assets/css/style.css student.html tests/static-app/rewards.test.js tests/static-app/student-layout.test.js supabase/schema.sql supabase/migrations/20260705000000_add_daily_pet_draws.sql
```

- [ ] **Step 3: Commit**

Run:

```bash
git commit -m "Add daily My Pet draw"
```

Expected: commit succeeds and includes only implementation files.

## Self-Review

- Spec coverage: The plan covers daily My Pet draw, Korean-date daily guard, reusable modal, avatar-only level-up rewards, schema changes, tests, error handling, and manual verification.
- Red-flag scan: No incomplete markers or intentionally vague implementation steps remain.
- Type consistency: `selectDailyPetReward`, `daily_pet_draws`, `draw_date`, `pet_id`, `openRewardDrawModal`, and DOM IDs are used consistently across tasks.
