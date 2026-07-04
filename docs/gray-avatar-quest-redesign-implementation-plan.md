# Gray Avatar Quest Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the standalone static app in `New-Folder` using the bright Gray Avatar Quest style with a mobile student shell and separate teacher page.

**Architecture:** Keep the app as static HTML/CSS/JavaScript. Replace the student page markup with a tabbed mobile shell, update CSS design tokens and components, and adjust `student.js` to render Home, Collection, History, and Settings sections from the same loaded data. Keep Supabase behavior and demo login intact.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Supabase JS CDN, local PNG assets under `public/img`.

---

## File Map

- Modify `New-Folder/index.html`: light Gray login copy and structure cleanup.
- Modify `New-Folder/student.html`: app shell, top app bar, four tab panels, bottom navigation.
- Modify `New-Folder/teacher.html`: keep separate page, restyle to Gray Avatar Quest.
- Replace `New-Folder/assets/css/style.css`: Gray Avatar Quest tokens and responsive components.
- Replace `New-Folder/assets/js/student.js`: dashboard data model, tab switching, render functions.
- Add `New-Folder/tests/static-app/student-layout.test.js`: static checks for tab shell and labels.

## Tasks

### Task 1: Static Layout Test

- [ ] Add `tests/static-app/student-layout.test.js` that asserts `student.html` contains `data-tab-target="home"`, `collection`, `history`, `settings`, and no mojibake replacement text.
- [ ] Run `node tests/static-app/student-layout.test.js` and confirm it fails before implementation.

### Task 2: Student App Shell

- [ ] Replace `student.html` with Gray Avatar Quest mobile shell:
  - top app bar
  - home tab
  - collection tab
  - history tab
  - settings tab
  - bottom navigation
- [ ] Update `student.js` to render the new element ids and switch tabs.

### Task 3: Visual System

- [ ] Replace `style.css` with bright gray/slate tokens.
- [ ] Add avatar ring, bottom nav, segmented control, stat cards, timeline, and teacher page styles.
- [ ] Keep responsive desktop behavior.

### Task 4: Login and Teacher Polish

- [ ] Update `index.html` text and login panel style compatibility.
- [ ] Update `teacher.html` labels and layout classes without changing behavior.

### Task 5: Verification

- [ ] Run `node --check assets/js/student.js`.
- [ ] Run all static tests.
- [ ] Search for old Supabase key patterns.
- [ ] Confirm local pages return HTTP 200.

