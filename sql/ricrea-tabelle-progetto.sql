-- Ricrea solo le tabelle utilizzate dal progetto.
-- auth.users è gestita da Supabase e non viene ricreata.

begin;

create table public.clients (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table public.estimates (
  id serial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  description text not null,
  markdown text not null,
  prezzo_stimato numeric(10,2),
  created_at timestamptz not null default now()
);

create index estimates_user_id_created_at_idx
  on public.estimates (user_id, created_at desc);

create or replace function public.handle_auth_user_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.clients (id, email, created_at)
  values (new.id, new.email, coalesce(new.created_at, now()))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

revoke all on function public.handle_auth_user_insert() from public, anon, authenticated;

create trigger on_auth_user_insert
after insert or update of email on auth.users
for each row
execute function public.handle_auth_user_insert();

-- Ricrea i profili degli utenti già presenti in Supabase Auth.
insert into public.clients (id, email, created_at)
select id, email, coalesce(created_at, now())
from auth.users
on conflict (id) do update set email = excluded.email;

alter table public.clients enable row level security;
alter table public.estimates enable row level security;

revoke all on table public.clients, public.estimates from anon, authenticated;
grant select on table public.clients, public.estimates to authenticated;
grant all on table public.clients, public.estimates to service_role;

revoke all on sequence public.estimates_id_seq from anon, authenticated;
grant usage, select on sequence public.estimates_id_seq to service_role;

create policy clients_select_own on public.clients
for select to authenticated
using ((select auth.uid()) = id);

create policy estimates_select_own on public.estimates
for select to authenticated
using ((select auth.uid()) = user_id);

notify pgrst, 'reload schema';
commit;
