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
- a calmer "what do I do tonight?" experience for tired households.

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
   - Existing users can choose an account path without replaying onboarding.
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
   - Choose whether they batch cook the full week in one session.
   - Select existing kitchen items.

3. Post-onboarding conversion
   - First generated plan opens in a personalized preview.
   - User validates the plan before entering the app.
   - A soft paywall/account prompt appears but is not blocking.
   - Notification opt-in appears immediately after this conversion step.

4. Tonight
   - User opens the app and sees the next practical dinner.
   - User can start cooking, mark the meal cooked, open a quick backup, or access the shopping list.
   - This screen is optimized for low cognitive load after work.

5. Week
   - The week is scheduled from the meal plan creation date, so the current day's meal can be identified clearly.
   - User sees the active week with cooked/planned/skipped statuses.
   - User can drag meals to swap dinners between days.
   - User can mark only today's meal cooked or skipped.
   - Cooked meals cannot be replaced or moved by drag/drop.
   - User can open recipes, access the shopping list, or start a new week.
   - Previous saved weeks are clickable so a user can reopen an older plan.

6. Shopping list
   - User sees grouped market sections.
   - User checks purchased items.
   - User sees collected, remaining, and total cost.
   - User can export the list.
   - In free mode, this is a contextual Pro upsell.

7. Profile
   - User sees demo/account state, can change language/country, and sees default budget, household size, notifications, subscription and legal links.
   - Pro is managed from profile, not as a primary navigation tab.

8. PWA install
   - Android/Chromium users receive install prompt when supported.
   - iOS users receive localized install guidance.
   - Installed app opens quickly with cached shell and offline fallback.

9. Premium
   - Free users hit clear upgrade moments.
   - Creating a new week is a hard Pro gate in the MVP.
   - Full meal details and shopping list are contextual upsells for free users.
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
- Primary navigation should stay simple for tired users: Tonight, Week, Me.
- Shopping list is a secondary flow reachable from Tonight and Week, not a bottom navigation tab.

## Technical Requirements

- Preserve DDD / hexagonal architecture.
- Keep files under 300 effective lines.
- Keep complex UI behavior in hooks.
- Keep constants and copy centralized.
- Support EN/FR/IT user-facing copy.
- Preserve anonymous local session data.
- Wait for local session hydration before routing users away from the app shell.
- Cache app shell and last useful plan for offline use.
- Track cooked/skipped meal execution locally in the MVP.
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
