-- ============================================================
-- PDCA schema
-- ============================================================
create extension if not exists "pgcrypto";

-- ---------- profiles ----------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null,
  email        text not null unique,
  role         text not null default 'user',
  department   text,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------- pdca ----------
create table if not exists public.pdca (
  id                 uuid primary key default gen_random_uuid(),
  reference          text not null unique,
  subject            text not null,
  description        text,
  line               text not null,
  line_other         text,
  defect_type        text,
  defect_type_other  text,
  priority           text not null check (priority in ('LOW','MEDIUM','HIGH')),
  department         text,
  status             text not null default 'OPEN'
                       check (status in ('OPEN','IN_PROGRESS','COMPLETED','CANCELLED','OVERDUE')),
  created_by         uuid references public.profiles(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------- pdca_actions ----------
create table if not exists public.pdca_actions (
  id             uuid primary key default gen_random_uuid(),
  pdca_id        uuid not null references public.pdca(id) on delete cascade,
  action         text not null,
  pilot_id       uuid references public.profiles(id) on delete set null,
  pilot_name     text not null,
  opening_date   date not null default current_date,
  due_date       date,
  phase          text not null default 'P' check (phase in ('P','D','C','A')),
  progress       int  not null default 25 check (progress in (25,50,75,100)),
  status         text not null default 'OPEN'
                   check (status in ('OPEN','IN_PROGRESS','COMPLETED','CANCELLED','OVERDUE')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  completed_at   timestamptz
);

-- ---------- pdca_history ----------
create table if not exists public.pdca_history (
  id          uuid primary key default gen_random_uuid(),
  pdca_id     uuid references public.pdca(id) on delete cascade,
  action_id   uuid references public.pdca_actions(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete set null,
  event_type  text not null,
  old_value   text,
  new_value   text,
  created_at  timestamptz not null default now()
);

-- ---------- lessons_learned ----------
create table if not exists public.lessons_learned (
  id           uuid primary key default gen_random_uuid(),
  pdca_id      uuid references public.pdca(id) on delete set null,
  title        text not null,
  description  text,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ---------- factory_tours ----------
create table if not exists public.factory_tours (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  location        text,
  description     text,
  responsible_id  uuid references public.profiles(id) on delete set null,
  tour_date       date,
  status          text not null default 'PLANNED',
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);

-- ---------- indexes ----------
create index if not exists idx_pdca_department  on public.pdca(department);
create index if not exists idx_pdca_status      on public.pdca(status);
create index if not exists idx_pdca_priority    on public.pdca(priority);
create index if not exists idx_pdca_created_at  on public.pdca(created_at desc);
create index if not exists idx_action_pdca      on public.pdca_actions(pdca_id);
create index if not exists idx_action_status    on public.pdca_actions(status);
create index if not exists idx_action_due       on public.pdca_actions(due_date);
create index if not exists idx_history_pdca     on public.pdca_history(pdca_id, created_at desc);

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_pdca_updated on public.pdca;
create trigger trg_pdca_updated before update on public.pdca
for each row execute function public.set_updated_at();

drop trigger if exists trg_actions_updated on public.pdca_actions;
create trigger trg_actions_updated before update on public.pdca_actions
for each row execute function public.set_updated_at();

-- ---------- auto-create profile on signup ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------- RLS ----------
alter table public.profiles         enable row level security;
alter table public.pdca             enable row level security;
alter table public.pdca_actions     enable row level security;
alter table public.pdca_history     enable row level security;
alter table public.lessons_learned  enable row level security;
alter table public.factory_tours    enable row level security;

-- profiles: read all, update own
drop policy if exists "profiles_read" on public.profiles;
create policy "profiles_read" on public.profiles for select using (true);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
for update using (auth.uid() = id);

-- pdca: any authenticated user can read; create/update by authenticated
drop policy if exists "pdca_read" on public.pdca;
create policy "pdca_read" on public.pdca for select using (auth.role() = 'authenticated');

drop policy if exists "pdca_insert" on public.pdca;
create policy "pdca_insert" on public.pdca for insert
with check (auth.role() = 'authenticated');

drop policy if exists "pdca_update" on public.pdca;
create policy "pdca_update" on public.pdca for update
using (auth.role() = 'authenticated');

-- pdca_actions
drop policy if exists "actions_read" on public.pdca_actions;
create policy "actions_read" on public.pdca_actions for select using (auth.role() = 'authenticated');

drop policy if exists "actions_insert" on public.pdca_actions;
create policy "actions_insert" on public.pdca_actions for insert with check (auth.role() = 'authenticated');

drop policy if exists "actions_update" on public.pdca_actions;
create policy "actions_update" on public.pdca_actions for update using (auth.role() = 'authenticated');

-- pdca_history
drop policy if exists "history_read" on public.pdca_history;
create policy "history_read" on public.pdca_history for select using (auth.role() = 'authenticated');

drop policy if exists "history_insert" on public.pdca_history;
create policy "history_insert" on public.pdca_history for insert with check (auth.role() = 'authenticated');

-- lessons_learned
drop policy if exists "ll_all" on public.lessons_learned;
create policy "ll_all" on public.lessons_learned for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

-- factory_tours
drop policy if exists "ft_all" on public.factory_tours;
create policy "ft_all" on public.factory_tours for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
