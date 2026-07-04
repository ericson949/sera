# RFC 003: Progressive Meal Generation

## Status

Accepted

## Context

Generating seven complete recipes in one AI response makes the user wait for ingredients, long cooking methods, and images before seeing any useful menu. Images also have a different latency and failure profile from text generation.

## Decision

Sera splits generation into two phases:

1. The foreground request returns only the seven meal overviews, weekly budget estimate, and short reasons for each choice.
   - **Database-Driven Constraint Optimization**: Instead of calling external LLMs or edge functions, `/api/generate` runs the `MealPlanEngine` solver directly within Next.js. It queries the PostgreSQL `recipes` and `ingredients_reference` tables, applies dietary/allergy filters, and scales ingredient costs by household size.
   - **Rating-Based Prioritization**: Matches are sorted by `ratings` (descending) and `ratingsCount` (descending). The engine executes a cascading budget solver that first tries to fit the budget using the **top 15 highest-rated meals**, falling back to the **top 25**, and finally to all matches.
   - **Swapping and Continuity**: Swapping meals passes the existing recipe IDs (`excludeIds`) to filter them out of subsequent candidates.
2. Independent background jobs request recipe details and images after the menu screen has rendered.

The client-side job queue runs at most five jobs concurrently. Recipe jobs are queued before image jobs, so cooking information remains the priority. Additional jobs remain FIFO in memory. Each meal persists separate recipe and image statuses (`pending`, `processing`, `ready`, or `failed`), so non-ready work can be queued again when the local session is restored.

Opening a meal explicitly enqueues its recipe-detail job. If that job was already waiting, it is promoted to the front of the queue; image work never receives this interaction priority.

The application use case owns orchestration. AI calls remain behind `MealPlanAIService`, persistence remains behind `MealPlanRepository`, and presentation only observes progressively updated plans.

The shopping guide is rebuilt from every ingredient set persisted so far. It therefore becomes useful progressively rather than delaying the initial menu.

## Failure and deployment behavior

- Image jobs never gate recipe jobs or menu rendering. A slow or failed image only keeps the editorial fallback image.
- A failed recipe job is marked and retried on the next app launch.
- The queue limit is per active browser session in the current local-first MVP.
- A production multi-instance worker must use a durable external queue with the same concurrency contract; a Next.js Route Handler must not be treated as a durable background worker.
- Generated image data should move to object storage before durable Supabase rollout; the meal record should store only a stable URL.

## Consequences

The menu becomes visible after a much smaller AI response. Recipe details arrive independently, and two queued meals wait while five are processed. The tradeoff is temporary partial data, which the UI communicates explicitly.

## Verification

- The `/api/generate` response contains complete meals with all ingredients and preparation steps.
- The weekly shopping list is fully compiled and returned inside the same response.
- `npx tsc --noEmit` passes and no source file exceeds 300 effective lines.

---

## 2026-07-04 Update: Deprecation of Background Enrichment

With the implementation of the database-driven constraint optimization engine, the system now queries the complete recipe catalogue (including ingredients and steps) directly from PostgreSQL inside `/api/generate`.

Consequently:
- The `/api/enrich-meal` route and its associated client background jobs (`useMealPlanEnrichment`) have been fully removed from the codebase.
- The `GenerateMealPlanUseCase` and `SwapMealUseCase` set both `enrichmentStatus` and `imageStatus` to `"ready"` directly upon mapping.
- The entire recipe details and the compiled weekly shopping list are returned instantly in the foreground response, eliminating background queue jobs, HTTP requests, and network latency entirely.
