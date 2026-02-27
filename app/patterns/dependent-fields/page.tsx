import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'
import { RelatedContent } from '@/components/RelatedContent'
import { patternRelations } from '@/lib/related-content'

const NAIVE_CODE = `// Country + city: city options hardcoded or fetched once, no dependency
function AddressForm() {
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')

  return (
    <>
      <select value={country} onChange={e => setCountry(e.target.value)}>
        <option value="us">US</option>
        <option value="uk">UK</option>
      </select>
      <select value={city} onChange={e => setCity(e.target.value)}>
        <option value="nyc">New York</option>
        <option value="la">Los Angeles</option>
        {/* Same list for every country — wrong. */}
      </select>
    </>
  )
}
// City list should depend on country; clearing country should clear/reset city.`;

const FIRST_IMPROVEMENT_CODE = `// Derive city options from country; reset city when country changes
const CITIES_BY_COUNTRY: Record<string, string[]> = {
  us: ['New York', 'Los Angeles', 'Chicago'],
  uk: ['London', 'Manchester', 'Birmingham'],
}

function AddressForm() {
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')

  const cities = country ? (CITIES_BY_COUNTRY[country] ?? []) : []
  const cityOptions = cities.map(c => <option key={c} value={c}>{c}</option>)

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry)
    setCity('')  // Reset dependent field
  }

  return (
    <>
      <select value={country} onChange={e => handleCountryChange(e.target.value)}>
        <option value="">Select country</option>
        <option value="us">US</option>
        <option value="uk">UK</option>
      </select>
      <select value={city} onChange={e => setCity(e.target.value)} disabled={!country}>
        <option value="">Select city</option>
        {cityOptions}
      </select>
    </>
  )
}
// City options and value stay in sync with country.`;

const PRODUCTION_CODE = `// React Hook Form: watch + setValue + clearErrors
function AddressForm() {
  const { register, watch, setValue, clearErrors } = useForm()
  const country = watch('country')

  useEffect(() => {
    if (!country) return
    setValue('city', '')           // Reset dependent field
    clearErrors('city')            // Clear validation for city
    // Optionally: trigger async fetch for cities then setValue('city', '')
  }, [country, setValue, clearErrors])

  const cities = useMemo(() => getCitiesForCountry(country), [country])

  return (
    <form>
      <select {...register('country')}>
        <option value="">Select country</option>
        <option value="us">US</option>
        <option value="uk">UK</option>
      </select>
      <select {...register('city')} disabled={!country}>
        <option value="">Select city</option>
        {cities.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    </form>
  )
}
// With Zod: make city schema depend on country (e.g. refine or superRefine) so submit validation is correct.`;

export default function DependentFieldsPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Dependent Fields
        </h1>
        <p className="text-xl text-content-muted">
          When one field’s options or validity depend on another (e.g. country → city), keep them in sync and reset the dependent field when the parent changes.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          Forms often have cascading choices: country then city, product then variant, plan then add-ons. The dependent field’s options (and value) must come from the parent. If the user changes the parent, the dependent value can become invalid and should be reset and re-validated.
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          Two independent fields; city options are static or ignore country. When the user picks a country, the city list doesn’t update and the current city might be invalid for the new country.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          Derive the dependent options from the parent value (e.g. a map or async fetch). When the parent changes, reset the dependent field and optionally disable it until the parent is set. This keeps options and value in sync.
        </p>
        <CodeBlock code={FIRST_IMPROVEMENT_CODE} lang="tsx" />
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Validation:</strong> Submit-time validation must treat the dependent field as conditional (e.g. required only when parent has a value, or must be in the derived list).</li>
          <li><strong>Async options:</strong> If the dependent options come from an API (e.g. cities for country), show loading for the second field and clear it when the parent changes.</li>
          <li><strong>Form libraries:</strong> With React Hook Form (or similar), use <InlineCode>watch</InlineCode> for the parent and <InlineCode>setValue</InlineCode> + <InlineCode>clearErrors</InlineCode> when the parent changes.</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          Use <InlineCode>watch</InlineCode> on the parent field. In a <InlineCode>useEffect</InlineCode> (or when handling the parent’s change), call <InlineCode>setValue(dependentField, '')</InlineCode> and <InlineCode>clearErrors(dependentField)</InlineCode>. Derive options (from a map or query) based on the watched parent. In your schema (e.g. Zod), use <InlineCode>refine</InlineCode> or <InlineCode>superRefine</InlineCode> so the dependent field is validated in context (e.g. “city required when country is set” and “city must be in list for that country”).
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Country / region / city:</strong> Classic cascade; reset city when country changes.</li>
          <li><strong>Product → variant, plan → add-ons:</strong> Options and price depend on the first choice.</li>
          <li><strong>Skip when:</strong> The second field’s options never change based on the first; treat as two independent fields.</li>
        </ul>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Reset on parent change:</strong> Always clear (or reset) the dependent value when the parent changes; otherwise you can submit “UK” + “New York”.</li>
          <li><strong>Async list:</strong> While loading cities for the new country, disable the city dropdown or show a “Loading…” option so the user doesn’t pick a stale value.</li>
          <li><strong>Schema:</strong> Client and server validation should both enforce “city in allowed list for country”; don’t rely only on the client-derived options.</li>
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
        items={patternRelations['dependent-fields'].frameworks}
        type="frameworks"
      />
      <RelatedContent
        items={patternRelations['dependent-fields'].deepDives}
        type="deepDives"
      />
    </div>
  )
}
