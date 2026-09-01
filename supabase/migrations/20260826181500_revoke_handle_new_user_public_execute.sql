/*
# Revoke public execute on handle_new_user

## Purpose
The Supabase security advisor flags public.handle_new_user() as callable
via PostgREST RPC (/rest/v1/rpc/handle_new_user) by the anon and
authenticated roles, because it is SECURITY DEFINER. In practice calling
it directly errors out — it is declared RETURNS trigger and Postgres only
allows trigger functions to run inside trigger context — but there is no
reason to leave the RPC surface exposed.

## Changes
- Revokes EXECUTE on public.handle_new_user() from PUBLIC, anon, and
  authenticated. The AFTER INSERT trigger on auth.users still invokes it
  normally; trigger execution does not require EXECUTE grants on the
  triggering role.

## Security
No behavior change for the signup flow. Removes an unnecessary exposed
RPC endpoint flagged by `mcp__supabase__get_advisors` (security).
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
