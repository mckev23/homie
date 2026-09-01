/*
# Create profiles table

## Purpose
Establishes the minimal foundational data structure for hōm. The profiles
table stores user display information linked to Supabase Auth identities. It
does NOT duplicate authentication credentials or store passwords.

## New Tables

### profiles
- `id` (uuid, primary key) — matches the authenticated user's ID in auth.users.
  Foreign key to auth.users(id) with ON DELETE CASCADE so the profile is
  removed if the auth user is deleted.
- `full_name` (text, nullable) — display name for the homeowner. Optional at
  creation; can be set during onboarding.
- `created_at` (timestamptz, default now()) — when the profile was created.
- `updated_at` (timestamptz, default now()) — when the profile was last
  modified. Updated automatically via a trigger.

## Security — Row Level Security

RLS is ENABLED on profiles. Four separate policies (one per CRUD verb) ensure
authenticated users can only access their own profile row:

1. SELECT — user can read only their own profile (auth.uid() = id).
2. INSERT — user can create only their own profile (auth.uid() = id).
3. UPDATE — user can update only their own profile (auth.uid() = id).
4. DELETE — user can delete only their own profile (auth.uid() = id).

No public/anon access. No broad USING(true) policies. Each policy is scoped to
TO authenticated with an ownership check against auth.uid().

## Future Relationship: User → Profile → Home

This table establishes the foundation for the next feature (home creation).
The intended relationship is:

  auth.users (Supabase Auth) → profiles (this table) → homes (future)

The homes table will reference profiles(id) or auth.users(id) and will be
owner-scoped with its own RLS policies when the home feature is built.

## Important Notes

1. No user_id column is needed — the profile's primary key IS the auth user ID.
2. The updated_at trigger automatically maintains the modification timestamp.
3. This migration is idempotent: CREATE TABLE IF NOT EXISTS and DROP POLICY IF
   EXISTS before each CREATE POLICY.
4. No Home, Maintenance, or Project tables are created in this phase.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
