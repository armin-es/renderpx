/**
 * Data Fetching & Sync progressive examples: code + metadata.
 * Five escalating approaches to the same problem: fetching a user profile.
 */
export const dataFetchingExampleContent: Record<
  string,
  { description: string; code: string; explanation: string; whenThisBreaks: string }
> = {
  '01-useeffect': {
    description:
      'Raw useEffect + useState: the baseline every React developer starts with. Works for simple, one-off fetches with no caching, deduplication, or race condition protection.',
    code: `function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch(\`/api/users/\${userId}\`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(data => {
        setLoading(false)
        setUser(data)
      })
      .catch(err => {
        setLoading(false)
        setError(err)
      })
  }, [userId])

  if (loading) return <Spinner />
  if (error) return <ErrorMessage error={error} />
  return <ProfileCard user={user} />
}`,
    explanation: `Works when:
• Single component, single fetch
• userId never changes after mount
• No other component needs the same data
• Simple, throwaway UI

Simple to understand and zero dependencies.`,
    whenThisBreaks: `Switch userId quickly → race condition: the slower first request resolves after the second, overwriting the correct result with stale data.

Also: every mount re-fetches, even if the data is seconds old. Two <UserProfile userId="1"> components on the same page make two identical API calls.`,
  },

  '02-custom-hook': {
    description:
      'Extract the fetch logic into a reusable custom hook. Adds a cancellation flag to fix race conditions. Still no caching — every hook instance fetches independently.',
    code: `// Reusable hook — handles race conditions and error state
function useUser(userId: string) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false  // ✅ fix race conditions

    setLoading(true)
    setError(null)

    fetch(\`/api/users/\${userId}\`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(data => {
        if (!cancelled) {  // ✅ ignore stale responses
          setLoading(false)
          setUser(data)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setLoading(false)
          setError(err)
        }
      })

    return () => { cancelled = true }  // ✅ cleanup on re-run
  }, [userId])

  return { user, loading, error }
}

// Clean consumer — no async logic, just presentation
function UserProfile({ userId }: { userId: string }) {
  const { user, loading, error } = useUser(userId)

  if (loading) return <Spinner />
  if (error) return <ErrorMessage error={error} />
  return <ProfileCard user={user} />
}`,
    explanation: `Better because:
• Race condition is fixed — stale responses are ignored
• Logic is extracted and reusable across components
• Clean separation: hook owns async, component owns rendering
• Easy to test the hook in isolation`,
    whenThisBreaks: `Two <UserProfile userId="1"> components still make two API calls — no deduplication.

Re-mounting re-fetches every time — navigate away and back, another request fires.

No background refresh. No way to trigger a refetch from outside the component. Retry on failure requires custom logic. Manual cache invalidation is not possible.`,
  },

  '03-react-query': {
    description:
      'React Query (TanStack Query) treats server state as a first-class concern. Caching, deduplication, background refresh, retry, and stale-while-revalidate come for free.',
    code: `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// 1. Wrap your app once
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  )
}

// 2. Fetch with useQuery — that's it
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isPending, isError, error } = useQuery({
    queryKey: ['user', userId],  // cache key
    queryFn: () => fetch(\`/api/users/\${userId}\`).then(r => r.json()),
    staleTime: 60_000,  // treat as fresh for 1 minute
  })

  if (isPending) return <Spinner />
  if (isError) return <ErrorMessage error={error} />
  return <ProfileCard user={user} />
}
// ✅ Two <UserProfile userId="1"> = one API call (deduplicated)
// ✅ Navigate away and back = instant (cached), background refresh
// ✅ Race conditions handled internally
// ✅ Auto-retry on network failure

// 3. Mutations with cache invalidation
function UpdateEmail({ userId }: { userId: string }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (newEmail: string) =>
      fetch(\`/api/users/\${userId}\`, {
        method: 'PATCH',
        body: JSON.stringify({ email: newEmail }),
      }),
    onSuccess: () => {
      // Invalidate cache → triggers background refetch
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
    },
  })

  return (
    <button onClick={() => mutation.mutate('new@email.com')}>
      {mutation.isPending ? 'Saving...' : 'Update Email'}
    </button>
  )
}`,
    explanation: `React Query solves the whole class of server-state problems:
• Caching: same queryKey = single network request, shared across components
• Background refresh: stale data shows instantly, fresh data arrives quietly
• Deduplication: concurrent requests for the same key collapse to one
• Retry: failed requests retry automatically with backoff
• Invalidation: mutations can invalidate related queries

This is why "fetch in useEffect" is an anti-pattern for production apps.`,
    whenThisBreaks: `React Query is built for client-side fetching. It doesn't help when:
• You need server-rendered HTML with data (use RSC or getServerSideProps)
• Data changes in real-time and polling is too slow (use WebSockets)
• You have complex optimistic update rollback logic (useMutation + onError helps, but still requires care)`,
  },

  '04-optimistic': {
    description:
      'Optimistic updates: update the UI immediately on user action, then sync with the server. Rolls back cleanly if the server rejects the change.',
    code: `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

function UserProfile({ userId }: { userId: string }) {
  const queryClient = useQueryClient()

  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(\`/api/users/\${userId}\`).then(r => r.json()),
  })

  const followMutation = useMutation({
    mutationFn: (isFollowing: boolean) =>
      fetch(\`/api/users/\${userId}/follow\`, {
        method: isFollowing ? 'DELETE' : 'POST',
      }),

    // ✅ Step 1: Optimistically update before request completes
    onMutate: async (isFollowing) => {
      // Cancel any outgoing refetches (they'd overwrite optimistic update)
      await queryClient.cancelQueries({ queryKey: ['user', userId] })

      // Snapshot current value for rollback
      const previous = queryClient.getQueryData(['user', userId])

      // Apply optimistic change immediately
      queryClient.setQueryData(['user', userId], (old: any) => ({
        ...old,
        isFollowing: !isFollowing,
        followerCount: old.followerCount + (isFollowing ? -1 : 1),
      }))

      return { previous }  // context for onError
    },

    // ✅ Step 2: Rollback on failure
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['user', userId], context?.previous)
    },

    // ✅ Step 3: Sync with server truth after settle
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
    },
  })

  return (
    <div>
      <ProfileCard user={user} />
      <button
        onClick={() => followMutation.mutate(user.isFollowing)}
        disabled={followMutation.isPending}
      >
        {user.isFollowing ? 'Unfollow' : 'Follow'}
        {/* ✅ Updates instantly — no wait for server */}
        ({user.followerCount})
      </button>
    </div>
  )
}`,
    explanation: `Optimistic updates give the UI instant feedback — no loading spinner for every interaction.

The three steps are always the same:
1. onMutate: snapshot → apply change → save snapshot in context
2. onError: use context.previous to roll back
3. onSettled: always invalidate to sync with server truth

React Query's cancelQueries in onMutate prevents a background refetch from overwriting your optimistic change before the mutation resolves.`,
    whenThisBreaks: `Rollback surprises users when errors are frequent (network issues, validation failures). Design your UI to minimize how jarring a rollback looks.

Complex dependent data (user A following user B affects both profiles) requires careful invalidation of multiple query keys.

Avoid optimistic updates for destructive actions (delete, payment) — instant feedback on "Success" for a failed payment is worse than a spinner.`,
  },

  '05-realtime': {
    description:
      'Real-time sync with polling as a starting point, and WebSocket for true push updates. React Query integrates with both patterns cleanly.',
    code: `import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

// --- APPROACH 1: Polling (simple, works for slow-changing data) ---
function NotificationBadge({ userId }: { userId: string }) {
  const { data } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => fetch(\`/api/users/\${userId}/notifications\`).then(r => r.json()),
    refetchInterval: 30_000,         // poll every 30 seconds
    refetchIntervalInBackground: false,  // pause when tab is hidden
  })

  return <Badge count={data?.unread ?? 0} />
}

// --- APPROACH 2: WebSocket (real-time, for chat / collaboration) ---
function useLiveQuery<T>(queryKey: unknown[], wsUrl: string, queryFn: () => Promise<T>) {
  const queryClient = useQueryClient()

  // Initial data via React Query (caching, loading, error handling)
  const query = useQuery({ queryKey, queryFn })

  // WebSocket pushes invalidations — React Query re-fetches
  useEffect(() => {
    const ws = new WebSocket(wsUrl)

    ws.onmessage = (event) => {
      const { type } = JSON.parse(event.data)
      if (type === 'INVALIDATE') {
        queryClient.invalidateQueries({ queryKey })
      }
    }

    return () => ws.close()
  }, [wsUrl, queryKey, queryClient])

  return query
}

// Usage: live chat messages
function ChatMessages({ roomId }: { roomId: string }) {
  const { data: messages } = useLiveQuery(
    ['messages', roomId],
    \`wss://api.example.com/rooms/\${roomId}\`,
    () => fetch(\`/api/rooms/\${roomId}/messages\`).then(r => r.json()),
  )

  return <MessageList messages={messages} />
}

// --- APPROACH 3: Optimistic + real-time ---
// Send a message optimistically, let WebSocket confirm
function useAddMessage(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (text: string) =>
      fetch(\`/api/rooms/\${roomId}/messages\`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      }),
    onMutate: async (text) => {
      const optimisticMsg = { id: crypto.randomUUID(), text, status: 'sending' }
      queryClient.setQueryData(['messages', roomId], (old: any[]) => [
        ...old,
        optimisticMsg,
      ])
      return { optimisticId: optimisticMsg.id }
    },
    onError: (_err, _text, context) => {
      queryClient.setQueryData(['messages', roomId], (old: any[]) =>
        old.filter(m => m.id !== context?.optimisticId)
      )
    },
  })
}`,
    explanation: `Two real-time patterns, each for different data velocity:

Polling: simplest, works for anything that updates every 30+ seconds. Notifications, status indicators, dashboards. React Query handles it in one line: refetchInterval.

WebSocket: true push for anything that needs sub-second updates. Chat, collaborative cursors, live scores. Pattern: React Query handles initial load + cache; WebSocket delivers invalidations; React Query re-fetches.

The combination of optimistic updates + WebSocket is how modern chat UIs work: your message appears instantly (optimistic), server confirms or rejects, WebSocket delivers other users' messages.`,
    whenThisBreaks: `WebSocket reconnection logic adds complexity — handle onclose, implement exponential backoff, manage connection state.

Server-Sent Events (SSE) are simpler than WebSockets for one-directional push (server → client). Use SSE unless you need bidirectional communication.

At scale, you'll need a message broker (Redis pub/sub, Kafka) to distribute events across server instances.`,
  },
}
