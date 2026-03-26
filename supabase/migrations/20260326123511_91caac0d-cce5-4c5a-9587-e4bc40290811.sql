
-- Event-type specific availability rules
create table public.event_type_availability (
  id uuid primary key default gen_random_uuid(),
  event_type_id uuid references public.event_types(id) on delete cascade not null,
  type text not null check (type in ('recurring', 'date_range')),
  day_of_week integer,
  start_time text,
  end_time text,
  date_start date,
  date_end date,
  created_at timestamptz default now()
);

alter table public.event_type_availability enable row level security;

create policy "Public can view event type availability"
  on public.event_type_availability for select
  to anon, authenticated
  using (true);

create policy "Admins manage event type availability"
  on public.event_type_availability for all
  to authenticated
  using (is_admin())
  with check (is_admin());
