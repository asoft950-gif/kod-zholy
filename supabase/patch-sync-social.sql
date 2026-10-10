-- Bitlings: (1) құрылғылар арасында барлық күйді синхрондау, (2) профиль құпиялылығы, достар, хат жазу рұқсаты.
-- Supabase SQL Editor-де БІР РЕТ іске қос (қайта іске қосса да зиян жоқ).

-- =====================================================================
-- 1. Жалпы синхрондау: әр пайдаланушының кілт → мән кестесі
-- =====================================================================
create table if not exists public.user_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  k text not null check (length(k) between 1 and 120),
  v jsonb,
  t bigint not null default 0,            -- құрылғы уақыты (мс): қайсысы жаңа екенін анықтайды
  updated_at timestamptz not null default now(),
  primary key (user_id, k)
);
create index if not exists user_state_upd_idx on public.user_state (user_id, updated_at);
alter table public.user_state enable row level security;
revoke all on public.user_state from anon, authenticated;

create or replace function public.state_pull(since timestamptz default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if public.active_role() is null then raise exception 'not_active'; end if;
  return jsonb_build_object('now', now(), 'rows', coalesce((
    select jsonb_agg(jsonb_build_object('k', k, 'v', v, 't', t))
    from public.user_state where user_id = me and (since is null or updated_at > since)), '[]'::jsonb));
end $$;

create or replace function public.state_push(items jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); it jsonb; n int := 0;
begin
  if public.active_role() is null then raise exception 'not_active'; end if;
  if jsonb_typeof(items) <> 'array' or jsonb_array_length(items) > 400 then raise exception 'bad_input'; end if;
  for it in select * from jsonb_array_elements(items) loop
    continue when (it ->> 'k') is null or length(it ->> 'k') > 120 or (it ->> 'k') !~ '^kodzholy\.'
                  or length((it -> 'v')::text) > 60000;
    insert into public.user_state (user_id, k, v, t, updated_at)
      values (me, it ->> 'k', it -> 'v', coalesce((it ->> 't')::bigint, 0), now())
    on conflict (user_id, k) do update
      set v = excluded.v, t = excluded.t, updated_at = now()
      where excluded.t >= public.user_state.t;
    n := n + 1;
  end loop;
  -- бір пайдаланушыға ең көбі 1500 кілт
  delete from public.user_state where user_id = me and k in (
    select k from public.user_state where user_id = me order by updated_at desc offset 1500);
  return jsonb_build_object('n', n, 'now', now());
end $$;

-- =====================================================================
-- 2. Құпиялылық, достар, хат жазу рұқсаты
-- =====================================================================
alter table public.profiles add column if not exists visibility text not null default 'private';
alter table public.profiles add column if not exists msg_policy text not null default 'class';
do $$ begin
  alter table public.profiles add constraint profiles_visibility_chk check (visibility in ('private', 'public'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.profiles add constraint profiles_msgpolicy_chk check (msg_policy in ('everyone', 'class', 'friends'));
exception when duplicate_object then null; end $$;

create table if not exists public.friendships (
  requester uuid not null references public.profiles(id) on delete cascade,
  addressee uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  check (requester <> addressee)
);
create unique index if not exists friendships_pair_idx on public.friendships (least(requester, addressee), greatest(requester, addressee));
create index if not exists friendships_addr_idx on public.friendships (addressee, status);
alter table public.friendships enable row level security;
revoke all on public.friendships from anon, authenticated;

create or replace function public.is_friend(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.friendships f where f.status = 'accepted'
                 and ((f.requester = a and f.addressee = b) or (f.requester = b and f.addressee = a)));
$$;

-- Сыныптас не мұғалім–оқушы
create or replace function public.in_class(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.class_members m1 join public.class_members m2 on m1.class_id = m2.class_id
                 where m1.student_id = a and m2.student_id = b)
      or exists (select 1 from public.classes c join public.class_members m on m.class_id = c.id
                 where (c.teacher_id = a and m.student_id = b) or (c.teacher_id = b and m.student_id = a));
$$;

-- a адам b адамға жаза ала ма
create or replace function public.can_message(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select a is not null and b is not null and a <> b
    and exists (select 1 from public.profiles where id = b and status = 'active')
    and exists (select 1 from public.profiles where id = a and status = 'active')
    and (
      (select role from public.profiles where id = a) in ('owner', 'admin')
      or (select role from public.profiles where id = b) in ('owner', 'admin')
      or exists (select 1 from public.classes c join public.class_members m on m.class_id = c.id
                 where (c.teacher_id = a and m.student_id = b) or (c.teacher_id = b and m.student_id = a))
      or public.is_friend(a, b)
      or exists (select 1 from public.messages x where x.sender = b and x.recipient = a)
      or case (select msg_policy from public.profiles where id = b)
           when 'everyone' then true
           when 'class' then public.in_class(a, b)
           else false end
    );
$$;

-- Профильді кім көре алады
create or replace function public.can_view_profile(viewer uuid, target uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select viewer is not null and target is not null
    and exists (select 1 from public.profiles where id = target and status = 'active')
    and exists (select 1 from public.profiles where id = viewer and status = 'active')
    and (
      viewer = target
      or (select role from public.profiles where id = viewer) in ('owner', 'admin')
      or (select role from public.profiles where id = target) in ('owner', 'admin')
      or (select visibility from public.profiles where id = target) = 'public'
      or public.in_class(viewer, target)
      or public.is_friend(viewer, target)
    );
$$;

create or replace function public.friend_rel(a uuid, b uuid) returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select case when f.status = 'accepted' then 'friends'
                               when f.requester = a then 'outgoing' else 'incoming' end
                   from public.friendships f
                   where (f.requester = a and f.addressee = b) or (f.requester = b and f.addressee = a)), 'none');
$$;

create or replace function public.update_privacy(vis text, pol text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if public.active_role() is null then raise exception 'not_active'; end if;
  if vis not in ('private', 'public') or pol not in ('everyone', 'class', 'friends') then raise exception 'bad_input'; end if;
  update public.profiles set visibility = vis, msg_policy = pol where id = auth.uid();
end $$;

create or replace function public.my_profile() returns jsonb
language plpgsql security definer set search_path = public as $$
declare p jsonb;
begin
  update public.profiles set last_seen = now() where id = auth.uid();
  select jsonb_build_object('id', id, 'email', email, 'full_name', full_name, 'role', role,
                            'status', status, 'created_at', created_at, 'hero', hero, 'bio', bio, 'grade', grade,
                            'visibility', visibility, 'msg_policy', msg_policy)
    into p from public.profiles where id = auth.uid();
  return p;
end $$;

create or replace function public.friend_request(uid uuid) returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); rel text;
begin
  if public.active_role() is null then raise exception 'not_active'; end if;
  if uid is null or uid = me or not exists (select 1 from public.profiles where id = uid and status = 'active') then raise exception 'no_user'; end if;
  rel := public.friend_rel(me, uid);
  if rel = 'incoming' then
    update public.friendships set status = 'accepted' where requester = uid and addressee = me;
    return 'friends';
  elsif rel <> 'none' then
    return rel;
  end if;
  if (select count(*) from public.friendships where requester = me and status = 'pending') >= 50 then raise exception 'too_many'; end if;
  insert into public.friendships (requester, addressee) values (me, uid);
  return 'outgoing';
end $$;

create or replace function public.friend_respond(uid uuid, accept boolean) returns text
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if public.active_role() is null then raise exception 'not_active'; end if;
  if accept then
    update public.friendships set status = 'accepted' where requester = uid and addressee = me and status = 'pending';
    return 'friends';
  end if;
  delete from public.friendships where requester = uid and addressee = me and status = 'pending';
  return 'none';
end $$;

-- Досты өшіру не өз сұрауыңды қайтарып алу
create or replace function public.friend_remove(uid uuid) returns void
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if public.active_role() is null then raise exception 'not_active'; end if;
  delete from public.friendships where (requester = me and addressee = uid) or (requester = uid and addressee = me);
end $$;

create or replace function public.friends_list() returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if public.active_role() is null then raise exception 'not_active'; end if;
  return jsonb_build_object(
    'friends', coalesce((select jsonb_agg(x order by x ->> 'full_name') from (
        select jsonb_build_object('id', p.id, 'full_name', p.full_name, 'role', p.role, 'hero', p.hero, 'last_seen', p.last_seen) as x
        from public.friendships f join public.profiles p on p.id = case when f.requester = me then f.addressee else f.requester end
        where f.status = 'accepted' and (f.requester = me or f.addressee = me) and p.status = 'active') q), '[]'::jsonb),
    'incoming', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'full_name', p.full_name, 'role', p.role, 'hero', p.hero, 'last_seen', p.last_seen) order by f.created_at desc)
        from public.friendships f join public.profiles p on p.id = f.requester
        where f.addressee = me and f.status = 'pending' and p.status = 'active'), '[]'::jsonb),
    'outgoing', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'full_name', p.full_name, 'role', p.role, 'hero', p.hero, 'last_seen', p.last_seen) order by f.created_at desc)
        from public.friendships f join public.profiles p on p.id = f.addressee
        where f.requester = me and f.status = 'pending' and p.status = 'active'), '[]'::jsonb));
end $$;

-- Аты бойынша іздеу: тек ашық профильдер, сыныптастар және достар табылады
create or replace function public.find_people(q text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); s text := btrim(coalesce(q, ''));
begin
  if public.active_role() is null then raise exception 'not_active'; end if;
  if length(s) < 2 then return '[]'::jsonb; end if;
  s := replace(replace(replace(s, '\', ''), '%', ''), '_', '');
  return coalesce((select jsonb_agg(x) from (
    select jsonb_build_object('id', p.id, 'full_name', p.full_name, 'role', p.role, 'hero', p.hero,
                              'last_seen', p.last_seen, 'rel', public.friend_rel(me, p.id)) as x
    from public.profiles p
    where p.id <> me and p.status = 'active' and p.full_name ilike '%' || s || '%'
      and public.can_view_profile(me, p.id)
    order by p.full_name limit 20) t), '[]'::jsonb);
end $$;

-- Хабарласу тізімі: сыныптастар, достар, әкімшілік және жазысқандар
create or replace function public.msg_contacts() returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); mr text := public.active_role();
begin
  if mr is null then raise exception 'not_active'; end if;
  return coalesce((select jsonb_agg(x order by (x ->> 'last_at') desc nulls last, x ->> 'full_name') from (
    select jsonb_build_object(
      'id', p.id, 'full_name', p.full_name, 'role', p.role, 'hero', p.hero, 'last_seen', p.last_seen,
      'unread', (select count(*) from public.messages m where m.sender = p.id and m.recipient = me and m.read_at is null),
      'last', (select left(m.body, 80) from public.messages m
               where (m.sender = me and m.recipient = p.id) or (m.sender = p.id and m.recipient = me) order by m.id desc limit 1),
      'last_at', (select max(m.created_at) from public.messages m
                  where (m.sender = me and m.recipient = p.id) or (m.sender = p.id and m.recipient = me))) as x
    from public.profiles p
    where p.id <> me and p.status = 'active' and (
      mr in ('owner', 'admin') or p.role in ('owner', 'admin')
      or public.in_class(me, p.id) or public.is_friend(me, p.id)
      or exists (select 1 from public.messages m where (m.sender = me and m.recipient = p.id) or (m.sender = p.id and m.recipient = me)))
    limit 500) t), '[]'::jsonb);
end $$;

-- Басқа адамның профилі. Рұқсат жоқ болса: тек аты мен достық күйі (жабық профиль)
create or replace function public.public_profile(uid uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); r text := public.active_role();
begin
  if r is null then raise exception 'not_active'; end if;
  if not exists (select 1 from public.profiles where id = uid and status = 'active') then raise exception 'not_found'; end if;
  if not public.can_view_profile(me, uid) then
    return jsonb_build_object('locked', true,
      'profile', (select jsonb_build_object('id', id, 'full_name', full_name, 'role', role) from public.profiles where id = uid),
      'rel', public.friend_rel(me, uid), 'can_msg', public.can_message(me, uid));
  end if;
  return jsonb_build_object(
    'locked', false,
    'rel', case when uid = me then 'me' else public.friend_rel(me, uid) end,
    'can_msg', public.can_message(me, uid),
    'profile', (select jsonb_build_object('id', id, 'full_name', full_name, 'role', role, 'bio', bio, 'grade', grade,
                                          'last_seen', last_seen, 'created_at', created_at, 'visibility', visibility)
                from public.profiles where id = uid),
    'hero', (select hero from public.profiles where id = uid),
    'progress', coalesce((select jsonb_agg(jsonb_build_object('c', course_id, 'l', level_id, 's', stars))
                          from public.progress where user_id = uid), '[]'::jsonb),
    'read', coalesce((select jsonb_agg(jsonb_build_object('c', course_id, 'l', lecture_id))
                      from public.lectures_read where user_id = uid), '[]'::jsonb),
    'days', coalesce((select jsonb_agg(jsonb_build_object('d', day, 'y', case when daily then 1 else 0 end))
                      from public.activity_days where user_id = uid), '[]'::jsonb),
    'classes', coalesce((select jsonb_agg(c.name) from public.classes c
                         where c.teacher_id = uid or exists (select 1 from public.class_members m where m.class_id = c.id and m.student_id = uid)), '[]'::jsonb));
end $$;

-- msg_thread: 'can' мәні жаңа can_message арқылы есептеледі (функция өзгермейді)

-- ---------- Құқықтар ----------
revoke all on function public.is_friend(uuid, uuid) from public, anon, authenticated;
revoke all on function public.in_class(uuid, uuid) from public, anon, authenticated;
revoke all on function public.can_message(uuid, uuid) from public, anon, authenticated;
revoke all on function public.can_view_profile(uuid, uuid) from public, anon, authenticated;
revoke all on function public.friend_rel(uuid, uuid) from public, anon, authenticated;
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname in ('state_pull', 'state_push', 'update_privacy', 'my_profile', 'friend_request',
             'friend_respond', 'friend_remove', 'friends_list', 'find_people', 'msg_contacts', 'public_profile')
  loop
    execute format('revoke all on function %s from public, anon', f.sig);
    execute format('grant execute on function %s to authenticated', f.sig);
  end loop;
end $$;
