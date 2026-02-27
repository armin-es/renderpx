import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'
import { RelatedContent } from '@/components/RelatedContent'
import { patternRelations } from '@/lib/related-content'

const NAIVE_CODE = `// One giant form — 20 fields, single submit
function CheckoutForm() {
  const [data, setData] = useState({ name: '', email: '', address: '', card: '', ... })

  return (
    <form onSubmit={handleSubmit}>
      <input value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} />
      <input value={data.email} ... />
      {/* 18 more fields */}
      <button type="submit">Pay</button>
    </form>
  )
}
// Overwhelming; no sense of progress; one validation bomb at the end.`;

const FIRST_IMPROVEMENT_CODE = `// Wizard: step index in state, show one "page" at a time
const STEPS = ['details', 'shipping', 'payment']

function CheckoutWizard() {
  const [stepIndex, setStepIndex] = useState(0)
  const [data, setData] = useState({ name: '', address: '', card: '' })

  const step = STEPS[stepIndex]
  const isLast = stepIndex === STEPS.length - 1

  return (
    <form onSubmit={e => { e.preventDefault(); isLast ? submit(data) : setStepIndex(i => i + 1) }}>
      {step === 'details' && <DetailsFields data={data} setData={setData} />}
      {step === 'shipping' && <ShippingFields data={data} setData={setData} />}
      {step === 'payment' && <PaymentFields data={data} setData={setData} />}
      <div className="flex gap-2">
        {stepIndex > 0 && <button type="button" onClick={() => setStepIndex(i => i - 1)}>Back</button>}
        <button type="submit">{isLast ? 'Pay' : 'Next'}</button>
      </div>
    </form>
  )
}
// User sees one chunk at a time; progress is clear. Still: no per-step validation, no URL, no draft.`;

const PRODUCTION_CODE = `// React Hook Form + step in URL (shareable, back button works)
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'next/navigation'

const STEPS = ['details', 'shipping', 'payment']

function CheckoutWizard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const stepParam = searchParams.get('step') ?? STEPS[0]
  const rawIndex = STEPS.indexOf(stepParam)
  const stepIndex = rawIndex === -1 ? 0 : Math.min(rawIndex, STEPS.length - 1)
  const step = STEPS[stepIndex]

  const form = useForm({ defaultValues: { name: '', address: '', card: '' } })
  const { trigger } = form

  const go = (nextIndex: number) => {
    setSearchParams({ step: STEPS[nextIndex] })
  }

  const onNext = async () => {
    const fieldsToValidate = stepFields[step]  // e.g. ['name','email'] for 'details'
    const ok = await trigger(fieldsToValidate)
    if (ok) go(stepIndex + 1)
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <StepIndicator current={stepIndex} steps={STEPS} />
        {step === 'details' && <DetailsStep />}
        {step === 'shipping' && <ShippingStep />}
        {step === 'payment' && <PaymentStep />}
        <StepNav stepIndex={stepIndex} onBack={() => go(stepIndex - 1)} onNext={onNext} isLast={stepIndex === STEPS.length - 1} />
      </form>
    </FormProvider>
  )
}
// Per-step validation, URL reflects step, FormProvider shares form state across step components.`;

const DRAFT_CODE = `// Optional: persist draft so user can leave and return
const DRAFT_KEY = 'checkout-draft'

// On mount: load draft if any
useEffect(() => {
  const raw = localStorage.getItem(DRAFT_KEY)
  if (raw) form.reset(JSON.parse(raw))
}, [])

// Debounced save on change
useEffect(() => {
  const sub = form.watch((value) => {
    debounce(() => localStorage.setItem(DRAFT_KEY, JSON.stringify(value)), 500)()
  })
  return () => sub.unsubscribe()
}, [])
// Clear DRAFT_KEY on successful submit.`;

export default function MultiStepFormsPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Multi-Step Forms
        </h1>
        <p className="text-xl text-content-muted">
          Break long forms into steps so users see one chunk at a time, with progress, per-step validation, and optional draft persistence.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          Checkout, onboarding, and long surveys often dump many fields on one page. Users get overwhelmed, abandon halfway, or hit submit only to see a wall of validation errors. You need a way to break the form into steps, validate each step before advancing, and optionally persist a draft so they can leave and come back.
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          One giant form with every field and a single submit. Simple to wire, but poor UX: no sense of progress, and validation fires for everything at once at the end.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          A wizard: keep a <InlineCode>stepIndex</InlineCode> (or step id) in state, render only the fields for the current step, and provide Next/Back. The user sees one logical “page” at a time and progress is clear.
        </p>
        <CodeBlock code={FIRST_IMPROVEMENT_CODE} lang="tsx" />
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Per-step validation:</strong> Validate only the current step before allowing “Next”; don’t run the full schema until the final submit.</li>
          <li><strong>URL sync:</strong> Put the step in the URL (e.g. <InlineCode>?step=shipping</InlineCode>) so the user can bookmark, share, or use the back button and land on the right step.</li>
          <li><strong>Draft:</strong> Persist form values (localStorage or API) so leaving the page doesn’t lose data; restore on return.</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          Use React Hook Form with <InlineCode>FormProvider</InlineCode> so all step components share the same form state. Derive the current step from <InlineCode>useSearchParams</InlineCode> so the URL is the source of truth. Before advancing, call <InlineCode>trigger(fieldsForThisStep)</InlineCode>; only move to the next step if validation passes. Optionally persist a draft (e.g. debounced <InlineCode>form.watch</InlineCode> → localStorage or PATCH draft endpoint) and clear it on successful submit.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />
        <CodeBlock code={DRAFT_CODE} lang="tsx" className="mt-4" label="Optional: persist draft" />
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Checkout / long forms:</strong> 3–7 logical steps (details → shipping → payment) with clear progress and per-step validation.</li>
          <li><strong>Onboarding:</strong> One or two questions per step to reduce drop-off.</li>
          <li><strong>Skip when:</strong> Form has fewer than ~5–7 fields; a single page with good grouping and validation is enough.</li>
        </ul>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Step in URL:</strong> Normalize invalid or missing <InlineCode>step</InlineCode> to the first step so direct links don’t break.</li>
          <li><strong>Back button:</strong> If step is in the URL, browser back naturally goes to the previous step; don’t block it.</li>
          <li><strong>Draft key:</strong> Use a key that includes user/session if multiple drafts exist (e.g. <InlineCode>{`'draft-' + userId`}</InlineCode>).</li>
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
        items={patternRelations['multi-step-forms'].frameworks}
        type="frameworks"
      />
      <RelatedContent
        items={patternRelations['multi-step-forms'].deepDives}
        type="deepDives"
      />
    </div>
  )
}
