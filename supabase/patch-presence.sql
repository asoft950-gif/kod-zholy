-- Онлайн/оффлайн белгісі. Supabase SQL Editor-де бір рет іске қос.

create or replace function public.msg_contacts() returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if public.active_role() is null then raise exception 'not_active'; end if;
  return coalesce((select jsonb_agg(x order by (x ->> 'last_at') desc nulls last, x ->> 'full_name') from (
    select jsonb_build_object(
      'id', p.id, 'full_name', p.full_name, 'role', p.role, 'hero', p.hero, 'last_seen', p.last_seen,
      'unread', (select count(*) from public.messages m where m.sender = p.id and m.recipient = me and m.read_at is null),
      'last', (select left(m.body, 80) from public.messages m
               where (m.sender = me and m.recipient = p.id) or (m.sender = p.id and m.recipient = me) order by m.id desc limit 1),
      'last_at', (select max(m.created_at) from public.messages m
                  where (m.sender = me and m.recipient = p.id) or (m.sender = p.id and m.recipient = me))) as x
    from public.profiles p
    where p.id <> me and (public.can_message(me, p.id)
      or exists (select 1 from public.messages m where (m.sender = me and m.recipient = p.id) or (m.sender = p.id and m.recipient = me)))
    limit 500) t), '[]'::jsonb);
end $$;


-- Хабарлама санын сұрағанда «соңғы кіру» уақытын да жаңартады (онлайн белгісі үшін)
create or replace function public.msg_unread() returns int
language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set last_seen = now()
   where id = auth.uid() and (last_seen is null or last_seen < now() - interval '30 seconds');
  return (select count(*)::int from public.messages where recipient = auth.uid() and read_at is null);
end $$;


do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname in ('msg_contacts', 'msg_unread')
  loop
    execute format('revoke all on function %s from public, anon', f.sig);
    execute format('grant execute on function %s to authenticated', f.sig);
  end loop;
end $$;
