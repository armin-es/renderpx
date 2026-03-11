/**
 * Rendering Strategy progressive examples: code + metadata.
 * Five escalating approaches to the same feature: a product detail page.
 */
export const renderingStrategyExampleContent: Record<
  string,
  { description: string; code: string; explanation: string; whenThisBreaks: string }
> = {
  '01-csr': {
    description:
      'Client-Side Rendering: the default React approach. An empty HTML shell is sent; JavaScript fetches data in the browser after it loads. Zero server work, maximum waterfall.',
    code: `// pages/products/[id].tsx (or app/products/[id]/page.tsx with 'use client')
'use client'

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

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

// HTML the browser receives immediately:
// <div id="root"></div>   ← completely empty
//
// What the user sees:
// 1. Blank page (JS downloading)
// 2. Skeleton (JS ran, fetch started)
// 3. Product (fetch resolved)`,
    explanation: `Works when:\n• Internal tools where SEO doesn't matter\n• Content behind authentication (crawlers can't see it anyway)\n• Highly dynamic, user-specific data\n• Rapid prototyping\n\nZero backend complexity. Works on any static host (GitHub Pages, S3).`,
    whenThisBreaks: `Product pages with CSR are invisible to search engines - Googlebot sees an empty HTML shell.\n\nThe loading waterfall is also the main UX problem:\n• Browser requests HTML → receives empty shell\n• Browser parses and runs JS bundle\n• JS kicks off fetch to /api/products/123\n• Fetch resolves → component renders\n\nOn a slow mobile connection that's 4–6 seconds of nothing. Lighthouse will punish you with a low LCP score.`,
  },

  '02-ssr': {
    description:
      'Server-Side Rendering: the server fetches data and renders HTML on every request. The browser receives a fully populated page immediately. Fresh data, every time.',
    code: `// pages/products/[id].tsx (Next.js Pages Router)
export default function ProductPage({ product }: { product: Product }) {
  // Component receives pre-fetched data as a prop
  // No loading state, no useEffect, no client-side fetch
  return <ProductCard product={product} />
}

export async function getServerSideProps({ params }) {
  // Runs on the server, on every request
  const product = await db.products.findById(params.id)

  if (!product) return { notFound: true }

  return {
    props: { product },
  }
}

// HTML the browser receives:
// <div>
//   <h1>Wireless Headphones</h1>
//   <p>$89.99</p>
//   <p>In stock: 142 units</p>
// </div>
//
// ✅ Fully populated - crawlers see real content
// ✅ No client-side waterfall
// ⚠️  Every request hits the server - no caching benefit`,
    explanation: `Works when:\n• Data changes frequently (inventory counts, live prices)\n• Pages are personalized per user\n• SEO matters AND content is dynamic\n• Cache is not viable (user-specific, auth-gated)\n\nGood default for authenticated dashboards.`,
    whenThisBreaks: `Runs on every request - if your product page gets 50,000 hits/hour, your server runs the DB query 50,000 times. No CDN can cache it.\n\nTTFB (Time to First Byte) is also slower than SSG because the server must finish the DB query before sending any HTML. On a cold DB or slow query, users see nothing for 300–800ms.\n\nFor product pages that rarely change, you're spending compute on nothing.`,
  },

  '03-ssg': {
    description:
      'Static Site Generation: HTML is generated at build time, once, and served as a static file from a CDN. Fastest possible load, globally distributed. Data is fixed until the next build.',
    code: `// pages/products/[id].tsx (Next.js Pages Router)
export default function ProductPage({ product }: { product: Product }) {
  return <ProductCard product={product} />
}

// Runs at build time - generates a static HTML file per product
export async function getStaticProps({ params }) {
  const product = await db.products.findById(params.id)
  return { props: { product } }
}

// Tell Next.js which product IDs to pre-build
export async function getStaticPaths() {
  const ids = await db.products.getAllIds()
  return {
    paths: ids.map(id => ({ params: { id } })),
    fallback: 'blocking',  // on-demand SSG for new products
  }
}

// What gets deployed to CDN:
// /products/123.html  ← pure static file, served in <5ms globally
// /products/124.html
// /products/125.html
//
// ✅ Fastest possible response - no server, no DB
// ✅ Scales to any traffic level for free
// ❌ Price is stale until next build`,
    explanation: `Works when:\n• Content is the same for all users\n• Data changes infrequently (marketing copy, blog posts)\n• You can afford to rebuild on data changes (CI/CD on content update)\n• SEO is critical and performance matters\n\nBlog posts, documentation, landing pages, product catalogs with stable data.`,
    whenThisBreaks: `A 1,000-product catalog with daily price changes needs a full rebuild daily. With 10,000 products, build times creep into minutes.\n\nAnd "stale at build time" is a real problem: a product sold out between builds - the static page still shows "In Stock." A price changed - users see the old price. You need a real-time signal, which SSG fundamentally can't provide.\n\nYou also can't easily personalize: the HTML is the same for everyone.`,
  },

  '04-isr': {
    description:
      'Incremental Static Regeneration: static HTML served instantly from CDN, but with automatic background revalidation after a configurable TTL. CDN freshness + static speed.',
    code: `// pages/products/[id].tsx (Next.js Pages Router ISR)
export default function ProductPage({ product }: { product: Product }) {
  return <ProductCard product={product} />
}

export async function getStaticProps({ params }) {
  const product = await db.products.findById(params.id)
  return {
    props: { product },
    revalidate: 60,  // ← Regenerate in background if >60s old
  }
}

// How it works:
// 1. First request: served from CDN (or generated on-demand if new)
// 2. Request after 60s: still served from cache instantly...
//    ...but a background regeneration starts
// 3. Next request: gets the freshly rebuilt page

// App Router equivalent (much simpler):
async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetch(\`/api/products/\${params.id}\`, {
    next: { revalidate: 60 },  // same behavior, less boilerplate
  }).then(r => r.json())

  return <ProductCard product={product} />
}

// ✅ First byte in <5ms from CDN
// ✅ Data refreshes every 60s automatically
// ✅ No server compute on every request`,
    explanation: `Works when:\n• Content changes, but not every second (product prices, inventory)\n• SEO matters\n• You want static performance with a freshness guarantee\n• Traffic is high (CDN absorbs it; server only runs periodically)\n\nThe sweet spot for most e-commerce, content, and marketing pages.`,
    whenThisBreaks: `The "stale-while-revalidate" model means someone will always see stale data - the user who hits the page right after the TTL expires sees old data while revalidation runs in the background.\n\nFor high-stakes updates (flash sale prices, stock going to zero), 60 seconds too long. You can set revalidate: 1 but at that point you're doing SSR with extra steps.\n\nAlso can't personalize - still serves the same HTML to every user.`,
  },

  '05-rsc': {
    description:
      'React Server Components: rendering decisions made per-component, not per-page. Server components fetch data inline; client components handle interaction. Streaming delivers pieces as they resolve.',
    code: `// app/products/[id]/page.tsx (Next.js App Router - RSC by default)
// This is a Server Component - runs on server, streams HTML to client

import { Suspense } from 'react'
import { AddToCartButton } from './AddToCartButton'  // 'use client'

// Parallel data fetching - no waterfall
async function ProductPage({ params }: { params: { id: string } }) {
  // Both requests fire in parallel (Promise.all or separate awaits in streaming)
  const [product, reviews] = await Promise.all([
    fetch(\`/api/products/\${params.id}\`, { next: { revalidate: 60 } }),
    fetch(\`/api/products/\${params.id}/reviews\`, { cache: 'no-store' }),
  ]).then(rs => Promise.all(rs.map(r => r.json())))

  return (
    <div>
      {/* Server-rendered - no client JS for static content */}
      <h1>{product.name}</h1>
      <p>{product.price}</p>
      <p>{product.description}</p>

      {/* Client component - only this part ships JS to the browser */}
      <AddToCartButton productId={product.id} />

      {/* Reviews stream in independently - product doesn't wait for them */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewsList reviews={reviews} />
      </Suspense>
    </div>
  )
}

// Per-fetch caching control:
// { next: { revalidate: 60 } }  ← ISR-style freshness
// { cache: 'no-store' }         ← always fresh (SSR-style)
// (default)                     ← static, cache forever until next deploy`,
    explanation: `Works when:\n• Different parts of a page have different freshness requirements\n• You want minimal client-side JS (RSC content ships as HTML, not JS)\n• SEO matters for content, interactivity needed for UI\n• You're on Next.js App Router\n\nThe most capable model for complex pages with mixed rendering needs.`,
    whenThisBreaks: `RSC is Next.js App Router-specific. You can't use this model in Vite/CRA/Remix without framework support.\n\nThe Server/Client component split also has a learning curve: you can't import a Server Component inside a Client Component (but you can pass one as children). State and event handlers can only live in Client Components.\n\nOver-using 'use client' at the top level defeats the purpose - you're back to CSR with extra boilerplate.`,
  },
}
