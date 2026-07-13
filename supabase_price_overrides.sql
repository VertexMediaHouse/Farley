-- Run this once in your Supabase SQL editor
-- (Dashboard → SQL Editor → New query → paste → Run)

create table if not exists price_overrides (
  id         text primary key default 'main',
  rules      jsonb not null default '{}',
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id)
);

-- Enable Row Level Security
alter table price_overrides enable row level security;

-- Allow any authenticated user to read
create policy "auth users can read prices"
  on price_overrides for select
  using (auth.role() = 'authenticated');

-- Allow any authenticated user to insert/update
create policy "auth users can write prices"
  on price_overrides for all
  using (auth.role() = 'authenticated');
