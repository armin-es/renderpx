/**
 * Component composition progressive examples: code + metadata.
 * Used by the component-composition page to render Shiki code blocks on the server
 * and by ExampleViewer for descriptions and explanations.
 */
export const componentCompositionExampleContent: Record<
  string,
  { description: string; code: string; explanation: string; whenThisBreaks: string }
> = {
  '01-props': {
    description: 'The simplest case: pass all data as props and let the component own all rendering.',
    code: `// Tabs component owns everything: layout, tab rendering, panel rendering
function Tabs({ tabs, defaultTab }: {
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>
  defaultTab?: string
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0].id)

  return (
    <div>
      <div role="tablist" className="flex border-b gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={active === tab.id ? 'tab tab--active' : 'tab'}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-panels">
        {tabs.map(tab => (
          active === tab.id && (
            <div key={tab.id} role="tabpanel">
              {tab.content}
            </div>
          )
        ))}
      </div>
    </div>
  )
}

// Consumer:
<Tabs tabs={[
  { id: 'account', label: 'Account', content: <AccountPanel /> },
  { id: 'billing', label: 'Billing', content: <BillingPanel /> },
  { id: 'settings', label: 'Settings', content: <SettingsPanel /> },
]} />`,
    explanation: `Works well when:
• You control the tab API end-to-end
• Tab labels are always simple strings
• The layout never needs to change
• You're building a one-off, not a library component`,
    whenThisBreaks: `Product asks for a notification badge on the Messages tab. You add a "badge" prop. Then they want icons. Another prop. Then disabled tabs. Then a tooltip on hover. Each feature is a prop bolted onto the component - and the component grows to handle every possible rendering variation.`,
  },

  '02-render-props': {
    description: 'Pass a function as a prop - the component provides state, the consumer provides rendering for specific parts.',
    code: `// Component provides tab data + active state; consumer controls how each tab renders
function Tabs({ tabs, defaultTab, renderTab }: {
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>
  defaultTab?: string
  renderTab?: (tab: { id: string; label: string }, isActive: boolean) => React.ReactNode
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0].id)

  return (
    <div>
      <div role="tablist" className="flex border-b gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
          >
            {renderTab
              ? renderTab(tab, active === tab.id)
              : tab.label}
          </button>
        ))}
      </div>
      {/* panels unchanged */}
    </div>
  )
}

// Consumer with a badge - no changes to Tabs needed:
<Tabs
  tabs={notificationTabs}
  renderTab={(tab, isActive) => (
    <span className="flex items-center gap-2">
      {tab.label}
      {tab.badge > 0 && (
        <span className="badge">{tab.badge}</span>
      )}
    </span>
  )}
/>`,
    explanation: `Render props give the consumer control over one specific rendering slot. The component handles state and structure; the consumer handles visual output. Works well for single customization points (like tab labels) without surrendering full control.`,
    whenThisBreaks: `Gets verbose fast. If you need render props for tabs AND panels AND the tab list container, the JSX becomes deeply nested callbacks. Harder to read than either the props approach or compound components. Also: you can only pass one "renderTab" - if two different consumers want different tab rendering, you can't compose them.`,
  },

  '03-children': {
    description: 'Accept children instead of a data array - consumers pass elements, not configuration objects.',
    code: `// Consumer passes Tab elements as children; component inspects them for state
function Tabs({ children, defaultTab }: {
  children: React.ReactNode
  defaultTab?: string
}) {
  const tabs = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<TabProps> =>
      React.isValidElement(child) && (child.type as any).displayName === 'Tab'
  )
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.props.id)

  return (
    <div>
      <div role="tablist" className="flex border-b gap-1">
        {tabs.map(tab => (
          <button
            key={tab.props.id}
            role="tab"
            aria-selected={active === tab.props.id}
            onClick={() => setActive(tab.props.id)}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div className="tab-panels">
        {tabs.map(tab => (
          active === tab.props.id && (
            <div key={tab.props.id} role="tabpanel">
              {tab.props.children}
            </div>
          )
        ))}
      </div>
    </div>
  )
}

Tab.displayName = 'Tab'
function Tab({ id, label, children }: TabProps) {
  return null // Tabs reads props; Tab itself never renders
}

// Consumer: content is co-located with tab label
<Tabs defaultTab="account">
  <Tab id="account" label="Account"><AccountPanel /></Tab>
  <Tab id="billing" label="Billing"><BillingPanel /></Tab>
</Tabs>`,
    explanation: `Children-based APIs feel natural in JSX. Content lives next to its tab label - better co-location than a separate \`tabs\` array. Radix UI accordion uses this pattern. No callback syntax needed.`,
    whenThisBreaks: `React.Children inspection is fragile: it breaks with fragments, arrays, and conditional children. The Tab component is a "ghost" that never renders - confusing to new developers. You also can't separate the tab list from the panels (they must stay nested together).`,
  },

  '04-compound': {
    description: 'Separate components share implicit state via Context - the consumer assembles them freely.',
    code: `// Shared state lives in context; components are independent
const TabsContext = createContext<{
  active: string
  setActive: (id: string) => void
} | null>(null)

function useTabs() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Must be used inside <Tabs>')
  return ctx
}

// Root: owns state, provides context
function Tabs({ children, defaultTab }: { children: React.ReactNode; defaultTab: string }) {
  const [active, setActive] = useState(defaultTab)
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      {children}
    </TabsContext.Provider>
  )
}

// TabList and Tab control their own rendering
function TabList({ children }: { children: React.ReactNode }) {
  return <div role="tablist" className="flex border-b gap-1">{children}</div>
}

function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  const { active, setActive } = useTabs()
  return (
    <button
      role="tab"
      aria-selected={active === id}
      onClick={() => setActive(id)}
    >
      {children}  {/* Consumer puts whatever they want here */}
    </button>
  )
}

function TabPanel({ id, children }: { id: string; children: React.ReactNode }) {
  const { active } = useTabs()
  return active === id ? <div role="tabpanel">{children}</div> : null
}

// Consumer: full control, idiomatic JSX, no special syntax
<Tabs defaultTab="account">
  <TabList>
    <Tab id="account">Account</Tab>
    <Tab id="messages">
      Messages <span className="badge">3</span>  {/* easy - consumer owns it */}
    </Tab>
    <Tab id="settings">Settings</Tab>
  </TabList>
  <TabPanel id="account"><AccountPanel /></TabPanel>
  <TabPanel id="messages"><MessagesPanel /></TabPanel>
  <TabPanel id="settings"><SettingsPanel /></TabPanel>
</Tabs>`,
    explanation: `Compound components are idiomatic React. Each component has a single responsibility. The consumer controls the full structure - tabs can go in a sidebar, panels in a modal, no constraints. Adding a badge, icon, or tooltip to a tab requires zero changes to the library. This is how Radix UI, Headless UI, and React Aria are built.`,
    whenThisBreaks: `Context adds a small overhead - fine for UI state, but not for high-frequency updates (100+ changes/second). Also: discoverability suffers. A new developer sees \`<Tabs>\` in the import list and must know to look for TabList, Tab, TabPanel. Export them as \`Tabs.List\`, \`Tabs.Tab\`, \`Tabs.Panel\` (or via a namespace export) to signal they belong together.`,
  },

  '05-headless': {
    description: 'A hook returns only state and behavior - the consumer renders everything from scratch.',
    code: `// useTabs: pure logic, zero rendering
function useTabs(tabs: Array<{ id: string }>, defaultTab?: string) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id)

  return {
    active,
    isActive: (id: string) => active === id,
    select: (id: string) => setActive(id),
    // ARIA-ready prop getters - consumer spreads these
    getTabProps: (id: string) => ({
      role: 'tab' as const,
      'aria-selected': active === id,
      onClick: () => setActive(id),
    }),
    getPanelProps: (id: string) => ({
      role: 'tabpanel' as const,
      hidden: active !== id,
    }),
  }
}

// Consumer: 100% control over structure and styles
function AccountSettings() {
  const { getTabProps, getPanelProps, isActive } = useTabs(TABS, 'account')

  return (
    <div className="my-custom-layout">
      {/* Tab list can be a sidebar, a dropdown, anything */}
      <nav className="my-sidebar-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            {...getTabProps(tab.id)}
            className={\`sidebar-item \${isActive(tab.id) ? 'sidebar-item--active' : ''}\`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Panels can be anywhere in the tree */}
      <main>
        {TABS.map(tab => (
          <section key={tab.id} {...getPanelProps(tab.id)}>
            {tab.content}
          </section>
        ))}
      </main>
    </div>
  )
}`,
    explanation: `Headless components are the foundation of design systems. The hook handles all the hard parts (keyboard navigation, ARIA attributes, state) while giving consumers complete rendering control. Headless UI and Radix UI expose both headless hooks and compound components - use whichever fits your abstraction level. Prop getters (\`getTabProps\`) are a clean pattern: spreads the minimum necessary attributes, consumer can override or extend.`,
    whenThisBreaks: `More code at the call site. Every consumer writes their own tab/panel JSX - that's fine for a design system (each consumer has a unique design), but overkill for an app where you want a consistent, reusable \`<Tabs>\` you can drop anywhere. Start with compound components. Reach for headless when consumers genuinely need full rendering control.`,
  },
}
