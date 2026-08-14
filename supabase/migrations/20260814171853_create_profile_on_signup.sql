/*
# Auto-create profile on user signup

## Purpose
When a new user registers through Supabase Auth, a corresponding profile
row must be created in the profiles table. This happens via a database
trigger that fires AFTER INSERT on auth.users.

## Why a trigger instead of client-side insert?
If email confirmation is enabled, the user does not have an authenticated
session immediately after signUp(). A client-side INSERT into profiles
would fail the RLS policy (auth.uid() = id) because there is no session.
The trigger runs with SECURITY DEFINER (as the postgres user), bypassing
RLS, so the profile is created regardless of session state.

## What the trigger does
1. A new row is inserted into auth.users (by Supabase Auth).
2. The AFTER INSERT trigger fires.
3. It extracts the full_name from the user's raw_user_meta_data (set
   during signUp via the data parameter).
4. It inserts a new row into profiles with:
   - id = the new auth user's ID
   - full_name = the value from raw_user_meta_data, or NULL if not provided

## Security
- The function is SECURITY DEFINER with search_path = public.
- The function is owned by postgres.
- Only the postgres role can execute it (default).
- The trigger is on auth.users, which only Supabase Auth can write to.
- The profiles RLS policies remain unchanged — users can still only
  access their own profile through the anon/authenticated client.

## New database objects
1. Function: public.handle_new_user() — SECURITY DEFINER, returns trigger
2. Trigger: on_auth_user_created — AFTER INSERT ON auth.users

## RLS changes
None. The existing profiles RLS policies are not modified.

## Important notes
1. The function uses COALESCE to safely handle missing full_name.
2. The trigger is idempotent: ON CONFLICT (id) DO NOTHING prevents
   duplicate profiles if the trigger fires more than once for the same user.
3. The function search_path is set to public for security.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
