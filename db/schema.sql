-- Modal Runs monetization infra: cross-device sync for subscribers.
--
-- Identity and subscription status live in Clerk (publicMetadata.subscribed,
-- publicMetadata.polarCustomerId), set by api/webhook/polar.ts. This table
-- only holds the actual synced app data — it is intentionally minimal, one
-- row per Clerk user, keyed by their Clerk user ID. No email/PII duplicated
-- here; Clerk is the source of truth for identity.

create table if not exists user_data (
  clerk_user_id text primary key,
  -- Subset of AppState worth syncing across devices: favorites,
  -- practiceStreak, lastPracticeDate, and display prefs. Stored as JSONB
  -- rather than individual columns so the synced shape can evolve without
  -- a migration every time AppState grows a new persistable field.
  app_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_data_set_updated_at on user_data;
create trigger user_data_set_updated_at
  before update on user_data
  for each row
  execute function set_updated_at();
