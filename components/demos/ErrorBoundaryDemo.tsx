'use client'

import React, { useState } from 'react'

class DemoErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

function ThrowButton() {
  const [shouldThrow, setShouldThrow] = useState(false)
  if (shouldThrow) throw new Error('Demo error for boundary')
  return (
    <div className="flex flex-col items-center gap-3 p-4" style={{ color: 'hsl(var(--content-text))' }}>
      <p className="text-sm" style={{ color: 'hsl(var(--content-text-muted))' }}>
        This widget is inside an Error Boundary.
      </p>
      <button
        type="button"
        onClick={() => setShouldThrow(true)}
        className="px-4 py-2 rounded-md text-sm font-medium"
        style={{
          backgroundColor: 'hsl(var(--link))',
          color: 'white',
        }}
      >
        Throw error
      </button>
    </div>
  )
}

export function ErrorBoundaryDemo() {
  return (
    <DemoErrorBoundary
      fallback={
        <div
          className="p-4 rounded-lg border text-sm"
          style={{
            borderColor: 'hsl(var(--box-warning-border))',
            backgroundColor: 'hsl(var(--box-warning-bg))',
            color: 'hsl(var(--content-text))',
          }}
        >
          <p className="font-medium">Caught by Error Boundary</p>
          <p className="mt-1 opacity-90">The widget threw; this fallback is shown instead.</p>
        </div>
      }
    >
      <ThrowButton />
    </DemoErrorBoundary>
  )
}
