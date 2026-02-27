/**
 * Cross-link mapping between frameworks, patterns, and deep dives
 * Used to suggest related content throughout the site
 */

export interface RelatedItem {
  href: string;
  title: string;
  description: string;
}

export interface RelatedContent {
  patterns?: RelatedItem[];
  deepDives?: RelatedItem[];
  frameworks?: RelatedItem[];
}

// Frameworks
export const frameworkRelations: Record<string, RelatedContent> = {
  'data-fetching': {
    patterns: [
      { href: '/patterns/cache-invalidation', title: 'Cache Invalidation', description: 'When and how to bust stale data after mutations.' },
      { href: '/patterns/stale-while-revalidate', title: 'Stale While Revalidate', description: 'Serve cached data instantly, refetch in the background.' },
      { href: '/patterns/infinite-scroll', title: 'Infinite Scroll', description: 'Seamlessly load more data as the user scrolls.' },
      { href: '/patterns/polling-vs-websockets', title: 'Polling vs WebSockets', description: 'When to use each strategy for real-time updates.' },
      { href: '/patterns/autosave-draft', title: 'Autosave Draft', description: 'Persist user changes without explicit save buttons.' },
    ],
    deepDives: [
      { href: '/deep-dives/graphql-caching', title: 'GraphQL Caching', description: 'Normalized vs document caching and common pitfalls.' },
      { href: '/deep-dives/useeffect-async-cleanup', title: 'useEffect Async Cleanup', description: 'Race conditions and cancellation tokens in data fetching.' },
    ],
  },
  'state-architecture': {
    patterns: [
      { href: '/patterns/controlled-vs-uncontrolled', title: 'Controlled vs Uncontrolled', description: 'Where does form state live—in React or the DOM?' },
      { href: '/patterns/compound-components', title: 'Compound Components', description: 'Share state implicitly between parent and children.' },
      { href: '/patterns/hocs-vs-composition', title: 'HOCs vs Composition', description: 'Trade-offs between wrapping and prop passing.' },
      { href: '/patterns/dependent-fields', title: 'Dependent Fields', description: 'Update one field based on changes in another.' },
    ],
    deepDives: [
      { href: '/deep-dives/state-machines', title: 'State Machines', description: 'Explicit, bug-proof state transitions.' },
      { href: '/deep-dives/state-management-internals', title: 'State Management Internals', description: 'How Zustand and Redux subscriptions actually work.' },
    ],
  },
  'component-composition': {
    patterns: [
      { href: '/patterns/compound-components', title: 'Compound Components', description: 'Share state implicitly between parent and children.' },
      { href: '/patterns/hocs-vs-composition', title: 'HOCs vs Composition', description: 'Trade-offs between wrapping and prop passing.' },
      { href: '/patterns/render-props-vs-hooks', title: 'Render Props vs Hooks', description: 'Two patterns for reusable component logic.' },
    ],
    deepDives: [
      { href: '/deep-dives/state-machines', title: 'State Machines', description: 'Explicit, bug-proof state transitions.' },
    ],
  },
  'performance-architecture': {
    patterns: [
      { href: '/patterns/memoization', title: 'Memoization', description: 'memo, useMemo, and useCallback to prevent re-renders.' },
      { href: '/patterns/code-splitting-lazy-loading', title: 'Code Splitting & Lazy Loading', description: 'Load code only when needed.' },
      { href: '/patterns/virtualized-lists', title: 'Virtualized Lists', description: 'Render only visible items in large lists.' },
      { href: '/patterns/debouncing-throttling', title: 'Debouncing & Throttling', description: 'Limit expensive operations on fast events.' },
    ],
    deepDives: [],
  },
  'rendering-strategy': {
    patterns: [
      { href: '/patterns/loading-states', title: 'Loading States', description: 'UI patterns for async operations.' },
      { href: '/patterns/error-boundaries', title: 'Error Boundaries', description: 'Graceful fallbacks for component crashes.' },
      { href: '/patterns/code-splitting-lazy-loading', title: 'Code Splitting & Lazy Loading', description: 'Load code only when needed.' },
    ],
    deepDives: [
      { href: '/deep-dives/useeffect-async-cleanup', title: 'useEffect Async Cleanup', description: 'Race conditions and cancellation tokens in data fetching.' },
    ],
  },
  'design-systems': {
    patterns: [
      { href: '/patterns/compound-components', title: 'Compound Components', description: 'Share state implicitly between parent and children.' },
      { href: '/patterns/controlled-vs-uncontrolled', title: 'Controlled vs Uncontrolled', description: 'Design system input flexibility.' },
    ],
    deepDives: [],
  },
  'code-organization': {
    patterns: [
      { href: '/patterns/code-splitting-lazy-loading', title: 'Code Splitting & Lazy Loading', description: 'Load code only when needed.' },
    ],
    deepDives: [],
  },
};

// Patterns - map back to frameworks and deep dives
export const patternRelations: Record<string, RelatedContent> = {
  'cache-invalidation': {
    frameworks: [
      { href: '/frameworks/data-fetching', title: 'Data Fetching & Sync', description: 'When and how data needs to be synchronized.' },
    ],
    deepDives: [
      { href: '/deep-dives/graphql-caching', title: 'GraphQL Caching', description: 'Normalized vs document caching and common pitfalls.' },
    ],
  },
  'stale-while-revalidate': {
    frameworks: [
      { href: '/frameworks/data-fetching', title: 'Data Fetching & Sync', description: 'When and how data needs to be synchronized.' },
    ],
    deepDives: [],
  },
  'infinite-scroll': {
    frameworks: [
      { href: '/frameworks/data-fetching', title: 'Data Fetching & Sync', description: 'When and how data needs to be synchronized.' },
    ],
    deepDives: [],
  },
  'polling-vs-websockets': {
    frameworks: [
      { href: '/frameworks/data-fetching', title: 'Data Fetching & Sync', description: 'When and how data needs to be synchronized.' },
    ],
    deepDives: [],
  },
  'autosave-draft': {
    frameworks: [
      { href: '/frameworks/data-fetching', title: 'Data Fetching & Sync', description: 'When and how data needs to be synchronized.' },
    ],
    deepDives: [],
  },
  'controlled-vs-uncontrolled': {
    frameworks: [
      { href: '/frameworks/state-architecture', title: 'State Architecture', description: 'Where state lives and how it flows.' },
      { href: '/frameworks/design-systems', title: 'Design Systems', description: 'Building flexible, reusable components.' },
    ],
    deepDives: [],
  },
  'compound-components': {
    frameworks: [
      { href: '/frameworks/state-architecture', title: 'State Architecture', description: 'Where state lives and how it flows.' },
      { href: '/frameworks/component-composition', title: 'Component Composition', description: 'Patterns for composing components effectively.' },
      { href: '/frameworks/design-systems', title: 'Design Systems', description: 'Building flexible, reusable components.' },
    ],
    deepDives: [],
  },
  'hocs-vs-composition': {
    frameworks: [
      { href: '/frameworks/state-architecture', title: 'State Architecture', description: 'Where state lives and how it flows.' },
      { href: '/frameworks/component-composition', title: 'Component Composition', description: 'Patterns for composing components effectively.' },
    ],
    deepDives: [],
  },
  'render-props-vs-hooks': {
    frameworks: [
      { href: '/frameworks/component-composition', title: 'Component Composition', description: 'Patterns for composing components effectively.' },
    ],
    deepDives: [],
  },
  'dependent-fields': {
    frameworks: [
      { href: '/frameworks/state-architecture', title: 'State Architecture', description: 'Where state lives and how it flows.' },
    ],
    deepDives: [],
  },
  'memoization': {
    frameworks: [
      { href: '/frameworks/performance-architecture', title: 'Performance Architecture', description: 'Optimize rendering and reduce unnecessary work.' },
    ],
    deepDives: [],
  },
  'code-splitting-lazy-loading': {
    frameworks: [
      { href: '/frameworks/performance-architecture', title: 'Performance Architecture', description: 'Optimize rendering and reduce unnecessary work.' },
      { href: '/frameworks/rendering-strategy', title: 'Rendering Strategy', description: 'Client vs server rendering trade-offs.' },
      { href: '/frameworks/code-organization', title: 'Code Organization', description: 'Structuring large applications.' },
    ],
    deepDives: [],
  },
  'virtualized-lists': {
    frameworks: [
      { href: '/frameworks/performance-architecture', title: 'Performance Architecture', description: 'Optimize rendering and reduce unnecessary work.' },
    ],
    deepDives: [],
  },
  'debouncing-throttling': {
    frameworks: [
      { href: '/frameworks/performance-architecture', title: 'Performance Architecture', description: 'Optimize rendering and reduce unnecessary work.' },
    ],
    deepDives: [],
  },
  'loading-states': {
    frameworks: [
      { href: '/frameworks/rendering-strategy', title: 'Rendering Strategy', description: 'Client vs server rendering trade-offs.' },
    ],
    deepDives: [],
  },
  'error-boundaries': {
    frameworks: [
      { href: '/frameworks/rendering-strategy', title: 'Rendering Strategy', description: 'Client vs server rendering trade-offs.' },
    ],
    deepDives: [],
  },
  'form-validation': {
    frameworks: [
      { href: '/frameworks/state-architecture', title: 'State Architecture', description: 'Where state lives and how it flows.' },
    ],
    deepDives: [],
  },
  'multi-step-forms': {
    frameworks: [
      { href: '/frameworks/state-architecture', title: 'State Architecture', description: 'Where state lives and how it flows.' },
    ],
    deepDives: [],
  },
  'modal-management': {
    frameworks: [
      { href: '/frameworks/state-architecture', title: 'State Architecture', description: 'Where state lives and how it flows.' },
    ],
    deepDives: [],
  },
  'toasts': {
    frameworks: [
      { href: '/frameworks/state-architecture', title: 'State Architecture', description: 'Where state lives and how it flows.' },
    ],
    deepDives: [],
  },
  'drag-and-drop': {
    frameworks: [
      { href: '/frameworks/state-architecture', title: 'State Architecture', description: 'Where optimistic reorder state and rollback logic live.' },
      { href: '/frameworks/performance-architecture', title: 'Performance Architecture', description: 'Combining drag-and-drop with virtualized lists.' },
    ],
    deepDives: [],
  },
};

// Deep Dives - map back to frameworks and patterns
export const deepDiveRelations: Record<string, RelatedContent> = {
  'graphql-caching': {
    frameworks: [
      { href: '/frameworks/data-fetching', title: 'Data Fetching & Sync', description: 'When and how data needs to be synchronized.' },
    ],
    patterns: [
      { href: '/patterns/cache-invalidation', title: 'Cache Invalidation', description: 'When and how to bust stale data after mutations.' },
    ],
  },
  'useeffect-async-cleanup': {
    frameworks: [
      { href: '/frameworks/data-fetching', title: 'Data Fetching & Sync', description: 'When and how data needs to be synchronized.' },
      { href: '/frameworks/rendering-strategy', title: 'Rendering Strategy', description: 'Client vs server rendering trade-offs.' },
    ],
    patterns: [
      { href: '/patterns/loading-states', title: 'Loading States', description: 'UI patterns for async operations.' },
    ],
  },
  'state-machines': {
    frameworks: [
      { href: '/frameworks/state-architecture', title: 'State Architecture', description: 'Where state lives and how it flows.' },
      { href: '/frameworks/component-composition', title: 'Component Composition', description: 'Patterns for composing components effectively.' },
    ],
    patterns: [
      { href: '/patterns/compound-components', title: 'Compound Components', description: 'Share state implicitly between parent and children.' },
    ],
  },
  'state-management-internals': {
    frameworks: [
      { href: '/frameworks/state-architecture', title: 'State Architecture', description: 'Where state lives and how it flows.' },
    ],
    patterns: [
      { href: '/patterns/controlled-vs-uncontrolled', title: 'Controlled vs Uncontrolled', description: 'Where does form state live—in React or the DOM?' },
    ],
  },
};
