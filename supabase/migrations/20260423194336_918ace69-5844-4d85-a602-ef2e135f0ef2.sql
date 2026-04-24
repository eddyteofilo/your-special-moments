-- Roles enum + table
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Admins can view roles"
  on public.user_roles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Confirmacoes
create type public.rsvp_role as enum ('PADRINHO', 'MADRINHA');
create type public.rsvp_side as enum ('KAIO', 'DEBORA');
create type public.rsvp_status as enum ('aceito', 'recusado');

create table public.confirmacoes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text not null,
  acompanhante text,
  papel public.rsvp_role not null,
  lado public.rsvp_side not null,
  status public.rsvp_status not null,
  motivo text,
  criado_em timestamptz not null default now()
);

alter table public.confirmacoes enable row level security;

create policy "Anyone can submit RSVP"
  on public.confirmacoes for insert
  to anon, authenticated
  with check (true);

create policy "Admins can view all RSVPs"
  on public.confirmacoes for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete RSVPs"
  on public.confirmacoes for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create index idx_confirmacoes_criado_em on public.confirmacoes(criado_em desc);
create index idx_confirmacoes_status on public.confirmacoes(status);