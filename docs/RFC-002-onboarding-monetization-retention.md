# RFC 002: Onboarding, Monetization, and Retention Foundations

## Status

Accepted

## Context

Sera needs a stronger conversion and retention path while keeping the first meal plan accessible. The first plan should create value before asking for a paid commitment, but repeat weekly planning and high-value utility surfaces should encourage account and Pro conversion.

## Data Model Changes

TypeScript:

- `UserPreferences.batchCooking: boolean`
- `DinneroState.onboardingBatchCooking: boolean`

Durable persistence expectation:

```sql
alter table user_preferences
  add column if not exists batch_cooking boolean not null default false;
```

Existing local preferences are normalized with `batchCooking: false` when missing.

## Flow Decisions

- Welcome includes a visible "already have an account" path.
- Onboarding asks whether the user batch cooks the whole week at once.
- First plan generation goes to `/plan-preview`.
- `/plan-preview` lets the user validate the generated plan before entering the app.
- `/post-onboarding` shows a soft, non-blocking paywall and notification opt-in.
- `/new-week` is a hard Pro gate in this MVP.
- Shopping list and full meal details are contextual Pro upsells for free users.

## Implementation Notes

- The soft paywall uses existing local Pro simulation and keeps a clear later/continue path.
- The hard gate for new weeks lives at route level to prevent bypass from dashboard links.
- Notification opt-in stays in the shared notification component so copy and browser permission handling remain centralized.

## Future Work

- Replace local demo account with real authentication.
- Migrate local meal executions and preferences into durable user-scoped persistence.
- Add clone previous week and compose from history options to `/new-week`.
- Add reliable server-side push scheduling.

## Beta Observability

PostHog is the only beta observability SDK/tool. It handles route analytics, session replay, frontend exceptions, API exception events, beta feedback, and feature flags. See `docs/BETA_OBSERVABILITY.md`.
