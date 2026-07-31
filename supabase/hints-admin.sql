-- Varovana strežniška funkcija za urejanje namigov iz Fieseya Sites API-ja.
-- Hranjen je samo SHA-256 povzetek skrivnosti, ne njena vrednost.

create or replace function public.admin_update_station_hints(
  p_secret text,
  p_station_id int,
  p_main_hint text,
  p_extra_hint text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if encode(digest(p_secret, 'sha256'), 'hex')
     <> 'fcdd66f6914db0842275e7d0bb5abfd89ae652dd7a8cfd89ec77d6ef8d50b468' then
    raise exception 'unauthorized';
  end if;

  if p_station_id < 1 or p_station_id > 7
     or length(trim(p_main_hint)) = 0
     or length(trim(p_extra_hint)) = 0 then
    raise exception 'invalid hint data';
  end if;

  update public.stations
  set main_hint = trim(p_main_hint),
      extra_hint = trim(p_extra_hint)
  where id = p_station_id;

  if not found then
    raise exception 'station not found';
  end if;
end;
$$;

revoke all on function public.admin_update_station_hints(text, int, text, text) from public;
grant execute on function public.admin_update_station_hints(text, int, text, text) to anon;
