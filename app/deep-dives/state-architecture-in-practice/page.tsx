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
      className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg"
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
          The same feature built five ways: from a single component to
          cross-feature global state
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
