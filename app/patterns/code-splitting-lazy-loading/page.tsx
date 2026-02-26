import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'

const NAIVE_CODE = `// Everything in one bundle — heavy initial load
import { HeavyChart } from './HeavyChart'
import { AdminPanel } from './AdminPanel'

function Dashboard() {
  return (
    <div>
      <HeavyChart />
      <AdminPanel />
    </div>
  )
}
// User downloads chart + admin code even if they never open the admin section.`;

const FIRST_IMPROVEMENT_CODE = `// Lazy load the heavy or conditional parts
import { lazy, Suspense } from 'react'

const HeavyChart = lazy(() => import('./HeavyChart'))
const AdminPanel = lazy(() => import('./AdminPanel'))

function Dashboard() {
  return (
    <div>
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <AdminPanel />
      </Suspense>
    </div>
  )
}
// Each lazy() creates a separate chunk; loaded when the component is first rendered.`;

const PRODUCTION_CODE = `// Route-based splitting (Next.js / React Router) + lazy for below-the-fold
// Next.js: pages/routes are code-split by default. For client components:
const Modal = dynamic(() => import('@/components/Modal'), { ssr: false })
const HeavyWidget = dynamic(() => import('@/components/HeavyWidget'), {
  loading: () => <WidgetSkeleton />,
})

// React (no framework): lazy + Suspense at route level
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
<Routes>
  <Route path="/settings" element={<Suspense fallback={<PageSkeleton />}><SettingsPage /></Suspense>} />
</Routes>

// Preload on hover or when likely needed:
const preloadSettings = () => import('./pages/SettingsPage')
<Link to="/settings" onMouseEnter={preloadSettings}>Settings</Link>
// Reduces perceived delay when user clicks.`;

export default function CodeSplittingLazyLoadingPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Code Splitting & Lazy Loading
        </h1>
        <p className="text-xl text-content-muted">
          Split the bundle so the user doesn’t download code they might never need. Lazy-load routes and heavy components with <InlineCode>lazy</InlineCode> + <InlineCode>Suspense</InlineCode> (or framework equivalents) and optionally preload on hover or when likely needed.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          A single JS bundle pulls in every route and every heavy component (charts, editors, admin UI). The initial load is slow, especially on slow networks. You want to load only what’s needed for the first screen and fetch other chunks when the user navigates or when a heavy component is about to be shown.
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          Static imports for everything. The bundler puts it all in one (or few) chunks; the user pays the cost up front even for code that runs only on a specific route or after a click.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          Use <InlineCode>React.lazy</InlineCode> for components that are heavy or conditionally rendered. Wrap them in <InlineCode>Suspense</InlineCode> with a <InlineCode>fallback</InlineCode> so the user sees a placeholder while the chunk loads. Each <InlineCode>{`lazy(() => import(...))`}</InlineCode> becomes a separate chunk that loads on first render.
        </p>
        <CodeBlock code={FIRST_IMPROVEMENT_CODE} lang="tsx" />
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Where to split:</strong> Routes are the obvious boundary (one chunk per route). Also split modals, tabs, and below-the-fold content that may never be seen.</li>
          <li><strong>Preloading:</strong> To reduce delay when the user clicks, preload the chunk on link hover or when a route is likely (e.g. after login, preload dashboard).</li>
          <li><strong>SSR:</strong> <InlineCode>lazy</InlineCode> doesn’t run on the server by default; use framework support (e.g. Next.js <InlineCode>dynamic</InlineCode>) for SSR-safe lazy loading.</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          In Next.js, use <InlineCode>dynamic</InlineCode> for client-only or heavy components; routes are already split. In a React SPA, lazy-load route components and wrap with <InlineCode>Suspense</InlineCode>. Use a skeleton or small spinner as fallback. Optionally preload: call <InlineCode>import('./Page')</InlineCode> on <InlineCode>onMouseEnter</InlineCode> of the link so the chunk is ready when the user clicks.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Routes:</strong> One chunk per route (or per section) so the initial bundle is small.</li>
          <li><strong>Heavy components:</strong> Charts, rich editors, modals that aren’t shown immediately.</li>
          <li><strong>Skip when:</strong> The component is tiny or always visible; the extra request and complexity aren’t worth it.</li>
        </ul>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Default export:</strong> <InlineCode>{`lazy(() => import('./X'))`}</InlineCode> expects the module to have a default export; use <InlineCode>{`lazy(() => import('./X').then(m => ({ default: m.Named })))`}</InlineCode> for named exports.</li>
          <li><strong>Suspense boundary:</strong> The boundary must be above the lazy component; put it at the route or layout level so the fallback shows while the chunk loads.</li>
        </ul>
      </section>

      <p className="text-content-muted text-sm">
        <Link href="/patterns/memoization" className="text-primary hover:underline">
          Memoization →
        </Link>
        {' · '}
        <Link href="/patterns" className="text-primary hover:underline">
          All patterns
        </Link>
      </p>
    </div>
  )
}
