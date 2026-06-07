# PRD: Sera Mobile PWA Meal Planner

## Product Summary

Sera is a premium mobile-first PWA that plans a full week of dinners around a user's country, language, budget, household size, tastes, dietary needs, cooking time, and kitchen inventory.

The product should feel like an Italian lifestyle brand and premium cookbook, not an AI tool.

## Target Users

- Busy households that want dinner planned without decision fatigue.
- Budget-conscious shoppers who still want meals to feel curated.
- Mobile users who want a near-native PWA without installing a store app.

## Core Value Proposition

Sera turns a few preferences into:

- a curated seven-day dinner journal;
- estimated grocery cost against budget;
- recipe details and meal swaps;
- a market-style shopping list;
- offline access to the last useful plan.

## Supported Locales

Initial production locales:

- English
- French
- Italian

Initial countries:

- Italy
- France
- United Kingdom
- United States

## Key User Flows

1. Pre-onboarding welcome
   - User sees premium Sera storytelling.
   - User confirms country.
   - User continues into meal planning.

2. Onboarding
   - Returning users who tap "New week" from the dashboard configure the next plan on a dedicated full-screen page, not inside a modal and not through the public welcome flow.
   - Existing sessions should not access the welcome screen; direct `/onboarding` access with an active plan returns to the dashboard.
   - Select grocery shop.
   - Select weekly maximum dinner budget.
   - Select household size.
   - Select meal goal.
   - Select up to three food vibes.
   - Select dietary needs.
   - Select cooking time.
   - Select existing kitchen items.

3. Results
   - User sees weekly dinner plan.
   - User sees estimated total and budget status.
   - User can open meal details, swap meals, save plan, regenerate, or open market list.

4. Shopping list
   - User sees grouped market sections.
   - User checks purchased items.
   - User sees collected, remaining, and total cost.
   - User can export the list.

5. PWA install
   - Android/Chromium users receive install prompt when supported.
   - iOS users receive localized install guidance.
   - Installed app opens quickly with cached shell and offline fallback.

6. Premium
   - Free users hit clear upgrade moments.
   - Stripe checkout handles production subscriptions.
   - Legal pages are available before payment.

## UX Requirements

- Mobile first.
- Primary CTA visible without mandatory scroll on core screens.
- Warm editorial visual system.
- Large typography and restrained copy.
- Motion should feel elegant, not bouncy.
- No generic dashboard feel.
- No AI chatbot framing.

## Technical Requirements

- Preserve DDD / hexagonal architecture.
- Keep files under 300 effective lines.
- Keep complex UI behavior in hooks.
- Keep constants and copy centralized.
- Support EN/FR/IT user-facing copy.
- Preserve anonymous local session data.
- Wait for local session hydration before routing users away from the app shell.
- Cache app shell and last useful plan for offline use.
- Verify TypeScript before release.

## Production Readiness Checklist

- Real OpenAI/OpenRouter generation tested for each country/language.
- Bad JSON repair flow tested.
- Extreme budget values tested.
- Stripe production env configured.
- Stripe webhook writes to durable persistence.
- Legal pages reviewed.
- Mobile QA completed on iPhone and Android.
- PWA install and offline launch tested on real devices.

## Success Metrics

- Onboarding completion rate.
- Meal plan generation success rate.
- Shopping list open rate.
- PWA install rate.
- Week-two return rate.
- Free-to-Pro conversion rate.
