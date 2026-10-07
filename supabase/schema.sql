-- =====================================================================
-- Ботакод: аккаунттар, рөлдер, сыныптар, прогресс
-- Supabase → SQL Editor ішіне толық қойып, Run бас.
--
-- МАҢЫЗДЫ: төмендегі 'OWNER_EMAIL_HERE' орнына ӨЗ email-іңді жаз.
-- Сол email-мен тіркелген адам автоматты түрде «құрушы» (owner) болады.
-- =====================================================================

-- ---------- Баптау ----------
create table if not exists public.app_config (
  key text primary key,
  value text not null
);
insert into public.app_config (key, value) values ('owner_email', 'OWNER_EMAIL_HERE')
  on conflict (key) do nothing;

-- ---------- Кестелер ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null default '',
  role text not null default 'student' check (role in ('owner', 'admin', 'teacher', 'student')),
  status text not null default 'active' check (status in ('active', 'pending', 'blocked')),
  created_at timestamptz not null default now(),
  last_seen timestamptz
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.class_members (
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create table if not exists public.progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null,
  level_id text not null,
  stars int not null default 0 check (stars between 0 and 3),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id, level_id)
);

create table if not exists public.lectures_read (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null,
  lecture_id text not null,
  primary key (user_id, course_id, lecture_id)
);

-- ---------- Қауіпсіздік: кестелерге тікелей қол жеткізу жабық ----------
-- Барлық әрекет төмендегі функциялар (RPC) арқылы жүреді, олар рөлді өзі тексереді.
alter table public.app_config enable row level security;
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.progress enable row level security;
alter table public.lectures_read enable row level security;
revoke all on public.app_config, public.profiles, public.classes, public.class_members,
  public.progress, public.lectures_read from anon, authenticated;

-- ---------- Көмекші функциялар ----------
-- Ағымдағы пайдаланушының белсенді рөлі (күтіп тұрған/бұғатталған болса, null)
create or replace function public.active_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and status = 'active'
$$;

create or replace function public.require_role(roles text[]) returns text
language plpgsql stable security definer set search_path = public as $$
declare r text := public.active_role();
begin
  if r is null then raise exception 'not_active'; end if;
  if not (r = any(roles)) then raise exception 'forbidden'; end if;
  return r;
end $$;

create or replace function public.make_class_code() returns text
language plpgsql volatile security definer set search_path = public as $$
declare c text;
begin
  loop
    c := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from public.classes where code = c);
  end loop;
  return c;
end $$;

-- ---------- Тіркелгенде профиль жасау ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  want text := meta ->> 'want_role';
  owner_email text;
  r text;
  st text;
  cls uuid;
begin
  select value into owner_email from public.app_config where key = 'owner_email';
  if owner_email is not null and lower(new.email) = lower(owner_email)
     and not exists (select 1 from public.profiles where role = 'owner') then
    r := 'owner'; st := 'active';
  elsif want = 'teacher' then
    r := 'teacher'; st := 'pending';
  else
    r := 'student'; st := 'active';
  end if;

  insert into public.profiles (id, email, full_name, role, status)
  values (new.id, new.email,
          coalesce(nullif(trim(meta ->> 'full_name'), ''), split_part(new.email, '@', 1)), r, st);

  if r = 'student' and coalesce(meta ->> 'class_code', '') <> '' then
    select id into cls from public.classes where code = upper(trim(meta ->> 'class_code'));
    if cls is not null then
      insert into public.class_members (class_id, student_id) values (cls, new.id) on conflict do nothing;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Профиль ----------
create or replace function public.my_profile() returns jsonb
language plpgsql security definer set search_path = public as $$
declare p jsonb;
begin
  update public.profiles set last_seen = now() where id = auth.uid();
  select jsonb_build_object('id', id, 'email', email, 'full_name', full_name, 'role', role,
                            'status', status, 'created_at', created_at)
    into p from public.profiles where id = auth.uid();
  return p;
end $$;

-- Егер адам owner email-мен тіркелгенде owner болмай қалса (мысалы, SQL кейін жүргізілсе)
create or replace function public.claim_owner() returns jsonb
language plpgsql security definer set search_path = public as $$
declare owner_email text; mail text;
begin
  select value into owner_email from public.app_config where key = 'owner_email';
  select email into mail from public.profiles where id = auth.uid();
  if mail is null or owner_email is null or lower(mail) <> lower(owner_email) then raise exception 'forbidden'; end if;
  if exists (select 1 from public.profiles where role = 'owner' and id <> auth.uid()) then raise exception 'owner_exists'; end if;
  update public.profiles set role = 'owner', status = 'active' where id = auth.uid();
  return public.my_profile();
end $$;

create or replace function public.update_name(new_name text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_active'; end if;
  if length(trim(coalesce(new_name, ''))) < 2 then raise exception 'bad_name'; end if;
  update public.profiles set full_name = left(trim(new_name), 60) where id = auth.uid();
end $$;

-- ---------- Прогресс ----------
-- items: [{c, l, s}], read: [{c, l}]. Ең үлкен жұлдызды сақтайды, бәрін қайтарады.
create or replace function public.sync_progress(items jsonb default '[]', read jsonb default '[]') returns jsonb
language plpgsql security definer set search_path = public as $$
declare it jsonb; res jsonb;
begin
  perform public.require_role(array['owner', 'admin', 'teacher', 'student']);
  for it in select * from jsonb_array_elements(coalesce(items, '[]'::jsonb)) loop
    insert into public.progress (user_id, course_id, level_id, stars)
    values (auth.uid(), left(it ->> 'c', 40), left(it ->> 'l', 40), least(3, greatest(0, coalesce((it ->> 's')::int, 0))))
    on conflict (user_id, course_id, level_id) do update
      set stars = greatest(public.progress.stars, excluded.stars),
          updated_at = case when excluded.stars > public.progress.stars then now() else public.progress.updated_at end;
  end loop;
  for it in select * from jsonb_array_elements(coalesce(read, '[]'::jsonb)) loop
    insert into public.lectures_read (user_id, course_id, lecture_id)
    values (auth.uid(), left(it ->> 'c', 40), left(it ->> 'l', 40)) on conflict do nothing;
  end loop;
  select jsonb_build_object(
    'progress', coalesce((select jsonb_agg(jsonb_build_object('c', course_id, 'l', level_id, 's', stars))
                          from public.progress where user_id = auth.uid()), '[]'::jsonb),
    'read', coalesce((select jsonb_agg(jsonb_build_object('c', course_id, 'l', lecture_id))
                      from public.lectures_read where user_id = auth.uid()), '[]'::jsonb)) into res;
  return res;
end $$;

-- ---------- Сыныптар: оқушы жағы ----------
create or replace function public.join_class(code_in text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare cls public.classes;
begin
  perform public.require_role(array['student']);
  select * into cls from public.classes where code = upper(trim(code_in));
  if cls.id is null then raise exception 'no_class'; end if;
  insert into public.class_members (class_id, student_id) values (cls.id, auth.uid()) on conflict do nothing;
  return jsonb_build_object('id', cls.id, 'name', cls.name);
end $$;

create or replace function public.leave_class(class_id_in uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.require_role(array['student']);
  delete from public.class_members where class_id = class_id_in and student_id = auth.uid();
end $$;

create or replace function public.student_classes() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public.require_role(array['student']);
  return coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'teacher', t.full_name) order by c.created_at)
    from public.class_members m join public.classes c on c.id = m.class_id
    join public.profiles t on t.id = c.teacher_id where m.student_id = auth.uid()), '[]'::jsonb);
end $$;

-- ---------- Сыныптар: мұғалім жағы ----------
create or replace function public.create_class(name_in text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare cls public.classes;
begin
  perform public.require_role(array['owner', 'admin', 'teacher']);
  if length(trim(coalesce(name_in, ''))) < 1 then raise exception 'bad_name'; end if;
  insert into public.classes (teacher_id, name, code)
  values (auth.uid(), left(trim(name_in), 60), public.make_class_code()) returning * into cls;
  return jsonb_build_object('id', cls.id, 'name', cls.name, 'code', cls.code);
end $$;

-- Сынып осы пайдаланушыға тиесілі ме, не ол админ/құрушы ма
create or replace function public.can_manage_class(cid uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare r text := public.active_role();
begin
  if r is null then return false; end if;
  if r in ('owner', 'admin') then return exists (select 1 from public.classes where id = cid); end if;
  return r = 'teacher' and exists (select 1 from public.classes where id = cid and teacher_id = auth.uid());
end $$;

create or replace function public.teacher_classes() returns jsonb
language plpgsql security definer set search_path = public as $$
declare r text;
begin
  r := public.require_role(array['owner', 'admin', 'teacher']);
  return coalesce((select jsonb_agg(jsonb_build_object(
      'id', c.id, 'name', c.name, 'code', c.code, 'teacher', t.full_name, 'mine', c.teacher_id = auth.uid(),
      'students', (select count(*) from public.class_members m where m.class_id = c.id)) order by c.created_at desc)
    from public.classes c join public.profiles t on t.id = c.teacher_id
    where c.teacher_id = auth.uid() or r in ('owner', 'admin')), '[]'::jsonb);
end $$;

create or replace function public.delete_class(cid uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.can_manage_class(cid) then raise exception 'forbidden'; end if;
  delete from public.classes where id = cid;
end $$;

create or replace function public.class_overview(cid uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.can_manage_class(cid) then raise exception 'forbidden'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
      'id', p.id, 'full_name', p.full_name, 'email', p.email, 'last_seen', p.last_seen,
      'stars', coalesce((select sum(stars) from public.progress where user_id = p.id), 0),
      'courses', coalesce((select jsonb_object_agg(course_id, jsonb_build_object('done', done, 'stars', st))
          from (select course_id, count(*) filter (where stars > 0) as done, sum(stars) as st
                from public.progress where user_id = p.id group by course_id) x), '{}'::jsonb)
    ) order by p.full_name)
    from public.class_members m join public.profiles p on p.id = m.student_id where m.class_id = cid), '[]'::jsonb);
end $$;

create or replace function public.remove_student(cid uuid, sid uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.can_manage_class(cid) then raise exception 'forbidden'; end if;
  delete from public.class_members where class_id = cid and student_id = sid;
end $$;

-- Бір оқушының толық прогресі: өзі, оның мұғалімі не админ ғана көре алады
create or replace function public.student_progress(sid uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r text := public.active_role(); ok boolean := false;
begin
  if r is null then raise exception 'not_active'; end if;
  if sid = auth.uid() or r in ('owner', 'admin') then ok := true;
  elsif r = 'teacher' then
    ok := exists (select 1 from public.class_members m join public.classes c on c.id = m.class_id
                  where m.student_id = sid and c.teacher_id = auth.uid());
  end if;
  if not ok then raise exception 'forbidden'; end if;
  return jsonb_build_object(
    'profile', (select jsonb_build_object('id', id, 'full_name', full_name, 'email', email, 'last_seen', last_seen)
                from public.profiles where id = sid),
    'progress', coalesce((select jsonb_agg(jsonb_build_object('c', course_id, 'l', level_id, 's', stars, 'at', updated_at))
                          from public.progress where user_id = sid), '[]'::jsonb));
end $$;

-- ---------- Админ жағы ----------
create or replace function public.admin_stats() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public.require_role(array['owner', 'admin']);
  return jsonb_build_object(
    'students', (select count(*) from public.profiles where role = 'student'),
    'teachers', (select count(*) from public.profiles where role = 'teacher' and status = 'active'),
    'admins', (select count(*) from public.profiles where role in ('owner', 'admin')),
    'pending', (select count(*) from public.profiles where status = 'pending'),
    'blocked', (select count(*) from public.profiles where status = 'blocked'),
    'classes', (select count(*) from public.classes),
    'stars', (select coalesce(sum(stars), 0) from public.progress));
end $$;

create or replace function public.admin_users() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public.require_role(array['owner', 'admin']);
  return coalesce((select jsonb_agg(jsonb_build_object(
      'id', p.id, 'email', p.email, 'full_name', p.full_name, 'role', p.role, 'status', p.status,
      'created_at', p.created_at, 'last_seen', p.last_seen,
      'stars', coalesce((select sum(stars) from public.progress where user_id = p.id), 0),
      'classes', (select count(*) from public.classes where teacher_id = p.id)
    ) order by (p.status = 'pending') desc, p.created_at desc) from public.profiles p), '[]'::jsonb);
end $$;

-- Күйді өзгерту: active (бекіту/ашу), blocked (бұғаттау)
create or replace function public.admin_set_status(uid uuid, new_status text) returns void
language plpgsql security definer set search_path = public as $$
declare me text; target public.profiles;
begin
  me := public.require_role(array['owner', 'admin']);
  if new_status not in ('active', 'blocked') then raise exception 'bad_status'; end if;
  select * into target from public.profiles where id = uid;
  if target.id is null then raise exception 'no_user'; end if;
  if target.id = auth.uid() or target.role = 'owner' then raise exception 'forbidden'; end if;
  if me = 'admin' and target.role = 'admin' then raise exception 'forbidden'; end if;
  update public.profiles set status = new_status where id = uid;
end $$;

-- Рөлді тек құрушы өзгертеді
create or replace function public.admin_set_role(uid uuid, new_role text) returns void
language plpgsql security definer set search_path = public as $$
declare target public.profiles;
begin
  perform public.require_role(array['owner']);
  if new_role not in ('admin', 'teacher', 'student') then raise exception 'bad_role'; end if;
  select * into target from public.profiles where id = uid;
  if target.id is null then raise exception 'no_user'; end if;
  if target.id = auth.uid() or target.role = 'owner' then raise exception 'forbidden'; end if;
  update public.profiles set role = new_role, status = 'active' where id = uid;
end $$;

create or replace function public.admin_delete_user(uid uuid) returns void
language plpgsql security definer set search_path = public as $$
declare me text; target public.profiles;
begin
  me := public.require_role(array['owner', 'admin']);
  select * into target from public.profiles where id = uid;
  if target.id is null then raise exception 'no_user'; end if;
  if target.id = auth.uid() or target.role = 'owner' then raise exception 'forbidden'; end if;
  if me = 'admin' and target.role = 'admin' then raise exception 'forbidden'; end if;
  delete from auth.users where id = uid;
end $$;

-- ---------- Рұқсаттар: тек кірген пайдаланушы функцияларды шақыра алады ----------
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname in (
             'my_profile','claim_owner','update_name','sync_progress','join_class','leave_class','student_classes',
             'create_class','teacher_classes','delete_class','class_overview','remove_student','student_progress',
             'admin_stats','admin_users','admin_set_status','admin_set_role','admin_delete_user')
  loop
    execute format('revoke all on function %s from public, anon', f.sig);
    execute format('grant execute on function %s to authenticated', f.sig);
  end loop;
end $$;

-- Ішкі көмекші функцияларды сырттан шақыруға болмайды
revoke all on function public.active_role() from public, anon, authenticated;
revoke all on function public.require_role(text[]) from public, anon, authenticated;
revoke all on function public.can_manage_class(uuid) from public, anon, authenticated;
revoke all on function public.make_class_code() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
