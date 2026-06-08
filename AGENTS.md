<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:sera-agent-rules -->
# Sera AI Agent Rules

## Product & Architecture

- Maintain the existing DDD / hexagonal architecture.
- Keep domain logic in `modules/*/domain`.
- Keep use cases in `modules/*/application/use-cases`.
- Keep infrastructure adapters in `modules/*/infrastructure`.
- Keep presentation code in `modules/*/presentation`.
- Do not couple UI components directly to infrastructure services.
- Prefer vertical product slices: update domain/application/infrastructure/presentation only where the feature genuinely crosses those boundaries.

## File Size & Component Design

- No source file should exceed 300 effective lines.
- Treat 250 lines as a warning threshold and split before adding meaningful behavior.
- If a file approaches 300 lines, split it before adding more behavior.
- Prefer small reusable components over large page-level components.
- Page files should compose components and orchestrate layout, not hold complex logic.
- Complex UI behavior belongs in custom hooks.
- Reusable UI state and interaction logic should be extracted to `use*` hooks.
- Components named `*Selector` are reserved for actual selection UI only when the name is clearer than `*Cards`, `*Picker`, or `*List`.
- Do not use `selector` to mean a Zustand/store selector unless it actually reads selected store state.
- Do not keep localized copy maps inside UI components. Pass copy as props from the shared i18n/product copy layer.

## Shared Constants & Copy

- Centralize constants in `src/shared` or the relevant domain value object.
- Do not duplicate country lists, copy dictionaries, route names, storage keys, or design tokens across files.
- Internationalized user-facing copy should go through the shared i18n layer.
- Keep app-wide design tokens in `globals.css` / shared style utilities.
- App routes, storage keys, supported locales, supported countries, onboarding option copy, and legal copy must be centralized before reuse.
- A component may define only tiny presentational constants that are not user-facing and not reused elsewhere.

## Naming Rules

- Use product/UI names for components: `MealCard`, `CookingTimeCards`, `OnboardingOptionGrid`.
- Use `use*` names only for hooks.
- Use `*Repository`, `*Service`, and `*UseCase` only in domain/application/infrastructure layers.
- Avoid legacy `Dinnero` names in new files; use `Sera` unless touching existing APIs where renaming would create churn.

## Implementation Discipline

- Favor incremental, product-oriented changes.
- Avoid broad refactors unless needed for the requested product change.
- Keep components mobile-first and PWA-friendly.
- Preserve Sera's warm premium design system and motion-first onboarding style.
- Keep external billing providers behind the `PaymentProvider` port. UI, store, and use cases must not depend directly on Lemon Squeezy, Stripe, or another concrete payment SDK.
- Before finishing a change, run `npx tsc --noEmit` and check that no `src` file exceeds 300 lines.
- For UI changes, verify the mobile viewport mentally from the code at minimum; use browser QA when a dev server is available.

## Documentation Governance

- When a change affects product scope, user flows, architecture decisions, supported countries/locales, payment, PWA behavior, or production readiness, update the relevant documentation in the same change.
- Update `docs/PRD.md` for product behavior, UX flows, target users, success metrics, and release criteria.
- Update `docs/RFC-*.md` for architectural decisions, tradeoffs, constraints, and accepted implementation patterns.
- Update `AGENTS.md` when a new recurring engineering rule, naming convention, or quality gate is introduced.
- Documentation is part of the acceptance criteria for product and architecture changes; keep it in sync before marking the task complete.

## Product Quality Bar

- The app is a premium Italian lifestyle meal planner, not a generic AI dashboard.
- Mobile PWA is the primary surface. Every core screen must fit the first viewport without hiding primary CTAs behind mandatory scroll.
- User-facing text must be available in English, French, and Italian before release.
- Offline/PWA behavior must preserve the user's current local session and last useful meal plan.
<!-- END:sera-agent-rules -->
