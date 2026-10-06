alter table public.income_payouts
  add column is_verified boolean not null default false,
  add column source_type text;

alter table public.income_payouts
  add constraint income_payouts_source_type_check
  check (source_type is null or source_type in ('manual', 'argyle', 'plaid'));
