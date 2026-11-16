-- VELORA Orders & Order Items Schema for Supabase (Project: exxwklvtlltfhtrvzsgp)
-- Run this migration in the Supabase SQL Editor for your project.

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  full_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  state text not null,
  postal_code text not null,
  notes text,
  payment_method text not null,
  subtotal integer not null check (subtotal >= 0),
  shipping_fee integer not null check (shipping_fee >= 0),
  total integer not null check (total >= 0),
  estimated_delivery text not null,
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  volume text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  line_total integer not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_order_number on public.orders (order_number);
create index if not exists idx_orders_created_at on public.orders (created_at desc);
create index if not exists idx_order_items_order_id on public.order_items (order_id);

-- Row Level Security: allow guest checkout inserts without exposing customer PII to public reads
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Allow public order creation" on public.orders;
create policy "Allow public order creation"
  on public.orders
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow public order item creation" on public.order_items;
create policy "Allow public order item creation"
  on public.order_items
  for insert
  to anon, authenticated
  with check (true);

grant usage on schema public to anon, authenticated;
grant insert on table public.orders to anon, authenticated;
grant insert on table public.order_items to anon, authenticated;
