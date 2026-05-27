-- Audits table
create table audits (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  tools jsonb not null,
  team_size integer not null,
  use_case text not null,
  recommendations jsonb not null,
  total_monthly_savings numeric not null default 0,
  total_annual_savings numeric not null default 0,
  summary text,
  is_public boolean default true
);

-- Leads table  
create table leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  audit_id uuid references audits(id),
  email text not null,
  company text,
  role text,
  team_size integer,
  savings_tier text,
  contacted boolean default false
);

-- Rate limiting table
create table rate_limits (
  id uuid default gen_random_uuid() primary key,
  ip_hash text not null,
  action text not null,
  created_at timestamptz default now()
);

-- Indexes
create index audits_created_at_idx on audits(created_at desc);
create index leads_audit_id_idx on leads(audit_id);
create index leads_email_idx on leads(email);
create index rate_limits_ip_hash_idx on rate_limits(ip_hash, action, created_at);

-- RLS policies (enable row level security)
alter table audits enable row level security;
alter table leads enable row level security;
alter table rate_limits enable row level security;

-- Allow public read of public audits
create policy "Public audits are viewable by everyone"
  on audits for select
  using (is_public = true);

-- Allow insert from anon
create policy "Anyone can create an audit"
  on audits for insert
  with check (true);

create policy "Anyone can update a public audit"
  on audits for update
  using (is_public = true)
  with check (is_public = true);

create policy "Anyone can create a lead"
  on leads for insert
  with check (true);

create policy "Anyone can create rate limit entry"
  on rate_limits for insert
  with check (true);

create policy "Anyone can read rate limits"
  on rate_limits for select
  using (true);
