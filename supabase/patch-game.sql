-- Ойынды сыныппен байланыстыру: ойын жұлдыздары бұлтқа ('game' курсы ретінде) түседі, мұғалім ойын деңгейін тапсырма ретінде бере алады,
-- сынып рейтингінде 🎮 жұлдыздары бөлек көрсетіледі. Supabase SQL Editor-де бір рет іске қос.

-- 1. Ойын деңгейлері каталогқа қосылады (жұлдыз қорғанысы тек каталогтағы деңгейлерді қабылдайды)
insert into public.level_catalog (course_id, level_id)
select 'game', x from unnest(array['g1','g2','g3','g4','g5','g6','g7','g8','g9','h1','h2','h3','h4','h5','h6','f1','f2','f3']) as x
on conflict do nothing;

-- 2. Мұғалім ойын деңгейін де бере алады
alter table public.class_levels drop constraint if exists class_levels_course_check;
alter table public.class_levels add constraint class_levels_course_check check (course in ('python', 'javascript', 'html', 'css', 'game'));

create or replace function public.assign_level(cid uuid, course_in text, level_in text, due_in date) returns jsonb
language plpgsql security definer set search_path = public as $$
declare x public.class_levels;
begin
  if not public.can_manage_class(cid) then raise exception 'forbidden'; end if;
  if course_in not in ('python', 'javascript', 'html', 'css', 'game') or length(coalesce(level_in, '')) not between 1 and 12 then
    raise exception 'bad_input';
  end if;
  insert into public.class_levels (class_id, teacher_id, course, level_id, due)
  values (cid, auth.uid(), course_in, level_in, due_in)
  on conflict (class_id, course, level_id) do update set due = excluded.due
  returning * into x;
  return jsonb_build_object('id', x.id);
end $$;

create or replace function public.class_overview(cid uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not public.can_manage_class(cid) then raise exception 'forbidden'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
      'id', p.id, 'full_name', p.full_name, 'email', p.email, 'last_seen', p.last_seen,
      'stars', coalesce((select sum(stars) from public.progress where user_id = p.id and course_id <> 'game'), 0),
      'game', coalesce((select sum(stars) from public.progress where user_id = p.id and course_id = 'game'), 0),
      'courses', coalesce((select jsonb_object_agg(course_id, jsonb_build_object('done', done, 'stars', st))
          from (select course_id, count(*) filter (where stars > 0) as done, sum(stars) as st
                from public.progress where user_id = p.id and course_id <> 'game' group by course_id) x), '{}'::jsonb)
    ) order by p.full_name)
    from public.class_members m join public.profiles p on p.id = m.student_id where m.class_id = cid), '[]'::jsonb);
end $$;

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
      where m.class_id = cid and g.stars > 0 and g.course_id <> 'game'), '[]'::jsonb));
end $$;

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
                          from public.progress where user_id = sid and course_id <> 'game'), '[]'::jsonb),
    'game', coalesce((select sum(stars) from public.progress where user_id = sid and course_id = 'game'), 0),
    'read', coalesce((select jsonb_agg(jsonb_build_object('c', course_id, 'l', lecture_id))
                      from public.lectures_read where user_id = sid), '[]'::jsonb),
    'days', coalesce((select jsonb_agg(jsonb_build_object('d', day, 'y', case when daily then 1 else 0 end))
                      from public.activity_days where user_id = sid), '[]'::jsonb),
    'hero', (select hero from public.profiles where id = sid),
    'role', (select role from public.profiles where id = sid),
    'created_at', (select created_at from public.profiles where id = sid));
end $$;

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
    where m.class_id = cid and g.stars > 0 and g.course_id <> 'game' and g.updated_at >= (w - 7) and g.updated_at < w
    group by m.student_id) q
  where rk <= 3
  on conflict do nothing;
end $$;

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
      'stars', coalesce((select sum(g.stars) from public.progress g where g.user_id = p.id and g.course_id <> 'game'), 0)::int,
      'game', coalesce((select sum(g.stars) from public.progress g where g.user_id = p.id and g.course_id = 'game'), 0)::int,
      'streak', public.user_streak(p.id),
      'hero', p.hero,
      'lg', (select l.rank from public.league_weeks l where l.class_id = cid and l.week = w and l.user_id = p.id),
      'week', coalesce((select sum(g.stars) from public.progress g where g.user_id = p.id and g.course_id <> 'game' and g.updated_at >= w), 0)::int) as x
    from public.class_members m join public.profiles p on p.id = m.student_id where m.class_id = cid) q), '[]'::jsonb));
end $$;

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
                          from public.progress where user_id = uid and course_id <> 'game'), '[]'::jsonb),
    'game', coalesce((select sum(stars) from public.progress where user_id = uid and course_id = 'game'), 0),
    'read', coalesce((select jsonb_agg(jsonb_build_object('c', course_id, 'l', lecture_id))
                      from public.lectures_read where user_id = uid), '[]'::jsonb),
    'days', coalesce((select jsonb_agg(jsonb_build_object('d', day, 'y', case when daily then 1 else 0 end))
                      from public.activity_days where user_id = uid), '[]'::jsonb),
    'classes', coalesce((select jsonb_agg(c.name) from public.classes c
                         where c.teacher_id = uid or exists (select 1 from public.class_members m where m.class_id = c.id and m.student_id = uid)), '[]'::jsonb));
end $$;

do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname in ('assign_level', 'class_overview', 'class_stats', 'student_progress', 'class_rating', 'public_profile')
  loop
    execute format('revoke all on function %s from public, anon', f.sig);
    execute format('grant execute on function %s to authenticated', f.sig);
  end loop;
end $$;
