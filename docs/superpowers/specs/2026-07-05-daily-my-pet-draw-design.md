# Daily My Pet Draw Design

## Goal

Add a home-screen "오늘의 마이펫 뽑기" feature for students. A student can draw one random My Pet once per Korean calendar day. My Pets are no longer granted through level-up rewards. Level-up rewards grant avatars only.

The gift-box opening experience should be reusable for both the daily My Pet draw and future level-up avatar reward screens.

## User Experience

The student home screen shows a daily draw entry point near the current avatar/pet and XP summary. If the student has not drawn today, the control is active and opens the reward draw modal. If the student already drew today, the control shows a completed state and tells the student to come back tomorrow.

The draw modal presents a gift box with a visible countdown starting at 10. The number decreases automatically. Tapping the box makes the countdown drop faster and gives the student a sense of actively opening the box. When the counter reaches 0, the box opens and reveals the awarded My Pet. The student can then close the modal and see the new pet reflected on the home screen and collection screen.

For avatar level-up rewards, the same modal shell and countdown/opening animation can be reused with avatar-specific title, image path, and result copy.

## Reward Rules

Daily My Pet draw:

- Reward type is always `pet`.
- It selects randomly from pets the student does not already own.
- It is available once per Korean calendar date.
- On success, it inserts the pet into `unlocked_pets`, updates `students.current_pet_num`, records the daily draw, and writes a log entry.
- If the student owns every pet, the feature should show a no-new-pets state instead of failing silently.

Level-up reward:

- Reward type is always `avatar`.
- Existing alternating/random pet-or-avatar level-up behavior is removed.
- Teacher praise still updates XP and level.
- If the level increases, a random unowned avatar is granted.
- If all avatars are already owned, the level-up succeeds with no new reward.

## Data Model

Add a dedicated table for daily draw claims:

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

The application calculates `draw_date` using the Korean calendar date. The unique constraint is the final guard against duplicate claims from repeated clicks, refreshes, or multiple devices.

The table needs RLS enabled and policies consistent with the current static client access model. The current project allows anon read/insert/update across student reward tables, so the migration should follow that pattern unless the broader auth model changes.

## Components

`student.html`:

- Add the daily draw card/button to the home panel.
- Add one reusable reward draw modal to the page.

`assets/js/student.js`:

- Load today's draw status with the dashboard data.
- Render the draw card as available, completed, exhausted, or loading.
- Handle daily My Pet draw requests.
- Reuse a shared modal controller for countdown, tap acceleration, reveal, and close.
- Refresh dashboard data after a successful draw.

`assets/js/rewards.js`:

- Change level-up reward selection to avatar-only.
- Keep the reward result shape compatible with existing teacher UI where possible.
- Add or expose a reusable unowned-pet selector if useful for the student draw implementation.

`assets/css/style.css`:

- Style the daily draw card, gift box modal, countdown, tap feedback, opened result state, and disabled/completed state.
- Keep the mobile layout stable inside the existing 430px shell.

`supabase/schema.sql` and migration:

- Add `daily_pet_draws`.
- Add RLS and policies.
- Preserve existing schema behavior for current static Supabase client usage.

Tests:

- Update reward tests so level-up rewards grant avatars only.
- Add tests for unowned pet selection and all-owned edge case if helper logic is extracted.
- Add static layout assertions for the daily draw card and modal markup.

## Error Handling

If the student has already drawn today, the app shows the completed state and does not attempt another insert.

If duplicate insert occurs anyway because of rapid clicks or another device, the database unique constraint wins. The UI should handle that error by reloading dashboard state and showing that today's draw is already complete.

If there are no unowned pets left, the modal or card should explain that every My Pet has already been collected.

If network or Supabase calls fail, the modal closes or remains actionable with an error status rather than granting a local-only reward.

## Verification

Run the static Node tests after implementation:

```bash
node tests/static-app/rules.test.js
node tests/static-app/rewards.test.js
node tests/static-app/student-layout.test.js
```

Also verify manually in the student page:

- Before drawing, the home card is active.
- Tapping the gift box accelerates the countdown.
- The revealed pet appears in the home stage and pet collection.
- A second draw on the same Korean date is blocked.
- Teacher praise level-up no longer grants pets.
