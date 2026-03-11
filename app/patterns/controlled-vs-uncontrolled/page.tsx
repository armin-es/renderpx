import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'
import { RelatedContent } from '@/components/RelatedContent'
import { patternRelations } from '@/lib/related-content'

const NAIVE_CODE = `// Only controlled: parent owns value and onChange for every input
function Parent() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  return (
    <form>
      <input value={name} onChange={e => setName(e.target.value)} />
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  )
}
// Fine when parent needs the values. But if you wrap inputs in a reusable component, you have to pass value + onChange for every field - or use refs.`;

const FIRST_IMPROVEMENT_CODE = `// Uncontrolled: ref to read when needed (e.g. submit)
function UncontrolledForm() {
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = nameRef.current?.value ?? ''
    const email = emailRef.current?.value ?? ''
    submit({ name, email })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} defaultValue="" />
      <input ref={emailRef} type="email" defaultValue="" />
      <button type="submit">Submit</button>
    </form>
  )
}
// Parent doesn't re-render on every keystroke; read values only on submit. Use defaultValue, not value.`;

const PRODUCTION_CODE = `// Support both: controlled when value is passed, uncontrolled otherwise
function Input({ value, onChange, defaultValue, ...props }: InputProps) {
  const isControlled = value !== undefined
  const [internal, setInternal] = useState(defaultValue ?? '')

  const current = isControlled ? value : internal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternal(e.target.value)
    onChange?.(e)
  }

  return <input {...props} value={current} onChange={handleChange} />
}

// Controlled: <Input value={name} onChange={e => setName(e.target.value)} />
// Uncontrolled: <Input defaultValue="initial" /> (optional ref to read current value)
// React docs: avoid mixing in one component; pick one mode per component instance.`;

export default function ControlledVsUncontrolledPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Controlled vs Uncontrolled
        </h1>
        <p className="text-xl text-content-muted">
          Controlled: the parent owns the value (state) and passes <InlineCode>value</InlineCode> + <InlineCode>onChange</InlineCode>. Uncontrolled: the DOM holds the value; parent reads via ref when needed (e.g. submit). Choose per component and support both when building reusable inputs.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          Form inputs need a source of truth. If the parent keeps it in state and passes <InlineCode>value</InlineCode> and <InlineCode>onChange</InlineCode>, every keystroke triggers a re-render and the parent can validate or transform. If the DOM holds the value and the parent reads it only on submit (via ref), you avoid re-renders but lose live sync. You need to decide which model to use and, for design-system inputs, often support both so the same component works in controlled and uncontrolled usage.
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          Everything controlled: every input is <InlineCode>{'value={state}'}</InlineCode> and <InlineCode>{'onChange={setState}'}</InlineCode>. Simple and predictable, but every keystroke updates parent state and can cause unnecessary re-renders or complexity when wrapping in reusable components.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          Uncontrolled: use <InlineCode>defaultValue</InlineCode> (not <InlineCode>value</InlineCode>) and attach a <InlineCode>ref</InlineCode>. Read <InlineCode>ref.current.value</InlineCode> on submit or when you need it. The parent doesn’t re-render on each keystroke; good for simple forms where you only care about the final values.
        </p>
        <CodeBlock code={FIRST_IMPROVEMENT_CODE} lang="tsx" />
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Reusable components:</strong> A design-system <InlineCode>Input</InlineCode> may be used controlled (parent has state) or uncontrolled (parent uses ref). Supporting both means: if <InlineCode>value</InlineCode> is passed, treat as controlled; otherwise use internal state and optional ref.</li>
          <li><strong>Don’t switch mode:</strong> React warns if you switch from controlled to uncontrolled (or vice versa) for the same component instance; pick one per mount.</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          For reusable inputs: accept both <InlineCode>value</InlineCode> + <InlineCode>onChange</InlineCode> (controlled) and <InlineCode>defaultValue</InlineCode> (uncontrolled). Inside the component, treat “controlled” when <InlineCode>value !== undefined</InlineCode> and use that; otherwise use internal state. Never switch from one mode to the other for the same instance. Form libraries (React Hook Form) often use uncontrolled inputs with refs and read values on submit, which reduces re-renders.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Controlled:</strong> When you need live validation, formatting (e.g. phone mask), or conditional UI based on the current value.</li>
          <li><strong>Uncontrolled:</strong> Simple forms where you only need values on submit; fewer re-renders and simpler parent state.</li>
        </ul>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>value vs defaultValue:</strong> In uncontrolled mode you must not pass <InlineCode>value</InlineCode> (or pass <InlineCode>undefined</InlineCode>); use <InlineCode>defaultValue</InlineCode> for the initial value.</li>
          <li><strong>Warning “switching from controlled to uncontrolled”:</strong> Usually means you passed <InlineCode>{'value={undefined}'}</InlineCode> or <InlineCode>{'value={null}'}</InlineCode> at some point; use <InlineCode>{`value={value ?? ''}`}</InlineCode> for strings to keep it controlled.</li>
        </ul>
      </section>

      <p className="text-content-muted text-sm">
        <Link href="/patterns/form-validation" className="text-primary hover:underline">
          Form Validation →
        </Link>
        {' · '}
        <Link href="/patterns" className="text-primary hover:underline">
          All patterns
        </Link>
      </p>

      <RelatedContent
        items={patternRelations['controlled-vs-uncontrolled'].frameworks}
        type="frameworks"
      />
      <RelatedContent
        items={patternRelations['controlled-vs-uncontrolled'].deepDives}
        type="deepDives"
      />
    </div>
  )
}
