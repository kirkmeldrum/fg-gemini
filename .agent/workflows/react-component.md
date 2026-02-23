---
description: Generate React components following project patterns with Tailwind CSS, all UI states, and API integration
---

# React Component Generator

## Pre-Checks

1. Read existing components in `packages/web/src/` to match patterns
2. Check if similar components exist — reuse before creating
3. Verify API endpoints exist (or note they need creation first)
4. Check `packages/shared/src/types/` for data shape interfaces

## File Generation Order

1. `packages/web/src/services/[domain]Api.ts` — API client functions
2. `packages/web/src/hooks/use[Feature].ts` — Data fetching hook
3. `packages/web/src/components/[feature]/` — Reusable components
4. `packages/web/src/pages/[Feature]Page.tsx` — Page component
5. `packages/web/src/App.tsx` — Add route

## Required States

Every data-displaying component MUST handle:
1. **Loading** — Skeleton screens (not spinners)
2. **Empty** — Helpful message + CTA button
3. **Error** — Error message + Retry button
4. **Populated** — Normal data display

## Patterns

### API Client
- Use `fetch()` with `/api` prefix (Vite proxy handles it)
- Throw on non-ok responses
- Parse error messages from response body

### Custom Hook
- Return `{ data, loading, error, refetch }`
- Use `useCallback` for fetch function
- Handle errors with try/catch

### Styling Rules
- Tailwind CSS only (no CSS files per component)
- Mobile-first: base → `md:` → `lg:` → `xl:`
- Touch targets: min `py-2 px-4` (≥44px)
- Consistent spacing: `p-4` cards, `gap-4` grids, `mb-6` sections

### Accessibility
- `aria-label` on interactive elements without visible text
- `<label>` elements for form fields
- Color is not the only status indicator
- `focus:ring-2` for focus styles

### Responsive Breakpoints
| Breakpoint | Tailwind | Layout |
|------------|----------|--------|
| Mobile | (base) | Single column |
| Tablet | `md:` (768px) | 2 columns |
| Desktop | `lg:` (1024px) | 3+ columns |
| Wide | `xl:` (1280px) | Max-width container |
