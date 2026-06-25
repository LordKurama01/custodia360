create extension if not exists pgcrypto;

do $$ begin
  create type public.internal_role as enum ('owner', 'admin', 'operator', 'collector', 'viewer');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.logistics_status as enum ('para_retirar', 'retirado', 'cd', 'deposito_a', 'deposito_b', 'despachado');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.financial_status as enum ('pendiente', 'pago_parcial', 'pago_total');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_method as enum ('efectivo_pesos', 'efectivo_dolares', 'transferencia_1', 'transferencia_2');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.currency as enum ('ARS', 'USD');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.guide_paid_by as enum ('jeremias', 'cliente', 'pendiente');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.guide_payment_status as enum (
    'pendiente',
    'pagada_por_jeremias',
    'pagada_por_cliente',
    'pendiente_reintegro',
    'reintegrada'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role public.internal_role not null default 'viewer',
  active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  default_price_per_package numeric(14,2) default 0,
  notes text,
  private_code text unique not null default ('CLI-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 14))),
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.operations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  serial_number bigserial,
  operation_date date not null default current_date,
  provider_name text not null,
  package_count integer not null default 1 check (package_count > 0),
  price_per_package numeric(14,2) not null default 0,
  total_packages_amount numeric(14,2) generated always as (package_count * price_per_package) stored,
  logistics_status public.logistics_status not null default 'para_retirar',
  financial_status public.financial_status not null default 'pendiente',
  note text,
  pass_amount numeric(14,2) default 0,
  total_amount numeric(14,2) default 0,
  paid_amount_ars numeric(14,2) default 0,
  paid_amount_usd numeric(14,2) default 0,
  balance_amount numeric(14,2) default 0,
  visible_to_client boolean default true,
  public_code text unique not null default ('OP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 14))),
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.operation_shipments (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid not null references public.operations(id) on delete cascade,
  company text,
  guide_number text,
  guide_amount numeric(14,2) default 0,
  guide_paid_by public.guide_paid_by default 'pendiente',
  guide_payment_status public.guide_payment_status default 'pendiente',
  guide_payment_method public.payment_method,
  guide_payment_currency public.currency,
  guide_paid_amount numeric(14,2) default 0,
  recipient_name text,
  recipient_identity_number text,
  destination_detail text,
  guide_cost_amount numeric(14,2) default 0,
  guide_surcharge_percent numeric(6,2) default 0,
  guide_charge_amount numeric(14,2) default 0,
  pass_usd_amount numeric(14,2) default 0,
  pass_date date,
  pass_note text,
  dispatch_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.operation_payments (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid not null references public.operations(id) on delete cascade,
  concept text not null,
  method public.payment_method not null,
  currency public.currency not null,
  amount numeric(14,2) not null check (amount > 0),
  paid_at timestamptz default now(),
  note text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid not null references public.operations(id) on delete cascade,
  file_url text not null,
  file_name text,
  file_type text,
  visible_to_client boolean default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz default now()
);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  updated_at timestamptz default now()
);

create index if not exists idx_clients_private_code on public.clients(private_code);
create index if not exists idx_operations_public_code on public.operations(public_code);
create index if not exists idx_operations_client_id on public.operations(client_id);
create index if not exists idx_operations_statuses on public.operations(logistics_status, financial_status);
create index if not exists idx_operation_shipments_operation_id on public.operation_shipments(operation_id);
create index if not exists idx_operation_payments_operation_id on public.operation_payments(operation_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_clients_updated_at on public.clients;
create trigger trg_clients_updated_at before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists trg_operations_updated_at on public.operations;
create trigger trg_operations_updated_at before update on public.operations
for each row execute function public.set_updated_at();

drop trigger if exists trg_operation_shipments_updated_at on public.operation_shipments;
create trigger trg_operation_shipments_updated_at before update on public.operation_shipments
for each row execute function public.set_updated_at();

drop trigger if exists trg_app_settings_updated_at on public.app_settings;
create trigger trg_app_settings_updated_at before update on public.app_settings
for each row execute function public.set_updated_at();

create or replace function public.current_internal_role()
returns public.internal_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
    and p.active = true
  limit 1
$$;

create or replace function public.is_internal_active()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
  )
$$;

create or replace function public.can_edit_operations()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_internal_role() in ('owner', 'admin', 'operator')
$$;

create or replace function public.can_create_payments()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_internal_role() in ('owner', 'admin', 'collector')
$$;

create or replace function public.recalculate_operation_financials(target_operation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  guide_total numeric(14,2);
  paid_ars numeric(14,2);
  paid_usd numeric(14,2);
  total_due numeric(14,2);
begin
  select coalesce(sum(
    case
      when s.guide_payment_status = 'pagada_por_cliente' then 0
      else coalesce(nullif(s.guide_charge_amount, 0), s.guide_amount, 0)
    end
  ), 0)
  into guide_total
  from public.operation_shipments s
  where s.operation_id = target_operation_id;

  select
    coalesce(sum(case when p.currency = 'ARS' then p.amount else 0 end), 0),
    coalesce(sum(case when p.currency = 'USD' then p.amount else 0 end), 0)
  into paid_ars, paid_usd
  from public.operation_payments p
  where p.operation_id = target_operation_id;

  select coalesce(o.total_packages_amount, 0) + (coalesce(o.pass_amount, 0) * 1500) + guide_total
  into total_due
  from public.operations o
  where o.id = target_operation_id;

  update public.operations
  set
    total_amount = coalesce(total_due, 0),
    paid_amount_ars = paid_ars,
    paid_amount_usd = paid_usd,
    balance_amount = greatest(coalesce(total_due, 0) - paid_ars, 0),
    financial_status = case
      when paid_ars <= 0 and paid_usd <= 0 then 'pendiente'::public.financial_status
      when paid_ars >= coalesce(total_due, 0) then 'pago_total'::public.financial_status
      else 'pago_parcial'::public.financial_status
    end,
    updated_at = now()
  where id = target_operation_id;
end;
$$;

create or replace function public.recalculate_operation_financials_trigger()
returns trigger
language plpgsql
as $$
begin
  perform public.recalculate_operation_financials(coalesce(new.operation_id, old.operation_id));
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_shipments_recalculate on public.operation_shipments;
create trigger trg_shipments_recalculate after insert or update or delete on public.operation_shipments
for each row execute function public.recalculate_operation_financials_trigger();

drop trigger if exists trg_payments_recalculate on public.operation_payments;
create trigger trg_payments_recalculate after insert or update or delete on public.operation_payments
for each row execute function public.recalculate_operation_financials_trigger();

create or replace function public.recalculate_operation_after_operation_change()
returns trigger
language plpgsql
as $$
begin
  perform public.recalculate_operation_financials(new.id);
  return new;
end;
$$;

drop trigger if exists trg_operations_recalculate on public.operations;
create trigger trg_operations_recalculate after insert or update of package_count, price_per_package, pass_amount on public.operations
for each row execute function public.recalculate_operation_after_operation_change();

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.operations enable row level security;
alter table public.operation_shipments enable row level security;
alter table public.operation_payments enable row level security;
alter table public.attachments enable row level security;
alter table public.audit_logs enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select using (auth.uid() = id);

drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin on public.profiles
for select using (public.current_internal_role() in ('owner', 'admin'));

drop policy if exists profiles_write_admin on public.profiles;
create policy profiles_write_admin on public.profiles
for all using (public.current_internal_role() in ('owner', 'admin'))
with check (public.current_internal_role() in ('owner', 'admin'));

drop policy if exists clients_select_internal on public.clients;
create policy clients_select_internal on public.clients
for select using (public.is_internal_active());

drop policy if exists clients_write_operations on public.clients;
create policy clients_write_operations on public.clients
for all using (public.can_edit_operations())
with check (public.can_edit_operations());

drop policy if exists operations_select_internal on public.operations;
create policy operations_select_internal on public.operations
for select using (public.is_internal_active());

drop policy if exists operations_insert_editors on public.operations;
create policy operations_insert_editors on public.operations
for insert with check (public.can_edit_operations());

drop policy if exists operations_update_editors on public.operations;
create policy operations_update_editors on public.operations
for update using (public.can_edit_operations())
with check (public.can_edit_operations());

drop policy if exists shipments_select_internal on public.operation_shipments;
create policy shipments_select_internal on public.operation_shipments
for select using (public.is_internal_active());

drop policy if exists shipments_write_editors on public.operation_shipments;
create policy shipments_write_editors on public.operation_shipments
for all using (public.can_edit_operations())
with check (public.can_edit_operations());

drop policy if exists payments_select_internal on public.operation_payments;
create policy payments_select_internal on public.operation_payments
for select using (public.is_internal_active());

drop policy if exists payments_insert_collectors on public.operation_payments;
create policy payments_insert_collectors on public.operation_payments
for insert with check (public.can_create_payments());

drop policy if exists payments_update_collectors on public.operation_payments;
create policy payments_update_collectors on public.operation_payments
for update using (public.can_create_payments())
with check (public.can_create_payments());

drop policy if exists attachments_select_internal on public.attachments;
create policy attachments_select_internal on public.attachments
for select using (public.is_internal_active());

drop policy if exists attachments_write_editors on public.attachments;
create policy attachments_write_editors on public.attachments
for all using (public.can_edit_operations())
with check (public.can_edit_operations());

drop policy if exists audit_select_admin on public.audit_logs;
create policy audit_select_admin on public.audit_logs
for select using (public.current_internal_role() in ('owner', 'admin'));

drop policy if exists audit_insert_internal on public.audit_logs;
create policy audit_insert_internal on public.audit_logs
for insert with check (public.is_internal_active());

drop policy if exists settings_select_admin on public.app_settings;
create policy settings_select_admin on public.app_settings
for select using (public.current_internal_role() in ('owner', 'admin'));

drop policy if exists settings_write_admin on public.app_settings;
create policy settings_write_admin on public.app_settings
for all using (public.current_internal_role() in ('owner', 'admin'))
with check (public.current_internal_role() in ('owner', 'admin'));

create or replace function public.get_client_portal_data(code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  with selected_client as (
    select c.*
    from public.clients c
    where c.active = true
      and (
        c.private_code = code
        or exists (
          select 1
          from public.operations op
          where op.client_id = c.id
            and op.public_code = code
            and op.visible_to_client = true
        )
      )
    limit 1
  ),
  visible_operations as (
    select o.*
    from public.operations o
    join selected_client c on c.id = o.client_id
    where o.visible_to_client = true
      and (c.private_code = code or o.public_code = code)
  )
  select jsonb_build_object(
    'client', jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'phone', c.phone,
      'notes', c.notes
    ),
    'operations', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', o.id,
          'public_code', o.public_code,
          'operation_date', o.operation_date,
          'provider_name', o.provider_name,
          'package_count', o.package_count,
          'logistics_status', o.logistics_status,
          'financial_status', o.financial_status,
          'note', o.note,
          'pass_amount', o.pass_amount,
          'total_amount', o.total_amount,
          'paid_amount_ars', o.paid_amount_ars,
          'paid_amount_usd', o.paid_amount_usd,
          'balance_amount', o.balance_amount,
          'shipments', coalesce((
            select jsonb_agg(jsonb_build_object(
              'company', s.company,
              'guide_number', s.guide_number,
              'guide_amount', s.guide_amount,
              'guide_paid_by', s.guide_paid_by,
              'guide_payment_status', s.guide_payment_status,
              'guide_payment_method', s.guide_payment_method,
              'guide_payment_currency', s.guide_payment_currency,
              'guide_paid_amount', s.guide_paid_amount,
              'recipient_name', s.recipient_name,
              'recipient_identity_number', s.recipient_identity_number,
              'destination_detail', s.destination_detail,
              'guide_cost_amount', s.guide_cost_amount,
              'guide_surcharge_percent', s.guide_surcharge_percent,
              'guide_charge_amount', s.guide_charge_amount,
              'dispatch_date', s.dispatch_date
            ))
            from public.operation_shipments s
            where s.operation_id = o.id
          ), '[]'::jsonb),
          'payments', coalesce((
            select jsonb_agg(jsonb_build_object(
              'concept', p.concept,
              'method', p.method,
              'currency', p.currency,
              'amount', p.amount,
              'paid_at', p.paid_at,
              'note', p.note
            ) order by p.paid_at desc)
            from public.operation_payments p
            where p.operation_id = o.id
          ), '[]'::jsonb)
        )
        order by o.operation_date desc, o.created_at desc
      )
      from visible_operations o
    ), '[]'::jsonb)
  )
  into result
  from selected_client c;

  return result;
end;
$$;

grant execute on function public.get_client_portal_data(text) to anon, authenticated;

insert into public.app_settings(key, value)
values ('authorized_users', '[]'::jsonb)
on conflict (key) do nothing;
