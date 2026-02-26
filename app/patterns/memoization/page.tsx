import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'

const NAIVE_CODE = `// Expensive computation and new object on every render — children re-render
function Parent({ items }: { items: Item[] }) {
  const sorted = items.slice().sort((a, b) => a.name.localeCompare(b.name))
  const config = { theme: 'dark', pageSize: 10 }

  return (
    <div>
      <ExpensiveList items={sorted} config={config} />
    </div>
  )
}
// sorted and config are new references every time; ExpensiveList may re-render or re-run heavy logic even when items/config didn't change.`;

const FIRST_IMPROVEMENT_CODE = `// useMemo: stable reference when deps unchanged; memo: skip re-render when props equal
const sorted = useMemo(
  () => items.slice().sort((a, b) => a.name.localeCompare(b.name)),
  [items]
)
const config = useMemo(() => ({ theme: 'dark', pageSize: 10 }), [])

const ExpensiveList = memo(function ExpensiveList({ items, config }: Props) {
  // ...
})

return <ExpensiveList items={sorted} config={config} />
// Parent re-renders: sorted and config keep same reference if deps unchanged; memo skips re-rendering ExpensiveList.`;

const PRODUCTION_CODE = `// When to use each
// useMemo: expensive derivation, or stable reference for dependency arrays / child props
const derived = useMemo(() => computeExpensive(a, b), [a, b])
const stableObj = useMemo(() => ({ id: x }), [x])  // so child receiving stableObj doesn't re-render

// useCallback: stable function for child props or effect deps
const handleClick = useCallback(() => doSomething(id), [id])

// React.memo: pure presentational component that gets same props often
const Row = memo(function Row({ item }: { item: Item }) {
  return <tr>...</tr>
})
// Don't memo everything: measure first. Memo has cost (comparison); use when parent re-renders often and child is expensive.`;

export default function MemoizationPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Memoization (useMemo, React.memo)
        </h1>
        <p className="text-xl text-content-muted">
          Avoid redundant work and unnecessary re-renders: <InlineCode>useMemo</InlineCode> for expensive or referentially-sensitive values, <InlineCode>useCallback</InlineCode> for stable callbacks, <InlineCode>React.memo</InlineCode> for components that should skip re-render when props are equal.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          When a parent re-renders, it recreates objects and arrays and runs expensive derivations. Children receive new references and re-render even when the logical data didn’t change. You want to stabilize values (so dependency arrays and child props don’t churn) and skip re-rendering heavy children when their props are unchanged.
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          Compute derived data and create objects inline every render. Pass them as props; the child re-renders every time because references change. No memoization.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          Wrap expensive or referentially-sensitive values in <InlineCode>useMemo</InlineCode> with correct dependencies so they only change when deps change. Wrap presentational components in <InlineCode>React.memo</InlineCode> so they re-render only when props are not equal (shallow compare).
        </p>
        <CodeBlock code={FIRST_IMPROVEMENT_CODE} lang="tsx" />
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>When to memo:</strong> Not everywhere—memo has a cost (prop comparison). Use when the parent re-renders often and the child is expensive, or when you need a stable reference for <InlineCode>useEffect</InlineCode> / <InlineCode>useMemo</InlineCode> deps.</li>
          <li><strong>useCallback:</strong> For callbacks passed to memoized children, use <InlineCode>useCallback</InlineCode> so the function reference is stable; otherwise the child sees a new prop every time.</li>
          <li><strong>Dependency array:</strong> Wrong deps can cause stale values or unnecessary recomputation; keep deps accurate.</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          Use <InlineCode>useMemo</InlineCode> for: expensive derivations, or objects/arrays passed to memoized children (so the reference is stable). Use <InlineCode>useCallback</InlineCode> for handlers passed to memoized children or listed in effect deps. Use <InlineCode>React.memo</InlineCode> on leaf or list-item components that are expensive and receive stable props. Don’t memo by default—profile first; add memoization where you measure a real win.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>useMemo:</strong> Heavy computation (filter/sort of large list, complex derived state), or when you need a stable object/array for a dependency array or for a child that is memoized.</li>
          <li><strong>useCallback:</strong> Event handlers or callbacks passed to memoized children, or used in <InlineCode>useEffect</InlineCode> / <InlineCode>useMemo</InlineCode> deps.</li>
          <li><strong>React.memo:</strong> List rows, heavy presentational components, when the parent re-renders often and props are often unchanged.</li>
        </ul>
        <Callout variant="info" title="React Compiler" className="mt-4">
          The React Compiler (when enabled) can auto-memoize components and values; in that world you rely less on manual <InlineCode>useMemo</InlineCode> / <InlineCode>useCallback</InlineCode> / <InlineCode>memo</InlineCode>. Until then, apply these patterns where profiling shows benefit.
        </Callout>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Shallow compare:</strong> <InlineCode>React.memo</InlineCode> does shallow comparison; if you pass an object or array created inline, the reference changes every time and memo doesn’t help. Stabilize with <InlineCode>useMemo</InlineCode> or <InlineCode>useCallback</InlineCode>.</li>
          <li><strong>Over-memoizing:</strong> Wrapping every component and every value adds comparison cost and complexity. Use for hot paths and expensive subtrees.</li>
        </ul>
      </section>

      <p className="text-content-muted text-sm">
        <Link href="/patterns/code-splitting-lazy-loading" className="text-primary hover:underline">
          Code Splitting →
        </Link>
        {' · '}
        <Link href="/patterns" className="text-primary hover:underline">
          All patterns
        </Link>
      </p>
    </div>
  )
}
