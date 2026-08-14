# Homie Development Rules

Homie is built as one Expo and React Native mobile application for iPhone and Android. Build only the current MVP step: foundation, then account creation, then adding a home, then a simple maintenance schedule.

## Work in small increments

Use this sequence for every feature:

**PLAN → IMPLEMENT → TEST → VERIFY → STOP**

Change only the files that need changing. Reuse existing controls, utilities, navigation, and design tokens. Do not add a dependency or create an abstraction without a concrete reason.

## Protect the foundation

Do not casually change Supabase initialization, environment handling, navigation, design tokens, core UI controls, or Expo/EAS configuration. If a feature needs one of these areas changed, make the smallest safe change and explain why.

## Keep data secure

Never hardcode credentials. The mobile app may use only the Supabase URL and anon key. Never expose a service-role key. Add database tables and RLS policies only when a feature needs persistent data, and make the access rules match the feature's ownership model.

## Database migrations

All schema changes are made through the Supabase MCP `apply_migration` tool. Never make manual database changes. Never use the Supabase CLI. Each migration must be idempotent, include a summary comment, and enable RLS with owner-scoped policies. See `docs/FOUNDATION.md` for the full process.

## Source control

The local Git repository must stay clean after each completed feature. `.env` is always ignored. `.env.example` with placeholders is committed. Never commit secrets, service-role keys, or build artifacts. When a feature is complete, commit the changes with a clear message.

## Debug deliberately

When something breaks, reproduce it, identify the likely cause, inspect the smallest relevant area, make one focused fix, and test again. Classify the problem before changing code. Do not enter a repeated speculative fix loop.

## Test the real target

Bolt's browser preview can help with visual smoke checks, but it is not an iPhone simulator. Use Expo Go for rapid physical-device testing and EAS development builds or TestFlight for native validation.

## Stop at the requested scope

Do not add login, home creation, maintenance schedules, notifications, payments, AI, or other product functionality until explicitly requested. A smaller stable foundation is more valuable than unfinished feature work.
