/*
# Create homes table

## Purpose
Establishes the `homes` table — the first durable data a user creates beyond
their profile. Each row represents one home owned by one authenticated user.
Fields are intentionally minimal (low friction over completeness, per MVP
scope); the "add a home" UI decides which of these are required vs optional.
More fields can be added later as nullable columns without a breaking change.

## New Tables

### homes
- `id` (uuid, primary key, default gen_random_uuid())
- `user_id` (uuid, NOT NULL) — owner. References auth.users(id) with
  ON DELETE CASCADE so a user's homes are removed if their account is deleted.
- `nickname` (text, NOT NULL, default 'My Home') — how the user refers to
  this home in the app (e.g. "123 Main St" or "The Lake House").
- `address` (text, nullable) — free-text address line; kept as a single
  field for low friction rather than a structured multi-field form.
- `postal_code` (text, nullable) — used later for climate-aware guidance
  (e.g. HVAC maintenance cadence varies by region).
- `year_built` (integer, nullable) — used for age-based maintenance guidance
  ("what's coming next"). Nullable because the user may not know it.
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now()) — auto-updated via the existing
  `public.update_updated_at_column()` trigger function (created in
  20260814155737_create_profiles_table.sql).

## Security — Row Level Security

RLS is ENABLED on homes. Four separate policies (one per CRUD verb) ensure
authenticated users can only access their own homes (auth.uid() = user_id).
No public/anon access. No broad USING(true) policies. Each policy is scoped
to TO authenticated with an ownership check against auth.uid().

## Important Notes

1. This migration is idempotent: CREATE TABLE IF NOT EXISTS and DROP POLICY
   IF EXISTS before each CREATE POLICY.
2. No home_systems or maintenance_items tables are created in this phase —
   those follow once the "add a home" feature is built and validated, per
   the one-feature-at-a-time workflow.
3. Reuses the existing `public.update_updated_at_column()` trigger function
   rather than duplicating it.
*/

CREATE TABLE IF NOT EXISTS homes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text NOT NULL DEFAULT 'My Home',
  address text,
  postal_code text,
  year_built integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS homes_user_id_idx ON homes(user_id);

ALTER TABLE homes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_homes" ON homes;
CREATE POLICY "select_own_homes" ON homes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_homes" ON homes;
CREATE POLICY "insert_own_homes" ON homes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_homes" ON homes;
CREATE POLICY "update_own_homes" ON homes
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_homes" ON homes;
CREATE POLICY "delete_own_homes" ON homes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS homes_updated_at ON homes;
CREATE TRIGGER homes_updated_at
  BEFORE UPDATE ON homes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
