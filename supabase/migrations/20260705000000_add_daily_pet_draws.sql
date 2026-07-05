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
