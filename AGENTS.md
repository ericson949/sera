<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
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

## File Size & Component Design

- No source file should exceed 300 effective lines.
- If a file approaches 300 lines, split it before adding more behavior.
- Prefer small reusable components over large page-level components.
- Page files should compose components and orchestrate layout, not hold complex logic.
- Complex UI behavior belongs in custom hooks.
- Reusable UI state and interaction logic should be extracted to `use*` hooks.

## Shared Constants & Copy

- Centralize constants in `src/shared` or the relevant domain value object.
- Do not duplicate country lists, copy dictionaries, route names, storage keys, or design tokens across files.
- Internationalized user-facing copy should go through the shared i18n layer.
- Keep app-wide design tokens in `globals.css` / shared style utilities.

## Implementation Discipline

- Favor incremental, product-oriented changes.
- Avoid broad refactors unless needed for the requested product change.
- Keep components mobile-first and PWA-friendly.
- Preserve Sera's warm premium design system and motion-first onboarding style.
<!-- END:sera-agent-rules -->
