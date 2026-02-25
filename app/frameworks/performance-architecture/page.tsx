import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { ExampleViewer } from "@/components/ExampleViewer";
import { MemoDemo, BundleSplitDemo } from "@/components/demos/PerformanceDemos";
import {
  performanceExamples,
  performanceExampleContent,
  PERFORMANCE_VISUAL_LABELS,
} from "@/lib/performanceExamples";
import { Callout, InlineCode } from "@/components/ui";

const BASELINE_MEASUREMENT_CODE = `// next.config.js — add bundle analyzer
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer({})

// Run: ANALYZE=true pnpm build
// Opens an interactive treemap in your browser`;

const VITALS_CODE = `// app/layout.tsx — report Web Vitals
export function reportWebVitals(metric) {
  switch (metric.name) {
    case 'LCP':  // Largest Contentful Paint — main content visible
    case 'FID':  // First Input Delay — first interaction response
    case 'CLS':  // Cumulative Layout Shift — visual stability
    case 'INP':  // Interaction to Next Paint — all interaction response
    case 'TTFB': // Time to First Byte — server response
      analytics.track(metric.name, { value: metric.value })
  }
}`;

const DECISION_MATRIX = [
  {
    symptom: "Slow initial page load",
    cause: "Large JS bundle",
    fix: "Code splitting, dynamic imports",
    tool: "Bundle Analyzer",
  },
  {
    symptom: "High LCP (> 2.5s)",
    cause: "Content not in initial HTML",
    fix: "SSR/SSG/ISR instead of CSR",
    tool: "Lighthouse",
  },
  {
    symptom: "Choppy UI when typing",
    cause: "Too many re-renders",
    fix: "React.memo, state architecture",
    tool: "React Profiler",
  },
  {
    symptom: "Slow scrolling through long lists",
    cause: "Too many DOM nodes",
    fix: "Virtualization (react-window)",
    tool: "DevTools Performance",
  },
  {
    symptom: "Page feels slow to load",
    cause: "Single slow query blocks everything",
    fix: "Streaming + Suspense",
    tool: "Network tab",
  },
  {
    symptom: "High CLS score",
    cause: "Layout shifts from dynamic content",
    fix: "Skeleton placeholders with correct dimensions",
    tool: "Lighthouse",
  },
  {
    symptom: "Slow after navigation",
    cause: "Refetching data that hasn't changed",
    fix: "React Query / caching strategy",
    tool: "Network tab",
  },
  {
    symptom: "Images cause layout shift",
    cause: "No dimensions on <img>",
    fix: "width/height props, Next.js <Image>",
    tool: "Lighthouse CLS",
  },
];

const PROFILER_CODE = `// Use React DevTools Profiler to find expensive renders
// 1. Open DevTools → Profiler tab
// 2. Click "Record"
// 3. Interact with the slow part of your UI
// 4. Click "Stop"
// 5. Look at the Flamegraph

// What to look for:
// - Wide bars = component takes a long time to render
// - Bars that appear often = component re-renders too frequently
// - "Committed at X ms" = React's total work time for that interaction

// Programmatic profiling (catch regressions in CI):
import { Profiler } from 'react'

function onRenderCallback(
  id,           // "id" prop of the Profiler tree
  phase,        // "mount" or "update"
  actualDuration, // time to render (ms)
) {
  if (actualDuration > 16) { // > 1 frame at 60fps
    console.warn(\`Slow render: \${id} took \${actualDuration}ms\`)
  }
}

<Profiler id="ProductList" onRender={onRenderCallback}>
  <ProductList products={products} />
</Profiler>`;

const FONT_CODE = `// ❌ System font stack — no loading delay, but less control
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

// ✅ Next.js font optimization — zero layout shift, self-hosted
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',  // text visible during font load
})

export default function Layout({ children }) {
  return <html className={inter.className}>{children}</html>
}
// Next.js downloads the font at build time, serves it from your domain.
// No third-party DNS lookup. No FOUT. No CLS.`;

const IMAGE_CODE = `// ❌ Raw <img> — no optimization
<img src="/hero.jpg" alt="Hero" />

// ✅ Next.js <Image> — automatic optimization
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={630}
  priority        // ← preload LCP image (above-the-fold only)
/>

// What Next.js <Image> does automatically:
// • Converts to WebP/AVIF (30-50% smaller than JPEG)
// • Resizes to exact viewport size (no 4K image on mobile)
// • Lazy loads by default (below fold images don't block)
// • Prevents CLS with width/height reservation
// • Serves from CDN with proper cache headers`;

export default function PerformanceArchitecturePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Title */}
      <div className="mb-12">
        <h1
          className="text-4xl font-bold mb-3 text-content"
        >
          Performance Architecture
        </h1>
        <p className="text-xl text-content-muted">
          How to diagnose, measure, and fix the right performance problems.
        </p>
      </div>

      {/* Section 1: The Problem */}
      <section id="the-problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          The Problem
        </h2>
        <div className="space-y-4 text-content">
          <p>
            Performance problems in React apps come in three distinct flavors — and most developers
            treat them all the same way.
          </p>
          <p>
            <strong>Network performance</strong> is about how much JavaScript the user has to
            download before anything happens. A 3MB bundle on a 4G connection takes 6+ seconds.
            The user hasn&apos;t even started rendering yet.
          </p>
          <p>
            <strong>Render performance</strong> is about wasted React work. One state change at
            the top of your tree can trigger hundreds of unnecessary re-renders — and the user
            feels it as choppy interactions, janky typing, and sluggish filters.
          </p>
          <p>
            <strong>Perceived performance</strong> is about psychology. A page that shows
            something in 100ms and fills in over the next 800ms feels faster than a page that
            shows nothing for 900ms, even if the total time is identical. Streaming and skeletons
            exploit this.
          </p>
          <Callout variant="warning" title="The trap">
            Optimizing without measuring. Developers add{" "}
            <InlineCode>memo()</InlineCode> everywhere, split every component into its own
            chunk, and virtualize every list — before checking if these are actually the
            bottlenecks. The result: added complexity, no measurable improvement.
          </Callout>
        </div>
      </section>

      {/* Section 2: The Triangle */}
      <section id="the-triangle" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          The Performance Triangle
        </h2>
        <p className="mb-6 text-content">
          Three layers, different tools, different fixes. Most pages have problems in only one
          or two of these areas.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            {
              title: "Network",
              icon: "📦",
              description: "JS bundle size, number of requests, cache strategy",
              symptoms: ["Slow initial load", "High TTFB", "Large bundle"],
              tools: ["Bundle Analyzer", "Lighthouse", "Network tab"],
              fixes: ["Code splitting", "Dynamic imports", "ISR/SSG"],
            },
            {
              title: "Render",
              icon: "⚛️",
              description: "React re-renders, DOM mutations, expensive computations",
              symptoms: ["Choppy interactions", "Sluggish typing", "Janky animations"],
              tools: ["React Profiler", "DevTools Performance", "why-did-you-render"],
              fixes: ["React.memo", "State architecture", "Virtualization"],
            },
            {
              title: "Perceived",
              icon: "👁️",
              description: "Time until user sees something meaningful on screen",
              symptoms: ["Blank white screen", "Layout shifts", "Spinner overload"],
              tools: ["Lighthouse LCP/CLS", "WebPageTest", "User timing"],
              fixes: ["Streaming", "Suspense", "Skeleton loaders"],
            },
          ].map((layer) => (
            <div
              key={layer.title}
              className="rounded-lg border p-4"
              style={{
                borderColor: "hsl(var(--content-border))",
                backgroundColor: "hsl(var(--card-bg))",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{layer.icon}</span>
                <h3 className="font-bold text-content">{layer.title}</h3>
              </div>
              <p className="text-xs mb-3 text-content-muted">{layer.description}</p>
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1 text-content-muted">
                    Symptoms
                  </p>
                  <ul className="space-y-0.5">
                    {layer.symptoms.map((s) => (
                      <li key={s} className="text-xs text-content">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1 text-content-muted">
                    Fixes
                  </p>
                  <ul className="space-y-0.5">
                    {layer.fixes.map((f) => (
                      <li key={f} className="text-xs text-content">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: The Framework */}
      <section id="the-framework" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          The Framework: Measure, Identify, Fix
        </h2>
        <p className="mb-6 text-content">
          Every performance investigation follows the same three steps. The order matters —
          skipping straight to &quot;fix&quot; is how developers spend a week optimizing
          something that wasn&apos;t the bottleneck.
        </p>

        <div className="space-y-6 mb-8">
          <div
            className="rounded-lg border p-5"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <div className="flex items-start gap-3">
              <span
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 text-white"
                style={{ backgroundColor: "hsl(var(--link))" }}
              >
                1
              </span>
              <div>
                <h3 className="font-bold mb-1 text-content">Measure first</h3>
                <p className="text-sm text-content-muted mb-3">
                  Get a number. &quot;It feels slow&quot; is not actionable. &quot;LCP is 4.2s on
                  mobile&quot; is.
                </p>
                <div className="space-y-2">
                  <CodeBlock code={BASELINE_MEASUREMENT_CODE} lang="js" label="Bundle analysis" />
                  <CodeBlock code={VITALS_CODE} lang="tsx" label="Web Vitals reporting" />
                </div>
              </div>
            </div>
          </div>

          <div
            className="rounded-lg border p-5"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <div className="flex items-start gap-3">
              <span
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 text-white"
                style={{ backgroundColor: "hsl(var(--link))" }}
              >
                2
              </span>
              <div>
                <h3 className="font-bold mb-1 text-content">Identify the layer</h3>
                <p className="text-sm text-content-muted mb-3">
                  Is the number in the Network, Render, or Perceived column? Each layer has
                  different tools and different fixes.
                </p>
                <Callout variant="info">
                  High LCP with fast TTFB → Render layer (RSC/SSR missing, CSR waterfall)
                  <br />
                  High LCP with slow TTFB → Network layer (server slow, no caching)
                  <br />
                  Choppy interactions → Render layer (re-renders, expensive components)
                  <br />
                  Slow initial load on mobile → Network layer (bundle too large)
                </Callout>
              </div>
            </div>
          </div>

          <div
            className="rounded-lg border p-5"
            style={{ borderColor: "hsl(var(--content-border))" }}
          >
            <div className="flex items-start gap-3">
              <span
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0 text-white"
                style={{ backgroundColor: "hsl(var(--link))" }}
              >
                3
              </span>
              <div>
                <h3 className="font-bold mb-1 text-content">Apply the fix, re-measure</h3>
                <p className="text-sm text-content-muted mb-3">
                  Apply one fix at a time. Re-run your measurement. If the number moved,
                  the fix worked. If it didn&apos;t move, you fixed the wrong thing.
                </p>
                <Callout variant="success">
                  The goal is a measurable number improving — not &quot;this code looks more
                  optimized.&quot; Don&apos;t stop until you can show before/after metrics.
                </Callout>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Decision Matrix */}
      <section id="decision-matrix" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          Decision Matrix
        </h2>
        <p className="mb-4 text-content-muted">
          Match the symptom to the fix. Use the tool column to confirm the diagnosis before
          applying anything.
        </p>

        <div
          className="rounded-lg border overflow-hidden"
          style={{ borderColor: "hsl(var(--content-border))" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: "hsl(var(--code-bg))",
                  borderBottom: "1px solid hsl(var(--content-border))",
                }}
              >
                {["Symptom", "Likely cause", "Fix", "Confirm with"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-content-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DECISION_MATRIX.map((row, i) => (
                <tr
                  key={row.symptom}
                  style={{
                    borderBottom:
                      i < DECISION_MATRIX.length - 1
                        ? "1px solid hsl(var(--content-border))"
                        : "none",
                    backgroundColor:
                      i % 2 === 0 ? "transparent" : "hsl(var(--code-bg) / 0.4)",
                  }}
                >
                  <td className="px-4 py-3 font-medium text-content">{row.symptom}</td>
                  <td className="px-4 py-3 text-content-muted">{row.cause}</td>
                  <td className="px-4 py-3 text-content">{row.fix}</td>
                  <td className="px-4 py-3">
                    <InlineCode>{row.tool}</InlineCode>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 5: Re-render demo */}
      <section id="render-demo" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          Re-renders in Action
        </h2>
        <p className="mb-6 text-content">
          The most common render performance issue: a state change in a parent component
          triggers re-renders in every child — even children that have no dependency on that
          state. Type in the input below to see the difference.
        </p>
        <div className="mb-6">
          <MemoDemo />
        </div>
        <Callout variant="info" title="React 19 Compiler">
          The React Compiler (stable in React 19) applies{" "}
          <InlineCode>memo()</InlineCode> semantics automatically. It analyzes your
          component&apos;s dependencies at the AST level and only re-renders what actually
          changed. On React 19+, you don&apos;t need to write{" "}
          <InlineCode>memo()</InlineCode> manually — the compiler does it for you, and does
          it more precisely than manual annotations.
        </Callout>
      </section>

      {/* Section 6: Bundle split demo */}
      <section id="bundle-demo" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          Bundle Splitting in Action
        </h2>
        <p className="mb-6 text-content">
          Heavy libraries like chart tools and rich text editors are often loaded eagerly —
          even on pages where the user never opens them. Code splitting defers these to
          on-demand chunks that only download when actually needed.
        </p>
        <div className="mb-6">
          <BundleSplitDemo />
        </div>
        <p className="text-sm text-content-muted">
          The &quot;eager&quot; total is what downloads on the user&apos;s first visit to any page.
          Deferred chunks only download when the user navigates to a feature that needs them.
          For a chart library used only in the Analytics section, most users never pay for it.
        </p>
      </section>

      {/* Section 7: Progressive Examples */}
      <section id="progressive-examples" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          Progressive Examples
        </h2>
        <p className="mb-6 text-content-muted">
          Five escalating optimization patterns for a product dashboard. Each example builds on the
          previous — you wouldn&apos;t apply all five simultaneously; you apply the ones your measurements
          point to.
        </p>
        <ExampleViewer
          examples={performanceExamples}
          content={performanceExampleContent}
          visualLabels={PERFORMANCE_VISUAL_LABELS}
        />
      </section>

      {/* Section 8: Production patterns */}
      <section id="production-patterns" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          Production Patterns
        </h2>

        <div className="space-y-10">
          {/* React Profiler */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-content">
              Using the React Profiler
            </h3>
            <p className="mb-4 text-content-muted">
              React DevTools&apos; Profiler is the correct tool for diagnosing render
              performance. It shows you exactly which components rendered, why they rendered,
              and how long they took — organized as a flamegraph.
            </p>
            <CodeBlock code={PROFILER_CODE} lang="tsx" label="React Profiler — programmatic" />
          </div>

          {/* Images */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-content">
              Image Optimization
            </h3>
            <p className="mb-4 text-content-muted">
              Images are often the single largest contributor to LCP. In Next.js, the{" "}
              <InlineCode>{"<Image>"}</InlineCode> component handles format conversion,
              resizing, lazy loading, and CLS prevention automatically.
            </p>
            <CodeBlock code={IMAGE_CODE} lang="tsx" label="Next.js Image optimization" />
          </div>

          {/* Fonts */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-content">
              Font Optimization
            </h3>
            <p className="mb-4 text-content-muted">
              Google Fonts loaded via <InlineCode>{"<link>"}</InlineCode> tags cause a
              third-party DNS lookup + stylesheet fetch before text can render. Next.js{" "}
              <InlineCode>next/font</InlineCode> downloads and self-hosts the font at build
              time — eliminating the network round-trip entirely.
            </p>
            <CodeBlock code={FONT_CODE} lang="tsx" label="Font loading strategy" />
          </div>

          {/* Monitoring */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-content">
              Continuous Monitoring
            </h3>
            <p className="mb-4 text-content-muted">
              Performance regressions are silent. A dependency upgrade adds 50KB to your
              bundle. A new component re-renders on every keystroke. Without monitoring,
              you discover these in a user complaint six months later.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Callout variant="success" title="In CI">
                Use <InlineCode>bundlesize</InlineCode> or{" "}
                <InlineCode>@next/bundle-analyzer</InlineCode> with size budgets. Fail
                the build when a chunk exceeds a threshold. Treat bundle size as a
                first-class constraint, not an afterthought.
              </Callout>
              <Callout variant="info" title="In production">
                Collect Web Vitals from real users (not just Lighthouse synthetic tests).
                Lighthouse measures a controlled environment. Real users have slow
                connections, old devices, and browser extensions. Field data tells a
                different story.
              </Callout>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: Hot Takes */}
      <section id="hot-takes" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          Common Mistakes &amp; Hot Takes
        </h2>

        <div className="space-y-4">
          {[
            {
              take: "memo() everywhere is not a performance strategy",
              detail:
                "memo() has overhead. The comparison function runs on every render. For cheap components, the comparison is more expensive than just re-rendering. Only memo() components that are demonstrably slow, or components that receive stable props but have an expensive render.",
            },
            {
              take: "Lighthouse is a synthetic benchmark, not a user experience report",
              detail:
                "Lighthouse runs on a simulated throttled connection in a controlled Chrome instance. Your users have real connections, real devices, and real browser extensions. A perfect Lighthouse score doesn't mean your app is fast for real users. Field data (CrUX data, your own Web Vitals reporting) is ground truth.",
            },
            {
              take: "Code splitting the wrong things slows you down",
              detail:
                "Splitting a 2KB utility into its own chunk adds more overhead (HTTP request, runtime chunk loading) than it saves. Split large third-party libraries (> 30KB) and routes you expect users won't visit. Don't split everything by default.",
            },
            {
              take: "Choosing the right rendering strategy is worth more than any optimization",
              detail:
                "Switching a CSR page to ISR can take a 4-second LCP to 300ms — no memoization, no virtualization, no bundle splitting needed. Architecture-level decisions (where rendering happens) have higher leverage than code-level optimizations. Fix the architecture before micro-optimizing.",
            },
            {
              take: "React Compiler makes manual memo() mostly obsolete",
              detail:
                "React 19's compiler automatically memoizes components and values based on actual dependency tracking — better than what humans write by hand. If you're starting a new project, use React 19 and skip writing memo/useCallback/useMemo for optimization purposes. You still use useMemo for semantics (stable identity), but not for performance.",
            },
          ].map((item) => (
            <div
              key={item.take}
              className="rounded-lg border p-5"
              style={{
                borderColor: "hsl(var(--content-border))",
                backgroundColor: "hsl(var(--card-bg))",
              }}
            >
              <p className="font-semibold mb-2 text-content">🔥 {item.take}</p>
              <p className="text-sm text-content-muted">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 10: Real Rollout */}
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
          What it looks like to diagnose a performance problem correctly — and
          why the fix is almost never what the team first assumes.
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
              E-commerce product listing page — React SPA, fully client-side
              rendered. The page ranked on Google. Core Web Vitals started
              failing in Search Console: LCP on mobile averaging 4.1s against a
              2.5s green threshold. Four engineers on the frontend team, all
              aware of the problem, each with a different theory about the cause.
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
              The team&apos;s instinct was to add{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                memo()
              </code>{" "}
              everywhere — it was the performance tool people knew. But running
              the React Profiler showed no unusually expensive renders. The
              problem wasn&apos;t in React at all. The main bundle was 2.1MB
              parsed and executed before a single pixel rendered. On a throttled
              mobile connection, the page showed a blank white screen for nearly
              three seconds. Google penalizes LCP, not render flamegraphs.
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
              Identified the bottleneck in the Network + Perceived layers, not
              the Render layer. Two decisions: switch product listing pages from
              CSR to SSG with ISR — the content was the same for all users,
              there was no reason to render it client-side on every request.
              And split the analytics library (400KB) and chart library (900KB)
              out of the main bundle — both were loaded eagerly on every page
              but only used in the{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                /analytics
              </code>{" "}
              admin route. The{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                memo()
              </code>{" "}
              work the team had originally planned: didn&apos;t do it.
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
              The hardest conversation was with the analytics engineer, who
              pushed back on splitting the library: &ldquo;if it&apos;s not
              loaded eagerly, we&apos;ll miss events on first page load.&rdquo;
              Opened the bundle analyzer together. Showed that the 3KB analytics
              snippet — the part that fires events — was a separate entry point
              from the 400KB dashboard library (charts, tables) that had no
              business being on the product listing page. After the split, the
              snippet stayed eager; the dashboard code went on-demand. Also ran
              an A/B test on 10% of product listing pages using the SSG version
              before full rollout.
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
              LCP on product listing pages dropped from 4.1s to 0.8s after
              switching to SSG + ISR. Main bundle: 2.1MB → 380KB. Core Web
              Vitals went green in Search Console within 28 days. The{" "}
              <code
                className="text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: "hsl(var(--inline-code-bg))" }}
              >
                memo()
              </code>{" "}
              work the team had originally planned would have had zero
              measurable impact on LCP. The bottleneck was never in React — it
              was in the bundle size and rendering strategy decisions made years
              earlier when the app was small enough that neither mattered.
            </p>
          </div>
        </div>
      </section>

      {/* Section 11: Related Frameworks */}
      <section id="related-frameworks" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          Related Frameworks
        </h2>
        <p className="mb-6 text-content-muted">
          Performance is downstream of architecture decisions made in these frameworks.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              href: "/frameworks/rendering-strategy",
              title: "Rendering Strategy",
              desc: "SSR, SSG, ISR, RSC — the biggest lever for LCP and TTFB.",
            },
            {
              href: "/frameworks/state-architecture",
              title: "State Architecture",
              desc: "Context topology determines your re-render cascade. Bad state architecture = render performance problems.",
            },
            {
              href: "/frameworks/code-organization",
              title: "Code Organization",
              desc: "Feature-based code splitting is easier when code is organized by feature. Structure enables performance.",
            },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg border p-4 transition-colors hover:border-primary group"
              style={{ borderColor: "hsl(var(--content-border))" }}
            >
              <p className="font-semibold mb-1 group-hover:text-primary text-content">
                {link.title}
              </p>
              <p className="text-xs text-content-muted">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
