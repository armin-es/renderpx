import Link from "next/link";
import { CodeWithPreview } from "@/components/CodeWithPreview";
import { CodeBlock } from "@/components/CodeBlock";
import { ExampleViewer } from "@/components/ExampleViewer";
import {
  UseEffectProblemDemo,
  UseEffectSolutionDemo,
  ReactQueryStyleDemo,
} from "@/components/demos/DataFetchingDemos";
import { dataFetchingExampleContent } from "@/lib/dataFetchingExamples";

const PROBLEM_CODE = `function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        setLoading(false)
        setUser(data)   // ❌ No guard: always writes, even if stale
      })
      .catch(err => {
        setLoading(false)
        setError(err)
      })
  }, [userId])

  if (loading) return <Spinner />
  if (error) return <ErrorMessage error={error} />
  return <ProfileCard user={user} />
}
// Switch userId quickly → old request resolves last → wrong user shown`;

const SOLUTION_CODE = `function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false   // ✅ flag per effect run
    setLoading(true)

    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {  // ✅ ignore if a newer request already ran
          setLoading(false)
          setUser(data)
        }
      })

    return () => { cancelled = true }  // ✅ next render → cancel this run
  }, [userId])

  if (loading) return <Spinner />
  return <ProfileCard user={user} />
}`;

const REACT_QUERY_CODE = `import { useQuery } from '@tanstack/react-query'

// That's it. Caching, deduplication, race conditions — all handled.
function UserProfile({ userId }) {
  const { data: user, isPending, isError } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(\`/api/users/\${userId}\`).then(r => r.json()),
    staleTime: 60_000,  // fresh for 1 minute
  })

  if (isPending) return <Spinner />
  if (isError) return <ErrorMessage />
  return <ProfileCard user={user} />
}

// ✅ Two <UserProfile userId="1"> → one network request (deduplicated)
// ✅ Navigate away and back → instant from cache, background refresh
// ✅ Network failure → auto-retry with backoff
// ✅ Tab refocused → background refresh if stale`;

const RSC_CODE = `// React Server Components: fetch on the server, zero client JS for data logic
// No loading state, no useEffect, no useQuery — it's just async/await

async function UserProfile({ userId }: { userId: string }) {
  // This runs on the server — can use DB/ORM directly, or fetch internal APIs
  const user = await fetch(\`https://internal-api/users/\${userId}\`, {
    next: { revalidate: 60 },  // Next.js: cache for 60s, revalidate in background
  }).then(r => r.json())

  // Rendered HTML sent to client — no client-side JS needed
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.role} · {user.team}</p>
    </div>
  )
}

// Streaming: shell renders immediately, RSC resolves in parallel
export default function Page() {
  return (
    <Shell>
      <Suspense fallback={<ProfileSkeleton />}>
        <UserProfile userId="123" />   {/* streams in when ready */}
      </Suspense>
      <Suspense fallback={<FeedSkeleton />}>
        <ActivityFeed userId="123" />  {/* independent stream */}
      </Suspense>
    </Shell>
  )
}`;

const PROGRESSIVE_EXAMPLES = [
  {
    id: "01-useeffect",
    title: "Example 1: useEffect + fetch",
    subtitle: "Raw async state in a component",
    complexity: "Naive",
  },
  {
    id: "02-custom-hook",
    title: "Example 2: Custom useFetch hook",
    subtitle: "Race conditions fixed, logic extracted",
    complexity: "Better",
  },
  {
    id: "03-react-query",
    title: "Example 3: React Query",
    subtitle: "Caching, deduplication, background refresh",
    complexity: "Production",
  },
  {
    id: "04-optimistic",
    title: "Example 4: Optimistic Updates",
    subtitle: "Instant UI feedback with rollback",
    complexity: "Advanced",
  },
  {
    id: "05-realtime",
    title: "Example 5: Real-time Sync",
    subtitle: "Polling and WebSocket with React Query",
    complexity: "Advanced",
  },
];

const VISUAL_LABELS: Record<string, string> = {
  "01-useeffect": "useEffect",
  "02-custom-hook": "Hook",
  "03-react-query": "React Query",
  "04-optimistic": "Optimistic",
  "05-realtime": "Real-time",
};

const DECISION_MATRIX = [
  {
    pattern: "useEffect + fetch",
    caching: "None",
    deduplication: "No",
    realtime: "No",
    ssrSupport: "Manual",
    useWhen: "Prototypes, one-off fetches that never change",
    avoid: "Any production UI where userId can change",
  },
  {
    pattern: "Custom useFetch hook",
    caching: "None",
    deduplication: "No",
    realtime: "No",
    ssrSupport: "Manual",
    useWhen: "Shared fetch logic, race conditions matter, no library budget",
    avoid: "Multiple components need the same data",
  },
  {
    pattern: "React Query / SWR",
    caching: "Automatic",
    deduplication: "Yes",
    realtime: "Via polling",
    ssrSupport: "Yes (hydration)",
    useWhen: "Most client-side data fetching in production apps",
    avoid: "Sub-second real-time updates (WebSocket is better)",
  },
  {
    pattern: "RSC fetch (Next.js)",
    caching: "Per-request / ISR",
    deduplication: "Yes (same request)",
    realtime: "No",
    ssrSupport: "Native",
    useWhen: "Data needed for initial render, content-heavy pages, SEO",
    avoid: "User-specific data that changes frequently on interaction",
  },
  {
    pattern: "WebSocket",
    caching: "No",
    deduplication: "N/A",
    realtime: "True push",
    ssrSupport: "No",
    useWhen: "Chat, collaboration, live dashboards, sub-second updates",
    avoid: "Data that changes every 30+ seconds (polling is simpler)",
  },
];

export default async function DataFetchingPage() {
  return (
    <div
      className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6"
      style={{ backgroundColor: "hsl(var(--content-bg))" }}
    >
      {/* Title */}
      <div className="mb-12">
        <h1
          className="text-4xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Data Fetching &amp; Sync
        </h1>
        <p
          className="text-xl"
          style={{ color: "hsl(var(--content-text-muted))" }}
        >
          How should your app talk to the server?
        </p>
      </div>

      {/* Section 1: The Problem */}
      <section id="the-problem" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          The Problem
        </h2>
        <div className="prose max-w-none">
          <p
            className="text-lg leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            Every React developer has written this at some point: a{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              useEffect
            </code>{" "}
            that fires on mount, fetches some data, and puts it in state. It
            looks simple. It looks complete.
          </p>
          <p
            className="leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            But there&apos;s a hidden problem that only surfaces when the user
            interacts: <strong>race conditions</strong>. If a component re-fetches
            based on some input, a search term, a selected user, a tab, each
            change fires a new request. Requests don&apos;t always resolve in the
            order they were sent. A slow first request can arrive after a fast
            second one, overwriting the correct result with stale data.
          </p>
          <p
            className="leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            Try it below. Even IDs trigger a slow 1200ms request, odd IDs are
            fast (400ms). Click <strong>User 2</strong>, then immediately{" "}
            <strong>User 1</strong>. User 1 arrives first, then User 2 overwrites
            it.
          </p>
        </div>

        <div className="mt-8">
          <CodeWithPreview
            code={PROBLEM_CODE}
            lang="tsx"
            codeLabel="useEffect fetch — race condition"
            preview={<UseEffectProblemDemo />}
            previewLabel="Live — click User 2 then User 1 quickly to trigger the race condition"
            layout="stacked"
          />
        </div>
      </section>

      {/* Section 2: The Solution */}
      <section id="the-solution" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          The Immediate Fix
        </h2>
        <div className="prose max-w-none">
          <p
            className="text-lg leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            The fix is a <strong>cancellation flag</strong>: a boolean scoped to
            each effect run. When the effect re-runs (because{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              userId
            </code>{" "}
            changed), the cleanup function from the previous run sets the flag to{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              true
            </code>
            . When the stale response arrives, it checks the flag and ignores the
            result.
          </p>
          <p
            className="leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            This is the same mechanism{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              AbortController
            </code>{" "}
            uses; except instead of cancelling the network request (which matters
            more for bandwidth), you&apos;re just telling the response handler to
            discard its result.
          </p>
        </div>

        <div className="mt-8">
          <CodeWithPreview
            code={SOLUTION_CODE}
            lang="tsx"
            codeLabel="Cancellation flag — stale responses ignored"
            preview={<UseEffectSolutionDemo />}
            previewLabel="Live — same test: stale responses are now discarded (watch the network log)"
            layout="stacked"
          />
        </div>

        {/* But wait — there's more */}
        <div
          className="mt-6 p-4 rounded-lg border"
          style={{
            backgroundColor: "hsl(var(--box-yellow-bg))",
            borderColor: "hsl(var(--box-yellow-border))",
          }}
        >
          <p style={{ color: "hsl(var(--content-text))" }}>
            <strong>The fix is necessary but not sufficient.</strong> Race conditions are just one of
            many problems with raw{" "}
            <code
              className="text-xs px-1 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              useEffect
            </code>{" "}
            fetching. There&apos;s also: no caching (every mount re-fetches), no
            request deduplication (two components fetching the same user = two
            API calls), no background refresh, no auto-retry. The cancellation
            flag fixes the symptom; React Query fixes the whole class of problems.{" "}
            <Link
              href="/deep-dives/useeffect-async-cleanup"
              style={{ color: "hsl(var(--link))" }}
              className="hover:underline"
            >
              AbortController vs cancelled flag, and what React Query handles for you →
            </Link>
          </p>
        </div>
      </section>

      {/* Section 3: React Query */}
      <section id="react-query" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          React Query: Server State as a First-Class Citizen
        </h2>
        <div className="prose max-w-none">
          <p
            className="text-lg leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            The core insight behind React Query (and SWR) is that{" "}
            <strong>server state is fundamentally different from client state</strong>
            . Client state lives in your app; it&apos;s synchronous and always
            up-to-date. Server state lives remotely; it can change without your
            knowledge, it needs to be fetched asynchronously, and it can become
            stale.
          </p>
          <p
            className="leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            React Query treats each piece of server state as a cache entry keyed
            by a{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              queryKey
            </code>
            . Every component that calls{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              useQuery
            </code>{" "}
            with the same key shares that cache entry, so duplicate components,
            parallel renders, and concurrent requests all collapse into a single
            network call.
          </p>
        </div>

        <div className="mt-8">
          <CodeWithPreview
            code={REACT_QUERY_CODE}
            lang="tsx"
            codeLabel="React Query — caching, deduplication, background refresh"
            preview={<ReactQueryStyleDemo />}
            previewLabel="Live — green dot = cached. Switch users and come back to see instant cache hits."
            layout="stacked"
          />
        </div>

        {/* What about RSC? */}
        <div className="mt-8">
          <h3
            className="text-lg font-bold mb-3"
            style={{ color: "hsl(var(--content-text))" }}
          >
            When React Query Isn&apos;t the Right Tool: RSC Fetch
          </h3>
          <p
            className="mb-4 text-sm"
            style={{ color: "hsl(var(--content-text-muted))" }}
          >
            React Query solves client-side data fetching. But if the data is
            needed for the initial render (especially for SEO or performance),
            fetching on the server is better. React Server Components make this
            trivial: just{" "}
            <code
              className="text-xs px-1 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              await
            </code>{" "}
            in an async component.
          </p>
          <CodeBlock code={RSC_CODE} lang="tsx" />
          <div
            className="mt-4 p-4 rounded-lg border"
            style={{
              backgroundColor: "hsl(var(--box-info-bg))",
              borderColor: "hsl(var(--box-info-border))",
            }}
          >
            <p style={{ color: "hsl(var(--content-text))" }}>
              <strong>Rule of thumb:</strong> If the data is needed before the page
              renders, use RSC fetch. If the data is needed after the user does
              something (click, type, navigate within an SPA), use React Query.
              Many apps use both.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: The Framework */}
      <section id="the-framework" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          The Framework: Four Kinds of Data
        </h2>
        <div className="prose max-w-none">
          <p
            className="text-lg leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            Every data fetching decision starts with two questions: <em>When</em> does
            the data need to be available? And <em>how fast</em> does it change?
          </p>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {[
            {
              label: "Client async",
              question: "Data needed after user interaction",
              answer: "React Query or SWR",
              examples: "Search results, user-selected content, filtered lists",
              color: "hsl(var(--box-info-bg))",
              border: "hsl(var(--box-info-border))",
            },
            {
              label: "Server state",
              question: "Data needed for initial render",
              answer: "RSC fetch, getServerSideProps, or static generation",
              examples: "Blog posts, product pages, dashboard initial load",
              color: "hsl(var(--box-success-bg))",
              border: "hsl(var(--box-success-border))",
            },
            {
              label: "Mutations",
              question: "Writing data, not reading it",
              answer: "useMutation (React Query) or Server Actions",
              examples: "Form submissions, button clicks, drag and drop",
              color: "hsl(var(--box-yellow-bg))",
              border: "hsl(var(--box-yellow-border))",
            },
            {
              label: "Real-time",
              question: "Data changes while user is watching",
              answer: "Polling (React Query refetchInterval) or WebSocket",
              examples: "Chat, live scores, collaborative cursors, notifications",
              color: "hsl(var(--box-warning-bg))",
              border: "hsl(var(--box-warning-border))",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-lg border"
              style={{ backgroundColor: item.color, borderColor: item.border }}
            >
              <div
                className="font-bold text-sm mb-1"
                style={{ color: "hsl(var(--content-text))" }}
              >
                {item.label}
              </div>
              <div
                className="text-sm italic mb-2"
                style={{ color: "hsl(var(--content-text-muted))" }}
              >
                &quot;{item.question}&quot;
              </div>
              <div
                className="text-sm font-medium mb-1"
                style={{ color: "hsl(var(--content-text))" }}
              >
                → {item.answer}
              </div>
              <div
                className="text-xs"
                style={{ color: "hsl(var(--content-text-muted))" }}
              >
                {item.examples}
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-6 p-4 rounded-lg border"
          style={{
            backgroundColor: "hsl(var(--box-info-bg))",
            borderColor: "hsl(var(--box-info-border))",
          }}
        >
          <p style={{ color: "hsl(var(--content-text))" }}>
            <strong>Most production apps use all four.</strong> A dashboard page
            might server-fetch the initial data (RSC), use React Query for
            user-driven filters (client async), Server Actions for form saves
            (mutations), and polling for live status indicators (real-time). The
            mistake is applying one tool to all four.
          </p>
        </div>
      </section>

      {/* Section 5: Decision Matrix */}
      <section id="decision-matrix" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Decision Matrix
        </h2>
        <p
          className="mb-6"
          style={{ color: "hsl(var(--content-text-muted))" }}
        >
          A quick reference for choosing the right fetching strategy. In
          practice, a single page often uses two or three of these.
        </p>

        <div className="overflow-x-auto">
          <table
            className="w-full border-collapse text-sm"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <thead>
              <tr
                className="border-b-2"
                style={{ borderColor: "hsl(var(--content-border))" }}
              >
                {[
                  "Pattern",
                  "Caching",
                  "Deduplication",
                  "Real-time",
                  "Use When",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left p-3 font-bold"
                    style={{ color: "hsl(var(--content-text))" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DECISION_MATRIX.map((row, i) => (
                <tr
                  key={row.pattern}
                  style={
                    i % 2 === 0
                      ? { backgroundColor: "hsl(var(--table-row-alt))" }
                      : undefined
                  }
                >
                  <td
                    className="p-3 font-medium align-top"
                    style={{ color: "hsl(var(--content-text))" }}
                  >
                    {row.pattern}
                  </td>
                  <td
                    className="p-3 align-top"
                    style={{ color: "hsl(var(--content-text-muted))" }}
                  >
                    {row.caching}
                  </td>
                  <td
                    className="p-3 align-top"
                    style={{ color: "hsl(var(--content-text-muted))" }}
                  >
                    {row.deduplication}
                  </td>
                  <td
                    className="p-3 align-top"
                    style={{ color: "hsl(var(--content-text-muted))" }}
                  >
                    {row.realtime}
                  </td>
                  <td
                    className="p-3 align-top"
                    style={{ color: "hsl(var(--content-text-muted))" }}
                  >
                    <div className="mb-1">{row.useWhen}</div>
                    <div
                      className="text-xs italic"
                      style={{ color: "hsl(var(--content-text-muted) / 0.9)" }}
                    >
                      Avoid: {row.avoid}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 6: Progressive Complexity */}
      <section id="progressive-complexity" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Progressive Complexity
        </h2>
        <p
          className="mb-6"
          style={{ color: "hsl(var(--content-text-muted))" }}
        >
          The same feature (fetching a user profile) built five ways. Each step
          shows exactly what problem the next tool solves and when you actually
          need to reach for it.
        </p>

        <ExampleViewer
          examples={PROGRESSIVE_EXAMPLES}
          content={dataFetchingExampleContent}
          visualLabels={VISUAL_LABELS}
        />
      </section>

      {/* Section 7: Production Patterns */}
      <section id="production-patterns" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Production Patterns
        </h2>

        <div className="space-y-6">
          {/* Pattern 1 */}
          <div
            className="p-5 rounded-lg border"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <h3
              className="font-bold mb-2"
              style={{ color: "hsl(var(--content-text))" }}
            >
              The dashboard that had three fetch strategies
            </h3>
            <p
              className="text-sm mb-3"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              A product analytics dashboard with a sidebar of historical charts
              (rarely changes), a main metrics panel (changes hourly), and a
              live activity feed (updates every few seconds).
            </p>
            <div className="text-sm space-y-1" style={{ color: "hsl(var(--content-text))" }}>
              <div>
                <strong>Historical charts:</strong> RSC fetch with{" "}
                <code
                  className="text-xs px-1 py-0.5 rounded"
                  style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
                >
                  revalidate: 3600
                </code>
                . No client JS needed; data is stable, SEO matters, fast initial
                load.
              </div>
              <div>
                <strong>Metrics panel:</strong> React Query with{" "}
                <code
                  className="text-xs px-1 py-0.5 rounded"
                  style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
                >
                  staleTime: 5 * 60 * 1000
                </code>
                . Users filter by date range interactively; client state drives
                the{" "}
                <code
                  className="text-xs px-1 py-0.5 rounded"
                  style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
                >
                  queryKey
                </code>
                , caching prevents re-fetching the same range twice.
              </div>
              <div>
                <strong>Activity feed:</strong> React Query with{" "}
                <code
                  className="text-xs px-1 py-0.5 rounded"
                  style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
                >
                  refetchInterval: 10000
                </code>
                . Polling was sufficient; real-time to the second wasn&apos;t a
                requirement.
              </div>
            </div>
            <div
              className="mt-3 text-xs italic"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              What I&apos;d do differently: add{" "}
              <code
                className="px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                refetchIntervalInBackground: false
              </code>{" "}
              earlier; we were polling even when the tab was hidden, which was
              unnecessary load.
            </div>
          </div>

          {/* Pattern 2 */}
          <div
            className="p-5 rounded-lg border"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <h3
              className="font-bold mb-2"
              style={{ color: "hsl(var(--content-text))" }}
            >
              The search that taught me about staleTime
            </h3>
            <p
              className="text-sm mb-3"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              A people search feature. Users would type a name, get results,
              click into a profile, press back, and the search results were gone.
            </p>
            <div className="text-sm space-y-1" style={{ color: "hsl(var(--content-text))" }}>
              <div>
                <strong>Problem:</strong> Default{" "}
                <code
                  className="text-xs px-1 py-0.5 rounded"
                  style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
                >
                  staleTime: 0
                </code>{" "}
                means all queries are immediately stale. On back-navigation,
                React Query refetches before rendering the cached results,
                causing a flash of empty state.
              </div>
              <div>
                <strong>Fix:</strong> Set{" "}
                <code
                  className="text-xs px-1 py-0.5 rounded"
                  style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
                >
                  staleTime: 30_000
                </code>{" "}
                for search results. The cached result renders instantly on
                back-navigation, and a background refetch runs silently if data
                is older than 30 seconds. Users never see an empty list.
              </div>
            </div>
          </div>

          {/* Pattern 3 */}
          <div
            className="p-5 rounded-lg border"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <h3
              className="font-bold mb-2"
              style={{ color: "hsl(var(--content-text))" }}
            >
              Inheriting a codebase with useEffect everywhere
            </h3>
            <p
              className="text-sm mb-3"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              You&apos;ve joined a team that fetches everything in useEffect. The
              instinct is to propose React Query. The right instinct is to audit
              first: search for{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                useEffect
              </code>{" "}
              + fetch to measure scope, then find the screens where users complain
              about stale data; those are the migration entry points, not the
              files with the messiest code.
            </p>
            <p
              className="text-sm mb-4"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              Migrate one query at a time.{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                useQuery
              </code>{" "}
              wraps the same fetch function; the UI doesn&apos;t change, only the
              plumbing does. Old useEffect fetches stay until they become a
              visible problem; no migration sprint, no feature freeze. The
              migration is done when new code stops using useEffect for data
              fetching, not when every old instance has been removed.
            </p>
            <CodeBlock
              code={`// Before: useEffect + three pieces of manual state
function UserList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => { setUsers(data); setLoading(false) })
      .catch(err => { setError(err); setLoading(false) })
  }, [])
}

// After: same fetch function, React Query handles the rest
function UserList() {
  const { data: users, isPending, isError } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  })
  // ✅ caching, deduplication, background refresh — zero extra code
  // ✅ old useEffect version can coexist during migration
}`}
              lang="tsx"
            />
          </div>
        </div>
      </section>

      {/* Section: A Real Rollout */}
      <section id="real-rollout" className="mb-16">
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: "hsl(var(--content-text))" }}
        >
          A Real Rollout
        </h2>
        <p
          className="text-sm mb-8"
          style={{ color: "hsl(var(--content-text-muted))" }}
        >
          What it actually looks like to introduce a shared cache layer into a
          team that already has opinions, with a product that can&apos;t stop
          shipping.
        </p>
        <div className="space-y-8">
          <div
            className="border-l-2 pl-5"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: "hsl(var(--link))" }}
            >
              Context
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "hsl(var(--content-text))" }}
            >
              Dashboard-heavy B2B app, eight engineers, three teams each owning
              different panels. Each team had built their own fetch logic: custom
              hooks, loading state, error state, cache invalidation after
              mutations, all manual, all slightly different. The same endpoint
              was being called independently from four places on the same screen.
            </p>
          </div>

          <div
            className="border-l-2 pl-5"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: "hsl(var(--link))" }}
            >
              The problem
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "hsl(var(--content-text))" }}
            >
              Cache inconsistency. Different panels on the same screen showed
              different values for the same metric because each team invalidated
              their local state independently after mutations, or didn&apos;t at
              all. Support tickets blamed &ldquo;the dashboard showing wrong
              numbers.&rdquo; The root cause wasn&apos;t the data; it was that
              four independent caches each had a slightly different view of it.
              The business framing: every support ticket about stale data required
              an engineer to investigate and reassure the customer. At scale, that
              was becoming a real cost.
            </p>
          </div>

          <div
            className="border-l-2 pl-5"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: "hsl(var(--link))" }}
            >
              The call
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "hsl(var(--content-text))" }}
            >
              Proposed React Query as a shared cache layer, not a rewrite, not a
              migration sprint. Added a single{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                QueryClient
              </code>{" "}
              at the app root, migrated one panel as a proof of concept, and let
              other teams adopt at their own pace. Skipped optimistic updates in
              the first pass, adding them only to the mutations that generated the
              most support tickets. The call I&apos;d make differently: I should
              have standardized query key naming conventions earlier. Two teams
              used different key shapes for the same endpoint, which meant the
              cache wasn&apos;t being shared even after adoption.
            </p>
          </div>

          <div
            className="border-l-2 pl-5"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: "hsl(var(--link))" }}
            >
              How I ran it
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "hsl(var(--content-text))" }}
            >
              The hardest part was getting engineers who&apos;d been managing{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                isLoading
              </code>{" "}
              state manually for two years to stop. The pitch that landed:
              &ldquo;with{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                useQuery
              </code>
              , the loading/error/refetch states you wrote manually are now 3
              lines, and they&apos;re correct.&rdquo; One team adopted
              immediately. Another needed to see it survive a production incident
              first; stale data was auto-refreshed on tab focus, with no code
              change. After that, adoption was pull, not push. I wrote a shared{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                queryKeys.ts
              </code>{" "}
              file to standardize key shapes across teams; that&apos;s what
              actually made the shared cache work.
            </p>
          </div>

          <div
            className="border-l-2 pl-5"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: "hsl(var(--link))" }}
            >
              The outcome
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "hsl(var(--content-text))" }}
            >
              Cache inconsistency tickets dropped significantly once panels shared
              the same query key. Onboarding a new dashboard panel went from
              &ldquo;build fetch logic, loading state, error state, invalidation
              logic&rdquo; to{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                useQuery(queryKey, fetchFn)
              </code>
              . We never finished migrating every old useEffect. We didn&apos;t
              need to; the problem was solved at the boundary: new panels used
              React Query and shared the cache, which is where the inconsistency
              lived.
            </p>
          </div>
        </div>
      </section>

      {/* Section 8: Hot Takes */}
      <section id="hot-takes" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Common Mistakes &amp; Hot Takes
        </h2>

        <div className="space-y-4">
          {[
            {
              mistake: "Fetching in useEffect in 2025",
              take: "This is now an anti-pattern for production. Not because useEffect is bad (it's fine) but because it doesn't handle caching, deduplication, or background refresh. You're reimplementing React Query badly. If you need client-side data fetching, use React Query or SWR. They're not heavy dependencies; they solve hard problems so you don't have to.",
            },
            {
              mistake: "Putting server state in Zustand/Redux",
              take: "I've seen teams reach for Zustand to store API responses, then manually invalidate it on mutations. This is React Query's entire job. Redux/Zustand is for client state (UI state, user preferences, form drafts). Server state has different semantics (staleness, revalidation, deduplication) that Zustand doesn't model.",
            },
            {
              mistake: "Over-using optimistic updates",
              take: "Optimistic updates are excellent for low-stakes reversible actions (like, follow, reaction). They feel wrong for high-stakes actions (payment, delete, publish). If the rollback is jarring (imagine a \"Delete\" button that appears to work and then un-deletes), a loading spinner is the better UX. Not every mutation needs to be optimistic.",
            },
            {
              mistake: "Adding WebSockets before you need them",
              take: "Polling is simpler, reliable, and works everywhere. For most \"real-time\" requirements, polling every 10–30 seconds is genuinely good enough. I've shipped real-time notification systems on polling that users never noticed weren't true push. Add WebSockets when polling becomes visibly inadequate, usually when you need sub-5-second updates or bidirectional communication.",
            },
          ].map(({ mistake, take }) => (
            <div
              key={mistake}
              className="p-4 rounded-lg border"
              style={{ borderColor: "hsl(var(--content-border))" }}
            >
              <div
                className="font-bold text-sm mb-2"
                style={{ color: "hsl(var(--content-text))" }}
              >
                ❌ {mistake}
              </div>
              <p className="text-sm" style={{ color: "hsl(var(--content-text-muted))" }}>
                {take}
              </p>
            </div>
          ))}

          {/* GraphQL normalization anti-pattern — separate because it includes a link */}
          <div
            className="p-4 rounded-lg border"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <div
              className="font-bold text-sm mb-2"
              style={{ color: "hsl(var(--content-text))" }}
            >
              ❌ Building a normalized cache on top of React Query (for GraphQL)
            </div>
            <p className="text-sm" style={{ color: "hsl(var(--content-text-muted))" }}>
              I&apos;ve seen teams using GraphQL with React Query build a custom normalized
              entity store (often with Jotai or Zustand) to solve the &quot;same entity in
              multiple queries&quot; consistency problem. Every query response gets piped into
              the store; components read from the store instead of React Query directly. This
              creates two sources of truth: the React Query cache and the store can drift apart,
              and React Query&apos;s staleTime and background refresh work on the cache, not the
              atoms. You&apos;ve rebuilt Apollo Client, badly. If cross-query consistency is a
              real problem, use a GraphQL client that solves it correctly:{" "}
              <Link
                href="/deep-dives/graphql-caching"
                style={{ color: "hsl(var(--link))" }}
                className="hover:underline"
              >
                Apollo Client or URQL →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Section 9: Related Frameworks */}
      <section id="related-frameworks" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Related Frameworks
        </h2>

        <div className="space-y-3">
          <div
            className="p-4 rounded-lg border"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <div className="font-medium mb-1">
              <Link
                href="/frameworks/state-architecture"
                style={{ color: "hsl(var(--link))" }}
                className="hover:underline"
              >
                State Architecture →
              </Link>
            </div>
            <p
              className="text-sm"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              Server state (React Query) and client state (Zustand, Context) are
              fundamentally different. Understanding the distinction, and knowing
              which tool handles each, is the foundation of good state
              architecture.
            </p>
          </div>

          <div
            className="p-4 rounded-lg border"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <div className="font-medium mb-1">
              <Link
                href="/frameworks/rendering-strategy"
                style={{ color: "hsl(var(--link))" }}
                className="hover:underline"
              >
                Rendering Strategy →
              </Link>
            </div>
            <p
              className="text-sm"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              Where data fetching happens (server vs client) is inseparable from
              rendering strategy. RSC fetch is the server-rendering answer to
              client-side useQuery. Understanding both means choosing the right
              one per page, not per religion.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
