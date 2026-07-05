-- Allow anonymous/anon role to delete records from student-related tables during data reset
drop policy if exists "anon delete avatars" on public.unlocked_avatars;
create policy "anon delete avatars" on public.unlocked_avatars for delete using (true);

drop policy if exists "anon delete pets" on public.unlocked_pets;
create policy "anon delete pets" on public.unlocked_pets for delete using (true);

drop policy if exists "anon delete daily pet draws" on public.daily_pet_draws;
create policy "anon delete daily pet draws" on public.daily_pet_draws for delete using (true);

drop policy if exists "anon delete logs" on public.student_logs;
create policy "anon delete logs" on public.student_logs for delete using (true);
