create extension if not exists pgcrypto;

create table if not exists public.birth_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  birth_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists birth_profiles_birth_date_idx
  on public.birth_profiles (birth_date);

create index if not exists birth_profiles_created_at_idx
  on public.birth_profiles (created_at desc);

alter table public.birth_profiles enable row level security;

comment on table public.birth_profiles is '챗봇에서 입력한 이름과 생년월일을 저장하는 테이블';
