import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'
import { RelatedContent } from '@/components/RelatedContent'
import { patternRelations } from '@/lib/related-content'

const NAIVE_CODE = `// Validate only on submit - user sees errors after clicking Submit
function SignupForm() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!email) next.email = 'Required'
    else if (!/\\S+@\\S+\\.\\S+/.test(email)) next.email = 'Invalid email'
    setErrors(next)
    if (Object.keys(next).length === 0) {
      // submit...
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        aria-invalid={!!errors.email}
      />
      {errors.email && <span role="alert">{errors.email}</span>}
      <button type="submit">Sign up</button>
    </form>
  )
}
// Simple, but user gets no feedback until submit; easy to forget server-side validation.`;

const FIRST_IMPROVEMENT_CODE = `// Validate on blur and on submit; reuse rules
const schema = z.object({
  email: z.string().min(1, 'Required').email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
})

function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validate = useCallback(() => {
    const result = schema.safeParse({ email, password })
    if (result.success) return {}
    const flat = result.error.flatten().fieldErrors
    return Object.fromEntries(
      Object.entries(flat).map(([k, v]) => [k, Array.isArray(v) ? v[0] ?? '' : ''])
    )
  }, [email, password])

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }))
    setErrors(validate())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length === 0) {
      // submit...
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        onBlur={() => handleBlur('email')}
        aria-invalid={!!errors.email}
      />
      {touched.email && errors.email && <span role="alert">{errors.email}</span>}
      {/* same for password */}
      <button type="submit">Sign up</button>
    </form>
  )
}
// Better UX: validate on blur. Still need server-side validation and error display.`;

const PRODUCTION_CODE = `// React Hook Form + Zod: one source of truth, type-safe, minimal re-renders
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().min(1, 'Required').email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
})
type SignupFormData = z.infer<typeof signupSchema>

function SignupForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',  // or 'onChange', 'onTouched', 'onSubmit'
  })

  const onSubmit = async (data: SignupFormData) => {
    const res = await fetch('/api/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) {
      // Set server errors (e.g. "Email already taken")
      setError('root', { message: json.message })
      setError('email', { message: json.errors?.email })
      return
    }
    // success
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email')}
        aria-invalid={!!errors.email}
      />
      {errors.email && <span role="alert">{errors.email.message}</span>}
      <input type="password" {...register('password')} />
      {errors.password && <span role="alert">{errors.password.message}</span>}
      <button type="submit" disabled={isSubmitting}>Sign up</button>
    </form>
  )
}
// Client: Zod + resolver. Server: validate again and return field-level errors.`;

const SERVER_VALIDATION_CODE = `// Server (e.g. Next.js route): validate again, return structured errors
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: Request) {
  const body = await req.json()
  const result = signupSchema.safeParse(body)
  if (!result.success) {
    return Response.json(
      { message: 'Validation failed', errors: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }
  // Check DB for duplicate email, etc.
  const existing = await db.user.findUnique({ where: { email: result.data.email } })
  if (existing) {
    return Response.json(
      { message: 'Email already taken', errors: { email: ['Email already taken'] } },
      { status: 400 }
    )
  }
  // create user...
}`;

export default function FormValidationPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Form Validation (Client + Server)
        </h1>
        <p className="text-xl text-content-muted">
          Validate user input on the client for fast feedback and on the server for security and a single source of truth.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          Forms need validation: required fields, format (email, phone), length, and business rules (e.g. “email not already taken”). If you only validate on the server, the user gets errors after a round-trip and a full submit. If you only validate on the client, you’re not secure -anyone can bypass the client. You want both: client-side for UX, server-side for correctness and security, with one schema if possible so rules don’t drift.
        </p>
        <p className="text-content">
          The other trap: showing errors too early (on first keystroke) is noisy; showing them only on submit is late. A good default is validate on blur and on submit, and optionally on change after the field has been touched.
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          Validate only in <InlineCode>handleSubmit</InlineCode>. Set error state and show messages next to fields. No server-side validation yet; no feedback until the user submits.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          Introduce a schema (e.g. Zod) and validate the same object on blur and on submit. Track “touched” so you don’t show errors before the user has left the field. Reuse the schema so client and server can share one definition (e.g. in a shared package).
        </p>
        <CodeBlock code={FIRST_IMPROVEMENT_CODE} lang="tsx" />
        <p className="text-content mt-4 text-sm">
          <strong>Why this helps:</strong> User sees errors when they leave the field, not only after submit. One schema reduces drift between client and server.
        </p>
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Re-renders:</strong> Storing every field in React state and validating on every blur/change can re-render the whole form. Libraries like React Hook Form keep field state in refs and only re-render when needed.</li>
          <li><strong>Server errors:</strong> After submit, the server may return field-level errors (e.g. “Email already taken”). You need to map those back to fields and set error state.</li>
          <li><strong>Type safety:</strong> Form data and error types should be derived from the schema so you don’t repeat yourself.</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          Use React Hook Form with a Zod resolver. One schema, type-safe form data, minimal re-renders. On submit, send data to the server; if the server returns 400 with field errors, use <InlineCode>setError</InlineCode> to show them. On the server, validate again with the same (or shared) schema and return structured errors so the client can display them per field.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />
        <CodeBlock code={SERVER_VALIDATION_CODE} lang="tsx" className="mt-4" label="Server: validate again, return field errors" />
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Use:</strong> Any form that collects user input you’ll send to the server: signup, login, settings, checkout. Always validate on the server; add client validation for UX.</li>
          <li><strong>Mode:</strong> <InlineCode>onBlur</InlineCode> or <InlineCode>onTouched</InlineCode> for most forms; <InlineCode>onChange</InlineCode> only if you need live feedback (e.g. password strength).</li>
          <li><strong>Skip client validation only when:</strong> The form is internal or the only validation is server-only (e.g. auth token). Even then, server must validate.</li>
        </ul>
        <Callout variant="warning" title="Security" className="mt-4">
          Never trust the client. Server must validate again. Client validation is for UX and reducing unnecessary requests.
        </Callout>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>setError for server errors:</strong> After a failed submit, call <InlineCode>{`setError('fieldName', { message: serverMessage })`}</InlineCode> (or <InlineCode>{`setError('root', ...)`}</InlineCode> for a global message) so the user sees why the request failed.</li>
          <li><strong>Dependent fields:</strong> If “confirm password” must match “password”, validate in the schema with <InlineCode>refine</InlineCode> or a custom check so both fields show the error when they don’t match.</li>
          <li><strong>Accessibility:</strong> Use <InlineCode>aria-invalid</InlineCode> and <InlineCode>role="alert"</InlineCode> for error messages so screen readers announce them. Link the message to the input with <InlineCode>aria-describedby</InlineCode>.</li>
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
        items={patternRelations['form-validation'].frameworks}
        type="frameworks"
      />
      <RelatedContent
        items={patternRelations['form-validation'].deepDives}
        type="deepDives"
      />
    </div>
  )
}
