create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique
);

create table public.gig_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  platform text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.income_payouts (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.gig_connections (id) on delete cascade,
  payout_date date not null,
  amount numeric not null,
  created_at timestamptz not null default now()
);

create index gig_connections_user_id_idx on public.gig_connections (user_id);
create index income_payouts_connection_date_idx on public.income_payouts (connection_id, payout_date desc);

alter table public.users enable row level security;
alter table public.gig_connections enable row level security;
alter table public.income_payouts enable row level security;

grant select, insert, update, delete on public.users to authenticated;
grant select, insert, update, delete on public.gig_connections to authenticated;
grant select on public.income_payouts to authenticated;
grant all on public.users, public.gig_connections, public.income_payouts to service_role;

create policy "Users can read their own profile"
  on public.users for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.users for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can read their own gig connections"
  on public.gig_connections for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own gig connections"
  on public.gig_connections for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own gig connections"
  on public.gig_connections for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own gig connections"
  on public.gig_connections for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can read payouts from their own connections"
  on public.income_payouts for select to authenticated
  using (
    exists (
      select 1
      from public.gig_connections gc
      where gc.id = income_payouts.connection_id
        and gc.user_id = (select auth.uid())
    )
  );
