-- Supabase schema for TaskApp
-- Run this in the Supabase SQL editor before using the app.

create table if not exists public.tasks (
  id uuid primary key,
  title text not null,
  description text not null default '',
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted boolean not null default false
);

create index if not exists tasks_created_at_idx on public.tasks (created_at desc);
create index if not exists tasks_deleted_idx on public.tasks (deleted);

alter table public.tasks enable row level security;

-- Demo policy: allow anonymous read/write for local development.
-- Replace with authenticated policies before production.
create policy "Allow public read tasks"
  on public.tasks for select
  using (true);

create policy "Allow public insert tasks"
  on public.tasks for insert
  with check (true);

create policy "Allow public update tasks"
  on public.tasks for update
  using (true);

create policy "Allow public delete tasks"
  on public.tasks for delete
  using (true);
