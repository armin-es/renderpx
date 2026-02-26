import Link from "next/link";
import { CodeWithPreview } from "@/components/CodeWithPreview";
import { CodeBlock } from "@/components/CodeBlock";
import { ProblemDemo } from "@/components/demos/ProblemDemo";
import { SolutionDemo } from "@/components/demos/SolutionDemo";
import { ZustandDemo } from "@/components/demos/ZustandDemo";
import { ProblemContextDemo, SolutionContextDemo } from "@/components/demos/SplitContextDemo";
import { Callout, InlineCode } from "@/components/ui";
import { ExampleViewer } from "@/components/ExampleViewer";
import { stateArchitectureExampleContent } from "@/lib/stateArchitectureExamples";

const PROBLEM_CODE = `// Sticky action bar at top with Save button. Form scrolls below.
// Save button needs formData for:
//   1. Disabled state (disabled if email is empty)
//   2. onClick handler (POST to API)
function SettingsForm() {
  const [formData, setFormData] = useState({ email: '', phone: '' })

  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      <StickyActionBar />  {/* sticky — needs formData */}
      <Sidebar />          {/* does NOT need it — re-renders anyway */}
      <Content />          {/* scrollable — needs formData */}
      <Footer />           {/* does NOT need it — re-renders anyway */}
    </FormContext.Provider>
  )
}

// User types email → all 4 components re-render`;

const SOLUTION_CODE = `// Fix: narrow the provider to wrap only StickyActionBar + Content
function SettingsForm() {
  return (
    <>
      <Sidebar />              {/* outside provider — never re-renders */}
      <FormStateWrapper>
        <StickyActionBar />    {/* sticky — re-renders (reads formData) */}
        <Content />            {/* scrollable — re-renders (fills inputs) */}
      </FormStateWrapper>
      <Footer />               {/* outside provider — never re-renders */}
    </>
  )
}

function FormStateWrapper({ children }) {
  const [formData, setFormData] = useState({ email: '', phone: '' })
  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormContext.Provider>
  )
}`;

const PROGRESSIVE_EXAMPLES = [
  {
    id: "01-local-state",
    title: "Example 1: Local State",
    subtitle: "100 products, single page",
    complexity: "Simple",
  },
  {
    id: "02-lifted-state",
    title: "Example 2: Lifted State",
    subtitle: "+ cross-component coordination",
    complexity: "Medium",
  },
  {
    id: "03-url-state",
    title: "Example 3: URL State",
    subtitle: "+ sharing & bookmarking",
    complexity: "Medium",
  },
  {
    id: "04-server-state",
    title: "Example 4: Server State",
    subtitle: "+ 10k products, pagination",
    complexity: "Advanced",
  },
  {
    id: "05-global-state",
    title: "Example 5: Global State",
    subtitle: "+ cross-feature coordination",
    complexity: "Advanced",
  },
];

export default async function StateArchitecturePage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          State Architecture
        </h1>
        <p className="text-xl text-content-muted">
          One principle governs every state decision: <strong>put state close to where it is used</strong>. Patterns (local state, lifted state, URL state, server state, global state) emerge naturally once you feel the friction that breaks the previous pattern. Don't memorize the patterns. Learn to recognize the friction.
        </p>
      </div>

      <section id="the-problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          The Problem
        </h2>
        <div className="space-y-4 text-content">
          <p className="text-lg leading-relaxed">
            A form with a sticky action bar (Save button at top) and scrollable inputs below
            needs shared state. You lift it and put it in Context, and then every keystroke
            re-renders <strong>every component</strong> inside the Provider, including
            Sidebar and Footer that never read the form data. That&apos;s how &quot;lift state up&quot; goes wrong.
          </p>
        </div>
        <div className="mt-8">
          <CodeWithPreview
            code={PROBLEM_CODE}
            lang="tsx"
            codeLabel="Problem"
            preview={<ProblemDemo />}
            previewLabel="Type email — Sidebar & Footer re-render unnecessarily"
            layout="stacked"
          />
        </div>
      </section>

      <section id="the-solution" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          The Solution
        </h2>
        <p className="text-content mb-4">
          Put the provider as close as possible to the components that use the state.
          <InlineCode>FormStateWrapper</InlineCode> wraps only{" "}
          <InlineCode>StickyActionBar</InlineCode> and <InlineCode>Content</InlineCode>.
          Sidebar and Footer stay outside; they never re-render when you type.
        </p>
        <Callout variant="info" title="Why this actually works" className="mb-6">
          <InlineCode>FormStateWrapper</InlineCode> moves the <InlineCode>useState</InlineCode> declaration
          out of <InlineCode>SettingsForm</InlineCode> entirely. This is the key:{" "}
          <InlineCode>SettingsForm</InlineCode> no longer owns state, so it doesn&apos;t re-render on keystrokes.{" "}
          <InlineCode>Sidebar</InlineCode> and <InlineCode>Footer</InlineCode> are created in{" "}
          <InlineCode>SettingsForm</InlineCode>&apos;s render scope. Because their parent never re-renders, neither
          do they. It&apos;s not the provider boundary that protects them; it&apos;s that their parent component is now stable.
        </Callout>
        <div className="mt-8">
          <CodeWithPreview
            code={SOLUTION_CODE}
            lang="tsx"
            codeLabel="Narrow the provider"
            preview={<SolutionDemo />}
            previewLabel="Type email — only sticky bar & form re-render"
            layout="stacked"
          />
        </div>
      </section>

      <section id="when-narrowing-fails" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          When Narrowing Isn&apos;t Enough
        </h2>
        <p className="text-content mb-4">
          Two limitations bite once consumers can&apos;t sit under one narrow provider.{" "}
          <strong>Tree topology:</strong> consumers must be inside the Provider, so if they&apos;re
          far apart you wrap everything in between and intermediate components re-render.{" "}
          <strong>Whole-object subscription:</strong> calling <InlineCode>useContext()</InlineCode> subscribes
          you to the entire context value; any property change re-renders you, even if you only use one field.
        </p>
        <Callout variant="info" title="The rule">
          If you call <InlineCode>useContext(MyContext)</InlineCode>, you re-render whenever the context
          value changes. Destructuring or ignoring parts of the value doesn&apos;t help. React doesn&apos;t
          track which properties you use.
        </Callout>

        <div className="mt-6">
          <h3 className="font-bold mb-3 text-content">Workaround: Split contexts</h3>
          <p className="text-sm text-content-muted mb-4">
            One context per concern so each component only subscribes to what it needs.
          </p>
          <CodeWithPreview
            code={`// ❌ Single context — Filter re-renders when sort changes, Sort when filter changes
const ProductContext = createContext()
// value={{ filters, setFilters, sortBy, setSortBy }}`}
            lang="tsx"
            codeLabel="Problem"
            preview={<ProblemContextDemo />}
            previewLabel="Change sort or filter — both controls re-render"
            layout="stacked"
          />
          <div className="mt-4">
            <CodeWithPreview
              code={`// ✅ Split: FiltersContext + SortContext — each component only subscribes to one
const FiltersContext = createContext()
const SortContext = createContext()
// ProductList uses FiltersContext; SortControl uses SortContext`}
              lang="tsx"
              codeLabel="Split contexts"
              preview={<SolutionContextDemo />}
              previewLabel="Change sort or filter — only the relevant control re-renders"
              layout="stacked"
            />
          </div>
        </div>

        <Callout variant="warning" className="mt-6" title="Split fixes one problem, not both">
          Splitting fixes the &quot;whole object&quot; issue. It doesn&apos;t fix topology: if consumers are
          scattered, you still wrap a large tree. <InlineCode>memo()</InlineCode> on every node in between
          can help; React 19&apos;s Compiler does that automatically. For truly scattered, high-frequency
          state, Zustand (or Redux) is simpler: no Provider tree, fine-grained subscriptions.
        </Callout>

        <div className="mt-6">
          <h3 className="font-bold mb-3 text-content">Zustand: no Provider, fine-grained subscriptions</h3>
          <p className="text-sm text-content mb-4">
            Zustand sidesteps both problems. There&apos;s no Provider tree: components subscribe from anywhere in the app.
            Each subscription takes a selector, so a component only re-renders when the specific slice it reads changes,
            not when any part of the store updates.
          </p>
          <CodeWithPreview
            code={`import { create } from 'zustand'
const useFormStore = create((set) => ({
  email: '', setEmail: (email) => set({ email }),
  phone: '', setPhone: (phone) => set({ phone }),
}))
// StickyBar: const { email } = useFormStore()  → only re-renders on email change
// Sidebar/Footer: don't call useFormStore()   → never re-render`}
            lang="tsx"
            codeLabel="Zustand"
            preview={<ZustandDemo />}
            previewLabel="Type email — only StickyBar & inputs re-render"
            layout="stacked"
          />
        </div>

        <p className="mt-6 text-sm text-content-muted">
          <Link href="/deep-dives/state-management-internals" className="text-primary hover:underline">
            Deep Dive: State Management Internals →
          </Link>
        </p>
      </section>

      {/* The Decision Framework */}
      <section id="decision-framework" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          The Decision Framework
        </h2>
        <div className="prose max-w-none text-content">
          <p className="leading-relaxed">
            Forget Redux vs Context vs Zustand. Those are implementation details.
            The real decision is: <strong>where does this state make sense to live?</strong> Every bad state architecture I've seen started with a tool choice, not a friction signal.
          </p>
          <p className="leading-relaxed">
            I answer this with three concrete questions:
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="border-l-4 border-primary pl-4 py-2">
            <h3 className="font-bold text-lg mb-1 text-content">
              1. Who coordinates this data?
            </h3>
            <p className="text-content-muted">
              How many components need to read or write this state? If it&apos;s
              one component, keep it local. If it&apos;s siblings, lift to
              parent. If it&apos;s across the tree, consider URL or global
              state.
            </p>
          </div>

          <div className="border-l-4 border-[hsl(142_76%_36%)] pl-4 py-2">
            <h3 className="font-bold text-lg mb-1 text-content">
              2. What&apos;s the source of truth?
            </h3>
            <p className="text-content-muted">
              Does this state derive from the backend? The URL? User input?
              Server state should use React Query. URL state should use
              searchParams. Only ephemeral UI state belongs in local React
              state.
            </p>
            <p className="text-content-muted mt-2 text-sm">
              For UI state with complex transitions, or multi-step flows where
              the path depends on previous steps,{" "}
              <Link href="/deep-dives/state-machines" className="text-primary hover:underline">
                state machines
              </Link>{" "}
              make impossible states unrepresentable.
            </p>
          </div>

          <div className="border-l-4 border-[hsl(38_92%_50%)] pl-4 py-2">
            <h3 className="font-bold text-lg mb-1 text-content">
              3. What&apos;s the cost of getting it wrong?
            </h3>
            <p className="text-content-muted">
              Wrong patterns create technical debt. Too local = prop drilling
              hell. Too global = performance death. The right pattern makes the
              next feature easy.
            </p>
          </div>
        </div>

        <Callout variant="info" className="mt-8" title="My Mental Model">
          When I look at a piece of state, I ask: &quot;If this was in a
          database, what would the schema be?&quot; That usually reveals the
          natural boundaries. Form input? Single record. Filter state? Query
          parameters. Shopping cart? Could be either client or server,
          depending on whether you want it persisted across devices.
        </Callout>
      </section>



      {/* Decision Signals */}
      <section id="decision-signals" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          Decision Signals
        </h2>
        <p className="mb-8 text-content-muted">
          This is the core: <strong>don&apos;t move up a level until you actually feel the pain.</strong> Premature abstraction is a waste. Each transition below is triggered by a specific kind of friction. When you see these signals, move. Before then, stay where you are.
        </p>

        <div className="space-y-6">
          {[
            {
              from: "Local",
              to: "Lifted",
              signals: [
                "Two sibling components need to read the same value",
                "A parent needs to react to something that happens in a child",
                "You find yourself duplicating useState in two places and keeping them in sync",
              ],
              notYet:
                "One level of prop passing is fine. Lifting is cheap - don't reach for global state to avoid it.",
            },
            {
              from: "Lifted",
              to: "URL",
              signals: [
                "The user would be frustrated if a browser refresh cleared the state",
                "You want to share a specific view with another person via a link",
                "Analytics should capture the actual filter/search combination users are using",
                "The back button should restore the previous filter, not go to the previous page",
              ],
              notYet:
                "State that's purely transient (a dropdown open/closed) doesn't belong in the URL.",
            },
            {
              from: "URL",
              to: "Server",
              signals: [
                "The dataset is too large to filter/sort client-side (>1k items, or growing)",
                "Multiple URL params combine in ways that need the server to compute the result",
                "The same data is fetched in multiple places and should be cached",
              ],
              notYet:
                "URL state with client-side filtering is faster to implement and perfectly adequate for small datasets.",
            },
            {
              from: "Server",
              to: "Global",
              signals: [
                "A user action in one feature needs to immediately update what another unrelated feature displays",
                "State is genuinely cross-cutting: the same value affects 5+ components across different subtrees",
                "You need to write to state from outside the React tree (WebSocket handler, service worker)",
              ],
              notYet:
                "Server state (React Query) and URL state handle most cross-component coordination without global client state.",
            },
          ].map((item) => (
            <div
              key={item.from}
              className="border rounded-lg overflow-hidden border-content-border"
            >
              <div
                className="px-4 py-2 text-sm font-bold bg-card-toolbar text-content"
              >
                {item.from} → {item.to}
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div
                    className="text-xs font-bold uppercase tracking-wider mb-2 text-primary"
                  >
                    Move up when you see
                  </div>
                  <ul className="space-y-1 text-sm text-content">
                    {item.signals.map((s) => (
                      <li key={s} className="flex gap-2">
                        <span className="text-primary">→</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div
                  className="pt-3 border-t text-sm border-content-border text-content-muted"
                >
                  <span className="font-medium">Don&apos;t move yet if:</span>{" "}
                  {item.notYet}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-content-muted">
          <Link
            href="#progressive-examples"
            className="text-primary hover:underline"
          >
            See these patterns built progressively, from local state to global →
          </Link>
        </p>
      </section>

      {/* Progressive Examples */}
      <section id="progressive-examples" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          Progressive Examples
        </h2>
        <p className="mb-6 text-content-muted">
          The same idea (put state as close as possible to where it&apos;s
          used) applies when a feature grows. Below we take one feature, a{" "}
          <strong>product filter</strong>, and build it five ways: from state
          that lives in a single component to state that crosses the whole app.
          Each step adds coordination needs and shows when to reach for the next
          pattern (lifted state, URL, server, global).
        </p>

        <ExampleViewer
          examples={PROGRESSIVE_EXAMPLES}
          content={stateArchitectureExampleContent}
          showPreview
        />
      </section>

    </div>
  );
}
