import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'
import { RelatedContent } from '@/components/RelatedContent'
import { patternRelations } from '@/lib/related-content'

const NAIVE_CODE = `// Duplicate logic in every component that needs mouse position
function Tooltip() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])
  return <span className="tooltip">...</span>
}
function CursorFollower() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => { /* same effect */ }, [])
  return <div style={{ left: pos.x, top: pos.y }}>...</div>
}
// Same subscription logic copy-pasted; hard to reuse.`;

const FIRST_IMPROVEMENT_CODE = `// Render prop: share behavior by passing a function that receives state
function MouseTracker({ render }: { render: (pos: { x: number; y: number }) => React.ReactNode }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])
  return <>{render(pos)}</>
}

// Usage:
<MouseTracker render={({ x, y }) => <span className="tooltip">{x}, {y}</span>} />
<MouseTracker render={({ x, y }) => <div style={{ left: x, top: y }}>cursor</div>} />
// One source of truth for the behavior; consumer controls the UI.`;

const PRODUCTION_CODE = `// Custom hook: same behavior, composable in any component
function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])
  return pos
}

// Usage: no wrapper component, works with hooks rules
function Tooltip() {
  const { x, y } = useMousePosition()
  return <span className="tooltip">{x}, {y}</span>
}
function CursorFollower() {
  const { x, y } = useMousePosition()
  return <div style={{ left: x, top: y }}>cursor</div>
}

// When to keep render props: when you need to inject JSX that uses the value (e.g. compound components).
// When to prefer hooks: most reusable logic; easier to compose (multiple hooks in one component).`;

export default function RenderPropsVsHooksPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Render Props vs Hooks
        </h1>
        <p className="text-xl text-content-muted">
          Share behavior (e.g. mouse position, subscription) between components. Render props pass a function that receives state; hooks return state directly. Prefer hooks for most logic; keep render props when the consumer must supply the UI structure.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          You have logic that multiple components need—mouse position, window size, a subscription—and you don’t want to duplicate the effect and state in every component. You need a way to reuse the behavior and let each consumer render its own UI. Two common patterns: render props (a component that calls a function with the value) and custom hooks (a function that returns the value).
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          Copy the same <InlineCode>useState</InlineCode> + <InlineCode>useEffect</InlineCode> into every component that needs the behavior. It works but duplicates code and is hard to change consistently.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          Extract the logic into a component that accepts a <InlineCode>render</InlineCode> prop (or <InlineCode>children</InlineCode> as a function): it holds the state and effect, and calls the function with the current value. The consumer decides what to render. One place for the behavior; flexible output.
        </p>
        <CodeBlock code={FIRST_IMPROVEMENT_CODE} lang="tsx" />
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Composition:</strong> Combining two render-props components leads to nested functions (callback hell). Hooks compose flat: <InlineCode>{`useA(); useB()`}</InlineCode>.</li>
          <li><strong>Hooks rules:</strong> You can’t call hooks conditionally or inside a render prop; the hook must be called in the component that uses the value. So for “reusable logic,” a hook is often simpler.</li>
          <li><strong>When render props still help:</strong> When the parent needs to control the exact structure (e.g. compound components, or when the child needs to be passed to a specific slot).</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          For most reusable behavior, use a custom hook: it returns the value (and any setters) and the component uses it directly. No wrapper component, no extra nesting, and you can use multiple hooks in one component. Keep render props when the API is “here’s the value, you render the tree” and the consumer must supply the structure (e.g. a data provider that wraps children with a function). Many libraries that used to be render-props-only now expose hooks (e.g. React Query’s <InlineCode>useQuery</InlineCode>); prefer the hook when both exist.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Hooks:</strong> Reusable state + effect (mouse, resize, subscription, form state). Use whenever the consumer just needs a value.</li>
          <li><strong>Render props:</strong> When the provider must control where the rendered output goes (e.g. “render this list using my layout”) or when building compound components that accept a function as child.</li>
        </ul>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Don’t call hooks inside the render prop:</strong> The render prop runs in the parent’s render; hooks must run in the same order in the component that uses them. Put the hook in the component that receives the value.</li>
          <li><strong>children as function:</strong> <InlineCode>{`<MouseTracker>{({ x, y }) => <div>{x}</div>}</MouseTracker>`}</InlineCode> is a common variant; same idea as <InlineCode>render</InlineCode> prop.</li>
        </ul>
      </section>

      <p className="text-content-muted text-sm">
        <Link href="/patterns/compound-components" className="text-primary hover:underline">
          Compound Components →
        </Link>
        {' · '}
        <Link href="/frameworks/component-composition" className="text-primary hover:underline">
          Component Composition →
        </Link>
        {' · '}
        <Link href="/patterns" className="text-primary hover:underline">
          All patterns
        </Link>
      </p>

      <RelatedContent
        items={patternRelations['render-props-vs-hooks'].frameworks}
        type="frameworks"
      />
      <RelatedContent
        items={patternRelations['render-props-vs-hooks'].deepDives}
        type="deepDives"
      />
    </div>
  )
}
