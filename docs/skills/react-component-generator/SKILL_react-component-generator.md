---
name: react-component-generator
description: >
  Generates React components following the project's established patterns with Tailwind CSS 
  styling. Use when: user says "create component", "build the page for", "add UI for", 
  "frontend for", or when implementing features that need React UI. Generates pages, 
  reusable components, custom hooks, and API client functions. Handles responsive design, 
  state management, error handling, and loading states. Always read existing components 
  first to match patterns — consistency is critical.
---

# React Component Generator

## Purpose

Generate consistent React components following project patterns. Every component includes proper TypeScript typing, all UI states (empty/loading/error/populated), responsive design, and API integration.

## Pre-Generation Checklist

1. **Read existing components** — Match file structure, naming, styling patterns
2. **Check if similar components exist** — Reuse before creating
3. **Verify API endpoints exist** — Or note they need to be created first
4. **Reference wireframe descriptions** — Match the documented layout and behavior
5. **Check shared types** — Reuse existing interfaces for data shapes

## File Generation Order

```
1. packages/web/src/services/[domain]Api.ts   → API client functions
2. packages/web/src/hooks/use[Feature].ts      → Data fetching hook
3. packages/web/src/components/[feature]/      → Reusable components
4. packages/web/src/pages/[Feature]Page.tsx    → Page component
5. packages/web/src/App.tsx                    → Add route
```

## Layer Patterns

### 1. API Client

```typescript
// packages/web/src/services/itemApi.ts
const API_BASE = '/api';

export async function getItems(params?: { page?: number; limit?: number; q?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.q) query.set('q', params.q);

  const res = await fetch(`${API_BASE}/items?${query}`);
  if (!res.ok) throw new Error(`Failed to fetch items: ${res.status}`);
  return res.json();
}

export async function getItem(id: number) {
  const res = await fetch(`${API_BASE}/items/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch item: ${res.status}`);
  return res.json();
}

export async function createItem(data: { name: string; categoryId: number; quantity?: number }) {
  const res = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to create item');
  }
  return res.json();
}
```

### 2. Custom Hook

```typescript
// packages/web/src/hooks/useItems.ts
import { useState, useEffect, useCallback } from 'react';
import { getItems } from '../services/itemApi';

interface UseItemsOptions {
  page?: number;
  limit?: number;
  query?: string;
}

export function useItems(options: UseItemsOptions = {}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getItems(options);
      setData(result.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [options.page, options.limit, options.query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
```

**Hook Rules:**
- Always return `{ data, loading, error, refetch }`
- Use `useCallback` for the fetch function to prevent infinite loops
- Handle errors with try/catch (don't let promises reject unhandled)
- Include dependencies in `useCallback` and `useEffect` arrays
- Type the return data properly

### 3. Reusable Components

```typescript
// packages/web/src/components/items/ItemCard.tsx
interface ItemCardProps {
  item: {
    id: number;
    name: string;
    category: string;
    quantity: number;
  };
  onClick?: (id: number) => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  return (
    <div
      onClick={() => onClick?.(item.id)}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md 
                 transition-shadow cursor-pointer"
    >
      <h3 className="font-semibold text-gray-900">{item.name}</h3>
      <p className="text-sm text-gray-500 mt-1">{item.category}</p>
      <div className="mt-2 text-sm font-medium text-blue-600">
        Qty: {item.quantity}
      </div>
    </div>
  );
}
```

### 4. Page Component (with All States)

```typescript
// packages/web/src/pages/ItemsPage.tsx
import { useState } from 'react';
import { useItems } from '../hooks/useItems';
import { ItemCard } from '../components/items/ItemCard';

export default function ItemsPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const { data, loading, error, refetch } = useItems({ page, query });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Items</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
                           transition-colors text-sm font-medium">
          Add Item
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search items..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          className="w-full md:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* STATE: Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-32 animate-pulse" />
          ))}
        </div>
      )}

      {/* STATE: Error */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 
                       transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* STATE: Empty */}
      {!loading && !error && data?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">No items found</p>
          <p className="text-sm text-gray-400">
            {query ? 'Try a different search term' : 'Add your first item to get started'}
          </p>
        </div>
      )}

      {/* STATE: Populated */}
      {!loading && !error && data?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item: any) => (
            <ItemCard key={item.id} item={item} onClick={(id) => console.log('Navigate to', id)} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### 5. Route Registration

```typescript
// packages/web/src/App.tsx
import ItemsPage from './pages/ItemsPage';

// Inside Routes:
<Route path="/items" element={<ItemsPage />} />
```

## Component Rules

### All States Required
Every component that displays data MUST handle:
1. **Loading** — Skeleton screens (not spinners) for content areas
2. **Empty** — Helpful message + call-to-action
3. **Error** — Error message + Retry button
4. **Populated** — Normal data display

### Styling Rules
- Use Tailwind CSS exclusively (no CSS files, no styled-components)
- Mobile-first: base styles for mobile, `md:` for tablet, `lg:` for desktop
- Use `transition-*` classes for hover/interaction states
- Consistent spacing: `p-4` for card padding, `gap-4` for grids, `mb-6` for sections
- Touch targets: minimum `py-2 px-4` for buttons (≥44px on mobile)

### Accessibility Rules
- All interactive elements have `aria-label` when no visible text
- Form fields have associated `<label>` elements
- Color is not the only indicator (add icons/text for status)
- Keyboard navigation works for all interactive elements
- Focus styles visible (use `focus:ring-2`)

### Responsive Breakpoints
| Breakpoint | Tailwind | Layout |
|------------|----------|--------|
| Mobile | (base) | Single column, full width |
| Tablet | `md:` (768px) | 2 columns, side panels |
| Desktop | `lg:` (1024px) | 3+ columns, full layout |
| Wide | `xl:` (1280px) | Max-width container |
