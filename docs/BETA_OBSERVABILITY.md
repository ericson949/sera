# Beta Observability With PostHog

Sera uses PostHog as the only beta observability tool to avoid adding multiple heavy SDKs.

## Environment Variables

Client:

```bash
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

Server:

```bash
POSTHOG_API_KEY=phc_xxx
POSTHOG_HOST=https://app.posthog.com
```

Use a dedicated PostHog project/key for staging and another for production.

## Captured Events

- `$pageview`
- `$exception`
- `beta_feedback_submitted`
- `feature_flag_checked`
- `beta_test_account_reset`

## Privacy

Sensitive paywall surfaces and feedback textareas use `ph-no-capture`.
The PostHog client is configured with masked inputs for session replay.

## Feature Flags

- `flag-ai-image-generation`
  - Reserved for the async image pipeline.
  - If disabled, image generation should return placeholders.
- `flag-drag-and-drop-v2`
  - Controls interactive inter-day meal dragging on `/week`.

## Staging Helpers

In staging/beta:

- Paywall primary CTA simulates Pro instead of opening Lemon Squeezy.
- The beta feedback floating widget is visible.
- Profile shows "Reinitialiser mon compte de test".
- Reset clears local beta data client-side and logs a server event.
