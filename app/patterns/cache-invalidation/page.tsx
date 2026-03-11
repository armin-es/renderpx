import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'
import { RelatedContent } from '@/components/RelatedContent'
import { patternRelations } from '@/lib/related-content'

const NAIVE_CODE = `// After mutation, hope the next navigation refetches
function EditProfileForm({ userId }: { userId: string }) {
  const mutation = useMutation({
    mutationFn: (data) => fetch(\`/api/users/\${userId}\`, { method: 'PATCH', body: JSON.stringify(data) }),
  })

  const handleSubmit = (data) => {
    mutation.mutate(data)
    // User navigates away and back - might see stale profile until refetch
  }
}
// No explicit invalidation; cache can stay stale until staleTime expires or manual refetch.`;

const FIRST_IMPROVEMENT_CODE = `// Invalidate after mutation so next read is fresh
function EditProfileForm({ userId }: { userId: string }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data) => fetch(\`/api/users/\${userId}\`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
    },
  })
}
// Any component using useQuery(['user', userId]) will refetch. UI stays in sync.`;

const PRODUCTION_CODE = `// Invalidate by exact key or prefix; use queryKey hierarchy
const queryClient = useQueryClient()

// After updating the current user's profile
queryClient.invalidateQueries({ queryKey: ['user', userId] })

// After creating a post, invalidate the feed (and optionally the user's post list)
queryClient.invalidateQueries({ queryKey: ['feed'] })
queryClient.invalidateQueries({ queryKey: ['posts', userId] })

// Invalidate all queries whose key starts with 'user' (e.g. ['user', '1'], ['user', '2'])
queryClient.invalidateQueries({ queryKey: ['user'], refetchType: 'active' })

// refetchType: 'active' (default) = only refetch queries that have active observers
// refetchType: 'all' = refetch all matching queries
// exact: true = only ['user'], not ['user', id]`;

const SET_DATA_CODE = `// When mutation returns the new resource, set it directly (no refetch)
const mutation = useMutation({
  mutationFn: (data) => api.updateUser(userId, data),
  onSuccess: (updatedUser) => {
    queryClient.setQueryData(['user', userId], updatedUser)
    // Optional: still invalidate to fix any derived data
    queryClient.invalidateQueries({ queryKey: ['feed'] })
  },
})
// Use setQueryData when the server returns the full new object; use invalidate when other views need to refetch.`;

export default function CacheInvalidationPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Cache Invalidation
        </h1>
        <p className="text-xl text-content-muted">
          After a mutation, mark cached data as stale (or replace it) so the UI shows up-to-date data without unnecessary refetches.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          You update a resource (e.g. edit profile, add a post). The server succeeds, but the client still has the old data in its cache. If you don’t invalidate (or update) that cache, the user sees stale content until the next refetch or page load. You need a consistent way to say “this data is out of date” after a mutation so that the next read gets fresh data -or you update the cache directly when the server returns the new resource.
        </p>
        <p className="text-content">
          The flip side: invalidating too broadly causes a storm of refetches; invalidating too narrowly leaves other views stale. You want to invalidate the right keys (and optionally use <InlineCode>setQueryData</InlineCode> when you already have the new data).
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          Run the mutation and do nothing to the cache. Rely on <InlineCode>staleTime</InlineCode> or the user navigating away and back to trigger a refetch. The UI can stay stale until then.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          In <InlineCode>onSuccess</InlineCode> (or <InlineCode>onSettled</InlineCode>), call <InlineCode>{`queryClient.invalidateQueries({ queryKey: ['user', userId] })`}</InlineCode>. Every active query with that key is marked stale and refetched. Views that display that user’s data update automatically.
        </p>
        <CodeBlock code={FIRST_IMPROVEMENT_CODE} lang="tsx" />
        <p className="text-content mt-4 text-sm">
          <strong>Why this helps:</strong> One place declares “user X is stale”; all consumers refetch. No manual prop drilling or callback chains to refresh data.
        </p>
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Key design:</strong> Use a consistent query key hierarchy (e.g. <InlineCode>['user', id]</InlineCode>, <InlineCode>['feed']</InlineCode>) so you can invalidate by exact key or by prefix when a mutation affects multiple views.</li>
          <li><strong>setQueryData vs invalidate:</strong> If the mutation response returns the full updated resource, you can <InlineCode>setQueryData</InlineCode> and skip a refetch. If other derived data (e.g. a list that includes this item) is affected, invalidate those keys too.</li>
          <li><strong>refetchType:</strong> <InlineCode>invalidateQueries</InlineCode> with <InlineCode>refetchType: 'active'</InlineCode> only refetches queries that currently have observers (mounted components). Use <InlineCode>refetchType: 'all'</InlineCode> sparingly (e.g. after logout) to clear everything.</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          After every mutation that changes server state, either invalidate the affected query keys or set the cache from the response. Prefer invalidation when multiple consumers need fresh data or when the response doesn’t include the full resource. Use <InlineCode>setQueryData</InlineCode> when the API returns the new object and you want to avoid an extra request.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />
        <CodeBlock code={SET_DATA_CODE} lang="tsx" className="mt-4" label="Optional: setQueryData when response has full resource" />
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Invalidate:</strong> After create/update/delete that affects a list or detail view. Invalidate the list key and the detail key for the changed resource.</li>
          <li><strong>setQueryData:</strong> When the mutation response is the full new entity and you don’t need to refetch related data. Combine with invalidation for keys that aggregate this entity (e.g. feed).</li>
          <li><strong>Don’t over-invalidate:</strong> Avoid invalidating the whole cache (e.g. <InlineCode>queryKey: []</InlineCode> or no predicate) on every mutation; it causes a thundering herd of refetches.</li>
        </ul>
        <Callout variant="info" title="Optimistic + invalidation" className="mt-4">
          With optimistic updates, you apply the change in <InlineCode>onMutate</InlineCode> and invalidate in <InlineCode>onSettled</InlineCode> so the server remains the source of truth. Invalidation then refetches and corrects any drift.
        </Callout>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Key matching:</strong> <InlineCode>{`invalidateQueries({ queryKey: ['user'] })`}</InlineCode> matches all keys that start with <InlineCode>{`['user']`}</InlineCode> (e.g. <InlineCode>{`['user', '1']`}</InlineCode>). Use <InlineCode>{`exact: true`}</InlineCode> to match only <InlineCode>{`['user']`}</InlineCode>.</li>
          <li><strong>Timing:</strong> Invalidate in <InlineCode>onSettled</InlineCode> (not only <InlineCode>onSuccess</InlineCode>) so you refetch after an error too -e.g. if the mutation failed after an optimistic update, the refetch restores the previous data.</li>
          <li><strong>Dependent queries:</strong> If view B depends on data from query A (e.g. a detail page that uses the list’s item), invalidate A when the detail is updated so the list reflects the change when the user goes back.</li>
        </ul>
      </section>

      <p className="text-content-muted text-sm">
        <Link href="/frameworks/data-fetching" className="text-primary hover:underline">
          Data Fetching & Sync →
        </Link>
        {' · '}
        <Link href="/patterns/optimistic-updates" className="text-primary hover:underline">
          Optimistic Updates →
        </Link>
        {' · '}
        <Link href="/patterns" className="text-primary hover:underline">
          All patterns
        </Link>
      </p>

      <RelatedContent
        items={patternRelations['cache-invalidation'].frameworks}
        type="frameworks"
      />
      <RelatedContent
        items={patternRelations['cache-invalidation'].deepDives}
        type="deepDives"
      />
    </div>
  )
}
