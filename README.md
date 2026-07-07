# Growth Note Static App

This folder is the standalone HTML/CSS/JavaScript version of the praise reward app.

## Files

- `index.html`: student id and PIN login
- `student.html`: student dashboard
- `teacher.html`: teacher praise assignment
- `assets/js/supabase-config.example.js`: example config only
- `supabase-new-project-schema.sql`: schema for a new Supabase project
- `assets/img`: required avatar and My Pet image assets

## Supabase Setup

1. Create a new Supabase project.
2. Run `supabase-new-project-schema.sql` in the new project's SQL editor.
3. Copy `assets/js/supabase-config.example.js` to `assets/js/supabase-config.js`.
4. Put the new project's URL and anon key into `assets/js/supabase-config.js`.

Do not use credentials from the old project.

## Local Run

Serve this folder as a static site:

```powershell
cd New-Folder
python -m http.server 4173
```

Open:

```text
http://localhost:4173/index.html
```

The teacher prototype PIN is defined in `assets/js/teacher.js` as `2468`.

Student ids use the format `grade + class(2 digits) + number(2 digits)`.
For example, grade 3, class 1, number 10 is `30110`.

Test login works without Supabase setup:

```text
Student id: 000000
PIN: 0176
```
