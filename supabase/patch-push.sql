-- Push-ескертулер: жаңа хат, хабарландыру, достық сұрауы келгенде телефонға хабарлама шығады.
-- Supabase SQL Editor-де бір рет іске қос. Құпия кілт (__PUSH_SECRET__) Vercel-дегі PUSH_SECRET-пен бірдей болуы керек.
-- Хабарлама мәтіні жіберілмейді: тек «кімнен» және «жаңа хат» деген жазу.

create extension if not exists pg_net;

create table if not exists public.push_subs (
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, endpoint)
);
alter table public.push_subs enable row level security;
revoke all on public.push_subs from anon, authenticated;

insert into public.app_config (key, value) values ('push_secret', '__PUSH_SECRET__')
  on conflict (key) do update set value = excluded.value where public.app_config.value like '\_\_%';

create or replace function public.push_subscribe(sub jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare ep text := sub ->> 'endpoint'; k1 text := sub #>> '{keys,p256dh}'; k2 text := sub #>> '{keys,auth}';
begin
  if public.active_role() is null then raise exception 'not_active'; end if;
  if ep is null or ep !~ '^https://' or length(ep) > 600 or k1 is null or k2 is null or length(k1) > 200 or length(k2) > 100 then raise exception 'bad_input'; end if;
  insert into public.push_subs (user_id, endpoint, p256dh, auth) values (auth.uid(), ep, k1, k2)
    on conflict (user_id, endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth;
  -- бір пайдаланушыда ең көбі 5 құрылғы
  delete from public.push_subs where user_id = auth.uid() and endpoint in (
    select endpoint from public.push_subs where user_id = auth.uid() order by created_at desc offset 5);
end $$;

create or replace function public.push_unsubscribe(ep text) returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from public.push_subs where user_id = auth.uid() and endpoint = ep;
end $$;

-- Ішкі: бір адамға push жіберу (қате болса, хат жіберуді бұзбайды)
create or replace function public.push_notify(uid uuid, title text, body text, url text, tag text) returns void
language plpgsql security definer set search_path = public as $$
declare subs jsonb; sec text;
begin
  -- сайтты қазір ашып отырса (соңғы 45 секунд), push қажет емес
  if exists (select 1 from public.profiles where id = uid and last_seen > now() - interval '45 seconds') then return; end if;
  select jsonb_agg(jsonb_build_object('endpoint', endpoint, 'keys', jsonb_build_object('p256dh', p256dh, 'auth', auth)))
    into subs from public.push_subs where user_id = uid;
  if subs is null then return; end if;
  select value into sec from public.app_config where key = 'push_secret';
  if sec is null or sec like '\_\_%' then return; end if;
  perform net.http_post(
    url := 'https://bitlings-kz.vercel.app/api/push',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', sec),
    body := jsonb_build_object('subs', subs, 'title', title, 'body', body, 'url', url, 'tag', tag));
exception when others then
  null;
end $$;

create or replace function public.push_on_message() returns trigger
language plpgsql security definer set search_path = public as $$
declare nm text;
begin
  if left(new.body, 2) = '📢' then
    perform public.push_notify(new.recipient, '📢 Bitlings', 'Жаңа хабарландыру', '#/account/msg/' || new.sender, 'bc');
  else
    select full_name into nm from public.profiles where id = new.sender;
    perform public.push_notify(new.recipient, '💬 ' || coalesce(nm, 'Bitlings'), 'Саған жаңа хат жазды', '#/account/msg/' || new.sender, 'msg-' || new.sender);
  end if;
  return null;
end $$;
drop trigger if exists push_on_message on public.messages;
create trigger push_on_message after insert on public.messages for each row execute function public.push_on_message();

create or replace function public.push_on_friend() returns trigger
language plpgsql security definer set search_path = public as $$
declare nm text;
begin
  if tg_op = 'INSERT' then
    select full_name into nm from public.profiles where id = new.requester;
    perform public.push_notify(new.addressee, '👥 ' || coalesce(nm, 'Bitlings'), 'Достыққа шақырды', '#/account/friends', 'fr-' || new.requester);
  elsif new.status = 'accepted' and old.status <> 'accepted' then
    select full_name into nm from public.profiles where id = new.addressee;
    perform public.push_notify(new.requester, '✅ ' || coalesce(nm, 'Bitlings'), 'Достық сұрауыңды қабылдады', '#/account/friends', 'fr-' || new.addressee);
  end if;
  return null;
end $$;
drop trigger if exists push_on_friend on public.friendships;
create trigger push_on_friend after insert or update on public.friendships for each row execute function public.push_on_friend();

revoke all on function public.push_notify(uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function public.push_on_message() from public, anon, authenticated;
revoke all on function public.push_on_friend() from public, anon, authenticated;
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname in ('push_subscribe', 'push_unsubscribe')
  loop
    execute format('revoke all on function %s from public, anon', f.sig);
    execute format('grant execute on function %s to authenticated', f.sig);
  end loop;
end $$;
