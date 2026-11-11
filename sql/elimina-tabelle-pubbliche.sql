-- ATTENZIONE: script distruttivo.
-- Elimina tutte le tabelle dello schema public e i relativi oggetti dipendenti.
-- Non elimina auth.users, che è gestita da Supabase.

begin;

drop trigger if exists on_auth_user_insert on auth.users;
drop function if exists public.handle_auth_user_insert() cascade;

do $$
declare
  table_name text;
begin
  for table_name in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('drop table if exists public.%I cascade', table_name);
  end loop;
end
$$;

commit;
