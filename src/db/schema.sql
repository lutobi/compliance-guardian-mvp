-- Enable RLS
alter table auth.users enable row level security;

-- Create tables
create table workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null check (type in ('system', 'customer')),
  context jsonb not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table roles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  capabilities jsonb not null,
  context jsonb not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table users (
  id uuid primary key references auth.users(id),
  email text not null unique,
  name text,
  role_id uuid references roles(id) not null,
  workspace_id uuid references workspaces(id) not null,
  metadata jsonb not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table customers (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) not null,
  name text not null,
  industry text,
  settings jsonb not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table features (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  enabled boolean not null default true,
  conditions jsonb not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index users_workspace_id_idx on users(workspace_id);
create index users_role_id_idx on users(role_id);
create index customers_workspace_id_idx on customers(workspace_id);

-- Create RLS policies
create policy "Users can view their own data"
  on users for select
  using (auth.uid() = id);

create policy "System users can view all users"
  on users for select
  using (exists (
    select 1 from users
    where id = auth.uid()
    and role_id in (
      select id from roles
      where capabilities->>'type' = 'system'
    )
  ));

create policy "Customer admins can view their workspace users"
  on users for select
  using (
    workspace_id in (
      select workspace_id from users
      where id = auth.uid()
      and role_id in (
        select id from roles
        where capabilities->>'type' = 'customer'
        and capabilities->'access' ? 'admin'
      )
    )
  );

-- Create functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role_id, workspace_id)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    (select id from roles where name = 'customer_user' limit 1),
    (select id from workspaces where type = 'customer' limit 1)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
