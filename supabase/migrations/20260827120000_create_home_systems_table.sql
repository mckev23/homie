/*
# Create home_systems table

## Purpose
Supports the "quick-add systems" step: a short, fixed list of major home
systems the user can mark as present on a given home. Matches the MVP
scope's "simple system/component model" — a small fixed taxonomy, not a
full one.

## New Tables

### home_systems
- `id` (uuid, primary key, default gen_random_uuid())
- `home_id` (uuid, NOT NULL) — references homes(id) ON DELETE CASCADE.
- `user_id` (uuid, NOT NULL) — denormalized owner reference (references
  auth.users(id) ON DELETE CASCADE) so RLS policies can check
  auth.uid() = user_id directly, matching the pattern used on homes and
  profiles, instead of a join through homes on every policy check.
- `system_type` (text, NOT NULL) — constrained via CHECK to a fixed set:
  'heating', 'cooling', 'water_heater', 'electrical_panel', 'sewer_septic'.
  Extending this list later is a simple CHECK constraint change, not a
  schema redesign.
- `created_at` / `updated_at` (timestamptz) — same pattern as other tables.

A unique constraint on (home_id, system_type) prevents duplicate rows for
the same system on the same home (toggling a system on twice is a no-op,
not a duplicate).

## Security — Row Level Security

RLS is ENABLED. Four owner-scoped policies (one per CRUD verb), all
`auth.uid() = user_id`, `TO authenticated`. No public/anon access.

## Important Notes
1. Idempotent: CREATE TABLE IF NOT EXISTS, DROP POLICY IF EXISTS before
   each CREATE POLICY.
2. Reuses public.update_updated_at_column() from earlier migrations.
*/

CREATE TABLE IF NOT EXISTS home_systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id uuid NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  system_type text NOT NULL CHECK (
    system_type IN ('heating', 'cooling', 'water_heater', 'electrical_panel', 'sewer_septic')
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (home_id, system_type)
);

CREATE INDEX IF NOT EXISTS home_systems_home_id_idx ON home_systems(home_id);
CREATE INDEX IF NOT EXISTS home_systems_user_id_idx ON home_systems(user_id);

ALTER TABLE home_systems ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_home_systems" ON home_systems;
CREATE POLICY "select_own_home_systems" ON home_systems
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_home_systems" ON home_systems;
CREATE POLICY "insert_own_home_systems" ON home_systems
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_home_systems" ON home_systems;
CREATE POLICY "update_own_home_systems" ON home_systems
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_home_systems" ON home_systems;
CREATE POLICY "delete_own_home_systems" ON home_systems
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS home_systems_updated_at ON home_systems;
CREATE TRIGGER home_systems_updated_at
  BEFORE UPDATE ON home_systems
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
