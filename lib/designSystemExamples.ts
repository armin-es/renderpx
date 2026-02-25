/**
 * Design System Architecture progressive examples: code + metadata.
 * Five escalating approaches to the same feature: a Button component.
 */
export const designSystemExampleContent: Record<
  string,
  { description: string; code: string; explanation: string; whenThisBreaks: string }
> = {
  '01-hardcoded': {
    description:
      'The starting point most teams land at. Styles are hardcoded directly on each component. Fast to write, impossible to maintain at scale.',
    code: `// ❌ Every team rolls their own button

// checkout/BuyButton.tsx
export function BuyButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: '#2563eb',  // hardcoded blue
        color: 'white',
        padding: '8px 16px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 500,
        border: 'none',
        cursor: 'pointer',
      }}
    >
      Buy Now
    </button>
  )
}

// marketing/SubscribeButton.tsx
export function SubscribeButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: '#3b82f6',  // slightly different blue
        color: 'white',
        padding: '8px 14px',        // slightly different padding
        borderRadius: '4px',        // slightly different radius
        fontSize: '14px',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      Subscribe
    </button>
  )
}

// settings/SaveButton.tsx
export function SaveButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#1d4ed8',      // yet another blue
        color: '#fff',
        padding: '10px 16px',       // even different padding
        borderRadius: '6px',
        fontSize: '0.875rem',
        fontWeight: '500',
        border: '0',
        cursor: 'pointer',
      }}
    >
      Save Changes
    </button>
  )
}`,
    explanation: `Works when:\n• Prototyping or proof-of-concept\n• Solo project with no expectation of maintenance\n• One-off components that won't be reused\n\nFast to write. No abstractions to learn. Just ship it.`,
    whenThisBreaks: `When the design team updates the primary color, you search-and-replace across the codebase and inevitably miss one. You end up with a product where 3 different blues coexist in production.\n\nWhen you need a "disabled" state or "loading" state, every team implements it differently.\n\nWhen a new engineer joins and asks "what's our primary button?", there's no answer — there are seven slightly different versions scattered around.`,
  },

  '02-constants': {
    description:
      'Extract design values into shared JavaScript constants. Better than inline styles, but the abstraction is shallow — JavaScript constants don\'t cascade like CSS, and TypeScript types don\'t enforce visual consistency.',
    code: `// ✅ Step up: shared constants — one source of truth for values

// lib/design-tokens.ts
export const colors = {
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  destructive: '#dc2626',
  destructiveHover: '#b91c1c',
  muted: '#6b7280',
  border: '#e5e7eb',
}

export const spacing = {
  sm: '0.25rem 0.625rem',
  md: '0.5rem 1rem',
  lg: '0.75rem 1.5rem',
}

export const radius = {
  sm: '0.375rem',
  md: '0.375rem',
  lg: '0.5rem',
}

// components/Button.tsx
import { colors, spacing, radius } from '@/lib/design-tokens'

type ButtonVariant = 'primary' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  children: React.ReactNode
  onClick?: () => void
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
}: ButtonProps) {
  const bgColor = variant === 'primary' ? colors.primary : colors.destructive

  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: bgColor,
        color: 'white',
        padding: spacing[size],
        borderRadius: radius[size],
        fontSize: '0.875rem',
        fontWeight: 500,
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}`,
    explanation: `Works when:\n• Small team with a shared constants file\n• You want TypeScript safety on your design values\n• Theming isn't a requirement\n\nOne change to \`colors.primary\` updates every component that uses it. Better than copy-pasted hex values.`,
    whenThisBreaks: `JavaScript constants don't support dark mode naturally — you need conditional logic everywhere: \`isDark ? colors.darkPrimary : colors.primary\`.\n\nYou can't override a constant at runtime without React state threading it through your component tree.\n\nBrowser devtools show \`background: #2563eb\` — no semantic name, no easy debugging. The abstraction leaks.`,
  },

  '03-css-tokens': {
    description:
      'Replace JavaScript constants with CSS custom properties (design tokens). One variable change cascades to every component simultaneously. Dark mode becomes a single class swap, not a conditional in every component.',
    code: `/* globals.css — semantic design tokens */
:root {
  /* Primitive tokens — raw values */
  --blue-500: 221 83% 53%;
  --blue-600: 221 83% 45%;
  --red-500: 0 84% 60%;
  --red-600: 0 84% 50%;

  /* Semantic tokens — intent, not appearance */
  --color-primary: var(--blue-500);
  --color-primary-hover: var(--blue-600);
  --color-destructive: var(--red-500);
  --color-destructive-hover: var(--red-600);

  --color-text: 222 47% 11%;
  --color-text-muted: 215 16% 47%;
  --color-bg: 0 0% 100%;
  --color-border: 214 32% 91%;

  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;

  --spacing-sm: 0.25rem 0.625rem;
  --spacing-md: 0.5rem 1rem;
  --spacing-lg: 0.75rem 1.5rem;
}

/* Dark mode: swap semantic tokens, primitives stay the same */
.dark {
  --color-text: 210 40% 98%;
  --color-text-muted: 215 20% 65%;
  --color-bg: 222 47% 11%;
  --color-border: 217 33% 22%;
}

/* Rebrand? One line change: */
/* :root { --color-primary: var(--purple-500); } */

/* components/Button.tsx */
export function Button({ variant = 'primary', size = 'md', children }) {
  return (
    <button
      className={\`btn btn--\${variant} btn--\${size}\`}
    >
      {children}
    </button>
  )
}

/* button.css */
.btn { font-weight: 500; cursor: pointer; border: 1px solid transparent; }
.btn--primary {
  background: hsl(var(--color-primary));
  color: white;
}
.btn--primary:hover { background: hsl(var(--color-primary-hover)); }
.btn--destructive {
  background: hsl(var(--color-destructive));
  color: white;
}
.btn--sm { padding: var(--spacing-sm); border-radius: var(--radius-sm); }
.btn--md { padding: var(--spacing-md); border-radius: var(--radius-md); }`,
    explanation: `Works when:\n• You need dark mode without conditional logic in components\n• You want devtools to show \`hsl(var(--color-primary))\` — semantic and debuggable\n• The design team uses a token-based design system in Figma\n\nChange one root variable, every component updates. Themes become a single class on \`<html>\`.`,
    whenThisBreaks: `CSS classes for variants start to multiply: \`.btn--primary-outlined\`, \`.btn--secondary-ghost\`, \`.btn--loading\`. The CSS file becomes a maintenance burden.\n\nNo TypeScript safety on which variants exist. \`<Button variant="primari" />\` silently fails — no error, no fallback.\n\nComplex variants (e.g. "outline with hover fill") require manual class combinations that are easy to miscombine.`,
  },

  '04-variant-system': {
    description:
      'Add a TypeScript variant system (CVA pattern) on top of CSS tokens. Every valid combination of variant + size is explicitly typed. The component API is self-documenting and impossible to misuse.',
    code: `// The CVA (class-variance-authority) pattern
// Works with or without the library — it's just a mapping function

// Without the library (plain TypeScript):
type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary:     'bg-primary text-white hover:bg-primary-hover',
  secondary:   'bg-transparent border border-border text-text hover:bg-muted',
  destructive: 'bg-destructive text-white hover:bg-destructive-hover',
  ghost:       'bg-transparent text-text hover:bg-muted',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-2.5 py-1 text-xs rounded',
  md: 'px-4 py-2 text-sm rounded-md',
  lg: 'px-6 py-3 text-base rounded-lg',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant   // TypeScript prevents typos at authoring time
  size?: Size
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'font-medium transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className,
      ].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}

// Or with the CVA library (more ergonomic):
import { cva } from 'class-variance-authority'

const button = cva('font-medium transition-colors', {
  variants: {
    variant: {
      primary:     'bg-primary text-white hover:bg-primary-hover',
      secondary:   'border border-border hover:bg-muted',
      destructive: 'bg-destructive text-white',
      ghost:       'hover:bg-muted',
    },
    size: {
      sm: 'px-2.5 py-1 text-xs rounded',
      md: 'px-4 py-2 text-sm rounded-md',
      lg: 'px-6 py-3 text-base rounded-lg',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})`,
    explanation: `Works when:\n• You're using Tailwind CSS (variant maps are just className strings)\n• You want TypeScript to catch \`variant="primari"\` at build time\n• You need a component library that's easy to document (Storybook stories are trivial)\n\nEvery valid combination is explicit. Adding a new variant is one object key.`,
    whenThisBreaks: `Tailwind's JIT purging can strip dynamic classes built at runtime (\`\`btn-\${variant}\`\`). You must use complete class strings, not string interpolation.\n\nFor complex interactive components (modals, dropdowns, tooltips), variant classes alone aren't enough — you also need state machine logic and ARIA attributes that are hard to get right.`,
  },

  '05-headless': {
    description:
      "Layer headless primitives (Radix UI) under your token + variant system. Accessibility is handled by the primitive. Your tokens handle the look. The result: a component library that's accessible by default and fully customizable.",
    code: `// Layer 3: Headless primitives — accessibility handled, you own the look

// Radix UI provides the state machine + ARIA. You provide styles via tokens.

import * as Dialog from '@radix-ui/react-dialog'
import * as Select from '@radix-ui/react-select'
import { cva } from 'class-variance-authority'

// ──────────────────────────────────────────────────────────────────────────
// Dialog — focus trapping, escape key, scroll lock, ARIA: all handled
// ──────────────────────────────────────────────────────────────────────────
export function Modal({ trigger, title, children }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        {/* Overlay uses your CSS token */}
        <Dialog.Overlay
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />
        {/* Content uses your tokens + variants */}
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                     w-full max-w-lg rounded-xl border p-6 shadow-xl"
          style={{
            backgroundColor: 'hsl(var(--color-bg))',
            borderColor: 'hsl(var(--color-border))',
            color: 'hsl(var(--color-text))',
          }}
        >
          <Dialog.Title className="text-lg font-semibold mb-2">
            {title}
          </Dialog.Title>
          {children}
          <Dialog.Close asChild>
            <Button variant="secondary" size="sm">Close</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Select — keyboard nav, screen reader announcements, all handled
// ──────────────────────────────────────────────────────────────────────────
export function TokenSelect({ options, value, onChange }) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        className="flex items-center justify-between px-3 py-2 rounded-md border text-sm w-full"
        style={{
          backgroundColor: 'hsl(var(--color-bg))',
          borderColor: 'hsl(var(--color-border))',
          color: 'hsl(var(--color-text))',
        }}
      >
        <Select.Value />
        <Select.Icon>▾</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="rounded-md border shadow-lg overflow-hidden"
          style={{
            backgroundColor: 'hsl(var(--color-bg))',
            borderColor: 'hsl(var(--color-border))',
          }}
        >
          <Select.Viewport className="p-1">
            {options.map(opt => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="px-3 py-1.5 text-sm rounded cursor-pointer outline-none
                           data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
                style={{ color: 'hsl(var(--color-text))' }}
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

// shadcn/ui is the shortcut: pre-built components using this exact pattern.
// You copy the files in, own the code, update tokens to match your brand.`,
    explanation: `Works when:\n• You need truly accessible interactive components (modals, selects, menus)\n• You want to skip re-implementing focus trapping and keyboard navigation\n• Your team uses shadcn/ui — copy-paste their components, then replace token values\n\nRadix handles WCAG. You handle pixels. The separation is clean.`,
    whenThisBreaks: `Radix + CVA + CSS tokens is a meaningful architectural investment — wrong choice for prototypes or a solo project with a 3-week deadline.\n\nIf you're migrating an existing codebase, wrapping old components in Radix doesn't automatically fix accessibility. You still need to audit ARIA labels, focus order, and announcements.\n\nSome Radix components have complex styling requirements (e.g. Select popover position, Dialog z-index). Budget time for that.`,
  },
}

export const designSystemExamples = [
  {
    id: '01-hardcoded',
    title: 'Example 1: Hardcoded Styles',
    subtitle: 'Inline styles per-component — fast to write, impossible to maintain',
    complexity: 'Naive',
  },
  {
    id: '02-constants',
    title: 'Example 2: JavaScript Constants',
    subtitle: 'Shared token file — one source of truth, but no cascade',
    complexity: 'Better',
  },
  {
    id: '03-css-tokens',
    title: 'Example 3: CSS Custom Properties',
    subtitle: 'Design tokens as CSS variables — cascade + dark mode for free',
    complexity: 'Production',
  },
  {
    id: '04-variant-system',
    title: 'Example 4: Variant System (CVA)',
    subtitle: 'TypeScript-safe variant API on top of tokens',
    complexity: 'Advanced',
  },
  {
    id: '05-headless',
    title: 'Example 5: Headless Primitives',
    subtitle: 'Radix UI for behavior, tokens for appearance — accessible by default',
    complexity: 'Advanced',
  },
]

export const DESIGN_SYSTEM_VISUAL_LABELS: Record<string, string> = {
  '01-hardcoded': 'Inline',
  '02-constants': 'Constants',
  '03-css-tokens': 'Tokens',
  '04-variant-system': 'Variants',
  '05-headless': 'Headless',
}
