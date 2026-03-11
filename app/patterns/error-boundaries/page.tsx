import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { CodeWithPreview } from '@/components/CodeWithPreview'
import { Callout, InlineCode } from '@/components/ui'
import { ErrorBoundaryDemo } from '@/components/demos/ErrorBoundaryDemo'
import { RelatedContent } from '@/components/RelatedContent'
import { patternRelations } from '@/lib/related-content'

const NAIVE_CODE = `// No boundary - one throw takes down the whole app
function App() {
  return (
    <div>
      <Header />
      <Sidebar />
      <MainContent />   {/* If any child throws, whole tree unmounts */}
      <Footer />
    </div>
  )
}
// User sees blank screen; no way to recover without refresh.`;

const FIRST_IMPROVEMENT_CODE = `// Class component: getDerivedStateFromError + componentDidCatch
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Caught by boundary:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

// Wrap risky sections
<ErrorBoundary fallback={<ErrorMessage onRetry={() => window.location.reload()} />}>
  <MainContent />
</ErrorBoundary>
// One failing widget no longer crashes the whole app.`;

const PRODUCTION_CODE = `// Reusable boundary with retry (reset state so children re-mount)
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: (props: { error: Error; reset: () => void }) => React.ReactNode },
  { error: Error | null }
> {
  state = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logErrorToService(error, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return this.props.fallback({ error: this.state.error, reset: this.reset })
    }
    return this.props.children
  }
}

// Usage: granular boundaries + report
<ErrorBoundary fallback={({ error, reset }) => (
  <div role="alert">
    <p>Something went wrong.</p>
    <button onClick={reset}>Try again</button>
    <button onClick={() => reportToSupport(error)}>Report</button>
  </div>
)}>
  <ExpensiveWidget />
</ErrorBoundary>
// reset() clears error state → boundary re-renders children → they mount fresh.`;

const HOOKS_LIMITATION_CODE = `// Error boundaries must be class components - there is no useErrorBoundary hook (yet).
// React catches errors during render and in lifecycle; hooks run in the same phase,
// so a hook can't "catch" an error and switch to fallback. Use a small class wrapper.`;

export default function ErrorBoundariesPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Error Boundaries
        </h1>
        <p className="text-xl text-content-muted">
          Catch JavaScript errors in the component tree and render a fallback UI so one failing component doesn’t crash the whole app.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          If any component in the tree throws during render (or in a lifecycle method), React unmounts the whole tree and the user sees a blank screen. A single bug in a comment widget or a third-party chart shouldn’t take down the entire page. You need a way to catch errors in a subtree and show a fallback (message + retry) instead of crashing.
        </p>
        <p className="text-content">
          Error boundaries don’t catch errors in event handlers, async code, or server-side rendering. They only catch errors in the rendering phase (and in lifecycle methods of class components). So you still need try/catch and good error handling for async work; boundaries are for render-time failures.
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          No boundary. When a child throws, the error bubbles up and the root unmounts. The user gets a blank screen and has to refresh.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          Wrap risky sections in a class component that implements <InlineCode>getDerivedStateFromError</InlineCode> and <InlineCode>componentDidCatch</InlineCode>. When a child throws, the boundary catches it, sets state, and renders a fallback instead of the children.
        </p>
        <div className="mb-6">
          <CodeWithPreview
            code={FIRST_IMPROVEMENT_CODE}
            lang="tsx"
            codeLabel="Basic ErrorBoundary"
            preview={<ErrorBoundaryDemo />}
            previewLabel="Click “Throw” to trigger the boundary"
            layout="stacked"
          />
        </div>
        <p className="text-content text-sm">
          <strong>Why this helps:</strong> The rest of the app (header, sidebar, footer) stays mounted. The user sees a clear message and can retry or navigate away.
        </p>
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Retry:</strong> To “retry,” the boundary needs to clear its error state so it re-renders the children. Children will remount from scratch, which is usually what you want (e.g. refetch).</li>
          <li><strong>Logging:</strong> In <InlineCode>componentDidCatch</InlineCode>, send the error (and <InlineCode>componentStack</InlineCode>) to your logging service so you can fix the bug.</li>
          <li><strong>Granularity:</strong> One boundary at the root is better than nothing, but boundaries around specific features (widget, route, tab) limit blast radius and let the user keep using the rest of the app.</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          Reusable boundary that stores the caught error and exposes a <InlineCode>reset</InlineCode> callback so the fallback can offer “Try again.” Call <InlineCode>reset()</InlineCode> to set state back to no error; the boundary re-renders and mounts children again. Log in <InlineCode>componentDidCatch</InlineCode>. Place boundaries around route-level or feature-level chunks, not every small component.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />
        <Callout variant="info" title="Why class components?" className="mt-4">
          There is no hook equivalent for error boundaries. React catches errors during the render phase; hooks run in that same phase, so they can’t catch and recover. Use a thin class component that only implements the boundary API.
        </Callout>
        <CodeBlock code={HOOKS_LIMITATION_CODE} lang="tsx" className="mt-4" />
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Use:</strong> Around route-level content, heavy third-party widgets, or any feature that might throw during render (e.g. malformed data, missing required props).</li>
          <li><strong>Root boundary:</strong> Always have at least one boundary near the root so the app never goes completely blank; show a “Something went wrong” page with refresh/retry.</li>
          <li><strong>Don’t over-wrap:</strong> Too many boundaries add complexity. Wrap at natural boundaries (route, tab, major feature), not every list item.</li>
        </ul>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Event handlers:</strong> Errors in <InlineCode>onClick</InlineCode> or <InlineCode>setTimeout</InlineCode> are not caught. Use try/catch and set state (e.g. setError) to show an error UI.</li>
          <li><strong>Async errors:</strong> A rejected promise in useEffect doesn’t get caught by the boundary unless you catch it and call a state setter that triggers a re-render with a throw (not recommended). Prefer handling async errors in state and rendering an error component.</li>
          <li><strong>SSR:</strong> Error boundaries don’t catch errors during server rendering. In Next.js, use the root <InlineCode>error.tsx</InlineCode> and nested ones for client-side and hydration errors.</li>
        </ul>
      </section>

      <p className="text-content-muted text-sm">
        <Link href="/frameworks/rendering-strategy" className="text-primary hover:underline">
          Rendering Strategy →
        </Link>
        {' · '}
        <Link href="/patterns" className="text-primary hover:underline">
          All patterns
        </Link>
      </p>

      <RelatedContent
        items={patternRelations['error-boundaries'].frameworks}
        type="frameworks"
      />
      <RelatedContent
        items={patternRelations['error-boundaries'].deepDives}
        type="deepDives"
      />
    </div>
  )
}
