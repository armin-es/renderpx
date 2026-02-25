'use client'

import { createContext, useContext, useState, useMemo } from 'react'
import React from 'react'

function useRenderCount() {
  const ref = React.useRef(0)
  ref.current++
  return ref.current
}

type ProductContextType = {
  filters: { price: number; category: string }
  setFilters: (f: { price: number; category: string }) => void
  sortBy: string
  setSortBy: (s: string) => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

function ContextSubscriptionDemo() {
  const [filters, setFilters] = useState({ price: 500, category: '' })
  const [sortBy, setSortBy] = useState('name')

  const handleResetClick = () => {
    setFilters({ price: 500, category: '' })
    setSortBy('name')
  }

  const contextValue = useMemo(
    () => ({ filters, setFilters, sortBy, setSortBy }),
    [filters, sortBy]
  )

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4" style={{ borderColor: 'hsl(var(--content-border))' }}>
        <h4 className="font-bold mb-4" style={{ color: 'hsl(var(--content-text))' }}>
          Problem: Both components re-render for ANY context change
        </h4>

        <ProductContext.Provider value={contextValue}>
          <div className="space-y-4">
            {/* Controls */}
            <div className="space-y-3 p-3 rounded" style={{ backgroundColor: 'hsl(var(--box-info-bg))' }}>
              <div>
                <label className="text-sm font-medium" style={{ color: 'hsl(var(--content-text))' }}>
                  Price Filter: ${filters.price}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="100"
                  value={filters.price}
                  onChange={(e) => {
                    const newPrice = Number(e.target.value)
                    setFilters({ ...filters, price: newPrice })
                  }}
                  className="w-full"
                />
                <div className="text-xs mt-1" style={{ color: 'hsl(var(--content-text-muted))' }}>
                  👉 Move this slider and watch BOTH render counters increment
                </div>
              </div>

              <div>
                <label className="text-sm font-medium" style={{ color: 'hsl(var(--content-text))' }}>
                  Sort Order: {sortBy}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm"
                  style={{
                    borderColor: 'hsl(var(--content-border))',
                    backgroundColor: 'hsl(var(--content-bg))',
                    color: 'hsl(var(--content-text))',
                  }}
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="rating">Sort by Rating</option>
                </select>
                <div className="text-xs mt-1" style={{ color: 'hsl(var(--content-text-muted))' }}>
                  👉 Change this and watch BOTH render counters increment
                </div>
              </div>
            </div>

            {/* Display Components */}
            <div className="space-y-3">
              <ProductListDisplay />
              <SortDisplayComponent />
            </div>

            <button
              onClick={handleResetClick}
              className="w-full px-3 py-2 rounded text-sm border font-medium"
              style={{
                borderColor: 'hsl(var(--link))',
                color: 'hsl(var(--link))',
              }}
            >
              Reset Demo
            </button>
          </div>
        </ProductContext.Provider>
      </div>

      {/* Explanation Box */}
      <div
        className="p-4 rounded border"
        style={{
          backgroundColor: 'hsl(var(--box-yellow-bg))',
          borderColor: 'hsl(var(--box-yellow-border))',
        }}
      >
        <div className="font-bold mb-2" style={{ color: 'hsl(var(--content-text))' }}>
          What You're Seeing:
        </div>
        <ul className="space-y-2 text-sm" style={{ color: 'hsl(var(--content-text))' }}>
          <li>
            <strong>✗ Change Price</strong> → ProductList counter increments (expected) <strong>BUT</strong> SortDisplay counter also increments (unnecessary!)
          </li>
          <li>
            <strong>✗ Change Sort</strong> → SortDisplay counter increments (expected) <strong>BUT</strong> ProductList counter also increments (unnecessary!)
          </li>
          <li>
            <strong>Why?</strong> Both components call <code className="bg-white px-1 rounded text-xs">useContext(ProductContext)</code>, 
            so they subscribe to the ENTIRE context. When ANY value changes, BOTH re-render.
          </li>
        </ul>
      </div>
    </div>
  )
}

function ProductListDisplay() {
  const context = useContext(ProductContext)
  if (!context) return null
  const { filters } = context
  const renderCount = useRenderCount()

  return (
    <div
      className="p-4 rounded-lg border-2 transition-all"
      style={{
        borderColor: 'hsl(var(--link))',
        backgroundColor: 'hsl(var(--box-info-bg))',
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-bold" style={{ color: 'hsl(var(--content-text))' }}>
            ProductListDisplay
          </div>
          <div className="text-xs" style={{ color: 'hsl(var(--content-text-muted))' }}>
            ✓ Uses: <code className="bg-white px-1 rounded">filters</code> only
          </div>
        </div>
        <div
          className="text-2xl font-bold px-4 py-2 rounded"
          style={{
            backgroundColor: 'hsl(var(--content-bg))',
            color: 'hsl(var(--link))',
          }}
        >
          #{renderCount}
        </div>
      </div>

      <div className="p-3 rounded" style={{ backgroundColor: 'hsl(var(--content-bg))' }}>
        <div className="text-sm" style={{ color: 'hsl(var(--content-text))' }}>
          <strong>Current Price Filter:</strong> ${filters.price}
        </div>
        <div className="text-xs mt-2" style={{ color: 'hsl(var(--content-text-muted))' }}>
          Products: Apple ($299), Banana ($1), Orange ($3)
        </div>
      </div>

      <div className="mt-3 p-2 rounded text-xs bg-red-50" style={{ backgroundColor: 'hsl(var(--box-yellow-bg))' }}>
        ⚠️ This component re-renders even when sortBy changes (it doesn't use sortBy!)
      </div>
    </div>
  )
}

function SortDisplayComponent() {
  const context = useContext(ProductContext)
  if (!context) return null
  const { sortBy } = context
  const renderCount = useRenderCount()

  return (
    <div
      className="p-4 rounded-lg border-2 transition-all"
      style={{
        borderColor: 'hsl(var(--link))',
        backgroundColor: 'hsl(var(--box-info-bg))',
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-bold" style={{ color: 'hsl(var(--content-text))' }}>
            SortDisplayComponent
          </div>
          <div className="text-xs" style={{ color: 'hsl(var(--content-text-muted))' }}>
            ✓ Uses: <code className="bg-white px-1 rounded">sortBy</code> only
          </div>
        </div>
        <div
          className="text-2xl font-bold px-4 py-2 rounded"
          style={{
            backgroundColor: 'hsl(var(--content-bg))',
            color: 'hsl(var(--link))',
          }}
        >
          #{renderCount}
        </div>
      </div>

      <div className="p-3 rounded" style={{ backgroundColor: 'hsl(var(--content-bg))' }}>
        <div className="text-sm" style={{ color: 'hsl(var(--content-text))' }}>
          <strong>Sort Order:</strong> {sortBy.toUpperCase()}
        </div>
        <div className="text-xs mt-2" style={{ color: 'hsl(var(--content-text-muted))' }}>
          Sorted by: {sortBy === 'name' ? 'Product Name' : sortBy === 'price' ? 'Price (ascending)' : 'Customer Rating'}
        </div>
      </div>

      <div className="mt-3 p-2 rounded text-xs bg-red-50" style={{ backgroundColor: 'hsl(var(--box-yellow-bg))' }}>
        ⚠️ This component re-renders even when price changes (it doesn't use price!)
      </div>
    </div>
  )
}

export { ContextSubscriptionDemo }

