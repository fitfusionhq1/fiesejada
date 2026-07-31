create extension if not exists pgcrypto;

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  group_code text not null unique check (group_code in ('A','B','C','D','E','F')),
  team_name text not null check (char_length(team_name) between 2 and 40),
  members text[] not null,
  current_step int not null default 0 check (current_step between 0 and 8),
  status text not null default 'active' check (status in ('active','finished')),
  recovery_code text not null default lpad((floor(random()*1000000))::text,6,'0'),
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table public.stations (
  id int primary key check (id between 1 and 7),
  title text not null, place text not null, story text not null,
  task text not null, success_condition text not null,
  main_hint text not null, extra_hint text not null,
  reference_image text, map_image text
);

create table public.routes (
  group_code text not null check (group_code in ('A','B','C','D','E','F')),
  step_number int not null check (step_number between 0 and 7),
  station_id int not null references public.stations(id),
  primary key(group_code,step_number)
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  station_id int not null references public.stations(id),
  photo_path text not null,
  is_final boolean not null default false,
  originality_score int check (originality_score between 0 and 5),
  task_score int check (task_score between 0 and 5),
  organiser_note text,
  submitted_at timestamptz not null default now()
);

create table public.penalties (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  type text not null check (type in ('extra_hint','wrong_qr_scan','manual')),
  station_id int references public.stations(id),
  points int not null check (points <= 0),
  created_at timestamptz not null default now(),
  unique(team_id,type,station_id)
);

create view public.team_overview
with (security_invoker = true) as
select t.*, coalesce(sum(p.points),0)::int as penalty_points,
       count(distinct s.id)::int as submission_count
from public.teams t
left join public.penalties p on p.team_id=t.id
left join public.submissions s on s.team_id=t.id
group by t.id;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('fieseya-photos','fieseya-photos',false,10485760,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;

alter table public.teams enable row level security;
alter table public.stations enable row level security;
alter table public.routes enable row level security;
alter table public.submissions enable row level security;
alter table public.penalties enable row level security;

create policy "public game content" on public.stations for select using(true);
create policy "public routes" on public.routes for select using(true);
create policy "team registration" on public.teams for insert with check(true);
create policy "team read by id" on public.teams for select using(true);
create policy "team progress update" on public.teams for update using(true) with check(true);
create policy "submission create" on public.submissions for insert with check(true);
create policy "submission read" on public.submissions for select using(true);
create policy "penalty create" on public.penalties for insert with check(true);
create policy "penalty read" on public.penalties for select using(true);
create policy "photo upload" on storage.objects for insert with check(bucket_id='fieseya-photos');
create policy "photo organiser read" on storage.objects for select using(bucket_id='fieseya-photos');

-- Za javno prireditev priporočamo, da zgornje široke politike pred objavo
-- zamenjate s strežniškimi funkcijami iz hardening.sql.
