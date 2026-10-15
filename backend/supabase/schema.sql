-- Run this entire file in Supabase Dashboard > SQL Editor > New query.
-- The backend uses SUPABASE_SERVICE_ROLE_KEY, which must remain server-side only.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 80),
  email text not null unique,
  password_hash text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  genre text[] not null default '{}',
  duration_minutes integer not null default 120,
  language text not null default 'English',
  rating numeric(3,1) not null default 0 check (rating between 0 and 10),
  poster_url text not null default '',
  release_date date,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.shows (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references public.movies(id) on delete cascade,
  cinema text not null,
  screen text not null default 'Screen 1',
  starts_at timestamptz not null,
  price numeric(10,2) not null check (price >= 0),
  total_seats integer not null default 60 check (total_seats > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  show_id uuid not null references public.shows(id) on delete cascade,
  seats text[] not null,
  total_amount numeric(10,2) not null check (total_amount >= 0),
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists shows_movie_starts_idx on public.shows(movie_id, starts_at);
create index if not exists bookings_user_created_idx on public.bookings(user_id, created_at desc);
create index if not exists bookings_show_status_idx on public.bookings(show_id, status);

-- Enable RLS as a defense-in-depth measure. The server uses service role, so enforce
-- user ownership in API handlers as well. Do not expose service-role credentials in the frontend.
alter table public.users enable row level security;
alter table public.movies enable row level security;
alter table public.shows enable row level security;
alter table public.bookings enable row level security;
