import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'

const NAIVE_CODE = `// Every time: wait for network, then show data
function Profile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(\`/api/users/\${userId}\`)
      .then(r => r.json())
      .then(data => { setUser(data); setLoading(false) })
  }, [userId])

  if (loading) return <Spinner />
  return <ProfileCard user={user} />
}
// Every visit: blank or spinner until fetch completes. No reuse of previous data.`;

const FIRST_IMPROVEMENT_CODE = `// Show cached data immediately, then refetch and update
function Profile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const cacheRef = useRef<Record<string, User>>({})

  useEffect(() => {
    const cached = cacheRef.current[userId]
    if (cached) {
      setUser(cached)
      setLoading(false)
    } else {
      setLoading(true)
    }

    fetch(\`/api/users/\${userId}\`)
      .then(r => r.json())
      .then(data => {
        cacheRef.current[userId] = data
        setUser(data)
        setLoading(false)
      })
  }, [userId])

  if (loading && !user) return <Spinner />
  return <ProfileCard user={user} />
}
// If we have cached data, show it right away and refetch in background; then update.`;

const PRODUCTION_CODE = `// React Query: staleTime + cache = SWR out of the box
const { data, isPending, isFetching } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetch(\`/api/users/\${userId}\`).then(r => r.json()),
  staleTime: 60_000,      // Consider data fresh for 1 min; no refetch if mounted again
  gcTime: 5 * 60_000,     // Keep unused data in cache for 5 min (formerly cacheTime)
})

// Behavior:
// - First load: isPending true → show skeleton; then data appears.
// - Revisit within staleTime: data from cache, no request (or refetchOnMount: false).
// - After staleTime: data shown immediately (stale), isFetching true → background refetch → UI updates.
// - Optional: show a tiny "Updating..." when isFetching && !isPending.`;

const PLACEHOLDER_CODE = `// Optional: show previous data while new params load (e.g. userId changed)
const { data, isPending } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  placeholderData: (previousData) => previousData,  // Keep showing old user until new one loads
})
// User switches from /user/1 to /user/2: profile for 1 stays visible until 2 loads; no flash of empty.`;

export default function StaleWhileRevalidatePatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-6 py-10 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Stale-While-Revalidate
        </h1>
        <p className="text-xl text-content-muted">
          Show cached (possibly stale) data immediately, then revalidate in the background and update the UI when fresh data arrives.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          Users navigate away and back, or switch tabs. If every visit waits for a fresh network response, the UI feels slow and flickers (empty → content). You want to show something immediately—ideally the last data you had—and then refresh in the background so the screen updates when new data is ready.
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          No cache: every mount triggers a fetch, and the UI shows loading until it completes. Revisits and tab switches always start from scratch.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          Keep a simple cache (e.g. in a ref or module). On mount, if cache has data for this key, render it immediately and still fire a fetch; when the fetch completes, update cache and state. User sees stale data first, then fresh data without a loading block.
        </p>
        <CodeBlock code={FIRST_IMPROVEMENT_CODE} lang="tsx" />
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Cache invalidation:</strong> When to evict or refetch (e.g. after a mutation, or after a TTL). A library gives you <InlineCode>staleTime</InlineCode> and invalidation.</li>
          <li><strong>Multiple consumers:</strong> Several components may need the same query; a single cache (e.g. React Query) avoids duplicate requests and keeps them in sync.</li>
          <li><strong>Param changes:</strong> When the key (e.g. userId) changes, you may want to show the previous result as placeholder until the new one loads (no flash of empty).</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          Use React Query (or SWR). Set <InlineCode>staleTime</InlineCode> so data is considered “fresh” for a period and won’t refetch on remount; set <InlineCode>gcTime</InlineCode> so unused cache entries are kept for back navigation. You get SWR automatically: show cached data, refetch in background when stale. Optionally use <InlineCode>{`placeholderData: (previous) => previous`}</InlineCode> when the query key changes so the previous result stays visible until the new one loads.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />
        <CodeBlock code={PLACEHOLDER_CODE} lang="tsx" className="mt-4" label="Placeholder data when key changes" />
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Most GET data:</strong> Profile, settings, list views. Users expect instant display when they’ve seen it before; background refresh keeps it current.</li>
          <li><strong>Dashboard / metrics:</strong> Show last known values, refetch on interval or focus.</li>
          <li><strong>Skip when:</strong> Data must never be stale (e.g. critical financial step); then block UI until fresh data or show a clear “out of date” state.</li>
        </ul>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>staleTime vs gcTime:</strong> <InlineCode>staleTime</InlineCode> = “don’t refetch while fresh”; <InlineCode>gcTime</InlineCode> = “how long to keep unused data in cache.” Both affect when you see cached vs loading.</li>
          <li><strong>Refetch on focus:</strong> React Query refetches when the window regains focus by default. Turn off with <InlineCode>refetchOnWindowFocus: false</InlineCode> if you don’t want that.</li>
          <li><strong>Placeholder vs initialData:</strong> <InlineCode>placeholderData</InlineCode> is not cached and is used only for display; <InlineCode>initialData</InlineCode> is written into the cache and can prevent the first fetch if you’re not careful.</li>
        </ul>
      </section>

      <p className="text-content-muted text-sm">
        <Link href="/patterns/cache-invalidation" className="text-primary hover:underline">
          Cache Invalidation →
        </Link>
        {' · '}
        <Link href="/patterns/loading-states" className="text-primary hover:underline">
          Loading States →
        </Link>
        {' · '}
        <Link href="/patterns" className="text-primary hover:underline">
          All patterns
        </Link>
      </p>
    </div>
  )
}
