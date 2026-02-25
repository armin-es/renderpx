'use client'

import { createContext, useContext, useState, useMemo } from 'react'

const MOCK_PRODUCTS = [
  { id: '1', name: 'Widget A' },
  { id: '2', name: 'Widget B' },
  { id: '3', name: 'Gadget X' },
  { id: '4', name: 'Gadget Y' },
  { id: '5', name: 'Tool Alpha' },
  { id: '6', name: 'Tool Beta' },
]

type Variant = '01-local-state' | '02-lifted-state' | '03-url-state' | '04-server-state' | '05-global-state'

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

// 03: URL state — simulate query in URL (demo: we show "URL" and sync state to mimic it)
function URLStateDemo() {
  const [query, setQuery] = useState('')
  const filtered = useMemo(
    () => MOCK_PRODUCTS.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  )
  return (
    <div className="space-y-3 p-4 rounded-lg border" style={{ borderColor: 'hsl(var(--content-border))' }}>
      <div className="text-xs font-mono opacity-75" style={{ color: 'hsl(var(--content-text-muted))' }}>
        URL: ?q={query || '(empty)'}
      </div>
      <FilterInput value={query} onChange={setQuery} />
      <ProductGrid products={filtered} />
    </div>
  )
}

// 04: Server state — simulated loading
function ServerStateDemo() {
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<{ id: string; name: string }[]>(MOCK_PRODUCTS)

  const load = () => {
    setLoading(true)
    setTimeout(() => {
      setProducts(
        MOCK_PRODUCTS.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()))
      )
      setLoading(false)
    }, 600)
  }

  return (
    <div className="space-y-3 p-4 rounded-lg border" style={{ borderColor: 'hsl(var(--content-border))' }}>
      <div className="flex gap-2">
        <FilterInput value={filter} onChange={setFilter} />
        <button
          type="button"
          onClick={load}
          className="px-3 py-2 rounded-md text-sm font-medium shrink-0"
          style={{ backgroundColor: 'hsl(var(--link))', color: 'white' }}
        >
          Fetch
        </button>
      </div>
      {loading ? (
        <div className="text-sm py-4 opacity-75">Loading...</div>
      ) : (
        <>
          <div className="text-xs opacity-75">{products.length} results</div>
          <ProductGrid products={products} />
        </>
      )}
    </div>
  )
}

// 05: Global state — Context as minimal "store" (demo stand-in for Zustand)
const GlobalStoreCtx = createContext<{
  filter: string
  setFilter: (v: string) => void
  products: { id: string; name: string }[]
} | null>(null)

function GlobalStateDemoInner() {
  const ctx = useContext(GlobalStoreCtx)
  if (!ctx) return null
  const { filter, setFilter, products } = ctx
  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase())),
    [filter, products]
  )
  return (
    <div className="space-y-3 p-4 rounded-lg border" style={{ borderColor: 'hsl(var(--content-border))' }}>
      <div className="text-xs opacity-75">Global store (persisted)</div>
      <FilterInput value={filter} onChange={setFilter} />
      <div className="text-xs opacity-75">{filtered.length} results</div>
      <ProductGrid products={filtered} />
    </div>
  )
}

function GlobalStateDemo() {
  const [filter, setFilter] = useState('')
  const [products] = useState(MOCK_PRODUCTS)
  const value = useMemo(() => ({ filter, setFilter, products }), [filter, products])
  return (
    <GlobalStoreCtx.Provider value={value}>
      <GlobalStateDemoInner />
    </GlobalStoreCtx.Provider>
  )
}

const DEMOS: Record<Variant, () => JSX.Element> = {
  '01-local-state': LocalStateDemo,
  '02-lifted-state': LiftedStateDemo,
  '03-url-state': URLStateDemo,
  '04-server-state': ServerStateDemo,
  '05-global-state': GlobalStateDemo,
}

export function ProductFilterDemos({ variant }: { variant: string }) {
  const Demo = DEMOS[variant as Variant]
  if (!Demo) return <div className="p-4 text-sm opacity-75">No preview for this step.</div>
  return <Demo />
}
