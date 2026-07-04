# Gray Avatar Quest Redesign Proposal

Date: 2026-07-04
Target folder: `New-Folder`

## Decision Summary

Use the bright **Gray Avatar Quest** direction from the reference Stitch screens.

The app should be redesigned as a mobile-app-like student experience with four bottom tabs:

- Home
- Collection
- History
- Settings

The teacher praise assignment screen remains a separate page at `teacher.html`.

## References

Reference files:

- `docs/stitch_screens/avatar_dashboard.html`
- `docs/stitch_screens/avatar_decorate.html`
- `docs/stitch_screens/achievements_badges.html`
- `docs/stitch_screens/levelup_congrats.html`

Do not use the dark `Neo-Console 16` visual system for the main app. It can be considered later only for special reward or level-up moments.

## Visual Direction

### Palette

Use a bright slate-gray palette:

- Background: `#f8fafc`
- Surface: `#ffffff`
- Surface low: `#f1f5f9`
- Surface high: `#e2e8f0`
- Primary: `#475569`
- Secondary: `#64748b`
- Text: `#0f172a`
- Muted text: `#64748b`
- Outline: `#cbd5e1`
- Error: `#ef4444`

Avoid the current beige and teal theme.

### Shape and Depth

- Use 12px cards for app surfaces.
- Use 999px rounded pills for level badges, tab buttons, and progress badges.
- Use subtle slate-tinted shadows, not heavy decorative shadows.
- Keep card nesting shallow. Cards are for actual content modules only.

### Typography

- Keep Korean readability as the priority.
- Use the system Korean font stack for body text.
- Optionally load `Plus Jakarta Sans` for English labels and numbers.
- Use large numeric emphasis for level and XP.
- Avoid tiny decorative labels where Korean content must be read quickly.

### Icon Style

Preferred: Google Material Symbols, matching the Stitch references.

Use icons for:

- Home
- Collection
- History
- Settings
- Refresh
- Logout
- Student search
- Praise action

If icon loading is not desired, use text labels only and keep button shapes consistent.

## Student App Structure

### `index.html`: Login

Keep the page focused:

- App title
- Short helper copy
- Student id input
- PIN input
- Login button
- Test login helper: `000000 / 0176`
- Secondary link to `teacher.html`

Student id rule stays:

- Grade 3, class 1, number 10 = `30110`
- The app normalizes inputs like `3-1-10` and `3학년 1반 10번` to `30110`

Design changes:

- Replace beige background with bright gray background.
- Use a clean white login panel.
- Keep the teacher link visually secondary.

### `student.html`: Mobile App Shell

Restructure into a single mobile app shell with bottom navigation.

Top app bar:

- Student name or nickname
- Student id below or in a compact chip
- Refresh button
- Logout button in Settings, not always prominent

Bottom tabs:

- Home
- Collection
- History
- Settings

Tab behavior:

- Use client-side tab switching in `student.js`.
- Do not create extra HTML pages for each tab in the first version.
- Keep all current Supabase data loading in one dashboard load path.

## Student Tabs

### Home

Primary goal: show growth and current character.

Content:

- Large circular avatar stage with progress ring
- `Lv. N` badge below avatar
- XP progress card with current XP and next-level target
- Two summary cards:
  - Total rewards owned
  - Recent praise count
- Current My Pet as a smaller companion card

Reference influence:

- `avatar_dashboard.html` profile and XP section
- `avatar_decorate.html` avatar preview ring

### Collection

Primary goal: show owned rewards.

Content:

- Segmented control: `아바타 / 마이펫`
- Square reward tiles
- Owned items show full image
- Future locked-state styling can be added, but the first redesign only needs owned items

Reference influence:

- `avatar_decorate.html` item grid
- `achievements_badges.html` badge grid

### History

Primary goal: show praise and reward events clearly.

Content:

- Timeline-style cards
- Praise label
- `+XP`
- Reward type and id
- Date/time

Reference influence:

- `achievements_badges.html` badge and progress card hierarchy

### Settings

Primary goal: keep utility actions out of the home screen.

Content:

- Student info
- Student id
- Current app mode, including demo mode if applicable
- Logout button
- Supabase setup notice when config is missing

Do not place teacher entry inside Settings. Teacher uses `teacher.html`.

## Teacher Screen

Keep `teacher.html` separate.

Design changes:

- Use the same bright Gray palette.
- Keep a work-focused layout.
- Do not add student bottom navigation.
- Use a two-panel layout on desktop:
  - Student search/list
  - Selected student and praise buttons
- Collapse to a single column on mobile.
- Praise buttons should look like primary action cards, not decorative game tiles.

## Data and Behavior

No data model changes are required.

Existing behavior stays:

- Student id + PIN login
- Demo login: `000000 / 0176`
- Student dashboard loads profile, collections, and logs
- Teacher page assigns fixed praise items
- Praise grants XP and one non-duplicate random reward

The redesign should be CSS and HTML structure focused. JavaScript changes should be limited to tab switching and rendering into the new layout.

## Implementation Boundaries

Do not reintroduce:

- Next.js
- React
- build tooling
- Supabase keys from the old project
- ranking
- quests
- coupons
- event games
- trading
- receipt printing

Do not copy remote image URLs from the Stitch references. Use existing local assets from `public/img`.

## Success Criteria

- The app visually matches the bright Gray Avatar Quest reference direction.
- `student.html` feels like a mobile app with Home, Collection, History, and Settings tabs.
- `teacher.html` remains separate and work-focused.
- Existing demo login still works.
- Existing Supabase-driven login and reward flow still work.
- Existing image assets render correctly.
- The app remains static HTML/CSS/JavaScript.

