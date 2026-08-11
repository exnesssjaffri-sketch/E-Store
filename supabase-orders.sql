-- ========== E-STORE ORDERS TABLE ==========
-- Run this in Supabase Dashboard → SQL Editor

create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    full_name text not null,
    phone text not null,
    email text not null,
    address text not null,
    payment_method text not null,
    items jsonb not null default '[]'::jsonb,
    total_amount numeric not null default 0,
    status text not null default 'pending',
    created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.orders enable row level security;

-- Allow anonymous users to insert orders (needed for checkout)
create policy "Allow anonymous order insert"
    on public.orders
    for insert
    to anon
    with check (true);

-- Allow authenticated users to read their own orders
create policy "Allow authenticated users to read orders"
    on public.orders
    for select
    to authenticated
    using (true);

-- Allow authenticated users to update order status
create policy "Allow authenticated users to update orders"
    on public.orders
    for update
    to authenticated
    using (true);