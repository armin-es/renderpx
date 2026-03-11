'use client'

import { memo, useCallback, useMemo, useRef, useState } from 'react'

// ─── Shared data ──────────────────────────────────────────────────────────────

const PRODUCTS = [
  { id: 1, name: 'Wireless Headphones', price: 89, category: 'Electronics' },
  { id: 2, name: 'Mechanical Keyboard', price: 145, category: 'Electronics' },
  { id: 3, name: 'Standing Desk Mat', price: 62, category: 'Office' },
  { id: 4, name: 'USB-C Hub', price: 48, category: 'Electronics' },
  { id: 5, name: 'Desk Lamp', price: 34, category: 'Office' },
  { id: 6, name: 'Monitor Arm', price: 78, category: 'Office' },
]

// ─── Render counter utility ───────────────────────────────────────────────────

function RenderBadge({ label }: { label: string }) {
  const count = useRef(0)
  count.current += 1
  const isHigh = count.current > 3

  return (
    <div
      className="text-xs font-mono px-2 py-0.5 rounded"
      style={{
        backgroundColor: isHigh ? 'hsl(var(--box-warning-bg))' : 'hsl(var(--box-info-bg))',
        color: 'hsl(var(--content-text))',
        borderColor: isHigh ? 'hsl(var(--box-warning-border))' : 'hsl(var(--box-info-border))',
        border: '1px solid',
      }}
    >
      {label}: {count.current} render{count.current !== 1 ? 's' : ''}
    </div>
  )
}

// ─── Unmemoized components (problem side) ────────────────────────────────────

function UnmemoizedProductRow({ product }: { product: typeof PRODUCTS[number] }) {
  return (
    <div
      className="flex items-center justify-between px-3 py-2 rounded text-sm"
      style={{ color: 'hsl(var(--content-text))' }}
    >
      <span>{product.name}</span>
      <span style={{ color: 'hsl(var(--content-text-muted))' }}>${product.price}</span>
    </div>
  )
}

function UnmemoizedProductList({ products }: { products: typeof PRODUCTS }) {
  return (
    <div className="space-y-0.5">
      <RenderBadge label="ProductList" />
      <div className="mt-1 divide-y" style={{ borderColor: 'hsl(var(--content-border))' }}>
        {products.map((p) => (
          <UnmemoizedProductRow key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}

function UnmemoizedSummary({ total }: { total: number }) {
  return (
    <div className="space-y-0.5">
      <RenderBadge label="Summary" />
      <p className="text-sm mt-1" style={{ color: 'hsl(var(--content-text-muted))' }}>
        {PRODUCTS.length} products · avg ${Math.round(total / PRODUCTS.length)}
      </p>
    </div>
  )
}

// ─── Memoized components (solution side) ─────────────────────────────────────

const MemoizedProductRow = memo(function MemoizedProductRow({
  product,
}: {
  product: typeof PRODUCTS[number]
}) {
  return (
    <div
      className="flex items-center justify-between px-3 py-2 rounded text-sm"
      style={{ color: 'hsl(var(--content-text))' }}
    >
      <span>{product.name}</span>
      <span style={{ color: 'hsl(var(--content-text-muted))' }}>${product.price}</span>
    </div>
  )
})

const MemoizedProductList = memo(function MemoizedProductList({
  products,
}: {
  products: typeof PRODUCTS
}) {
  return (
    <div className="space-y-0.5">
      <RenderBadge label="ProductList" />
      <div className="mt-1 divide-y" style={{ borderColor: 'hsl(var(--content-border))' }}>
        {products.map((p) => (
          <MemoizedProductRow key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
})

const MemoizedSummary = memo(function MemoizedSummary({ total }: { total: number }) {
  return (
    <div className="space-y-0.5">
      <RenderBadge label="Summary" />
      <p className="text-sm mt-1" style={{ color: 'hsl(var(--content-text-muted))' }}>
        {PRODUCTS.length} products · avg ${Math.round(total / PRODUCTS.length)}
      </p>
    </div>
  )
})

// ─── Demo panels ─────────────────────────────────────────────────────────────

function DemoPanel({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: 'hsl(var(--content-border))' }}
    >
      <div
        className="px-4 py-3 border-b"
        style={{
          backgroundColor: 'hsl(var(--card-toolbar-bg))',
          borderColor: 'hsl(var(--content-border))',
        }}
      >
        <p className="text-sm font-semibold" style={{ color: 'hsl(var(--content-text))' }}>
          {title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--content-text-muted))' }}>
          {description}
        </p>
      </div>
      <div className="p-4" style={{ backgroundColor: 'hsl(var(--content-bg))' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Main exported demo ───────────────────────────────────────────────────────

export function MemoDemo() {
  const [searchQuery, setSearchQuery] = useState('')
  const total = useMemo(() => PRODUCTS.reduce((sum, p) => sum + p.price, 0), [])

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: 'hsl(var(--content-border))' }}
    >
      <div
        className="px-4 py-3 border-b"
        style={{
          backgroundColor: 'hsl(var(--code-bg))',
          borderColor: 'hsl(var(--content-border))',
        }}
      >
        <p className="text-sm font-semibold" style={{ color: 'hsl(var(--content-text))' }}>
          Type to trigger re-renders
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--content-text-muted))' }}>
          Search input is in the parent. Watch the render counts below.
        </p>
      </div>

      <div className="p-4" style={{ backgroundColor: 'hsl(var(--content-bg))' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Type anything…"
          className="w-full max-w-sm px-3 py-2 rounded-md border text-sm outline-none focus:ring-2"
          style={{
            borderColor: 'hsl(var(--content-border))',
            backgroundColor: 'hsl(var(--card-bg))',
            color: 'hsl(var(--content-text))',
          }}
        />
      </div>

      <div
        className="grid grid-cols-2 gap-px border-t"
        style={{
          borderColor: 'hsl(var(--content-border))',
          backgroundColor: 'hsl(var(--content-border))',
        }}
      >
        <DemoPanel
          title="❌ Without memo()"
          description="All components re-render on every keystroke"
        >
          <div className="space-y-4">
            <UnmemoizedSummary total={total} />
            <UnmemoizedProductList products={PRODUCTS} />
          </div>
        </DemoPanel>

        <DemoPanel
          title="✅ With memo()"
          description="ProductList & Summary skip re-renders - props didn't change"
        >
          <div className="space-y-4">
            <MemoizedSummary total={total} />
            <MemoizedProductList products={PRODUCTS} />
          </div>
        </DemoPanel>
      </div>

      <div
        className="px-4 py-3 text-xs border-t"
        style={{
          color: 'hsl(var(--content-text-muted))',
          borderColor: 'hsl(var(--content-border))',
          backgroundColor: 'hsl(var(--code-bg))',
        }}
      >
        Renders highlighted in orange after 3+. The search query state lives in the parent - the
        product list and summary have no dependency on it.
      </div>
    </div>
  )
}

// ─── Bundle size visualization ────────────────────────────────────────────────

const BUNDLE_CHUNKS = [
  { name: 'main.js', size: 85, color: 'hsl(var(--link))' },
  { name: 'react + react-dom', size: 130, color: 'hsl(142 56% 42%)' },
  { name: 'chart-library', size: 180, color: 'hsl(var(--box-warning-border))' },
  { name: 'rich-text-editor', size: 210, color: 'hsl(var(--box-warning-border))' },
  { name: 'date-picker', size: 65, color: 'hsl(var(--box-warning-border))' },
  { name: 'i18n strings', size: 95, color: 'hsl(var(--content-border))' },
]

const SPLIT_CHUNKS = [
  { name: 'main.js', size: 85, color: 'hsl(var(--link))' },
  { name: 'react + react-dom', size: 130, color: 'hsl(142 56% 42%)' },
  { name: 'i18n strings', size: 95, color: 'hsl(var(--content-border))' },
  { name: 'chart-library (lazy)', size: 180, color: 'hsl(var(--box-info-border))', deferred: true },
  { name: 'rich-text-editor (lazy)', size: 210, color: 'hsl(var(--box-info-border))', deferred: true },
  { name: 'date-picker (lazy)', size: 65, color: 'hsl(var(--box-info-border))', deferred: true },
]

export function BundleSplitDemo() {
  const [split, setSplit] = useState(false)

  const activeChunks = split ? SPLIT_CHUNKS : BUNDLE_CHUNKS
  const eager = activeChunks.filter((c) => !(c as any).deferred)
  const eagerTotal = eager.reduce((s, c) => s + c.size, 0)
  const total = activeChunks.reduce((s, c) => s + c.size, 0)
  const maxSize = 210

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: 'hsl(var(--content-border))' }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          backgroundColor: 'hsl(var(--code-bg))',
          borderColor: 'hsl(var(--content-border))',
        }}
      >
        <div>
          <p className="text-sm font-semibold" style={{ color: 'hsl(var(--content-text))' }}>
            Bundle impact of code splitting
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--content-text-muted))' }}>
            What the user downloads on first load
          </p>
        </div>
        <div
          className="flex rounded-md overflow-hidden border text-xs font-medium"
          style={{ borderColor: 'hsl(var(--content-border))' }}
        >
          <button
            type="button"
            onClick={() => setSplit(false)}
            className="px-3 py-1.5 transition-colors"
            style={{
              backgroundColor: !split ? 'hsl(var(--link))' : 'transparent',
              color: !split ? 'white' : 'hsl(var(--content-text-muted))',
            }}
          >
            No splitting
          </button>
          <button
            type="button"
            onClick={() => setSplit(true)}
            className="px-3 py-1.5 transition-colors"
            style={{
              backgroundColor: split ? 'hsl(var(--link))' : 'transparent',
              color: split ? 'white' : 'hsl(var(--content-text-muted))',
            }}
          >
            With splitting
          </button>
        </div>
      </div>

      <div className="p-4 space-y-2" style={{ backgroundColor: 'hsl(var(--content-bg))' }}>
        {activeChunks.map((chunk) => {
          const deferred = !!(chunk as any).deferred
          const widthPct = (chunk.size / maxSize) * 100

          return (
            <div key={chunk.name} className="flex items-center gap-3">
              <div
                className="text-xs font-mono shrink-0"
                style={{
                  width: 180,
                  color: deferred
                    ? 'hsl(var(--content-text-muted))'
                    : 'hsl(var(--content-text))',
                  opacity: deferred ? 0.6 : 1,
                }}
              >
                {chunk.name}
              </div>
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: 16, backgroundColor: 'hsl(var(--content-border))' }}>
                <div
                  className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: chunk.color,
                    opacity: deferred ? 0.4 : 1,
                  }}
                />
              </div>
              <div
                className="text-xs font-mono shrink-0 text-right"
                style={{
                  width: 48,
                  color: deferred ? 'hsl(var(--content-text-muted))' : 'hsl(var(--content-text))',
                  opacity: deferred ? 0.6 : 1,
                }}
              >
                {chunk.size}KB
              </div>
            </div>
          )
        })}

        <div
          className="pt-3 mt-3 border-t flex items-center justify-between text-sm"
          style={{ borderColor: 'hsl(var(--content-border))' }}
        >
          <span style={{ color: 'hsl(var(--content-text-muted))' }}>
            {split ? 'Eager (on first load):' : 'Total bundle:'}
          </span>
          <span className="font-bold" style={{ color: 'hsl(var(--content-text))' }}>
            {split ? `${eagerTotal}KB` : `${total}KB`}
            {split && (
              <span
                className="ml-2 text-xs font-normal"
                style={{ color: 'hsl(var(--content-text-muted))' }}
              >
                ({total - eagerTotal}KB deferred)
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
