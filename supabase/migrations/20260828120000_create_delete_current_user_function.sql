/*
# Add delete_current_user() — in-app account deletion

## Purpose
Apple App Store Guideline 5.1.1(v) requires any app that offers account
creation to also offer in-app account deletion. The mobile client only
holds the anon key and cannot delete an auth user directly (that needs
service-role privileges), so deletion goes through this SECURITY DEFINER
function instead of putting a privileged key in the app.

## Behavior — hard delete
Deletes the caller's row from auth.users. Every hōm table references
auth.users(id) with ON DELETE CASCADE, so this removes, in one statement:
  - profiles      (id       -> auth.users ON DELETE CASCADE)
  - homes         (user_id  -> auth.users ON DELETE CASCADE)
  - home_systems  (user_id  -> auth.users ON DELETE CASCADE)
  - maintenance_tasks (user_id -> auth.users ON DELETE CASCADE)

Hard delete (not soft delete with a grace period) is the deliberate
choice for MVP: it matches what "delete my account" means to a user,
avoids a data-retention policy question we don't need yet, and satisfies
the store requirement unambiguously. Revisit if we later need account
recovery or regulatory retention.

## Security
- SECURITY DEFINER with SET search_path = public, owned by postgres.
- The function takes NO parameters and deletes only auth.uid() — the
  caller's own identity, derived from their verified JWT. A caller cannot
  target another user's account; there is no id to tamper with.
- Raises if auth.uid() is NULL, so an unauthenticated/anon call fails
  closed rather than deleting anything.
- EXECUTE revoked from PUBLIC and anon; granted only to authenticated.

## Important notes
1. Idempotent: CREATE OR REPLACE, and REVOKE/GRANT are safe to re-run.
2. This is irreversible by design — the UI must confirm before calling it.
*/

CREATE OR REPLACE FUNCTION public.delete_current_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_uid uuid;
BEGIN
  current_uid := auth.uid();

  IF current_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM auth.users WHERE id = current_uid;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.delete_current_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_current_user() TO authenticated;
