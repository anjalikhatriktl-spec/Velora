-- VELORA Supabase Schema for project: exxwklvtlltfhtrvzsgp
-- Run this SQL once in your Supabase Dashboard -> SQL Editor

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  city text not null,
  state text not null,
  postal_code text not null,
  notes text,
  payment_method text not null,
  subtotal integer not null check (subtotal >= 0),
  shipping_fee integer not null check (shipping_fee >= 0),
  total integer not null check (total >= 0),
  estimated_delivery text not null,
  status text not null default 'pending_confirmation',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  order_number text not null,
  product_id text not null,
  product_name text not null,
  volume text not null check (volume in ('30ml', '50ml', '100ml')),
  quantity integer not null check (quantity > 0 and quantity <= 10),
  unit_price integer not null check (unit_price >= 0),
  line_total integer not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_order_number on public.orders (order_number);
create index if not exists idx_orders_customer_email on public.orders (customer_email);
create index if not exists idx_order_items_order_id on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Allow backend inserts when using SUPABASE_ANON_KEY (service_role bypasses RLS automatically)
drop policy if exists "Allow checkout order inserts" on public.orders;
create policy "Allow checkout order inserts"
  on public.orders
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow checkout order readback" on public.orders;
create policy "Allow checkout order readback"
  on public.orders
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow checkout order item inserts" on public.order_items;
create policy "Allow checkout order item inserts"
  on public.order_items
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow checkout order item readback" on public.order_items;
create policy "Allow checkout order item readback"
  on public.order_items
  for select
  to anon, authenticated
  using (true);
