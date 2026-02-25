'use client'

import { useState } from 'react'

// ─── Demo 1: Token Drift Problem ──────────────────────────────────────────────
// Shows three "blue" buttons built by different teams — all hardcoded, all wrong

export function TokenDriftDemo() {
  return (
    <div className="space-y-5 p-4" style={{ color: 'hsl(var(--content-text))' }}>
      <p className="text-sm" style={{ color: 'hsl(var(--content-text-muted))' }}>
        Three teams, three "primary blue" buttons. Built independently. All slightly off.
      </p>
      <div className="flex flex-wrap gap-6 items-end">
        <div className="flex flex-col items-center gap-2">
          <button
            className="px-4 py-2 rounded-md text-white text-sm font-medium"
            style={{ backgroundColor: '#3b82f6' }}
          >
            Subscribe
          </button>
          <div className="text-center">
            <p className="text-xs font-medium" style={{ color: 'hsl(var(--content-text-muted))' }}>Marketing</p>
            <code className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'hsl(var(--inline-code-bg))' }}>#3b82f6</code>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button
            className="px-4 py-2 rounded-md text-white text-sm font-medium"
            style={{ backgroundColor: '#2563eb' }}
          >
            Buy Now
          </button>
          <div className="text-center">
            <p className="text-xs font-medium" style={{ color: 'hsl(var(--content-text-muted))' }}>Checkout</p>
            <code className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'hsl(var(--inline-code-bg))' }}>#2563eb</code>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button
            className="px-4 py-2 rounded-md text-white text-sm font-medium"
            style={{ backgroundColor: '#1d4ed8' }}
          >
            Save Changes
          </button>
          <div className="text-center">
            <p className="text-xs font-medium" style={{ color: 'hsl(var(--content-text-muted))' }}>Settings</p>
            <code className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'hsl(var(--inline-code-bg))' }}>#1d4ed8</code>
          </div>
        </div>
      </div>
      <p
        className="text-xs p-3 rounded-lg border"
        style={{
          backgroundColor: 'hsl(var(--box-warning-bg))',
          borderColor: 'hsl(var(--box-warning-border))',
          color: 'hsl(var(--content-text))',
        }}
      >
        Rebrand to a new primary color? You're doing a search-and-replace across the entire codebase. Miss one and it shows in production.
      </p>
    </div>
  )
}

// ─── Demo 2: Token Cascade ────────────────────────────────────────────────────
// Change one CSS variable — every component updates immediately

const PRESETS = [
  { label: 'Blue', hue: 221 },
  { label: 'Purple', hue: 262 },
  { label: 'Green', hue: 142 },
  { label: 'Orange', hue: 24 },
  { label: 'Rose', hue: 346 },
]

export function TokenCascadeDemo() {
  const [hue, setHue] = useState(221)
  const tokenValue = `${hue} 83% 53%`

  return (
    <div
      className="space-y-5 p-4"
      style={
        {
          '--demo-primary': tokenValue,
          color: 'hsl(var(--content-text))',
        } as React.CSSProperties
      }
    >
      <div className="space-y-3">
        <p className="text-xs" style={{ color: 'hsl(var(--content-text-muted))' }}>
          Change{' '}
          <code className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'hsl(var(--inline-code-bg))' }}>
            --primary
          </code>{' '}
          — all components update from a single variable:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.hue}
              type="button"
              onClick={() => setHue(preset.hue)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                backgroundColor:
                  hue === preset.hue
                    ? `hsl(${preset.hue} 83% 53%)`
                    : 'hsl(var(--content-border) / 0.4)',
                color: hue === preset.hue ? 'white' : 'hsl(var(--content-text-muted))',
              }}
            >
              <span
                className="w-3 h-3 rounded-full border border-white/30 shrink-0"
                style={{ backgroundColor: `hsl(${preset.hue} 83% 53%)` }}
              />
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="360"
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
            className="flex-1"
          />
          <div
            className="w-8 h-8 rounded-full shrink-0 border"
            style={{
              backgroundColor: `hsl(var(--demo-primary))`,
              borderColor: 'hsl(var(--content-border))',
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <p className="text-xs" style={{ color: 'hsl(var(--content-text-muted))' }}>Primary button</p>
          <button
            className="px-4 py-2 rounded-md text-white text-sm font-medium w-full transition-colors"
            style={{ backgroundColor: 'hsl(var(--demo-primary))' }}
          >
            Save Changes
          </button>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs" style={{ color: 'hsl(var(--content-text-muted))' }}>Status badge</p>
          <div>
            <span
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: 'hsl(var(--demo-primary) / 0.15)',
                color: 'hsl(var(--demo-primary))',
              }}
            >
              Active
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs" style={{ color: 'hsl(var(--content-text-muted))' }}>Focused input</p>
          <input
            type="text"
            defaultValue="user@email.com"
            className="text-sm px-3 py-2 rounded-md border w-full outline-none"
            style={{
              borderColor: 'hsl(var(--demo-primary))',
              boxShadow: `0 0 0 3px hsl(var(--demo-primary) / 0.2)`,
              backgroundColor: 'hsl(var(--content-bg))',
              color: 'hsl(var(--content-text))',
            }}
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-xs" style={{ color: 'hsl(var(--content-text-muted))' }}>Progress bar</p>
          <div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: 'hsl(var(--demo-primary) / 0.2)' }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: '68%', backgroundColor: 'hsl(var(--demo-primary))' }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: 'hsl(var(--content-text-muted))' }}>
              68% complete
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Demo 3: Variant System ───────────────────────────────────────────────────
// Explore a Button component's variant + size API

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Variant[] = ['primary', 'secondary', 'destructive', 'ghost']
const SIZES: Size[] = ['sm', 'md', 'lg']

function getButtonStyle(variant: Variant, size: Size, hovered: boolean): React.CSSProperties {
  const bgMap: Record<Variant, string> = {
    primary: hovered ? 'hsl(221 83% 45%)' : 'hsl(221 83% 53%)',
    secondary: hovered ? 'hsl(var(--table-row-alt))' : 'transparent',
    destructive: hovered ? 'hsl(0 84% 50%)' : 'hsl(0 84% 60%)',
    ghost: hovered ? 'hsl(var(--table-row-alt))' : 'transparent',
  }
  const textMap: Record<Variant, string> = {
    primary: 'white',
    secondary: 'hsl(var(--content-text))',
    destructive: 'white',
    ghost: 'hsl(var(--content-text))',
  }
  const borderMap: Record<Variant, string> = {
    primary: 'transparent',
    secondary: 'hsl(var(--content-border))',
    destructive: 'transparent',
    ghost: 'transparent',
  }
  const paddingMap: Record<Size, string> = {
    sm: '0.25rem 0.625rem',
    md: '0.5rem 1rem',
    lg: '0.75rem 1.5rem',
  }
  const fontSizeMap: Record<Size, string> = {
    sm: '0.75rem',
    md: '0.875rem',
    lg: '1rem',
  }
  const radiusMap: Record<Size, string> = {
    sm: '0.375rem',
    md: '0.375rem',
    lg: '0.5rem',
  }

  return {
    padding: paddingMap[size],
    fontSize: fontSizeMap[size],
    borderRadius: radiusMap[size],
    backgroundColor: bgMap[variant],
    color: textMap[variant],
    border: `1px solid ${borderMap[variant]}`,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  }
}

export function VariantSystemDemo() {
  const [variant, setVariant] = useState<Variant>('primary')
  const [size, setSize] = useState<Size>('md')
  const [hovered, setHovered] = useState(false)

  return (
    <div className="space-y-5 p-4" style={{ color: 'hsl(var(--content-text))' }}>
      <div className="flex flex-wrap gap-5">
        <div className="space-y-2">
          <p className="text-xs font-medium" style={{ color: 'hsl(var(--content-text-muted))' }}>
            variant
          </p>
          <div className="flex flex-wrap gap-1.5">
            {VARIANTS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVariant(v)}
                className="px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors"
                style={{
                  backgroundColor:
                    variant === v ? 'hsl(var(--link) / 0.12)' : 'hsl(var(--content-border) / 0.3)',
                  color: variant === v ? 'hsl(var(--link))' : 'hsl(var(--content-text-muted))',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium" style={{ color: 'hsl(var(--content-text-muted))' }}>
            size
          </p>
          <div className="flex gap-1.5">
            {SIZES.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSize(sz)}
                className="px-3 py-1 rounded-full text-xs font-medium uppercase transition-colors"
                style={{
                  backgroundColor:
                    size === sz ? 'hsl(var(--link) / 0.12)' : 'hsl(var(--content-border) / 0.3)',
                  color: size === sz ? 'hsl(var(--link))' : 'hsl(var(--content-text-muted))',
                }}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="flex flex-wrap items-center gap-4 p-4 rounded-lg border min-h-16"
        style={{
          borderColor: 'hsl(var(--content-border))',
          backgroundColor: 'hsl(var(--preview-bg))',
        }}
      >
        <button
          style={getButtonStyle(variant, size, hovered)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          Click me
        </button>
        <code className="text-xs" style={{ color: 'hsl(var(--content-text-muted))' }}>
          {'<Button variant="'}
          {variant}
          {'" size="'}
          {size}
          {'" />'}
        </code>
      </div>
    </div>
  )
}

// ─── Demo 4: Headless Primitives ──────────────────────────────────────────────
// Accessible accordion built without a library — proper ARIA attributes

const ACCORDION_ITEMS = [
  {
    question: "Why not just use <details>/<summary>?",
    answer:
      "Native details/summary works but lacks animation control, keyboard navigation customization, and group exclusivity (only one open at a time). Headless libraries give you the correct ARIA semantics and state machine without the styling constraints.",
  },
  {
    question: "When should I reach for Radix UI?",
    answer:
      "When you need complex interactions that are genuinely hard to get right: dialogs with focus trapping, dropdowns with keyboard navigation, comboboxes. The rule: if WCAG has a specific interaction pattern for it, use a headless library.",
  },
  {
    question: "Does shadcn/ui replace Radix?",
    answer:
      "No — shadcn/ui builds on Radix primitives. It gives you pre-styled, copy-paste components using Radix under the hood. You still own the code; shadcn is a starter, not a runtime dependency you update.",
  },
]

export function HeadlessPrimitivesDemo() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-1 p-4">
      <p className="text-xs mb-3" style={{ color: 'hsl(var(--content-text-muted))' }}>
        Accessible accordion — no library. Correct{' '}
        <code className="px-1 rounded" style={{ backgroundColor: 'hsl(var(--inline-code-bg))' }}>
          aria-expanded
        </code>
        ,{' '}
        <code className="px-1 rounded" style={{ backgroundColor: 'hsl(var(--inline-code-bg))' }}>
          aria-controls
        </code>
        , and{' '}
        <code className="px-1 rounded" style={{ backgroundColor: 'hsl(var(--inline-code-bg))' }}>
          role="region"
        </code>
        .
      </p>
      {ACCORDION_ITEMS.map((item, i) => {
        const isOpen = openIndex === i
        const triggerId = `acc-trigger-${i}`
        const panelId = `acc-panel-${i}`

        return (
          <div
            key={i}
            className="rounded-lg overflow-hidden border"
            style={{ borderColor: 'hsl(var(--content-border))' }}
          >
            <button
              type="button"
              id={triggerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex items-center justify-between w-full px-4 py-3 text-left text-sm font-medium transition-colors"
              style={{
                backgroundColor: isOpen ? 'hsl(var(--box-info-bg))' : 'hsl(var(--card-bg))',
                color: 'hsl(var(--content-text))',
              }}
            >
              <span>{item.question}</span>
              <span
                className="shrink-0 ml-2 transition-transform duration-200"
                style={{
                  display: 'inline-block',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  color: 'hsl(var(--content-text-muted))',
                }}
              >
                ▾
              </span>
            </button>
            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="px-4 py-3 text-sm border-t"
                style={{
                  borderColor: 'hsl(var(--content-border))',
                  color: 'hsl(var(--content-text-muted))',
                  backgroundColor: 'hsl(var(--content-bg))',
                }}
              >
                {item.answer}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
