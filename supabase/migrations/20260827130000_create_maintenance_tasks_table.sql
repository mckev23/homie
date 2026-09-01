/*
# Create maintenance_tasks table

## Purpose
MVP sequence step 4 — "simple maintenance schedule". A short, calm,
prioritized list of upkeep tasks per home, seeded from a static
best-practice template per system type (see src/maintenance.ts) when the
user adds systems to a home. No push notifications, no exact predicted
failure dates — matches the "no false precision" product rule.

## New Tables

### maintenance_tasks
- `id` (uuid, primary key, default gen_random_uuid())
- `home_id` (uuid, NOT NULL) — references homes(id) ON DELETE CASCADE.
- `user_id` (uuid, NOT NULL) — denormalized owner reference, same pattern
  as homes/home_systems, so RLS policies check auth.uid() = user_id
  directly.
- `system_type` (text, nullable) — informational link back to the system
  category this task came from (see home_systems' system_type values).
  No foreign key to home_systems: removing a system should not silently
  delete a user's task history.
- `title` (text, NOT NULL) — e.g. "Replace furnace filter".
- `frequency_months` (integer, NOT NULL) — how often the task recurs, in
  months. A cadence, not a predicted date.
- `last_completed_at` (timestamptz, nullable) — set when the user marks
  the task done. Null means never completed.
- `created_at` / `updated_at` (timestamptz) — same pattern as other
  tables.

A unique constraint on (home_id, title) lets task-seeding use
ON CONFLICT DO NOTHING so re-saving systems never duplicates or resets an
existing task's completion history.

## Security — Row Level Security

RLS is ENABLED. Four owner-scoped policies (one per CRUD verb), all
`auth.uid() = user_id`, `TO authenticated`. No public/anon access.

## Important Notes
1. Idempotent: CREATE TABLE IF NOT EXISTS, DROP POLICY IF EXISTS before
   each CREATE POLICY.
2. Reuses public.update_updated_at_column() from earlier migrations.
*/

CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id uuid NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  system_type text,
  title text NOT NULL,
  frequency_months integer NOT NULL,
  last_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (home_id, title)
);

CREATE INDEX IF NOT EXISTS maintenance_tasks_home_id_idx ON maintenance_tasks(home_id);
CREATE INDEX IF NOT EXISTS maintenance_tasks_user_id_idx ON maintenance_tasks(user_id);

ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_maintenance_tasks" ON maintenance_tasks;
CREATE POLICY "select_own_maintenance_tasks" ON maintenance_tasks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_maintenance_tasks" ON maintenance_tasks;
CREATE POLICY "insert_own_maintenance_tasks" ON maintenance_tasks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_maintenance_tasks" ON maintenance_tasks;
CREATE POLICY "update_own_maintenance_tasks" ON maintenance_tasks
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_maintenance_tasks" ON maintenance_tasks;
CREATE POLICY "delete_own_maintenance_tasks" ON maintenance_tasks
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS maintenance_tasks_updated_at ON maintenance_tasks;
CREATE TRIGGER maintenance_tasks_updated_at
  BEFORE UPDATE ON maintenance_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
