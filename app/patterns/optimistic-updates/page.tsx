import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { CodeWithPreview } from '@/components/CodeWithPreview'
import { Callout, InlineCode } from '@/components/ui'
import { OptimisticLikeDemo } from '@/components/demos/OptimisticLikeDemo'
import { RelatedContent } from '@/components/RelatedContent'
import { patternRelations } from '@/lib/related-content'

const NAIVE_CODE = `// User clicks "Like" - we wait for the server, then update
function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    setLoading(true)
    try {
      await fetch(\`/api/posts/\${postId}/like\`, { method: 'POST' })
      setLiked(true)  // Only after round-trip
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleLike} disabled={loading}>
      {loading ? <Spinner /> : liked ? 'Liked' : 'Like'}
    </button>
  )
}
// Every like feels sluggish; on slow networks it's painful.`;

const FIRST_IMPROVEMENT_CODE = `// Update UI first, then sync with server
function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    setLiked(true)   // ✅ Optimistic: show new state immediately
    setLoading(true)
    try {
      await fetch(\`/api/posts/\${postId}/like\`, { method: 'POST' })
    } catch {
      setLiked(false)  // ✅ Rollback on failure
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleLike} disabled={loading}>
      {liked ? 'Liked' : 'Like'}
    </button>
  )
}
// Feels instant. But: what if we're reading from a cache (e.g. React Query)?
// Manual setState doesn't update the cache - next refetch overwrites our change.`;

const PRODUCTION_CODE = `import { useMutation, useQueryClient } from '@tanstack/react-query'

function LikeButton({ postId, initialLiked }: { postId: string; initialLiked: boolean }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => fetch(\`/api/posts/\${postId}/like\`, { method: 'POST' }),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] })
      const previous = queryClient.getQueryData(['post', postId])
      queryClient.setQueryData(['post', postId], (old: any) => ({
        ...old,
        liked: !old.liked,
        likeCount: old.likeCount + (old.liked ? -1 : 1),
      }))
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['post', postId], context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
    },
  })

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      {initialLiked ? 'Liked' : 'Like'}
    </button>
  )
}
// Cache stays consistent; rollback is correct; refetches don't clobber optimistic state.`;

export default function OptimisticUpdatesPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Optimistic Updates
        </h1>
        <p className="text-xl text-content-muted">
          Update the UI immediately on user action, then sync with the server. Roll back cleanly if the request fails.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          Every like, follow, or toggle that waits for the server before updating the UI feels sluggish. On slow or flaky networks, users assume the tap didn’t register and tap again. The fix is to show the new state immediately and reconcile with the server in the background -optimistic updates.
        </p>
        <p className="text-content">
          The catch: if the request fails, you must roll back. And if you’re using a cache (e.g. React Query), the optimistic change has to live in that cache so refetches and other components stay in sync.
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          Wait for the server, then update local state. Simple, but every interaction blocks on the network.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          Flip state immediately, then fire the request. On error, set state back. The UI feels instant; the logic is still local to one component.
        </p>
        <div className="mb-6">
          <CodeWithPreview
            code={FIRST_IMPROVEMENT_CODE}
            lang="tsx"
            codeLabel="Optimistic setState + rollback"
            preview={<OptimisticLikeDemo />}
            previewLabel="Click Like - instant toggle; failure would roll back"
            layout="stacked"
          />
        </div>
        <p className="text-content text-sm">
          <strong>Why this helps:</strong> Users get immediate feedback. Rollback on error keeps the UI truthful when the server rejects the action.
        </p>
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Cache vs local state:</strong> If the like count comes from React Query (or similar), updating only local state means the next refetch overwrites your optimistic change. The cache is the source of truth for the rest of the app.</li>
          <li><strong>Racing refetches:</strong> A background refetch that finishes after you’ve applied an optimistic update can overwrite it with stale server data if you don’t cancel or sequence refetches.</li>
          <li><strong>Multiple mutations:</strong> Rapid clicks (e.g. Like → Unlike) can complete out of order; you need a consistent rollback and invalidation strategy.</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          Use React Query’s <InlineCode>useMutation</InlineCode> with <InlineCode>onMutate</InlineCode>, <InlineCode>onError</InlineCode>, and <InlineCode>onSettled</InlineCode>: snapshot the cache, apply the optimistic change to the cache, roll back from the snapshot on error, and invalidate on settle so the server remains the source of truth.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />
        <p className="text-content mt-4 text-sm">
          <InlineCode>cancelQueries</InlineCode> in <InlineCode>onMutate</InlineCode> prevents an in-flight refetch from overwriting your optimistic update. <InlineCode>onSettled</InlineCode> invalidates so the next read gets fresh data from the server.
        </p>
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Use:</strong> Reversible, low-stakes actions (like, follow, bookmark, toggle settings). High frequency, user expects instant feedback.</li>
          <li><strong>Skip:</strong> Destructive or high-stakes actions (delete, payment, publish). A rollback after “Success” is worse than a spinner; use loading state and confirm only after the server responds.</li>
        </ul>
        <Callout variant="info" title="Decision" className="mt-4">
          If rolling back would confuse or alarm the user, don’t be optimistic -show loading and wait for the server.
        </Callout>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Racing mutations:</strong> Disable the button with <InlineCode>mutation.isPending</InlineCode> (or equivalent) so the user can’t fire a second mutation before the first settles.</li>
          <li><strong>Dependent data:</strong> If “user A followed user B” affects both profiles, invalidate all related query keys in <InlineCode>onSettled</InlineCode> so every view stays in sync.</li>
          <li><strong>Toast on rollback:</strong> When you roll back, show a short toast (“Couldn’t update. Try again.”) so the user knows the action didn’t stick.</li>
        </ul>
      </section>

      <p className="text-content-muted text-sm">
        <Link href="/frameworks/data-fetching" className="text-primary hover:underline">
          Data Fetching & Sync framework →
        </Link>
        {' · '}
        <Link href="/patterns" className="text-primary hover:underline">
          All patterns
        </Link>
      </p>

      <RelatedContent
        items={patternRelations['optimistic-updates']?.frameworks}
        type="frameworks"
      />
      <RelatedContent
        items={patternRelations['optimistic-updates']?.deepDives}
        type="deepDives"
      />
    </div>
  )
}
