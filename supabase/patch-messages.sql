-- Жеке хабарламалар және «Өзім туралы». Бір рет Supabase SQL Editor-де іске қос (schema.sql ішінде де бар).

-- ---------- Өзім туралы ----------
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists grade int;

-- Балаларға арналған: балағат сөздерді *** етіп жасырады (сөз басынан)
create or replace function public.clean_text(t text) returns text
language sql immutable set search_path = public as $$
  select regexp_replace(coalesce(t, ''),
    '\m(хуй|хуе|хуё|хуя|пизд|ебан|ебат|ебал|ебу|ёбан|еблан|бляд|блят|сука|суки|мудак|мудил|гандон|долбо[её]б|пидор|пидр|шлюх|залуп|fuck|shit|bitch|сігей|сіктір|сікті|сігіп|қотақ|қотағ|жалап)[[:alpha:]]*',
    '***', 'gi');
$$;

create or replace function public.update_about(bio_in text, grade_in int) returns void
language plpgsql security definer set search_path = public as $$
begin
  if public.active_role() is null then raise exception 'not_active'; end if;
  if length(coalesce(bio_in, '')) > 200 or (grade_in is not null and (grade_in < 1 or grade_in > 12)) then raise exception 'bad_input'; end if;
  update public.profiles set bio = nullif(btrim(public.clean_text(bio_in)), ''), grade = grade_in where id = auth.uid();
end $$;

create or replace function public.my_profile() returns jsonb
language plpgsql security definer set search_path = public as $$
declare p jsonb;
begin
  update public.profiles set last_seen = now() where id = auth.uid();
  select jsonb_build_object('id', id, 'email', email, 'full_name', full_name, 'role', role,
                            'status', status, 'created_at', created_at, 'hero', hero, 'bio', bio, 'grade', grade)
    into p from public.profiles where id = auth.uid();
  return p;
end $$;

-- ---------- Хабарламалар ----------
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  sender uuid not null references public.profiles(id) on delete cascade,
  recipient uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists messages_sender_idx on public.messages (sender, recipient, id desc);
create index if not exists messages_recipient_idx on public.messages (recipient, sender, id desc);
alter table public.messages enable row level security;
revoke all on public.messages from anon, authenticated;

-- Кім кімге жаза алады: сыныптастар, оқушы мен оның мұғалімі, құрушы/админ барлығымен
create or replace function public.can_message(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select a is not null and b is not null and a <> b
    and exists (select 1 from public.profiles where id = b and status = 'active')
    and exists (select 1 from public.profiles where id = a and status = 'active')
    and (
      (select role from public.profiles where id = a) in ('owner', 'admin')
      or (select role from public.profiles where id = b) in ('owner', 'admin')
      or exists (select 1 from public.class_members m1 join public.class_members m2 on m1.class_id = m2.class_id
                 where m1.student_id = a and m2.student_id = b)
      or exists (select 1 from public.classes c join public.class_members m on m.class_id = c.id
                 where (c.teacher_id = a and m.student_id = b) or (c.teacher_id = b and m.student_id = a))
    );
$$;

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

create or replace function public.msg_thread(other uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if public.active_role() is null then raise exception 'not_active'; end if;
  if not (public.can_message(me, other)
          or exists (select 1 from public.messages m where (m.sender = me and m.recipient = other) or (m.sender = other and m.recipient = me))) then
    raise exception 'forbidden';
  end if;
  update public.messages set read_at = now() where sender = other and recipient = me and read_at is null;
  return jsonb_build_object(
    'other', (select jsonb_build_object('id', id, 'full_name', full_name, 'role', role, 'hero', hero, 'bio', bio, 'grade', grade, 'last_seen', last_seen)
              from public.profiles where id = other),
    'can', public.can_message(me, other),
    'items', coalesce((select jsonb_agg(jsonb_build_object('id', q.id, 'me', q.sender = me, 'b', q.body, 'at', q.created_at, 'r', q.read_at is not null) order by q.id)
                       from (select * from public.messages m
                             where (m.sender = me and m.recipient = other) or (m.sender = other and m.recipient = me)
                             order by m.id desc limit 100) q), '[]'::jsonb));
end $$;

create or replace function public.msg_send(to_id uuid, body_in text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); b text := btrim(coalesce(body_in, '')); m public.messages;
begin
  if public.active_role() is null then raise exception 'not_active'; end if;
  if length(b) < 1 or length(b) > 1000 then raise exception 'bad_message'; end if;
  if not public.can_message(me, to_id) then raise exception 'forbidden'; end if;
  if (select count(*) from public.messages where sender = me and created_at > now() - interval '10 minutes') >= 30 then
    raise exception 'too_many';
  end if;
  insert into public.messages (sender, recipient, body) values (me, to_id, public.clean_text(b)) returning * into m;
  return jsonb_build_object('id', m.id, 'me', true, 'b', m.body, 'at', m.created_at, 'r', false);
end $$;

-- Хабарлама санын сұрағанда «соңғы кіру» уақытын да жаңартады (онлайн белгісі үшін)
create or replace function public.msg_unread() returns int
language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set last_seen = now()
   where id = auth.uid() and (last_seen is null or last_seen < now() - interval '30 seconds');
  return (select count(*)::int from public.messages where recipient = auth.uid() and read_at is null);
end $$;

-- Мұғалім (не админ) сыныптағы оқушылардың бір-біріне жазған хаттарын көреді
create or replace function public.class_messages(cid uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.can_manage_class(cid) then raise exception 'forbidden'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', q.id, 'from', ps.full_name, 'to', pr.full_name, 'b', q.body, 'at', q.created_at) order by q.id desc)
    from (select * from public.messages m
          where exists (select 1 from public.class_members a where a.class_id = cid and a.student_id = m.sender)
            and exists (select 1 from public.class_members c2 where c2.class_id = cid and c2.student_id = m.recipient)
          order by m.id desc limit 200) q
    join public.profiles ps on ps.id = q.sender
    join public.profiles pr on pr.id = q.recipient), '[]'::jsonb);
end $$;

revoke all on function public.clean_text(text) from public, anon, authenticated;
revoke all on function public.can_message(uuid, uuid) from public, anon, authenticated;
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname in ('update_about', 'my_profile', 'msg_contacts', 'msg_thread', 'msg_send', 'msg_unread', 'class_messages')
  loop
    execute format('revoke all on function %s from public, anon', f.sig);
    execute format('grant execute on function %s to authenticated', f.sig);
  end loop;
end $$;
