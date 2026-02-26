import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";

export default async function StateManagementInternalsPage() {
  return (
    <div
      className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg"
    >
      {/* Title */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/frameworks/state-architecture"
            className="text-xs hover:underline text-primary"
          >
            State Architecture
          </Link>
          <ChevronRight
            size={12}
            className="text-content-muted"
          />
          <span
            className="text-xs text-content-muted"
          >
            Deep Dive
          </span>
        </div>
        <h1
          className="text-4xl font-bold mb-4 text-content"
        >
          How State Management Libraries Work
        </h1>
        <p
          className="text-xl text-content-muted"
        >
          Under the hood: subscriptions, external stores, and{" "}
          <code
            className="text-lg px-1.5 py-0.5 rounded bg-inline-code-bg"
          >
            useSyncExternalStore
          </code>
        </p>
      </div>

      {/* Section 1: The Core Question */}
      <section id="the-core-question" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4 text-content"
        >
          The Core Question
        </h2>
        <div className="prose max-w-none">
          <p
            className="text-lg leading-relaxed text-content"
          >
            In the{" "}
            <Link
              href="/frameworks/state-architecture#when-narrowing-fails"
              className="underline text-primary"
            >
              State Architecture
            </Link>{" "}
            section, we saw that Zustand causes <strong>only the components
            that read from the store</strong> to re-render. But React components
            re-render when their state or props change — and Zustand&apos;s store
            lives <em>outside</em> React. So how does an external JavaScript object
            trigger a React re-render?
          </p>
          <p
            className="leading-relaxed text-content"
          >
            The answer is{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded bg-inline-code-bg"
            >
              React.useSyncExternalStore
            </code>{" "}
            — a React 18 built-in hook designed specifically for this purpose.
            Understanding this mechanism explains not just Zustand, but Redux,
            Jotai, and any library that manages state outside of React.
          </p>
        </div>
      </section>

      {/* Section 2: The Bridge — useSyncExternalStore */}
      <section id="usesyncexternalstore" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4 text-content"
        >
          The Bridge:{" "}
          <code
            className="text-2xl px-1.5 py-0.5 rounded bg-inline-code-bg"
          >
            useSyncExternalStore
          </code>
        </h2>
        <div className="prose max-w-none">
          <p
            className="text-lg leading-relaxed text-content"
          >
            React 18 ships with a hook that lets external stores (anything not
            managed by{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded bg-inline-code-bg"
            >
              useState
            </code>{" "}
            or{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded bg-inline-code-bg"
            >
              useReducer
            </code>
            ) participate in React&apos;s rendering cycle:
          </p>
        </div>

        <div className="mt-6">
          <CodeBlock
            code={`const slice = useSyncExternalStore(
  subscribe,      // (1) How to listen for changes
  getSnapshot,    // (2) How to read the current value
  getServerSnapshot  // (3) Value for SSR (optional)
)`}
            lang="tsx"
            label="useSyncExternalStore API"
          />
        </div>

        <div className="mt-6 space-y-4">
          <div
            className="border-l-4 pl-4 py-2 border-primary"
          >
            <h3
              className="font-bold text-lg mb-1 text-content"
            >
              1.{" "}
              <code
                className="px-1.5 py-0.5 rounded bg-inline-code-bg"
              >
                subscribe(callback)
              </code>
            </h3>
            <p className="text-content-muted">
              React calls this once when the component mounts. You register the
              callback with your store. When the store changes, call the
              callback — this tells React &quot;something might have changed,
              check the snapshot.&quot;
            </p>
          </div>

          <div
            className="border-l-4 pl-4 py-2"
            style={{ borderColor: "hsl(142 76% 36%)" }}
          >
            <h3
              className="font-bold text-lg mb-1 text-content"
            >
              2.{" "}
              <code
                className="px-1.5 py-0.5 rounded bg-inline-code-bg"
              >
                getSnapshot()
              </code>
            </h3>
            <p className="text-content-muted">
              React calls this to get the current value. It compares the result
              with the previous snapshot using{" "}
              <code
                className="text-sm px-1 py-0.5 rounded bg-inline-code-bg"
              >
                Object.is()
              </code>
              . If different → re-render. If same → skip.
            </p>
          </div>

          <div
            className="border-l-4 pl-4 py-2"
            style={{ borderColor: "hsl(38 92% 50%)" }}
          >
            <h3
              className="font-bold text-lg mb-1 text-content"
            >
              3.{" "}
              <code
                className="px-1.5 py-0.5 rounded bg-inline-code-bg"
              >
                getServerSnapshot()
              </code>
            </h3>
            <p className="text-content-muted">
              Optional. Returns the value to use during server-side rendering,
              where subscriptions don&apos;t exist.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: How Zustand Uses It */}
      <section id="how-zustand-uses-it" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4 text-content"
        >
          How Zustand Uses It
        </h2>
        <div className="prose max-w-none">
          <p
            className="text-lg leading-relaxed text-content"
          >
            When you call{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded bg-inline-code-bg"
            >
              useFormStore()
            </code>{" "}
            in a component, here&apos;s what Zustand does internally:
          </p>
        </div>

        <div className="mt-6">
          <CodeBlock
            code={`// Simplified from Zustand's actual source (react.mjs)
function useStore(api, selector = identity) {
  const slice = React.useSyncExternalStore(
    api.subscribe,
    React.useCallback(
      () => selector(api.getState()),
      [api, selector]
    ),
    React.useCallback(
      () => selector(api.getInitialState()),
      [api, selector]
    ),
  )
  return slice
}`}
            lang="tsx"
            label="Zustand's React binding (simplified)"
          />
        </div>

        <div className="mt-6 prose max-w-none">
          <p
            className="leading-relaxed text-content"
          >
            Let&apos;s trace a real update step-by-step:
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {[
            {
              step: "1",
              title: "User types in email input",
              detail:
                'The onChange handler calls setEmail("a"), which calls Zustand\'s set() function. The vanilla store merges { email: "a" } into the state object.',
            },
            {
              step: "2",
              title: "Store notifies all subscribers",
              detail:
                "Zustand's store has an internal Set of listener callbacks. After updating state, it iterates the set and calls every listener. These listeners are the callbacks that React registered via useSyncExternalStore's subscribe argument.",
            },
            {
              step: "3",
              title: "React calls getSnapshot() for each subscriber",
              detail:
                'React calls the selector function — e.g. (state) => state.email for StickyBar — and compares the result with the previous snapshot using Object.is().',
            },
            {
              step: "4",
              title: "React decides: re-render or skip?",
              detail:
                'StickyBar selected email, which changed from "" to "a" → Object.is("", "a") is false → re-render. Sidebar never called useFormStore() → no subscription → no check → no re-render.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex gap-4 items-start"
            >
              <div
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: "hsl(var(--highlight-bg))",
                  color: "hsl(var(--highlight-text))",
                }}
              >
                {item.step}
              </div>
              <div>
                <h4
                  className="font-bold mb-1 text-content"
                >
                  {item.title}
                </h4>
                <p
                  className="text-sm text-content-muted"
                >
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Context vs External Store */}
      <section id="context-vs-external-store" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4 text-content"
        >
          Context vs External Store: The Fundamental Difference
        </h2>
        <div className="prose max-w-none">
          <p
            className="text-lg leading-relaxed text-content"
          >
            The key insight is <strong>who decides which components re-render</strong>:
          </p>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div
            className="p-4 rounded-lg border border-content-border bg-card-bg"
          >
            <h3
              className="font-bold mb-3 text-content"
            >
              React Context
            </h3>
            <div
              className="text-sm space-y-2 text-content-muted"
            >
              <p>
                State lives <strong>inside React</strong> (useState/useReducer
                in the Provider component).
              </p>
              <p>
                When state updates, React re-renders the Provider → all
                children re-render (React&apos;s normal top-down reconciliation).
              </p>
              <p>
                <strong>Granularity:</strong> Provider-level. Every child of the
                Provider re-renders, whether or not it calls useContext.
              </p>
            </div>
          </div>

          <div
            className="p-4 rounded-lg border border-content-border bg-card-bg"
          >
            <h3
              className="font-bold mb-3 text-content"
            >
              Zustand / Redux (External Store)
            </h3>
            <div
              className="text-sm space-y-2 text-content-muted"
            >
              <p>
                State lives <strong>outside React</strong> (plain JavaScript
                object).
              </p>
              <p>
                When state updates, the store notifies subscribers →
                useSyncExternalStore checks each component&apos;s selected slice →
                only re-renders if that slice changed.
              </p>
              <p>
                <strong>Granularity:</strong> Component-level. Each component
                independently decides whether to re-render.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Before useSyncExternalStore */}
      <section id="before-usesyncexternalstore" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4 text-content"
        >
          Before{" "}
          <code
            className="text-2xl px-1.5 py-0.5 rounded bg-inline-code-bg"
          >
            useSyncExternalStore
          </code>
          : The Old Way
        </h2>
        <div className="prose max-w-none">
          <p
            className="text-lg leading-relaxed mb-4 text-content"
          >
            Before React 18, libraries like Zustand and Redux had to use a workaround
            to connect external stores to React&apos;s rendering cycle. The pattern was
            to force a re-render using{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded bg-inline-code-bg"
            >
              useState
            </code>{" "}
            or{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded bg-inline-code-bg"
            >
              useReducer
            </code>
            :
          </p>
        </div>

        <div className="mt-6">
          <CodeBlock
            code={`// Pre-React 18 pattern
function useStore(selector) {
  // A dummy state that increments to force re-renders
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  
  useEffect(() => {
    // Subscribe to the external store
    const unsubscribe = store.subscribe(() => {
      forceUpdate(); // Force a re-render
    });
    return unsubscribe;
  }, []);
  
  // Read the latest value from the store
  return selector(store.getState());
}`}
            lang="tsx"
            label="The Force Update Pattern (Pre-React 18)"
          />
        </div>

        <div className="mt-6 prose max-w-none">
          <p
            className="leading-relaxed text-content"
          >
            This approach worked, but had critical problems:
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div
            className="p-4 rounded-lg border border-content-border bg-card-bg"
          >
            <h3
              className="font-bold mb-2 text-content"
            >
              Problem 1: Tearing in Concurrent Mode
            </h3>
            <p
              className="text-sm text-content-muted"
            >
              React 18 introduced concurrent rendering, where React can pause and resume
              renders. With the old pattern, two components reading from the same store
              during the same render could see <em>different values</em> if the store
              updated mid-render. This is called &quot;tearing&quot; — the UI becomes
              inconsistent.
            </p>
          </div>

          <div
            className="p-4 rounded-lg border border-content-border bg-card-bg"
          >
            <h3
              className="font-bold mb-2 text-content"
            >
              Problem 2: Timing and Race Conditions
            </h3>
            <p
              className="text-sm text-content-muted"
            >
              The subscription happens in{" "}
              <code
                className="text-xs px-1 py-0.5 rounded bg-inline-code-bg"
              >
                useEffect
              </code>
              , which runs <em>after</em> the initial render. If the store updates
              between the initial render and the effect, the component could miss the
              update or display stale data.
            </p>
          </div>

          <div
            className="p-4 rounded-lg border border-content-border bg-card-bg"
          >
            <h3
              className="font-bold mb-2 text-content"
            >
              Problem 3: No SSR Safety
            </h3>
            <p
              className="text-sm text-content-muted"
            >
              Server-side rendering doesn&apos;t run effects, so subscriptions never
              happen. There was no clean way to provide a server-specific snapshot of the
              store.
            </p>
          </div>
        </div>

        <div className="mt-6 prose max-w-none">
          <p
            className="leading-relaxed text-content"
          >
            <code
              className="text-sm px-1.5 py-0.5 rounded bg-inline-code-bg"
            >
              useSyncExternalStore
            </code>{" "}
            was specifically designed to solve these problems. It guarantees:
          </p>
          <ul
            className="list-disc list-inside space-y-1 ml-4 mt-3 text-content-muted"
          >
            <li>
              <strong>No tearing:</strong> All components see a consistent snapshot
              during concurrent renders
            </li>
            <li>
              <strong>Synchronous subscription:</strong> The subscription happens before
              the first render, eliminating race conditions
            </li>
            <li>
              <strong>SSR support:</strong> The optional{" "}
              <code
                className="text-xs px-1 py-0.5 rounded bg-inline-code-bg"
              >
                getServerSnapshot
              </code>{" "}
              parameter provides a server-safe fallback
            </li>
          </ul>
        </div>
      </section>

      {/* Section 6: Selector Patterns */}
      <section id="selector-patterns" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4 text-content"
        >
          Selector Patterns and the{" "}
          <code
            className="text-2xl px-1.5 py-0.5 rounded bg-inline-code-bg"
          >
            Object.is()
          </code>{" "}
          Gotcha
        </h2>
        <div className="prose max-w-none">
          <p
            className="text-lg leading-relaxed text-content"
          >
            The selector is the function you pass to{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded bg-inline-code-bg"
            >
              useStore
            </code>
            . It controls which slice of state the component subscribes to. A
            good selector makes the difference between a component re-rendering on
            every store update and re-rendering only when its data changes.
          </p>
        </div>

        <div className="mt-6">
          <CodeBlock
            code={`// Without a selector: subscribes to the entire store
// Re-renders whenever anything in the store changes
const { email, name, step } = useFormStore()

// With a selector: subscribes to exactly one field
// Re-renders only when email changes
const email = useFormStore(state => state.email)`}
            lang="tsx"
            label="Selector vs no selector"
          />
        </div>

        <div className="mt-8">
          <h3
            className="text-xl font-bold mb-3 text-content"
          >
            The Comparison Rule
          </h3>
          <p
            className="mb-4 text-content-muted"
          >
            After every store update,{" "}
            <code
              className="text-sm px-1 py-0.5 rounded bg-inline-code-bg"
            >
              useSyncExternalStore
            </code>{" "}
            calls your selector and compares the result to the previous result
            using{" "}
            <code
              className="text-sm px-1 py-0.5 rounded bg-inline-code-bg"
            >
              Object.is()
            </code>
            . This is the same comparison React uses for{" "}
            <code
              className="text-sm px-1 py-0.5 rounded bg-inline-code-bg"
            >
              useState
            </code>
            . For primitives (strings, numbers, booleans), it compares by value.
            For objects and arrays, it compares by reference.
          </p>
          <CodeBlock
            code={`Object.is("alice", "alice")   // true  → no re-render
Object.is(42, 42)             // true  → no re-render
Object.is(false, false)       // true  → no re-render

Object.is({ a: 1 }, { a: 1 }) // false → re-render every time
Object.is([1, 2], [1, 2])     // false → re-render every time`}
            lang="tsx"
            label="Object.is() comparison rules"
          />
        </div>

        <div className="mt-8">
          <h3
            className="text-xl font-bold mb-3 text-content"
          >
            The Classic Gotcha: Inline Object Selectors
          </h3>
          <p
            className="mb-4 text-content-muted"
          >
            Returning a new object from a selector is the most common Zustand
            performance mistake. Even if the data inside is identical, a new
            object reference fails the{" "}
            <code
              className="text-sm px-1 py-0.5 rounded bg-inline-code-bg"
            >
              Object.is()
            </code>{" "}
            check every time.
          </p>
          <CodeBlock
            code={`// ❌ Returns a new object every render
// Object.is({...}, {...}) → false → re-renders on every store update
const { email, name } = useFormStore(state => ({
  email: state.email,
  name: state.name,
}))

// ✅ Option 1: two separate selectors (each returns a primitive)
const email = useFormStore(state => state.email)
const name = useFormStore(state => state.name)

// ✅ Option 2: useShallow — compares object fields individually
import { useShallow } from 'zustand/react/shallow'

const { email, name } = useFormStore(
  useShallow(state => ({ email: state.email, name: state.name }))
)`}
            lang="tsx"
            label="The inline object gotcha and fixes"
          />
        </div>

        <div className="mt-8">
          <h3
            className="text-xl font-bold mb-3 text-content"
          >
            How{" "}
            <code
              className="px-1.5 py-0.5 rounded bg-inline-code-bg"
            >
              useShallow
            </code>{" "}
            Works
          </h3>
          <p
            className="mb-4 text-content-muted"
          >
            <code
              className="text-sm px-1 py-0.5 rounded bg-inline-code-bg"
            >
              useShallow
            </code>{" "}
            wraps your selector with a shallow equality check instead of{" "}
            <code
              className="text-sm px-1 py-0.5 rounded bg-inline-code-bg"
            >
              Object.is()
            </code>
            . It compares each field of the returned object individually. The
            component only re-renders if at least one field changed.
          </p>
          <CodeBlock
            code={`// useShallow compares each key with Object.is():
// prev: { email: "alice", name: "Smith" }
// next: { email: "alice", name: "Smith" }
// → Object.is(prev.email, next.email) → true
// → Object.is(prev.name, next.name)   → true
// → no change → no re-render

// prev: { email: "alice", name: "Smith" }
// next: { email: "bob",   name: "Smith" }
// → Object.is(prev.email, next.email) → false
// → re-render`}
            lang="tsx"
            label="How useShallow compares"
          />
        </div>

        <div
          className="mt-8 p-4 rounded-lg border border-content-border"
        >
          <h3
            className="font-bold mb-3 text-content"
          >
            The selector decision
          </h3>
          <div className="space-y-3 text-sm">
            {[
              {
                pattern: "Single primitive value",
                selector: "state => state.email",
                note: "Preferred. Direct Object.is() comparison.",
              },
              {
                pattern: "Multiple fields from the same store",
                selector: "useShallow(state => ({ email, name }))",
                note: "Use useShallow to avoid re-rendering on unrelated changes.",
              },
              {
                pattern: "Derived / computed value",
                selector: "state => state.items.length",
                note: "Fine if the derived result is a primitive. An inline .filter() that returns a new array has the same problem as an inline object.",
              },
              {
                pattern: "No selector at all",
                selector: "useFormStore()",
                note: "Subscribes to the entire store. Acceptable for small stores; a performance problem if the store is large and frequently updated.",
              },
            ].map((row) => (
              <div
                key={row.pattern}
                className="flex gap-4 border-b pb-3 last:border-0 last:pb-0 border-content-border"
              >
                <div
                  className="w-40 shrink-0 font-medium text-content"
                >
                  {row.pattern}
                </div>
                <div className="flex-1">
                  <code
                    className="text-xs block mb-1 px-1 py-0.5 rounded bg-inline-code-bg text-content"
                  >
                    {row.selector}
                  </code>
                  <p className="text-content-muted">{row.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Nav */}
      <div
        className="border-t pt-8 flex justify-between border-content-border"
      >
        <Link
          href="/frameworks/state-architecture"
          className="flex items-center gap-2 hover:underline text-content-muted"
        >
          <ArrowLeft size={16} />
          State Architecture
        </Link>
      </div>
    </div>
  );
}
