-- 1. 교사 권한 매핑 테이블 생성
create table if not exists public.teacher_roles (
  email text primary key,
  role text not null check (role in ('admin', 'praise_only')),
  created_at timestamptz not null default now()
);

-- RLS 활성화
alter table public.teacher_roles enable row level security;

-- 2. 최고 관리자 교사 판별 헬퍼 함수 정의 (Security Definer로 정의하여 RLS 재귀 방지)
-- 오직 teacher_roles에 'admin'으로 등록된 경우에만 인정 (어떠한 임시 예외 허용도 없음)
create or replace function public.is_admin_teacher()
returns boolean security definer set search_path = public as $$
begin
  return (
    auth.role() = 'authenticated' and
    exists (
      select 1 from public.teacher_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );
end;
$$ language plpgsql;

-- 3. 칭찬전용 교사 판별 함수 추가
create or replace function public.is_praise_only_teacher()
returns boolean security definer set search_path = public as $$
begin
  return (
    auth.role() = 'authenticated' and
    exists (
      select 1 from public.teacher_roles
      where email = auth.jwt() ->> 'email'
      and role = 'praise_only'
    )
  );
end;
$$ language plpgsql;

-- 4. 교사 권한 테이블 정책 설정
drop policy if exists "admin manage teacher roles" on public.teacher_roles;
create policy "admin manage teacher roles" on public.teacher_roles
  for all using (public.is_admin_teacher()) with check (public.is_admin_teacher());

drop policy if exists "authenticated read teacher roles" on public.teacher_roles;
create policy "authenticated read teacher roles" on public.teacher_roles
  for select using (auth.role() = 'authenticated');

-- 5. 학생 테이블 RLS 정책 고도화
-- 학생 조회: 최고 관리자 교사, 칭찬전용 교사, 학생 본인(anon)만 가능
drop policy if exists "anon read students" on public.students;
drop policy if exists "allow select students" on public.students;
create policy "allow select students" on public.students
  for select using (
    auth.role() = 'anon' or
    public.is_admin_teacher() or
    public.is_praise_only_teacher()
  );

-- 학생 삭제: 최고 관리자 교사만 가능 (일반 학생 및 칭찬전용 교사 차단)
drop policy if exists "anon delete students" on public.students;
drop policy if exists "allow delete students" on public.students;
create policy "allow delete students" on public.students
  for delete using (public.is_admin_teacher());

-- 학생 추가: anon(가입 시) 및 최고 관리자 교사만 가능
drop policy if exists "anon insert students" on public.students;
drop policy if exists "allow insert students" on public.students;
create policy "allow insert students" on public.students
  for insert with check (auth.role() = 'anon' or public.is_admin_teacher());

-- 6. 학생 테이블 민감 정보(학번, 이름, PIN) 컬럼 수정 방어 트리거
create or replace function public.check_student_update_permissions()
returns trigger as $$
begin
  -- 최고 관리자 교사는 모든 수정 가능
  if public.is_admin_teacher() then
    return new;
  end if;

  -- 칭찬전용 교사 또는 학생 본인이 아닌 미승인 계정(외부 가입자)은 모든 업데이트 불가능
  if not (public.is_praise_only_teacher() or auth.role() = 'anon') then
    raise exception '수정 권한이 없습니다. 최고 관리자 계정이 아닙니다.';
  end if;

  -- 칭찬전용 교사 및 학생 본인은 학번, 이름, PIN을 임의 수정 불가능
  if new.school_id <> old.school_id then
    raise exception '학번(school_id) 정보는 최고 관리자만 수정할 수 있습니다.';
  end if;

  if new.name is distinct from old.name then
    raise exception '이름(name) 정보는 최고 관리자만 수정할 수 있습니다.';
  end if;

  if new.pin <> old.pin then
    raise exception '비밀번호 PIN은 최고 관리자만 수정할 수 있습니다.';
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists enforce_student_update_permissions on public.students;
create trigger enforce_student_update_permissions
  before update on public.students
  for each row
  execute function public.check_student_update_permissions();

-- 7. 가입했으나 아직 역할이 지정되지 않은 교사 대기 목록 반환 함수 (RPC)
create or replace function public.get_pending_teachers()
returns table (id uuid, email text, created_at timestamptz)
security definer set search_path = public, auth as $$
begin
  -- 호출자가 최고 관리자 교사인지 RLS 보안 확인
  if not public.is_admin_teacher() then
    raise exception '권한이 없습니다. 최고 관리자 계정이 아닙니다.';
  end if;

  return query
  select u.id, u.email::text, u.created_at
  from auth.users u
  where not exists (
    select 1 from public.teacher_roles r
    where lower(r.email) = lower(u.email)
  )
  order by u.created_at desc;
end;
$$ language plpgsql;
