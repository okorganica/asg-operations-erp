-- ASG Operations ERP initial Supabase schema
-- Apply in Supabase SQL Editor after creating a project.
-- Important: validate access policies with real user accounts before production.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'employee' check (role in ('ceo','admin','sales','project_manager','engineer','procurement','finance','hr','service_desk','auditor','employee')),
  branch text default 'Lahore',
  created_at timestamptz not null default now()
);

create or replace function public.is_admin_or_ceo()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin','ceo')
  );
$$;

create table if not exists public.crm_leads (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 contact_name text,
 email text,
 phone text,
 city text,
 product_interest text,
 estimated_value numeric(14,2) default 0 check (estimated_value >= 0),
 status text not null default 'New',
 next_follow_up date,
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.sales_quotes (
 id uuid primary key default gen_random_uuid(),
 quote_number text not null unique,
 customer_name text not null,
 title text not null,
 amount numeric(14,2) not null check (amount >= 0),
 tax_percent numeric(5,2) default 0 check (tax_percent >= 0 and tax_percent <= 100),
 valid_until date,
 status text not null default 'Draft',
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.projects (
 id uuid primary key default gen_random_uuid(),
 project_code text not null unique,
 name text not null,
 customer_name text not null,
 city text,
 project_manager text,
 budget numeric(14,2) default 0 check (budget >= 0),
 start_date date,
 due_date date,
 status text not null default 'Planning',
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
 id uuid primary key default gen_random_uuid(),
 sku text not null unique,
 name text not null,
 category text,
 warehouse text,
 quantity numeric(14,2) not null default 0 check (quantity >= 0),
 reorder_level numeric(14,2) default 0 check (reorder_level >= 0),
 unit_cost numeric(14,2) default 0 check (unit_cost >= 0),
 serial_tracking text default 'No',
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.purchase_orders (
 id uuid primary key default gen_random_uuid(),
 po_number text not null unique,
 vendor_name text not null,
 description text not null,
 amount numeric(14,2) not null check (amount >= 0),
 requested_by text,
 expected_date date,
 status text not null default 'Draft',
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.finance_invoices (
 id uuid primary key default gen_random_uuid(),
 invoice_number text not null unique,
 customer_name text not null,
 invoice_type text not null check (invoice_type in ('Receivable','Payable','Expense')),
 amount numeric(14,2) not null check (amount >= 0),
 due_date date,
 status text not null default 'Unpaid',
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.service_tickets (
 id uuid primary key default gen_random_uuid(),
 ticket_number text not null unique,
 customer_name text not null,
 site text,
 issue text not null,
 priority text not null default 'Normal',
 assigned_to text,
 due_at date,
 status text not null default 'Open',
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.employees (
 id uuid primary key default gen_random_uuid(),
 employee_code text not null unique,
 full_name text not null,
 department text,
 job_title text,
 email text,
 phone text,
 branch text,
 employment_status text not null default 'Active',
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
 id uuid primary key default gen_random_uuid(),
 actor_id uuid references auth.users(id),
 action text not null,
 table_name text not null,
 record_id text,
 details jsonb default '{}'::jsonb,
 created_at timestamptz not null default now()
);

-- Enable RLS on all business tables. Authenticated users may read operational data;
-- only admins/CEO may delete records. Adjust write policies to fit formal approval flows.
do $$
declare t text;
begin
 foreach t in array array['profiles','crm_leads','sales_quotes','projects','inventory_items','purchase_orders','finance_invoices','service_tickets','employees','audit_logs']
 loop
   execute format('alter table public.%I enable row level security', t);
 end loop;
end $$;

drop policy if exists "profiles read authenticated" on public.profiles;
create policy "profiles read authenticated" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin_or_ceo());
drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update" on public.profiles for update to authenticated using (public.is_admin_or_ceo()) with check (public.is_admin_or_ceo());

do $$
declare t text;
begin
 foreach t in array array['crm_leads','sales_quotes','projects','inventory_items','purchase_orders','finance_invoices','service_tickets','employees']
 loop
   execute format('drop policy if exists %I on public.%I', t || '_read_authenticated', t);
   execute format('create policy %I on public.%I for select to authenticated using (true)', t || '_read_authenticated', t);
   execute format('drop policy if exists %I on public.%I', t || '_insert_authenticated', t);
   execute format('create policy %I on public.%I for insert to authenticated with check (auth.uid() is not null)', t || '_insert_authenticated', t);
   execute format('drop policy if exists %I on public.%I', t || '_update_authenticated', t);
   execute format('create policy %I on public.%I for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null)', t || '_update_authenticated', t);
   execute format('drop policy if exists %I on public.%I', t || '_delete_admin', t);
   execute format('create policy %I on public.%I for delete to authenticated using (public.is_admin_or_ceo())', t || '_delete_admin', t);
 end loop;
end $$;

drop policy if exists "audit read admin" on public.audit_logs;
create policy "audit read admin" on public.audit_logs for select to authenticated using (public.is_admin_or_ceo());
drop policy if exists "audit insert authenticated" on public.audit_logs;
create policy "audit insert authenticated" on public.audit_logs for insert to authenticated with check (auth.uid() is not null);

-- Automatically create a basic profile when a new auth user is registered.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
 insert into public.profiles (id, full_name, role)
 values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), 'employee')
 on conflict (id) do nothing;
 return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- NOTE: This is a starter security baseline, not a final role-specific permission matrix.
-- Finance/HR/project-level data segregation and approval policies should be hardened before live use.
