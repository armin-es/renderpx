import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'
import { RelatedContent } from '@/components/RelatedContent'
import { patternRelations } from '@/lib/related-content'

const NAIVE_CODE = `// Render every item - 10,000 list items = 10,000 DOM nodes
function BigList({ items }: { items: Item[] }) {
  return (
    <ul className="h-[600px] overflow-auto">
      {items.map((item) => (
        <li key={item.id} className="p-3 border-b">
          {item.name}
        </li>
      ))}
    </ul>
  )
}
// Fine for hundreds of items. For 10k+, layout and paint become slow; scrolling janks.`;

const FIRST_IMPROVEMENT_CODE = `// Only render what's visible: compute visible range from scroll position
function WindowedList({ items, itemHeight = 48 }: { items: Item[]; itemHeight?: number }) {
  const containerRef = useRef<HTMLUListElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const containerHeight = 600

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => setScrollTop(el.scrollTop)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const start = Math.floor(scrollTop / itemHeight)
  const end = Math.min(items.length, start + Math.ceil(containerHeight / itemHeight) + 2)
  const visible = items.slice(start, end)
  const offsetY = start * itemHeight

  return (
    <ul ref={containerRef} className="h-[600px] overflow-auto" style={{ position: 'relative' }}>
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: \`translateY(\${offsetY}px)\` }}>
          {visible.map((item) => (
            <li key={item.id} style={{ height: itemHeight }} className="p-3 border-b">
              {item.name}
            </li>
          ))}
        </div>
      </div>
    </ul>
  )
}
// Only ~15–20 DOM nodes; scrolling stays smooth. Assumes fixed item height.`;

const PRODUCTION_CODE = `// Use a library: react-window or @tanstack/react-virtual
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  })

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{ height: virtualizer.getTotalSize(), position: 'relative' }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={items[virtualRow.index].id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualRow.size,
              transform: \`translateY(\${virtualRow.start}px)\`,
            }}
            className="flex items-center px-3 border-b"
          >
            {items[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  )
}
// Handles measuring, overscan, and variable size if you use estimateSize per item.`;

export default function VirtualizedListsPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Virtualized Lists
        </h1>
        <p className="text-xl text-content-muted">
          Render only the visible rows (plus a small overscan) so long lists stay performant without thousands of DOM nodes.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          Feeds, tables, and dropdowns sometimes need to display thousands of items. Rendering every item creates thousands of DOM nodes, which slows layout and paint and makes scrolling janky. You need to render only what’s in (or near) the viewport and reuse nodes as the user scrolls.
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          Map over the full array and render one node per item. Simple and fine for a few hundred items; for 10k+ it becomes a bottleneck.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          “Window” the list: from the scroll position and container height, compute the range of indices that are visible (plus a small overscan). Render only those items and use a spacer (height = <InlineCode>startIndex * itemHeight</InlineCode>) and <InlineCode>transform: translateY</InlineCode> so the scrollable height and scroll position stay correct.
        </p>
        <CodeBlock code={FIRST_IMPROVEMENT_CODE} lang="tsx" />
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Variable height:</strong> If items have different heights, you need to measure (or estimate) and compute offsets; a library handles this with a size cache.</li>
          <li><strong>Scroll restoration:</strong> When navigating back to the list, restoring scroll position requires storing and reapplying the scroll offset (or the first visible index).</li>
          <li><strong>Accessibility:</strong> Screen readers expect to know list length and may virtualize differently; use <InlineCode>aria-setsize</InlineCode> / <InlineCode>aria-posinset</InlineCode> and consider “load more” or a non-virtualized fallback for assistive tech if needed.</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          Use <InlineCode>@tanstack/react-virtual</InlineCode> or <InlineCode>react-window</InlineCode>. They handle visible range, overscan, total size, and (with the right options) variable height. Prefer a stable <InlineCode>estimateSize</InlineCode> for fixed rows; use dynamic measurement when heights vary. Keep list semantics (<InlineCode>role="list"</InlineCode>, <InlineCode>role="listitem"</InlineCode>) and add <InlineCode>aria-setsize</InlineCode> / <InlineCode>aria-posinset</InlineCode> if you care about screen reader list navigation.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />
        <Callout variant="info" title="Variable height" className="mt-4">
          For variable-height items, use <InlineCode>estimateSize</InlineCode> and let the library measure (e.g. <InlineCode>measureElement</InlineCode> in TanStack Virtual). The snippet above shows the idea; see library docs for the exact API.
        </Callout>
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Long lists (500+ items):</strong> Feeds, tables, select dropdowns with many options. Virtualization keeps DOM small and scroll smooth.</li>
          <li><strong>Skip when:</strong> List has &lt; 100–200 items; the overhead of virtualization isn’t worth it and full render is fine.</li>
        </ul>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Stable keys:</strong> Use a unique, stable id per item so when the window shifts, React doesn’t remount unnecessarily.</li>
          <li><strong>Overscan:</strong> Render a few extra items above and below the viewport so fast scrolling doesn’t show blank gaps; 5–10 is usually enough.</li>
          <li><strong>Infinite scroll + virtual:</strong> You can combine with <InlineCode>useInfiniteQuery</InlineCode>: virtualize the concatenated pages and grow the list as the user scrolls near the end.</li>
        </ul>
      </section>

      <p className="text-content-muted text-sm">
        <Link href="/patterns/infinite-scroll" className="text-primary hover:underline">
          Infinite Scroll →
        </Link>
        {' · '}
        <Link href="/patterns" className="text-primary hover:underline">
          All patterns
        </Link>
      </p>

      <RelatedContent
        items={patternRelations['virtualized-lists'].frameworks}
        type="frameworks"
      />
      <RelatedContent
        items={patternRelations['virtualized-lists'].deepDives}
        type="deepDives"
      />
    </div>
  )
}
