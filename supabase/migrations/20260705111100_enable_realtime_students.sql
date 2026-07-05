-- Enable Realtime for public.students table to allow live dashboard updates
alter publication supabase_realtime add table public.students;
