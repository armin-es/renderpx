import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DecisionMatrix } from "@/components/DecisionMatrix";
import { CodeWithPreview } from "@/components/CodeWithPreview";
import { CodeBlock } from "@/components/CodeBlock";
import { ProblemDemo } from "@/components/demos/ProblemDemo";
import { SolutionDemo } from "@/components/demos/SolutionDemo";
import { ZustandDemo } from "@/components/demos/ZustandDemo";
import { ProblemContextDemo, SolutionContextDemo } from "@/components/demos/SplitContextDemo";
import { Callout, InlineCode } from "@/components/ui";

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

export default async function StateArchitecturePage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          State Architecture
        </h1>
        <p className="text-xl text-content-muted">
          Where does state live and why?
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
        <p className="text-content mb-6">
          Put the provider as close as possible to the components that use the state.
          <InlineCode>FormStateWrapper</InlineCode> wraps only{" "}
          <InlineCode>StickyActionBar</InlineCode> and <InlineCode>Content</InlineCode>.
          Sidebar and Footer stay outside; they never re-render when you type.
        </p>
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
            Deep Dive: How state libraries use useSyncExternalStore →
          </Link>
        </p>
      </section>

      {/* Section 4: React Compiler Impact */}
      <section id="react-compiler" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          React Compiler Impact
        </h2>

        <div className="prose max-w-none mb-6 text-content">
          <p className="text-lg leading-relaxed">
            React 19 introduces the <strong>React Compiler</strong>, which automatically applies{" "}
            <InlineCode>memo()</InlineCode> to every component. This directly addresses one of the two Context problems from above.
          </p>
          <p className="leading-relaxed">
            <InlineCode>memo()</InlineCode> prevents child components from re-rendering when a parent re-renders.
            In React 18, the tree topology workaround required manually wrapping every intermediate
            component, which is tedious, error-prone, and easy to miss. The Compiler eliminates that chore entirely.
            (<InlineCode>useCallback</InlineCode> and <InlineCode>useMemo</InlineCode> are also handled automatically,
            but those are about reference stability and computation caching, which is less critical to architecture.)
            What it <strong>cannot</strong> fix is the subscription model: all <InlineCode>useContext()</InlineCode> consumers
            still re-render when the context value changes. That&apos;s where Zustand still wins.
          </p>
        </div>

        {/* Subsection: Automatic Memoization */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-content">
            Automatic memo(): No More Cascading Re-Renders
          </h3>

          <Callout variant="info" title="The Win" className="mb-4">
            The Compiler makes every component behave as if it&apos;s wrapped in <InlineCode>memo()</InlineCode>, so child components skip re-renders when their props haven&apos;t changed. In React 18, forgetting a single <InlineCode>memo()</InlineCode> could cascade re-renders across a whole subtree. Now it&apos;s automatic. This narrows exactly when you need Zustand.
          </Callout>

          {/* memo() vs no-memo: How it reduces Zustand need */}
          <div className="mt-6">
            <h4 className="text-lg font-bold mb-3 text-content">
              How memo() Reduces the Need for External State
            </h4>
            <p className="mb-4 text-sm text-content-muted">
              Without <InlineCode>memo()</InlineCode>, every parent state change cascades down. This is why teams reached for Zustand even for simple cases, just to move state out of the parent and avoid the cascade entirely. With automatic <InlineCode>memo()</InlineCode>, that specific pain point disappears.
            </p>
            <CodeBlock
              code={`// ❌ React 18 without memo(): Parent state cascades to ALL children
function Dashboard({ userEmail }) {
  const [notifications, setNotifications] = useState(0)

  return (
    <div>
      <button onClick={() => setNotifications(n => n + 1)}>
        Notify ({notifications})
      </button>
      <UserProfile email={userEmail} />  {/* Re-renders on every notification! */}
      <Sidebar />                         {/* Re-renders on every notification! */}
      <Footer />                          {/* Re-renders on every notification! */}
    </div>
  )
}

// React 18 fix: manually wrap EVERY component in memo()
const UserProfile = memo(({ email }) => <div>{email}</div>)
const Sidebar = memo(() => <nav>...</nav>)
const Footer = memo(() => <footer>...</footer>)
// Forget one memo() → that subtree cascades again


// ✅ React 19 with Compiler: memo() is automatic on every component
function Dashboard({ userEmail }) {
  const [notifications, setNotifications] = useState(0)

  return (
    <div>
      <button onClick={() => setNotifications(n => n + 1)}>
        Notify ({notifications})
      </button>
      <UserProfile email={userEmail} />  {/* Only re-renders when email changes */}
      <Sidebar />                         {/* Never re-renders */}
      <Footer />                          {/* Never re-renders */}
    </div>
  )
}
// No memo() needed — Compiler applies it automatically`}
              lang="tsx"
            />
            <Callout variant="warning" className="mt-4" title="The nuance">
              Automatic <InlineCode>memo()</InlineCode> eliminates cascade re-renders from <em>parent state</em>. It does <em>not</em> fix cascade re-renders from <em>Context</em>. A component that calls <InlineCode>useContext()</InlineCode> still re-renders whenever any part of that context changes. That&apos;s the remaining reason to reach for Zustand.
            </Callout>
          </div>
        </div>

        {/* Decision Framework */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-content">
            React 19 State Architecture Decision Tree
          </h3>

          <div className="p-6 rounded-lg border bg-box-info-bg border-box-info-border">
            <div className="space-y-4">
              <div>
                <div className="font-bold mb-2 text-content">
                  Q1: Does this state change frequently?
                </div>
                <div className="space-y-2 ml-4">
                  <div className="p-3 rounded border bg-box-info-bg border-box-info-border">
                    <div className="font-medium text-content">
                      Rarely (auth, theme, features) →
                    </div>
                    <div className="text-sm text-content-muted">
                      Use Context. Compiler makes it efficient for
                      low-frequency updates.
                    </div>
                  </div>

                  <div className="p-3 rounded border bg-box-yellow-bg border-box-yellow-border">
                    <div className="font-medium text-content">
                      Frequently (form input, filters) →
                    </div>
                    <div className="text-sm text-content-muted">
                      Are consumers close in tree?
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="font-bold mb-2 text-content">
                  Q2: Are consumers close together or scattered?
                </div>
                <div className="space-y-2 ml-4">
                  <div className="p-3 rounded border bg-box-info-bg border-box-info-border">
                    <div className="font-medium text-content">
                      Close (parent/sibling) →
                    </div>
                    <div className="text-sm text-content-muted">
                      Use narrowed Context + Compiler optimization. If it still
                      causes excessive re-renders, use Zustand.
                    </div>
                  </div>

                  <div className="p-3 rounded border bg-box-yellow-bg border-box-yellow-border">
                    <div className="font-medium text-content">
                      Scattered (across tree) →
                    </div>
                    <div className="text-sm text-content-muted">
                      Use Zustand or Redux. Compiler cannot optimize this. You
                      need fine-grained subscriptions.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <Callout variant="info" className="mt-8" title="TL;DR: React Compiler Changes (And Doesn't Change)">
          <ul className="space-y-2 text-sm text-content list-disc pl-4">
            <li>
              ✅ <strong>memo() is now automatic.</strong> The Compiler applies <InlineCode>memo()</InlineCode> to every component, eliminating cascade re-renders from parent state. This is the most architecturally significant change: it removes one of the main reasons teams previously reached for Zustand.
            </li>
            <li>
              ✅ <strong>Context is more viable.</strong> Low-frequency updates
              (auth, theme) work well with Compiler optimization.
            </li>
            <li>
              ❌ <strong>Zustand still wins for high-frequency updates.</strong>{" "}
              Fine-grained subscriptions beat Context, even with Compiler.
            </li>
            <li>
              📊 <strong>Measure, don&apos;t guess.</strong> The Compiler does so
              much that preemptive optimization often wastes time.
            </li>
            <li>
              🎯 <strong>Same decision tree, fewer dependencies.</strong> Your
              state architecture decisions remain the same; you just have fewer
              manual optimizations to maintain.
            </li>
          </ul>
        </Callout>
      </section>

      {/* Section 5: The Decision Framework */}
      <section id="decision-framework" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          The Decision Framework
        </h2>
        <div className="prose max-w-none text-content">
          <p className="leading-relaxed">
            State architecture isn&apos;t about choosing Redux vs Context vs
            Zustand. Those are implementation details. The real question is:{" "}
            <strong>what makes state &quot;belong&quot; somewhere?</strong>
          </p>
          <p className="leading-relaxed">
            I answer this with three questions:
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

      {/* Section 6: Decision Matrix */}
      <section id="decision-matrix" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          Decision Matrix
        </h2>
        <DecisionMatrix />

        <Callout variant="warning" className="mt-6" title="Key insight">
          Most apps need a <em>combination</em> of these patterns. The art is knowing which state belongs where. A
          common mistake is picking one tool (usually Context or Redux) and
          forcing all state through it.
        </Callout>
      </section>

      {/* Deep Dive link */}
      <section id="in-practice" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          See It In Practice
        </h2>
        <p className="mb-4 text-content-muted">
          The framework above tells you how to decide. The deep dive below shows
          what those decisions look like across five levels of feature
          complexity, two production scenarios, and a collection of patterns
          senior engineers still get wrong.
        </p>
        <Link
          href="/deep-dives/state-architecture-in-practice"
          className="flex items-center justify-between p-4 border border-content-border rounded-lg transition-all hover:opacity-90"
        >
          <div>
            <div className="font-medium text-content">
              State Architecture in Practice
            </div>
            <div className="text-sm text-content-muted">
              Progressive complexity, production patterns, and hot takes
            </div>
          </div>
          <ChevronRight size={20} className="text-content-muted shrink-0" />
        </Link>
      </section>

      {/* Section: Production Patterns */}
      <section id="production-patterns" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          Production Patterns
        </h2>

        <div className="space-y-6">
          <div className="p-5 rounded-lg border border-content-border">
            <h3 className="font-bold mb-2 text-content">
              The form that triggered 47 re-renders
            </h3>
            <p className="text-sm mb-3 text-content-muted">
              A settings form with a sticky Save button at the top and scrollable
              inputs below. The form state lived in a Context provider that wrapped
              the entire layout. On every keystroke, all four layout zones
              re-rendered, including the sidebar and footer that never read the form
              data.
            </p>
            <div className="text-sm space-y-2 text-content">
              <div>
                <strong>Root cause:</strong> The provider was placed at the layout
                root for convenience, not because the outer components needed it.
                Context doesn&apos;t know which consumers are interested; every
                descendant re-renders on every change.
              </div>
              <div>
                <strong>Fix:</strong> Narrow the provider to wrap only{" "}
                <InlineCode>StickyActionBar</InlineCode> and{" "}
                <InlineCode>Content</InlineCode>. Sidebar and Footer move outside
                the provider and stop re-rendering entirely. For high-frequency
                form state that truly is needed across a scattered tree, move to
                Zustand with selectors; each component subscribes only to the
                field it uses.
              </div>
              <div>
                <strong>The lesson:</strong> Context is a broadcast channel. Every
                call to <InlineCode>useContext(FormContext)</InlineCode> subscribes
                that component to every change, not just the fields it reads.
              </div>
            </div>
          </div>

          <div className="p-5 rounded-lg border border-content-border">
            <h3 className="font-bold mb-2 text-content">
              The URL state that saved a support ticket
            </h3>
            <p className="text-sm mb-3 text-content-muted">
              A people search feature. Users would type a name, browse results,
              click into a profile, press back, and land on an empty search page
              with no filters applied. Every support ticket started with &ldquo;the
              search isn&apos;t working.&rdquo;
            </p>
            <div className="text-sm space-y-2 text-content">
              <div>
                <strong>Root cause:</strong>{" "}
                <InlineCode>useState</InlineCode> for search query, filters, and
                pagination. Component state doesn&apos;t survive navigation. The back
                button destroyed the session.
              </div>
              <div>
                <strong>Fix:</strong> Moved to{" "}
                <InlineCode>useSearchParams</InlineCode>. The URL became the source
                of truth. Back button works. Deep links work. Analytics captures the
                actual filter state users are applying, not just &ldquo;search page
                viewed.&rdquo;
              </div>
              <div>
                <strong>The rule that stuck:</strong> If a user would be frustrated
                that refreshing lost it, it belongs in the URL. If it&apos;s truly
                transient UI (hover state, tooltip visibility), keep it local.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Hot Takes */}
      <section id="hot-takes" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          Common Mistakes &amp; Hot Takes
        </h2>

        <div className="space-y-4">
          {[
            {
              mistake: "URL state is the most underused pattern in React",
              take: "Most filter/search/pagination state should be in the URL, not in useState. URL state is free persistence, free sharing, free back-button support, and free analytics. I've seen teams build elaborate cache-sync logic to restore search results on back-navigation that was solved in ten minutes by moving state to useSearchParams. If the state affects what the user sees and they'd want to share it or return to it, it belongs in the URL.",
            },
            {
              mistake: "Reaching for Zustand before feeling the pain",
              take: "If you're adding Redux or Zustand before you've felt the pain of prop drilling, you're adding ceremony in advance of the problem. Start local. Lift when it actually hurts. The threshold should be: 'I've been asked to pass this same value through three layers of components that don't use it.' That's when you reach for global state, not when you start a project.",
            },
            {
              mistake: "Context for high-frequency state",
              take: "Context is the right tool for low-frequency, wide-access state: theme, locale, auth, feature flags. It's the wrong tool for data that updates on keystrokes, scroll position, or animations. If it updates faster than once per second and multiple components subscribe to it, you want Zustand with selectors, not Context. The difference is fine-grained subscriptions: Zustand re-renders only the components that read the changed slice.",
            },
            {
              mistake: "Treating server state and client state as the same category",
              take: "I've seen teams put API responses in Zustand, then manually write cache invalidation logic after mutations, then debug stale data issues for weeks. React Query exists because server state has fundamentally different semantics from client state: it can go stale, it needs revalidation, it should be deduplicated across components. Zustand doesn't model any of that. If it comes from an API, it belongs in React Query. If it's ephemeral UI state, it belongs in useState or Zustand.",
            },
          ].map(({ mistake, take }) => (
            <div
              key={mistake}
              className="p-4 rounded-lg border border-content-border"
            >
              <div className="font-bold text-sm mb-2 text-content">
                ❌ {mistake}
              </div>
              <p className="text-sm text-content-muted">{take}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section: A Real Rollout */}
      <section id="real-rollout" className="mb-16">
        <h2 className="text-2xl font-bold mb-2 text-content">
          A Real Rollout
        </h2>
        <p className="text-sm mb-8 text-content-muted">
          What it actually looks like to audit a bloated state store — and get a
          team that&apos;s been doing it wrong for two years to change.
        </p>
        <div className="space-y-8">
          <div className="border-l-2 border-content-border pl-5">
            <p className="text-xs font-bold uppercase tracking-wider mb-2 text-primary">
              Context
            </p>
            <p className="text-sm leading-relaxed text-content">
              React app with Zustand for everything — user preferences, API data,
              form state, UI flags, notification counts. Six engineers. The store
              had grown to 47 slices over two years of adding whatever felt
              convenient. New engineers were told to &ldquo;put it in the
              store&rdquo; as a default answer to any state question.
            </p>
          </div>

          <div className="border-l-2 border-content-border pl-5">
            <p className="text-xs font-bold uppercase tracking-wider mb-2 text-primary">
              The problem
            </p>
            <p className="text-sm leading-relaxed text-content">
              Two concurrent bugs. First: stale data after form submissions — API
              data was in Zustand, mutations updated the store optimistically but
              didn&apos;t re-fetch from the server, so the UI diverged from truth
              in subtle ways that only showed up hours later. Second: a search
              field that updated a Zustand slice on every keystroke was causing 12
              subscribed components to re-render, making the input visibly laggy
              on mid-range hardware. Both bugs had the same root cause: the wrong
              tool for the job.
            </p>
          </div>

          <div className="border-l-2 border-content-border pl-5">
            <p className="text-xs font-bold uppercase tracking-wider mb-2 text-primary">
              The call
            </p>
            <p className="text-sm leading-relaxed text-content">
              Audited the store by category — not by slice. Proposed: API data
              moves to React Query; high-frequency UI state moves local or to URL;
              only true cross-cutting app state stays in Zustand. Did not do a
              big-bang migration — migrated one feature&apos;s data at a time,
              starting with the features generating the most stale-data bug
              reports. The search field moved to <InlineCode>useState</InlineCode>{" "}
              immediately (local state, no store) — that fixed the lag in one
              line.
            </p>
          </div>

          <div className="border-l-2 border-content-border pl-5">
            <p className="text-xs font-bold uppercase tracking-wider mb-2 text-primary">
              How I ran it
            </p>
            <p className="text-sm leading-relaxed text-content">
              The hardest sell: engineers who&apos;d learned React through Zustand
              didn&apos;t have a mental model for &ldquo;server state&rdquo; as a
              distinct category. Ran a team session with one concrete before/after:
              the same feature in Zustand (cache invalidation manual, error states
              manual, background refresh manual) vs. React Query (all three
              automatic). The stale-data bug we&apos;d been chasing for three
              weeks fixed itself when the first feature migrated — that
              demonstration was more persuasive than any architecture talk.
            </p>
          </div>

          <div className="border-l-2 border-content-border pl-5">
            <p className="text-xs font-bold uppercase tracking-wider mb-2 text-primary">
              The outcome
            </p>
            <p className="text-sm leading-relaxed text-content">
              Stale-data bug reports dropped significantly after three features
              migrated to React Query. The Zustand store dropped from 47 slices
              to 8 (auth, user preferences, UI flags, navigation state). Input
              lag disappeared when high-frequency state moved local. New engineers
              onboard faster because the state category question has a clear
              answer: &ldquo;Is it from an API? React Query. Is it UI-only?{" "}
              <InlineCode>useState</InlineCode>. Is it shareable? URL. Is it
              genuinely app-wide? Zustand.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: Related Frameworks */}
      <section id="related-frameworks" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          Related Frameworks
        </h2>
        <p className="mb-4 text-content-muted">
          State decisions affect other architectural choices:
        </p>

        <div className="space-y-3">
          <Link
            href="/frameworks/component-composition"
            className="flex items-center justify-between p-4 border border-content-border rounded-lg transition-all hover:opacity-90"
          >
            <div>
              <div className="font-medium text-content">
                Component Composition
              </div>
              <div className="text-sm text-content-muted">
                How to pass state between components
              </div>
            </div>
            <ChevronRight size={20} className="text-content-muted shrink-0" />
          </Link>

          <Link
            href="/frameworks/data-fetching"
            className="flex items-center justify-between p-4 border border-content-border rounded-lg transition-all hover:opacity-90"
          >
            <div>
              <div className="font-medium text-content">
                Data Fetching & Sync
              </div>
              <div className="text-sm text-content-muted">
                Server state patterns and caching strategies
              </div>
            </div>
            <ChevronRight size={20} className="text-content-muted shrink-0" />
          </Link>

          <Link
            href="/frameworks/rendering-strategy"
            className="flex items-center justify-between p-4 border border-content-border rounded-lg transition-all hover:opacity-90"
          >
            <div>
              <div className="font-medium text-content">
                Rendering Strategy
              </div>
              <div className="text-sm text-content-muted">
                SSR state hydration and server components
              </div>
            </div>
            <ChevronRight size={20} className="text-content-muted shrink-0" />
          </Link>
        </div>
      </section>
    </div>
  );
}
