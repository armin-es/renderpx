'use client'

import { useState, useRef, useCallback } from 'react'

// ---------- shared fake data ----------
const PRODUCT = {
  name: 'Wireless Headphones Pro',
  price: '$89.99',
  stock: 142,
  rating: 4.6,
  reviews: 1843,
}

// ---------- CsrWaterfallDemo ----------
type WaterfallStep = 'html' | 'js' | 'fetch'
type WaterfallPhase = 'idle' | 'running' | 'done'

const STEPS: { key: WaterfallStep; label: string; detail: string; durationMs: number }[] = [
  { key: 'html', label: 'HTML received',      detail: '<div id="root"></div> — empty shell',  durationMs: 600 },
  { key: 'js',   label: 'JavaScript parsed',  detail: 'Bundle downloaded and executed',       durationMs: 1000 },
  { key: 'fetch',label: 'Data fetch',         detail: 'GET /api/products/123',                durationMs: 800 },
]

export function CsrWaterfallDemo() {
  const [phase, setPhase] = useState<WaterfallPhase>('idle')
  const [activeStep, setActiveStep] = useState<WaterfallStep | null>(null)
  const [doneSteps, setDoneSteps] = useState<WaterfallStep[]>([])
  const running = useRef(false)

  const run = useCallback(async () => {
    if (running.current) return
    running.current = true
    setPhase('running')
    setActiveStep(null)
    setDoneSteps([])

    const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

    for (const { key, durationMs } of STEPS) {
      setActiveStep(key)
      await sleep(durationMs)
      setDoneSteps(d => [...d, key])
    }

    setActiveStep(null)
    setPhase('done')
    running.current = false
  }, [])

  return (
    <div
      className="rounded-lg border p-5"
      style={{ borderColor: 'hsl(var(--content-border))', backgroundColor: 'hsl(var(--preview-bg))' }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold" style={{ color: 'hsl(var(--content-text))' }}>
          CSR Loading Waterfall
        </span>
        <button
          onClick={run}
          disabled={phase === 'running'}
          className="px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'hsl(var(--link))', color: 'hsl(0 0% 100%)' }}
        >
          {phase === 'idle' ? 'Simulate load' : phase === 'running' ? 'Running…' : 'Replay'}
        </button>
      </div>

      {/* Timeline */}
      <div className="space-y-3 mb-5">
        {STEPS.map(({ key, label, detail }) => {
          const isDone = doneSteps.includes(key)
          const isActive = activeStep === key
          const color = isDone || isActive ? 'hsl(var(--link))' : 'hsl(var(--content-text-muted))'
          return (
            <div key={key} className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5"
                style={{
                  borderColor: color,
                  backgroundColor: isDone ? 'hsl(var(--link))' : 'transparent',
                }}
              >
                {isDone ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : isActive ? (
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'hsl(var(--link))' }} />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color }}>{label}</div>
                <div className="text-xs" style={{ color: 'hsl(var(--content-text-muted))' }}>{detail}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* What the user sees */}
      <div
        className="rounded border p-3 min-h-[100px]"
        style={{ borderColor: 'hsl(var(--content-border))', backgroundColor: 'hsl(var(--card-bg))' }}
      >
        <div className="text-xs mb-2 font-mono" style={{ color: 'hsl(var(--content-text-muted))' }}>
          What the user sees:
        </div>
        {phase === 'idle' && (
          <div className="text-xs italic" style={{ color: 'hsl(var(--content-text-muted))' }}>
            Press &quot;Simulate load&quot; to start
          </div>
        )}
        {phase === 'running' && (activeStep === 'html' || activeStep === 'js') && (
          <div className="flex flex-col items-center justify-center h-16 gap-1">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'hsl(var(--content-border))', borderTopColor: 'hsl(var(--link))' }}
            />
            <div className="text-xs" style={{ color: 'hsl(var(--content-text-muted))' }}>
              {activeStep === 'html' ? 'Blank page…' : 'Loading…'}
            </div>
          </div>
        )}
        {phase === 'running' && activeStep === 'fetch' && (
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded animate-pulse" style={{ backgroundColor: 'hsl(var(--content-border))' }} />
            <div className="h-3 w-1/2 rounded animate-pulse" style={{ backgroundColor: 'hsl(var(--content-border))' }} />
            <div className="h-3 w-2/3 rounded animate-pulse" style={{ backgroundColor: 'hsl(var(--content-border))' }} />
          </div>
        )}
        {phase === 'done' && (
          <div>
            <div className="font-semibold text-sm" style={{ color: 'hsl(var(--content-text))' }}>{PRODUCT.name}</div>
            <div className="text-sm font-bold" style={{ color: 'hsl(var(--link))' }}>{PRODUCT.price}</div>
            <div className="text-xs mt-1" style={{ color: 'hsl(var(--content-text-muted))' }}>
              ★ {PRODUCT.rating} · {PRODUCT.reviews} reviews · {PRODUCT.stock} in stock
            </div>
          </div>
        )}
      </div>

      <div
        className="mt-3 p-2.5 rounded border text-xs transition-opacity duration-300 max-w-xs"
        style={{
          backgroundColor: 'hsl(var(--box-warning-bg))',
          borderColor: 'hsl(var(--box-warning-border))',
          color: 'hsl(var(--content-text))',
          opacity: phase === 'done' ? 1 : 0,
        }}
      >
          Each step blocks the next — that&apos;s the waterfall.
      </div>
    </div>
  )
}

// ---------- RenderingModesComparisonDemo ----------
type Mode = 'csr' | 'ssr' | 'ssg' | 'isr' | 'rsc'

const MODE_DATA: Record<
  Mode,
  {
    label: string
    ttfb: string
    htmlPreview: string
    cached: boolean
    personalized: boolean
    seoCrawlable: boolean
    freshnessNote: string
  }
> = {
  csr: {
    label: 'CSR',
    ttfb: '< 5ms',
    htmlPreview: '<div id="root"></div>\n<!-- empty — JS fills this in -->',
    cached: true,
    personalized: true,
    seoCrawlable: false,
    freshnessNote: 'Always fresh — fetched in browser on every load',
  },
  ssr: {
    label: 'SSR',
    ttfb: '100–400ms',
    htmlPreview: '<div>\n  <h1>Wireless Headphones Pro</h1>\n  <p>$89.99</p>\n  <p>In stock: 142 units</p>\n</div>\n<!-- rendered per-request on server -->',
    cached: false,
    personalized: true,
    seoCrawlable: true,
    freshnessNote: 'Always fresh — re-renders on every request',
  },
  ssg: {
    label: 'SSG',
    ttfb: '< 5ms',
    htmlPreview: '<div>\n  <h1>Wireless Headphones Pro</h1>\n  <p>$89.99</p>\n  <p>In stock: 142 units</p>\n</div>\n<!-- built once at deploy time -->',
    cached: true,
    personalized: false,
    seoCrawlable: true,
    freshnessNote: 'Stale until next build/deploy',
  },
  isr: {
    label: 'ISR',
    ttfb: '< 5ms',
    htmlPreview: '<div>\n  <h1>Wireless Headphones Pro</h1>\n  <p>$89.99</p>\n  <p>In stock: 142 units</p>\n</div>\n<!-- CDN-cached, revalidated every 60s -->',
    cached: true,
    personalized: false,
    seoCrawlable: true,
    freshnessNote: 'Stale up to 60s, then background-revalidated',
  },
  rsc: {
    label: 'RSC',
    ttfb: '< 5ms',
    htmlPreview: '<div>\n  <h1>Wireless Headphones Pro</h1>\n  <p>$89.99</p>\n  <!-- server component: no JS shipped -->\n  <AddToCartButton />\n  <!-- client component: JS only for this -->\n</div>',
    cached: true,
    personalized: true,
    seoCrawlable: true,
    freshnessNote: 'Per-fetch control: static / ISR / SSR per component',
  },
}

const MODES: Mode[] = ['csr', 'ssr', 'ssg', 'isr', 'rsc']

export function RenderingModesComparisonDemo() {
  const [selected, setSelected] = useState<Mode>('csr')
  const data = MODE_DATA[selected]

  return (
    <div
      className="rounded-lg border p-5"
      style={{ borderColor: 'hsl(var(--content-border))', backgroundColor: 'hsl(var(--preview-bg))' }}
    >
      <div className="text-sm font-semibold mb-3" style={{ color: 'hsl(var(--content-text))' }}>
        What does the browser receive?
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 mb-5 flex-wrap">
        {MODES.map(mode => (
          <button
            key={mode}
            onClick={() => setSelected(mode)}
            className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
            style={{
              backgroundColor: selected === mode ? 'hsl(var(--link))' : 'hsl(var(--card-bg))',
              color: selected === mode ? 'hsl(0 0% 100%)' : 'hsl(var(--content-text-muted))',
              border: `1px solid ${selected === mode ? 'hsl(var(--link))' : 'hsl(var(--content-border))'}`,
            }}
          >
            {MODE_DATA[mode].label}
          </button>
        ))}
      </div>

      {/* HTML preview */}
      <div
        className="rounded border p-3 mb-4 font-mono text-xs leading-relaxed"
        style={{
          backgroundColor: 'hsl(var(--code-bg))',
          borderColor: 'hsl(var(--content-border))',
          color: 'hsl(var(--content-text))',
          whiteSpace: 'pre',
        }}
      >
        {data.htmlPreview}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <Stat label="TTFB" value={data.ttfb} />
        <Stat label="Freshness" value={data.freshnessNote} small />
        <BoolStat label="CDN-cacheable" value={data.cached} />
        <BoolStat label="Personalizable" value={data.personalized} />
        <BoolStat label="SEO-crawlable" value={data.seoCrawlable} spanFull />
      </div>
    </div>
  )
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div
      className="rounded p-2.5"
      style={{ backgroundColor: 'hsl(var(--card-bg))', border: '1px solid hsl(var(--content-border))' }}
    >
      <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'hsl(var(--content-text-muted))' }}>
        {label}
      </div>
      <div className={small ? 'text-xs' : 'text-sm font-semibold'} style={{ color: 'hsl(var(--content-text))' }}>
        {value}
      </div>
    </div>
  )
}

function BoolStat({ label, value, spanFull }: { label: string; value: boolean; spanFull?: boolean }) {
  return (
    <div
      className={`rounded p-2.5 ${spanFull ? 'col-span-2' : ''}`}
      style={{ backgroundColor: 'hsl(var(--card-bg))', border: '1px solid hsl(var(--content-border))' }}
    >
      <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'hsl(var(--content-text-muted))' }}>
        {label}
      </div>
      <div
        className="text-sm font-semibold"
        style={{ color: value ? 'hsl(var(--box-success-border))' : 'hsl(var(--box-warning-border))' }}
      >
        {value ? '✓ Yes' : '✗ No'}
      </div>
    </div>
  )
}
