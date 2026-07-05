-- ==========================================
-- DATABASE SCHEMA CHANGELOG
-- ==========================================
-- 2026-07-05:
--   1. 테스트 계정(000000 / 0176)의 insert 구문 완전 삭제
--   2. 학생 이름(name) 및 별명(nickname) 필드는 서버 비저장 방침에 따라 
--      Supabase 인서트 시 제외되며, 테이블 상에서는 호환성을 위해 null 허용으로 유지
-- ==========================================

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
create policy "anon insert students" on public.students for insert with check (true);
create policy "anon update students" on public.students for update using (true) with check (true);
create policy "anon delete students" on public.students for delete using (true);
create policy "anon read avatars" on public.unlocked_avatars for select using (true);
create policy "anon insert avatars" on public.unlocked_avatars for insert with check (true);
create policy "anon read pets" on public.unlocked_pets for select using (true);
create policy "anon insert pets" on public.unlocked_pets for insert with check (true);
create policy "anon read logs" on public.student_logs for select using (true);
create policy "anon insert logs" on public.student_logs for insert with check (true);
