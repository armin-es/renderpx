'use client'

import { createContext, useContext, useState } from 'react'

// ─── Shared UI helpers ───────────────────────────────────────────────────────

function Badge({ count }: { count: number }) {
  return (
    <span
      className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold leading-none"
      style={{
        backgroundColor: 'hsl(var(--link))',
        color: 'white',
      }}
    >
      {count}
    </span>
  )
}

function PanelContent({ title, description }: { title: string; description: string }) {
  return (
    <div className="py-4">
      <div className="font-semibold text-sm mb-1" style={{ color: 'hsl(var(--content-text))' }}>
        {title}
      </div>
      <p className="text-sm" style={{ color: 'hsl(var(--content-text-muted))' }}>
        {description}
      </p>
    </div>
  )
}

// ─── Demo 1: Props-based Tabs ─────────────────────────────────────────────────
// Every rendering variation requires a new prop on the Tabs component.

interface PropsTab {
  id: string
  label: string
  badge?: number
  content: React.ReactNode
}

function PropsBasedTabs({ tabs, defaultTab }: { tabs: PropsTab[]; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? tabs[0].id)

  return (
    <div className="w-full">
      <div
        className="flex border-b"
        style={{ borderColor: 'hsl(var(--content-border))' }}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors"
              style={{
                borderBottomColor: isActive ? 'hsl(var(--link))' : 'transparent',
                color: isActive ? 'hsl(var(--link))' : 'hsl(var(--content-text-muted))',
              }}
            >
              {tab.label}
              {/* badge prop: the component owns this logic */}
              {tab.badge != null && tab.badge > 0 && <Badge count={tab.badge} />}
            </button>
          )
        })}
      </div>
      <div>
        {tabs.map((tab) => active === tab.id && <div key={tab.id}>{tab.content}</div>)}
      </div>
    </div>
  )
}

export function PropsTabsDemo() {
  const tabs: PropsTab[] = [
    {
      id: 'account',
      label: 'Account',
      content: <PanelContent title="Account Settings" description="Manage your profile, email, and password." />,
    },
    {
      id: 'messages',
      label: 'Messages',
      badge: 3,
      content: <PanelContent title="Messages" description="You have 3 unread messages from your team." />,
    },
    {
      id: 'settings',
      label: 'Settings',
      content: <PanelContent title="Preferences" description="Notification preferences and display options." />,
    },
  ]

  return (
    <div className="w-full max-w-md">
      <div
        className="text-xs mb-3 px-1"
        style={{ color: 'hsl(var(--content-text-muted))' }}
      >
        Badge requires a <code
          className="px-1 py-0.5 rounded text-[11px]"
          style={{ backgroundColor: 'hsl(var(--inline-code-bg))' }}
        >badge</code> prop on the component - new features need library changes.
      </div>
      <PropsBasedTabs tabs={tabs} defaultTab="account" />
    </div>
  )
}

// ─── Demo 2: Compound Tabs ────────────────────────────────────────────────────
// Consumer assembles structure; badge lives in consumer JSX.

const CompoundTabsCtx = createContext<{
  active: string
  setActive: (id: string) => void
} | null>(null)

function useCompoundTabs() {
  const ctx = useContext(CompoundTabsCtx)
  if (!ctx) throw new Error('Must be used inside <CompoundTabs>')
  return ctx
}

function CompoundTabs({
  children,
  defaultTab,
}: {
  children: React.ReactNode
  defaultTab: string
}) {
  const [active, setActive] = useState(defaultTab)
  return (
    <CompoundTabsCtx.Provider value={{ active, setActive }}>
      {children}
    </CompoundTabsCtx.Provider>
  )
}

function CompoundTabList({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex border-b"
      style={{ borderColor: 'hsl(var(--content-border))' }}
      role="tablist"
    >
      {children}
    </div>
  )
}

function CompoundTab({ id, children }: { id: string; children: React.ReactNode }) {
  const { active, setActive } = useCompoundTabs()
  const isActive = active === id
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActive(id)}
      className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors"
      style={{
        borderBottomColor: isActive ? 'hsl(var(--link))' : 'transparent',
        color: isActive ? 'hsl(var(--link))' : 'hsl(var(--content-text-muted))',
      }}
    >
      {children}
    </button>
  )
}

function CompoundTabPanel({ id, children }: { id: string; children: React.ReactNode }) {
  const { active } = useCompoundTabs()
  return active === id ? <div role="tabpanel">{children}</div> : null
}

export function CompoundTabsDemo() {
  return (
    <div className="w-full max-w-md">
      <div
        className="text-xs mb-3 px-1"
        style={{ color: 'hsl(var(--content-text-muted))' }}
      >
        Badge lives in consumer JSX - the Tabs component never needs to change.
      </div>
      <CompoundTabs defaultTab="account">
        <CompoundTabList>
          <CompoundTab id="account">Account</CompoundTab>
          <CompoundTab id="messages">
            Messages <Badge count={3} />
          </CompoundTab>
          <CompoundTab id="settings">Settings</CompoundTab>
        </CompoundTabList>
        <CompoundTabPanel id="account">
          <PanelContent title="Account Settings" description="Manage your profile, email, and password." />
        </CompoundTabPanel>
        <CompoundTabPanel id="messages">
          <PanelContent title="Messages" description="You have 3 unread messages from your team." />
        </CompoundTabPanel>
        <CompoundTabPanel id="settings">
          <PanelContent title="Preferences" description="Notification preferences and display options." />
        </CompoundTabPanel>
      </CompoundTabs>
    </div>
  )
}
