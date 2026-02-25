import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'

const NAIVE_CODE = `// Boolean loading — empty or content, no in-between
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then(r => r.json())
      .then(setUser)
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <Spinner />
  return <ProfileCard user={user} />
}
// Works, but "Spinner" is generic; layout shifts when content appears.`;

const FIRST_IMPROVEMENT_CODE = `// Skeleton: preserve layout, show shape of content
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(\`/api/users/\${userId}\`)
      .then(r => r.json())
      .then(setUser)
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-48 rounded bg-content-border/50 animate-pulse" />
        <div className="h-4 w-full rounded bg-content-border/50 animate-pulse" />
        <div className="h-4 w-3/4 rounded bg-content-border/50 animate-pulse" />
      </div>
    )
  }
  return <ProfileCard user={user} />
}
// Same layout as final content — no jump. User sees "something is loading" not a blank spin.`;

const PRODUCTION_CODE = `// React Query: isPending, isFetching, isRefetching — use the right one
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isPending, isError, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(\`/api/users/\${userId}\`).then(r => r.json()),
  })

  if (isPending) return <ProfileSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => queryClient.invalidateQueries({ queryKey: ['user', userId] })} />
  return <ProfileCard user={user} />
}

// Distinguish:
// - isPending: no data yet (initial load) → full skeleton
// - isFetching && !isPending: background refetch → optional small indicator or leave as-is (stale-while-revalidate)
// - isRefetching: same as above when refetchInterval or invalidation triggers`;

const SKELETON_PATTERN_CODE = `// Reuse skeleton so layout matches content
function ProfileSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-8 w-48 rounded bg-content-border/50 animate-pulse" aria-hidden />
      <div className="h-4 w-full rounded bg-content-border/50 animate-pulse" aria-hidden />
      <div className="h-4 w-3/4 rounded bg-content-border/50 animate-pulse" aria-hidden />
    </div>
  )
}
// Use aria-hidden so screen readers don't announce placeholder; pair with aria-busy on container if needed.`;

export default function LoadingStatesPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-6 py-10 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Loading States
        </h1>
        <p className="text-xl text-content-muted">
          Show the user that data is loading without blank screens or layout shift. Skeletons, spinners, and the right flags (pending vs refetching).
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          Components that fetch data need to show something while the request is in flight. A blank area feels broken; a generic spinner in the center causes layout shift when content finally appears. Users don’t know whether the app is working or stuck. You need a loading state that communicates “content is coming” and, ideally, preserves the shape of the final UI so the page doesn’t jump.
        </p>
        <p className="text-content">
          The other trap: treating every fetch the same. Initial load (no data yet) is different from a background refetch (stale data is already on screen). For the first, a full skeleton or spinner is appropriate; for the second, a small indicator or no change (stale-while-revalidate) is often better.
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          One boolean <InlineCode>loading</InlineCode>: if true, render a spinner; otherwise render the content. Simple, but the spinner is generic and the layout shifts when data arrives.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          Replace the spinner with a skeleton: placeholder blocks that match the approximate layout of the final content (avatar, title, lines of text). Use <InlineCode>animate-pulse</InlineCode> (or equivalent) so it’s clearly a placeholder. The container keeps the same size and structure, so there’s no jump when real data appears.
        </p>
        <CodeBlock code={FIRST_IMPROVEMENT_CODE} lang="tsx" />
        <p className="text-content mt-4 text-sm">
          <strong>Why this helps:</strong> Users see that something is loading in the right place. Perceived performance improves because the layout is stable and the brain anticipates content.
        </p>
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Initial vs refetch:</strong> When data is already on screen and you’re refetching (e.g. after a mutation or refetchInterval), you usually don’t want a full skeleton. Use <InlineCode>isPending</InlineCode> for “no data yet” and <InlineCode>isFetching</InlineCode> / <InlineCode>isRefetching</InlineCode> for background updates.</li>
          <li><strong>Error state:</strong> Loading isn’t the only state—you need an error UI (message + retry) so the user isn’t stuck on a spinner forever if the request fails.</li>
          <li><strong>Accessibility:</strong> Announce loading to screen readers (<InlineCode>aria-live</InlineCode>, <InlineCode>aria-busy</InlineCode>) and avoid making the skeleton focusable or announced as content.</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          Use React Query (or similar) so you get <InlineCode>isPending</InlineCode>, <InlineCode>isFetching</InlineCode>, and <InlineCode>isError</InlineCode>. Render a skeleton when <InlineCode>isPending</InlineCode>; optionally show a subtle indicator when <InlineCode>isFetching && !isPending</InlineCode>. Always handle error with a clear message and retry. Extract the skeleton into a component that mirrors the content layout.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />
        <CodeBlock code={SKELETON_PATTERN_CODE} lang="tsx" className="mt-4" label="Reusable skeleton component" />
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Skeleton:</strong> When the content has a predictable layout (profile card, list item, article). Reduces layout shift and sets expectations.</li>
          <li><strong>Spinner:</strong> When the loading area is small (button, inline action) or the final layout is unknown. Prefer a spinner that doesn’t collapse the layout (e.g. same height as content).</li>
          <li><strong>No indicator for refetch:</strong> When showing stale data and refetching in the background, often no extra UI is best; the data updates when the refetch completes.</li>
        </ul>
        <Callout variant="info" title="Suspense" className="mt-4">
          With React Suspense, you get a declarative loading boundary: wrap the component that reads async data in <InlineCode>Suspense</InlineCode> and provide a <InlineCode>fallback</InlineCode>. The same UX rules apply—prefer a fallback that matches the content layout where possible.
        </Callout>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Don’t skeleton everything:</strong> For a whole page, one coherent skeleton is better than five different ones that pop in at different times unless you’re intentionally streaming sections.</li>
          <li><strong>aria-busy and aria-live:</strong> Set <InlineCode>aria-busy="true"</InlineCode> on the loading container; use <InlineCode>aria-live="polite"</InlineCode> to announce “Content loaded” when done, or leave that to the app shell.</li>
          <li><strong>Button loading:</strong> For buttons that trigger a mutation, disable and show a spinner inside the button so the user can’t double-submit and sees that the action is in progress.</li>
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
