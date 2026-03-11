import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'
import { Diagram } from '@/components/Diagram'
import { RedditMockup } from '@/components/mockups/RedditMockup'

const DATA_MODEL_CODE = `// The shape of data determines component and state decisions
interface User {
  id: string
  username: string
  avatarUrl: string
  karma: number
}

interface Post {
  id: string
  title: string
  body: string
  author: User
  subreddit: string
  score: number          // upvotes - downvotes
  userVote: 1 | 0 | -1  // current user's vote; 0 = no vote
  commentCount: number
  createdAt: string
  url?: string           // link posts
  imageUrl?: string
}

interface Comment {
  id: string
  body: string
  author: User
  score: number
  userVote: 1 | 0 | -1
  depth: number          // 0 = top-level; used to indent
  replies: Comment[]     // nested tree structure
  createdAt: string
  collapsed: boolean     // local UI state, not from API
}

// Feed response - cursor-paginated
interface FeedPage {
  posts: Post[]
  nextCursor: string | null
}`

const FEED_CODE = `import { useInfiniteQuery } from '@tanstack/react-query'

function useFeed(subreddit: string, sort: 'hot' | 'new' | 'top') {
  return useInfiniteQuery({
    queryKey: ['feed', subreddit, sort],
    queryFn: ({ pageParam }) =>
      fetch(\`/api/r/\${subreddit}?sort=\${sort}&cursor=\${pageParam ?? ''}\`)
        .then(r => r.json()) as Promise<FeedPage>,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 60_000,              // treat feed as fresh for 1 min
    refetchOnWindowFocus: false,    // avoid jarring re-order on focus
  })
}

// Feed component: flatten pages, detect scroll-end, optionally virtualize
function Feed({ subreddit, sort }: { subreddit: string; sort: 'hot' | 'new' | 'top' }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed(subreddit, sort)
  const posts = data?.pages.flatMap(p => p.posts) ?? []

  // Sentinel ref for infinite scroll (see Infinite Scroll pattern)
  const sentinelRef = useInfiniteScrollSentinel({ fetchNextPage, hasNextPage })

  return (
    <div>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
      <div ref={sentinelRef} />
      {isFetchingNextPage && <PostCardSkeleton />}
    </div>
  )
}`

const COMMENT_TREE_CODE = `// Recursive component - works well up to ~200 comments
function CommentNode({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div className="flex items-start gap-2 py-2">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="text-xs text-content-muted mt-1"
          aria-label={collapsed ? 'Expand comment' : 'Collapse comment'}
        >
          {collapsed ? '[+]' : '[–]'}
        </button>
        <div className="flex-1 min-w-0">
          <CommentHeader comment={comment} />
          {!collapsed && (
            <>
              <p className="text-sm text-content mt-1">{comment.body}</p>
              <VoteBar postId={comment.id} type="comment" score={comment.score} userVote={comment.userVote} />
            </>
          )}
        </div>
      </div>
      {!collapsed && comment.replies.map(reply => (
        <CommentNode key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </div>
  )
}

// collapse state is local - no need for global state or URL params.
// for threads with 500+ visible nodes, flatten and virtualize instead (see note below).`

const FLAT_TREE_CODE = `// For deep threads: flatten the tree, carry depth as a field
function flattenTree(comments: Comment[], depth = 0): FlatComment[] {
  return comments.flatMap(c => [
    { ...c, depth, collapsed: false },
    ...flattenTree(c.replies, depth + 1),
  ])
}

// Then virtualize the flat array with @tanstack/react-virtual
// Each row uses depth to compute the left indent - no DOM nesting.`

const VOTE_CODE = `import { useMutation, useQueryClient } from '@tanstack/react-query'

function useVote(postId: string, queryKey: unknown[]) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (direction: 1 | 0 | -1) =>
      fetch(\`/api/posts/\${postId}/vote\`, {
        method: 'POST',
        body: JSON.stringify({ direction }),
      }),

    onMutate: async (direction) => {
      // Cancel any in-flight refetch so it doesn't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData(queryKey)

      // Update the post in whichever cache holds it (feed page or post detail)
      queryClient.setQueryData(queryKey, (old: any) =>
        applyVote(old, postId, direction)
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })
}

// applyVote handles both shapes: a single Post and a paginated FeedPage[]
function applyVote(data: any, postId: string, direction: 1 | 0 | -1) {
  if (Array.isArray(data?.pages)) {
    // Infinite query - walk pages to find the post
    return {
      ...data,
      pages: data.pages.map((page: FeedPage) => ({
        ...page,
        posts: page.posts.map(p =>
          p.id === postId ? { ...p, userVote: direction, score: p.score + (direction - p.userVote) } : p
        ),
      })),
    }
  }
  // Post detail query - single object
  return data?.id === postId
    ? { ...data, userVote: direction, score: data.score + (direction - data.userVote) }
    : data
}`

const REALTIME_CODE = `// Reddit's actual strategy: polling for most surfaces, no WebSocket for feed
// Vote counts: polling every 60s is fine - users tolerate slight drift
const { data: post } = useQuery({
  queryKey: ['post', postId],
  queryFn: () => fetchPost(postId),
  refetchInterval: 60_000,
  refetchIntervalInBackground: false,
})

// New comments on a post: poll every 30s while the post detail is open
const { data: comments } = useQuery({
  queryKey: ['comments', postId],
  queryFn: () => fetchComments(postId),
  refetchInterval: 30_000,
  refetchIntervalInBackground: false,
})

// Notifications (inbox): poll every 60s
// Direct messages or live chat (r/place, awards): WebSocket
// The rule: if the user expects instant delivery, use WebSocket.
//            If a 30-60s delay is acceptable, polling is fine and simpler.`

const STATE_MAP_CODE = `// What lives where - the full picture

// 1. Auth (global client state - Zustand)
const useAuth = create<AuthStore>()(...)

// 2. Feed + post data (server state - React Query)
useInfiniteQuery({ queryKey: ['feed', subreddit, sort], ... })
useQuery({ queryKey: ['post', postId], ... })
useQuery({ queryKey: ['comments', postId], ... })

// 3. Feed sort / subreddit (URL - searchParams)
// /r/reactjs?sort=hot  ->  read with useSearchParams(); update with router.push()
// Shareable, survives refresh, back/forward works correctly

// 4. Comment collapse (local component state)
const [collapsed, setCollapsed] = useState(false)
// No need to lift this - it's ephemeral UI for one comment node

// 5. Compose post / comment form (local form state - React Hook Form)
// Only lifted to server state when the mutation succeeds

// 6. Theme / subreddit color (CSS variables set by layout)
// Read from server on page load; applied as inline style on <body>
// No client state needed - it's a CSS concern`

const PERF_CODE = `// 1. Route-based code splitting - automatic in Next.js App Router
// Each page in /app is its own bundle

// 2. Lazy-load the rich text editor - it's heavy (~200kb gzipped)
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  loading: () => <Textarea placeholder="Write your post..." />,
  ssr: false,
})
// Only loads when the user opens the compose modal

// 3. Virtualize the feed - past ~50 posts, rendering all is wasteful
import { useVirtualizer } from '@tanstack/react-virtual'
const virtualizer = useVirtualizer({
  count: posts.length,
  getScrollElement: () => containerRef.current,
  estimateSize: () => 120,  // approximate post card height
  overscan: 5,
})

// 4. Images - next/image with lazy loading and responsive sizes
<Image src={post.imageUrl} alt="" fill sizes="(max-width: 768px) 100vw, 640px" />

// 5. Prefetch on hover - feels instant when the user navigates
<Link href={\`/r/\${subreddit}/comments/\${post.id}\`} prefetch={false}
  onMouseEnter={() => router.prefetch(\`/r/\${subreddit}/comments/\${post.id}\`)}
>`

export default function RedditSystemDesignPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-4">
        <span className="text-xs font-medium uppercase tracking-widest text-content-muted">
          System Design
        </span>
      </div>
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">Reddit</h1>
        <p className="text-xl text-content-muted">
          Feed + nested comments + voting + real-time feel. How I'd architect the frontend: which patterns handle which surfaces, where state lives, and the tradeoffs I'd make.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-lg font-semibold text-content mb-3">What we&apos;re building</h2>
        <RedditMockup />
        <p className="text-content-muted text-sm mt-2">
          A cursor-paginated <strong className="text-content">FeedList</strong> with per-post <strong className="text-content">VoteButtons</strong> (optimistic updates), and a recursive <strong className="text-content">CommentTree</strong> with local collapse state. Both surfaces share one React Query cache.
        </p>
      </div>

      {/* The Challenge */}
      <section id="the-challenge" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The Challenge</h2>
        <p className="text-content mb-4">
          Reddit's frontend looks deceptively simple: it's a list of posts and a tree of comments. The actual complexity is in four places:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-content mb-4">
          <li><strong>The feed is paginated and ranked.</strong> Hot/new/top sorts produce different orderings; the user expects <Link href="/patterns/infinite-scroll" className="text-primary hover:underline">infinite scroll</Link> without the feed jumping or re-ordering under them.</li>
          <li><strong>Comment threads are recursive trees.</strong> A single post can have thousands of comments nested 10+ levels deep. Naive recursion kills render performance at scale.</li>
          <li><strong>Voting must feel instant.</strong> Every vote is an <Link href="/patterns/optimistic-updates" className="text-primary hover:underline">optimistic mutation</Link> against a server that may reject it. The same post appears in multiple query cache entries (feed + post detail), so you have to update both without introducing inconsistency.</li>
          <li><strong>Real-time feel without WebSockets.</strong> Reddit historically used <Link href="/patterns/polling-vs-websockets" className="text-primary hover:underline">polling (not WebSockets)</Link> for vote counts and new comments. The question is what interval is acceptable, and what actually warrants a persistent connection.</li>
        </ul>
        <p className="text-content">
          The decisions below are the ones that actually matter. I'll skip the boilerplate.
        </p>
      </section>

      {/* Data Model */}
      <section id="data-model" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Data Model</h2>
        <p className="text-content mb-4">
          Getting the shape right up front determines how simple or painful every downstream decision is. Three things worth calling out:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-content mb-6">
          <li><InlineCode>userVote: 1 | 0 | -1</InlineCode> lives on both <InlineCode>Post</InlineCode> and <InlineCode>Comment</InlineCode>. This is the user's current vote state, not a separate entity. It makes optimistic updates trivial: toggle the value and adjust <InlineCode>score</InlineCode> arithmetically.</li>
          <li><InlineCode>replies: Comment[]</InlineCode> makes the tree recursive. The server sends the full subtree up to a depth limit (~3-5 levels). "Load more replies" is a separate fetch appended to that node.</li>
          <li><InlineCode>depth</InlineCode> is a derived field. The API doesn't need to return it - you compute it as you traverse the tree. But keeping it on the flat model is useful for virtualized rendering.</li>
        </ul>
        <CodeBlock code={DATA_MODEL_CODE} lang="ts" />
      </section>

      {/* Architecture Map */}
      <section id="architecture-map" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Architecture Map</h2>
        <p className="text-content mb-6">
          Each surface in Reddit maps to a specific pattern or framework decision. This is the full picture before diving into each:
        </p>
        <Diagram className="mb-8" chart={`
flowchart LR
  subgraph Client["Client"]
    Feed["FeedList\\n(infinite scroll)"]
    Post["PostDetail"]
    Vote["VoteButton\\n(optimistic)"]
    CommentTree["CommentTree\\n(recursive)"]
  end
  subgraph Cache["React Query Cache"]
    FC["feed cache\\n['feed', sub, sort]"]
    PC["post cache\\n['post', id]"]
    CC["comments cache\\n['comments', postId]"]
  end
  API["Reddit API"]
  SSR["SSR\\n(Next.js)"]

  Feed --> FC
  Post --> PC
  Vote --> FC & PC
  CommentTree --> CC
  FC & PC & CC --> API
  SSR --> FC & PC
        `} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-content-border">
                <th className="text-left py-2 pr-4 font-semibold text-content">Surface</th>
                <th className="text-left py-2 pr-4 font-semibold text-content">Pattern / Framework</th>
                <th className="text-left py-2 font-semibold text-content">Key decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-content-border">
              <tr>
                <td className="py-3 pr-4 text-content font-medium">Feed</td>
                <td className="py-3 pr-4 text-content-muted">Infinite Scroll + React Query</td>
                <td className="py-3 text-content-muted">Cursor pagination; virtualize past ~50 posts</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-content font-medium">Comments</td>
                <td className="py-3 pr-4 text-content-muted">Recursive component + optional virtualization</td>
                <td className="py-3 text-content-muted">Collapse state is local; flatten tree for large threads</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-content font-medium">Voting</td>
                <td className="py-3 pr-4 text-content-muted">Optimistic Updates + Cache Invalidation</td>
                <td className="py-3 text-content-muted">Update both feed cache and post-detail cache on mutate</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-content font-medium">Live vote counts</td>
                <td className="py-3 pr-4 text-content-muted">Polling vs WebSockets</td>
                <td className="py-3 text-content-muted">60s poll is fine; WebSocket only for chat / r/place</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-content font-medium">Feed sort/filter</td>
                <td className="py-3 pr-4 text-content-muted">URL state</td>
                <td className="py-3 text-content-muted">Sort in searchParams; shareable and survives refresh</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-content font-medium">Auth / user</td>
                <td className="py-3 pr-4 text-content-muted">State Architecture (global)</td>
                <td className="py-3 text-content-muted">Zustand store; read by vote buttons, navbar, composer</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-content font-medium">Post / comment form</td>
                <td className="py-3 pr-4 text-content-muted">Form Validation</td>
                <td className="py-3 text-content-muted">React Hook Form; lazy-load rich text editor</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-content font-medium">Initial page load</td>
                <td className="py-3 pr-4 text-content-muted">Rendering Strategy (SSR)</td>
                <td className="py-3 text-content-muted">SSR first page of feed for SEO; hydrate with React Query</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-content font-medium">Bundle size</td>
                <td className="py-3 pr-4 text-content-muted">Performance Architecture</td>
                <td className="py-3 text-content-muted">Route splitting automatic; lazy-load editor, media player</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Feed Architecture */}
      <section id="feed-architecture" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Feed Architecture</h2>
        <p className="text-content mb-4">
          The feed is cursor-paginated, not offset. Offset pagination breaks when posts are inserted or promoted between pages (the user sees duplicates or skips). A cursor points to the last-seen item and the server returns the next batch from there.
        </p>
        <p className="text-content mb-4">
          React Query's <InlineCode>useInfiniteQuery</InlineCode> manages pages as a flat list you concatenate for rendering. The query key includes both <InlineCode>subreddit</InlineCode> and <InlineCode>sort</InlineCode>. Changing sort invalidates the cache and starts fresh, which is the correct behavior (a "new" sort fetch is not the same data as "hot").
        </p>
        <CodeBlock code={FEED_CODE} lang="tsx" />
        <Callout variant="info" title="When to virtualize" className="mt-6">
          For a standard subreddit browsing session, a user rarely sees more than 30-40 posts before navigating to a post detail. <Link href="/patterns/virtualized-lists" className="text-primary hover:underline">Virtualization</Link> is worth adding when you have evidence users are scrolling deep - or if post cards are heavy (images, video previews). Add it after you&apos;ve profiled, not before.
        </Callout>
        <p className="text-content mt-4">
          <InlineCode>staleTime: 60_000</InlineCode> prevents the feed from re-sorting itself when the user navigates back. Without it, the first query after 0ms of staleness re-fetches, and "hot" posts in different positions make the list jump. One minute of staleness is a deliberate UX choice.
        </p>
      </section>

      {/* Comment Threads */}
      <section id="comment-threads" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Comment Threads</h2>
        <p className="text-content mb-4">
          Collapse state is local. This is the first decision people get wrong: they reach for Zustand or URL params for comment collapse. Don't. It's ephemeral UI state owned by one component instance. When the user refreshes, comments should all start expanded. Local <InlineCode>useState</InlineCode> is correct.
        </p>
        <CodeBlock code={COMMENT_TREE_CODE} lang="tsx" />
        <p className="text-content mt-6 mb-4">
          The recursive approach works up to ~200 visible comment nodes before you start seeing layout jank on lower-end devices. For threads that regularly exceed that (AMAs, viral posts) you need to flatten the tree and <Link href="/patterns/virtualized-lists" className="text-primary hover:underline">virtualize</Link>.
        </p>
        <CodeBlock code={FLAT_TREE_CODE} lang="ts" label="Flatten tree for virtualization" />
        <Callout variant="warning" title="The depth limit problem" className="mt-6">
          The server typically returns comments up to depth 5-7. "Load more replies" at deep nodes is a separate API call that appends into the tree. When you flatten for virtualization, re-inserting those new nodes at the right index is the tricky part. Keep the flat array derived (not a separate state) so re-deriving it on data change is always correct.
        </Callout>
      </section>

      {/* Voting System */}
      <section id="voting-system" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Voting System</h2>
        <p className="text-content mb-4">
          Voting is the most complex mutation in Reddit because the same post lives in multiple query cache entries simultaneously. A post appears in the feed query (<InlineCode>['feed', subreddit, sort]</InlineCode>) and in the post detail query (<InlineCode>['post', postId]</InlineCode>). If you only optimistically update one, the other shows stale vote state when the user navigates.
        </p>
        <p className="text-content mb-4">
          The solution is to pass the <InlineCode>queryKey</InlineCode> to the vote hook so the caller decides which cache entry to update. In practice, the feed card passes the feed key; the post detail passes the detail key. Both fire the same mutation function; the cache update logic handles both shapes.
        </p>
        <CodeBlock code={VOTE_CODE} lang="tsx" />
        <Diagram className="my-6" chart={`
sequenceDiagram
  actor User
  participant UI as React Query Cache
  participant API as Reddit API

  User->>UI: Click upvote
  UI->>UI: Snapshot feed + post cache entries
  UI->>UI: Apply optimistic update to both
  UI->>API: POST /vote (async, background)
  alt Success
    API-->>UI: 200 OK
    UI->>UI: invalidateQueries (refetch for truth)
  else Failure (rate limit / auth)
    API-->>UI: 4xx
    UI->>UI: Rollback both cache entries from snapshot
    UI->>User: Toast "Couldn't vote. Try again."
  end
        `} />
        <Callout variant="info" title="Why not normalize?" className="mt-6">
          A <Link href="/patterns/normalized-state" className="text-primary hover:underline">normalized cache</Link> (Apollo-style) would automatically update every reference to the same post across all queries. That's appealing. But React Query's flat cache is simpler and the dual-shape <InlineCode>applyVote</InlineCode> function handles it cleanly. I'd add normalization only if I had many more surfaces that share the same post entity - and even then I'd use TanStack Query's <InlineCode>queryClient.setQueriesData</InlineCode> with a predicate before reaching for a third-party normalized cache.
        </Callout>
      </section>

      {/* Real-Time Strategy */}
      <section id="real-time-strategy" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Real-Time Strategy</h2>
        <p className="text-content mb-4">
          Reddit does not use WebSockets for the feed or comments in its standard experience. This surprises people. The actual strategy is deliberate polling, and it's the right call for most surfaces:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-content mb-6">
          <li><strong>Vote counts on the feed:</strong> 60s poll while the page is visible. Users tolerate stale vote counts; a number jumping from 847 to 852 while they're reading doesn't matter.</li>
          <li><strong>New comments on a post detail:</strong> 30s poll. A "X new comments - click to load" banner is the right UX rather than auto-inserting comments and shifting the user's reading position.</li>
          <li><strong>Live notifications / inbox:</strong> 60s poll. For most users this is fine; power users can enable browser notifications via the Push API.</li>
          <li><strong>r/place, live threads, chat:</strong> WebSocket. These are the minority of surfaces where sub-second latency actually matters.</li>
        </ul>
        <CodeBlock code={REALTIME_CODE} lang="tsx" />
        <p className="text-content mt-4">
          The discipline here is <InlineCode>refetchIntervalInBackground: false</InlineCode>. Without it, every open tab polls continuously even when the user isn't looking at it. At Reddit's scale, that's a meaningful server cost.
        </p>
      </section>

      {/* State Architecture */}
      <section id="state-architecture" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">State Architecture</h2>
        <p className="text-content mb-4">
          The most common mistake I see in Reddit-like apps is over-centralizing state. Everything ends up in a Zustand store or global Context - feed data, comment collapse, vote state, form values. The result is a store that becomes a dumping ground and components that re-render whenever anything in it changes.
        </p>
        <p className="text-content mb-4">
          The right approach is to put each piece of state in the layer that owns it:
        </p>
        <CodeBlock code={STATE_MAP_CODE} lang="tsx" />
        <Callout variant="success" title="The test" className="mt-6">
          For any piece of state, ask: does it need to survive navigation? Does more than one distant component need it? If yes to either - lift it. URL for navigation-safe data; React Query for server data; Zustand for cross-cutting client state like auth. If no - keep it local.
        </Callout>
      </section>

      {/* Performance */}
      <section id="performance" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Performance</h2>
        <p className="text-content mb-4">
          Reddit has two distinct performance problems: initial load (LCP) and scroll performance. They require different tools.
        </p>
        <p className="text-content mb-4">
          For LCP: SSR the first page of the feed and the post detail. The above-the-fold content needs to be in the HTML - both for SEO (Google indexes the first page of each subreddit) and for perceived performance (no loading spinner on the first paint). Next.js App Router with React Query's server prefetching handles this cleanly.
        </p>
        <p className="text-content mb-4">
          For scroll: the rich text editor is the single biggest bundle hit (~200kb gzipped for a full Quill or TipTap install). <Link href="/patterns/code-splitting-lazy-loading" className="text-primary hover:underline">Lazy-load it behind a dynamic import</Link> that only triggers when the user opens the compose modal. The rest of scroll performance comes from <Link href="/patterns/virtualized-lists" className="text-primary hover:underline">virtualization</Link> and stable keys.
        </p>
        <CodeBlock code={PERF_CODE} lang="tsx" />
        <Callout variant="info" title="Prefetch on hover" className="mt-6">
          The last snippet - prefetching the post detail route on mouse enter - is one of the highest-ROI performance wins available in Next.js. It makes navigation feel instant because the JS bundle and initial data are already loaded before the user clicks. Use it on any link the user is likely to navigate to.
        </Callout>
      </section>

      {/* Building Blocks */}
      <section id="building-blocks" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Building Blocks</h2>
        <p className="text-content mb-6">
          Every piece of this design maps to a pattern or framework covered in detail elsewhere:
        </p>
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-content-muted mb-3">Patterns</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Infinite Scroll', href: '/patterns/infinite-scroll', note: 'Feed + comment pagination' },
              { label: 'Optimistic Updates', href: '/patterns/optimistic-updates', note: 'Voting' },
              { label: 'Cache Invalidation', href: '/patterns/cache-invalidation', note: 'Post + feed sync after vote' },
              { label: 'Virtualized Lists', href: '/patterns/virtualized-lists', note: 'Deep comment threads' },
              { label: 'Polling vs WebSockets', href: '/patterns/polling-vs-websockets', note: 'Live vote counts' },
              { label: 'Loading States', href: '/patterns/loading-states', note: 'Feed, comments, vote button' },
              { label: 'Form Validation', href: '/patterns/form-validation', note: 'Post + comment composer' },
              { label: 'Debouncing & Throttling', href: '/patterns/debouncing-throttling', note: 'Search autocomplete' },
            ].map(({ label, href, note }) => (
              <Link
                key={href}
                href={href}
                className="block p-3 rounded-lg border border-content-border hover:border-primary transition-colors group"
              >
                <div className="text-sm font-medium text-content group-hover:text-primary transition-colors">{label}</div>
                <div className="text-xs text-content-muted mt-0.5">{note}</div>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-content-muted mb-3">Frameworks</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'State Architecture', href: '/frameworks/state-architecture', note: 'Auth, UI state, form state' },
              { label: 'Data Fetching & Sync', href: '/frameworks/data-fetching', note: 'React Query throughout' },
              { label: 'Rendering Strategy', href: '/frameworks/rendering-strategy', note: 'SSR for feed + post detail' },
              { label: 'Performance Architecture', href: '/frameworks/performance-architecture', note: 'Bundle splitting, virtualization' },
            ].map(({ label, href, note }) => (
              <Link
                key={href}
                href={href}
                className="block p-3 rounded-lg border border-content-border hover:border-primary transition-colors group"
              >
                <div className="text-sm font-medium text-content group-hover:text-primary transition-colors">{label}</div>
                <div className="text-xs text-content-muted mt-0.5">{note}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What I'd Do Differently */}
      <section id="tradeoffs" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">What I'd Do Differently</h2>
        <ul className="list-disc pl-6 space-y-4 text-content">
          <li>
            <strong>I'd skip the dual-shape <InlineCode>applyVote</InlineCode> helper and use <InlineCode>queryClient.setQueriesData</InlineCode> with a predicate instead.</strong> Setting data on all matching queries in one call is cleaner than passing the specific <InlineCode>queryKey</InlineCode> down through props. The predicate lets you match any query whose key starts with <InlineCode>['feed']</InlineCode> or equals <InlineCode>['post', postId]</InlineCode> in one sweep.
          </li>
          <li>
            <strong>I'd add a "new comments available" banner before auto-polling inserts comments.</strong> Automatically inserting new comments while a user is mid-read shifts their scroll position. The correct UX is to show a dismissible banner ("12 new comments") and let the user decide when to load them - similar to Twitter's "See X new Tweets."
          </li>
          <li>
            <strong>I would not virtualize comment threads by default.</strong> It adds real complexity (tree flattening, index management for "load more" insertions, scroll restoration). I'd ship the recursive component, profile on a real device with a high-comment thread, and only reach for virtualization if I had data showing jank. Most posts don't have 500+ visible comments.
          </li>
          <li>
            <strong>I'd use URL hash for active comment.</strong> Deep-linking to a specific comment (<InlineCode>/comments/abc#comment-xyz</InlineCode>) is a Reddit feature that requires the target comment to be scrolled into view on load. This is non-trivial with a virtualized list - you have to scroll the virtualizer to the index before the user sees the page. With the recursive DOM approach, the browser handles it natively for free.
          </li>
        </ul>
      </section>

      <p className="text-content-muted text-sm">
        <Link href="/frameworks/data-fetching" className="text-primary hover:underline">
          Data Fetching & Sync →
        </Link>
        {' · '}
        <Link href="/frameworks/state-architecture" className="text-primary hover:underline">
          State Architecture →
        </Link>
        {' · '}
        <Link href="/patterns" className="text-primary hover:underline">
          All patterns
        </Link>
      </p>
    </div>
  )
}
