import Link from 'next/link'
import { Database, Layers, Zap, Code2, Search, FileCode } from 'lucide-react'
import { Callout } from '@/components/ui'

/** Implementation patterns with full pages (7-part template) */
const IMPLEMENTATION_PATTERNS = [
  { slug: 'optimistic-updates', name: 'Optimistic Updates', when: 'Instant feedback for likes, follows, toggles', category: 'Data & State' },
  { slug: 'infinite-scroll', name: 'Infinite Scroll', when: 'Feeds, timelines, long lists', category: 'Data & State' },
  { slug: 'debouncing-throttling', name: 'Debouncing & Throttling', when: 'Search, scroll, resize, high-frequency events', category: 'Data & State' },
  { slug: 'form-validation', name: 'Form Validation (Client + Server)', when: 'Signup, checkout, any form with rules', category: 'Forms' },
  { slug: 'loading-states', name: 'Loading States', when: 'Skeletons, spinners, pending vs refetch', category: 'UI' },
  { slug: 'error-boundaries', name: 'Error Boundaries', when: 'Catch render errors, show fallback, retry', category: 'UI' },
  { slug: 'cache-invalidation', name: 'Cache Invalidation', when: 'After mutations, keep cache in sync', category: 'Data & State' },
  { slug: 'polling-vs-websockets', name: 'Polling vs WebSockets', when: 'When to poll, when to push, hybrid', category: 'Data & State' },
  { slug: 'multi-step-forms', name: 'Multi-Step Forms', when: 'Checkout, onboarding, long wizards', category: 'Forms' },
  { slug: 'virtualized-lists', name: 'Virtualized Lists', when: 'Long lists, feeds, tables (500+ rows)', category: 'UI' },
  { slug: 'stale-while-revalidate', name: 'Stale-While-Revalidate', when: 'Show cached data, refresh in background', category: 'Data & State' },
  { slug: 'autosave-draft', name: 'Autosave / Draft', when: 'Editors, long forms, prevent lost work', category: 'Forms' },
  { slug: 'dependent-fields', name: 'Dependent Fields', when: 'Country → city, product → variant, conditional options', category: 'Forms' },
  { slug: 'toasts', name: 'Toasts', when: 'Success/error feedback, non-blocking notifications', category: 'UI' },
  { slug: 'modal-management', name: 'Modal Management', when: 'Dialogs, focus trap, escape, stacking', category: 'UI' },
  { slug: 'compound-components', name: 'Compound Components', when: 'Card.Header, Tabs + panels, flexible structure', category: 'Components' },
  { slug: 'render-props-vs-hooks', name: 'Render Props vs Hooks', when: 'Reuse behavior, inject state into UI', category: 'Components' },
  { slug: 'controlled-vs-uncontrolled', name: 'Controlled vs Uncontrolled', when: 'Forms, inputs, value vs ref', category: 'Components' },
  { slug: 'hocs-vs-composition', name: 'HOCs vs Composition', when: 'Auth guards, wrappers, inject logic', category: 'Components' },
  { slug: 'code-splitting-lazy-loading', name: 'Code Splitting & Lazy Loading', when: 'Smaller bundles, load on demand', category: 'Performance' },
  { slug: 'memoization', name: 'Memoization (useMemo, React.memo)', when: 'Expensive derivations, skip re-renders', category: 'Performance' },
  { slug: 'normalized-state', name: 'Normalized State', when: 'Trees, threads, relational data with O(1) updates', category: 'Data & State' },
]

const patterns = [
  // State Patterns
  {
    category: 'State Management',
    icon: Database,
    items: [
      {
        name: 'Local State',
        when: 'Single component needs data',
        avoid: 'Multiple components coordinate',
        code: 'useState()',
        framework: 'state-architecture',
      },
      {
        name: 'Lifted State',
        when: '2-3 siblings share data',
        avoid: 'Drilling past 4 levels',
        code: 'useState() in parent',
        framework: 'state-architecture',
      },
      {
        name: 'URL State',
        when: 'Shareable/bookmarkable state',
        avoid: 'Sensitive data, high-frequency',
        code: 'useSearchParams()',
        framework: 'state-architecture',
      },
      {
        name: 'Server State',
        when: 'API-driven data',
        avoid: 'Pure UI state',
        code: 'useQuery()',
        framework: 'state-architecture',
      },
      {
        name: 'Global Client State',
        when: 'Complex app-wide coordination',
        avoid: 'Simple parent-child',
        code: 'Zustand/Redux',
        framework: 'state-architecture',
      },
    ],
  },

  // Component Patterns
  {
    category: 'Component Composition',
    icon: Layers,
    items: [
      {
        name: 'Props',
        when: 'Simple parent-child data flow',
        avoid: 'Deep nesting (4+ levels)',
        code: '<Child value={x} />',
        framework: 'component-composition',
      },
      {
        name: 'Render Props',
        when: 'Behavior injection needed',
        avoid: 'Static component structure',
        code: '<DataProvider render={(data) => ...} />',
        framework: 'component-composition',
      },
      {
        name: 'Compound Components',
        when: 'Flexible internal structure',
        avoid: 'Simple single-use components',
        code: '<Select><Option />...</Select>',
        framework: 'component-composition',
      },
      {
        name: 'Headless Pattern',
        when: 'Full styling control needed',
        avoid: 'Consistent design system',
        code: 'useSelect() hook + your markup',
        framework: 'component-composition',
      },
    ],
  },

  // Data Fetching Patterns
  {
    category: 'Data Fetching',
    icon: Zap,
    items: [
      {
        name: 'Basic Fetch',
        when: 'Simple one-time data load',
        avoid: 'Needs caching or refetch',
        code: 'useEffect + fetch',
        framework: 'data-fetching',
      },
      {
        name: 'React Query',
        when: 'API data with caching',
        avoid: 'Pure UI state',
        code: 'useQuery()',
        framework: 'data-fetching',
      },
      {
        name: 'Optimistic Updates',
        when: 'Instant user feedback',
        avoid: 'Critical data accuracy',
        code: 'useMutation with onMutate',
        framework: 'data-fetching',
      },
      {
        name: 'WebSocket Sync',
        when: 'Real-time collaboration',
        avoid: 'Infrequent updates',
        code: 'useWebSocket()',
        framework: 'data-fetching',
      },
    ],
  },

  // Rendering Patterns
  {
    category: 'Rendering Strategy',
    icon: Code2,
    items: [
      {
        name: 'CSR (SPA)',
        when: 'Highly interactive, no SEO',
        avoid: 'Need first-paint speed',
        code: 'Pure React app',
        framework: 'rendering-strategy',
      },
      {
        name: 'SSR',
        when: 'SEO + dynamic content',
        avoid: 'Static content',
        code: 'getServerSideProps',
        framework: 'rendering-strategy',
      },
      {
        name: 'SSG',
        when: 'Static content, known paths',
        avoid: 'Dynamic user data',
        code: 'getStaticProps',
        framework: 'rendering-strategy',
      },
      {
        name: 'ISR',
        when: 'Static + periodic updates',
        avoid: 'Real-time requirements',
        code: 'revalidate: 60',
        framework: 'rendering-strategy',
      },
    ],
  },
]

export default function PatternsPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-content">Pattern Browser</h1>
        <p className="text-content-muted">
          Quick reference guide to all patterns. Framework-level patterns link to the full framework; implementation patterns have dedicated pages with the full 7-part template (problem → naive → improvement → production → when to use → gotchas).
        </p>
        <div className="mt-2 text-sm flex items-center gap-2 text-content-muted">
          <Search size={16} />
          Search coming soon
        </div>
      </div>

      {/* Implementation patterns: full pages */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <FileCode size={24} className="text-primary" />
          <h2 className="text-2xl font-bold text-content">Implementation Patterns</h2>
        </div>
        <p className="text-content-muted mb-4 text-sm">
          Deep-dive pages: problem, naive approach, first improvement, remaining issues, production pattern, when I use this, gotchas.
        </p>
        <div className="grid gap-4">
          {IMPLEMENTATION_PATTERNS.map((p) => (
            <Link
              key={p.slug}
              href={`/patterns/${p.slug}`}
              className="block border border-content-border rounded-lg p-4 transition-all group hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 group-hover:underline text-primary">
                    {p.name}
                  </h3>
                  <p className="text-sm text-content-muted">Use when: {p.when}</p>
                  <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded bg-code-bg text-content-muted">
                    {p.category}
                  </span>
                </div>
                <span className="text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Read full pattern →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="space-y-12">
        {patterns.map((category) => {
          const Icon = category.icon
          return (
            <section key={category.category}>
              <div className="flex items-center gap-3 mb-6">
                <Icon size={24} className="text-primary" />
                <h2 className="text-2xl font-bold text-content">{category.category}</h2>
              </div>

              <div className="grid gap-4">
                {category.items.map((pattern) => (
                  <Link
                    key={pattern.name}
                    href={`/frameworks/${pattern.framework}#${pattern.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block border border-content-border rounded-lg p-4 transition-all group hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2 group-hover:underline text-primary">
                          {pattern.name}
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4 text-sm mb-3 text-content-muted">
                          <div>
                            <div className="font-medium mb-1 text-content">Use when:</div>
                            <div>{pattern.when}</div>
                          </div>
                          <div>
                            <div className="font-medium mb-1 text-content">Avoid when:</div>
                            <div>{pattern.avoid}</div>
                          </div>
                        </div>

                        <div className="rounded px-3 py-2 inline-block bg-code-bg">
                          <code className="text-xs text-sidebar-text">{pattern.code}</code>
                        </div>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-4 text-primary">
                        <span className="text-sm">View →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* Quick Decision Trees */}
      <section className="mt-16 border-t border-content-border pt-12">
        <h2 className="text-2xl font-bold mb-6 text-content">Quick Decision Trees</h2>

        <div className="space-y-8">
          <div className="border border-content-border rounded-lg p-6 bg-content-bg">
            <h3 className="font-bold mb-4 text-content">State: Where should this data live?</h3>
            <div className="font-mono text-sm space-y-2 text-content-muted">
              <div>Q: Where is data accessed?</div>
              <div className="ml-4">├─ One component → <span className="font-bold text-primary">Local State</span></div>
              <div className="ml-4">├─ 2-3 siblings → <span className="font-bold text-primary">Lifted State</span></div>
              <div className="ml-4">├─ Needs URL? → <span className="font-bold text-primary">URL State</span></div>
              <div className="ml-4">├─ From API? → <span className="font-bold text-primary">Server State</span></div>
              <div className="ml-4">└─ Complex app-wide → <span className="font-bold text-primary">Global State</span></div>
            </div>
          </div>

          <div className="border border-content-border rounded-lg p-6 bg-content-bg">
            <h3 className="font-bold mb-4 text-content">Components: How should they communicate?</h3>
            <div className="font-mono text-sm space-y-2 text-content-muted">
              <div>Q: What&apos;s the relationship?</div>
              <div className="ml-4">├─ Parent-child → <span className="font-bold text-primary">Props</span></div>
              <div className="ml-4">├─ Need behavior injection → <span className="font-bold text-primary">Render Props</span></div>
              <div className="ml-4">├─ Flexible structure → <span className="font-bold text-primary">Compound Components</span></div>
              <div className="ml-4">└─ Full styling control → <span className="font-bold text-primary">Headless Pattern</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Anti-Pattern Quick Reference */}
      <section className="mt-16 border-t border-content-border pt-12">
        <h2 className="text-2xl font-bold mb-6 text-content">Common Anti-Patterns</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <Callout variant="warning" title="❌ Context for High-Frequency">
            <p className="mb-1">Using Context for data that updates on every keystroke causes entire tree to re-render.</p>
            <p className="text-xs opacity-80">Fix: Use Zustand with selectors or keep state local</p>
          </Callout>

          <Callout variant="warning" title="❌ Manual API State">
            <p className="mb-1">Managing loading/error/data state manually with useEffect.</p>
            <p className="text-xs opacity-80">Fix: Use React Query for all API data</p>
          </Callout>

          <Callout variant="warning" title="❌ Premature Global State">
            <p className="mb-1">Adding Redux/Zustand before feeling pain of prop drilling.</p>
            <p className="text-xs opacity-80">Fix: Start local, lift when it actually hurts</p>
          </Callout>

          <Callout variant="warning" title="❌ URL for UI Chrome">
            <p className="mb-1">Putting sidebar/modal state in URL when it&apos;s not shareable.</p>
            <p className="text-xs opacity-80">Fix: Use local state or localStorage for UI preferences</p>
          </Callout>
        </div>
      </section>
    </div>
  )
}
