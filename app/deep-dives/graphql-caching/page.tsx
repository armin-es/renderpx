import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout, InlineCode } from "@/components/ui";

export default function GraphqlCachingPage() {
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
        <h1 className="text-4xl font-bold mb-4 text-content">GraphQL Caching</h1>
        <p className="text-xl text-content-muted">
          Why normalized caches exist, when you actually need one, and a common anti-pattern to avoid
        </p>
      </div>

      {/* Section 1: The Problem */}
      <section id="the-problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The Problem</h2>
        <p className="text-lg leading-relaxed text-content mb-4">
          React Query caches by query key. Two queries that both include the same user are two
          separate cache entries:
        </p>
        <CodeBlock
          code={`// Query A: user list — includes { id: '42', name: 'Alice', role: 'admin' }
useQuery({ queryKey: ['users'], queryFn: getUsers })

// Query B: user detail — includes the same user
useQuery({ queryKey: ['user', '42'], queryFn: () => getUser('42') })

// A mutation updates Alice's role from 'admin' to 'member'
useMutation({
  mutationFn: updateUser,
  onSuccess: () => {
    // You must know every query key that might contain Alice:
    queryClient.invalidateQueries({ queryKey: ['user', '42'] })
    queryClient.invalidateQueries({ queryKey: ['users'] })
    // What about ['user-search', 'alice']? ['team', 'engineering']?
    // Miss one → stale data in the UI
  },
})`}
          lang="tsx"
        />
        <p className="mt-4 text-content">
          In a REST app with a handful of queries, this is manageable. In a GraphQL app where every
          page composes different slices of the same entities — users, posts, comments — it becomes a
          maintenance problem. A mutation that updates a user needs to know every query key that
          might have fetched that user, across the entire codebase.
        </p>
      </section>

      {/* Section 2: Query Invalidation */}
      <section id="query-invalidation" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          Query Invalidation: Good Enough for Most Cases
        </h2>
        <p className="text-content mb-4">
          Before reaching for a normalized cache, check whether invalidation solves your
          problem. It usually does.
        </p>
        <CodeBlock
          code={`// Broad invalidation: invalidate anything that might contain user data.
// React Query refetches all matching queries in the background.
useMutation({
  mutationFn: updateUser,
  onSuccess: () => {
    // Invalidate by prefix — catches ['user', '42'], ['users'], ['user-search', ...]
    queryClient.invalidateQueries({ queryKey: ['user'] })
  },
})

// You can also invalidate on a tag/type basis:
queryClient.invalidateQueries({ queryKey: ['users'] })  // all user-list queries
queryClient.invalidateQueries({ queryKey: ['user', userId] })  // specific user`}
          lang="tsx"
        />
        <Callout variant="success" title="When this is enough" className="mt-4">
          For most apps: mutations are infrequent, the network is fast enough that a refetch is
          invisible, and the set of affected queries per mutation is small (2–4 keys). Invalidation
          is simple, debuggable, and requires no additional infrastructure. Start here.
        </Callout>

        <div className="mt-6 p-4 rounded-lg border border-content-border">
          <h3 className="font-bold mb-2 text-content">Signs that invalidation is getting painful</h3>
          <ul className="space-y-1 text-sm text-content-muted list-disc pl-4">
            <li>Mutations need to invalidate 6+ distinct query keys</li>
            <li>You&apos;ve shipped bugs where a mutation updated the database but the UI showed stale data</li>
            <li>Developers regularly ask &quot;which queries do I need to invalidate after this mutation?&quot;</li>
            <li>Real-time updates (WebSocket events) need to update the UI without a full refetch</li>
          </ul>
        </div>
      </section>

      {/* Section 3: Normalized Cache */}
      <section id="normalized-cache" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          Normalized Cache: How Apollo Client Solves This
        </h2>
        <p className="text-content mb-4">
          A normalized cache stores each entity exactly once, keyed by type and ID. Every query
          that includes <InlineCode>User:42</InlineCode> references the same object in the cache.
          When a mutation updates that object, every query that references it reflects the change
          automatically — no manual invalidation required.
        </p>
        <CodeBlock
          code={`// Apollo Client's InMemoryCache normalizes automatically
// using __typename + id from GraphQL responses.

// Query A: user list — Alice stored as User:42 in the cache
const { data: users } = useQuery(GET_USERS)

// Query B: user detail — references the same User:42 object
const { data: user } = useQuery(GET_USER, { variables: { id: '42' } })

// Mutation: update Alice's role
const [updateUser] = useMutation(UPDATE_USER, {
  // No manual invalidation needed.
  // Apollo writes the mutation response back into the cache.
  // User:42 is updated in one place; both queries see the new value.
  update(cache, { data: { updateUser } }) {
    cache.modify({
      id: cache.identify(updateUser),
      fields: { role: () => updateUser.role },
    })
  },
})

// URQL + @urql/exchange-graphcache works the same way:
// entities normalized by __typename + id, updates propagate automatically.`}
          lang="tsx"
        />

        <Callout variant="info" title="What normalization buys you" className="mt-4">
          Consistency across queries is automatic. A mutation that updates <InlineCode>User:42</InlineCode>{" "}
          propagates to every component that displays that user — the user list, the detail page,
          the sidebar, the comment author — without any coordination code. This is the core value
          of Apollo and URQL over React Query for GraphQL.
        </Callout>

        <div className="mt-6">
          <h3 className="font-bold mb-3 text-content">Apollo vs URQL</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-content-border">
                  {["", "Apollo Client", "URQL + graphcache"].map((h) => (
                    <th key={h} className="text-left p-3 font-bold text-content">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: "Bundle size",
                    apollo: "~45kB gzipped",
                    urql: "~15kB core + ~10kB exchange",
                  },
                  {
                    label: "Normalized cache",
                    apollo: "InMemoryCache (built-in)",
                    urql: "@urql/exchange-graphcache (opt-in)",
                  },
                  {
                    label: "Devtools",
                    apollo: "Apollo DevTools (Chrome extension)",
                    urql: "urql DevTools (Chrome extension)",
                  },
                  {
                    label: "Pagination",
                    apollo: "relayStylePagination / offsetLimitPagination",
                    urql: "Custom resolvers in graphcache",
                  },
                  {
                    label: "Learning curve",
                    apollo: "Higher — policies, reactive variables, cache APIs",
                    urql: "Lower — more composable, smaller surface",
                  },
                  {
                    label: "Use when",
                    apollo: "Large team, complex cache, existing Apollo ecosystem",
                    urql: "Starting fresh, smaller app, want lighter footprint",
                  },
                ].map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? "bg-content-bg" : ""}>
                    <td className="p-3 font-medium text-content">{row.label}</td>
                    <td className="p-3 text-content-muted">{row.apollo}</td>
                    <td className="p-3 text-content-muted">{row.urql}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 4: The Anti-Pattern */}
      <section id="the-antipattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          The Anti-Pattern: React Query + Custom Normalized Store
        </h2>
        <p className="text-content mb-4">
          Some teams using GraphQL with React Query notice the invalidation maintenance problem and
          build a solution: a custom normalized entity store (often with Jotai or Zustand) layered
          on top of React Query. Every query response gets piped into the store; components read
          from the store instead of from React Query directly.
        </p>
        <p className="text-content mb-6">
          This pattern solves the consistency problem — but creates several worse ones.
        </p>
        <CodeBlock
          code={`// The 4-hop data pipeline this creates:
//
//   Server → React Query cache → normalization function → Jotai atoms → UI
//
// Each hop is a place where data can get out of sync.

// Example: a query result gets normalized into atoms on success
useQuery({
  queryKey: ['users'],
  queryFn: getUsers,
  onSuccess: (data) => {
    // Manually pipe into normalized store
    data.forEach(user => {
      store.set(userAtom(user.id), user)
    })
  },
})

// Components read from Jotai, not from useQuery
function UserCard({ userId }) {
  const user = useAtomValue(userAtom(userId))  // reads from Jotai
  // ...
}

// Problems:
// 1. Two sources of truth: React Query cache AND Jotai store
// 2. React Query's staleTime, background refresh, and retry all work on the cache,
//    not on the Jotai atoms — so components can show stale atoms even after a refresh
// 3. You've written and now own the normalization logic that Apollo provides for free
// 4. Devtools show React Query's cache; the real state is in Jotai — hard to debug
// 5. The onSuccess callback was deprecated in React Query v5`}
          lang="tsx"
        />

        <Callout variant="warning" title="What you've actually built" className="mt-4">
          You&apos;ve rebuilt Apollo Client, worse. Apollo&apos;s <InlineCode>InMemoryCache</InlineCode> is
          the result of years of work on correctness, garbage collection, pagination, and cache
          policies. A custom normalization layer built on top of React Query skips all of that
          and adds a new failure mode: the cache and the store can drift out of sync.
        </Callout>

        <div className="mt-6 p-4 rounded-lg border border-content-border">
          <h3 className="font-bold mb-2 text-content">If you&apos;re in this situation</h3>
          <p className="text-sm text-content-muted mb-2">
            The migration path depends on how deep the custom store goes:
          </p>
          <ul className="space-y-1 text-sm text-content-muted list-disc pl-4">
            <li>
              <strong>Still early:</strong> Migrate to Apollo Client or URQL. The normalized cache
              is the feature you need; these libraries provide it correctly.
            </li>
            <li>
              <strong>Custom store is deep:</strong> Remove the normalization layer, have
              components read directly from <InlineCode>useQuery</InlineCode>, and use broad
              invalidation on mutations. Accept the trade-off: potential stale data is usually
              better than two sources of truth.
            </li>
            <li>
              <strong>Mutation frequency is the issue:</strong> Add optimistic updates in React
              Query (<InlineCode>onMutate</InlineCode> + rollback) for the mutations that feel
              slow, rather than building a normalized store.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 5: Decision */}
      <section id="decision" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Decision</h2>

        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-content-border">
                {["Situation", "Recommended approach"].map((h) => (
                  <th key={h} className="text-left p-3 font-bold text-content">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  situation: "REST API, few queries per entity",
                  approach: "React Query with targeted invalidation",
                },
                {
                  situation: "GraphQL, mutations are infrequent",
                  approach: "React Query with broad prefix invalidation (e.g. invalidate all ['user'] queries)",
                },
                {
                  situation: "GraphQL, same entity appears in many queries",
                  approach: "Apollo Client or URQL + graphcache",
                },
                {
                  situation: "GraphQL, real-time updates via WebSocket",
                  approach: "Apollo Client (subscriptions built-in) or URQL",
                },
                {
                  situation: "Need instant UI on mutation, regardless of network",
                  approach: "Optimistic updates with useMutation + onMutate rollback",
                },
                {
                  situation: "React Query + custom Jotai/Zustand normalization store",
                  approach: "Migrate to Apollo/URQL or remove the custom store — this is two sources of truth",
                },
              ].map((row, i) => (
                <tr key={row.situation} className={i % 2 === 0 ? "bg-content-bg" : ""}>
                  <td className="p-3 align-top text-content font-medium">{row.situation}</td>
                  <td className="p-3 align-top text-content-muted">{row.approach}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Callout variant="info" title="The rule of thumb">
          If you&apos;re using React Query with a REST API, invalidation is almost always enough.
          If you&apos;re using GraphQL and you find yourself maintaining a list of query keys to
          invalidate after every mutation, that&apos;s the signal to switch to a GraphQL client
          with a proper normalized cache.
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
            href="/frameworks/state-architecture"
            className="flex items-center justify-between p-4 border border-content-border rounded-lg hover:opacity-90 transition-opacity"
          >
            <div>
              <div className="font-medium text-content">State Architecture</div>
              <div className="text-sm text-content-muted">
                Server state vs client state — the distinction that makes this decision clear
              </div>
            </div>
            <ChevronRight size={20} className="text-content-muted shrink-0" />
          </Link>
        </div>
      </section>
    </div>
  );
}
