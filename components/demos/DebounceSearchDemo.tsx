'use client'

import { useState, useEffect } from 'react'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debouncedValue
}

const MOCK_RESULTS: Record<string, string[]> = {
  '': [],
  re: ['React', 'Redux', 'Remix'],
  rea: ['React', 'Read the docs'],
  reac: ['React', 'React Query'],
  react: ['React', 'React Hooks', 'React Native'],
  'react-': ['React Query', 'React Router'],
}

function getResults(q: string): string[] {
  const key = q.toLowerCase().slice(0, 5) || ''
  return MOCK_RESULTS[key] ?? (q ? [`Results for "${q}"`] : [])
}

export function DebounceSearchDemo() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 400)
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (debouncedQuery === query && query !== '') {
      setLoading(true)
      const t = setTimeout(() => {
        setResults(getResults(debouncedQuery))
        setLoading(false)
      }, 300)
      return () => clearTimeout(t)
    } else if (debouncedQuery === '') {
      setResults([])
    }
  }, [debouncedQuery, query])

  return (
    <div className="w-full max-w-sm space-y-3 p-4" style={{ color: 'hsl(var(--content-text))' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type to search (e.g. react)"
        className="w-full px-3 py-2 rounded border text-sm"
        style={{
          backgroundColor: 'hsl(var(--card-bg))',
          borderColor: 'hsl(var(--content-border))',
          color: 'hsl(var(--content-text))',
        }}
      />
      <div className="text-xs" style={{ color: 'hsl(var(--content-text-muted))' }}>
        {query !== debouncedQuery
          ? `Waiting 400ms… (you typed "${query}")`
          : query
          ? loading
            ? 'Fetching…'
            : `Fetched for "${debouncedQuery}"`
          : 'Debounced value updates 400ms after you stop typing.'}
      </div>
      {results.length > 0 && (
        <ul className="list-disc pl-4 text-sm" style={{ color: 'hsl(var(--content-text-muted))' }}>
          {results.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
