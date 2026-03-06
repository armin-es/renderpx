import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { InlineCode } from "@/components/ui/inline-code";
import { CodeBlock } from "@/components/CodeBlock";

const BUTTON_CODE = `import { Button } from '@render-px/ui'

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Polymorphic: render any element with button styles
<Button asChild variant="primary">
  <a href="/page">Link styled as button</a>
</Button>`;

const BADGE_CODE = `import { Badge } from '@render-px/ui'

<Badge variant="default">New</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Beta</Badge>
<Badge variant="muted">Archived</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>`;

const CALLOUT_CODE = `import { Callout } from '@render-px/ui'

<Callout variant="info" title="Info">
  Use this for general information or tips.
</Callout>

<Callout variant="success" title="Done">
  The operation completed successfully.
</Callout>

<Callout variant="warning" title="Warning">
  This action cannot be undone.
</Callout>

<Callout variant="note" title="Note">
  Worth keeping in mind as you proceed.
</Callout>

// Without a title
<Callout variant="info">Body-only callout.</Callout>`;

const INLINE_CODE_CODE = `import { InlineCode } from '@render-px/ui'

// Inline in prose
<p>
  Use <InlineCode>useState</InlineCode> for local state.
</p>

// Standalone
<InlineCode>npm install @render-px/ui</InlineCode>`;

type PropRow = {
  name: string;
  type: string;
  default: string;
  description: string;
};

function PropTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-content-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-card-bg border-b border-content-border">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-content-muted">
              Prop
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-content-muted">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-content-muted">
              Default
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-content-muted">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.name}
              className={`border-t border-content-border/50 ${i % 2 === 1 ? "bg-table-row-alt" : ""}`}
            >
              <td className="px-4 py-3 font-mono text-xs text-primary whitespace-nowrap">
                {row.name}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-content-muted">
                {row.type}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-content-muted">
                {row.default}
              </td>
              <td className="px-4 py-3 text-sm text-content">
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const BUTTON_PROPS: PropRow[] = [
  {
    name: "variant",
    type: "'primary' | 'secondary' | 'ghost' | 'outline'",
    default: "'primary'",
    description: "Visual style of the button.",
  },
  {
    name: "size",
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: "Controls padding and font size.",
  },
  {
    name: "asChild",
    type: "boolean",
    default: "false",
    description:
      "Passes all styles to the direct child via Radix Slot (polymorphic rendering).",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Disables interaction and reduces opacity to 50%.",
  },
  {
    name: "...rest",
    type: "ButtonHTMLAttributes<HTMLButtonElement>",
    default: "-",
    description: "All native button attributes are forwarded.",
  },
];

const BADGE_PROPS: PropRow[] = [
  {
    name: "variant",
    type: "'default' | 'success' | 'warning' | 'muted'",
    default: "'default'",
    description: "Color theme of the badge.",
  },
  {
    name: "size",
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: "Controls padding and font size.",
  },
  {
    name: "...rest",
    type: "HTMLAttributes<HTMLSpanElement>",
    default: "-",
    description: "All native span attributes are forwarded.",
  },
];

const CALLOUT_PROPS: PropRow[] = [
  {
    name: "variant",
    type: "'info' | 'success' | 'warning' | 'note'",
    default: "'info'",
    description: "Color theme applied to border, background, and title.",
  },
  {
    name: "title",
    type: "string",
    default: "undefined",
    description: "Optional heading rendered above the body content.",
  },
  {
    name: "children",
    type: "ReactNode",
    default: "-",
    description: "Body content displayed below the title.",
  },
  {
    name: "...rest",
    type: "HTMLAttributes<HTMLDivElement>",
    default: "-",
    description: "All native div attributes are forwarded.",
  },
];

const INLINE_CODE_PROPS: PropRow[] = [
  {
    name: "children",
    type: "ReactNode",
    default: "-",
    description: "Code content to display.",
  },
  {
    name: "className",
    type: "string",
    default: "''",
    description: "Additional CSS classes merged into the element.",
  },
  {
    name: "...rest",
    type: "HTMLAttributes<HTMLElement>",
    default: "-",
    description: "All native code element attributes are forwarded.",
  },
];

export default function ComponentsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
          Design System
        </p>
        <h1 className="text-3xl font-bold text-content mb-3">UI Components</h1>
        <p className="text-content-muted leading-relaxed mb-4">
          Four composable building blocks used throughout this site. Each
          component is built with{" "}
          <InlineCode>class-variance-authority</InlineCode> for variant
          management and CSS custom properties for automatic light/dark mode
          support.
        </p>
        <p className="text-sm text-content-muted">
          How and why this system was designed:{" "}
          <Link
            href="/frameworks/design-systems#portfolio-applied"
            className="text-primary hover:opacity-80 font-medium transition-opacity"
          >
            Design System Architecture →
          </Link>
        </p>
      </div>

      <div className="space-y-20">
        {/* BUTTON */}
        <section id="button" className="scroll-mt-20">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-content mb-2">Button</h2>
            <p className="text-content-muted text-sm leading-relaxed">
              A polymorphic button with four visual variants and three sizes.
              Supports the Radix <InlineCode>asChild</InlineCode> pattern to
              apply button styles to any element without wrapping it in an extra
              DOM node.
            </p>
          </div>

          <div className="bg-preview-bg rounded-lg border border-content-border p-6 mb-4 space-y-6">
            <div>
              <p className="text-xs font-medium text-content-muted mb-3">
                Variants
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="outline">Outline</Button>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-content-muted mb-3">
                Sizes
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-content-muted mb-3">
                States
              </p>
              <div className="flex flex-wrap gap-3">
                <Button disabled>Disabled</Button>
                <Button asChild variant="secondary">
                  <a href="/components">Link as button</a>
                </Button>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <PropTable rows={BUTTON_PROPS} />
          </div>
          <CodeBlock code={BUTTON_CODE} lang="tsx" label="button.tsx" />
        </section>

        {/* BADGE */}
        <section id="badge" className="scroll-mt-20">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-content mb-2">Badge</h2>
            <p className="text-content-muted text-sm leading-relaxed">
              A pill-shaped label for status indicators and metadata tags. Uses
              the same semantic color tokens as <InlineCode>Callout</InlineCode>
              , keeping the palette consistent across the system.
            </p>
          </div>

          <div className="bg-preview-bg rounded-lg border border-content-border p-6 mb-4 space-y-6">
            <div>
              <p className="text-xs font-medium text-content-muted mb-3">
                Variants
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="muted">Muted</Badge>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-content-muted mb-3">
                Sizes
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
                <Badge size="lg">Large</Badge>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <PropTable rows={BADGE_PROPS} />
          </div>
          <CodeBlock code={BADGE_CODE} lang="tsx" label="badge.tsx" />
        </section>

        {/* CALLOUT */}
        <section id="callout" className="scroll-mt-20">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-content mb-2">Callout</h2>
            <p className="text-content-muted text-sm leading-relaxed">
              A bordered box for surfacing important information inline with
              content. The optional <InlineCode>title</InlineCode> renders in a
              variant-matched color. Omit it for body-only callouts.
            </p>
          </div>

          <div className="bg-preview-bg rounded-lg border border-content-border p-6 mb-4 space-y-3">
            <Callout variant="info" title="Info">
              Use this for general tips or contextual information.
            </Callout>
            <Callout variant="success" title="Success">
              The operation completed successfully.
            </Callout>
            <Callout variant="warning" title="Warning">
              This action cannot be undone.
            </Callout>
            <Callout variant="note" title="Note">
              Worth keeping in mind as you proceed.
            </Callout>
            <Callout variant="info">
              A callout without a title, for body-only content.
            </Callout>
          </div>

          <div className="mb-4">
            <PropTable rows={CALLOUT_PROPS} />
          </div>
          <CodeBlock code={CALLOUT_CODE} lang="tsx" label="callout.tsx" />
        </section>

        {/* INLINE CODE */}
        <section id="inline-code" className="scroll-mt-20">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-content mb-2">InlineCode</h2>
            <p className="text-content-muted text-sm leading-relaxed">
              A minimal <InlineCode>{"<code>"}</InlineCode> wrapper for short
              snippets inline with prose. Uses{" "}
              <InlineCode>--inline-code-bg</InlineCode> so it adapts to the
              active theme automatically.
            </p>
          </div>

          <div className="bg-preview-bg rounded-lg border border-content-border p-6 mb-4 space-y-3">
            <p className="text-sm text-content">
              Use <InlineCode>useState</InlineCode> for local component state
              and <InlineCode>useReducer</InlineCode> when logic grows complex.
            </p>
            <p className="text-sm text-content">
              Install the package:{" "}
              <InlineCode>npm install @render-px/ui</InlineCode>
            </p>
          </div>

          <div className="mb-4">
            <PropTable rows={INLINE_CODE_PROPS} />
          </div>
          <CodeBlock
            code={INLINE_CODE_CODE}
            lang="tsx"
            label="inline-code.tsx"
          />
        </section>
      </div>
    </div>
  );
}
