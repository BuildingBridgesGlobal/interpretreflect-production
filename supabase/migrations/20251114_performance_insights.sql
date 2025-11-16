create table if not exists performance_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  assignment_id uuid,
  pre_score jsonb,
  post_score jsonb,
  cognitive_load numeric,
  emotional_intensity numeric,
  recommendations jsonb,
  created_at timestamptz default now()
);

alter table performance_insights
  add constraint performance_insights_user_fk foreign key (user_id) references auth.users(id) on delete cascade;

create index if not exists performance_insights_user_idx on performance_insights(user_id);
create index if not exists performance_insights_created_idx on performance_insights(created_at);

-- RLS
alter table performance_insights enable row level security;
create policy "own-rows" on performance_insights for all using (auth.uid() = user_id);
