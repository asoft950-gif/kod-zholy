-- Басқа адамның профилі және рейтингтегі id. Supabase SQL Editor-де бір рет іске қос.

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
