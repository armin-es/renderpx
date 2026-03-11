'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// Simulated API data
const USERS: Record<number, { name: string; role: string; team: string; email: string }> = {
  1: { name: 'Alice Chen', role: 'Staff Engineer', team: 'Platform', email: 'alice@company.com' },
  2: { name: 'Ben Okafor', role: 'Senior Designer', team: 'Design Systems', email: 'ben@company.com' },
  3: { name: 'Carla Rivera', role: 'Engineering Manager', team: 'Growth', email: 'carla@company.com' },
  4: { name: 'David Park', role: 'Product Manager', team: 'Core', email: 'david@company.com' },
  5: { name: 'Eva Schmidt', role: 'Frontend Lead', team: 'Platform', email: 'eva@company.com' },
}

// Simulated fetch with configurable delay
function fetchUser(id: number, delay = 600): Promise<typeof USERS[1]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(USERS[id]), delay)
  })
}

// --- PROBLEM DEMO ---
// Classic useEffect pattern with a race condition
// When you click quickly between users, the slower first request can
// overwrite the result of a faster later request.

export function UseEffectProblemDemo() {
  const [selectedId, setSelectedId] = useState(1)
  const [user, setUser] = useState<typeof USERS[1] | null>(null)
  const [loading, setLoading] = useState(false)
  const [requestLog, setRequestLog] = useState<string[]>([])
  const requestCounterRef = useRef(0)

  useEffect(() => {
    setLoading(true)
    const thisRequest = ++requestCounterRef.current
    const delay = selectedId % 2 === 0 ? 1200 : 400  // even IDs are slow, odd are fast

    setRequestLog(prev => [
      `→ Request #${thisRequest}: User ${selectedId} (${delay}ms delay)`,
      ...prev.slice(0, 4),
    ])

    fetchUser(selectedId, delay).then((data) => {
      // ❌ No guard: always sets state, even if a newer request already finished
      setUser(data)
      setLoading(false)
      setRequestLog(prev => [
        `← Response #${thisRequest}: "${data.name}" arrived`,
        ...prev.slice(0, 4),
      ])
    })
  }, [selectedId])

  return (
    <div className="space-y-4 p-4" style={{ color: 'hsl(var(--content-text))' }}>
      <p className="text-sm" style={{ color: 'hsl(var(--content-text-muted))' }}>
        Click <strong>User 2 → User 1</strong> quickly. User 2 takes 1200ms, User 1 takes 400ms.
        User 1 arrives first - but User 2&apos;s response overwrites it.
      </p>

      <div className="flex gap-2 flex-wrap">
        {Object.entries(USERS).map(([id, u]) => (
          <button
            key={id}
            onClick={() => setSelectedId(Number(id))}
            className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: selectedId === Number(id)
                ? 'hsl(var(--link))'
                : 'hsl(var(--card-bg))',
              color: selectedId === Number(id)
                ? 'white'
                : 'hsl(var(--content-text))',
              border: '1px solid hsl(var(--content-border))',
            }}
          >
            {u.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* User card */}
      <div
        className="rounded-lg border p-4 min-h-[96px] flex items-center"
        style={{ borderColor: 'hsl(var(--content-border))', backgroundColor: 'hsl(var(--card-bg))' }}
      >
        {loading ? (
          <div className="flex items-center gap-2" style={{ color: 'hsl(var(--content-text-muted))' }}>
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'hsl(var(--link))' }} />
            <span className="text-sm">Fetching...</span>
          </div>
        ) : user ? (
          <div>
            <div className="font-semibold">{user.name}</div>
            <div className="text-sm" style={{ color: 'hsl(var(--content-text-muted))' }}>
              {user.role} · {user.team}
            </div>
            <div className="text-xs mt-1" style={{ color: 'hsl(var(--content-text-muted))' }}>
              {user.email}
            </div>
          </div>
        ) : null}
      </div>

      {/* Request log */}
      <div
        className="rounded p-3 font-mono text-xs space-y-1"
        style={{ backgroundColor: 'hsl(var(--code-bg))', color: 'hsl(var(--content-text-muted))' }}
      >
        <div className="font-bold text-[10px] uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--content-text-muted))' }}>
          Network log
        </div>
        {requestLog.length === 0 ? (
          <div>No requests yet</div>
        ) : (
          requestLog.map((entry, i) => (
            <div
              key={i}
              style={{
                color: entry.startsWith('←')
                  ? 'hsl(142 56% 52%)'
                  : 'hsl(var(--content-text-muted))',
              }}
            >
              {entry}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// --- SOLUTION DEMO ---
// Fixed version: use a cancellation flag to ignore stale responses.
// This is the pattern that React Query, SWR, and useFetch libraries
// all implement internally.

export function UseEffectSolutionDemo() {
  const [selectedId, setSelectedId] = useState(1)
  const [user, setUser] = useState<typeof USERS[1] | null>(null)
  const [loading, setLoading] = useState(false)
  const [requestLog, setRequestLog] = useState<string[]>([])
  const requestCounterRef = useRef(0)

  useEffect(() => {
    let cancelled = false  // ✅ cancellation flag per effect run
    setLoading(true)
    const thisRequest = ++requestCounterRef.current
    const delay = selectedId % 2 === 0 ? 1200 : 400

    setRequestLog(prev => [
      `→ Request #${thisRequest}: User ${selectedId} (${delay}ms delay)`,
      ...prev.slice(0, 4),
    ])

    fetchUser(selectedId, delay).then((data) => {
      if (cancelled) {
        // ✅ Stale response: a newer request already ran, ignore this
        setRequestLog(prev => [
          `✕ Request #${thisRequest}: ignored (stale)`,
          ...prev.slice(0, 4),
        ])
        return
      }
      setUser(data)
      setLoading(false)
      setRequestLog(prev => [
        `← Response #${thisRequest}: "${data.name}" applied`,
        ...prev.slice(0, 4),
      ])
    })

    return () => { cancelled = true }  // ✅ cleanup: mark as cancelled on next render
  }, [selectedId])

  return (
    <div className="space-y-4 p-4" style={{ color: 'hsl(var(--content-text))' }}>
      <p className="text-sm" style={{ color: 'hsl(var(--content-text-muted))' }}>
        Same test: click <strong>User 2 → User 1</strong> quickly. Stale responses are now
        ignored - the correct user always wins.
      </p>

      <div className="flex gap-2 flex-wrap">
        {Object.entries(USERS).map(([id, u]) => (
          <button
            key={id}
            onClick={() => setSelectedId(Number(id))}
            className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: selectedId === Number(id)
                ? 'hsl(var(--link))'
                : 'hsl(var(--card-bg))',
              color: selectedId === Number(id)
                ? 'white'
                : 'hsl(var(--content-text))',
              border: '1px solid hsl(var(--content-border))',
            }}
          >
            {u.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* User card */}
      <div
        className="rounded-lg border p-4 min-h-[96px] flex items-center"
        style={{ borderColor: 'hsl(var(--content-border))', backgroundColor: 'hsl(var(--card-bg))' }}
      >
        {loading ? (
          <div className="flex items-center gap-2" style={{ color: 'hsl(var(--content-text-muted))' }}>
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'hsl(var(--link))' }} />
            <span className="text-sm">Fetching...</span>
          </div>
        ) : user ? (
          <div>
            <div className="font-semibold">{user.name}</div>
            <div className="text-sm" style={{ color: 'hsl(var(--content-text-muted))' }}>
              {user.role} · {user.team}
            </div>
            <div className="text-xs mt-1" style={{ color: 'hsl(var(--content-text-muted))' }}>
              {user.email}
            </div>
          </div>
        ) : null}
      </div>

      {/* Request log */}
      <div
        className="rounded p-3 font-mono text-xs space-y-1"
        style={{ backgroundColor: 'hsl(var(--code-bg))', color: 'hsl(var(--content-text-muted))' }}
      >
        <div className="font-bold text-[10px] uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--content-text-muted))' }}>
          Network log
        </div>
        {requestLog.length === 0 ? (
          <div>No requests yet</div>
        ) : (
          requestLog.map((entry, i) => (
            <div
              key={i}
              style={{
                color: entry.startsWith('←')
                  ? 'hsl(142 56% 52%)'
                  : entry.startsWith('✕')
                  ? 'hsl(38 92% 52%)'
                  : 'hsl(var(--content-text-muted))',
              }}
            >
              {entry}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// --- REACT QUERY SIMULATION DEMO ---
// Shows the caching behavior: instant results on re-visit, background refresh
// This simulates useQuery() without the actual library dependency

type QueryState<T> = {
  data: T | null
  loading: boolean
  isStale: boolean
  fetchCount: number
}

// Simple in-memory cache shared between component instances
const CACHE = new Map<number, { data: typeof USERS[1]; timestamp: number }>()
const STALE_TIME = 5000  // 5 seconds

function useSimulatedQuery(userId: number) {
  const [state, setState] = useState<QueryState<typeof USERS[1]>>({
    data: null,
    loading: false,
    isStale: false,
    fetchCount: 0,
  })

  const fetchData = useCallback((background = false) => {
    const cached = CACHE.get(userId)
    const isStale = cached ? Date.now() - cached.timestamp > STALE_TIME : false

    if (cached && !isStale) {
      // Cache hit, fresh - instant return
      setState(prev => ({ ...prev, data: cached.data, loading: false, isStale: false }))
      return
    }

    if (cached && isStale && background) {
      // Show stale data immediately, refresh in background
      setState(prev => ({ ...prev, data: cached.data, isStale: true }))
    } else if (!background) {
      setState(prev => ({ ...prev, loading: true, isStale: false }))
    }

    fetchUser(userId, 800).then((data) => {
      CACHE.set(userId, { data, timestamp: Date.now() })
      setState(prev => ({
        data,
        loading: false,
        isStale: false,
        fetchCount: prev.fetchCount + 1,
      }))
    })
  }, [userId])

  useEffect(() => {
    fetchData(false)
  }, [fetchData])

  return { ...state, refetch: () => fetchData(false) }
}

export function ReactQueryStyleDemo() {
  const [selectedId, setSelectedId] = useState(1)
  const { data, loading, isStale, fetchCount, refetch } = useSimulatedQuery(selectedId)
  const visitLog = useRef<string[]>([])
  const [log, setLog] = useState<string[]>([])

  const handleSelect = (id: number) => {
    const cached = CACHE.get(id)
    const entry = cached
      ? `→ User ${id}: cache hit (instant)`
      : `→ User ${id}: no cache, fetching…`
    visitLog.current = [entry, ...visitLog.current.slice(0, 4)]
    setLog([...visitLog.current])
    setSelectedId(id)
  }

  return (
    <div className="space-y-4 p-4" style={{ color: 'hsl(var(--content-text))' }}>
      <p className="text-sm" style={{ color: 'hsl(var(--content-text-muted))' }}>
        Switch users, then come back. Previously visited users load <strong>instantly from cache</strong>.
        Cache expires after 5 seconds - stale data shows immediately while background refresh runs.
      </p>

      <div className="flex gap-2 flex-wrap">
        {Object.entries(USERS).map(([id, u]) => {
          const cached = CACHE.get(Number(id))
          return (
            <button
              key={id}
              onClick={() => handleSelect(Number(id))}
              className="px-3 py-1.5 rounded text-sm font-medium transition-colors relative"
              style={{
                backgroundColor: selectedId === Number(id)
                  ? 'hsl(var(--link))'
                  : 'hsl(var(--card-bg))',
                color: selectedId === Number(id)
                  ? 'white'
                  : 'hsl(var(--content-text))',
                border: '1px solid hsl(var(--content-border))',
              }}
            >
              {u.name.split(' ')[0]}
              {cached && (
                <span
                  className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'hsl(142 56% 52%)' }}
                  title="Cached"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* User card */}
      <div
        className="rounded-lg border p-4 min-h-[96px] flex items-center justify-between"
        style={{ borderColor: 'hsl(var(--content-border))', backgroundColor: 'hsl(var(--card-bg))' }}
      >
        {loading ? (
          <div className="flex items-center gap-2" style={{ color: 'hsl(var(--content-text-muted))' }}>
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'hsl(var(--link))' }} />
            <span className="text-sm">Fetching...</span>
          </div>
        ) : data ? (
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{data.name}</span>
              {isStale && (
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'hsl(var(--box-warning-bg))', color: 'hsl(38 92% 40%)' }}>
                  stale - refreshing
                </span>
              )}
            </div>
            <div className="text-sm" style={{ color: 'hsl(var(--content-text-muted))' }}>
              {data.role} · {data.team}
            </div>
            <div className="text-xs mt-1" style={{ color: 'hsl(var(--content-text-muted))' }}>
              {data.email}
            </div>
          </div>
        ) : null}
        <button
          onClick={refetch}
          className="text-xs px-2 py-1 rounded ml-4 shrink-0"
          style={{ border: '1px solid hsl(var(--content-border))', color: 'hsl(var(--content-text-muted))' }}
        >
          Refetch
        </button>
      </div>

      {/* Cache log */}
      <div
        className="rounded p-3 font-mono text-xs space-y-1"
        style={{ backgroundColor: 'hsl(var(--code-bg))', color: 'hsl(var(--content-text-muted))' }}
      >
        <div className="font-bold text-[10px] uppercase tracking-wider mb-2">
          Cache log · {fetchCount} network request{fetchCount !== 1 ? 's' : ''} total
        </div>
        {log.length === 0 ? (
          <div>No navigation yet</div>
        ) : (
          log.map((entry, i) => (
            <div
              key={i}
              style={{
                color: entry.includes('cache hit')
                  ? 'hsl(142 56% 52%)'
                  : 'hsl(var(--content-text-muted))',
              }}
            >
              {entry}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
