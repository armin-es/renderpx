import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { CodeWithPreview } from '@/components/CodeWithPreview'
import { Callout, InlineCode } from '@/components/ui'
import { DebounceSearchDemo } from '@/components/demos/DebounceSearchDemo'

const NAIVE_CODE = `// Search on every keystroke — N requests for N characters
function SearchBox() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    if (!query.trim()) return
    fetch(\`/api/search?q=\${query}\`)
      .then(r => r.json())
      .then(setResults)
  }, [query])  // Runs on every key press

  return (
    <>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <Results list={results} />
    </>
  )
}
// Typing "react hooks" = 11 requests; responses can arrive out of order.`;

const DEBOUNCE_CODE = `// Wait for the user to pause typing, then run once
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debouncedValue
}

function SearchBox() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const { data: results } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => fetch(\`/api/search?q=\${debouncedQuery}\`).then(r => r.json()),
    enabled: debouncedQuery.length >= 2,
  })

  return (
    <>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <Results list={results ?? []} />
    </>
  )
}
// "react hooks" → one request, 300ms after last key.`;

const THROTTLE_CODE = `// Run at most once per interval (e.g. scroll handler)
function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastRun = useRef(Date.now())

  useEffect(() => {
    const elapsed = Date.now() - lastRun.current
    if (elapsed >= interval) {
      lastRun.current = Date.now()
      setThrottledValue(value)
      return
    }
    const id = setTimeout(() => {
      lastRun.current = Date.now()
      setThrottledValue(value)
    }, interval - elapsed)
    return () => clearTimeout(id)
  }, [value, interval])

  return throttledValue
}

// Use for: scroll position, resize, mousemove — limit how often you update state or run logic.`;

const PRODUCTION_DEBOUNCE_CODE = `// Production: cancel in-flight request when query changes (React Query does this)
// Plus: abort previous fetch in the queryFn if you use raw fetch
function searchApi(query: string, signal?: AbortSignal) {
  return fetch(\`/api/search?q=\${encodeURIComponent(query)}\`, { signal })
    .then(r => r.json())
}

function SearchBox() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const { data, isPending } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: ({ signal }) => searchApi(debouncedQuery, signal),
    enabled: debouncedQuery.length >= 2,
  })

  return (
    <>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {isPending && <Spinner />}
      <Results list={data ?? []} />
    </>
  )
}
// React Query cancels the previous request when queryKey changes; no stale results.`;

export default function DebouncingThrottlingPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Debouncing & Throttling
        </h1>
        <p className="text-xl text-content-muted">
          Limit how often expensive or network-bound logic runs when the user (or the browser) fires events rapidly.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          Search boxes that hit the API on every keystroke, scroll handlers that run 60 times per second, resize handlers that recompute layout on every pixel—all of that wastes requests, clogs the main thread, and can leave the UI showing stale or out-of-order results. You need to slow down the reaction to high-frequency events without making the UI feel unresponsive.
        </p>
        <p className="text-content">
          <strong>Debounce:</strong> run after the user (or event source) has been quiet for a period (e.g. 300ms after last keystroke). <strong>Throttle:</strong> run at most once per period (e.g. scroll handler runs at most every 100ms). Same idea—reduce frequency—different timing model.
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          Run the effect (or handler) on every change. For search, that’s one request per character; for scroll, dozens per second.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          Debounce the value: derive a “stable” value that only updates after the user has stopped typing for <InlineCode>delay</InlineCode> ms. Use that for the API call. Same pattern works for any high-frequency input (e.g. filter inputs).
        </p>
        <div className="mb-6">
          <CodeWithPreview
            code={DEBOUNCE_CODE}
            lang="tsx"
            codeLabel="useDebounce + useQuery"
            preview={<DebounceSearchDemo />}
            previewLabel="Type quickly — request fires after you pause"
            layout="stacked"
          />
        </div>
        <p className="text-content text-sm">
          <strong>Why this helps:</strong> One request per “burst” of typing. Fewer network calls, and you avoid the race where an older response overwrites a newer one if you don’t cancel in-flight requests (React Query does that when <InlineCode>queryKey</InlineCode> changes).
        </p>
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Scroll/resize:</strong> For scroll or resize, debounce can feel laggy (nothing happens until you stop). Throttle is better: run at most every N ms so the UI updates periodically while the user scrolls.</li>
          <li><strong>Leading vs trailing:</strong> Debounce is usually “trailing” (after pause). You can also do “leading” (run immediately, then ignore for delay). Throttle often uses “leading” so the first event runs right away.</li>
          <li><strong>Abort in-flight requests:</strong> When the debounced value changes, cancel any previous fetch so an old response doesn’t overwrite newer results. React Query’s <InlineCode>queryKey</InlineCode> change does this; with raw <InlineCode>fetch</InlineCode> use <InlineCode>AbortController</InlineCode>.</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          Keep <InlineCode>useDebounce</InlineCode> for the input value; feed the debounced value into <InlineCode>useQuery</InlineCode> as <InlineCode>queryKey</InlineCode>. Use <InlineCode>enabled</InlineCode> to avoid requesting when the query is too short. For scroll/resize, use a throttle (or a library like <InlineCode>lodash.throttle</InlineCode> / <InlineCode>use-debounce</InlineCode>) so you don’t run on every frame.
        </p>
        <CodeBlock code={PRODUCTION_DEBOUNCE_CODE} lang="tsx" />
        <CodeBlock code={THROTTLE_CODE} lang="tsx" className="mt-4" label="Throttle for scroll/resize" />
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Debounce:</strong> Search, filter inputs, any text that drives an API call or heavy computation. “Wait until the user pauses.”</li>
          <li><strong>Throttle:</strong> Scroll position, window resize, mousemove, progress updates. “Run at most every N ms.”</li>
          <li><strong>Skip:</strong> When the operation is cheap and you need every value (e.g. local state for controlled input). Don’t debounce the input value itself—only the side effect.</li>
        </ul>
        <Callout variant="info" title="Rule of thumb" className="mt-4">
          Debounce for “after user stops”; throttle for “while user is doing it but not every frame.”
        </Callout>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Stale closure in throttle:</strong> If you throttle a callback that reads state, the callback may see an old state. Use a ref for the latest value, or ensure the throttled function is recreated when deps change.</li>
          <li><strong>Leading edge:</strong> For “submit on first keystroke after idle” (e.g. run search as soon as user types, then debounce), use a debounce with <InlineCode>leading: true</InlineCode> or a custom implementation.</li>
          <li><strong>React 18 Strict Mode:</strong> Effects run twice in dev. Your debounce/throttle should still behave correctly—cleanup clears the timer. If you store “last run” in a ref, double-mount doesn’t break it.</li>
        </ul>
      </section>

      <p className="text-content-muted text-sm">
        <Link href="/frameworks/data-fetching" className="text-primary hover:underline">
          Data Fetching & Sync →
        </Link>
        {' · '}
        <Link href="/patterns" className="text-primary hover:underline">
          All patterns
        </Link>
      </p>
    </div>
  )
}
