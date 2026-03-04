'use client'

import { useRef, useState } from 'react'
import { create } from 'zustand'
import { ResetButton } from './ResetButton'

// Global store - no provider needed
interface FormState {
  email: string
  phone: string
  setEmail: (email: string) => void
  setPhone: (phone: string) => void
}

const useFormStore = create<FormState>((set) => ({
  email: '',
  phone: '',
  setEmail: (email: string) => set({ email }),
  setPhone: (phone: string) => set({ phone }),
}))

function useRenderCount() {
  const count = useRef(0)
  count.current += 1
  return count.current
}

function StickyBar() {
  const { email } = useFormStore()
  const renders = useRenderCount()
  const isDisabled = !email

  const handleSave = () => {
    if (!isDisabled) {
      console.log('Saving:', { email: useFormStore.getState().email, phone: useFormStore.getState().phone })
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
            backgroundColor: 'hsl(var(--highlight-bg))',
            color: 'hsl(var(--highlight-text))',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          Save
        </button>
        <span className="tabular-nums text-[10px]" style={{ color: 'hsl(var(--content-text-muted))' }}>
          Renders: {renders}
        </span>
      </div>
    </div>
  )
}

function FormInputs() {
  const { email, phone, setEmail, setPhone } = useFormStore()
  const renders = useRenderCount()

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
        <label htmlFor="zustand-email" className="block text-xs mb-1" style={{ color: 'hsl(var(--content-text-muted))' }}>
          Email
        </label>
        <input
          id="zustand-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        <label htmlFor="zustand-phone" className="block text-xs mb-1" style={{ color: 'hsl(var(--content-text-muted))' }}>
          Phone
        </label>
        <input
          id="zustand-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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

function Sidebar() {
  const renders = useRenderCount()

  return (
    <aside
      className="w-28 shrink-0 flex flex-col gap-1.5 px-3 py-3 border-r text-xs"
      style={{
        backgroundColor: 'hsl(var(--preview-bg))',
        borderColor: 'hsl(var(--content-border))',
        color: 'hsl(var(--content-text))',
      }}
    >
      <span className="font-medium mb-1">Settings</span>
      <span style={{ color: 'hsl(var(--content-text-muted))' }}>Profile</span>
      <span style={{ color: 'hsl(var(--content-text-muted))' }}>Security</span>
      <span style={{ color: 'hsl(var(--content-text-muted))' }}>Billing</span>
      <span className="tabular-nums mt-auto pt-2 border-t" style={{ borderColor: 'hsl(var(--content-border) / 0.4)', color: 'hsl(var(--content-text-muted))' }}>
        Renders: {renders}
      </span>
    </aside>
  )
}

function Footer() {
  const renders = useRenderCount()

  return (
    <footer
      className="flex items-center justify-between px-4 py-2.5 border-t text-xs"
      style={{
        backgroundColor: 'hsl(var(--card-toolbar-bg))',
        borderColor: 'hsl(var(--content-border))',
        color: 'hsl(var(--content-text))',
      }}
    >
      <span style={{ color: 'hsl(var(--content-text-muted))' }}>Changes auto-save</span>
      <span className="tabular-nums" style={{ color: 'hsl(var(--content-text-muted))' }}>
        Renders: {renders}
      </span>
    </footer>
  )
}

export function ZustandDemo() {
  const [key, setKey] = useState(0)

  return (
    <div className="w-full max-w-md mx-auto text-left space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <ResetButton
          onReset={() => {
            useFormStore.setState({ email: '', phone: '' })
            setKey((k) => k + 1)
          }}
        />
        <span className="text-[11px]" style={{ color: 'hsl(var(--content-text-muted))' }}>
          Zustand: Only StickyBar &amp; Inputs re-render on type. Sidebar &amp; Footer stay at 1.
        </span>
      </div>
      <div
        key={key}
        className="rounded-lg overflow-hidden border shadow-sm"
        style={{
          borderColor: 'hsl(var(--content-border))',
          backgroundColor: 'hsl(var(--card-bg))',
        }}
      >
        <StickyBar />
        <div className="flex min-h-[140px]">
          <Sidebar />
          <FormInputs />
        </div>
        <Footer />
      </div>
    </div>
  )
}
