-- Құрушының рассылкасы: барлық белсенді пайдаланушыға (не тек оқушыларға/мұғалімдерге) хабарлама. Supabase SQL Editor-де бір рет іске қос.
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
