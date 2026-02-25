import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { ExampleViewer } from "@/components/ExampleViewer";
import { stateArchitectureExampleContent } from "@/lib/stateArchitectureExamples";

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

export default async function StateArchitectureInPracticePage() {
  return (
    <div
      className="min-h-full max-w-4xl mx-auto px-6 py-10 bg-content-bg"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
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

      {/* Title */}
      <div className="mb-12">
        <h1
          className="text-4xl font-bold mb-4 text-content"
        >
          State Architecture in Practice
        </h1>
        <p
          className="text-xl text-content-muted"
        >
          Progressive complexity, production patterns, and what senior engineers
          get wrong
        </p>
      </div>

      {/* Section 1: Progressive Complexity */}
      <section id="progressive-complexity" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4 text-content"
        >
          Progressive Complexity
        </h2>
        <p className="mb-6 text-content-muted">
          The same idea—put state as close as possible to where it&apos;s
          used—applies when a feature grows. Below we take one feature, a{" "}
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

      {/* Section 2: Production Patterns */}
      <section id="production-patterns" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4 text-content"
        >
          Production Patterns
        </h2>
        <p className="mb-6 text-content-muted">
          Here&apos;s how I actually use these patterns in production
          applications.
        </p>

        <div className="space-y-8">
          <div
            className="border rounded-lg p-6 border-content-border"
          >
            <h3
              className="text-xl font-bold mb-3 text-content"
            >
              Scenario A: E-commerce Checkout
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <div
                  className="font-medium mb-1 text-content"
                >
                  The Constraints
                </div>
                <ul
                  className="list-disc list-inside space-y-1 text-content-muted"
                >
                  <li>PCI compliance requires no card data in client state</li>
                  <li>Cart must persist across sessions and devices</li>
                  <li>Checkout flow has 4 steps with form state</li>
                  <li>Need optimistic updates for UX</li>
                </ul>
              </div>

              <div>
                <div
                  className="font-medium mb-1 text-content"
                >
                  The Decision
                </div>
                <div className="text-content">
                  <p className="mb-2">
                    <strong>Cart data:</strong> Server state with React Query
                  </p>
                  <p className="mb-2">
                    <strong>Form state:</strong> Local state per step
                  </p>
                  <p className="mb-2">
                    <strong>Current step:</strong> URL parameter
                  </p>
                  <p>
                    <strong>Payment token:</strong> Ephemeral, never stored
                  </p>
                </div>
              </div>

              <div>
                <div
                  className="font-medium mb-1 text-content"
                >
                  The Trade-offs
                </div>
                <p className="text-content-muted">
                  Accepted: Slightly more complex data flow. Gained: Clear
                  separation of concerns, easier to audit for compliance,
                  natural boundaries for testing.
                </p>
              </div>
            </div>
          </div>

          <div
            className="border rounded-lg p-6 border-content-border"
          >
            <h3
              className="text-xl font-bold mb-3 text-content"
            >
              Scenario B: Collaborative Dashboard
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <div
                  className="font-medium mb-1 text-content"
                >
                  The Constraints
                </div>
                <ul
                  className="list-disc list-inside space-y-1 text-content-muted"
                >
                  <li>Multiple users editing same data in real-time</li>
                  <li>Heavy calculations for chart rendering</li>
                  <li>Need to support offline mode</li>
                  <li>Filter/sort state should be shareable</li>
                </ul>
              </div>

              <div>
                <div
                  className="font-medium mb-1 text-content"
                >
                  The Decision
                </div>
                <div className="text-content">
                  <p className="mb-2">
                    <strong>Data:</strong> WebSocket + Zustand with optimistic
                    updates
                  </p>
                  <p className="mb-2">
                    <strong>Filters:</strong> URL state (shareable links)
                  </p>
                  <p className="mb-2">
                    <strong>Chart config:</strong> Local state per widget
                  </p>
                  <p>
                    <strong>UI state:</strong> Local state (sidebar open, etc.)
                  </p>
                </div>
              </div>

              <div>
                <div
                  className="font-medium mb-1 text-content"
                >
                  What I&apos;d Do Differently
                </div>
                <p className="text-content-muted">
                  Initially used Context for all data. Performance tanked. Moved
                  to Zustand with selectors. Should have started there.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Decision Signals */}
      <section id="decision-signals" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4 text-content"
        >
          Decision Signals
        </h2>
        <p className="mb-8 text-content-muted">
          Each transition in the examples above is triggered by a specific kind
          of friction. Here are the concrete signals that tell you it&apos;s
          time to move to the next level — not earlier.
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
                "One level of prop passing is fine. Lifting is cheap — don't skip it for global state.",
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
                  <ul
                    className="space-y-1 text-sm text-content"
                  >
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
      </section>

      {/* Footer Nav */}
      <div
        className="border-t pt-8 border-content-border"
      >
        <Link
          href="/frameworks/state-architecture"
          className="flex items-center gap-2 hover:underline text-content-muted"
        >
          <ArrowLeft size={16} />
          Back to State Architecture
        </Link>
      </div>
    </div>
  );
}
