-- ============================================
-- WK Presentes — Schema Supabase
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Limpa tudo se necessário
drop table if exists orders cascade;
drop table if exists customers cascade;
drop table if exists businesses cascade;
drop function if exists get_business_id();
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();

-- 1. BUSINESSES (empresas cadastradas)
create table businesses (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid references auth.users(id) on delete cascade not null,
  name               text not null default 'Meu Negócio',
  plan               text not null default 'trial' check (plan in ('trial', 'basic', 'pro')),
  evolution_instance text,
  created_at         timestamptz default now()
);

-- 2. CUSTOMERS (clientes da empresa)
create table customers (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid references businesses(id) on delete cascade not null,
  name         text not null,
  phone        text,
  instagram    text,
  email        text,
  notes        text,
  total_orders integer default 0,
  total_spent  numeric(10,2) default 0,
  created_at   timestamptz default now()
);

-- 3. ORDERS (pedidos)
create table orders (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid references businesses(id) on delete cascade not null,
  customer_id     uuid references customers(id) on delete set null,
  customer_name   text not null,
  customer_phone  text,
  source          text default 'whatsapp' check (source in ('whatsapp','instagram','presencial','outro')),
  status          text default 'novo' check (status in ('novo','criando_arte','aguardando_aprovacao','aprovado','em_producao','pronto','entregue','cancelado')),
  items           jsonb default '[]'::jsonb,
  total_value     numeric(10,2) default 0,
  cost            numeric(10,2) default 0,
  notes           text,
  deadline        date,
  art_url         text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Helper: pega business_id do usuário logado
create or replace function get_business_id()
returns uuid language sql stable security definer as $$
  select id from businesses where owner_id = auth.uid() limit 1;
$$;

-- Trigger: cria business automaticamente no cadastro
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into businesses (owner_id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'business_name', 'Meu Negócio')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- RLS (Row Level Security)
alter table businesses enable row level security;
alter table customers  enable row level security;
alter table orders     enable row level security;

-- Políticas de segurança multi-tenant
create policy "businesses: acesso próprio"
  on businesses for all using (owner_id = auth.uid());

create policy "customers: acesso via business"
  on customers for all using (business_id = get_business_id());

create policy "orders: acesso via business"
  on orders for all using (business_id = get_business_id());
