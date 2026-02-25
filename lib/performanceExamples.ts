/**
 * Performance Architecture progressive examples.
 * Five escalating optimizations for the same product dashboard.
 */
export const performanceExamples = [
  {
    id: '01-baseline',
    title: 'Example 1: The Baseline',
    subtitle: 'Understand what you\'re working with before optimizing anything',
    complexity: 'Essential',
  },
  {
    id: '02-code-splitting',
    title: 'Example 2: Code Splitting',
    subtitle: 'Ship only the code the current page needs',
    complexity: 'Common',
  },
  {
    id: '03-memoization',
    title: 'Example 3: Memoization',
    subtitle: 'Stop re-rendering components that haven\'t changed',
    complexity: 'Intermediate',
  },
  {
    id: '04-virtualization',
    title: 'Example 4: Virtualization',
    subtitle: 'Render only what\'s visible — not all 10,000 rows',
    complexity: 'Advanced',
  },
  {
    id: '05-streaming',
    title: 'Example 5: Streaming & Suspense',
    subtitle: 'Show something instantly, stream the rest progressively',
    complexity: 'Production',
  },
]

export const PERFORMANCE_VISUAL_LABELS: Record<string, string> = {
  '01-baseline': 'Measure',
  '02-code-splitting': 'Split',
  '03-memoization': 'Memo',
  '04-virtualization': 'Virtual',
  '05-streaming': 'Stream',
}

export const performanceExampleContent: Record<
  string,
  { description: string; code: string; explanation: string; whenThisBreaks: string }
> = {
  '01-baseline': {
    description:
      'Before optimizing anything, you need a baseline. What does your bundle actually weigh? Where are the slow renders? Which routes cause layout shifts? Without measuring, you\'re guessing — and you\'ll optimize the wrong things.',
    code: `// Step 1: Measure your bundle
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer({})

// Run: ANALYZE=true pnpm build
// Look for: large node_modules, duplicate packages, unexpected chunks

// Step 2: Add Web Vitals reporting
// app/layout.tsx
export function reportWebVitals(metric) {
  // LCP  — Largest Contentful Paint: when main content appears (<2.5s good)
  // FID  — First Input Delay: response to first interaction (<100ms good)
  // CLS  — Cumulative Layout Shift: visual stability (<0.1 good)
  // INP  — Interaction to Next Paint: response to all interactions
  // TTFB — Time to First Byte: server response time
  console.log(metric)
  // Send to your analytics: analytics.track(metric.name, metric.value)
}

// Step 3: Profile with React DevTools
// Enable "Highlight updates when components render"
// Record a Flamegraph while interacting
// Look for: components that re-render on every keystroke,
//           large subtrees re-rendering from a single state change`,
    explanation: `Measurement is the first optimization.

Without a baseline, you don't know if your changes actually improved anything — or made it worse.

The three tools cover different layers:
• Bundle Analyzer → network cost (JS to download)  
• Web Vitals → user-perceived performance (real timing)
• React Profiler → render performance (wasted work)

Run these before touching a single line of optimization code.`,
    whenThisBreaks: `Measurement overhead in production.

Web Vitals reporting adds a small amount of code. In most apps this is worth it, but for micro-optimized landing pages, use a sampling strategy — report only ~10% of sessions.

React DevTools profiling is a development-only tool. Never ship with the profiler active.`,
  },

  '02-code-splitting': {
    description:
      'The fastest code is code that\'s never downloaded. Code splitting breaks your bundle into smaller chunks that are loaded on demand — when the user navigates to that route or triggers that feature. In a Next.js app, routes split automatically. But heavy components like charts, rich text editors, and modals need manual splitting.',
    code: `// ✅ Route-level splitting: automatic in Next.js App Router
// Each page.tsx becomes its own chunk. Users don't download
// the dashboard code when they're on the landing page.

// ✅ Component-level splitting: dynamic imports
import dynamic from 'next/dynamic'

// Heavy chart library: ~80KB. Only load when user reaches analytics.
const RevenueChart = dynamic(() => import('./RevenueChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,  // charts don't need SSR
})

// Rich text editor: ~200KB. Only load when user clicks "Edit".
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  loading: () => <div>Loading editor...</div>,
})

// ✅ Lazy load below-the-fold content
import { lazy, Suspense } from 'react'
const ActivityFeed = lazy(() => import('./ActivityFeed'))

export default function Dashboard() {
  return (
    <div>
      <DashboardHeader />      {/* Always loaded */}
      <KeyMetrics />           {/* Always loaded */}
      <RevenueChart />         {/* Loaded on demand, above fold */}

      <Suspense fallback={<FeedSkeleton />}>
        <ActivityFeed />       {/* Loaded lazily, below fold */}
      </Suspense>
    </div>
  )
}

// ❌ Don't split every small component — chunk overhead adds up
// A 2KB component in its own chunk costs more (HTTP overhead)
// than just including it in the main bundle.
// Rule of thumb: only split chunks > ~30KB`,
    explanation: `Code splitting is the highest-leverage network optimization.

In a typical React app, the main bundle includes everything: charts, editors, admin panels, and modals that 90% of users never touch. Every user pays the download cost for every feature.

Dynamic imports let users pay only for what they actually use.

Next.js App Router gives you route-level splitting for free. Manual splitting with dynamic() handles the rest — modals, heavy third-party libraries, and below-the-fold content.`,
    whenThisBreaks: `Too many small chunks.

If you split every component, you end up with hundreds of tiny HTTP requests. Each request has overhead (DNS, TCP, TLS, HTTP headers). A 100-chunk app can be slower than a 10-chunk app even if the total bytes are the same.

Also watch for: splitting a component that's used on every page. If RevenueChart appears on 8 different pages, it'll be downloaded 8 times on first visit.

Measure first — check if your target users are on fast connections before aggressively splitting.`,
  },

  '03-memoization': {
    description:
      'React re-renders a component whenever its parent re-renders — even if the component\'s props haven\'t changed. In a large tree, one state change at the top can trigger hundreds of wasted renders. React.memo breaks this cascade by memoizing a component\'s output: if the props are the same as last time, React reuses the previous render.',
    code: `// The problem: parent state change cascades down
function Dashboard() {
  const [filter, setFilter] = useState('all')

  return (
    <>
      <FilterBar filter={filter} onChange={setFilter} />
      <MetricsPanel />       {/* Re-renders when filter changes — why? */}
      <RevenueChart />       {/* Re-renders when filter changes — why? */}
      <ActivityFeed />       {/* Re-renders when filter changes — why? */}
    </>
  )
}

// ✅ Wrap expensive components that don't depend on changed state
const MetricsPanel = memo(function MetricsPanel() {
  return <ExpensiveMetricsCalculation />
})

const RevenueChart = memo(function RevenueChart({ data }) {
  // Only re-renders when data changes, not when filter changes
  return <ChartLibrary data={data} />
})

// ✅ Memoize expensive calculations
function ProductList({ products, sortBy }) {
  // Without useMemo: re-sorts 10,000 items on every render
  const sorted = useMemo(
    () => [...products].sort((a, b) => compareBy(a, b, sortBy)),
    [products, sortBy]  // only re-sort when these change
  )
  return sorted.map(p => <ProductCard key={p.id} product={p} />)
}

// ✅ Stable callbacks prevent memo from being bypassed
function FilterBar({ filter, onChange }) {
  // Without useCallback: new function reference on every render
  // → RevenueChart thinks props changed → memo is bypassed
  const handleChange = useCallback(
    (value) => onChange(value),
    [onChange]
  )
  return <Select value={filter} onChange={handleChange} />
}

// ⚠️  React Compiler (React 19+) makes this mostly automatic.
// If you're on React 19+, the compiler applies memo() semantics
// automatically. You won't need to write memo/useCallback manually.`,
    explanation: `memo() stops re-render cascades at component boundaries.

The key insight: React re-renders by default propagate down the entire subtree. memo() creates a boundary — React checks "did the props change?" before re-rendering. If they didn't, the whole subtree is skipped.

This is especially valuable for:
• Expensive computations (charts, data tables)
• Deep component trees where state changes at the top
• Components that receive the same props but have a parent that frequently re-renders

React Compiler (React 19+) applies these optimizations automatically — it understands your component's dependencies better than manual memo() calls.`,
    whenThisBreaks: `Object and function props break referential equality.

memo() compares props with Object.is (===). A new object literal {} is never === to another {}, even if they have the same contents. If a parent passes an inline object or arrow function as a prop, memo() is bypassed on every render.

The fix: move objects/arrays outside the component, or wrap them with useMemo/useCallback. But this is the exact kind of manual work React Compiler eliminates — it tracks dependencies at the AST level.

Don't memo() everything. For cheap components (a simple <div>), the memo() overhead exceeds the benefit. Profile first.`,
  },

  '04-virtualization': {
    description:
      'Rendering 10,000 items creates 10,000 DOM nodes — even if the user can only see 20 of them. Virtualization solves this by rendering only the visible rows (plus a small buffer). As the user scrolls, DOM nodes are recycled: offscreen nodes are removed, incoming nodes are created. The DOM stays small regardless of data size.',
    code: `// ❌ Naive list: creates 10,000 DOM nodes
function ProductCatalog({ products }) {
  // products.length = 10,000
  return (
    <div>
      {products.map(p => (
        <ProductRow key={p.id} product={p} />
      ))}
    </div>
  )
}

// ✅ Virtualized list: always ~20 DOM nodes
import { FixedSizeList as List } from 'react-window'

function ProductCatalog({ products }) {
  return (
    <List
      height={600}         // visible container height (px)
      itemCount={products.length}
      itemSize={72}        // row height (px)
      width="100%"
    >
      {({ index, style }) => (
        // style contains the absolute positioning — required
        <div style={style}>
          <ProductRow product={products[index]} />
        </div>
      )}
    </List>
  )
}

// ✅ Variable-height rows: use VariableSizeList
import { VariableSizeList } from 'react-window'

// ✅ Grids: use FixedSizeGrid
import { FixedSizeGrid as Grid } from 'react-window'

// ✅ With overscan: renders extra rows above/below viewport
// Prevents blank flashes during fast scrolling
<List overscanCount={5} ... />

// ✅ Memoize row components to prevent re-renders while scrolling
const ProductRow = memo(({ product }) => (
  <div className="flex items-center gap-4 p-4 border-b">
    <img src={product.image} alt={product.name} />
    <span>{product.name}</span>
    <span>{product.price}</span>
  </div>
))`,
    explanation: `Virtualization keeps the DOM size constant.

A 10,000-item list without virtualization:
• 10,000 DOM nodes created immediately
• Layout engine measures all 10,000
• Memory: ~50MB for complex row components
• Initial paint: 800ms+ on mid-range devices

A 10,000-item virtualized list:
• ~20-30 DOM nodes at any time
• Initial paint: same as a 20-item list
• Memory: constant regardless of list size

react-window is the standard library. react-virtual is a newer alternative with more flexibility for dynamic content.`,
    whenThisBreaks: `Variable heights and dynamic content.

FixedSizeList requires knowing the row height upfront. If rows have dynamic content (variable text, expandable sections), you need VariableSizeList with a height-estimating function — which is significantly more complex.

Also: virtualization breaks accessibility patterns. Screen readers expect all content to be in the DOM. For a11y-critical lists, consider pagination instead.

For short lists (< 100 items), virtualization adds complexity without benefit. Use a cutoff: start virtualizing above ~500 items.`,
  },

  '05-streaming': {
    description:
      'Traditional SSR is all-or-nothing: the server waits for all data before sending any HTML. If one slow query takes 800ms, the user sees nothing for 800ms. Streaming flips this: the server sends HTML progressively as data becomes ready. The user sees the page shell instantly, then watches it fill in — the same total data, but dramatically better perceived performance.',
    code: `// Traditional SSR: all-or-nothing
// Server waits for ALL data before sending ANY HTML
async function Dashboard() {
  const [user, metrics, orders, feed] = await Promise.all([
    getUser(),          // 50ms
    getMetrics(),       // 200ms
    getRecentOrders(),  // 150ms
    getActivityFeed(),  // 800ms  ← BOTTLENECK: everything waits for this
  ])
  // User sees nothing for 800ms
  return <DashboardLayout user={user} metrics={metrics} ... />
}

// ✅ Streaming: send HTML progressively
import { Suspense } from 'react'

// app/dashboard/page.tsx (Next.js App Router)
export default async function Dashboard() {
  // Fast data: fetched in the component, doesn't block the page shell
  const user = await getUser()  // 50ms — needed for shell

  return (
    <DashboardShell user={user}>

      {/* Streams in at ~200ms — doesn't wait for feed */}
      <Suspense fallback={<MetricsSkeleton />}>
        <Metrics />
      </Suspense>

      {/* Streams in at ~150ms */}
      <Suspense fallback={<OrdersSkeleton />}>
        <RecentOrders />
      </Suspense>

      {/* Streams in at ~800ms — but doesn't block anything else */}
      <Suspense fallback={<FeedSkeleton />}>
        <ActivityFeed />
      </Suspense>

    </DashboardShell>
  )
}

// Each async component fetches its own data
async function Metrics() {
  const data = await getMetrics()   // 200ms — fetched in parallel
  return <MetricsPanel data={data} />
}

async function ActivityFeed() {
  const data = await getActivityFeed()  // 800ms — isolated
  return <FeedList data={data} />
}

// Result:
// 0ms   → Page shell + user header visible
// 150ms → Recent orders appear
// 200ms → Metrics panel appears
// 800ms → Activity feed appears
// User perceives a 150ms page, not an 800ms page`,
    explanation: `Streaming decouples render time from data time.

The key insight: users don't care that all data loaded — they care that the page feels fast. Streaming exploits this by showing a meaningful shell immediately and progressively filling it in.

Before streaming: perceived load = slowest query (800ms)
After streaming: perceived load = shell render time (~0ms)

This is a React Server Components + Suspense feature. The server uses HTTP chunked transfer encoding to stream HTML fragments as they complete.

Each Suspense boundary is an independent loading unit. They all fetch in parallel — the 200ms query doesn't wait for the 800ms query.`,
    whenThisBreaks: `Cumulative Layout Shift (CLS).

Streaming skeletons that have wrong dimensions cause layout shift when real content loads. This tanks your CLS score and feels jarring.

Fix: make skeleton dimensions match real content dimensions. Use fixed heights on skeleton elements, not auto heights.

Also: over-segmenting with Suspense. If you wrap every single component in Suspense, the page looks like it's "loading" in 50 different places at once. Group related content under a single Suspense boundary.`,
  },
}
