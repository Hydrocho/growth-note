create extension if not exists pgcrypto;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  school_id text not null unique,
  name text,
  nickname text,
  pin text not null,
  total_xp integer not null default 0,
  level integer not null default 1,
  current_avatar_num text default '1_001',
  current_pet_num text default '000',
  display_avatar_type text not null default 'level',
  created_at timestamptz not null default now()
);

create table if not exists public.unlocked_avatars (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  avatar_id text not null,
  gender text not null default '1',
  quantity integer not null default 1,
  unlocked_at timestamptz not null default now(),
  unique (student_id, avatar_id, gender)
);

create table if not exists public.unlocked_pets (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  pet_id text not null,
  quantity integer not null default 1,
  unlocked_at timestamptz not null default now(),
  unique (student_id, pet_id)
);

create table if not exists public.student_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  type text not null,
  category text not null,
  description text,
  xp_change integer not null default 0,
  reward_type text,
  reward_id text,
  level_before integer,
  level_after integer,
  created_at timestamptz not null default now()
);

alter table public.students enable row level security;
alter table public.unlocked_avatars enable row level security;
alter table public.unlocked_pets enable row level security;
alter table public.student_logs enable row level security;

create policy "anon read students" on public.students for select using (true);
create policy "anon update students" on public.students for update using (true) with check (true);
create policy "anon read avatars" on public.unlocked_avatars for select using (true);
create policy "anon insert avatars" on public.unlocked_avatars for insert with check (true);
create policy "anon read pets" on public.unlocked_pets for select using (true);
create policy "anon insert pets" on public.unlocked_pets for insert with check (true);
create policy "anon read logs" on public.student_logs for select using (true);
create policy "anon insert logs" on public.student_logs for insert with check (true);

insert into public.students (school_id, name, nickname, pin)
values
  ('000000', '테스트 학생', '테스트 학생', '0176'),
  ('30110', '학생 1', '첫번째 학생', '1111'),
  ('30111', '학생 2', '두번째 학생', '2222')
on conflict (school_id) do nothing;
