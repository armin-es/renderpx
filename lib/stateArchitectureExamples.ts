/**
 * State architecture progressive examples: code + metadata.
 * Used by the state-architecture page to render Shiki code blocks on the server
 * and by ExampleViewer for descriptions and explanations.
 */
export const stateArchitectureExampleContent: Record<
  string,
  { description: string; code: string; explanation: string; whenThisBreaks: string }
> = {
  '01-local-state': {
    description: 'The simplest case: a filter that only affects one component.',
    code: `function ProductList() {
  const [filter, setFilter] = useState('')
  const products = useProducts() // 100 products

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Search products..."
      />
      <div>
        {filtered.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}`,
    explanation: `This works because:
• Filter state is only used here
• No other component needs to know about it
• Performance is fine with 100 items
• Simple to understand and maintain`,
    whenThisBreaks:
      'When you need the filter in multiple places (e.g., a separate FilterBar component, or showing filter count in header)',
  },
  '02-lifted-state': {
    description: 'Multiple components need to coordinate, so we lift state to their common parent.',
    code: `function ProductPage() {
  const [filter, setFilter] = useState('')
  const products = useProducts()

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <Header>
        <FilterBar filter={filter} onFilterChange={setFilter} />
        <ResultsCount count={filtered.length} />
      </Header>
      <ProductGrid products={filtered} />
    </div>
  )
}

function FilterBar({ filter, onFilterChange }) {
  return (
    <input
      value={filter}
      onChange={e => onFilterChange(e.target.value)}
    />
  )
}

function ResultsCount({ count }) {
  return <div>{count} results</div>
}`,
    explanation: `This works because:
• Filter lives in common parent
• Both FilterBar and ResultsCount can access it
• Still simple data flow
• No unnecessary re-renders`,
    whenThisBreaks:
      'When you need to share the filter across routes, or when prop drilling gets too deep (4+ levels)',
  },
  '03-url-state': {
    description: 'State should be bookmarkable and shareable. Move it to the URL.',
    code: `'use client'
import { useSearchParams, useRouter } from 'next/navigation'

function ProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filter = searchParams.get('q') || ''

  const products = useProducts()
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  )

  const setFilter = (newFilter: string) => {
    const params = new URLSearchParams(searchParams)
    if (newFilter) {
      params.set('q', newFilter)
    } else {
      params.delete('q')
    }
    router.replace(\`?\${params.toString()}\`)
  }

  return (
    <div>
      <FilterBar filter={filter} onFilterChange={setFilter} />
      <ProductGrid products={filtered} />
    </div>
  )
}`,
    explanation: `This works because:
• Filter state persists in browser history
• Users can share filtered results via URL
• Back/forward buttons work naturally
• SSR-friendly (initial render has correct state)
• Free bookmarking`,
    whenThisBreaks: 'When you have 10k+ products and need server-side filtering/pagination',
  },
  '04-server-state': {
    description: 'Too much data to filter client-side. Move filtering to the server.',
    code: `'use client'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

function ProductPage() {
  const searchParams = useSearchParams()
  const filter = searchParams.get('q') || ''

  // Server-side filtering with caching
  const { data, isLoading } = useQuery({
    queryKey: ['products', filter],
    queryFn: () => fetchProducts({ search: filter }),
    staleTime: 5 * 60 * 1000, // Cache for 5 min
  })

  return (
    <div>
      <FilterBar filter={filter} />
      {isLoading ? (
        <ProductGridSkeleton />
      ) : (
        <ProductGrid products={data.products} />
      )}
      <Pagination
        page={data.page}
        totalPages={data.totalPages}
      />
    </div>
  )
}

async function fetchProducts({ search, page = 1 }) {
  const res = await fetch(
    \`/api/products?\${new URLSearchParams({ search, page })}\`
  )
  return res.json()
}`,
    explanation: `This works because:
• Server handles filtering/pagination
• React Query manages caching & loading states
• URL still preserves filter (shareable)
• Can scale to millions of products
• Automatic background refetching`,
    whenThisBreaks:
      'When you need offline support, optimistic updates, or complex client-side state coordination',
  },
  '05-global-state': {
    description: 'Complex coordination across app with offline support and optimistic updates.',
    code: `// store/products.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ProductStore {
  filter: string
  products: Product[]
  setFilter: (filter: string) => void
  addProduct: (product: Product) => void
  syncWithServer: () => Promise<void>
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      filter: '',
      products: [],

      setFilter: (filter) => set({ filter }),

      // Optimistic update
      addProduct: (product) => {
        set(state => ({
          products: [...state.products, { ...product, _pending: true }]
        }))

        // Sync to server
        fetch('/api/products', {
          method: 'POST',
          body: JSON.stringify(product),
        })
          .then(res => res.json())
          .then(serverProduct => {
            set(state => ({
              products: state.products.map(p =>
                p.id === product.id ? serverProduct : p
              ),
            }))
          })
      },

      syncWithServer: async () => {
        const res = await fetch('/api/products')
        const products = await res.json()
        set({ products })
      },
    }),
    { name: 'product-store' }
  )
)

// Component
function ProductPage() {
  const filter = useProductStore(state => state.filter)
  const products = useProductStore(state =>
    state.products.filter(p =>
      p.name.toLowerCase().includes(state.filter.toLowerCase())
    )
  )
  const setFilter = useProductStore(state => state.setFilter)

  return (
    <div>
      <FilterBar filter={filter} onFilterChange={setFilter} />
      <ProductGrid products={products} />
    </div>
  )
}`,
    explanation: `This works because:
• Global store accessible anywhere
• Persistence via localStorage
• Optimistic updates for instant feedback
• Selectors prevent unnecessary re-renders
• Can work offline
• Complex coordination possible`,
    whenThisBreaks:
      'Honestly? This is overkill for most apps. Use only when you genuinely need these features.',
  },
}
