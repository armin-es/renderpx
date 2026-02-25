import Link from "next/link";
import { CodeWithPreview } from "@/components/CodeWithPreview";
import { CodeBlock } from "@/components/CodeBlock";
import { ExampleViewer } from "@/components/ExampleViewer";
import {
  TokenDriftDemo,
  TokenCascadeDemo,
  VariantSystemDemo,
  HeadlessPrimitivesDemo,
} from "@/components/demos/DesignSystemDemos";
import {
  designSystemExamples,
  designSystemExampleContent,
  DESIGN_SYSTEM_VISUAL_LABELS,
} from "@/lib/designSystemExamples";
import { Button, Badge, Callout, InlineCode } from "@/components/ui";

const TOKEN_DRIFT_CODE = `// Three teams, three "blues" — all hardcoded, all slightly wrong
// checkout/BuyButton.tsx
<button style={{ backgroundColor: '#2563eb' }}>Buy Now</button>

// marketing/SubscribeButton.tsx
<button style={{ backgroundColor: '#3b82f6' }}>Subscribe</button>

// settings/SaveButton.tsx
<button style={{ backgroundColor: '#1d4ed8' }}>Save Changes</button>

// Rebrand request comes in.
// You search-and-replace across the codebase.
// You miss three.
// All three ship to production.`;

const TOKEN_SOLUTION_CODE = `/* globals.css */
:root {
  /* Semantic tokens — intent, not appearance */
  --color-primary: 221 83% 53%;
  --color-primary-hover: 221 83% 45%;
}

/* Dark mode: one class on <html>, zero component changes */
.dark {
  --color-primary: 221 83% 65%;  /* lighter for dark backgrounds */
}

/* components/Button.tsx — all three button variants, one token */
<button style={{ backgroundColor: 'hsl(var(--color-primary))' }}>
  Buy Now
</button>

// Rebrand? One line in globals.css:
// --color-primary: 262 83% 58%;   ← blue → purple, everywhere, instantly`;

const VARIANT_SYSTEM_CODE = `// The CVA pattern — TypeScript-safe variant API
// No library needed, but CVA makes it ergonomic

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary:     'bg-primary text-white hover:bg-primary-hover',
  secondary:   'border border-border hover:bg-muted',
  destructive: 'bg-destructive text-white hover:bg-destructive-hover',
  ghost:       'hover:bg-muted',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-2.5 py-1 text-xs rounded',
  md: 'px-4 py-2 text-sm rounded-md',
  lg: 'px-6 py-3 text-base rounded-lg',
}

export function Button({ variant = 'primary', size = 'md', ...props }) {
  return (
    <button
      className={[variantClasses[variant], sizeClasses[size]].join(' ')}
      {...props}
    />
  )
}

// TypeScript catches typos at authoring time — not in production
// <Button variant="primari" />  ← TS error: not assignable to type 'Variant'`;

const HEADLESS_CODE = `// Layer 3: Radix UI for behavior, tokens for appearance
// Accessibility is handled. You own the styles.
import * as Dialog from '@radix-ui/react-dialog'

export function Modal({ trigger, title, children }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        {/* Focus trapping, escape key, scroll lock — all handled */}
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                     w-full max-w-lg rounded-xl border p-6"
          style={{
            backgroundColor: 'hsl(var(--color-bg))',
            borderColor: 'hsl(var(--color-border))',
          }}
        >
          <Dialog.Title>{title}</Dialog.Title>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// shadcn/ui is the shortcut: pre-built components with this pattern.
// Copy-paste into your project, update tokens to match your brand.
// You own the code — shadcn is not a runtime dependency.`;

const DECISION_MATRIX = [
  {
    approach: "Roll your own (CSS + variants)",
    whenToUse: "Small team, custom brand, full control",
    tradeoffs: "You build everything — tokens, variants, accessibility",
    bestFor: "Teams with a dedicated design systems engineer",
    avoid: "Complex interactive components (modals, selects)",
  },
  {
    approach: "shadcn/ui",
    whenToUse: "Most production apps",
    tradeoffs: "Copy-paste components, you own the code",
    bestFor: "Product teams that want a head start with full control",
    avoid: "Teams that don't want to maintain copied component code",
  },
  {
    approach: "Radix UI (unstyled)",
    whenToUse: "Custom brand + complex interactions",
    tradeoffs: "You write all styles; primitives handle behavior",
    bestFor: "Design systems with strong brand requirements",
    avoid: "Teams that need to ship a UI quickly",
  },
  {
    approach: "Headless UI (Tailwind Labs)",
    whenToUse: "Tailwind-heavy codebases",
    tradeoffs: "Smaller API surface than Radix, tightly coupled to Tailwind",
    bestFor: "Next.js + Tailwind projects that need a few accessible components",
    avoid: "Projects not using Tailwind CSS",
  },
  {
    approach: "MUI / Chakra / Mantine",
    whenToUse: "Internal tools, admin panels, rapid prototyping",
    tradeoffs: "Opinionated styles, large bundle, theming friction",
    bestFor: "Fast delivery over brand fidelity",
    avoid: "Consumer products with strong visual identity requirements",
  },
];

export default async function DesignSystemsPage() {
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
          Design System Architecture
        </h1>
        <p className="text-xl" style={{ color: "hsl(var(--content-text-muted))" }}>
          Three layers: tokens, variants, primitives — and when each layer is enough.
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
            Design systems fail in one of two ways. The first is{" "}
            <strong>configuration explosion</strong>: you build a Button with 47
            props trying to cover every use case, and it becomes harder to use
            than building from scratch. The second is{" "}
            <strong>token drift</strong>: you skip the system entirely, and six
            months later your product has twelve slightly different blues.
          </p>
          <p
            className="leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            Token drift is the subtler problem. It doesn&apos;t look like a bug. Each
            team is just doing what&apos;s fast: copying a hex value from Figma,
            pasting it inline. Individually rational. Collectively, a maintenance
            nightmare.
          </p>
          <p
            className="leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            The demo below isn&apos;t hypothetical. This is what the primary button
            looks like across a real codebase after two years and three teams.
          </p>
        </div>

        <div className="mt-8">
          <CodeWithPreview
            code={TOKEN_DRIFT_CODE}
            lang="tsx"
            codeLabel="Three teams, three blues — same product, same brand"
            preview={<TokenDriftDemo />}
            previewLabel="The result after 2 years of independent work"
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
          The Solution: Three Layers
        </h2>
        <div className="space-y-4">
          <p
            className="leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            A maintainable design system isn&apos;t a single component library —
            it&apos;s three distinct layers that solve three distinct problems.
            Most teams build Layer 1, think they&apos;re done, and hit the wall
            when Layer 2 or 3 problems appear.
          </p>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {[
            {
              layer: "Layer 1",
              name: "Design Tokens",
              problem: "Values drift across teams",
              solution: "CSS custom properties as the single source of truth",
              icon: "🎨",
            },
            {
              layer: "Layer 2",
              name: "Variant System",
              problem: "Component APIs diverge",
              solution: "TypeScript-safe variant maps (CVA pattern)",
              icon: "🔧",
            },
            {
              layer: "Layer 3",
              name: "Headless Primitives",
              problem: "Accessibility is hard to get right",
              solution: "Radix UI (or similar) for behavior, tokens for appearance",
              icon: "♿",
            },
          ].map((l) => (
            <div
              key={l.layer}
              className="p-4 rounded-lg border"
              style={{
                borderColor: "hsl(var(--content-border))",
                backgroundColor: "hsl(var(--card-bg))",
              }}
            >
              <div className="text-2xl mb-2">{l.icon}</div>
              <p
                className="text-xs font-bold uppercase tracking-wider mb-1"
                style={{ color: "hsl(var(--link))" }}
              >
                {l.layer}
              </p>
              <h3
                className="font-bold text-sm mb-2"
                style={{ color: "hsl(var(--content-text))" }}
              >
                {l.name}
              </h3>
              <p
                className="text-xs mb-2"
                style={{ color: "hsl(var(--content-text-muted))" }}
              >
                <strong>Problem:</strong> {l.problem}
              </p>
              <p
                className="text-xs"
                style={{ color: "hsl(var(--content-text-muted))" }}
              >
                <strong>Fix:</strong> {l.solution}
              </p>
            </div>
          ))}
        </div>

        <div
          className="mt-6 p-4 rounded-lg border"
          style={{
            backgroundColor: "hsl(var(--box-info-bg))",
            borderColor: "hsl(var(--box-info-border))",
          }}
        >
          <p
            className="text-sm"
            style={{ color: "hsl(var(--content-text))" }}
          >
            <strong>The key insight:</strong> You don&apos;t need all three layers at
            once. A two-person startup needs Layer 1. A team shipping a consumer
            product needs Layers 1 and 2. A team building an enterprise product
            used by screen reader users needs all three. Start at the layer that
            matches your current pain.
          </p>
        </div>
      </section>

      {/* Section 3: Design Tokens */}
      <section id="design-tokens" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Layer 1: Design Tokens
        </h2>
        <div className="space-y-4">
          <p
            className="leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            Design tokens are the vocabulary of your visual language — colors,
            spacing, typography, radii — stored as CSS custom properties. The
            critical distinction is between <strong>primitive tokens</strong>{" "}
            (raw values like{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              --blue-500: 221 83% 53%
            </code>
            ) and{" "}
            <strong>semantic tokens</strong> (intent-based names like{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              --color-primary
            </code>
            ).
          </p>
          <p
            className="leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            Semantic tokens are what components reference. Primitive tokens are
            what semantic tokens point to. When you rebrand, you update the
            pointer — all components follow automatically. When you add dark
            mode, you swap the semantic tokens inside a{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              .dark
            </code>{" "}
            selector. No conditional logic in components.
          </p>
        </div>

        <div className="mt-8">
          <CodeWithPreview
            code={TOKEN_SOLUTION_CODE}
            lang="css"
            codeLabel="One token, total cascade — change the color below and watch"
            preview={<TokenCascadeDemo />}
            previewLabel="Live token editor — change --primary, see it cascade"
            layout="stacked"
          />
        </div>

        <div
          className="mt-6 p-4 rounded-lg border"
          style={{
            backgroundColor: "hsl(var(--box-yellow-bg))",
            borderColor: "hsl(var(--content-border))",
          }}
        >
          <p
            className="text-sm font-semibold mb-2"
            style={{ color: "hsl(var(--content-text))" }}
          >
            Token naming convention that scales:
          </p>
          <div className="space-y-1 text-sm font-mono" style={{ color: "hsl(var(--content-text))" }}>
            <p>
              <code
                className="px-1.5 py-0.5 rounded text-xs"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                --blue-500
              </code>{" "}
              ← primitive: never use directly in components
            </p>
            <p>
              <code
                className="px-1.5 py-0.5 rounded text-xs"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                --color-primary
              </code>{" "}
              ← semantic: what components reference
            </p>
            <p>
              <code
                className="px-1.5 py-0.5 rounded text-xs"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                --color-button-bg
              </code>{" "}
              ← component token: optional, for fine-grained overrides
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Variant System */}
      <section id="variant-system" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Layer 2: The Variant System
        </h2>
        <div className="space-y-4">
          <p
            className="leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            Tokens solve the value problem. They don&apos;t solve the API problem.
            Without a variant system, every team invents its own pattern: some
            pass{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              type="primary"
            </code>
            , some pass{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              isPrimary
            </code>
            , some pass{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              color="blue"
            </code>
            . Three buttons, three prop APIs.
          </p>
          <p
            className="leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            The CVA pattern (class-variance-authority) solves this by making
            variants a first-class TypeScript concept. Every valid combination is
            explicit and enumerable. Storybook stories write themselves. Typos
            are caught at build time, not in a PR review.
          </p>
        </div>

        <div className="mt-8">
          <CodeWithPreview
            code={VARIANT_SYSTEM_CODE}
            lang="tsx"
            codeLabel="CVA variant pattern — TypeScript-safe, self-documenting"
            preview={<VariantSystemDemo />}
            previewLabel="Button explorer — try different variants and sizes"
            layout="stacked"
          />
        </div>

        <div
          className="mt-6 p-4 rounded-lg border"
          style={{
            backgroundColor: "hsl(var(--box-info-bg))",
            borderColor: "hsl(var(--box-info-border))",
          }}
        >
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: "hsl(var(--content-text))" }}
          >
            The configuration vs. composition trap:
          </p>
          <p className="text-sm" style={{ color: "hsl(var(--content-text))" }}>
            A Button with 47 props is configuration explosion — it tries to
            handle every future use case upfront. Prefer a narrow prop surface
            (variant, size, loading, disabled) and let callers compose via{" "}
            <code
              className="text-xs px-1 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              className
            </code>{" "}
            or{" "}
            <code
              className="text-xs px-1 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              asChild
            </code>{" "}
            for the exceptions.
          </p>
        </div>
      </section>

      {/* Section 5: Headless Primitives */}
      <section id="headless-primitives" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Layer 3: Headless Primitives
        </h2>
        <div className="space-y-4">
          <p
            className="leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            Tokens and variants handle everything visual. But some components
            have complex interactive behavior that is genuinely hard to
            implement correctly: modal dialogs need focus trapping, dropdowns
            need keyboard navigation, tooltips need proper ARIA relationships.
            Getting all of this right — and keeping it right across browser
            updates — is a full-time job.
          </p>
          <p
            className="leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            Headless component libraries (Radix UI, Headless UI, Ariakit) handle
            the behavior layer. They provide zero styling but complete ARIA
            compliance and state management. Your tokens handle the rest. The
            separation is clean: they own accessibility, you own pixels.
          </p>
          <p
            className="leading-relaxed"
            style={{ color: "hsl(var(--content-text))" }}
          >
            For simpler interactive components, you can build the behavior
            yourself with proper ARIA attributes. The accordion below is fully
            accessible with no library — correct{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              aria-expanded
            </code>
            ,{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              aria-controls
            </code>
            , and{" "}
            <code
              className="text-sm px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
            >
              role=&quot;region&quot;
            </code>
            . For a select dropdown with full keyboard nav and screen reader
            support, reach for Radix.
          </p>
        </div>

        <div className="mt-8">
          <CodeWithPreview
            code={HEADLESS_CODE}
            lang="tsx"
            codeLabel="Radix Dialog — accessibility handled, you own the styles"
            preview={<HeadlessPrimitivesDemo />}
            previewLabel="Accessible accordion — no library, correct ARIA"
            layout="stacked"
          />
        </div>
      </section>

      {/* Section 6: Decision Matrix */}
      <section id="decision-matrix" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Decision Matrix: Build vs Buy
        </h2>
        <p
          className="mb-6 leading-relaxed"
          style={{ color: "hsl(var(--content-text))" }}
        >
          The real question isn&apos;t "what&apos;s best" — it&apos;s what fits your team&apos;s
          current constraints. Here&apos;s how I think about the tradeoffs:
        </p>

        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "hsl(var(--content-border))" }}>
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: "hsl(var(--card-toolbar-bg))",
                  color: "hsl(var(--content-text-muted))",
                }}
              >
                <th className="text-left px-4 py-3 font-medium">Approach</th>
                <th className="text-left px-4 py-3 font-medium">When to use</th>
                <th className="text-left px-4 py-3 font-medium">Trade-offs</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Best for</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Avoid when</th>
              </tr>
            </thead>
            <tbody>
              {DECISION_MATRIX.map((row, i) => (
                <tr
                  key={row.approach}
                  style={{
                    backgroundColor:
                      i % 2 === 1 ? "hsl(var(--table-row-alt))" : "transparent",
                    color: "hsl(var(--content-text))",
                  }}
                >
                  <td className="px-4 py-3 font-medium align-top whitespace-nowrap">
                    {row.approach}
                  </td>
                  <td className="px-4 py-3 align-top" style={{ color: "hsl(var(--content-text-muted))" }}>
                    {row.whenToUse}
                  </td>
                  <td className="px-4 py-3 align-top" style={{ color: "hsl(var(--content-text-muted))" }}>
                    {row.tradeoffs}
                  </td>
                  <td className="px-4 py-3 align-top hidden md:table-cell" style={{ color: "hsl(var(--content-text-muted))" }}>
                    {row.bestFor}
                  </td>
                  <td className="px-4 py-3 align-top hidden md:table-cell" style={{ color: "hsl(var(--content-text-muted))" }}>
                    {row.avoid}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="mt-4 p-4 rounded-lg border"
          style={{
            backgroundColor: "hsl(var(--box-success-bg))",
            borderColor: "hsl(var(--box-success-border))",
          }}
        >
          <p className="text-sm" style={{ color: "hsl(var(--content-text))" }}>
            <strong>My default recommendation:</strong> Start with shadcn/ui for
            most product work. It gives you Radix primitives + a solid token
            system + a Tailwind variant pattern, and you own every file. If your
            brand requirements diverge from what shadcn gives you, you already
            have the architecture to diverge — you just modify the files you
            copied.
          </p>
        </div>
      </section>

      {/* Section 7: Progressive Complexity */}
      <section id="progressive-complexity" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Progressive Complexity
        </h2>
        <p
          className="mb-8 leading-relaxed"
          style={{ color: "hsl(var(--content-text))" }}
        >
          The same feature — a Button component — at five stages of
          architectural maturity. Each step solves a real problem the previous
          step couldn&apos;t.
        </p>

        <ExampleViewer
          examples={designSystemExamples}
          content={designSystemExampleContent}
          visualLabels={DESIGN_SYSTEM_VISUAL_LABELS}
        />
      </section>

      {/* Section 8: Production Patterns */}
      <section id="production-patterns" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Production Patterns
        </h2>
        <div className="space-y-8">
          {/* Pattern 1 */}
          <div
            className="p-5 rounded-lg border"
            style={{
              borderColor: "hsl(var(--content-border))",
              backgroundColor: "hsl(var(--card-bg))",
            }}
          >
            <h3
              className="font-bold text-base mb-2"
              style={{ color: "hsl(var(--content-text))" }}
            >
              White-label products: semantic tokens pay off
            </h3>
            <p
              className="text-sm leading-relaxed mb-3"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              I once worked on a SaaS platform that was white-labeled for 40+
              enterprise clients — each with their own brand colors. The naive
              approach would be a per-tenant CSS file that overrides hardcoded
              values. With semantic tokens, it was a 10-line JSON file per
              client that set{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                --color-primary
              </code>
              ,{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                --color-secondary
              </code>
              , and{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                --radius-base
              </code>
              . Zero component changes. Onboarding a new client took 20 minutes
              instead of a sprint.
            </p>
            <div
              className="text-xs px-3 py-2 rounded font-mono"
              style={{
                backgroundColor: "hsl(var(--code-bg))",
                color: "hsl(var(--content-text))",
              }}
            >
              {`// tenant-config.json
{ "primary": "24 83% 53%", "secondary": "142 76% 36%", "radius": "0.75rem" }

// applied at runtime:
document.documentElement.style.setProperty('--color-primary', config.primary)`}
            </div>
          </div>

          {/* Pattern 2 */}
          <div
            className="p-5 rounded-lg border"
            style={{
              borderColor: "hsl(var(--content-border))",
              backgroundColor: "hsl(var(--card-bg))",
            }}
          >
            <h3
              className="font-bold text-base mb-2"
              style={{ color: "hsl(var(--content-text))" }}
            >
              The &quot;asChild&quot; pattern: polymorphic components without the headaches
            </h3>
            <p
              className="text-sm leading-relaxed mb-3"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              A common problem: you have a{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                Button
              </code>{" "}
              component but need it to render as a Next.js{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                Link
              </code>
              . The naive fix is{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                href
              </code>{" "}
              prop detection and conditional rendering — messy. Radix&apos;s{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                asChild
              </code>{" "}
              pattern is cleaner: your Button merges its styles onto whatever
              child element you provide.
            </p>
            <CodeBlock
              code={`// Without asChild: prop explosion
<Button href="/checkout" external>Buy Now</Button>
// now Button needs href, external, download, rel... forever

// With asChild: Button passes its styles to Link
<Button asChild>
  <Link href="/checkout">Buy Now</Link>
</Button>
// Button renders as <a> with button styles. No added props.`}
              lang="tsx"
            />
          </div>

          {/* Pattern 3 */}
          <div
            className="p-5 rounded-lg border"
            style={{
              borderColor: "hsl(var(--content-border))",
              backgroundColor: "hsl(var(--card-bg))",
            }}
          >
            <h3
              className="font-bold text-base mb-2"
              style={{ color: "hsl(var(--content-text))" }}
            >
              Structuring tokens for Figma-to-code handoff
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              The handoff gap kills design system adoption. Designers work in
              Figma with named styles. Developers implement in CSS with hex
              values. When the names match — Figma&apos;s{" "}
              <em>Color/Primary/Default</em> maps to{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                --color-primary
              </code>{" "}
              — implementation becomes mechanical. Token mismatch means
              engineers are constantly guessing intent. Tools like{" "}
              <a
                href="https://www.figma.com/community/plugin/843461159747178978/tokens-studio-for-figma"
                className="underline"
                style={{ color: "hsl(var(--link))" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Tokens Studio for Figma
              </a>{" "}
              can sync Figma styles directly to CSS variables — but even without
              tooling, aligning the naming convention cuts handoff time in half.
            </p>
          </div>

          {/* Pattern 4 */}
          <div
            className="p-5 rounded-lg border"
            style={{
              borderColor: "hsl(var(--content-border))",
              backgroundColor: "hsl(var(--card-bg))",
            }}
          >
            <h3
              className="font-bold text-base mb-2"
              style={{ color: "hsl(var(--content-text))" }}
            >
              Inheriting a codebase: audit before you build
            </h3>
            <p
              className="text-sm leading-relaxed mb-3"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              You&apos;ve joined a company with three years of accumulated hex
              values, three slightly different button components, and no token
              layer. The instinct is to propose a new design system. The right
              instinct is to audit first.
            </p>
            <p
              className="text-sm leading-relaxed mb-3"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              Grep the codebase for hardcoded color values to measure the scope
              of token drift. Identify which components are actually used versus
              which were built speculatively. Find the two or three components
              that touch the most screens — usually Button, Input, and a card
              container — those are the migration entry points. Let old and new
              code coexist while the product keeps shipping; deprecate,
              don&apos;t delete. The migration is done when old patterns stop
              appearing in <em>new</em> code, not when they&apos;ve been removed
              from old code.
            </p>
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: "hsl(var(--content-text-muted))" }}
            >
              The key call: incremental token introduction versus a larger
              cut-over. Incremental is almost always right — add CSS variables
              alongside existing hardcoded values, migrate component by
              component. A cut-over is only justified when the codebase is small
              enough to finish in one sprint. A half-done cut-over is worse than
              no migration at all.
            </p>
            <CodeBlock
              code={`// The coexistence pattern: old and new live together

// Old code stays as-is — deprecated, not deleted
<button style={{ backgroundColor: '#2563eb' }}>Submit</button>

// New code uses tokens from day one
<button className="bg-primary text-white">Submit</button>

// Migration is done when hardcoded values stop appearing in *new* PRs.
// You don't need to hunt down every legacy instance.`}
              lang="tsx"
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
          What it actually looks like to ship this in a company — with a team,
          constraints, and a product that can&apos;t stop.
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
              We were a small team of engineers and designers building a
              white-label SaaS platform for enterprise clients. The product was
              two years old and growing — fast enough that no one had stopped to
              think about visual consistency. Components had hex values hardcoded
              everywhere. No token layer. No shared conventions. Three slightly
              different versions of what was supposed to be the same primary
              button, spread across three product areas.
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
              Each new enterprise client came with a brand guide. Applying their
              brand required a sprint: find every hardcoded color in the
              codebase, update it, ship it, miss a few, patch them. We were
              doing this for every client. With 40+ clients in the pipeline,
              onboarding capacity was becoming a real bottleneck. The business
              case wasn&apos;t &ldquo;our buttons are inconsistent&rdquo; — it was
              &ldquo;we&apos;re leaving revenue on the table because what should be a
              configuration change costs us a sprint.&rdquo;
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
              I proposed a token layer and only a token layer. No new component
              library, no migration sprint, no stopping the product to refactor.
              New code uses tokens; old code stays as-is. Layer 2 could wait
              until we felt the pain of inconsistent APIs — which happened about
              three months in. We skipped building Layer 3 and reached for Radix
              only when we hit real accessibility gaps. The call I&apos;d make
              differently: I waited too long to align on token naming with
              design. We had two weeks where engineering used{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                --color-action
              </code>{" "}
              and Figma used <em>primary</em>. A 30-minute naming session in
              week one would have prevented two weeks of handoff friction.
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
              Getting design alignment was easier than expected once I stopped
              talking about architecture and started showing the mapping:{" "}
              <em>Color/Primary/Default</em> in Figma →{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                --color-primary
              </code>{" "}
              in CSS. Designers took ownership of the naming; I committed to
              matching it exactly in code. Getting engineers to change was
              slower — the team had shipped successfully with hardcoded values
              for two years. What worked: a linting rule that flagged hardcoded
              hex values in new files only, not old ones. No migration sprint.
              No stopping feature work. Adoption happened because the new
              pattern was visibly easier — changing a client&apos;s brand was
              editing one JSON file instead of grepping the codebase.
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
              Onboarding a new white-label client went from a sprint to 20
              minutes. A 10-line JSON file per client set{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                --color-primary
              </code>
              ,{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                --color-secondary
              </code>
              , and{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                --radius-base
              </code>{" "}
              at runtime — zero component changes. We never finished migrating
              the old hardcoded values. We didn&apos;t need to: the problem was
              solved at the boundary, not the interior. Old code stayed; new
              code used tokens; clients got onboarded without touching the
              codebase.
            </p>
          </div>
        </div>
      </section>

      {/* Section: Applied to This Portfolio */}
      <section id="portfolio-applied" className="mb-16">
        <h2 className="text-2xl font-bold mb-2 text-content">
          Applied to This Portfolio
        </h2>
        <p className="text-content-muted mb-10">
          This portfolio doesn&apos;t just teach the three-layer architecture — it uses it. The components below are the actual{" "}
          <InlineCode>components/ui/</InlineCode> library built for this site using the CVA pattern described above.
        </p>

        {/* Button showcase */}
        <div className="mb-10">
          <h3 className="font-bold text-lg mb-1 text-content">Button</h3>
          <p className="text-sm text-content-muted mb-4">
            4 variants × 3 sizes. Supports <InlineCode>asChild</InlineCode> for rendering as <InlineCode>&lt;a&gt;</InlineCode> or <InlineCode>&lt;Link&gt;</InlineCode> without prop explosion.
          </p>
          <div className="rounded-xl border border-content-border bg-card-bg overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="primary" size="sm">Primary sm</Button>
                <Button variant="primary" size="md">Primary md</Button>
                <Button variant="primary" size="lg">Primary lg</Button>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="secondary" size="sm">Secondary sm</Button>
                <Button variant="secondary" size="md">Secondary md</Button>
                <Button variant="secondary" size="lg">Secondary lg</Button>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="ghost" size="sm">Ghost sm</Button>
                <Button variant="ghost" size="md">Ghost md</Button>
                <Button variant="ghost" size="lg">Ghost lg</Button>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="outline" size="sm">Outline sm</Button>
                <Button variant="outline" size="md">Outline md</Button>
                <Button variant="outline" size="lg">Outline lg</Button>
              </div>
            </div>
            <div className="border-t border-content-border">
              <CodeBlock
                code={`const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-colors...',
  {
    variants: {
      variant: {
        primary:   'bg-primary text-white hover:opacity-90',
        secondary: 'border-2 border-primary text-primary hover:opacity-90',
        ghost:     'text-content hover:bg-content-border/20',
        outline:   'border border-content-border text-content hover:bg-content-border/20',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm rounded-md',
        md: 'px-4 py-2 text-sm rounded-lg',
        lg: 'px-6 py-3 text-base rounded-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

// Usage
<Button variant="primary" size="lg">Click me</Button>
<Button asChild variant="secondary"><Link href="/path">Navigate</Link></Button>`}
                lang="tsx"
                label="components/ui/button.tsx"
              />
            </div>
          </div>
        </div>

        {/* Badge showcase */}
        <div className="mb-10">
          <h3 className="font-bold text-lg mb-1 text-content">Badge</h3>
          <p className="text-sm text-content-muted mb-4">
            Semantic variants for labeling content — used for complexity indicators, status tags, and metadata.
          </p>
          <div className="rounded-xl border border-content-border bg-card-bg overflow-hidden">
            <div className="p-6">
              <div className="flex flex-wrap gap-3 items-center mb-4">
                <Badge variant="default">Default</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="muted">Muted</Badge>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <Badge variant="default" size="sm">sm</Badge>
                <Badge variant="default" size="md">md</Badge>
                <Badge variant="default" size="lg">lg</Badge>
              </div>
            </div>
            <div className="border-t border-content-border">
              <CodeBlock
                code={`<Badge variant="default">Beginner</Badge>
<Badge variant="success">Production-ready</Badge>
<Badge variant="warning">Experimental</Badge>
<Badge variant="muted" size="sm">v1.2.0</Badge>`}
                lang="tsx"
              />
            </div>
          </div>
        </div>

        {/* Callout showcase */}
        <div className="mb-10">
          <h3 className="font-bold text-lg mb-1 text-content">Callout</h3>
          <p className="text-sm text-content-muted mb-4">
            Replaces four separate box patterns (<InlineCode>box-info</InlineCode>, <InlineCode>box-success</InlineCode>, <InlineCode>box-warning</InlineCode>, <InlineCode>box-yellow</InlineCode>) that were hardcoded throughout the codebase.
          </p>
          <div className="rounded-xl border border-content-border bg-card-bg overflow-hidden">
            <div className="p-6 space-y-3">
              <Callout variant="info" title="Info">
                Use this for neutral context, tips, and supplementary explanations.
              </Callout>
              <Callout variant="success" title="Success">
                Use this for correct patterns, recommended approaches, and wins.
              </Callout>
              <Callout variant="warning" title="Warning">
                Use this for gotchas, anti-patterns, and things to avoid.
              </Callout>
              <Callout variant="note" title="Note">
                Use this for important nuances that don&apos;t fit the other categories.
              </Callout>
            </div>
            <div className="border-t border-content-border">
              <CodeBlock
                code={`// Before: hardcoded inline styles on every callout
<div
  className="p-4 rounded-lg border"
  style={{
    backgroundColor: 'hsl(var(--box-info-bg))',
    borderColor: 'hsl(var(--box-info-border))',
  }}
>

// After: semantic variant API
<Callout variant="info" title="A note">Content here</Callout>
<Callout variant="warning" title="Watch out">Content here</Callout>`}
                lang="tsx"
              />
            </div>
          </div>
        </div>

        {/* Before/After refactor */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-1 text-content">The Refactor</h3>
          <p className="text-sm text-content-muted mb-4">
            Shared layout components (<InlineCode>DocsShell</InlineCode>, <InlineCode>CodeBlock</InlineCode>, <InlineCode>CodeWithPreview</InlineCode>, <InlineCode>ExampleViewer</InlineCode>) and content pages were updated to replace inline styles with semantic Tailwind utilities bridged from the CSS token layer.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-content-border bg-card-bg overflow-hidden">
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b border-content-border text-content-muted">
                Before
              </div>
              <CodeBlock
                code={`// DocsShell.tsx — repeated on every element
<aside
  style={{
    backgroundColor: 'hsl(var(--sidebar-bg))',
    borderColor: 'hsl(var(--sidebar-border))',
  }}
>
  <span style={{ color: 'hsl(var(--content-text))' }}>
    Menu
  </span>
</aside>`}
                lang="tsx"
              />
            </div>
            <div className="rounded-xl border border-content-border bg-card-bg overflow-hidden">
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b border-content-border text-content-muted">
                After
              </div>
              <CodeBlock
                code={`// DocsShell.tsx — semantic Tailwind utilities
// CSS variables bridged via tailwind.config.js
<aside className="bg-sidebar-bg border-sidebar-border">
  <span className="text-content">
    Menu
  </span>
</aside>`}
                lang="tsx"
              />
            </div>
          </div>
        </div>

        <Callout variant="info" title="The token bridge">
          The key step: <InlineCode>tailwind.config.js</InlineCode> maps CSS custom properties to Tailwind color utilities —{" "}
          <InlineCode>text-content</InlineCode> resolves to <InlineCode>hsl(var(--content-text))</InlineCode>. This means the CSS variables in{" "}
          <InlineCode>globals.css</InlineCode> stay unchanged, dark mode keeps working, and every component drops its inline styles.
        </Callout>
      </section>

      {/* Section 9: Hot Takes */}
      <section id="hot-takes" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Hot Takes
        </h2>
        <div className="space-y-4">
          {[
            {
              claim: "shadcn/ui won.",
              detail:
                'The "build vs buy" debate for most product teams is over. shadcn gave engineers ownership (you copy files, you own them), accessibility (Radix under the hood), and a modern token system out of the box. The teams still rolling their own from scratch are spending a sprint on what shadcn gives you on day one.',
            },
            {
              claim: "MUI is a red flag in a consumer product.",
              detail:
                "MUI is excellent for internal tooling where speed matters more than brand. On a consumer product, fighting MUI's opinion system costs more than the time it saves. Every override adds specificity debt. I've seen teams spend more time working around MUI than they spent on features.",
            },
            {
              claim: "\"We'll add dark mode later\" is a lie.",
              detail:
                "I've heard it on every project that didn't ship with dark mode. The later never comes. CSS tokens make dark mode a near-zero-cost addition from day one — one `prefers-color-scheme` block in globals.css. Retrofitting dark mode into hardcoded styles is a 2-week project that touches 200 files.",
            },
            {
              claim: "Your design system is not a product.",
              detail:
                "Teams that treat their internal component library as a product — with versioning, changelogs, and a dedicated team — are over-engineering. Unless you're shipping the library externally or supporting 10+ separate app codebases, the overhead kills engineering velocity faster than it helps.",
            },
          ].map((take, i) => (
            <div
              key={i}
              className="p-4 rounded-lg border-l-4"
              style={{
                borderColor: "hsl(var(--link))",
                backgroundColor: "hsl(var(--box-info-bg))",
              }}
            >
              <p
                className="font-bold text-sm mb-1"
                style={{ color: "hsl(var(--content-text))" }}
              >
                {take.claim}
              </p>
              <p className="text-sm" style={{ color: "hsl(var(--content-text-muted))" }}>
                {take.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 10: Related Frameworks */}
      <section id="related-frameworks" className="mb-16">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "hsl(var(--content-text))" }}
        >
          Related Frameworks
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              href: "/frameworks/component-composition",
              title: "Component Composition",
              desc: "Compound components and render props — how to build flexible component APIs.",
            },
            {
              href: "/frameworks/state-architecture",
              title: "State Architecture",
              desc: "Where design tokens live in state (hint: they don't — they're in CSS).",
            },
            {
              href: "/frameworks/rendering-strategy",
              title: "Rendering Strategy",
              desc: "SSR and RSC affect how your design tokens are served and applied.",
            },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block p-4 rounded-lg border transition-colors hover:border-[hsl(var(--link))]"
              style={{
                borderColor: "hsl(var(--content-border))",
                backgroundColor: "hsl(var(--card-bg))",
              }}
            >
              <h3
                className="font-bold text-sm mb-1"
                style={{ color: "hsl(var(--link))" }}
              >
                {link.title} →
              </h3>
              <p className="text-sm" style={{ color: "hsl(var(--content-text-muted))" }}>
                {link.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
