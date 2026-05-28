-- Registro Curso de Milagros
-- Ejecuta este archivo en Supabase SQL Editor.

create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_checks (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  lesson_number integer not null check (lesson_number > 0),
  lesson_date date not null,
  completed boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint lesson_checks_participant_lesson_unique unique (
    participant_id,
    lesson_number
  )
);

create index if not exists lesson_checks_lesson_number_idx
  on public.lesson_checks (lesson_number);

create index if not exists lesson_checks_participant_id_idx
  on public.lesson_checks (participant_id);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_lesson_checks_updated_at on public.lesson_checks;

create trigger set_lesson_checks_updated_at
before update on public.lesson_checks
for each row
execute function private.set_updated_at();

alter table public.participants enable row level security;
alter table public.lesson_checks enable row level security;

drop policy if exists "Public can read active participants"
  on public.participants;

create policy "Public can read active participants"
on public.participants
for select
to anon, authenticated
using (active = true);

drop policy if exists "Public can read lesson checks"
  on public.lesson_checks;

create policy "Public can read lesson checks"
on public.lesson_checks
for select
to anon, authenticated
using (true);

drop policy if exists "Public can insert lesson checks"
  on public.lesson_checks;

create policy "Public can insert lesson checks"
on public.lesson_checks
for insert
to anon, authenticated
with check (true);

drop policy if exists "Public can update lesson checks"
  on public.lesson_checks;

create policy "Public can update lesson checks"
on public.lesson_checks
for update
to anon, authenticated
using (true)
with check (true);

grant usage on schema public to anon, authenticated;
grant select on public.participants to anon, authenticated;
grant select, insert, update on public.lesson_checks to anon, authenticated;

insert into public.participants (name, display_order, active)
values
  ('Adriana Rendon Jordan', 1, true),
  ('Alexandra Ortega', 2, true),
  ('Andrea Cicuania', 3, true),
  ('Blanca Cecilia Reyes', 4, true),
  ('Damaris GonzÃ¡lez', 5, true),
  ('Edison LÃ³pez', 6, true),
  ('Edna Baquero', 7, true),
  ('Edwin Ortega', 8, true),
  ('Gloria fernandez', 9, true),
  ('Isabel Rodriguez', 10, true),
  ('Jacqueline Ruiz', 11, true),
  ('Jessica Becerra', 12, true),
  ('Johana Ortega', 13, true),
  ('Juan Herrera', 14, true),
  ('Leidy Franco', 15, true),
  ('Luis Ortega', 16, true),
  ('Luz Patricia marin', 17, true),
  ('Marcela SÃ¡nchez', 18, true),
  ('Maria Salamanca', 19, true),
  ('Martha Fabiola Rojas', 20, true),
  ('Menchis', 21, true),
  ('MÃ­riam Sabogal', 22, true),
  ('Olga Yanent Cardenas', 23, true),
  ('Rosario Merry', 24, true),
  ('Saby', 25, true),
  ('Sandra Cuadrado', 26, true),
  ('Sebastian Lopez', 27, true),
  ('Tatiana LÃ³pez', 28, true),
  ('Valeria LÃ³pez', 29, true),
  ('Yised GonzÃ¡lez', 30, true)
on conflict (name) do update
set
  display_order = excluded.display_order,
  active = excluded.active;

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'participants'
    ) then
      alter publication supabase_realtime add table public.participants;
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'lesson_checks'
    ) then
      alter publication supabase_realtime add table public.lesson_checks;
    end if;
  end if;
end $$;

