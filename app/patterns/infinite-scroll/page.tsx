import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'

const NAIVE_CODE = `// Load everything at once — fine for 20 items, death for 10,000
function Feed() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/feed?limit=10000')  // ❌ Don't
      .then(r => r.json())
      .then(data => {
        setItems(data.items)
        setLoading(false)
      })
  }, [])

  return (
    <ul>
      {items.map(item => <FeedItem key={item.id} item={item} />)}
    </ul>
  )
}
// Initial load is slow; DOM has thousands of nodes; scroll can jank.`;

const FIRST_IMPROVEMENT_CODE = `// Load first page, then "Load more" button
function Feed() {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  const loadPage = useCallback(async (pageNum: number) => {
    setLoading(true)
    const res = await fetch(\`/api/feed?page=\${pageNum}&limit=20\`)
    const data = await res.json()
    setItems(prev => (pageNum === 1 ? data.items : [...prev, ...data.items]))
    setHasMore(data.hasMore)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadPage(1)
  }, [loadPage])

  return (
    <>
      <ul>
        {items.map(item => <FeedItem key={item.id} item={item} />)}
      </ul>
      {hasMore && (
        <button onClick={() => loadPage(page + 1)} disabled={loading}>
          {loading ? 'Loading…' : 'Load more'}
        </button>
      )}
    </>
  )
}
// Better: only render what we've fetched. But "Load more" is extra click; users expect scroll.`;

const PRODUCTION_CODE = `import { useInfiniteQuery } from '@tanstack/react-query'

function Feed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = null }) =>
      fetch(\`/api/feed?cursor=\${pageParam ?? ''}\`).then(r => r.json()),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null,
  })

  const flatItems = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <ul>
      {flatItems.map((item) => <FeedItem key={item.id} item={item} />)}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading…' : 'Load more'}
        </button>
      )}
    </ul>
  )
}

// For true "infinite scroll" (load when user nears bottom), use IntersectionObserver:
// Put a sentinel <div ref={sentinelRef} /> at the end; when it enters view, call fetchNextPage().`;

const SENTINEL_CODE = `// Sentinel at bottom of list — when visible, load next page
function useInfiniteScroll(
  fetchNextPage: () => void,
  hasNextPage: boolean,
  isFetchingNextPage: boolean
) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage()
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return sentinelRef
}

// In Feed: <div ref={useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage)} />`;

export default function InfiniteScrollPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Infinite Scroll
        </h1>
        <p className="text-xl text-content-muted">
          Load feed (or list) data in pages as the user scrolls, instead of loading everything upfront.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          Long feeds (social timelines, product grids, activity logs) can’t load all items at once: slow initial load, huge DOM, and wasted bandwidth. You need pagination. The UX question is whether to use a “Load more” button or to load automatically when the user scrolls near the bottom—infinite scroll.
        </p>
        <p className="text-content">
          Infinite scroll is familiar from Twitter, Instagram, and many dashboards. The implementation pitfalls: cursor vs offset pagination, avoiding duplicate or missing items when the list changes, and (if the list is very long) combining with virtualization so you don’t mount thousands of DOM nodes.
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          Fetch the whole list with a large limit. Works only for small datasets.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          Paginate: fetch page 1, then page 2, etc., and append to state. Use a “Load more” button so the user explicitly requests the next page. This fixes memory and DOM size; the only downside is the extra click for “infinite” feel.
        </p>
        <CodeBlock code={FIRST_IMPROVEMENT_CODE} lang="tsx" />
        <p className="text-content mt-4 text-sm">
          <strong>Why this helps:</strong> You only render what you’ve loaded. Backend can use <InlineCode>LIMIT/OFFSET</InlineCode> or cursor-based pagination.
        </p>
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Offset pagination:</strong> <InlineCode>page=2</InlineCode> can skip or duplicate items if the list changes between requests (e.g. new item inserted at top). Cursor-based (e.g. <InlineCode>after=id_xyz</InlineCode>) is stable.</li>
          <li><strong>No automatic load on scroll:</strong> Users expect scrolling to the bottom to load more. You need a sentinel element and <InlineCode>IntersectionObserver</InlineCode> (or a library that does it).</li>
          <li><strong>Caching and deduplication:</strong> React Query’s <InlineCode>useInfiniteQuery</InlineCode> handles page caching and gives you <InlineCode>fetchNextPage</InlineCode> and <InlineCode>hasNextPage</InlineCode> out of the box.</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          Use <InlineCode>useInfiniteQuery</InlineCode> with cursor-based pagination. The API returns <InlineCode>items</InlineCode> and <InlineCode>nextCursor</InlineCode>; <InlineCode>getNextPageParam</InlineCode> tells React Query how to request the next page. Add a sentinel at the bottom and call <InlineCode>fetchNextPage</InlineCode> when it becomes visible.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />
        <CodeBlock code={SENTINEL_CODE} lang="tsx" className="mt-4" label="Sentinel hook for auto-load on scroll" />
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Use:</strong> Feeds, timelines, product grids, activity logs—any long list where the user scrolls to consume content. Prefer cursor-based pagination for feeds that update in real time.</li>
          <li><strong>Consider “Load more” instead:</strong> When you need a stable scroll position for accessibility (e.g. “Back to top” or predictable focus). Infinite scroll can make it hard to reach footer or repeat a “load more” action.</li>
          <li><strong>Combine with virtualization:</strong> If the list has thousands of items in the DOM (even loaded in chunks), use a virtualized list so only visible rows are mounted.</li>
        </ul>
        <Callout variant="info" title="A11y" className="mt-4">
          Infinite scroll is hard for keyboard and screen-reader users. For critical lists, offer a “Load more” button or pagination as well.
        </Callout>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Root margin:</strong> With <InlineCode>IntersectionObserver</InlineCode>, use <InlineCode>rootMargin: '200px'</InlineCode> (or similar) so the next page starts loading before the user actually hits the bottom.</li>
          <li><strong>Stale closures:</strong> Pass <InlineCode>fetchNextPage</InlineCode>, <InlineCode>hasNextPage</InlineCode>, and <InlineCode>isFetchingNextPage</InlineCode> into the effect deps so the observer uses current values.</li>
          <li><strong>Duplicate keys:</strong> Flatten pages with <InlineCode>flatMap</InlineCode>; ensure each item has a stable <InlineCode>key</InlineCode> (id). If the API can return the same item in two pages during rebalancing, dedupe by id.</li>
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
