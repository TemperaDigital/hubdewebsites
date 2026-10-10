-- Linkoteka: tabela de links da biblioteca pessoal (monousuário, sem autenticação)
-- Rode este script no SQL Editor do seu projeto Supabase.

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  title text not null,
  subject text not null default 'Outros',
  theme text not null default 'Para organizar',
  tags text[] not null default '{}',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists links_set_updated_at on public.links;
create trigger links_set_updated_at
  before update on public.links
  for each row execute function public.set_updated_at();

-- Acesso via chave pública (app pessoal sem login)
grant select, insert, update, delete on public.links to anon;
grant select, insert, update, delete on public.links to authenticated;
grant all on public.links to service_role;

alter table public.links enable row level security;

create policy "Leitura pública" on public.links for select to anon using (true);
create policy "Inserção pública" on public.links for insert to anon with check (true);
create policy "Atualização pública" on public.links for update to anon using (true) with check (true);
create policy "Exclusão pública" on public.links for delete to anon using (true);
