import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'
import { RelatedContent } from '@/components/RelatedContent'
import { patternRelations } from '@/lib/related-content'

const NAIVE_CODE = `// One big component with every variant — props explosion
function Card({ title, subtitle, image, footer, variant, size, ... }: CardProps) {
  return (
    <div className={cn('rounded border', variant === 'outlined' && 'border-2', size === 'large' && 'p-6')}>
      {image && <img src={image} />}
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
      {footer}
    </div>
  )
}
// Usage: <Card title="..." subtitle="..." image="..." footer={<Button>...</Button>} variant="outlined" />
// Flexible but the API is huge; hard to enforce structure (e.g. "title must come before body").`;

const FIRST_IMPROVEMENT_CODE = `// Compound components: Card + Card.Header, Card.Body, Card.Footer
const CardContext = createContext<{ variant: string }>({ variant: 'elevated' })

function Card({ variant = 'elevated', children }: { variant?: string; children: React.ReactNode }) {
  return (
    <CardContext.Provider value={{ variant }}>
      <div className={cn('rounded border', variant === 'outlined' && 'border-2')}>
        {children}
      </div>
    </CardContext.Provider>
  )
}

function CardHeader({ children }: { children: React.ReactNode }) {
  const { variant } = useContext(CardContext)
  return <div className="px-4 pt-4 font-semibold">{children}</div>
}

Card.Header = CardHeader
Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-2 text-sm">{children}</div>
}
Card.Footer = function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="px-4 pb-4 border-t pt-2">{children}</div>
}

// Usage: clear structure, only the pieces you need
// <Card variant="outlined"><Card.Header>Title</Card.Header><Card.Body>...</Card.Body></Card>`;

const PRODUCTION_CODE = `// Same idea with cloneElement or context; optional "allowed children"
function Card({ children }: { children: React.ReactNode }) {
  return (
    <CardContext.Provider value={{ variant: 'elevated' }}>
      <div className="rounded border bg-card">
        {children}
      </div>
    </CardContext.Provider>
  )
}

// Subcomponents read context for shared state (e.g. variant, size)
function CardTitle({ children }: { children: React.ReactNode }) {
  const ctx = useContext(CardContext)
  return <h3 className={cn('font-semibold', ctx.size === 'sm' && 'text-sm')}>{children}</h3>
}

Card.Title = CardTitle
Card.Body = CardBody
Card.Footer = CardFooter

// Usage stays readable and flexible:
<Card>
  <Card.Title>Profile</Card.Title>
  <Card.Body>...</Card.Body>
  <Card.Footer><Button>Save</Button></Card.Footer>
</Card>
// No prop explosion; structure is visible in JSX. Optional: validate children with React.Children.map.`;

export default function CompoundComponentsPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Compound Components
        </h1>
        <p className="text-xl text-content-muted">
          Split a complex UI into a parent and named child components (e.g. Card.Header, Card.Body) so the API is flexible and the structure is clear in JSX without a huge prop list.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          Components like Card, Accordion, or Tabs have multiple slots (title, body, footer, panels) and optional parts. Exposing everything as props leads to a long, brittle API and doesn’t make the structure obvious in the tree. You want a pattern where the consumer composes visible pieces (e.g. <InlineCode>Card.Header</InlineCode>, <InlineCode>Card.Body</InlineCode>) and the parent shares context with those pieces.
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          One component with many props: <InlineCode>title</InlineCode>, <InlineCode>subtitle</InlineCode>, <InlineCode>footer</InlineCode>, <InlineCode>variant</InlineCode>, etc. Usage is a single tag with a long prop list; order and presence of sections are implicit.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          Compound components: a parent (e.g. <InlineCode>Card</InlineCode>) that provides context and wraps children, and subcomponents (e.g. <InlineCode>Card.Header</InlineCode>, <InlineCode>Card.Body</InlineCode>) attached to the parent. The consumer writes clear JSX with only the sections they need; the parent and children share state via context.
        </p>
        <CodeBlock code={FIRST_IMPROVEMENT_CODE} lang="tsx" />
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Child validation:</strong> You may want to allow only certain subcomponents; you can <InlineCode>React.Children.map</InlineCode> and check type or displayName, or document the contract and rely on usage.</li>
          <li><strong>Flexible order:</strong> Sometimes order matters (e.g. Tab list before Tab panels); compound components make that order explicit in JSX.</li>
          <li><strong>TypeScript:</strong> Typing the compound (parent + attached subcomponents) is a bit verbose but doable with an interface that has both the component and nested component types.</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          Define the parent component and attach subcomponents as static properties (e.g. <InlineCode>Card.Title = CardTitle</InlineCode>). Use React context in the parent to pass variant, size, or open state to the subcomponents. Subcomponents consume context and render their slice of the UI. No need to pass every option through the parent’s props; the structure is visible in the tree. For stricter contracts, validate children in the parent or use a small helper that only renders known types.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Cards, panels, accordions:</strong> Multiple named regions with shared styling/state; consumer picks which regions to use.</li>
          <li><strong>Tabs, dropdowns:</strong> List of triggers + content panels that need to share “active” state.</li>
          <li><strong>Skip when:</strong> The component has one or two slots; a few props are simpler than compound components.</li>
        </ul>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Context scope:</strong> Only descendants of the parent get the context; so <InlineCode>Card.Title</InlineCode> must be rendered inside <InlineCode>Card</InlineCode>.</li>
          <li><strong>Naming:</strong> Attach subcomponents so the API is <InlineCode>Card.Title</InlineCode> not a separate <InlineCode>CardTitle</InlineCode> import; keeps the relationship clear.</li>
          <li><strong>Render props vs compounds:</strong> For “custom render per item” (e.g. each tab panel can be a function), combine with render props or pass a function as child; for fixed structure, compound components are enough.</li>
        </ul>
      </section>

      <p className="text-content-muted text-sm">
        <Link href="/frameworks/component-composition" className="text-primary hover:underline">
          Component Composition →
        </Link>
        {' · '}
        <Link href="/patterns" className="text-primary hover:underline">
          All patterns
        </Link>
      </p>

      <RelatedContent
        items={patternRelations['compound-components'].frameworks}
        type="frameworks"
      />
      <RelatedContent
        items={patternRelations['compound-components'].deepDives}
        type="deepDives"
      />
    </div>
  )
}
