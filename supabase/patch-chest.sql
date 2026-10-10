-- Бір рет Supabase SQL Editor-де іске қос (schema.sql ішінде де бар)
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

