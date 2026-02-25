'use client'

import { createContext, useContext, useState, useMemo, useRef } from 'react'

// Sample product data
const PRODUCTS = [
  { id: 1, name: 'Laptop', price: 1200, category: 'Electronics' },
  { id: 2, name: 'Mouse', price: 25, category: 'Electronics' },
  { id: 3, name: 'Desk', price: 300, category: 'Furniture' },
  { id: 4, name: 'Chair', price: 150, category: 'Furniture' },
  { id: 5, name: 'Monitor', price: 350, category: 'Electronics' },
  { id: 6, name: 'Keyboard', price: 80, category: 'Electronics' },
]

// ❌ PROBLEM: Single context with multiple concerns
const SingleProductContext = createContext<{
  filters: { category: string }
  setFilters: (f: { category: string }) => void
  sortBy: string
  setSortBy: (s: string) => void
} | undefined>(undefined)

function ProblemProductProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState({ category: 'All' })
  const [sortBy, setSortBy] = useState('name')

  const value = useMemo(
    () => ({ filters, setFilters, sortBy, setSortBy }),
    [filters, sortBy]
  )

  return (
    <SingleProductContext.Provider value={value}>
      {children}
    </SingleProductContext.Provider>
  )
}

function ProblemProductList() {
  const renderRef = useRef(0)
  renderRef.current++
  
  const context = useContext(SingleProductContext)
  if (!context) return null

  const { filters, sortBy } = context

  let filtered = PRODUCTS.filter(
    (p) => filters.category === 'All' || p.category === filters.category
  )

  if (sortBy === 'price') {
    filtered = [...filtered].sort((a, b) => a.price - b.price)
  } else {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
  }

  return (
    <div>
      <div className="text-xs font-mono p-1 rounded mb-2" style={{ backgroundColor: "hsl(var(--box-red-bg))", color: "hsl(var(--box-red-text))" }}>
        Products: {renderRef.current} renders
      </div>
      <div className="space-y-1 text-xs">
        {filtered.map((p) => (
          <div key={p.id} className="p-1" style={{ backgroundColor: "hsl(var(--content-bg))" }}>
            {p.name} - ${p.price}
          </div>
        ))}
      </div>
    </div>
  )
}

function ProblemSortControl() {
  const renderRef = useRef(0)
  renderRef.current++
  
  const context = useContext(SingleProductContext)
  if (!context) return null

  const { sortBy, setSortBy } = context

  return (
    <div>
      <div className="text-xs font-mono p-1 rounded mb-2" style={{ backgroundColor: "hsl(var(--box-red-bg))", color: "hsl(var(--box-red-text))" }}>
        Sort by (Sort): {renderRef.current} renders
      </div>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="text-xs p-2 border rounded w-full"
        style={{ 
          borderColor: "hsl(var(--content-border))",
          backgroundColor: "hsl(var(--content-bg))",
          color: "hsl(var(--content-text))"
        }}
      >
        <option value="name">Name (A-Z)</option>
        <option value="price">Price (Low-High)</option>
      </select>
    </div>
  )
}

function ProblemFilterControl() {
  const renderRef = useRef(0)
  renderRef.current++
  
  const context = useContext(SingleProductContext)
  if (!context) return null

  const { filters, setFilters } = context

  return (
    <div>
      <div className="text-xs font-mono p-1 rounded mb-2" style={{ backgroundColor: "hsl(var(--box-red-bg))", color: "hsl(var(--box-red-text))" }}>
        Category (Filter): {renderRef.current} renders
      </div>
      <select
        value={filters.category}
        onChange={(e) => setFilters({ category: e.target.value })}
        className="text-xs p-2 border rounded w-full"
        style={{ 
          borderColor: "hsl(var(--content-border))",
          backgroundColor: "hsl(var(--content-bg))",
          color: "hsl(var(--content-text))"
        }}
      >
        <option value="All">All Categories</option>
        <option value="Electronics">Electronics</option>
        <option value="Furniture">Furniture</option>
      </select>
    </div>
  )
}

// ✅ SOLUTION: Split into separate contexts
const FiltersContext = createContext<{
  filters: { category: string }
  setFilters: (f: { category: string }) => void
} | undefined>(undefined)

const SortContext = createContext<{
  sortBy: string
  setSortBy: (s: string) => void
} | undefined>(undefined)

function SolutionProductProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState({ category: 'All' })
  const [sortBy, setSortBy] = useState('name')

  const filterValue = useMemo(() => ({ filters, setFilters }), [filters])
  const sortValue = useMemo(() => ({ sortBy, setSortBy }), [sortBy])

  return (
    <FiltersContext.Provider value={filterValue}>
      <SortContext.Provider value={sortValue}>{children}</SortContext.Provider>
    </FiltersContext.Provider>
  )
}

function SolutionProductList() {
  const renderRef = useRef(0)
  renderRef.current++
  
  const filterContext = useContext(FiltersContext)
  const sortContext = useContext(SortContext)
  if (!filterContext || !sortContext) return null

  const { filters } = filterContext
  const { sortBy } = sortContext

  let filtered = PRODUCTS.filter(
    (p) => filters.category === 'All' || p.category === filters.category
  )

  if (sortBy === 'price') {
    filtered = [...filtered].sort((a, b) => a.price - b.price)
  } else {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
  }

  return (
    <div>
      <div className="text-xs font-mono p-1 rounded mb-2" style={{ backgroundColor: "hsl(var(--box-green-bg))", color: "hsl(var(--box-green-text))" }}>
        Products: {renderRef.current} renders
      </div>
      <div className="space-y-1 text-xs">
        {filtered.map((p) => (
          <div key={p.id} className="p-1" style={{ backgroundColor: "hsl(var(--content-bg))" }}>
            {p.name} - ${p.price}
          </div>
        ))}
      </div>
    </div>
  )
}

function SolutionSortControl() {
  const renderRef = useRef(0)
  renderRef.current++
  
  const context = useContext(SortContext)
  if (!context) return null

  const { sortBy, setSortBy } = context

  return (
    <div>
      <div className="text-xs font-mono p-1 rounded mb-2" style={{ backgroundColor: "hsl(var(--box-green-bg))", color: "hsl(var(--box-green-text))" }}>
        Sort by (Sort): {renderRef.current} renders
      </div>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="text-xs p-2 border rounded w-full"
        style={{ 
          borderColor: "hsl(var(--content-border))",
          backgroundColor: "hsl(var(--content-bg))",
          color: "hsl(var(--content-text))"
        }}
      >
        <option value="name">Name (A-Z)</option>
        <option value="price">Price (Low-High)</option>
      </select>
    </div>
  )
}

function SolutionFilterControl() {
  const renderRef = useRef(0)
  renderRef.current++
  
  const context = useContext(FiltersContext)
  if (!context) return null

  const { filters, setFilters } = context

  return (
    <div>
      <div className="text-xs font-mono p-1 rounded mb-2" style={{ backgroundColor: "hsl(var(--box-green-bg))", color: "hsl(var(--box-green-text))" }}>
        Category (Filter): {renderRef.current} renders
      </div>
      <select
        value={filters.category}
        onChange={(e) => setFilters({ category: e.target.value })}
        className="text-xs p-2 border rounded w-full"
        style={{ 
          borderColor: "hsl(var(--content-border))",
          backgroundColor: "hsl(var(--content-bg))",
          color: "hsl(var(--content-text))"
        }}
      >
        <option value="All">All Categories</option>
        <option value="Electronics">Electronics</option>
        <option value="Furniture">Furniture</option>
      </select>
    </div>
  )
}

export function ProblemContextDemo() {
  return (
    <ProblemProductProvider>
      <div className="mx-auto space-y-3 max-w-sm p-4 rounded-lg border" style={{ borderColor: "hsl(var(--content-border))" }}>
        <div style={{ minHeight: "80px" }}>
          <ProblemFilterControl />
        </div>
        <div style={{ minHeight: "80px" }}>
          <ProblemSortControl />
        </div>
        <div style={{ minHeight: "200px" }}>
          <ProblemProductList />
        </div>
      </div>
    </ProblemProductProvider>
  )
}

export function SolutionContextDemo() {
  return (
    <SolutionProductProvider>
      <div className="mx-auto space-y-3 max-w-sm p-4 rounded-lg border" style={{ borderColor: "hsl(var(--content-border))" }}>
        <div style={{ minHeight: "80px" }}>
          <SolutionFilterControl />
        </div>
        <div style={{ minHeight: "80px" }}>
          <SolutionSortControl />
        </div>
        <div style={{ minHeight: "200px" }}>
          <SolutionProductList />
        </div>
      </div>
    </SolutionProductProvider>
  )
}

export function SplitContextDemo() {
  return (
    <div className="space-y-8">
      {/* Problem */}
      <div>
        <h4 className="font-bold mb-3">❌ Problem: Single Context (All re-render on any change)</h4>
        <div className="text-xs mb-3 p-2 bg-red-50 border border-red-200 rounded">
          When you change the sort, <strong>FilterControl re-renders too</strong> (it shouldn't).
          When you change the filter, <strong>SortControl re-renders too</strong> (it shouldn't).
        </div>
        <ProblemContextDemo />
      </div>

      {/* Solution */}
      <div>
        <h4 className="font-bold mb-3">✅ Solution: Split Contexts (Only relevant components re-render)</h4>
        <div className="text-xs mb-3 p-2 bg-green-50 border border-green-200 rounded">
          When you change the sort, <strong>only SortControl and ProductList re-render</strong>.
          When you change the filter, <strong>only FilterControl and ProductList re-render</strong>.
        </div>
        <SolutionContextDemo />
      </div>

      <div className="text-xs text-gray-600 p-3 bg-gray-50 rounded border">
        <strong>How to use:</strong> Try changing the filter or sort. Watch the render counters in each
        component. In the Problem section, you'll see unnecessary re-renders. In the Solution section,
        only the relevant components re-render.
      </div>
    </div>
  )
}
