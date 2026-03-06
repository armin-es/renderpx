import Link from "next/link";
import { CodeWithPreview } from "@/components/CodeWithPreview";
import { CodeBlock } from "@/components/CodeBlock";
import { ExampleViewer } from "@/components/ExampleViewer";
import { RelatedContent } from "@/components/RelatedContent";
import { frameworkRelations } from "@/lib/related-content";
import {
  CsrWaterfallDemo,
  RenderingModesComparisonDemo,
} from "@/components/demos/RenderingStrategyDemos";
import { renderingStrategyExampleContent } from "@/lib/renderingStrategyExamples";
import { Callout } from "@/components/ui/callout";
import { InlineCode } from "@/components/ui/inline-code";

const CSR_PROBLEM_CODE = `// Every product page is invisible to Google
'use client'

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  // Waterfall: HTML → JS → fetch → render
  useEffect(() => {
    fetch(\`/api/products/\${params.id}\`)
      .then(r => r.json())
      .then(data => {
        setProduct(data)
        setLoading(false)
      })
  }, [params.id])

  if (loading) return <ProductSkeleton />
  return <ProductCard product={product} />
}

// What Googlebot sees: <div id="root"></div>
// Lighthouse LCP: 4–6 seconds on mobile`;

const SSR_CODE = `// pages/products/[id].tsx
export default function ProductPage({ product }) {
  return <ProductCard product={product} />
}

export async function getServerSideProps({ params }) {
  const product = await db.products.findById(params.id)
  return { props: { product } }
}
// ✅ Full HTML every request
// ⚠️  Runs DB query on every single pageview`;

const ISR_CODE = `// app/products/[id]/page.tsx (App Router)
async function ProductPage({ params }) {
  const product = await fetch(
    \`/api/products/\${params.id}\`,
    { next: { revalidate: 60 } }   // ← ISR: CDN-cached, refreshed every 60s
  ).then(r => r.json())

  return <ProductCard product={product} />
}

// First request: HTML generated, stored in CDN
// Subsequent requests: served from CDN in <5ms
// After 60s: next request triggers background regeneration
// ✅ Static speed  ✅ SEO  ✅ Fresh enough for most use cases`;

const RSC_STREAMING_CODE = `// app/products/[id]/page.tsx
import { Suspense } from 'react'
import { AddToCartButton } from './AddToCartButton'  // 'use client'

export default async function ProductPage({ params }) {
  // Cached 60s — stable content, SEO-critical
  const product = await fetch(\`/api/products/\${params.id}\`, {
    next: { revalidate: 60 },
  }).then(r => r.json())

  return (
    <div>
      {/* Server component — no JS shipped to client for static content */}
      <h1>{product.name}</h1>
      <p>{product.price}</p>

      {/* Client component — JS only for this interactive island */}
      <AddToCartButton productId={product.id} />

      {/* Streams in separately — product page doesn't wait for reviews */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewsFeed productId={product.id} />
      </Suspense>
    </div>
  )
}

// ReviewsFeed: 'no-store' — always fresh (live review count)
async function ReviewsFeed({ productId }) {
  const reviews = await fetch(\`/api/products/\${productId}/reviews\`, {
    cache: 'no-store',
  }).then(r => r.json())
  return <ReviewsList reviews={reviews} />
}`;

const PROGRESSIVE_EXAMPLES = [
  {
    id: "01-csr",
    title: "Example 1: Client-Side Rendering",
    subtitle: "Default React, empty HTML shell, browser fetches data",
    complexity: "Naive",
  },
  {
    id: "02-ssr",
    title: "Example 2: Server-Side Rendering",
    subtitle: "Full HTML per request — SEO-friendly, no CDN",
    complexity: "Better",
  },
  {
    id: "03-ssg",
    title: "Example 3: Static Site Generation",
    subtitle: "Built at deploy time — fastest delivery, stale data",
    complexity: "Production",
  },
  {
    id: "04-isr",
    title: "Example 4: Incremental Static Regeneration",
    subtitle: "CDN speed + automatic background freshness",
    complexity: "Advanced",
  },
  {
    id: "05-rsc",
    title: "Example 5: React Server Components",
    subtitle: "Per-component rendering decisions + streaming",
    complexity: "Advanced",
  },
];

const VISUAL_LABELS: Record<string, string> = {
  "01-csr": "CSR",
  "02-ssr": "SSR",
  "03-ssg": "SSG",
  "04-isr": "ISR",
  "05-rsc": "RSC",
};

const DECISION_MATRIX = [
  {
    strategy: "CSR",
    ttfb: "< 5ms",
    seo: "No",
    freshness: "Always fresh",
    personalized: "Yes",
    useWhen: "Auth-gated dashboards, internal tools, highly interactive SPAs",
    avoid: "Any page where SEO or initial load performance matters",
  },
  {
    strategy: "SSR",
    ttfb: "100–400ms",
    seo: "Yes",
    freshness: "Always fresh",
    personalized: "Yes",
    useWhen: "User-specific pages that need SEO (profile pages, account views)",
    avoid: "High-traffic, uncached content — every request hits your server",
  },
  {
    strategy: "SSG",
    ttfb: "< 5ms",
    seo: "Yes",
    freshness: "Stale until rebuild",
    personalized: "No",
    useWhen: "Marketing pages, docs, blog posts — content that rarely changes",
    avoid: "Data that changes more often than you can afford to rebuild",
  },
  {
    strategy: "ISR",
    ttfb: "< 5ms",
    seo: "Yes",
    freshness: "Stale up to TTL",
    personalized: "No",
    useWhen: "Product catalogs, news, e-commerce — content that changes, but not per-second",
    avoid: "Data where a 60-second window of staleness is unacceptable",
  },
  {
    strategy: "RSC",
    ttfb: "< 5ms",
    seo: "Yes",
    freshness: "Per-component",
    personalized: "Yes (via Server Actions / auth)",
    useWhen: "Complex pages with mixed rendering needs — different components have different data",
    avoid: "Teams new to React or not on Next.js App Router",
  },
];

export default async function RenderingStrategyPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      {/* Title */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Rendering Strategy
        </h1>
        <p className="text-xl text-content-muted">
          When does your page render, and where?
        </p>
      </div>

      {/* Section 1: The Problem */}
      <section id="the-problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          The Problem
        </h2>
        <div className="space-y-4">
          <p className="text-lg leading-relaxed text-content">
            The default React mental model is{" "}
            <strong>client-side rendering</strong>: the server sends an empty
            HTML shell, JavaScript loads, fetches data, and the page appears.
            For a while, this felt fine. Then product teams started asking why
            their pages weren&apos;t showing up on Google.
          </p>
          <p className="leading-relaxed text-content">
            The problem is twofold. First, search engine crawlers see an empty{" "}
            <code className="text-sm px-1.5 py-0.5 rounded bg-inline-code-bg">
              {"<div id=\"root\"></div>"}
            </code>
            , not your content. Second, the loading waterfall punishes users on
            slow connections: blank page → JS downloads → fetch starts → fetch
            resolves → page finally renders. Four sequential steps before
            anything useful appears.
          </p>
          <p className="leading-relaxed text-content">
            Simulate it below. The timeline shows why CSR feels slow; each step
            only starts after the previous one finishes.
          </p>
        </div>

        <div className="mt-8">
          <CodeWithPreview
            code={CSR_PROBLEM_CODE}
            lang="tsx"
            codeLabel="CSR product page — SEO-invisible, slow waterfall"
            preview={<CsrWaterfallDemo />}
            previewLabel="Simulation — each step blocks the next"
            layout="stacked"
          />
        </div>
      </section>

      {/* Section 2: The Rendering Modes */}
      <section id="rendering-modes" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          The Five Rendering Modes
        </h2>
        <p className="mb-6 text-content">
          The answer isn&apos;t to replace CSR; it&apos;s to understand what
          each mode trades off, and match it to the page&apos;s actual needs.
          Select a mode below to see what HTML arrives in the browser and what
          the tradeoffs are.
        </p>

        <RenderingModesComparisonDemo />

        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-lg border bg-box-info-bg border-box-info-border">
            <p className="text-content">
              <strong>The key insight:</strong> SSR, SSG, and ISR all send
              fully-populated HTML to the browser. The difference is{" "}
              <em>when</em> that HTML was generated: on every request (SSR), at
              build time (SSG), or from a CDN cache that refreshes on a timer
              (ISR). CSR sends nothing and generates it in the browser.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Callout variant="note" title="How CDN caching works">
            A CDN is a network of servers placed close to users around the world.
            When a user requests a page, the request goes to the nearest CDN edge
            node instead of your origin server. If the edge has a cached copy
            (cache hit), it serves it immediately - often in under 5ms. If not
            (cache miss), it fetches the page from your origin, caches it, then
            serves it. Subsequent users at the same edge get the cached version.
            <br />
            <br />
            Your origin server controls what gets cached via the{" "}
            <InlineCode>Cache-Control</InlineCode> header. The key directive for
            CDNs is <InlineCode>s-maxage</InlineCode>, which sets how long the
            CDN holds the cached response before re-fetching from origin.{" "}
            <InlineCode>max-age</InlineCode> controls browser caching.{" "}
            <InlineCode>public</InlineCode> tells the CDN it is allowed to cache
            the response at all - you cannot set this when responses contain
            user-specific data. SSG and ISR pages can be{" "}
            <InlineCode>public</InlineCode> because every user gets the same
            HTML. SSR pages usually cannot.
          </Callout>
        </div>
      </section>

      {/* Section 3: The Framework */}
      <section id="the-framework" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          The Framework: Two Questions
        </h2>
        <p className="text-lg leading-relaxed mb-6 text-content">
          Every rendering decision comes down to two questions about your data:
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {[
            {
              question: "How often does this data change?",
              options: [
                { label: "Never / rarely", hint: "SSG — build it once" },
                { label: "Every few minutes/hours", hint: "ISR — CDN with revalidation" },
                { label: "Every request", hint: "SSR — always fresh" },
                { label: "On user action", hint: "CSR — fetch in browser" },
              ],
              cardClass: "bg-box-info-bg border-box-info-border",
            },
            {
              question: "Is this data the same for all users?",
              options: [
                { label: "Yes — same HTML for everyone", hint: "SSG or ISR (CDN-cacheable)" },
                { label: "No — varies per user", hint: "SSR (server knows the user) or CSR (client knows auth)" },
                {
                  label: "Mixed — static shell + dynamic parts",
                  hint: "RSC — per-component control",
                },
              ],
              cardClass: "bg-box-success-bg border-box-success-border",
            },
          ].map((block) => (
            <div
              key={block.question}
              className={`p-4 rounded-lg border ${block.cardClass}`}
            >
              <div className="font-bold text-sm mb-3 text-content">
                {block.question}
              </div>
              <ul className="space-y-2">
                {block.options.map(({ label, hint }) => (
                  <li key={label} className="text-sm text-content">
                    <span className="font-medium">{label}</span>
                    <span className="text-content-muted">
                      {" "}→ {hint}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-3 text-content">
              The practical starting point: ISR
            </h3>
            <p className="mb-4 text-content">
              For most public-facing pages where data changes, ISR is the right
              default. It gives you static file performance (CDN, sub-5ms TTFB)
              with automatic freshness; no rebuild pipeline needed.
            </p>
            <CodeBlock code={ISR_CODE} lang="tsx" />
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3 text-content">
              When pages get complex: RSC + Streaming
            </h3>
            <p className="mb-4 text-content">
              A product page isn&apos;t one piece of data. The product details
              change rarely; ISR is fine. The live review count changes
              constantly; it needs a fresh fetch. The &quot;Add to Cart&quot;
              button is interactive; it needs JavaScript. React Server Components
              let you make these decisions per component, not per page.
            </p>
            <CodeBlock code={RSC_STREAMING_CODE} lang="tsx" />
            <div className="mt-4 p-4 rounded-lg border bg-box-yellow-bg border-box-yellow-border">
              <p className="text-content">
                <strong>What &quot;streaming&quot; means in practice:</strong>{" "}
                the server sends the product HTML immediately (from cache) and
                streams the{" "}
                <code className="text-xs px-1 py-0.5 rounded bg-inline-code-bg">
                  {"<ReviewsFeed>"}
                </code>{" "}
                chunk separately as it resolves. The user sees a complete product
                page with a reviews skeleton, and the reviews fill in ~200ms
                later, with no full-page loading spinner.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Decision Matrix */}
      <section id="decision-matrix" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          Decision Matrix
        </h2>
        <p className="mb-6 text-content-muted">
          A reference for matching rendering strategy to page characteristics. Most
          production apps use two or three of these strategies across different pages.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm border-content-border">
            <thead>
              <tr className="border-b-2 border-content-border">
                {["Strategy", "TTFB", "SEO", "Freshness", "Use When"].map((h) => (
                  <th
                    key={h}
                    className="text-left p-3 font-bold text-content"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DECISION_MATRIX.map((row, i) => (
                <tr
                  key={row.strategy}
                  className={i % 2 === 0 ? "bg-table-row-alt" : ""}
                >
                  <td className="p-3 font-medium align-top text-content">
                    {row.strategy}
                  </td>
                  <td className="p-3 align-top text-content-muted">
                    {row.ttfb}
                  </td>
                  <td className="p-3 align-top text-content-muted">
                    {row.seo}
                  </td>
                  <td className="p-3 align-top text-content-muted">
                    {row.freshness}
                  </td>
                  <td className="p-3 align-top text-content-muted">
                    <div className="mb-1">{row.useWhen}</div>
                    <div className="text-xs italic text-content-muted">
                      Avoid: {row.avoid}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <Callout variant="note" title="SSR vs RSC - what is the difference?">
            Both SSR and RSC render HTML on the server, but they operate at
            different granularities. SSR is page-level: the entire route renders
            in one pass, and the browser waits for the slowest data fetch before
            receiving any HTML. RSC is component-level: each Server Component
            fetches its own data independently, and React streams HTML to the
            browser as components resolve - so fast parts appear immediately
            while slow parts load in.
            <br />
            <br />
            The other key difference is JavaScript. With SSR, the full component
            tree is hydrated in the browser. With RSC, Server Components send
            zero JavaScript - only Client Components (marked{" "}
            <InlineCode>&quot;use client&quot;</InlineCode>) are hydrated. This
            is why RSC can show <InlineCode>{"< 5ms"}</InlineCode> TTFB in the
            table above: the static shell streams before any slow fetches
            complete, and the bundle the browser has to parse is smaller.
          </Callout>
        </div>
      </section>

      {/* Section 5: Progressive Complexity */}
      <section id="progressive-complexity" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          Progressive Complexity
        </h2>
        <p className="mb-6 text-content-muted">
          The same feature (a product detail page) built with each rendering
          strategy. Each example shows exactly what changes, what it gains, and
          what constraint drives you to the next step.
        </p>

        <ExampleViewer
          examples={PROGRESSIVE_EXAMPLES}
          content={renderingStrategyExampleContent}
          visualLabels={VISUAL_LABELS}
        />
      </section>

      {/* Section 6: Production Patterns */}
      <section id="production-patterns" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          Production Patterns
        </h2>

        <div className="space-y-6">
          <div className="p-5 rounded-lg border border-content-border">
            <h3 className="font-bold mb-2 text-content">
              The e-commerce site that moved from SSR to ISR and cut server costs 80%
            </h3>
            <p className="text-sm mb-3 text-content">
              A mid-sized retailer with ~5,000 products was SSR-ing every product
              page because &quot;we need fresh prices.&quot; Prices changed once or
              twice per day via a batch sync job.
            </p>
            <div className="text-sm space-y-1 text-content">
              <div>
                <strong>Problem:</strong> At peak traffic, the DB was hit 40,000
                times/hour for product data that was identical between requests.
                Server costs were scaling linearly with traffic.
              </div>
              <div>
                <strong>Fix:</strong> Switched to ISR with{" "}
                <code className="text-xs px-1 py-0.5 rounded bg-inline-code-bg">
                  revalidate: 300
                </code>{" "}
                (5 minutes). The CDN now absorbs ~95% of traffic. DB queries
                dropped to a trickle, only when cache entries expire.
              </div>
              <div>
                <strong>The one edge case:</strong> Flash sales. We added an
                on-demand revalidation call (
                <code className="text-xs px-1 py-0.5 rounded bg-inline-code-bg">
                  revalidatePath
                </code>
                ) triggered when a sale starts. The CDN invalidates those pages
                immediately; no waiting for the TTL.
              </div>
            </div>
            <div className="mt-3 text-xs italic text-content-muted">
              What I&apos;d do earlier: implement on-demand revalidation from day
              one. The TTL-only approach works 99% of the time, but flash sales
              and urgent content corrections need a way to bypass it.
            </div>
          </div>

          <div className="p-5 rounded-lg border border-content-border">
            <h3 className="font-bold mb-2 text-content">
              The dashboard that taught me about the CSR/RSC boundary
            </h3>
            <p className="text-sm mb-3 text-content">
              A user dashboard migrated from a Vite SPA (pure CSR) to Next.js App
              Router. The instinct was to add{" "}
              <code className="text-xs px-1 py-0.5 rounded bg-inline-code-bg">
                &apos;use client&apos;
              </code>{" "}
              to every component that used state or effects.
            </p>
            <div className="text-sm space-y-1 text-content">
              <div>
                <strong>What happened:</strong> The entire page tree was a Client
                Component. No RSC benefit; same JS bundle size as before, same
                CSR waterfall.
              </div>
              <div>
                <strong>The fix:</strong> Draw a clear boundary. The page shell,
                nav, and header are Server Components (static, no JS shipped).
                The data-fetching layer is Server Components (async/await,
                directly to DB). Only interactive islands (charts, filters, modals)
                are Client Components.
              </div>
              <div>
                <strong>Rule of thumb that stuck:</strong>{" "}
                <em>
                  Push &apos;use client&apos; down to the leaves. Default to Server
                  Components everywhere else.
                </em>
              </div>
            </div>
          </div>

          {/* Pattern 3 */}
          <div className="p-5 rounded-lg border border-content-border">
            <h3 className="font-bold mb-2 text-content">
              Migrating a CSR app to Next.js without a rewrite
            </h3>
            <p className="text-sm mb-3 text-content">
              The instinct when adding Next.js is to move everything at once. The
              right instinct is to start with the pages that hurt most: the ones
              Google can&apos;t index, or the ones with the worst LCP on mobile.
              Next.js supports both CSR components and SSR/SSG pages in the same
              app; you&apos;re adding a rendering layer, not rewriting components.
            </p>
            <p className="text-sm mb-4 text-content">
              Migrate route by route. For each route, answer two questions: does
              this content need to be indexed? Does it change per user? Those
              answers determine the rendering strategy. The key call per route: if
              the content doesn&apos;t change per user, default to SSG. If it
              changes hourly, use ISR. Only reach for SSR when you genuinely need
              per-request freshness, not as a cautious default.
            </p>
            <CodeBlock
              code={`// Before: pure CSR component (works unchanged in Next.js)
export function ProductCard({ productId }) {
  const { data } = useQuery(['product', productId], fetchProduct)
  return <Card product={data} />
}

// After: same component, now called from an SSG page
// The component didn't change — only its rendering context did
export async function generateStaticParams() {
  const products = await db.products.findAll()
  return products.map(p => ({ id: p.id }))
}

export default async function ProductPage({ params }) {
  const product = await fetchProduct(params.id)  // server fetch, build-time
  return <ProductCard product={product} />        // same component
}
// ✅ Marketing pages: SSG — same React components, zero CSR waterfall`}
              lang="tsx"
            />
          </div>
        </div>
      </section>

      {/* Section: A Real Rollout */}
      <section id="real-rollout" className="mb-16">
        <h2 className="text-2xl font-bold mb-2 text-content">
          A Real Rollout
        </h2>
        <p className="text-sm mb-8 text-content-muted">
          What it actually looks like to split rendering strategy across a
          codebase, with a marketing team, an engineering team, and a product
          that can&apos;t stop shipping.
        </p>
        <div className="space-y-8">
          <div className="border-l-2 pl-5 border-content-border">
            <p className="text-xs font-bold uppercase tracking-wider mb-2 text-primary">
              Context
            </p>
            <p className="text-sm leading-relaxed text-content">
              Marketing site and logged-in app in the same Next.js codebase. The
              marketing pages needed SEO and sub-second first contentful paint;
              the logged-in app was data-heavy and highly interactive. Both were
              being served from the same deployment, but with the same rendering
              strategy applied to everything.
            </p>
          </div>

          <div className="border-l-2 pl-5 border-content-border">
            <p className="text-xs font-bold uppercase tracking-wider mb-2 text-primary">
              The problem
            </p>
            <p className="text-sm leading-relaxed text-content">
              Marketing pages were rendering client-side, part of the same SPA
              entrypoint. Google wasn&apos;t indexing landing page content
              correctly; Core Web Vitals flagged poor LCP across the board.
              Switching everything to SSR would hurt the logged-in experience;
              the app had too many per-user queries to run server-side efficiently
              on every pageview. The team was treating &ldquo;rendering
              strategy&rdquo; as an app-level decision rather than a route-level
              one.
            </p>
          </div>

          <div className="border-l-2 pl-5 border-content-border">
            <p className="text-xs font-bold uppercase tracking-wider mb-2 text-primary">
              The call
            </p>
            <p className="text-sm leading-relaxed text-content">
              Split rendering strategy by route group. Marketing pages (
              <code className="text-xs px-1 py-0.5 rounded bg-inline-code-bg">
                /pricing
              </code>
              ,{" "}
              <code className="text-xs px-1 py-0.5 rounded bg-inline-code-bg">
                /features
              </code>
              ,{" "}
              <code className="text-xs px-1 py-0.5 rounded bg-inline-code-bg">
                /blog
              </code>
              ) → SSG with ISR, revalidating on CMS publish. Auth-gated app (
              <code className="text-xs px-1 py-0.5 rounded bg-inline-code-bg">
                /app/*
              </code>
              ) → CSR with React Query, serving from a CDN-cached shell. The
              line was drawn at the route prefix. RSC was considered but the team
              wasn&apos;t ready for the mental model shift, and the marketing
              pages didn&apos;t need per-component rendering control.
            </p>
          </div>

          <div className="border-l-2 pl-5 border-content-border">
            <p className="text-xs font-bold uppercase tracking-wider mb-2 text-primary">
              How I ran it
            </p>
            <p className="text-sm leading-relaxed text-content">
              The hardest conversation was with the marketing team. &ldquo;Static
              generation&rdquo; sounds like old-school websites to people used to
              live CMSes. The reframe that worked: &ldquo;the page rebuilds on
              publish, just like your CMS preview, but it&apos;s instant for
              every visitor instead of re-rendering on every request.&rdquo;
              Engineers needed reassurance that ISR wouldn&apos;t serve stale
              pricing; we added a CMS webhook that triggered{" "}
              <code className="text-xs px-1 py-0.5 rounded bg-inline-code-bg">
                revalidatePath
              </code>{" "}
              on publish, so pricing pages were always rebuilt immediately after a
              content change. That removed the staleness objection completely.
            </p>
          </div>

          <div className="border-l-2 pl-5 border-content-border">
            <p className="text-xs font-bold uppercase tracking-wider mb-2 text-primary">
              The outcome
            </p>
            <p className="text-sm leading-relaxed text-content">
              LCP on marketing pages improved significantly within weeks of
              deployment. Organic search indexing improved; Google could now read
              page content on first crawl. The{" "}
              <code className="text-xs px-1 py-0.5 rounded bg-inline-code-bg">
                /app
              </code>{" "}
              section stayed fully interactive with no regression. Server costs
              dropped because marketing pages no longer consumed SSR capacity on
              every visitor request; they served from CDN. The marketing team
              adopted the CMS publish workflow as their new normal within two
              weeks.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: Hot Takes */}
      <section id="hot-takes" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          Common Mistakes &amp; Hot Takes
        </h2>

        <div className="space-y-4">
          {[
            {
              mistake: "Defaulting to SSR because it's 'safe'",
              take: "SSR is not free. Every request spins up a server process, runs a DB query, and sends a response. Under load, this is expensive and slow. If data doesn't change per-request, use ISR. If data doesn't change per-day, use SSG. SSR should be your choice when you actually need per-request freshness, not your fallback when you don't know what else to use.",
            },
            {
              mistake: "Putting 'use client' at the top of the page",
              take: "This is the App Router equivalent of opting out of everything that makes it interesting. I've seen large Next.js 13+ apps that are functionally identical to their Vite SPA predecessors because every component was marked 'use client'. The rule: 'use client' belongs at the leaf components that actually need interactivity: buttons, forms, charts. Not at the page root.",
            },
            {
              mistake: "Treating ISR's stale window as a problem to eliminate",
              take: "The 60-second staleness window is a feature, not a bug. A user who loaded a product page at 9:00am and the price changed at 9:00:30am is fine; they didn't know to expect a different price. The mental model shift is: ISR gives you an accuracy guarantee, not a real-time one. Real-time is for live prices on a trading platform, not an e-commerce catalog.",
            },
            {
              mistake: "Building complex SSR APIs instead of using RSC",
              take: "I once built a custom server middleware that pre-fetched data, injected it into the HTML as JSON, then hydrated it on the client. It was essentially a bad version of RSC. React Server Components are the framework's native answer to server data fetching. If you're building elaborate SSR data injection patterns in App Router, you're likely fighting what the framework already gives you.",
            },
          ].map(({ mistake, take }) => (
            <div
              key={mistake}
              className="p-4 rounded-lg border border-content-border"
            >
              <div className="font-bold text-sm mb-2 text-content">
                ❌ {mistake}
              </div>
              <p className="text-sm text-content-muted">{take}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 8: Related Frameworks */}
      <section id="related-frameworks" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          Related Frameworks
        </h2>

        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-content-border">
            <div className="font-medium mb-1">
              <Link
                href="/frameworks/data-fetching"
                className="text-primary hover:underline"
              >
                Data Fetching &amp; Sync →
              </Link>
            </div>
            <p className="text-sm text-content-muted">
              Rendering strategy decides <em>where</em> data is fetched: server
              or client. Data Fetching &amp; Sync covers <em>how</em>: race
              conditions, caching, deduplication, and the React Query vs. RSC
              fetch decision in detail.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-content-border">
            <div className="font-medium mb-1">
              <Link
                href="/frameworks/state-architecture"
                className="text-primary hover:underline"
              >
                State Architecture →
              </Link>
            </div>
            <p className="text-sm text-content-muted">
              RSC changes where data lives; it pushes server state out of
              client-side stores entirely. Understanding the boundary between
              server state and client state is essential when adopting RSC at
              scale.
            </p>
          </div>
        </div>
      </section>

      <RelatedContent
        items={frameworkRelations['rendering-strategy'].patterns}
        type="patterns"
      />
      <RelatedContent
        items={frameworkRelations['rendering-strategy'].deepDives}
        type="deepDives"
      />
    </div>
  );
}
