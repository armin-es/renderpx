'use client'

import { useContext, useRef, useState } from 'react'
import { FormContext } from './FormContext'

function useRenderCount() {
  const count = useRef(0)
  count.current += 1
  return count.current
}

export function StickyActionBar() {
  const ctx = useContext(FormContext)
  const renders = useRenderCount()
  const [justSaved, setJustSaved] = useState(false)
  if (!ctx) return null

  const isDisabled = !ctx.formData.email
  const handleSave = () => {
    if (!isDisabled) {
      console.log('Saving:', ctx.formData)
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 1500)
    }
  }

  return (
    <div
      className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 border-b text-xs"
      style={{
        backgroundColor: 'hsl(var(--card-toolbar-bg))',
        borderColor: 'hsl(var(--content-border))',
        color: 'hsl(var(--content-text))',
      }}
    >
      <span className="font-medium">Settings</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isDisabled}
          className="px-3 py-1.5 text-xs rounded transition-opacity disabled:opacity-50 hover:disabled:opacity-50 hover:enabled:opacity-80"
          style={{
            backgroundColor: justSaved ? 'hsl(var(--success-bg, 120 100% 50%))' : 'hsl(var(--highlight-bg))',
            color: 'hsl(var(--highlight-text))',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          {justSaved ? '✓ Saved' : 'Save'}
        </button>
        <span className="tabular-nums text-[10px]" style={{ color: 'hsl(var(--content-text-muted))' }}>
          Renders: {renders}
        </span>
      </div>
    </div>
  )
}
