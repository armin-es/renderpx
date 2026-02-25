import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout, InlineCode } from "@/components/ui";

export default function UseEffectAsyncCleanupPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-6 py-10 bg-content-bg">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-xs">
        <Link href="/frameworks/data-fetching" className="text-primary hover:underline">
          Data Fetching &amp; Sync
        </Link>
        <ChevronRight size={12} className="text-content-muted" />
        <span className="text-content-muted">Deep Dive</span>
      </div>

      {/* Title */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">useEffect and Async Cleanup</h1>
        <p className="text-xl text-content-muted">
          The race condition every useEffect fetch has, two ways to fix it, and why React Query exists
        </p>
      </div>

      {/* Section 1: The Race Condition */}
      <section id="the-race-condition" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The Race Condition</h2>
        <p className="text-lg leading-relaxed text-content mb-4">
          Every <InlineCode>useEffect</InlineCode> fetch has a latent race condition. It only
          surfaces when two requests are in-flight simultaneously — which happens whenever a
          prop that the effect depends on changes quickly.
        </p>
        <CodeBlock
          code={`function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => setUser(data))  // ← no guard
  }, [userId])

  return user ? <Profile user={user} /> : <Spinner />
}`}
          lang="tsx"
        />

        <p className="mt-4 text-content mb-4">
          Here is the exact sequence when the user navigates from{" "}
          <InlineCode>/profile/1</InlineCode> to <InlineCode>/profile/2</InlineCode>:
        </p>

        <div className="rounded-lg border border-content-border overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-content-border">
                <th className="text-left p-3 font-bold text-content w-16">Time</th>
                <th className="text-left p-3 font-bold text-content">Event</th>
                <th className="text-left p-3 font-bold text-content">State after</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  t: "t=0",
                  event: "userId changes '1' → '2'. useEffect fires.",
                  state: "user: user1 (stale), fetch for user2 in-flight",
                },
                {
                  t: "t=80ms",
                  event: "user2 response arrives. setUser(user2).",
                  state: "user: user2 ✓ — correct",
                },
                {
                  t: "t=200ms",
                  event: "user1 response arrives (slow). setUser(user1).",
                  state: "user: user1 ✗ — wrong user, no error",
                },
              ].map((row, i) => (
                <tr key={row.t} className={i % 2 === 0 ? "bg-content-bg" : ""}>
                  <td className="p-3 font-mono text-content-muted">{row.t}</td>
                  <td className="p-3 text-content">{row.event}</td>
                  <td className="p-3 text-content-muted">{row.state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Callout variant="warning" title="Why it's hard to catch">
          This only happens when user1&apos;s request is slower than user2&apos;s — a timing
          condition that doesn&apos;t exist in local development (where the &quot;API&quot; is
          often instant) but happens regularly in production under load or on slow connections.
          The result is wrong data in the UI with no error, no warning, and no way for the user
          to know.
        </Callout>
      </section>

      {/* Section 2: Fix 1 — Cancelled flag */}
      <section id="fix-cancelled-flag" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Fix 1: The Cancelled Flag</h2>
        <p className="text-content mb-4">
          The <InlineCode>useEffect</InlineCode> cleanup function runs before the next effect
          fires. You can use it to set a flag that tells the async callback to discard its result:
        </p>
        <CodeBlock
          code={`useEffect(() => {
  let cancelled = false  // local to this effect run

  fetch(\`/api/users/\${userId}\`)
    .then(res => res.json())
    .then(data => {
      if (!cancelled) setUser(data)  // only update if this run is still current
    })

  return () => {
    cancelled = true  // next render triggers this before the new effect runs
  }
}, [userId])`}
          lang="tsx"
        />

        <p className="mt-4 text-content mb-2">
          Applying this to the timeline above:
        </p>
        <div className="rounded-lg border border-content-border overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-content-border">
                <th className="text-left p-3 font-bold text-content w-16">Time</th>
                <th className="text-left p-3 font-bold text-content">Event</th>
                <th className="text-left p-3 font-bold text-content">Result</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  t: "t=0",
                  event: "userId changes. Cleanup runs: cancelled₁ = true. New effect fires.",
                  result: "user1 run is now cancelled",
                },
                {
                  t: "t=80ms",
                  event: "user2 response arrives. cancelled₂ = false → setUser(user2).",
                  result: "user: user2 ✓",
                },
                {
                  t: "t=200ms",
                  event: "user1 response arrives. cancelled₁ = true → setUser skipped.",
                  result: "user: user2 ✓ — stale response discarded",
                },
              ].map((row, i) => (
                <tr key={row.t} className={i % 2 === 0 ? "bg-content-bg" : ""}>
                  <td className="p-3 font-mono text-content-muted">{row.t}</td>
                  <td className="p-3 text-content">{row.event}</td>
                  <td className="p-3 text-content-muted">{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Callout variant="info" title="What this does and doesn't do">
          The cancelled flag prevents the stale response from updating state — but the network
          request for user1 still runs to completion. The bandwidth is wasted, and the
          connection slot is occupied. For most apps this is fine. For mobile users on metered
          connections, or for requests that trigger server-side work, you want to cancel the
          request itself — not just discard the response.
        </Callout>
      </section>

      {/* Section 3: Fix 2 — AbortController */}
      <section id="fix-abortcontroller" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Fix 2: AbortController</h2>
        <p className="text-content mb-4">
          <InlineCode>AbortController</InlineCode> is a Web API that cancels the network
          request itself. The browser closes the connection when{" "}
          <InlineCode>abort()</InlineCode> is called — no response is received, no bandwidth
          is used past that point.
        </p>
        <CodeBlock
          code={`useEffect(() => {
  const controller = new AbortController()

  fetch(\`/api/users/\${userId}\`, { signal: controller.signal })
    .then(res => res.json())
    .then(data => setUser(data))
    .catch(err => {
      if (err.name === 'AbortError') return  // expected — ignore it
      setError(err)
    })

  return () => {
    controller.abort()  // cancels the in-flight request, not just the handler
  }
}, [userId])`}
          lang="tsx"
        />

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-content-border">
                {["", "Cancelled flag", "AbortController"].map((h) => (
                  <th key={h} className="text-left p-3 font-bold text-content">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: "Prevents stale state update",
                  flag: "✓",
                  abort: "✓",
                },
                {
                  label: "Cancels the network request",
                  flag: "✗ — request completes",
                  abort: "✓ — connection closed",
                },
                {
                  label: "Saves bandwidth",
                  flag: "✗",
                  abort: "✓",
                },
                {
                  label: "Stops server-side work",
                  flag: "✗",
                  abort: "✓ (if server respects abort signal)",
                },
                {
                  label: "Works with non-fetch async (setTimeout, WebSocket, etc.)",
                  flag: "✓",
                  abort: "✗ — fetch-specific",
                },
                {
                  label: "Browser support",
                  flag: "Universal",
                  abort: "All modern browsers",
                },
              ].map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? "bg-content-bg" : ""}>
                  <td className="p-3 font-medium text-content">{row.label}</td>
                  <td className="p-3 text-content-muted">{row.flag}</td>
                  <td className="p-3 text-content-muted">{row.abort}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-content-muted text-sm">
          Default to <InlineCode>AbortController</InlineCode> for fetch-based data loading.
          Use the cancelled flag for non-fetch async work (timers, WebSocket messages,
          IndexedDB reads) where <InlineCode>AbortController</InlineCode> doesn&apos;t apply.
        </p>
      </section>

      {/* Section 4: What you still don't have */}
      <section id="what-you-still-need" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          What You Still Don&apos;t Have
        </h2>
        <p className="text-content mb-6">
          With <InlineCode>AbortController</InlineCode> in place, the race condition is fixed.
          But data fetching in production needs more than correct sequencing:
        </p>

        <CodeBlock
          code={`// After fixing the race condition, your useEffect fetch still has:

// ❌ No caching
//    Every component mount re-fetches, even if the data was loaded 2 seconds ago.
//    Navigate away and back → another network request.

// ❌ No deduplication
//    Two <UserProfile userId="1"> on the same page → two identical API calls.
//    React Query deduplicates: same queryKey = one request, both components update.

// ❌ No background refresh
//    Data goes stale immediately. Tab refocused? The user sees whatever loaded on mount.
//    React Query refetches on tab focus when staleTime has passed.

// ❌ No retry
//    Network blip → permanent error state. User must hard-refresh.
//    React Query retries failed requests with exponential backoff (3 times by default).

// ❌ No loading state coordination
//    Two components fetching the same user both show spinners independently,
//    even though they're waiting for the same request.

// The cancellation flag or AbortController fixes one problem.
// React Query fixes the whole class.`}
          lang="tsx"
        />

        <div className="mt-6 p-4 rounded-lg border border-content-border">
          <h3 className="font-bold mb-3 text-content">The same component with React Query</h3>
          <CodeBlock
            code={`function UserProfile({ userId }: { userId: string }) {
  const { data: user, isPending, isError } = useQuery({
    queryKey: ['user', userId],
    queryFn: ({ signal }) =>
      // ✅ AbortController is handled for you — signal passed automatically
      fetch(\`/api/users/\${userId}\`, { signal }).then(r => r.json()),
    staleTime: 60_000,
  })

  if (isPending) return <Spinner />
  if (isError) return <ErrorMessage />
  return <Profile user={user} />
}

// ✅ Race condition: handled (AbortController passed via queryFn signal)
// ✅ Caching: 60s staleTime — navigate away and back → instant from cache
// ✅ Deduplication: two components, one request
// ✅ Background refresh: on tab focus when stale
// ✅ Retry: 3 attempts with backoff on failure`}
            lang="tsx"
          />
        </div>

        <Callout variant="info" title="Note on the queryFn signal" className="mt-4">
          React Query passes an <InlineCode>AbortController</InlineCode> signal into{" "}
          <InlineCode>queryFn</InlineCode> automatically. When a query is cancelled (because
          the component unmounts, or because a newer query supersedes it), the signal aborts —
          and the network request is cancelled. You get the correct behavior without writing
          the cleanup code yourself.
        </Callout>
      </section>

      {/* Section 5: When to still use useEffect */}
      <section id="when-to-use-useeffect" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          When useEffect + fetch Is Still the Right Tool
        </h2>
        <p className="text-content mb-4">
          React Query is the right default for server data. But there are cases where
          a raw <InlineCode>useEffect</InlineCode> fetch (with cleanup) is appropriate:
        </p>
        <div className="space-y-3">
          {[
            {
              label: "One-time initialisation",
              detail:
                "Fetching configuration on app startup, where caching and refetch are irrelevant. The request runs once and the result never goes stale.",
            },
            {
              label: "Non-HTTP async work",
              detail:
                "Reading from IndexedDB, Web Workers, or WebRTC. These aren't HTTP requests — AbortController doesn't apply and React Query's model doesn't fit.",
            },
            {
              label: "Mutations with no return value",
              detail:
                "Logging, analytics, fire-and-forget side effects. These don't need caching or retry coordination.",
            },
          ].map((item) => (
            <div key={item.label} className="border-l-4 border-primary pl-4 py-1">
              <div className="font-medium text-content mb-1">{item.label}</div>
              <p className="text-sm text-content-muted">{item.detail}</p>
            </div>
          ))}
        </div>

        <Callout variant="success" title="The rule of thumb" className="mt-6">
          If you need the data in a React component and it comes from a server, use React
          Query. If the async work is a side effect that isn&apos;t directly tied to
          rendering — or if you&apos;re in a context where React Query doesn&apos;t make
          sense — use <InlineCode>useEffect</InlineCode> with <InlineCode>AbortController</InlineCode>{" "}
          (for fetch) or a cancelled flag (for everything else).
        </Callout>
      </section>

      {/* Related */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Related</h2>
        <div className="space-y-3">
          <Link
            href="/frameworks/data-fetching"
            className="flex items-center justify-between p-4 border border-content-border rounded-lg hover:opacity-90 transition-opacity"
          >
            <div>
              <div className="font-medium text-content">Data Fetching &amp; Sync</div>
              <div className="text-sm text-content-muted">
                useEffect → React Query → RSC — the full spectrum
              </div>
            </div>
            <ChevronRight size={20} className="text-content-muted shrink-0" />
          </Link>
          <Link
            href="/deep-dives/state-machines"
            className="flex items-center justify-between p-4 border border-content-border rounded-lg hover:opacity-90 transition-opacity"
          >
            <div>
              <div className="font-medium text-content">State Machines</div>
              <div className="text-sm text-content-muted">
                The other useEffect bug — stale state shape when flags aren&apos;t reset atomically
              </div>
            </div>
            <ChevronRight size={20} className="text-content-muted shrink-0" />
          </Link>
        </div>
      </section>
    </div>
  );
}
