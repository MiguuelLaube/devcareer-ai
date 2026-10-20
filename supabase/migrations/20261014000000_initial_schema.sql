-- DevCareer AI — initial schema
-- Every user-owned row carries user_id and is protected by RLS (user_id = auth.uid()).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums (mirrored in packages/shared/src/enums.ts)
-- ---------------------------------------------------------------------------
create type public.declared_level as enum ('none', 'learning', 'basic', 'intermediate', 'advanced');
create type public.skill_state as enum (
  'unknown', 'learning', 'assessing',
  'basic_demonstrated', 'intermediate_demonstrated', 'advanced_demonstrated'
);
create type public.requirement_match as enum ('met', 'partial', 'developing', 'missing', 'not_evaluated');
create type public.requirement_kind as enum ('required', 'preferred');
create type public.task_status as enum ('not_started', 'in_progress', 'completed', 'needs_review');
create type public.application_status as enum (
  'interesting', 'preparing_resume', 'studying', 'ready',
  'applied', 'interview', 'approved', 'not_selected', 'closed'
);
create type public.adaptation_mode as enum ('immediate', 'preparation', 'post_training');
create type public.suggestion_status as enum ('pending', 'accepted', 'rejected', 'edited');
create type public.job_source as enum ('text', 'url', 'pdf');
create type public.project_status as enum ('suggested', 'in_progress', 'completed', 'abandoned');

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  education text not null default '',
  institution text not null default '',
  academic_period text not null default '',
  career_goal text not null default '',
  technologies jsonb not null default '[]'::jsonb,
  experiences jsonb not null default '[]'::jsonb,
  projects jsonb not null default '[]'::jsonb,
  courses jsonb not null default '[]'::jsonb,
  certifications jsonb not null default '[]'::jsonb,
  languages jsonb not null default '[]'::jsonb,
  github_url text not null default '',
  linkedin_url text not null default '',
  portfolio_url text not null default '',
  study_minutes_per_day int check (study_minutes_per_day between 5 and 720),
  study_days smallint[] not null default '{}',
  target_date date,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- resumes / versions / suggestions
-- ---------------------------------------------------------------------------
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  is_base boolean not null default false,
  source_file_path text,
  raw_text text,
  current_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index resumes_user_idx on public.resumes (user_id);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source public.job_source not null,
  source_url text,
  source_file_path text,
  raw_text text not null,
  title text,
  company text,
  seniority text,
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index jobs_user_idx on public.jobs (user_id);

create table public.resume_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  resume_id uuid not null references public.resumes (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete set null,
  version_number int not null,
  label text not null default '',
  mode public.adaptation_mode,
  template text not null default 'classic',
  content jsonb not null,
  is_preview boolean not null default false, -- true = "after training" preview, never the definitive CV
  created_at timestamptz not null default now(),
  unique (resume_id, version_number)
);
create index resume_versions_user_idx on public.resume_versions (user_id);
create index resume_versions_resume_idx on public.resume_versions (resume_id);
create index resume_versions_job_idx on public.resume_versions (job_id);

alter table public.resumes
  add constraint resumes_current_version_fk
  foreign key (current_version_id) references public.resume_versions (id) on delete set null;

create table public.resume_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  resume_version_id uuid not null references public.resume_versions (id) on delete cascade,
  section text not null,
  original_text text,
  suggested_text text not null,
  final_text text,
  rationale text not null default '',
  requires_skill text, -- set when the suggestion is conditional on a skill being demonstrated
  status public.suggestion_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index resume_suggestions_user_idx on public.resume_suggestions (user_id);
create index resume_suggestions_version_idx on public.resume_suggestions (resume_version_id);

-- ---------------------------------------------------------------------------
-- job analysis
-- ---------------------------------------------------------------------------
create table public.job_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  resume_id uuid references public.resumes (id) on delete set null,
  summary jsonb not null,           -- structured extraction (responsibilities, keywords...)
  compatibility_score int check (compatibility_score between 0 and 100),
  compatibility_breakdown jsonb,    -- transparent criteria
  model text not null,
  created_at timestamptz not null default now()
);
create index job_analyses_user_idx on public.job_analyses (user_id);
create index job_analyses_job_idx on public.job_analyses (job_id);

create table public.job_requirements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  analysis_id uuid references public.job_analyses (id) on delete cascade,
  skill text not null,
  category text not null,
  kind public.requirement_kind not null,
  importance smallint not null default 3 check (importance between 1 and 5),
  plain_explanation text not null default '',
  match public.requirement_match not null default 'not_evaluated',
  evidence text not null default '',
  gap text not null default '',
  next_action text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index job_requirements_user_idx on public.job_requirements (user_id);
create index job_requirements_job_idx on public.job_requirements (job_id);

-- ---------------------------------------------------------------------------
-- skills
-- ---------------------------------------------------------------------------
create table public.skill_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  skill text not null,
  declared_level public.declared_level not null default 'none',
  state public.skill_state not null default 'unknown',
  evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, skill)
);
create index skill_profiles_user_idx on public.skill_profiles (user_id);

-- ---------------------------------------------------------------------------
-- learning
-- ---------------------------------------------------------------------------
create table public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete set null,
  title text not null,
  minutes_per_day int not null check (minutes_per_day between 5 and 720),
  study_days smallint[] not null,
  target_date date,
  rationale text not null default '',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index learning_paths_user_idx on public.learning_paths (user_id);
create index learning_paths_job_idx on public.learning_paths (job_id);

create table public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  path_id uuid not null references public.learning_paths (id) on delete cascade,
  skill text not null,
  position int not null,
  title text not null,
  objective text not null,
  content jsonb not null,  -- explicação, exemplos, exercícios, desafio, projeto, avaliação, critérios, recursos
  depends_on uuid[] not null default '{}',
  difficulty smallint not null default 2 check (difficulty between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index learning_modules_user_idx on public.learning_modules (user_id);
create index learning_modules_path_idx on public.learning_modules (path_id);

create table public.learning_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  module_id uuid not null references public.learning_modules (id) on delete cascade,
  title text not null,
  kind text not null, -- lesson | exercise | challenge | project | assessment | review
  estimated_minutes int not null default 15,
  scheduled_for date,
  status public.task_status not null default 'not_started',
  completed_at timestamptz,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index learning_tasks_user_idx on public.learning_tasks (user_id);
create index learning_tasks_module_idx on public.learning_tasks (module_id);
create index learning_tasks_schedule_idx on public.learning_tasks (user_id, scheduled_for);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  module_id uuid references public.learning_modules (id) on delete cascade,
  skill text not null,
  title text not null,
  questions jsonb not null,
  passing_score int not null default 70,
  created_at timestamptz not null default now()
);
create index assessments_user_idx on public.assessments (user_id);
create index assessments_module_idx on public.assessments (module_id);

create table public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  answers jsonb not null,
  score int not null check (score between 0 and 100),
  feedback jsonb not null,
  demonstrated_level public.skill_state,
  created_at timestamptz not null default now()
);
create index assessment_attempts_user_idx on public.assessment_attempts (user_id);
create index assessment_attempts_assessment_idx on public.assessment_attempts (assessment_id);

create table public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete set null,
  title text not null,
  objective text not null,
  details jsonb not null, -- requisitos, tecnologias, etapas, critérios, documentação
  status public.project_status not null default 'suggested',
  repository_url text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index portfolio_projects_user_idx on public.portfolio_projects (user_id);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete set null,
  learning_path_id uuid references public.learning_paths (id) on delete set null,
  resume_version_id uuid references public.resume_versions (id) on delete set null,
  role text not null,
  company text not null default '',
  url text,
  description text,
  deadline date,
  compatibility_score int check (compatibility_score between 0 and 100),
  notes text not null default '',
  status public.application_status not null default 'interesting',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index applications_user_idx on public.applications (user_id);
create index applications_status_idx on public.applications (user_id, status);

create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid references public.learning_tasks (id) on delete set null,
  skill text,
  minutes int not null check (minutes between 1 and 720),
  notes text not null default '',
  difficulties jsonb not null default '[]'::jsonb,
  studied_on date not null default current_date,
  created_at timestamptz not null default now()
);
create index study_sessions_user_idx on public.study_sessions (user_id, studied_on);

-- Activity feed for dashboard
create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  title text not null,
  ref_table text,
  ref_id uuid,
  created_at timestamptz not null default now()
);
create index activity_events_user_idx on public.activity_events (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','resumes','resume_suggestions','jobs','job_requirements','skill_profiles',
    'learning_paths','learning_modules','learning_tasks','portfolio_projects','applications'
  ] loop
    execute format(
      'create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

do $$
declare t text;
begin
  foreach t in array array[
    'resumes','resume_versions','resume_suggestions','jobs','job_requirements','job_analyses',
    'skill_profiles','learning_paths','learning_modules','learning_tasks','assessments',
    'assessment_attempts','portfolio_projects','applications','study_sessions','activity_events'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      t || '_owner_all', t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Private storage: documents/{user_id}/...
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents', 'documents', false, 5242880,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

create policy "documents_owner_select" on storage.objects for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "documents_owner_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "documents_owner_update" on storage.objects for update to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "documents_owner_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
