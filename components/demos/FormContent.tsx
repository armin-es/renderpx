'use client'

import { useContext, useRef } from 'react'
import { FormContext } from './FormContext'

function useRenderCount() {
  const count = useRef(0)
  count.current += 1
  return count.current
}

export function FormContent() {
  const ctx = useContext(FormContext)
  const renders = useRenderCount()
  if (!ctx) return null

  return (
    <main className="flex-1 min-w-0 flex flex-col p-4 gap-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium" style={{ color: 'hsl(var(--content-text))' }}>
          Edit profile
        </span>
        <span className="tabular-nums text-xs" style={{ color: 'hsl(var(--content-text-muted))' }}>
          Renders: {renders}
        </span>
      </div>
      <div>
        <label htmlFor="form-email" className="block text-xs mb-1" style={{ color: 'hsl(var(--content-text-muted))' }}>
          Email
        </label>
        <input
          id="form-email"
          type="email"
          value={ctx.formData.email}
          onChange={(e) =>
            ctx.setFormData({ ...ctx.formData, email: e.target.value })
          }
          placeholder="your@email.com"
          className="w-full max-w-[200px] px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2"
          style={{
            borderColor: 'hsl(var(--content-border))',
            color: 'hsl(var(--content-text))',
            backgroundColor: 'hsl(var(--card-bg))',
          }}
        />
      </div>
      <div>
        <label htmlFor="form-phone" className="block text-xs mb-1" style={{ color: 'hsl(var(--content-text-muted))' }}>
          Phone
        </label>
        <input
          id="form-phone"
          type="tel"
          value={ctx.formData.phone}
          onChange={(e) =>
            ctx.setFormData({ ...ctx.formData, phone: e.target.value })
          }
          placeholder="+1 (555) 000-0000"
          className="w-full max-w-[200px] px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2"
          style={{
            borderColor: 'hsl(var(--content-border))',
            color: 'hsl(var(--content-text))',
            backgroundColor: 'hsl(var(--card-bg))',
          }}
        />
      </div>
      <div style={{ color: 'hsl(var(--content-text-muted))', fontSize: '11px', marginTop: '8px' }}>
        (scroll down to see more fields)
      </div>
    </main>
  )
}
