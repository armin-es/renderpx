/**
 * React Compiler Impact: Code examples and content for state-architecture page
 * 
 * The React Compiler (React 19) automatically optimizes memoization,
 * changing how state architecture decisions affect performance.
 */

export const reactCompilerContent = {
  sections: [
    {
      id: "compiler-memoization",
      title: "Automatic Memoization Reduces Boilerplate",
      description:
        "React 18 required manual memoization (useMemo, useCallback, memo). React 19's Compiler makes these unnecessary in most cases by automatically tracking dependencies and skipping re-renders.",
    },
    {
      id: "context-improvement",
      title: "Context Becomes More Viable (But Still Not Perfect)",
      description:
        "The Compiler makes Context re-renders less painful by automatically optimizing component subscriptions. However, it cannot eliminate the fundamental limitation: all Context consumers re-render when the value changes.",
    },
    {
      id: "fine-grained-still-matters",
      title: "Fine-Grained Subscriptions Still Matter",
      description:
        "Zustand and Redux use fine-grained subscriptions that the Compiler cannot optimize. When consumers are scattered across the tree and state changes frequently, external stores remain the better choice.",
    },
  ],

  examples: [
    {
      id: "before-after-memoization",
      title: "Before & After: Memoization Strategy",
      subtitleBefore: "React 18: Manual memoization required",
      subtitleAfter: "React 19: Compiler handles it automatically",
      codeBeforeLabel: "React 18 - Manual memoization",
      codeAfterLabel: "React 19 - Compiler optimizes automatically",
      codeBefore: `import { useState, useCallback, useMemo, memo } from 'react'

// ❌ React 18: Manual dependencies everywhere
const ProductFilter = memo(function ProductFilter({ onFilterChange }) {
  const [filters, setFilters] = useState({ price: 0, category: '' })

  // Need to manually memoize the callback
  const handlePriceChange = useCallback((newPrice) => {
    const newFilters = { ...filters, price: newPrice }
    setFilters(newFilters)
    onFilterChange(newFilters)  // deps: [filters, onFilterChange]
  }, [filters, onFilterChange])

  // Need to manually memoize computed values
  const sortedCategories = useMemo(() => {
    return ['Electronics', 'Clothing', 'Books'].sort()
  }, [])

  return (
    <div>
      <input 
        type="range" 
        value={filters.price} 
        onChange={(e) => handlePriceChange(Number(e.target.value))}
      />
      {sortedCategories.map(cat => (
        <label key={cat}>
          <input 
            type="checkbox" 
            onChange={() => handlePriceChange(filters.price)}
          />
          {cat}
        </label>
      ))}
    </div>
  )
})

// Every parent that uses ProductFilter needs memo too
const ProductPage = memo(function ProductPage() {
  const handleFilterChange = useCallback((filters) => {
    // Propagate filters up
  }, [])

  return <ProductFilter onFilterChange={handleFilterChange} />
})`,

      codeAfter: `import { useState } from 'react'

// ✅ React 19: Compiler handles memoization
function ProductFilter({ onFilterChange }) {
  const [filters, setFilters] = useState({ price: 0, category: '' })

  // No useCallback needed - Compiler stabilizes this
  const handlePriceChange = (newPrice) => {
    const newFilters = { ...filters, price: newPrice }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  // No useMemo needed - Compiler memoizes this
  const sortedCategories = ['Electronics', 'Clothing', 'Books'].sort()

  return (
    <div>
      <input 
        type="range" 
        value={filters.price} 
        onChange={(e) => handlePriceChange(Number(e.target.value))}
      />
      {sortedCategories.map(cat => (
        <label key={cat}>
          <input 
            type="checkbox" 
            onChange={() => handlePriceChange(filters.price)}
          />
          {cat}
        </label>
      ))}
    </div>
  )
}

// Parent components don't need memo - Compiler skips unnecessary renders
function ProductPage() {
  const handleFilterChange = (filters) => {
    // Propagate filters up
  }

  return <ProductFilter onFilterChange={handleFilterChange} />
}`,

      explanation:
        "The Compiler eliminates ~80% of useCallback and useMemo calls by automatically tracking which values are dependencies and which renders are truly necessary. This means less boilerplate and fewer subtle bugs from stale closures.",
    },

    {
      id: "context-with-compiler",
      title: "Context with Compiler: When It Works, When It Doesn't",
      subtitleBefore: "Problem: All Context consumers re-render",
      subtitleAfter: "Compiler helps, but has limits",
      codeBeforeLabel: "The Problem (Compiler can't fix)",
      codeAfterLabel: "What Compiler CAN optimize",
      codeBefore: `import { createContext, useState } from 'react'

const FilterContext = createContext()

// ❌ PROBLEM: All consumers re-render on ANY value change
function FiltersProvider({ children }) {
  const [filters, setFilters] = useState({ price: 0, category: '' })
  const [sortBy, setSortBy] = useState('name')

  return (
    <FilterContext.Provider value={{ filters, setFilters, sortBy, setSortBy }}>
      {children}
    </FilterContext.Provider>
  )
}

// Every component here re-renders when ANY value changes
function Dashboard() {
  const { filters, setFilters, sortBy, setSortBy } = useContext(FilterContext)

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Price input changes → Dashboard, ProductList, Sidebar ALL re-render */}
      <ProductList filters={filters} sortBy={sortBy} />
      <Sidebar filters={filters} />
      <Footer /> {/* Re-renders even though it doesn't read context */}
    </div>
  )
}

function ProductList() {
  const { filters, sortBy } = useContext(FilterContext)
  // Re-renders when sortBy changes (even if category didn't)
  // Re-renders when price changes (even if using category)
  return <div>{/* products */}</div>
}`,

      codeAfter: `// ✅ What Compiler CAN do: Optimize HOW you use Context
// (But can't change that all consumers re-render together)

// Strategy 1: Split Context into smaller providers
const PriceFilterContext = createContext()
const SortContext = createContext()

function OptimizedFiltersProvider({ children }) {
  const [price, setPrice] = useState(0)
  const [sortBy, setSortBy] = useState('name')

  // Compiler optimizes these - but they're separate providers
  return (
    <PriceFilterContext.Provider value={{ price, setPrice }}>
      <SortContext.Provider value={{ sortBy, setSortBy }}>
        {children}
      </SortContext.Provider>
    </PriceFilterContext.Provider>
  )
}

function ProductList() {
  // ✅ Only re-renders when sortBy changes (not when price changes)
  const { sortBy } = useContext(SortContext)
  return <div>{/* products */}</div>
}

function FilterPanel() {
  // ✅ Only re-renders when price changes (not when sortBy changes)
  const { price, setPrice } = useContext(PriceFilterContext)
  return <input value={price} onChange={e => setPrice(Number(e.target.value))} />
}`,

      explanation:
        "The Compiler can't change how Context works (all consumers re-render together), but it CAN optimize the component boundaries. Splitting large Context values into smaller providers + Compiler optimization can approach Zustand-like performance, but it's manual tuning.",
    },

    {
      id: "zustand-still-better",
      title: "Fine-Grained Subscriptions: Zustand Still Wins",
      subtitleBefore: "What the Compiler can't optimize",
      subtitleAfter: "Why external stores remain superior",
      codeBeforeLabel: "Context: Compiler optimization has limits",
      codeAfterLabel: "Zustand: Component-level subscription (always optimal)",
      codeBefore: `// Even with Compiler optimization, Context has a ceiling

const ProductContext = createContext()

function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ price: 0, category: '' })

  return (
    <ProductContext.Provider value={{ products, loading, filters, setFilters }}>
      {children}
    </ProductContext.Provider>
  )
}

// Dashboard re-renders even though it only reads filters
function Dashboard() {
  const { filters } = useContext(ProductContext)  // ← Re-renders on any value change
  return <div>Current filter: {filters.price}</div>
}

// FilterPanel also re-renders when products load (unnecessary)
function FilterPanel() {
  const { filters, setFilters } = useContext(ProductContext)  // ← Also re-renders on loading
  
  return (
    <input 
      value={filters.price} 
      onChange={e => setFilters({ ...filters, price: Number(e.target.value) })}
    />
  )
}

// Header re-renders even though it doesn't use context
// (because it's a child of ProductProvider)
function Header() {
  return <h1>Products</h1>  // ← Re-renders on every filter/product change
}`,

      codeAfter: `// Zustand: Compiler can't optimize this better
import { create } from 'zustand'

const useProductStore = create((set) => ({
  products: [],
  loading: false,
  filters: { price: 0, category: '' },
  setFilters: (filters) => set({ filters }),
  setLoading: (loading) => set({ loading }),
  setProducts: (products) => set({ products }),
}))

// Dashboard only re-renders when filters changes
function Dashboard() {
  const filters = useProductStore((state) => state.filters)  // ← Selector
  return <div>Current filter: {filters.price}</div>
}

// FilterPanel only re-renders when filters changes
function FilterPanel() {
  const { filters, setFilters } = useProductStore((state) => ({
    filters: state.filters,
    setFilters: state.setFilters,
  }))
  
  return (
    <input 
      value={filters.price} 
      onChange={e => setFilters({ ...filters, price: Number(e.target.value) })}
    />
  )
}

// Header never re-renders (doesn't use store)
function Header() {
  return <h1>Products</h1>  // ← Only renders once
}`,

      explanation:
        "Zustand's component-level selectors achieve granular subscriptions that the Compiler cannot improve upon. Each component re-renders only when its specific selected slice changes, regardless of where it sits in the tree. This is fundamentally better than Context for scattered consumers.",
    },
  ],

  decisionFramework: {
    title: "React 19 State Architecture Decision Tree",
    flowchart: [
      {
        question: "Does this state change frequently (every keystroke/scroll)?",
        yes: {
          question: "Are consumers close together in the tree?",
          yes: "✅ Use Context + Compiler optimization. Split into smaller providers if needed.",
          no: "❌ Don't use Context. Use Zustand or URL params instead.",
        },
        no: {
          question: "Is this data needed everywhere (auth, theme)?",
          yes: "✅ Use Context. Low frequency = Compiler makes it efficient.",
          no: "🤔 Could be local state, URL state, or server state. Evaluate based on source of truth.",
        },
      },
    ],
  },

  bestPractices: [
    {
      title: "Context: Acceptable for Low-Frequency Updates",
      before:
        "Avoiding Context because all consumers re-render (React 18 problem).",
      after:
        "Compiler makes Context viable for auth, theme, feature flags (data that changes rarely but is needed everywhere). Still split large Context into separate providers.",
      note: "The Compiler optimizes component boundaries, not Context architecture itself.",
    },
    {
      title: "Zustand Still Beats Context for High-Frequency Updates",
      before:
        "Considering Context for all shared state to avoid external dependencies.",
      after:
        "Use Zustand when consumers are scattered or state changes frequently. The Compiler can't optimize fine-grained subscriptions -external stores will always be better here.",
      note: "Compiler + Context = better, but still not as good as Zustand for this use case.",
    },
    {
      title: "Profile Before Over-Optimizing",
      before:
        "Preemptively optimizing all renders with manual memoization.",
      after:
        "Let the Compiler handle optimization first. Use React DevTools Profiler to identify actual bottlenecks, then optimize strategically.",
      note: "The Compiler removes ~80% of the need for manual optimization, so measure actual performance before adding complexity.",
    },
  ],

  summary: {
    title: "TL;DR: How React Compiler Changes Your State Architecture",
    points: [
      "**Memoization is automatic:** Stop writing useCallback/useMemo in most cases.",
      "**Context is better:** Low-frequency updates (auth, theme) are now viable with the Compiler.",
      "**Zustand is still better for high-frequency updates:** Fine-grained subscriptions beat Context, even with Compiler optimizations.",
      "**Measure, don't guess:** The Compiler does so much that preemptive optimization often wastes time. Profile first.",
      "**Same decision tree, fewer dependencies:** Your state architecture decisions are the same (Who needs this? Source of truth? Cost of wrong?), but you have fewer manual optimizations to maintain.",
    ],
  },
}
