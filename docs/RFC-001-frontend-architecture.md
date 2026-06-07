# RFC 001: Sera Frontend Architecture Guardrails

## Status

Accepted

## Context

Sera is moving from prototype to production. The app already follows a DDD / hexagonal structure, but some presentation files started accumulating UI state, copy, constants, and helper components. This makes product iteration slower and increases the risk of breaking the 300-line rule.

## Decision

Sera will keep route files thin and move behavior into dedicated hooks and reusable presentation components.

Route files in `src/app` should:

- compose route-level layout;
- connect feature components;
- avoid local domain constants;
- avoid localized copy maps;
- avoid complex UI behavior.

Presentation components should:

- receive localized copy as props;
- avoid direct infrastructure access;
- remain small and reusable;
- use product-oriented names such as `CookingTimeCards`, `OnboardingOptionGrid`, and `MealCard`.

Custom hooks should:

- own UI interaction logic;
- coordinate store actions;
- keep effects out of page files where possible.

Shared constants and product copy should live in:

- `src/shared/seraProductCopy.ts` for product/i18n copy;
- `src/shared/i18n.ts` for pre-onboarding and locale-level copy;
- `src/shared/onboardingConstants.ts` for reusable onboarding constants;
- domain value objects when the values are true domain concepts.

## Consequences

Positive:

- Faster product iteration.
- Easier mobile QA.
- Fewer oversized files.
- Cleaner split between DDD layers and presentation concerns.

Tradeoffs:

- More small files.
- Slightly more prop passing for localized copy.

## Current Refactor

The onboarding route was split so that:

- `useOnboardingFlow` owns flow effects and toggle logic;
- `OnboardingStepShell` owns the repeated editorial step layout;
- `OnboardingOptionGrid` owns repeated option card UI;
- `KITCHEN_ITEMS` lives in shared constants;
- goal and cooking time copy live in shared product copy.

The first family-focused navigation refactor establishes:

- `/dashboard` as the Tonight surface for immediate low-friction dinner decisions;
- `/week` as the weekly planning and meal execution surface;
- `/profile` as the account, preferences, notification and subscription surface;
- `/shopping-list` as a secondary flow reachable from Tonight and Week;
- local meal execution tracking as an MVP hook before adding durable backend persistence.
- weekly meal day swaps as an application use case so drag/drop UI still persists through the meal plan repository.
- weekly presentation state in `useWeeklyMealState`, which derives scheduled dates, today's meal, cooked/skipped status, and action permissions for Tonight, Week, and meal detail surfaces.

## Verification

Every relevant change should pass:

```bash
npx tsc --noEmit
```

And source file size should be checked so no file in `src` exceeds 300 lines.
