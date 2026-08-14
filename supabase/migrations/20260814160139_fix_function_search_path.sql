/*
# Fix mutable search_path on update_updated_at_column function

## Purpose
Resolves the Supabase security advisor warning about the
update_updated_at_column function having a mutable search_path.
Sets an explicit search_path to public so the function is secure.

## Changes
- Recreates update_updated_at_column with SET search_path = public.
- Re-attaches the trigger on profiles.
*/

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
