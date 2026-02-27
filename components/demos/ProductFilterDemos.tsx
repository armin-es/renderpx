'use client'

import { useState, useMemo } from 'react'

const MOCK_PRODUCTS = [
  { id: '1', name: 'Widget A' },
  { id: '2', name: 'Widget B' },
  { id: '3', name: 'Gadget X' },
  { id: '4', name: 'Gadget Y' },
  { id: '5', name: 'Tool Alpha' },
  { id: '6', name: 'Tool Beta' },
]

type Variant = '01-local-state' | '02-lifted-state' | '03-browser-persistent' | '04-server-persistent'

// Shared UI pieces
function FilterInput({
  value,
  onChange,
  placeholder = 'Search products...',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full max-w-xs px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2"
      style={{
        borderColor: 'hsl(var(--content-border))',
        backgroundColor: 'hsl(var(--card-bg))',
        color: 'hsl(var(--content-text))',
      }}
    />
  )
}

function ProductGrid({ products }: { products: { id: string; name: string }[] }) {
  return (
    <ul className="space-y-1 text-sm">
      {products.map((p) => (
        <li key={p.id} className="px-2 py-1 rounded" style={{ backgroundColor: 'hsl(var(--content-border) / 0.2)' }}>
          {p.name}
        </li>
      ))}
    </ul>
  )
}

// 01: Local state — filter and list in one component
function LocalStateDemo() {
  const [filter, setFilter] = useState('')
  const filtered = useMemo(
    () => MOCK_PRODUCTS.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase())),
    [filter]
  )
  return (
    <div className="space-y-3 p-4 rounded-lg border" style={{ borderColor: 'hsl(var(--content-border))' }}>
      <FilterInput value={filter} onChange={setFilter} />
      <div className="text-xs opacity-75">{filtered.length} results</div>
      <ProductGrid products={filtered} />
    </div>
  )
}

// 02: Lifted state — parent holds filter, children receive props
function FilterBar({ filter, onFilterChange }: { filter: string; onFilterChange: (v: string) => void }) {
  return <FilterInput value={filter} onChange={onFilterChange} />
}

function ResultsCount({ count }: { count: number }) {
  return <div className="text-xs opacity-75">{count} results</div>
}

function LiftedStateDemo() {
  const [filter, setFilter] = useState('')
  const filtered = useMemo(
    () => MOCK_PRODUCTS.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase())),
    [filter]
  )
  return (
    <div className="space-y-3 p-4 rounded-lg border" style={{ borderColor: 'hsl(var(--content-border))' }}>
      <div className="flex items-center gap-2 flex-wrap">
        <FilterBar filter={filter} onFilterChange={setFilter} />
        <ResultsCount count={filtered.length} />
      </div>
      <ProductGrid products={filtered} />
    </div>
  )
}

// 03: Browser persistent — filter persists in URL or localStorage
function BrowserPersistentDemo() {
  const [query, setQuery] = useState(() => {
    // Simulate reading from URL on mount
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('q') || ''
    }
    return ''
  })

  const filtered = useMemo(
    () => MOCK_PRODUCTS.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  )

  const handleChange = (value: string) => {
    setQuery(value)
    // Simulate updating URL on change
    const params = new URLSearchParams()
    if (value) params.set('q', value)
    // In real app: router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-3 p-4 rounded-lg border" style={{ borderColor: 'hsl(var(--content-border))' }}>
      <div className="text-xs font-mono opacity-75" style={{ color: 'hsl(var(--content-text-muted))' }}>
        Persisted: URL ?q={query || '(empty)'} or localStorage
      </div>
      <FilterInput value={query} onChange={handleChange} />
      <div className="text-xs opacity-75">Survives page refresh</div>
      <ProductGrid products={filtered} />
    </div>
  )
}

// 04: Server persistent — server is source of truth, filter params sent to API
function ServerPersistentDemo() {
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<{ id: string; name: string }[]>(MOCK_PRODUCTS)

  const fetch = () => {
    setLoading(true)
    // Simulate API call with filter params
    setTimeout(() => {
      setProducts(
        MOCK_PRODUCTS.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()))
      )
      setLoading(false)
    }, 600)
  }

  return (
    <div className="space-y-3 p-4 rounded-lg border" style={{ borderColor: 'hsl(var(--content-border))' }}>
      <div className="text-xs font-mono opacity-75" style={{ color: 'hsl(var(--content-text-muted))' }}>
        Server query: filter={filter || 'none'}
      </div>
      <div className="flex gap-2">
        <FilterInput value={filter} onChange={setFilter} />
        <button
          type="button"
          onClick={fetch}
          className="px-3 py-2 rounded-md text-sm font-medium shrink-0"
          style={{ backgroundColor: 'hsl(var(--link))', color: 'white' }}
        >
          Fetch
        </button>
      </div>
      {loading ? (
        <div className="text-sm py-4 opacity-75">Loading from server...</div>
      ) : (
        <>
          <div className="text-xs opacity-75">{products.length} results (from server)</div>
          <ProductGrid products={products} />
        </>
      )}
    </div>
  )
}

const DEMOS: Record<Variant, () => JSX.Element> = {
  '01-local-state': LocalStateDemo,
  '02-lifted-state': LiftedStateDemo,
  '03-browser-persistent': BrowserPersistentDemo,
  '04-server-persistent': ServerPersistentDemo,
}

export function ProductFilterDemos({ variant }: { variant: string }) {
  const Demo = DEMOS[variant as Variant]
  if (!Demo) return <div className="p-4 text-sm opacity-75">No preview for this step.</div>
  return <Demo />
}
