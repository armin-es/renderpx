import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { ExampleViewer } from "@/components/ExampleViewer";
import { FeatureAddDemo } from "@/components/demos/CodeOrganizationDemos";
import {
  codeOrgExamples,
  codeOrgExampleContent,
  CODEORG_VISUAL_LABELS,
} from "@/lib/codeOrganizationExamples";
import { Callout, InlineCode } from "@/components/ui";

const PROBLEM_CODE = `// Adding a "Notifications" feature to a type-based codebase

// You open your editor and start touching files in:
//   components/NotificationBell.tsx      ← new file
//   components/NotificationList.tsx      ← new file
//   components/NotificationItem.tsx      ← new file
//   hooks/useNotifications.ts            ← new file
//   hooks/useNotificationCount.ts        ← new file
//   services/notificationService.ts      ← new file
//   utils/formatNotification.ts          ← new file
//   types/index.ts                       ← edit existing file
//   constants/notificationTypes.ts       ← new file

// 6 directories. 1 feature. 9 files spread across the codebase.

// Three months later, PM asks to remove Notifications.
// You grep for "notification" and find 23 results in 9 directories.
// You're not sure which ones are safe to delete.
// You delete 8 of them and ship it.
// One missed reference breaks production at 2am.`;

const COLOCATION_RULE_CODE = `// The Colocation Heuristic:
// "Code that changes together should live together."

// If you change ProductCard, you almost always change:
//   - useProduct (the hook that feeds it)
//   - productService (the API layer it uses)
//   - types.ts (the shape of a Product)

// They change together because they model the same domain.
// So they should live together:

features/products/
  ProductCard.tsx
  ProductList.tsx
  useProduct.ts
  productService.ts
  types.ts

// The test: "Can I delete this feature by deleting one folder?"
// If yes → good structure.
// If no  → your feature is leaking across the codebase.`;

const BARREL_FILE_CODE = `// features/products/index.ts — the public contract

// ✅ Export what other parts of the app genuinely need
export { ProductCard } from './ProductCard'
export { ProductList } from './ProductList'
export { useProduct } from './useProduct'
export type { Product, ProductFilters } from './types'

// ❌ Don't export internal implementation details
// productService.ts handles API calls — only ProductCard uses it
// No other feature should be calling product APIs directly

// Consuming:
import { ProductCard, useProduct } from '@/features/products'
// ✅ Clean — respects the contract

import { productService } from '@/features/products/productService'
// ❌ Bypasses the contract — breaks when internals change`;

const ESLINT_BOUNDARY_CODE = `// .eslintrc.js — enforce module boundaries

module.exports = {
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        // Block direct imports from feature internals
        {
          group: ['@/features/*/!(index)'],
          message: 'Import from the feature index, not its internals: @/features/products'
        }
      ]
    }]
  }
}

// Now this fails at lint time:
import { productService } from '@/features/products/productService'
// ESLint: Import from the feature index, not its internals

// And this passes:
import { ProductCard } from '@/features/products'`;

const DECISION_MATRIX = [
  {
    structure: "Flat",
    teamSize: "1–2 devs",
    appScale: "< 15 files",
    featureCount: "1–3 features",
    useWhen: "Prototypes, demos, early-stage apps",
    avoid: "Any app you expect to grow",
  },
  {
    structure: "Type-Based",
    teamSize: "1–5 devs",
    appScale: "15–50 files",
    featureCount: "3–8 features",
    useWhen: "Small apps with stable feature set; utility/shared libraries",
    avoid: "Apps where features are added or deleted regularly",
  },
  {
    structure: "Feature-Based",
    teamSize: "3–15 devs",
    appScale: "50–500 files",
    featureCount: "8–30 features",
    useWhen:
      "Most production apps — the right default for medium-to-large codebases",
    avoid: "Apps so small that the overhead isn't justified",
  },
  {
    structure: "Module Contracts",
    teamSize: "5–30 devs",
    appScale: "100+ files",
    featureCount: "10+ features",
    useWhen:
      "Teams where cross-feature coupling is causing bugs; ESLint enforced",
    avoid:
      "Small teams — the ceremony outweighs the benefit; enforce gradually",
  },
  {
    structure: "Route Colocation",
    teamSize: "Any",
    appScale: "Any Next.js app",
    featureCount: "Any",
    useWhen:
      "Next.js App Router — the framework's native organization pattern",
    avoid: "Non-Next.js projects; apps with many routes sharing components",
  },
];

export default function CodeOrganizationPage() {
  return (
    <div
      className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6"
      style={{ backgroundColor: "hsl(var(--content-bg))" }}
    >
      {/* Title */}
      <div className="mb-12">
        <h1
          className="text-4xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Code Organization &amp; Boundaries
        </h1>
        <p
          className="text-xl"
          style={{ color: "hsl(var(--content-text-muted))" }}
        >
          Where do files live — and when does it matter?
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
        <div className="space-y-4">
          <p
            className="text-lg leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            Every codebase starts organized. Then it grows. Then someone adds a
            feature that touches six directories, and the file called{" "}
            <InlineCode>utils/formatNotification.ts</InlineCode> gets added to
            a folder that already has twenty other unrelated utilities in it.
          </p>
          <p
            className="leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            The default instinct is to organize by type:{" "}
            <InlineCode>components/</InlineCode>,{" "}
            <InlineCode>hooks/</InlineCode>,{" "}
            <InlineCode>utils/</InlineCode>,{" "}
            <InlineCode>services/</InlineCode>. It feels correct — components
            go with components, hooks go with hooks. But it creates a problem
            that only becomes visible when the codebase grows: a single product
            feature is now scattered across five directories.
          </p>
          <p
            className="leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            The consequence shows up when you try to delete a feature. Instead
            of removing a folder, you&apos;re running <InlineCode>grep</InlineCode>{" "}
            across the codebase, hunting for files that might be safe to
            delete—and hoping you got them all.
          </p>
        </div>

        <div className="mt-8">
          <CodeBlock
            code={PROBLEM_CODE}
            lang="tsx"
            label="The type-based scatter problem"
          />
        </div>

        <div className="mt-6">
          <FeatureAddDemo />
        </div>
      </section>

      {/* Section 2: The Framework */}
      <section id="the-framework" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          The Framework: One Heuristic, Two Questions
        </h2>

        <p
          className="text-lg leading-relaxed mb-6"
          style={{ color: "hsl(var(--content-text))" }}
        >
          The single most useful organizing principle in frontend architecture:
        </p>

        <div
          className="p-5 rounded-lg border mb-6 text-center"
          style={{
            backgroundColor: "hsl(var(--box-info-bg))",
            borderColor: "hsl(var(--box-info-border))",
          }}
        >
          <p
            className="text-xl font-bold mb-1"
            style={{ color: "hsl(var(--content-text))" }}
          >
            Code that changes together should live together.
          </p>
          <p
            className="text-sm"
            style={{ color: "hsl(var(--content-text-muted))" }}
          >
            — The Colocation Principle
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {[
            {
              question: "Does this code belong to a specific feature?",
              options: [
                {
                  label: "Yes — one feature uses it",
                  hint: "Lives inside features/that-feature/",
                },
                {
                  label: "Two or three features share it",
                  hint: "Lives in shared/ or components/",
                },
                {
                  label: "Everything uses it",
                  hint: "Lives at root: lib/, utils/",
                },
              ],
              color: "hsl(var(--box-info-bg))",
              border: "hsl(var(--box-info-border))",
            },
            {
              question: "Can I delete this feature by deleting one folder?",
              options: [
                {
                  label: "Yes",
                  hint: "✅ Good structure — feature is self-contained",
                },
                {
                  label: "No — I'd need to grep",
                  hint: "⚠️ Feature is leaking across the codebase",
                },
                {
                  label: "I'm not sure",
                  hint: "🔍 Map it — you'll find implicit coupling",
                },
              ],
              color: "hsl(var(--box-success-bg))",
              border: "hsl(var(--box-success-border))",
            },
          ].map((block) => (
            <div
              key={block.question}
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: block.color,
                borderColor: block.border,
              }}
            >
              <div
                className="font-bold text-sm mb-3"
                style={{ color: "hsl(var(--content-text))" }}
              >
                {block.question}
              </div>
              <ul className="space-y-2">
                {block.options.map(({ label, hint }) => (
                  <li
                    key={label}
                    className="text-sm"
                    style={{ color: "hsl(var(--content-text))" }}
                  >
                    <span className="font-medium">{label}</span>
                    <span
                      style={{ color: "hsl(var(--content-text-muted))" }}
                    >
                      {" "}
                      → {hint}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div>
            <h3
              className="text-lg font-bold mb-3"
              style={{ color: "hsl(var(--content-text))" }}
            >
              The Screaming Architecture test
            </h3>
            <p
              className="mb-4"
              style={{ color: "hsl(var(--content-text))" }}
            >
              Open your <InlineCode>src/</InlineCode> folder. Does it
              &quot;scream&quot; what the app does? Or does it just tell you
              it&apos;s a React app?
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm font-mono">
              <div
                className="p-4 rounded-lg border"
                style={{
                  borderColor: "hsl(var(--box-warning-border))",
                  backgroundColor: "hsl(var(--box-warning-bg))",
                }}
              >
                <div
                  className="font-sans font-bold text-xs mb-2 uppercase tracking-wide"
                  style={{ color: "hsl(var(--content-text-muted))" }}
                >
                  ❌ Type-Based — tells you the tech stack
                </div>
                <div style={{ color: "hsl(var(--content-text))" }}>
                  <div>src/</div>
                  <div className="pl-4">components/</div>
                  <div className="pl-4">hooks/</div>
                  <div className="pl-4">services/</div>
                  <div className="pl-4">utils/</div>
                  <div className="pl-4">types/</div>
                </div>
              </div>
              <div
                className="p-4 rounded-lg border"
                style={{
                  borderColor: "hsl(var(--box-success-border))",
                  backgroundColor: "hsl(var(--box-success-bg))",
                }}
              >
                <div
                  className="font-sans font-bold text-xs mb-2 uppercase tracking-wide"
                  style={{ color: "hsl(var(--content-text-muted))" }}
                >
                  ✅ Feature-Based — tells you what the app does
                </div>
                <div style={{ color: "hsl(var(--content-text))" }}>
                  <div>src/features/</div>
                  <div className="pl-4">products/</div>
                  <div className="pl-4">cart/</div>
                  <div className="pl-4">checkout/</div>
                  <div className="pl-4">notifications/</div>
                  <div className="pl-4">users/</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3
              className="text-lg font-bold mb-3"
              style={{ color: "hsl(var(--content-text))" }}
            >
              Module contracts: making dependencies explicit
            </h3>
            <p
              className="mb-4"
              style={{ color: "hsl(var(--content-text))" }}
            >
              Feature-based organization solves the scatter problem. But it
              introduces a new one: without discipline, Feature A starts
              importing directly from Feature B&apos;s internals. When B
              refactors, A breaks. The fix is an explicit public API.
            </p>
            <CodeBlock
              code={COLOCATION_RULE_CODE}
              lang="tsx"
              label="The colocation heuristic in practice"
            />
            <div className="mt-4">
              <CodeBlock
                code={BARREL_FILE_CODE}
                lang="tsx"
                label="Explicit module contracts via index.ts"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Decision Matrix */}
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
          Organization scales with team size and app complexity. Picking the
          right structure for the wrong scale is as bad as having no structure.
        </p>

        <div className="overflow-x-auto">
          <table
            className="w-full text-sm border-collapse"
            style={{ color: "hsl(var(--content-text))" }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid hsl(var(--content-border))",
                }}
              >
                {["Structure", "Team", "Scale", "Features", "Use When", "Avoid When"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-3 font-semibold text-xs uppercase tracking-wide"
                      style={{ color: "hsl(var(--content-text-muted))" }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {DECISION_MATRIX.map((row, i) => (
                <tr
                  key={row.structure}
                  style={{
                    borderBottom:
                      i < DECISION_MATRIX.length - 1
                        ? "1px solid hsl(var(--content-border))"
                        : undefined,
                  }}
                >
                  <td className="py-3 px-3 font-medium whitespace-nowrap">
                    {row.structure}
                  </td>
                  <td
                    className="py-3 px-3 whitespace-nowrap"
                    style={{ color: "hsl(var(--content-text-muted))" }}
                  >
                    {row.teamSize}
                  </td>
                  <td
                    className="py-3 px-3 whitespace-nowrap"
                    style={{ color: "hsl(var(--content-text-muted))" }}
                  >
                    {row.appScale}
                  </td>
                  <td
                    className="py-3 px-3 whitespace-nowrap"
                    style={{ color: "hsl(var(--content-text-muted))" }}
                  >
                    {row.featureCount}
                  </td>
                  <td
                    className="py-3 px-3 text-xs"
                    style={{ color: "hsl(var(--content-text))" }}
                  >
                    {row.useWhen}
                  </td>
                  <td
                    className="py-3 px-3 text-xs"
                    style={{ color: "hsl(var(--content-text-muted))" }}
                  >
                    {row.avoid}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Progressive Examples */}
      <section id="progressive-examples" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Progressive Examples
        </h2>
        <p
          className="mb-8"
          style={{ color: "hsl(var(--content-text-muted))" }}
        >
          The same e-commerce app as it grows from a prototype to a
          production-grade codebase. Each step shows what changes and why.
        </p>
        <ExampleViewer
          examples={codeOrgExamples}
          content={codeOrgExampleContent}
          visualLabels={CODEORG_VISUAL_LABELS}
        />
      </section>

      {/* Section 5: Production Patterns */}
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
              Migrating from type-based to feature-based without a rewrite
            </h3>
            <p
              className="text-sm mb-3"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              A 50-component codebase in a flat <InlineCode>components/</InlineCode>{" "}
              directory. Every feature needed touching 4+ directories for even
              minor changes. Team velocity was grinding down.
            </p>
            <div
              className="text-sm space-y-2"
              style={{ color: "hsl(var(--content-text))" }}
            >
              <div>
                <strong>The approach:</strong> Don&apos;t migrate everything at
                once. Create a <InlineCode>features/</InlineCode> directory and
                start routing new features there. When touching an existing
                feature, move its files into the feature folder as part of that
                PR. Over 6 weeks, the codebase naturally migrated.
              </div>
              <div>
                <strong>The rule we followed:</strong> &quot;If you&apos;re
                touching a file, move it to its feature folder while
                you&apos;re there.&quot; No big-bang migration. No dedicated
                refactor sprint. Just consistent incremental movement.
              </div>
              <div>
                <strong>What surprised us:</strong> The migration revealed
                three components that no one was sure which feature owned.
                They were genuinely shared — we promoted them to{" "}
                <InlineCode>shared/components/</InlineCode>. The uncertainty
                itself was a sign we hadn&apos;t thought clearly about feature
                boundaries.
              </div>
            </div>
            <div
              className="mt-3 text-xs italic"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              What I&apos;d do differently: add the ESLint boundary rule from
              day one. Within a week of the migration, two developers had
              started importing directly from feature internals. The rule would
              have caught it immediately.
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
              The barrel file that caused a 40% bundle size regression
            </h3>
            <p
              className="text-sm mb-3"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              Module contracts via barrel exports are powerful. But barrel files
              have a well-known pitfall: if your bundler can&apos;t tree-shake
              them, you import one component and get the entire barrel.
            </p>
            <div
              className="text-sm space-y-2"
              style={{ color: "hsl(var(--content-text))" }}
            >
              <div>
                <strong>What happened:</strong> A{" "}
                <InlineCode>components/ui/index.ts</InlineCode> re-exported 60+
                components. A login page imported{" "}
                <InlineCode>Button</InlineCode> from it. The bundler included
                every component in the barrel — including a chart library
                dependency — in the login bundle. Bundle size went from 120kb
                to 210kb overnight.
              </div>
              <div>
                <strong>The fix:</strong> Switched to direct imports for the
                heaviest components and kept barrel exports only for
                lightweight primitives. Added{" "}
                <InlineCode>&quot;sideEffects&quot;: false</InlineCode> to
                package.json to help the bundler tree-shake correctly. Also
                audited the barrel to remove anything that imported a large
                dependency.
              </div>
              <div>
                <strong>The rule that stuck:</strong> Barrel files are a
                developer experience tool, not a performance optimization. If
                a barrel re-exports something heavy (charts, rich text editors,
                map libraries), don&apos;t put it in the barrel.
              </div>
            </div>
            <div
              className="mt-4"
              style={{ color: "hsl(var(--content-text))" }}
            >
              <CodeBlock
                code={ESLINT_BOUNDARY_CODE}
                lang="js"
                label="Enforcing module boundaries with ESLint"
              />
            </div>
          </div>

          {/* Pattern 3 */}
          <div
            className="p-5 rounded-lg border"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <h3
              className="font-bold mb-2"
              style={{ color: "hsl(var(--content-text))" }}
            >
              Inheriting a type-based codebase: the incremental migration
            </h3>
            <p
              className="text-sm mb-3"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              You&apos;ve joined a team with three years of accumulated{" "}
              <InlineCode>components/</InlineCode>,{" "}
              <InlineCode>hooks/</InlineCode>,{" "}
              <InlineCode>services/</InlineCode>,{" "}
              <InlineCode>utils/</InlineCode>. The instinct is to propose a
              migration. The right instinct is to audit first: count how many
              files you touch for a single feature addition. If the answer is
              more than three, you have the business case. If it&apos;s one or
              two, the pain may not justify the disruption.
            </p>
            <p
              className="text-sm mb-4"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              When the migration is worth it: don&apos;t declare a refactor
              sprint. Create a <InlineCode>features/</InlineCode> directory and
              route all new development there immediately. Old code migrates
              opportunistically — when you&apos;re touching a file anyway, move
              it. Barrel files in the old structure can re-export from new
              locations during the transition. The migration is done when new
              code stops landing in <InlineCode>components/</InlineCode> —
              not when every old file has been moved.
            </p>
            <CodeBlock
              code={`// Before: adding a notification type touches 6 files across 4 folders
// components/NotificationBell.tsx   ← update
// hooks/useNotifications.ts         ← update
// services/notificationService.ts   ← update
// utils/formatNotification.ts       ← update
// types/index.ts                    ← update
// constants/notificationTypes.ts    ← update

// After: same change touches 1 folder
// features/notifications/
//   NotificationBell.tsx  ← update
//   useNotifications.ts   ← update
//   notificationService.ts
//   formatNotification.ts
//   types.ts
//   constants.ts

// Coexistence during migration: old structure re-exports from new location
// components/NotificationBell.ts (old path, kept for backwards-compat imports)
export { NotificationBell } from '../features/notifications/NotificationBell'`}
              lang="tsx"
              label="Before/after: adding a notification type"
            />
          </div>
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
          What it actually looks like to change how a team organizes code —
          with engineers who have muscle memory, a product that can&apos;t stop
          shipping, and a junior dev who broke production.
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
              Three-year-old B2B app with a type-based folder structure. Four
              engineers, fast-moving roadmap. Adding any new feature required
              touching four to six files across four directories. The codebase
              had grown to the point where onboarding a new engineer took a week
              just to understand where things lived.
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
              A junior engineer broke the notifications feature while adding an
              unrelated auth change — the same files overlapped.{" "}
              <InlineCode>hooks/useNotifications.ts</InlineCode> and{" "}
              <InlineCode>hooks/useAuth.ts</InlineCode> shared a dependency, and
              a change in one cascaded into the other in a way no one caught in
              review. The notifications feature was down for two hours before
              someone connected the PR to the incident. The coordination cost was
              becoming a tax on every sprint: features that should have been
              isolated were entangled by the folder structure.
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
              Proposed feature-based folders for all new development, no
              migration sprint. Old structure stays; new features land in{" "}
              <InlineCode>features/&lt;name&gt;/</InlineCode>. Existing files
              migrate opportunistically — when you touch a file anyway, move it.
              The only rule enforced immediately: new files go in feature folders.
              I also proposed adding the ESLint boundary rule from day one —
              that&apos;s the call I&apos;d have made even if the team pushed
              back, because without it the migration just creates two parallel
              messes instead of one.
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
              Got pushback from one engineer who preferred the mental model of
              &ldquo;all hooks in one place.&rdquo; The diff that changed the
              conversation: adding a new notification type in the old structure
              (six files, four folders) vs. the new structure (two files, one
              folder). The ESLint rule was the hardest sell — it felt like extra
              ceremony. I scoped it narrowly: it only flagged imports from feature
              internals, not between features. After the first time it caught a
              cross-feature import that would have caused a circular dependency, the
              team stopped asking why it existed.
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
              After three months, new features shipped without cross-feature file
              collisions. The notification feature that prompted the change lives
              in <InlineCode>features/notifications/</InlineCode> and
              hasn&apos;t caused an adjacent-feature incident since. Junior
              engineers onboard faster because the scope of a feature is visible
              immediately — one folder, all related code. We never finished
              migrating every old file. We didn&apos;t need to: the problem was
              solved at the growth boundary, not the historical one.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Hot Takes */}
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
              mistake: "Organizing by type because it 'feels' more structured",
              take: "Type-based organization (components/, hooks/, utils/) isn't structure — it's alphabetical grouping with extra steps. It answers 'what is this?' when the question you actually need answered is 'what does this belong to?' Feature-based organization feels messier at first because you have to make a decision. That's the point. Making that decision once is better than making it implicitly every time you search for a file.",
            },
            {
              mistake: "Creating a shared/ folder and putting everything in it",
              take: "I've seen codebases where 80% of the components are in shared/. At that point, shared/ is just components/ renamed. The rule is strict: shared/ is for code that is actually shared — used by three or more features. Two features sharing something is usually fine as a direct import. If you find yourself asking 'is this shared enough?', the answer is probably no.",
            },
            {
              mistake: "Barrel files everywhere as a reflex",
              take: "Barrel files (index.ts that re-exports everything) feel tidy. They are also one of the most common causes of accidentally-large bundles I've seen in production. The issue is that bundlers can't always tree-shake through barrels correctly, especially with mixed ESM/CJS code or side effects. Use barrel files strategically for public module APIs, not as a way to avoid typing longer import paths.",
            },
            {
              mistake: "Treating code organization as a one-time decision",
              take: "The right structure at 5 engineers is wrong at 25. The right structure for a monolith is wrong for a monorepo. Good engineers revisit structure when it starts causing friction — when PRs consistently touch too many directories, when new team members can't find things, when deleting a feature takes a day instead of an hour. Code organization is a living thing, not a founding principle.",
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
              <p
                className="text-sm"
                style={{ color: "hsl(var(--content-text-muted))" }}
              >
                {take}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 7: Related Frameworks */}
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
            <div className="font-medium mb-1">
              <Link
                href="/frameworks/component-composition"
                style={{ color: "hsl(var(--link))" }}
                className="hover:underline"
              >
                Component Composition →
              </Link>
            </div>
            <p
              className="text-sm"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              Code organization decides <em>where</em> components live.
              Component Composition covers <em>how</em> they&apos;re
              structured internally — compound components, render props,
              headless patterns. The two are complementary: feature folders
              tell you where a component lives; composition patterns tell you
              how it&apos;s built.
            </p>
          </div>

          <div
            className="p-4 rounded-lg border"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <div className="font-medium mb-1">
              <Link
                href="/frameworks/design-systems"
                style={{ color: "hsl(var(--link))" }}
                className="hover:underline"
              >
                Design System Architecture →
              </Link>
            </div>
            <p
              className="text-sm"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              Design systems live in the <InlineCode>shared/</InlineCode> or{" "}
              <InlineCode>components/ui/</InlineCode> layer — code that is
              genuinely used everywhere. The Design System Architecture
              framework covers how to build that layer: tokens, variant
              systems, and headless primitives.
            </p>
          </div>

          <div
            className="p-4 rounded-lg border"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <div className="font-medium mb-1">
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
              Feature-based organization changes where state lives. Feature
              state (filters, selections, UI state) belongs inside the feature
              folder. Global state (auth, theme, notifications) belongs in a
              shared layer. State Architecture provides the mental model for
              drawing that boundary.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
