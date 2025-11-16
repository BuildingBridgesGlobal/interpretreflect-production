-- Readiness and Reflection tables for ERI computation
create table if not exists readiness_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assignment_id uuid null,
  pre_emotional_state_score int not null check (pre_emotional_state_score between 1 and 5),
  pre_emotional_state_label text null,
  pre_cognitive_readiness_score int not null check (pre_cognitive_readiness_score between 1 and 5),
  pre_context_familiarity_score int not null check (pre_context_familiarity_score between 1 and 5),
  pre_role_clarity_score int not null check (pre_role_clarity_score between 1 and 5),
  pre_focus_ecci_domains text[] not null default '{}',
  pre_focus_free_text text null,
  pre_ai_involvement_expected text not null check (pre_ai_involvement_expected in ('yes','no','unsure')),
  pre_ai_confidence_score int null check (pre_ai_confidence_score between 1 and 5),
  created_at timestamptz not null default now()
);

alter table readiness_checks enable row level security;
create policy "own-readiness" on readiness_checks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists quick_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assignment_id uuid null,
  post_emotional_load_score int not null check (post_emotional_load_score between 1 and 5),
  post_cognitive_load_score int not null check (post_cognitive_load_score between 1 and 5),
  post_meaning_challenge_score int not null check (post_meaning_challenge_score between 1 and 5),
  post_meaning_challenge_tags text[] not null default '{}',
  post_rolespace_challenge_score int not null check (post_rolespace_challenge_score between 1 and 5),
  post_rolespace_challenge_tags text[] not null default '{}',
  post_cultural_friction_score int not null check (post_cultural_friction_score between 1 and 5),
  post_cultural_friction_tags text[] not null default '{}',
  post_ai_impact_score int null check (post_ai_impact_score between 1 and 5),
  post_ai_issue_tags text[] not null default '{}',
  post_recovery_actions text[] not null default '{}',
  post_recovery_other text null,
  post_key_learning_text text null,
  post_key_learning_tags text[] not null default '{}',
  post_performance_confidence_score int not null check (post_performance_confidence_score between 1 and 5),
  post_reflection_depth_self_score int not null check (post_reflection_depth_self_score between 1 and 4),
  created_at timestamptz not null default now()
);

alter table quick_reflections enable row level security;
create policy "own-reflections" on quick_reflections for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

