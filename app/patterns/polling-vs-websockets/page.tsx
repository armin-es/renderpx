import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'
import { RelatedContent } from '@/components/RelatedContent'
import { patternRelations } from '@/lib/related-content'

const POLLING_CODE = `// Poll: refetch on an interval
const { data } = useQuery({
  queryKey: ['notifications', userId],
  queryFn: () => fetch(\`/api/users/\${userId}/notifications\`).then(r => r.json()),
  refetchInterval: 30_000,              // every 30 seconds
  refetchIntervalInBackground: false,   // pause when tab is hidden
})
// Simple, works everywhere. Wastes requests when nothing changed; delay up to one interval.`;

const WEBSOCKET_CODE = `// WebSocket: server pushes; client invalidates and refetches
function useLiveNotifications(userId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const ws = new WebSocket(\`wss://api.example.com/notifications?\${userId}\`)
    ws.onmessage = (event) => {
      const { type } = JSON.parse(event.data)
      if (type === 'NEW') {
        queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
      }
    }
    return () => ws.close()
  }, [userId, queryClient])
}

// Component still uses useQuery for loading, error, and cache — WS only triggers invalidation.`;

const HYBRID_CODE = `// Initial load + refetch via React Query; real-time via WebSocket
function Notifications({ userId }: { userId: string }) {
  useLiveNotifications(userId)  // WS invalidates when server pushes

  const { data, isPending } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => fetch(\`/api/users/\${userId}/notifications\`).then(r => r.json()),
    refetchInterval: 60_000,  // fallback: poll every 60s if WS dies
  })

  return <NotificationList items={data ?? []} />
}
// Best of both: instant push when WS works; polling as backup.`;


export default function PollingVsWebsocketsPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Polling vs WebSockets
        </h1>
        <p className="text-xl text-content-muted">
          When to refetch on a timer (polling) and when to push updates from the server (WebSocket). Use the right tool for latency and scale.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          Data on the server changes and the client needs to show it. Two main options: the client asks periodically (polling) or the server pushes when something changes (WebSocket, SSE). Polling is simple and works everywhere, but it wastes requests when nothing changed and adds latency (up to one full interval). WebSockets give instant updates and less traffic when updates are frequent, but they need connection management, reconnection, and backend support.
        </p>
        <p className="text-content">
          The mistake is picking one for the whole app. Use polling for slow-changing data (notifications every 30s, dashboard every minute). Use WebSockets for chat, presence, or live collaboration where sub-second latency matters. Often you want both: WebSocket for real-time and a poll interval as fallback when the connection drops.
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          Fetch once on mount. Data goes stale; the user has to refresh to see new content. For “live” features that’s not acceptable.
        </p>
        <p className="text-content text-sm text-content-muted">
          (Omitting code—same as a basic useQuery with no refetchInterval or WebSocket.)
        </p>
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          Use React Query’s <InlineCode>refetchInterval</InlineCode>. The query refetches every N ms. Set <InlineCode>refetchIntervalInBackground: false</InlineCode> so you don’t burn requests when the tab is hidden. Simple and good enough for many UIs (notifications, dashboards).
        </p>
        <CodeBlock code={POLLING_CODE} lang="tsx" />
        <p className="text-content mt-4 text-sm">
          <strong>Why this helps:</strong> Data stays reasonably fresh with no extra infrastructure. Tune the interval to your UX and server capacity (e.g. 30s for notifications, 5s for a live scoreboard).
        </p>
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Latency:</strong> With a 30s poll, updates can be up to 30s late. For chat or live collaboration that’s too slow—you need push (WebSocket or SSE).</li>
          <li><strong>Waste:</strong> Polling when nothing changed wastes bandwidth and server work. For high-frequency updates, push is more efficient.</li>
          <li><strong>Integration:</strong> When you add a WebSocket, keep using React Query for the data. The WebSocket’s job is to trigger <InlineCode>invalidateQueries</InlineCode> (or <InlineCode>setQueryData</InlineCode>) so the existing cache and UI update; you don’t replace useQuery with raw WS state.</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          For real-time: open a WebSocket in a hook (or context); on message, invalidate the relevant query keys (or set data). The component still uses <InlineCode>useQuery</InlineCode> for loading, error, and caching. Keep a <InlineCode>refetchInterval</InlineCode> as a fallback so if the WebSocket disconnects, polling still updates the data until reconnection.
        </p>
        <CodeBlock code={WEBSOCKET_CODE} lang="tsx" />
        <CodeBlock code={HYBRID_CODE} lang="tsx" className="mt-4" label="Hybrid: WebSocket + polling fallback" />
        <Callout variant="info" title="When to use which" className="mt-4">
          <ul className="list-disc pl-4 space-y-1 text-sm">
            <li><strong>Polling:</strong> Notifications, dashboard metrics, “last updated” — low frequency, simple.</li>
            <li><strong>WebSocket:</strong> Chat, presence, live collaboration — high frequency or sub-second latency.</li>
            <li><strong>Hybrid:</strong> Use WS for real-time, keep <InlineCode>refetchInterval</InlineCode> as fallback when WS disconnects.</li>
          </ul>
        </Callout>
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Polling:</strong> Notifications, dashboard tiles, “last updated” timestamps—anything that can tolerate 15–60s delay. Simpler and easier to scale (stateless HTTP).</li>
          <li><strong>WebSocket:</strong> Chat, presence, live cursors, real-time collaboration. When the user expects instant feedback or the update rate is high.</li>
          <li><strong>Hybrid:</strong> Use WebSocket for the real-time channel and keep <InlineCode>refetchInterval</InlineCode> as backup. Handle reconnect (e.g. exponential backoff) and optionally refetch on focus.</li>
        </ul>
        <Callout variant="info" title="SSE" className="mt-4">
          Server-Sent Events are a middle ground: server pushes, one-way. Good for live feeds where the client doesn’t need to send messages. Simpler than WebSockets on the server; use <InlineCode>EventSource</InlineCode> and invalidate on event.
        </Callout>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Reconnect:</strong> WebSockets drop (network, load balancer). Implement reconnect with backoff and optionally re-subscribe (e.g. send a “sync” message) so you don’t miss updates during the gap.</li>
          <li><strong>Stale closure:</strong> In the WS <InlineCode>onmessage</InlineCode>, use <InlineCode>queryClient</InlineCode> from the hook so invalidation runs with the current client. Avoid closing over an old reference.</li>
          <li><strong>Tab visibility:</strong> With polling, <InlineCode>refetchIntervalInBackground: false</InlineCode> avoids work when the tab is hidden. For WebSockets, you may still want to reconnect or refetch when the user comes back (<InlineCode>refetchOnWindowFocus</InlineCode>).</li>
        </ul>
      </section>

      <p className="text-content-muted text-sm">
        <Link href="/frameworks/data-fetching" className="text-primary hover:underline">
          Data Fetching & Sync →
        </Link>
        {' · '}
        <Link href="/patterns/cache-invalidation" className="text-primary hover:underline">
          Cache Invalidation →
        </Link>
        {' · '}
        <Link href="/patterns" className="text-primary hover:underline">
          All patterns
        </Link>
      </p>

      <RelatedContent
        items={patternRelations['polling-vs-websockets'].frameworks}
        type="frameworks"
      />
      <RelatedContent
        items={patternRelations['polling-vs-websockets'].deepDives}
        type="deepDives"
      />
    </div>
  )
}
