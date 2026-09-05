
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  agent_name text default 'Fin',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- Transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  description text not null,
  amount numeric(12,2) not null,
  category text not null default 'outros',
  type text not null default 'despesa' check (type in ('despesa','receita')),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index on public.transactions(user_id, occurred_at desc);

alter table public.transactions enable row level security;
create policy "own tx all" on public.transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Goals
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  target_amount numeric(12,2) not null,
  current_amount numeric(12,2) not null default 0,
  deadline date,
  created_at timestamptz not null default now()
);
alter table public.goals enable row level security;
create policy "own goals all" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Chat messages
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index on public.chat_messages(user_id, created_at);
alter table public.chat_messages enable row level security;
create policy "own msgs all" on public.chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
