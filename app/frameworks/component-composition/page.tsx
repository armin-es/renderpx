import Link from "next/link";
import { CodeWithPreview } from "@/components/CodeWithPreview";
import { CodeBlock } from "@/components/CodeBlock";
import { ExampleViewer } from "@/components/ExampleViewer";
import { PropsTabsDemo } from "@/components/demos/TabsDemos";
import { CompoundTabsDemo } from "@/components/demos/TabsDemos";
import { componentCompositionExampleContent } from "@/lib/componentCompositionExamples";

const PROPS_TABS_CODE = `// Tabs component owns all rendering — consumer passes data
function Tabs({ tabs, defaultTab }) {
  const [active, setActive] = useState(defaultTab ?? tabs[0].id)

  return (
    <div>
      <div role="tablist">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActive(tab.id)}>
            {tab.label}
            {tab.badge > 0 && <span className="badge">{tab.badge}</span>}
          </button>
        ))}
      </div>
      {tabs.map(tab =>
        active === tab.id && <div key={tab.id}>{tab.content}</div>
      )}
    </div>
  )
}

// Consumer: product wants a badge on Messages
<Tabs tabs={[
  { id: 'account',  label: 'Account',  content: <AccountPanel /> },
  { id: 'messages', label: 'Messages', badge: 3, content: <MessagesPanel /> },
  { id: 'settings', label: 'Settings', content: <SettingsPanel /> },
]} />
// Next week: product wants an icon on Account tab.
// The week after: a tooltip on the disabled Settings tab.
// Each request = a new prop + new logic inside Tabs.`;

const COMPOUND_TABS_CODE = `// Compound components — consumer assembles structure, owns rendering
const TabsCtx = createContext()

function Tabs({ children, defaultTab }) {
  const [active, setActive] = useState(defaultTab)
  return (
    <TabsCtx.Provider value={{ active, setActive }}>
      {children}
    </TabsCtx.Provider>
  )
}

function Tab({ id, children }) {
  const { active, setActive } = useContext(TabsCtx)
  return (
    <button role="tab" aria-selected={active === id} onClick={() => setActive(id)}>
      {children}
    </button>
  )
}

function TabPanel({ id, children }) {
  const { active } = useContext(TabsCtx)
  return active === id ? <div role="tabpanel">{children}</div> : null
}

// Consumer: badge lives in consumer JSX — Tabs never needs to change
<Tabs defaultTab="account">
  <TabList>
    <Tab id="account">Account</Tab>
    <Tab id="messages">
      Messages <Badge count={3} />    {/* consumer owns this */}
    </Tab>
    <Tab id="settings">Settings</Tab>
  </TabList>
  <TabPanel id="account"><AccountPanel /></TabPanel>
  <TabPanel id="messages"><MessagesPanel /></TabPanel>
  <TabPanel id="settings"><SettingsPanel /></TabPanel>
</Tabs>`;

const PROGRESSIVE_EXAMPLES = [
  {
    id: "01-props",
    title: "Example 1: Props",
    subtitle: "Component owns all rendering",
    complexity: "Simple",
  },
  {
    id: "02-render-props",
    title: "Example 2: Render Props",
    subtitle: "Consumer controls one rendering slot",
    complexity: "Medium",
  },
  {
    id: "03-children",
    title: "Example 3: Children Pattern",
    subtitle: "JSX elements instead of data arrays",
    complexity: "Medium",
  },
  {
    id: "04-compound",
    title: "Example 4: Compound Components",
    subtitle: "Shared context, consumer assembles structure",
    complexity: "Advanced",
  },
  {
    id: "05-headless",
    title: "Example 5: Headless Hook",
    subtitle: "Logic only — consumer renders everything",
    complexity: "Advanced",
  },
];

const VISUAL_LABELS: Record<string, string> = {
  "01-props": "Props",
  "02-render-props": "Render Props",
  "03-children": "Children",
  "04-compound": "Compound",
  "05-headless": "Headless",
};

const DECISION_MATRIX = [
  {
    pattern: "Props",
    whoRenders: "Component",
    flexibility: "Low",
    discoverability: "High",
    boilerplate: "Minimal",
    useWhen: "Fixed layout, few variants, internal use",
    example: "Simple card, avatar, badge",
  },
  {
    pattern: "Render Props",
    whoRenders: "Consumer (one slot)",
    flexibility: "Medium",
    discoverability: "Medium",
    boilerplate: "Verbose",
    useWhen: "Need control over one specific rendering slice",
    example: "Virtual list row, tooltip trigger, table cell",
  },
  {
    pattern: "Children / Slots",
    whoRenders: "Consumer (content)",
    flexibility: "Medium",
    discoverability: "High",
    boilerplate: "Low",
    useWhen: "Content varies but structure is fixed",
    example: "Card with header/body/footer slots, dialog",
  },
  {
    pattern: "Compound Components",
    whoRenders: "Consumer (structure)",
    flexibility: "High",
    discoverability: "High",
    boilerplate: "Medium",
    useWhen: "Related pieces that share state; UI library component",
    example: "Tabs, accordion, menu, select",
  },
  {
    pattern: "Headless / Hook",
    whoRenders: "Consumer (everything)",
    flexibility: "Maximum",
    discoverability: "Low",
    boilerplate: "High (per consumer)",
    useWhen: "Design system; consumer needs full rendering control",
    example: "useTabs(), useCombobox(), useVirtualizer()",
  },
];

export default async function ComponentCompositionPage() {
  return (
    <div
      className="min-h-full max-w-4xl mx-auto px-6 py-10"
      style={{ backgroundColor: "hsl(var(--content-bg))" }}
    >
      {/* Title */}
      <div className="mb-12">
        <h1
          className="text-4xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Component Composition
        </h1>
        <p
          className="text-xl"
          style={{ color: "hsl(var(--content-text-muted))" }}
        >
          How much control should a component give to its consumers?
        </p>
      </div>

      {/* Section 1: The Problem */}
      <section id="the-problem" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          The Problem
        </h2>
        <div className="prose max-w-none">
          <p
            className="text-lg leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            My team built a <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              Tabs
            </code> component. It accepted a <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              tabs
            </code> prop—an array of objects with <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              id
            </code>, <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              label
            </code>, and <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              content
            </code>. It worked great for two months.
          </p>
          <p
            className="leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            Then product asked for a notification badge on the Messages tab.
            Easy fix: add a <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              badge
            </code> prop. The next week: icons on some tabs. Another prop.
            Then: a tooltip on the disabled Settings tab. Another prop. Then: a
            different tab label style for mobile. The component grew from 50 to
            300 lines, each feature a new <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              if
            </code> and a new prop. Every new requirement meant touching the
            component itself.
          </p>
          <p
            className="leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            This is the composition problem. When a component owns all of its
            own rendering, consumers can only customize through props—and every
            possible variation must be anticipated in advance.
          </p>
        </div>

        <div className="mt-8">
          <CodeWithPreview
            code={PROPS_TABS_CODE}
            lang="tsx"
            codeLabel="Props-based Tabs — every feature is a new prop"
            preview={<PropsTabsDemo />}
            previewLabel="Live — a working Props-based Tabs with a badge prop"
            layout="stacked"
          />
        </div>
      </section>

      {/* Section 2: The Solution */}
      <section id="the-solution" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          The Solution
        </h2>
        <div className="prose max-w-none">
          <p
            className="text-lg leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            Invert the control.{" "}
            <strong>
              Instead of the component owning rendering, give rendering back to
              the consumer.
            </strong>{" "}
            The component keeps what it&apos;s good at—managing active state,
            keyboard navigation, ARIA attributes—and exposes composable pieces
            the consumer assembles.
          </p>
          <p
            className="leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            With compound components, the badge moves from a prop to plain JSX
            inside a{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              Tab
            </code>
            . The{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              Tabs
            </code>{" "}
            component never needs to know badges exist. Next week&apos;s icon
            request? Consumer adds an icon element. Tooltip? Consumer wraps the
            Tab in a Tooltip. The component&apos;s API is stable forever.
          </p>
        </div>

        <div className="mt-8">
          <CodeWithPreview
            code={COMPOUND_TABS_CODE}
            lang="tsx"
            codeLabel="Compound Tabs — consumer owns the rendering"
            preview={<CompoundTabsDemo />}
            previewLabel="Live — same badge, but consumer JSX. Tabs never changes."
            layout="stacked"
          />
        </div>
      </section>

      {/* Section 3: The Framework */}
      <section id="the-framework" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          The Framework
        </h2>
        <p
          className="mb-8"
          style={{ color: "hsl(var(--content-text-muted))" }}
        >
          There are four distinct levels of composition, each transferring more
          rendering control to the consumer. The question isn&apos;t which is
          best—it&apos;s which is appropriate for the component&apos;s use
          case.
        </p>

        <div className="space-y-6">
          {/* Level 1: Props */}
          <div
            className="rounded-lg border p-5"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 mt-0.5"
                style={{
                  backgroundColor: "hsl(var(--link) / 0.12)",
                  color: "hsl(var(--link))",
                }}
              >
                1
              </div>
              <div>
                <h3
                  className="font-bold text-lg mb-1"
                  style={{ color: "hsl(var(--content-text))" }}
                >
                  Props
                </h3>
                <p
                  className="text-sm mb-3"
                  style={{ color: "hsl(var(--content-text-muted))" }}
                >
                  Component owns all rendering. Consumer passes data and
                  configuration.
                </p>
                <CodeBlock
                  code={`<Button variant="primary" size="lg" loading={true} disabled={false} />`}
                  lang="tsx"
                />
                <p
                  className="text-sm mt-3"
                  style={{ color: "hsl(var(--content-text-muted))" }}
                >
                  <strong style={{ color: "hsl(var(--content-text))" }}>
                    Reach for this when:
                  </strong>{" "}
                  The component has a fixed layout, a small number of variants,
                  or is used internally where all variations are known upfront.
                  Simple, self-documenting API.
                </p>
              </div>
            </div>
          </div>

          {/* Level 2: Render Props */}
          <div
            className="rounded-lg border p-5"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 mt-0.5"
                style={{
                  backgroundColor: "hsl(var(--link) / 0.12)",
                  color: "hsl(var(--link))",
                }}
              >
                2
              </div>
              <div>
                <h3
                  className="font-bold text-lg mb-1"
                  style={{ color: "hsl(var(--content-text))" }}
                >
                  Render Props
                </h3>
                <p
                  className="text-sm mb-3"
                  style={{ color: "hsl(var(--content-text-muted))" }}
                >
                  Component provides state; consumer provides a function that
                  renders one specific slot.
                </p>
                <CodeBlock
                  code={`<VirtualList
  items={rows}
  renderRow={(item, index) => (
    <MyCustomRow key={item.id} item={item} />
  )}
/>`}
                  lang="tsx"
                />
                <p
                  className="text-sm mt-3"
                  style={{ color: "hsl(var(--content-text-muted))" }}
                >
                  <strong style={{ color: "hsl(var(--content-text))" }}>
                    Reach for this when:
                  </strong>{" "}
                  You need consumer control over one specific rendering slice,
                  not the whole structure. Common in virtualized lists, tooltip
                  triggers, or table cells where performance matters and you
                  can&apos;t use children.
                </p>
              </div>
            </div>
          </div>

          {/* Level 3: Compound Components */}
          <div
            className="rounded-lg border p-5"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 mt-0.5"
                style={{
                  backgroundColor: "hsl(var(--link) / 0.12)",
                  color: "hsl(var(--link))",
                }}
              >
                3
              </div>
              <div>
                <h3
                  className="font-bold text-lg mb-1"
                  style={{ color: "hsl(var(--content-text))" }}
                >
                  Compound Components
                </h3>
                <p
                  className="text-sm mb-3"
                  style={{ color: "hsl(var(--content-text-muted))" }}
                >
                  Related components share state via Context. Consumer assembles
                  the structure using idiomatic JSX.
                </p>
                <CodeBlock
                  code={`<Tabs defaultTab="account">
  <TabList>
    <Tab id="account">Account</Tab>
    <Tab id="messages">Messages <Badge count={3} /></Tab>
  </TabList>
  <TabPanel id="account"><AccountPanel /></TabPanel>
  <TabPanel id="messages"><MessagesPanel /></TabPanel>
</Tabs>`}
                  lang="tsx"
                />
                <p
                  className="text-sm mt-3"
                  style={{ color: "hsl(var(--content-text-muted))" }}
                >
                  <strong style={{ color: "hsl(var(--content-text))" }}>
                    Reach for this when:
                  </strong>{" "}
                  Building a UI library component where consumers need
                  structural control—tabs, accordions, menus, selects, dialogs.
                  This is how Radix UI, Headless UI, and Ark UI are designed.
                  The API is discoverable and the JSX reads naturally.
                </p>
              </div>
            </div>
          </div>

          {/* Level 4: Headless */}
          <div
            className="rounded-lg border p-5"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 mt-0.5"
                style={{
                  backgroundColor: "hsl(var(--link) / 0.12)",
                  color: "hsl(var(--link))",
                }}
              >
                4
              </div>
              <div>
                <h3
                  className="font-bold text-lg mb-1"
                  style={{ color: "hsl(var(--content-text))" }}
                >
                  Headless / Hook
                </h3>
                <p
                  className="text-sm mb-3"
                  style={{ color: "hsl(var(--content-text-muted))" }}
                >
                  A hook returns only state and behavior. No rendering
                  whatsoever—the consumer builds the entire UI.
                </p>
                <CodeBlock
                  code={`function MyCustomTabs() {
  const { getTabProps, getPanelProps, isActive } = useTabs(TABS)

  return (
    // Consumer renders whatever they want — sidebar nav, pill tabs,
    // a dropdown on mobile. The hook handles state + ARIA.
    <MySidebarNav>
      {TABS.map(tab => (
        <NavItem key={tab.id} {...getTabProps(tab.id)} active={isActive(tab.id)}>
          {tab.label}
        </NavItem>
      ))}
    </MySidebarNav>
  )
}`}
                  lang="tsx"
                />
                <p
                  className="text-sm mt-3"
                  style={{ color: "hsl(var(--content-text-muted))" }}
                >
                  <strong style={{ color: "hsl(var(--content-text))" }}>
                    Reach for this when:
                  </strong>{" "}
                  Building a design system where each consumer has a completely
                  different visual design, or when you need to reuse behavior
                  (keyboard nav, ARIA, focus management) across totally
                  different UI shapes. The foundation for accessibility-focused
                  libraries like React Aria and Radix Primitives.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* The key question */}
        <div
          className="mt-8 p-5 rounded-lg border"
          style={{
            backgroundColor: "hsl(var(--box-info-bg))",
            borderColor: "hsl(var(--box-info-border))",
          }}
        >
          <h3
            className="font-bold mb-2"
            style={{ color: "hsl(var(--content-text))" }}
          >
            The key question: who knows what?
          </h3>
          <p
            className="text-sm"
            style={{ color: "hsl(var(--content-text-muted))" }}
          >
            The right composition level depends on the information asymmetry
            between component and consumer. If the component knows everything it
            needs to render, use props. If the consumer knows better what should
            be rendered, give them control via compound components or a headless
            hook. The library author doesn&apos;t know every badge, icon, or
            tooltip the product team will ask for—so don&apos;t make them
            decide.
          </p>
        </div>
      </section>

      {/* Section 4: Decision Matrix */}
      <section id="decision-matrix" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Decision Matrix
        </h2>
        <p
          className="mb-6"
          style={{ color: "hsl(var(--content-text-muted))" }}
        >
          A quick reference for choosing the right level. These aren&apos;t
          mutually exclusive—a complex component often uses render props for one
          slot and compound components for structure.
        </p>

        <div className="overflow-x-auto">
          <table
            className="w-full border-collapse text-sm"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <thead>
              <tr
                className="border-b-2"
                style={{ borderColor: "hsl(var(--content-border))" }}
              >
                {[
                  "Pattern",
                  "Who Renders",
                  "Flexibility",
                  "Discoverability",
                  "Use When",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left p-3 font-bold"
                    style={{ color: "hsl(var(--content-text))" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DECISION_MATRIX.map((row, i) => (
                <tr
                  key={row.pattern}
                  style={
                    i % 2 === 0
                      ? { backgroundColor: "hsl(var(--table-row-alt))" }
                      : undefined
                  }
                >
                  <td
                    className="p-3 font-medium align-top"
                    style={{ color: "hsl(var(--content-text))" }}
                  >
                    {row.pattern}
                  </td>
                  <td
                    className="p-3 align-top"
                    style={{ color: "hsl(var(--content-text-muted))" }}
                  >
                    {row.whoRenders}
                  </td>
                  <td
                    className="p-3 align-top"
                    style={{ color: "hsl(var(--content-text-muted))" }}
                  >
                    {row.flexibility}
                  </td>
                  <td
                    className="p-3 align-top"
                    style={{ color: "hsl(var(--content-text-muted))" }}
                  >
                    {row.discoverability}
                  </td>
                  <td
                    className="p-3 align-top"
                    style={{ color: "hsl(var(--content-text-muted))" }}
                  >
                    <div className="mb-1">{row.useWhen}</div>
                    <div
                      className="text-xs italic"
                      style={{ color: "hsl(var(--content-text-muted) / 0.9)" }}
                    >
                      Ex: {row.example}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 5: Progressive Complexity */}
      <section id="progressive-complexity" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Progressive Complexity
        </h2>
        <p
          className="mb-6"
          style={{ color: "hsl(var(--content-text-muted))" }}
        >
          The same feature—a Tabs component—built five ways. Each step adds
          more consumer control and shows exactly when to reach for the next
          level.
        </p>

        <ExampleViewer
          examples={PROGRESSIVE_EXAMPLES}
          content={componentCompositionExampleContent}
          visualLabels={VISUAL_LABELS}
        />
      </section>

      {/* Section 6: Production Patterns */}
      <section id="production-patterns" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Production Patterns
        </h2>

        <div className="space-y-6">
          <div
            className="p-5 rounded-lg border"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <h3
              className="font-bold mb-2"
              style={{ color: "hsl(var(--content-text))" }}
            >
              The form that taught me compound components
            </h3>
            <p
              className="text-sm mb-3"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              A{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                FormField
              </code>{" "}
              component with{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                label
              </code>
              ,{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                error
              </code>
              ,{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                required
              </code>
              ,{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                helpText
              </code>{" "}
              props. Worked for basic cases. Then designers wanted the label on the
              right in one context, inline error below the field in another,
              floating label in a third. Each layout was a new prop combination the
              component hadn&apos;t anticipated.
            </p>
            <div className="text-sm space-y-1" style={{ color: "hsl(var(--content-text))" }}>
              <div>
                <strong>The fix:</strong> Rewrote as{" "}
                <code
                  className="text-xs px-1 py-0.5 rounded"
                  style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
                >
                  FormField.Label
                </code>
                ,{" "}
                <code
                  className="text-xs px-1 py-0.5 rounded"
                  style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
                >
                  FormField.Input
                </code>
                ,{" "}
                <code
                  className="text-xs px-1 py-0.5 rounded"
                  style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
                >
                  FormField.Error
                </code>
                . The compound API shares the{" "}
                <code
                  className="text-xs px-1 py-0.5 rounded"
                  style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
                >
                  id
                </code>{" "}
                and{" "}
                <code
                  className="text-xs px-1 py-0.5 rounded"
                  style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
                >
                  aria-*
                </code>{" "}
                wiring via context — consumers get horizontal label, inline error,
                or floating label by assembling the pieces differently.
              </div>
              <div>
                <strong>The signal:</strong> When you find yourself adding a prop
                like{" "}
                <code
                  className="text-xs px-1 py-0.5 rounded"
                  style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
                >
                  labelPosition
                </code>{" "}
                or{" "}
                <code
                  className="text-xs px-1 py-0.5 rounded"
                  style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
                >
                  errorPlacement
                </code>
                , the layout is already escaping what a prop API can express. That&apos;s
                when to reach for compound components.
              </div>
            </div>
          </div>

          <div
            className="p-5 rounded-lg border"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <h3
              className="font-bold mb-2"
              style={{ color: "hsl(var(--content-text))" }}
            >
              The dropdown that needed to be a combobox
            </h3>
            <p
              className="text-sm mb-3"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              A custom{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                Dropdown
              </code>{" "}
              component with{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                onSelect
              </code>
              ,{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                onOpen
              </code>
              ,{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                onClose
              </code>
              ,{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                renderItem
              </code>{" "}
              props. It worked well — until one product area needed keyboard
              navigation with async search, and another needed grouped options with
              a create-new option at the bottom.
            </p>
            <div className="text-sm space-y-1" style={{ color: "hsl(var(--content-text))" }}>
              <div>
                <strong>What happened:</strong> Each new requirement meant adding
                another prop:{" "}
                <code
                  className="text-xs px-1 py-0.5 rounded"
                  style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
                >
                  searchable
                </code>
                ,{" "}
                <code
                  className="text-xs px-1 py-0.5 rounded"
                  style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
                >
                  async
                </code>
                ,{" "}
                <code
                  className="text-xs px-1 py-0.5 rounded"
                  style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
                >
                  groupBy
                </code>
                ,{" "}
                <code
                  className="text-xs px-1 py-0.5 rounded"
                  style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
                >
                  renderFooter
                </code>
                . The prop count was a symptom — the abstraction was fighting the
                use cases.
              </div>
              <div>
                <strong>The fix:</strong> Replaced with Radix{" "}
                <code
                  className="text-xs px-1 py-0.5 rounded"
                  style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
                >
                  Select
                </code>{" "}
                as the headless base and kept the existing token styles on top.
                Keyboard navigation, screen reader support, and grouped options
                came free. The prop surface went from 12 down to 2: the data and a
                render function for custom items.
              </div>
              <div>
                <strong>The lesson:</strong> A growing prop count on a UI
                component is often a signal that the abstraction is at the wrong
                level — you&apos;re fighting layout variations that composition
                handles naturally.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Hot Takes */}
      <section id="hot-takes" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Common Mistakes &amp; Hot Takes
        </h2>

        <div className="space-y-4">
          {[
            {
              mistake: "Compound components are overkill — until they're not",
              take: "You'll know when you need them because you'll have a prop called renderHeaderLeft. Compound components have real overhead: they're more complex to build, harder to document, and less obvious for new consumers. But when a component starts accumulating layout-related props—things that control where and how subpieces render—composition is almost always the right answer. The signal isn't the number of props. It's whether the props describe data (fine) or layout (reach for compounds).",
            },
            {
              mistake: "Not using children for content that varies",
              take: "The children prop is the most underused API in React. I've seen components with contentLeft, contentRight, topSection, and bottomSection props that should just accept children and let the consumer place whatever they want inside a slot. Most 'config' prop patterns should just be composition. If a consumer is passing JSX to a prop, it should probably be children.",
            },
            {
              mistake: "Wrapping components in divs you don't control",
              take: "A button that needs to sometimes be a link, sometimes a router link, sometimes a plain div — the right API is asChild (Radix pattern) or the as prop. Not three separate components, not a wrapper div that breaks layout. The asChild pattern merges your component's behavior (click handlers, ARIA) with whatever element the consumer renders. It's cleaner than wrapping and keeps the DOM shallow.",
            },
            {
              mistake: "Reaching for Radix (or Headless UI) for everything",
              take: "Headless libraries are valuable when you control the design system and need to apply token-based styles to behavior-heavy components. They're overkill for a two-component demo, a prototype, or an app where the design is stable and variations are minimal. The complexity of a headless library — the mental model, the prop-gets pattern, the ARIA wiring — only pays off when you're building for multiple design contexts. Know the tradeoff before adding the dependency.",
            },
          ].map(({ mistake, take }) => (
            <div
              key={mistake}
              className="p-4 rounded-lg border"
              style={{ borderColor: "hsl(var(--content-border))" }}
            >
              <div
                className="font-bold text-sm mb-2"
                style={{ color: "hsl(var(--content-text))" }}
              >
                ❌ {mistake}
              </div>
              <p className="text-sm" style={{ color: "hsl(var(--content-text-muted))" }}>
                {take}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section: A Real Rollout */}
      <section id="real-rollout" className="mb-16">
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: "hsl(var(--content-text))" }}
        >
          A Real Rollout
        </h2>
        <p
          className="text-sm mb-8"
          style={{ color: "hsl(var(--content-text-muted))" }}
        >
          What it actually looks like to refactor a prop-heavy component library
          — with multiple teams using it, a product that can&apos;t stop shipping,
          and an API that can&apos;t break.
        </p>
        <div className="space-y-8">
          <div
            className="border-l-2 pl-5"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: "hsl(var(--link))" }}
            >
              Context
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "hsl(var(--content-text))" }}
            >
              Design system shared across three product areas in a mid-size B2B
              company. Five engineers consuming it, two designers maintaining
              Figma. The{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                Card
              </code>{" "}
              component had accumulated 14 props over 18 months — one new prop
              per product request, each request reasonable on its own.
            </p>
          </div>

          <div
            className="border-l-2 pl-5"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: "hsl(var(--link))" }}
            >
              The problem
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "hsl(var(--content-text))" }}
            >
              Every new product area needed a slightly different card layout —
              header on the right, actions in the footer, collapsible body.{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                CardProps
              </code>{" "}
              had{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                hasHeader
              </code>
              ,{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                headerAction
              </code>
              ,{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                footerContent
              </code>
              ,{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                isCollapsible
              </code>
              ,{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                defaultCollapsed
              </code>
              ,{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                onCollapse
              </code>
              . The component was testing the limits of what a prop-based API can
              express — and every new request required a design system PR that
              touched the component, the types, the Storybook story, and the
              documentation.
            </p>
          </div>

          <div
            className="border-l-2 pl-5"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: "hsl(var(--link))" }}
            >
              The call
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "hsl(var(--content-text))" }}
            >
              Rewrote{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                Card
              </code>{" "}
              as a compound component:{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                Card.Header
              </code>
              ,{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                Card.Body
              </code>
              ,{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                Card.Footer
              </code>
              ,{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                Card.Actions
              </code>
              . Old usage of{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                {"<Card title=\"...\" />"}
              </code>{" "}
              still worked via a backwards-compatibility shim for two sprints, then
              the shim was removed. Critically, I did not do this for{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                Button
              </code>{" "}
              — Button has one layout and one job; compound components there would
              be complexity for no benefit.
            </p>
          </div>

          <div
            className="border-l-2 pl-5"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: "hsl(var(--link))" }}
            >
              How I ran it
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "hsl(var(--content-text))" }}
            >
              Wrote the migration guide before writing the component — documented
              the old-prop to subcomponent mapping so consuming teams knew exactly
              what to change. Ran a codemod for the mechanical conversions
              (straightforward prop → wrapper substitutions), left complex cases
              for manual review. Got the two product teams to migrate their most
              complex card usage first — if the API felt wrong for the hard cases,
              we needed to know before the simple cases were done. It felt right.
              The backwards-compat shim bought the necessary migration window
              without blocking the product teams from shipping features in parallel.
            </p>
          </div>

          <div
            className="border-l-2 pl-5"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: "hsl(var(--link))" }}
            >
              The outcome
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "hsl(var(--content-text))" }}
            >
              The 18-month prop accumulation pattern stopped. When a new product
              area needed a card with a sticky header and a secondary action
              button in the footer, they composed it from the primitives without
              filing a design system request.{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                CardProps
              </code>{" "}
              went from 14 props to 2 (
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                className
              </code>
              ,{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                as
              </code>
              ). The codemod handled 80% of existing usage in one PR. The design
              system team stopped being a bottleneck for layout variations.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Related Frameworks */}
      <section id="related-frameworks" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Related Frameworks
        </h2>

        <div className="space-y-3">
          <div
            className="p-4 rounded-lg border"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <div
              className="font-medium mb-1"
              style={{ color: "hsl(var(--content-text))" }}
            >
              <Link
                href="/frameworks/state-architecture"
                style={{ color: "hsl(var(--link))" }}
                className="hover:underline"
              >
                State Architecture →
              </Link>
            </div>
            <p
              className="text-sm"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              Compound components use React Context to share state between
              related pieces. Understanding when Context causes re-render
              problems—and when it doesn&apos;t—directly applies to designing
              compound APIs.
            </p>
          </div>

          <div
            className="p-4 rounded-lg border"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <div
              className="font-medium mb-1"
              style={{ color: "hsl(var(--content-text))" }}
            >
              <Link
                href="/frameworks/data-fetching"
                style={{ color: "hsl(var(--link))" }}
                className="hover:underline"
              >
                Data Fetching &amp; Sync →
              </Link>
            </div>
            <p
              className="text-sm"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              Headless hooks often manage async state (loading, error, data).
              The patterns for data fetching—optimistic updates, loading states,
              cache invalidation—compose naturally with headless component
              hooks.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
