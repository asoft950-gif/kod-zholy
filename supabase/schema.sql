-- =====================================================================
-- Bitlings: аккаунттар, рөлдер, сыныптар, прогресс
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

-- Оқушының кейіпкері (Bitlings): { color, starters, eq, t }
alter table public.profiles add column if not exists hero jsonb;

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  code text not null unique,
  created_at timestamptz not null default now()
);

-- Сынып рейтингі: мұғалім қосқанда ғана оқушыларға көрінеді
alter table public.classes add column if not exists rating_on boolean not null default false;

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

-- Рұқсат етілген деңгейлер тізімі (node tools/gen-catalog.mjs -> supabase/catalog.sql). Бос болса, сүзгі өшірулі.
create table if not exists public.level_catalog (
  course_id text not null,
  level_id text not null,
  primary key (course_id, level_id)
);
alter table public.level_catalog enable row level security;
alter table public.profiles add column if not exists last_sync timestamptz;

create table if not exists public.lectures_read (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null,
  lecture_id text not null,
  primary key (user_id, course_id, lecture_id)
);

create table if not exists public.activity_days (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  daily boolean not null default false,
  primary key (user_id, day)
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null default '',
  course text not null check (course in ('python', 'javascript')),
  starter text not null default '',
  hint text not null default '',
  expected text not null default '',
  expected_hash text not null check (expected_hash ~ '^[0-9a-f]{64}$'),
  par int check (par is null or par between 1 and 200),
  due date,
  created_at timestamptz not null default now()
);

create table if not exists public.assignment_done (
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  stars int not null check (stars between 1 and 3),
  updated_at timestamptz not null default now(),
  primary key (assignment_id, student_id)
);

-- ---------- Қауіпсіздік: кестелерге тікелей қол жеткізу жабық ----------
-- Барлық әрекет төмендегі функциялар (RPC) арқылы жүреді, олар рөлді өзі тексереді.
alter table public.app_config enable row level security;
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.progress enable row level security;
alter table public.lectures_read enable row level security;
alter table public.activity_days enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_done enable row level security;
revoke all on public.app_config, public.profiles, public.classes, public.class_members,
  public.progress, public.lectures_read, public.activity_days, public.assignments, public.assignment_done from anon, authenticated;

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
                            'status', status, 'created_at', created_at, 'hero', hero)
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
-- items: [{c, l, s}], read: [{c, l}], days: [{d, y}]. Ең үлкен жұлдызды сақтайды, бәрін қайтарады.
-- days: белсенді күндер (серия үшін), y=1 — сол күні «күннің тапсырмасы» орындалған.
drop function if exists public.sync_progress(jsonb, jsonb);
create or replace function public.sync_progress(items jsonb default '[]', read jsonb default '[]', days jsonb default '[]') returns jsonb
language plpgsql security definer set search_path = public as $$
declare it jsonb; res jsonb; dd date; ls timestamptz; allowance numeric; gain int; cur int; want int; cname text; lname text; use_cat boolean;
begin
  perform public.require_role(array['owner', 'admin', 'teacher', 'student']);
  -- Жұлдыз қорғанысы: тек каталогтағы деңгейлер қабылданады, ал жаңа жұлдыздар саны өткен уақытқа сәйкес болуы керек
  -- (бір деңгей — кемінде ~12 секунд). Алғашқы синхронда (ескі қонақ прогресі) үлкенірек қор беріледі.
  select last_sync into ls from public.profiles where id = auth.uid();
  if ls is null then allowance := 150;
  else allowance := least(400, 8 + floor(extract(epoch from (now() - ls)) / 12));
  end if;
  use_cat := exists (select 1 from public.level_catalog);
  for it in select * from jsonb_array_elements(coalesce(items, '[]'::jsonb)) loop
    cname := left(it ->> 'c', 40);
    lname := left(it ->> 'l', 40);
    want := least(3, greatest(0, coalesce((it ->> 's')::int, 0)));
    if want = 0 then continue; end if;
    if use_cat and not exists (select 1 from public.level_catalog where course_id = cname and level_id = lname) then continue; end if;
    select stars into cur from public.progress where user_id = auth.uid() and course_id = cname and level_id = lname;
    gain := want - coalesce(cur, 0);
    if gain <= 0 then continue; end if;
    if gain > allowance then continue; end if;
    allowance := allowance - gain;
    insert into public.progress (user_id, course_id, level_id, stars)
    values (auth.uid(), cname, lname, want)
    on conflict (user_id, course_id, level_id) do update
      set stars = greatest(public.progress.stars, excluded.stars),
          updated_at = case when excluded.stars > public.progress.stars then now() else public.progress.updated_at end;
  end loop;
  update public.profiles set last_sync = now() where id = auth.uid();
  for it in select * from jsonb_array_elements(coalesce(read, '[]'::jsonb)) loop
    insert into public.lectures_read (user_id, course_id, lecture_id)
    values (auth.uid(), left(it ->> 'c', 40), left(it ->> 'l', 40)) on conflict do nothing;
  end loop;
  for it in select * from jsonb_array_elements(coalesce(days, '[]'::jsonb)) loop
    begin
      dd := (it ->> 'd')::date;
    exception when others then
      continue;
    end;
    -- болашақ күндер мен тым ескі күндер қабылданбайды (уақыт белдеуі үшін бір күн қор)
    if dd > current_date + 1 or dd < date '2024-01-01' then continue; end if;
    insert into public.activity_days (user_id, day, daily)
    values (auth.uid(), dd, coalesce((it ->> 'y')::int, 0) = 1)
    on conflict (user_id, day) do update set daily = public.activity_days.daily or excluded.daily;
  end loop;
  select jsonb_build_object(
    'progress', coalesce((select jsonb_agg(jsonb_build_object('c', course_id, 'l', level_id, 's', stars))
                          from public.progress where user_id = auth.uid()), '[]'::jsonb),
    'read', coalesce((select jsonb_agg(jsonb_build_object('c', course_id, 'l', lecture_id))
                      from public.lectures_read where user_id = auth.uid()), '[]'::jsonb),
    'days', coalesce((select jsonb_agg(jsonb_build_object('d', day, 'y', case when daily then 1 else 0 end))
                      from public.activity_days where user_id = auth.uid()), '[]'::jsonb)) into res;
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
  return coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'teacher', t.full_name, 'rating', c.rating_on) order by c.created_at)
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
      'id', c.id, 'name', c.name, 'code', c.code, 'teacher', t.full_name, 'mine', c.teacher_id = auth.uid(), 'rating', c.rating_on,
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
                          from public.progress where user_id = sid), '[]'::jsonb),
    'read', coalesce((select jsonb_agg(jsonb_build_object('c', course_id, 'l', lecture_id))
                      from public.lectures_read where user_id = sid), '[]'::jsonb),
    'days', coalesce((select jsonb_agg(jsonb_build_object('d', day, 'y', case when daily then 1 else 0 end))
                      from public.activity_days where user_id = sid), '[]'::jsonb),
    'hero', (select hero from public.profiles where id = sid),
    'role', (select role from public.profiles where id = sid),
    'created_at', (select created_at from public.profiles where id = sid));
end $$;

-- ---------- Мұғалімнің тапсырмалары ----------
-- Күтілетін нәтиже оқушыға берілмейді: тек оның SHA-256 хэші (оны мұғалімнің браузері есептейді).
create or replace function public.create_assignment(
  cid uuid, title_in text, body_in text, course_in text, starter_in text, hint_in text,
  expected_in text, hash_in text, par_in int, due_in date) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a public.assignments;
begin
  if not public.can_manage_class(cid) then raise exception 'forbidden'; end if;
  if length(trim(coalesce(title_in, ''))) < 1 or course_in not in ('python', 'javascript')
     or coalesce(hash_in, '') !~ '^[0-9a-f]{64}$' or (par_in is not null and (par_in < 1 or par_in > 200)) then
    raise exception 'bad_input';
  end if;
  insert into public.assignments (class_id, teacher_id, title, body, course, starter, hint, expected, expected_hash, par, due)
  values (cid, auth.uid(), left(trim(title_in), 80), left(coalesce(body_in, ''), 4000), course_in,
          left(coalesce(starter_in, ''), 4000), left(coalesce(hint_in, ''), 500), left(coalesce(expected_in, ''), 2000),
          hash_in, par_in, due_in)
  returning * into a;
  return jsonb_build_object('id', a.id, 'title', a.title);
end $$;

create or replace function public.delete_assignment(aid uuid) returns void
language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  select class_id into cid from public.assignments where id = aid;
  if cid is null or not public.can_manage_class(cid) then raise exception 'forbidden'; end if;
  delete from public.assignments where id = aid;
end $$;

create or replace function public.class_assignments(cid uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.can_manage_class(cid) then raise exception 'forbidden'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
      'id', a.id, 'title', a.title, 'course', a.course, 'due', a.due, 'created_at', a.created_at,
      'done', (select count(*) from public.assignment_done d where d.assignment_id = a.id),
      'total', (select count(*) from public.class_members m where m.class_id = a.class_id)) order by a.created_at desc)
    from public.assignments a where a.class_id = cid), '[]'::jsonb);
end $$;

create or replace function public.assignment_results(aid uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  select class_id into cid from public.assignments where id = aid;
  if cid is null or not public.can_manage_class(cid) then raise exception 'forbidden'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
      'id', p.id, 'full_name', p.full_name, 'stars', d.stars, 'at', d.updated_at) order by p.full_name)
    from public.class_members m join public.profiles p on p.id = m.student_id
    left join public.assignment_done d on d.assignment_id = aid and d.student_id = p.id
    where m.class_id = cid), '[]'::jsonb);
end $$;

create or replace function public.my_assignments() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public.require_role(array['student']);
  return coalesce((select jsonb_agg(jsonb_build_object(
      'id', a.id, 'title', a.title, 'course', a.course, 'due', a.due, 'class', c.name, 'stars', d.stars)
      order by (d.stars is not null), a.due nulls last, a.created_at desc)
    from public.class_members m
    join public.classes c on c.id = m.class_id
    join public.assignments a on a.class_id = c.id
    left join public.assignment_done d on d.assignment_id = a.id and d.student_id = auth.uid()
    where m.student_id = auth.uid()), '[]'::jsonb);
end $$;

create or replace function public.get_assignment(aid uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare a public.assignments; r text := public.active_role(); mgr boolean; res jsonb;
begin
  if r is null then raise exception 'not_active'; end if;
  select * into a from public.assignments where id = aid;
  if a.id is null then raise exception 'no_assignment'; end if;
  mgr := public.can_manage_class(a.class_id);
  if not mgr and not (r = 'student' and exists (select 1 from public.class_members where class_id = a.class_id and student_id = auth.uid())) then
    raise exception 'forbidden';
  end if;
  res := jsonb_build_object('id', a.id, 'title', a.title, 'body', a.body, 'course', a.course, 'starter', a.starter,
    'hint', a.hint, 'par', a.par, 'due', a.due, 'expected_hash', a.expected_hash, 'manager', mgr,
    'class', (select name from public.classes where id = a.class_id),
    'stars', (select stars from public.assignment_done where assignment_id = a.id and student_id = auth.uid()));
  if mgr then res := res || jsonb_build_object('expected', a.expected); end if;
  return res;
end $$;

create or replace function public.submit_assignment(aid uuid, stars_in int) returns int
language plpgsql security definer set search_path = public as $$
declare cid uuid; s int := least(3, greatest(1, coalesce(stars_in, 1))); best int;
begin
  perform public.require_role(array['student']);
  select class_id into cid from public.assignments where id = aid;
  if cid is null or not exists (select 1 from public.class_members where class_id = cid and student_id = auth.uid()) then
    raise exception 'forbidden';
  end if;
  insert into public.assignment_done (assignment_id, student_id, stars) values (aid, auth.uid(), s)
  on conflict (assignment_id, student_id) do update
    set stars = greatest(public.assignment_done.stars, excluded.stars),
        updated_at = case when excluded.stars > public.assignment_done.stars then now() else public.assignment_done.updated_at end
  returning stars into best;
  return best;
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

-- ---------- Сыныпқа берілген дайын тапсырмалар (сайттағы деңгейлерден) ----------
-- Мұғалім ештеңе жазбайды: курс пен деңгейді таңдайды. Нәтиже оқушының өз прогресінен (stars) алынады.
create table if not exists public.class_levels (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  course text not null check (course in ('python', 'javascript', 'html', 'css')),
  level_id text not null check (length(level_id) between 1 and 12),
  due date,
  created_at timestamptz not null default now(),
  unique (class_id, course, level_id)
);
alter table public.class_levels enable row level security;
revoke all on public.class_levels from anon, authenticated;

create or replace function public.assign_level(cid uuid, course_in text, level_in text, due_in date) returns jsonb
language plpgsql security definer set search_path = public as $$
declare x public.class_levels;
begin
  if not public.can_manage_class(cid) then raise exception 'forbidden'; end if;
  if course_in not in ('python', 'javascript', 'html', 'css') or length(coalesce(level_in, '')) not between 1 and 12 then
    raise exception 'bad_input';
  end if;
  insert into public.class_levels (class_id, teacher_id, course, level_id, due)
  values (cid, auth.uid(), course_in, level_in, due_in)
  on conflict (class_id, course, level_id) do update set due = excluded.due
  returning * into x;
  return jsonb_build_object('id', x.id);
end $$;

create or replace function public.remove_level(lid uuid) returns void
language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  select class_id into cid from public.class_levels where id = lid;
  if cid is null or not public.can_manage_class(cid) then raise exception 'forbidden'; end if;
  delete from public.class_levels where id = lid;
end $$;

create or replace function public.class_levels_list(cid uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.can_manage_class(cid) then raise exception 'forbidden'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
      'id', x.id, 'course', x.course, 'level_id', x.level_id, 'due', x.due, 'created_at', x.created_at,
      'done', (select count(*) from public.class_members m join public.progress p on p.user_id = m.student_id
               where m.class_id = x.class_id and p.course_id = x.course and p.level_id = x.level_id and p.stars > 0),
      'total', (select count(*) from public.class_members m where m.class_id = x.class_id)) order by x.created_at desc)
    from public.class_levels x where x.class_id = cid), '[]'::jsonb);
end $$;

create or replace function public.level_results(lid uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare x public.class_levels;
begin
  select * into x from public.class_levels where id = lid;
  if x.id is null or not public.can_manage_class(x.class_id) then raise exception 'forbidden'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
      'id', p.id, 'full_name', p.full_name, 'stars', coalesce(g.stars, 0)) order by p.full_name)
    from public.class_members m join public.profiles p on p.id = m.student_id
    left join public.progress g on g.user_id = p.id and g.course_id = x.course and g.level_id = x.level_id
    where m.class_id = x.class_id), '[]'::jsonb);
end $$;

create or replace function public.my_levels() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public.require_role(array['student']);
  return coalesce((select jsonb_agg(jsonb_build_object(
      'id', x.id, 'course', x.course, 'level_id', x.level_id, 'due', x.due, 'class', c.name,
      'stars', coalesce(g.stars, 0))
      order by (coalesce(g.stars, 0) > 0), x.due nulls last, x.created_at desc)
    from public.class_members m
    join public.classes c on c.id = m.class_id
    join public.class_levels x on x.class_id = c.id
    left join public.progress g on g.user_id = auth.uid() and g.course_id = x.course and g.level_id = x.level_id
    where m.student_id = auth.uid()), '[]'::jsonb);
end $$;

-- ---------- Сынып статистикасы (мұғалімге) ----------
create or replace function public.class_stats(cid uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.can_manage_class(cid) then raise exception 'forbidden'; end if;
  return jsonb_build_object(
    'students', coalesce((select jsonb_agg(jsonb_build_object(
        'id', p.id, 'name', p.full_name, 'last_seen', p.last_seen,
        'last_day', (select max(a.day) from public.activity_days a where a.user_id = p.id),
        'days7', (select count(*) from public.activity_days a where a.user_id = p.id and a.day > current_date - 7),
        'days30', (select count(*) from public.activity_days a where a.user_id = p.id and a.day > current_date - 30)
      ) order by p.full_name)
      from public.class_members m join public.profiles p on p.id = m.student_id where m.class_id = cid), '[]'::jsonb),
    'progress', coalesce((select jsonb_agg(jsonb_build_object('u', g.user_id, 'c', g.course_id, 'l', g.level_id, 's', g.stars, 'at', g.updated_at))
      from public.progress g join public.class_members m on m.student_id = g.user_id
      where m.class_id = cid and g.stars > 0), '[]'::jsonb));
end $$;

-- ---------- Сынып рейтингі ----------
-- Қатарынан белсенді күн саны (бүгін не кеше аяқталған болса ғана)
create or replace function public.user_streak(uid uuid) returns int
language sql stable security definer set search_path = public as $$
  with recursive s(day) as (
    select max(day) from public.activity_days where user_id = uid having max(day) >= current_date - 1
    union all
    select a.day from public.activity_days a join s on a.day = s.day - 1 where a.user_id = uid
  ) select count(*)::int from s where day is not null;
$$;

create or replace function public.set_class_rating(cid uuid, on_in boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.can_manage_class(cid) then raise exception 'forbidden'; end if;
  update public.classes set rating_on = coalesce(on_in, false) where id = cid;
end $$;

-- ---------- Апталық лига ----------
-- Өткен аптада сыныпта ең көп жұлдыз жинаған үш оқушы осы аптаға арнайы зат алады.
-- Апта дүйсенбіден басталады (UTC). Нәтиже аптаның басында бір рет қатырылады.
create table if not exists public.league_weeks (
  class_id uuid not null references public.classes(id) on delete cascade,
  week date not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rank int not null,
  stars int not null,
  primary key (class_id, week, user_id)
);
alter table public.league_weeks enable row level security;

create or replace function public.ensure_league(cid uuid) returns void
language plpgsql security definer set search_path = public as $$
declare w date := date_trunc('week', now())::date;
begin
  if exists (select 1 from public.league_weeks where class_id = cid and week = w) then return; end if;
  insert into public.league_weeks (class_id, week, user_id, rank, stars)
  select cid, w, uid, rk, st from (
    select m.student_id as uid, sum(g.stars)::int as st,
           row_number() over (order by sum(g.stars) desc, min(p.full_name), m.student_id) as rk
    from public.class_members m
    join public.progress g on g.user_id = m.student_id
    join public.profiles p on p.id = m.student_id
    where m.class_id = cid and g.stars > 0 and g.updated_at >= (w - 7) and g.updated_at < w
    group by m.student_id) q
  where rk <= 3
  on conflict do nothing;
end $$;

-- Менің осы аптадағы лига орным (1–3) не null
create or replace function public.my_league() returns int
language plpgsql security definer set search_path = public as $$
declare w date := date_trunc('week', now())::date; c record;
begin
  if auth.uid() is null then return null; end if;
  for c in select cl.id from public.class_members m join public.classes cl on cl.id = m.class_id
           where m.student_id = auth.uid() and cl.rating_on loop
    perform public.ensure_league(c.id);
  end loop;
  return (select min(l.rank) from public.league_weeks l join public.classes cl on cl.id = l.class_id
          where l.user_id = auth.uid() and l.week = w and cl.rating_on);
end $$;

-- Мұғалімге әрдайым, оқушыға тек рейтинг қосулы болғанда (және ол сыныпта болса)
create or replace function public.class_rating(cid uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare on_ boolean; mgr boolean := public.can_manage_class(cid); w date := date_trunc('week', now())::date;
begin
  select rating_on into on_ from public.classes where id = cid;
  if on_ is null then raise exception 'forbidden'; end if;
  if not mgr and not (public.active_role() = 'student' and on_ and exists (
      select 1 from public.class_members where class_id = cid and student_id = auth.uid())) then
    raise exception 'forbidden';
  end if;
  perform public.ensure_league(cid);
  return jsonb_build_object('on', on_, 'rows', coalesce((select jsonb_agg(x order by (x ->> 'stars')::int desc, (x ->> 'streak')::int desc, x ->> 'name') from (
    select jsonb_build_object('id', p.id, 'name', p.full_name, 'me', p.id = auth.uid(),
      'stars', coalesce((select sum(g.stars) from public.progress g where g.user_id = p.id), 0)::int,
      'streak', public.user_streak(p.id),
      'hero', p.hero,
      'lg', (select l.rank from public.league_weeks l where l.class_id = cid and l.week = w and l.user_id = p.id),
      'week', coalesce((select sum(g.stars) from public.progress g where g.user_id = p.id and g.updated_at >= w), 0)::int) as x
    from public.class_members m join public.profiles p on p.id = m.student_id where m.class_id = cid) q), '[]'::jsonb));
end $$;

-- ---------- Кейіпкерді сақтау ----------
create or replace function public.save_hero(h jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare clean jsonb;
begin
  if public.active_role() is null then raise exception 'not_active'; end if;
  if h is null or jsonb_typeof(h) <> 'object' or octet_length(h::text) > 2000 then raise exception 'bad_hero'; end if;
  if coalesce(h ->> 'color', '') !~ '^#[0-9a-fA-F]{6}$' then raise exception 'bad_hero'; end if;
  if jsonb_typeof(h -> 'starters') <> 'array' or jsonb_typeof(h -> 'eq') <> 'object' then raise exception 'bad_hero'; end if;
  clean := jsonb_build_object('color', h -> 'color', 'starters', h -> 'starters', 'eq', h -> 'eq',
                              't', coalesce((h ->> 't')::numeric, 0));
  update public.profiles set hero = clean where id = auth.uid();
end $$;

-- ---------- Апталық сандық: аптасына бір рет (құрылғыдан тәуелсіз) ----------
alter table public.profiles add column if not exists chest_week date;

create or replace function public.claim_chest(wk date) returns boolean
language plpgsql security definer set search_path = public as $$
declare cur date;
begin
  if public.active_role() is null then raise exception 'not_active'; end if;
  -- апта басы (дүйсенбі) және қазіргі уақытқа жақын болуы керек
  if wk is null or extract(isodow from wk) <> 1 or wk > current_date + 1 or wk < current_date - 8 then raise exception 'bad_week'; end if;
  select chest_week into cur from public.profiles where id = auth.uid() for update;
  if cur is not null and cur >= wk then return false; end if;
  update public.profiles set chest_week = wk where id = auth.uid();
  return true;
end $$;
revoke all on function public.claim_chest(date) from public, anon;
grant execute on function public.claim_chest(date) to authenticated;

-- ---------- Құпиясөзді қалпына келтіру (пошта керек емес) ----------
-- Оқушының мұғалімі не админ уақытша құпиясөз қояды. Мұғалім тек өз сыныбындағы оқушыға, админ оқушы мен мұғалімге, құрушы кез келгенге (өзінен басқа құрушыдан).
create or replace function public.reset_password(sid uuid, new_pw text) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare r text := public.active_role(); target public.profiles; ok boolean := false;
begin
  if r is null then raise exception 'not_active'; end if;
  if length(coalesce(new_pw, '')) < 6 or length(new_pw) > 72 then raise exception 'bad_password'; end if;
  select * into target from public.profiles where id = sid;
  if target.id is null then raise exception 'no_user'; end if;
  if target.id = auth.uid() or target.role = 'owner' then raise exception 'forbidden'; end if;
  if r = 'owner' then ok := true;
  elsif r = 'admin' then ok := target.role in ('student', 'teacher');
  elsif r = 'teacher' then
    ok := target.role = 'student' and exists (select 1 from public.class_members m join public.classes c on c.id = m.class_id
                                              where m.student_id = sid and c.teacher_id = auth.uid());
  end if;
  if not ok then raise exception 'forbidden'; end if;
  update auth.users set encrypted_password = extensions.crypt(new_pw, extensions.gen_salt('bf')), updated_at = now() where id = sid;
end $$;

-- ---------- Рұқсаттар: тек кірген пайдаланушы функцияларды шақыра алады ----------
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname in (
             'my_profile','claim_owner','update_name','sync_progress','join_class','leave_class','student_classes',
             'create_class','teacher_classes','delete_class','class_overview','remove_student','student_progress',
             'admin_stats','admin_users','admin_set_status','admin_set_role','admin_delete_user',
             'create_assignment','delete_assignment','class_assignments','assignment_results','my_assignments',
             'get_assignment','submit_assignment',
             'assign_level','remove_level','class_levels_list','level_results','my_levels','class_stats','reset_password','set_class_rating','class_rating','my_league','save_hero','claim_chest')
  loop
    execute format('revoke all on function %s from public, anon', f.sig);
    execute format('grant execute on function %s to authenticated', f.sig);
  end loop;
end $$;

-- Ішкі көмекші функцияларды сырттан шақыруға болмайды
revoke all on function public.active_role() from public, anon, authenticated;
revoke all on function public.require_role(text[]) from public, anon, authenticated;
revoke all on function public.can_manage_class(uuid) from public, anon, authenticated;
revoke all on function public.user_streak(uuid) from public, anon, authenticated;
revoke all on function public.ensure_league(uuid) from public, anon, authenticated;
revoke all on function public.make_class_code() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- ================= Жеке хабарламалар және «Өзім туралы» (supabase/patch-messages.sql) =================

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
create or replace function public.broadcast(body_in text, audience text) returns int
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); b text := btrim(coalesce(body_in, '')); n int;
begin
  if not exists (select 1 from public.profiles where id = me and role = 'owner' and status = 'active') then raise exception 'forbidden'; end if;
  if length(b) < 1 or length(b) > 900 then raise exception 'bad_message'; end if;
  if audience not in ('all', 'student', 'teacher') then raise exception 'bad_input'; end if;
  insert into public.messages (sender, recipient, body)
    select me, p.id, '📢 ' || b from public.profiles p
    where p.status = 'active' and p.id <> me and (audience = 'all' or p.role = audience);
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.broadcast(text, text) from public, anon;
grant execute on function public.broadcast(text, text) to authenticated;

-- ---------- Басқа адамның профилі (сыныптастар, мұғалім, әкімшілік көреді) ----------
create or replace function public.public_profile(uid uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); r text := public.active_role();
begin
  if r is null then raise exception 'not_active'; end if;
  if not (uid = me or r in ('owner', 'admin') or public.can_message(me, uid)) then raise exception 'forbidden'; end if;
  if not exists (select 1 from public.profiles where id = uid and status = 'active') then raise exception 'not_found'; end if;
  return jsonb_build_object(
    'profile', (select jsonb_build_object('id', id, 'full_name', full_name, 'role', role, 'bio', bio, 'grade', grade,
                                          'last_seen', last_seen, 'created_at', created_at)
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
revoke all on function public.public_profile(uuid) from public, anon;
grant execute on function public.public_profile(uuid) to authenticated;

-- ================= patch-sync-social.sql =================
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
