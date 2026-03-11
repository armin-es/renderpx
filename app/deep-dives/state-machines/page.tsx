import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import { Callout, InlineCode } from "@/components/ui";
import { RelatedContent } from "@/components/RelatedContent";
import { deepDiveRelations } from "@/lib/related-content";

export default function StateMachinesPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-xs">
        <Link href="/frameworks/state-architecture" className="text-primary hover:underline">
          State Architecture
        </Link>
        <ChevronRight size={12} className="text-content-muted" />
        <span className="text-content-muted">Deep Dive</span>
      </div>

      {/* Title */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">State Machines</h1>
        <p className="text-xl text-content-muted">
          When boolean flags lie, what breaks in the UI, and how discriminated unions fix it
        </p>
      </div>

      {/* Section 1: The Problem */}
      <section id="the-problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The Problem</h2>
        <p className="text-lg leading-relaxed text-content mb-4">
          Most async state starts with three boolean flags. This feels natural - each flag
          answers one question - but it creates bugs that are hard to reproduce and harder to
          explain.
        </p>
        <CodeBlock
          code={`function UserProfile({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [data, setData] = useState<User | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetchUser(userId)
      .then(user => {
        setIsLoading(false)
        setData(user)
      })
      .catch(err => {
        setIsError(true)
        // ← Bug 1: forgot setIsLoading(false)
        //   isLoading stays true after the error
        //   The spinner never disappears
      })
  }, [userId])

  if (isLoading) return <Spinner />
  if (isError) return <ErrorMessage />
  if (data) return <Profile user={data} />
  return null
}`}
          lang="tsx"
        />

        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-lg border border-content-border">
            <h3 className="font-bold mb-2 text-content">Bug 1: The eternal spinner</h3>
            <p className="text-sm text-content-muted">
              The <InlineCode>.catch</InlineCode> block sets <InlineCode>isError = true</InlineCode> but
              never resets <InlineCode>isLoading</InlineCode>. The component renders{" "}
              <InlineCode>{"<Spinner />"}</InlineCode> forever - not because the request is running,
              but because no one flipped the flag back. This is a real bug that ships to production
              because it requires a network error in testing to trigger.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-content-border">
            <h3 className="font-bold mb-2 text-content">Bug 2: Stale data during re-fetch</h3>
            <p className="text-sm text-content-muted mb-2">
              The user navigates from <InlineCode>/profile/1</InlineCode> to{" "}
              <InlineCode>/profile/2</InlineCode>. <InlineCode>setIsLoading(true)</InlineCode>{" "}
              fires - but <InlineCode>data</InlineCode> and <InlineCode>isError</InlineCode> are
              independent variables. They are not reset.
            </p>
            <CodeBlock
              code={`// 1. user1 loaded successfully
// { isLoading: false, isError: false, data: user1 }

// 2. userId changes → useEffect fires → setIsLoading(true)
// { isLoading: true, isError: false, data: user1 }
//                                          ↑ stale. user2 hasn't loaded yet.

// 3. What renders?
if (isLoading) return <Spinner />
// The guard hides the stale data - fine for a simple spinner.
// But skeleton UIs intentionally show previous data while loading new data:
if (isLoading && data) return <ProfileSkeleton name={data.name} />
//                                                   ↑ renders "Alice" while loading "Bob"`}
              lang="tsx"
            />
            <p className="text-xs text-content-muted mt-3">
              Note: a related but distinct problem is the{" "}
              <em>race condition</em> - where an old slow request resolves after a new fast
              one and overwrites the correct data. That bug is not about state shape; it
              requires <InlineCode>AbortController</InlineCode> or a cleanup flag to fix.{" "}
              <Link href="/deep-dives/useeffect-async-cleanup" className="text-primary hover:underline">
                useEffect and async cleanup →
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-content">
          These bugs share a root cause: three independent boolean flags can be in{" "}
          <strong>8 combinations</strong> (2³), but only 4 of those represent valid states.
          The other 4 are impossible states that exist only in code - and they produce
          impossible UI: a spinner with loaded data behind it, an error banner that won't
          clear, stale content from a previous request.
        </p>

        <Callout variant="info" title="The core insight" className="mt-6">
          The bug isn&apos;t that a developer forgot to call <InlineCode>setIsLoading(false)</InlineCode>.
          The bug is that the language allows it. If the state model makes it{" "}
          <em>impossible</em> to be in both <InlineCode>loading</InlineCode> and{" "}
          <InlineCode>error</InlineCode> at the same time, the bug can&apos;t exist.
        </Callout>
      </section>

      {/* Section 2: Discriminated Unions */}
      <section id="discriminated-unions" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          The Fix: Discriminated Unions
        </h2>
        <p className="text-content mb-4">
          A TypeScript discriminated union collapses 8 combinations into exactly 4 valid
          states - enforced at compile time, at zero runtime cost.
        </p>
        <CodeBlock
          code={`type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }

function UserProfile({ userId }: { userId: string }) {
  const [state, setState] = useState<FetchState<User>>({ status: 'idle' })

  useEffect(() => {
    setState({ status: 'loading' })
    // ↑ This atomically clears error and data.
    //   You can't be in 'loading' and 'error' simultaneously.
    //   There is no separate flag to forget.

    fetchUser(userId)
      .then(user => setState({ status: 'success', data: user }))
      .catch(err => setState({ status: 'error', message: err.message }))
      // ↑ setState({ status: 'error', ... }) makes 'loading' unreachable.
      //   The eternal spinner bug is not possible.
  }, [userId])

  switch (state.status) {
    case 'idle':    return null
    case 'loading': return <Spinner />
    case 'success': return <Profile user={state.data} />
    //                                       ↑ TypeScript knows state.data: User here
    //                                         It would be a compile error in 'loading'
    case 'error':   return <ErrorMessage message={state.message} />
  }
}`}
          lang="tsx"
        />

        <div className="mt-6 space-y-3">
          <div className="p-4 rounded-lg border border-content-border">
            <h3 className="font-bold mb-1 text-content">Bug 1 is gone: the eternal spinner</h3>
            <p className="text-sm text-content-muted">
              <InlineCode>setState({"{ status: 'error', message }"  })</InlineCode> is a single
              call that transitions the entire state. There is no <InlineCode>isLoading</InlineCode>{" "}
              flag to forget. The transition is atomic - either you&apos;re in{" "}
              <InlineCode>&apos;error&apos;</InlineCode> or you&apos;re not.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-content-border">
            <h3 className="font-bold mb-1 text-content">Bug 2 is gone: the re-fetch overlap</h3>
            <p className="text-sm text-content-muted">
              When <InlineCode>userId</InlineCode> changes, the first call is{" "}
              <InlineCode>setState({"{ status: 'loading' }"})</InlineCode>. This replaces the
              entire previous state - including any stale <InlineCode>data</InlineCode> from the
              previous user. There is no stale data floating independently in{" "}
              <InlineCode>data: user1</InlineCode> while <InlineCode>isLoading</InlineCode> is
              true.
            </p>
          </div>
        </div>

        <Callout variant="success" title="No library needed" className="mt-6">
          A discriminated union is just a TypeScript type. No dependencies, no runtime overhead,
          no new mental model beyond <InlineCode>useState</InlineCode>. This is the right default
          for any component that models an async operation. React Query uses exactly this shape
          internally - <InlineCode>status: &apos;pending&apos; | &apos;success&apos; | &apos;error&apos;</InlineCode> - which is
          why you rarely need to build it yourself when using a data fetching library.
        </Callout>

        <p className="mt-4 text-content-muted text-sm">
          A discriminated union works well up to about 4–6 states. When transitions between
          states become <em>conditional</em> - when a step can go to different next states
          depending on context - a union stops being enough.
        </p>
      </section>

      {/* Section 3: useReducer */}
      <section id="use-reducer" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          The Middle Ground: <InlineCode>useReducer</InlineCode>
        </h2>
        <p className="text-content mb-4">
          A discriminated union with <InlineCode>useState</InlineCode> works well for 2–4 states
          with straightforward transitions. When transitions become conditional - the next state
          depends on the current state <em>and</em> the event - transition logic starts spreading
          across multiple handlers. <InlineCode>useReducer</InlineCode> pulls all of that into one
          place.
        </p>
        <p className="text-content mb-6">
          The reducer is just the transition table made explicit. Instead of{" "}
          <InlineCode>setState({"{ status: 'loading' }"})</InlineCode> scattered across handlers,
          handlers dispatch events and the reducer decides what the next state is.
        </p>

        <CodeBlock
          code={`type CheckoutState =
  | { step: 'email' }
  | { step: 'shipping'; addressErrors: Record<string, string> }
  | { step: 'payment'; paymentError: string | null }
  | { step: 'submitting' }
  | { step: 'success' }

type CheckoutEvent =
  | { type: 'SUBMIT_EMAIL' }
  | { type: 'SUBMIT_ADDRESS'; errors: Record<string, string> }
  | { type: 'SUBMIT_PAYMENT' }
  | { type: 'PAYMENT_SUCCESS' }
  | { type: 'PAYMENT_FAILURE'; error: string }

function reducer(state: CheckoutState, event: CheckoutEvent): CheckoutState {
  switch (state.step) {
    case 'email':
      if (event.type === 'SUBMIT_EMAIL') return { step: 'shipping', addressErrors: {} }
      return state  // any other event on this step: do nothing

    case 'shipping':
      if (event.type === 'SUBMIT_ADDRESS') {
        if (Object.keys(event.errors).length > 0)
          return { step: 'shipping', addressErrors: event.errors }
        return { step: 'payment', paymentError: null }
      }
      return state

    case 'payment':
      if (event.type === 'SUBMIT_PAYMENT') return { step: 'submitting' }
      return state

    case 'submitting':
      if (event.type === 'PAYMENT_SUCCESS') return { step: 'success' }
      if (event.type === 'PAYMENT_FAILURE') return { step: 'payment', paymentError: event.error }
      return state

    default: return state
  }
}

function CheckoutFlow() {
  const [state, dispatch] = useReducer(reducer, { step: 'email' })

  // Handlers dispatch events - no transition logic lives here
  async function handlePaymentSubmit(card: Card) {
    dispatch({ type: 'SUBMIT_PAYMENT' })
    try {
      await submitPayment(card)
      dispatch({ type: 'PAYMENT_SUCCESS' })
    } catch (err) {
      dispatch({ type: 'PAYMENT_FAILURE', error: err.message })
    }
  }

  switch (state.step) {
    case 'email':      return <EmailStep onSubmit={() => dispatch({ type: 'SUBMIT_EMAIL' })} />
    case 'shipping':   return <ShippingStep errors={state.addressErrors}
                                onSubmit={errors => dispatch({ type: 'SUBMIT_ADDRESS', errors })} />
    case 'payment':    return <PaymentStep error={state.paymentError} onSubmit={handlePaymentSubmit} />
    case 'submitting': return <Spinner />
    case 'success':    return <SuccessScreen />
  }
}`}
          lang="tsx"
          label="5-step checkout with useReducer"
        />

        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-lg border border-content-border">
            <h3 className="font-bold mb-2 text-content">What you gain over useState</h3>
            <ul className="space-y-2 text-sm text-content-muted">
              <li className="flex gap-2">
                <span className="shrink-0 text-green-500">✓</span>
                <span>All transition logic in one place - the reducer <em>is</em> the transition table, readable in one pass</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 text-green-500">✓</span>
                <span>
                  Invalid transitions return <InlineCode>state</InlineCode> unchanged - jumping
                  from <InlineCode>email</InlineCode> to <InlineCode>success</InlineCode> is
                  silently ignored
                </span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 text-green-500">✓</span>
                <span>Event handlers become thin - dispatch an event, let the reducer decide what happens next</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 text-green-500">✓</span>
                <span>Testable in isolation - the reducer is a pure function, no component mounting required</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-content-border">
            <h3 className="font-bold mb-2 text-content">Where useReducer reaches its limit</h3>
            <ul className="space-y-2 text-sm text-content-muted">
              <li className="flex gap-2">
                <span className="shrink-0">•</span>
                <span>
                  <strong>Delayed transitions:</strong> a 5-second redirect after{" "}
                  <InlineCode>success</InlineCode> is a separate <InlineCode>useEffect</InlineCode>{" "}
                  - not co-located with the transition that triggers it
                </span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">•</span>
                <span>
                  <strong>Parallel states:</strong> if the form also needs to track an auto-saving
                  indicator running independently of the checkout step, that becomes a second
                  reducer or extra flags
                </span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">•</span>
                <span>
                  <strong>Visualizability:</strong> the reducer is the transition table, but you
                  can&apos;t auto-generate a diagram from it - at 8+ states, reading it requires
                  building the mental model from scratch
                </span>
              </li>
            </ul>
          </div>
        </div>

        <Callout variant="success" title="useReducer is usually enough" className="mt-6">
          Most multi-step flows in production - checkout flows, onboarding wizards, multi-step
          forms with conditional paths - are well-served by a discriminated union +{" "}
          <InlineCode>useReducer</InlineCode>. The move to XState is warranted when delayed
          transitions or parallel states make the reducer unwieldy, or when the team needs to
          reason about the flow without reading code.
        </Callout>
      </section>

      {/* Section 4: XState */}
      <section id="xstate" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          When <InlineCode>useReducer</InlineCode> Isn&apos;t Enough: XState
        </h2>
        <p className="text-content mb-4">
          Take the checkout flow from the previous section and add the requirements that real
          products accumulate:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-content-muted mb-6 text-sm">
          <li>Logged-in users skip the email step</li>
          <li>Digital products skip the shipping step</li>
          <li>A payment error sends the user back to the payment step <em>with</em> an error message</li>
          <li>Address validation failure keeps the user on shipping <em>with field-level errors</em></li>
          <li>After 5 seconds on the success screen, auto-redirect to home</li>
        </ul>
        <p className="text-content mb-4">
          Encoding this with a discriminated union and <InlineCode>useReducer</InlineCode> is
          possible, but the reducer becomes a dense block of conditional logic. It&apos;s hard to
          read which transitions are valid and which aren&apos;t. Compare the two approaches:
        </p>

        <CodeBlock
          code={`// Without XState: conditional routing buried in event handlers
// (Even with useReducer, the guard logic sprawls)
function CheckoutFlow({ isLoggedIn, isDigital }) {
  const [step, setStep] = useState<
    'email' | 'shipping' | 'payment' | 'review' | 'submitting' | 'success' | 'failed'
  >(isLoggedIn ? 'shipping' : 'email')
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({})
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null)

  // Each handler has to know valid next states and handle edge cases manually
  async function handleShippingSubmit(address: Address) {
    const errors = validateAddress(address)
    if (Object.keys(errors).length) {
      setAddressErrors(errors)  // stay on shipping
      return
    }
    setAddressErrors({})
    setStep('payment')  // proceed
  }

  async function handlePaymentSubmit(card: Card) {
    setStep('submitting')
    try {
      await submitPayment(card)
      setStep('success')
      setRedirectCountdown(5)
      // Start countdown - but now this logic is scattered in a useEffect elsewhere
    } catch (err) {
      setPaymentError(err.message)
      setStep('payment')  // go back, but remember the error
    }
  }

  // The valid transitions are: email→shipping, shipping→payment (or stay),
  // payment→review, review→submitting, submitting→success|failed, success→redirect
  // But none of that is visible here - it's buried across 6 handlers and 3 useEffects.
}`}
          lang="tsx"
        />

        <div className="mt-6 mb-6">
          <p className="text-content mb-4">
            XState makes the transitions explicit and co-located. The machine <em>is</em> the
            documentation:
          </p>
          <CodeBlock
            code={`import { createMachine, assign } from 'xstate'

const checkoutMachine = createMachine({
  id: 'checkout',
  // The machine starts at 'email' or 'shipping' based on context
  initial: 'email',
  context: { paymentError: null, addressErrors: {} },
  states: {
    email: {
      on: { SUBMIT_EMAIL: 'shipping' }
    },
    shipping: {
      on: {
        SUBMIT_ADDRESS: [
          // Guard: if validation fails, stay on shipping with errors
          {
            guard: 'hasAddressErrors',
            actions: assign({ addressErrors: ({ event }) => event.errors }),
          },
          // Otherwise: proceed to payment
          { target: 'payment', actions: assign({ addressErrors: {} }) },
        ]
      }
    },
    payment: {
      on: { SUBMIT_PAYMENT: 'submitting' }
    },
    submitting: {
      on: {
        SUCCESS: 'success',
        FAILURE: {
          target: 'payment',
          actions: assign({ paymentError: ({ event }) => event.error }),
        },
      }
    },
    success: {
      after: { 5000: { actions: 'redirectToHome' } }  // delayed transition built-in
    },
  },
})

// Every valid transition is visible in one place.
// Invalid transitions (e.g. jumping from 'email' to 'success') are silently ignored.
// You can draw this on a whiteboard - the code is just an encoding of that diagram.`}
            lang="tsx"
          />
        </div>

        <Callout variant="warning" title="The cost" className="mt-4">
          XState&apos;s API surface is substantial: actors, guards, actions, delays, parallel
          states. A new developer joining your codebase will spend real time learning the
          library before they can contribute. That cost is worth it when the state is
          genuinely complex - when you could draw a transition diagram on a whiteboard and
          still need the diagram to understand the code. It is not worth it for a simple
          async fetch or a login form.
        </Callout>
      </section>

      {/* Section 5: The Forms Trap */}
      <section id="the-forms-trap" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">
          The Forms Trap: XState Is Overkill for Form State
        </h2>
        <p className="text-content mb-4">
          A login form has states:{" "}
          <InlineCode>pristine → touched → validating → submitting → success | error</InlineCode>.
          That looks like a state machine problem. It isn&apos;t - not one you need XState to solve.
        </p>
        <p className="text-content mb-6">
          React Hook Form already models this lifecycle internally. It tracks touched, dirty,
          validating, and submitting state; handles async validation and submission; exposes
          error state per field. The library <em>is</em> the state machine.
        </p>

        <CodeBlock
          code={`// ❌ XState for a login form - rebuilding what RHF already does
const loginMachine = createMachine({
  id: 'login',
  initial: 'idle',
  states: {
    idle:       { on: { SUBMIT: 'validating' } },
    validating: { on: { VALID: 'submitting', INVALID: 'idle' } },
    submitting: { on: { SUCCESS: 'success', ERROR: 'error' } },
    success:    {},
    error:      { on: { RETRY: 'validating' } },
  },
})
// You're writing boilerplate to encode a flow that React Hook Form handles for you.


// ✅ React Hook Form - form lifecycle is built in
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data) => {
    await login(data)
    // RHF handles: isSubmitting true during the call, error state if it throws,
    // re-validation after submission, and resetting state on success.
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <button disabled={isSubmitting}>
        {isSubmitting ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  )
}`}
          lang="tsx"
        />

        <Callout variant="info" title="The heuristic" className="mt-4">
          If the problem is &quot;validating user input and submitting to an API,&quot; use React Hook Form.
          If the problem is &quot;a multi-step workflow where the path forward depends on previous
          steps or external events,&quot; use a discriminated union first - and XState when the
          discriminated union grows past ~6 states or needs conditional transitions.
        </Callout>
      </section>

      {/* Section 6: Decision */}
      <section id="decision" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Decision</h2>

        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-content-border">
                {["Situation", "Reach for"].map((h) => (
                  <th key={h} className="text-left p-3 font-bold text-content">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  situation: "Single async operation (loading / success / error)",
                  tool: "Discriminated union, or just React Query, which models this for you",
                },
                {
                  situation: "Form with validation and submission",
                  tool: "React Hook Form",
                },
                {
                  situation: "3–5 named states with simple linear transitions",
                  tool: "Discriminated union + useState or useReducer",
                },
                {
                  situation: "States with conditional transitions (different next state depending on context)",
                  tool: "Discriminated union + useReducer with guards, or XState if transitions are > 6",
                },
                {
                  situation: "Multi-step wizard with branching paths",
                  tool: "XState: draw the transition diagram first, then encode it",
                },
                {
                  situation: "Connection lifecycle (WebSocket, SSE) with retries and backoff",
                  tool: "XState: delayed transitions and guards are built in",
                },
                {
                  situation: "10+ states, nested states, or parallel states",
                  tool: "XState: the ceremony is worth it at this complexity",
                },
              ].map((row, i) => (
                <tr
                  key={row.situation}
                  className={i % 2 === 0 ? "bg-content-bg" : ""}
                >
                  <td className="p-3 align-top text-content font-medium">{row.situation}</td>
                  <td className="p-3 align-top text-content-muted">{row.tool}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Callout variant="success" title="Start here">
          Default to a discriminated union. It costs nothing - no library, no new mental model,
          just a TypeScript type and a <InlineCode>switch</InlineCode> statement. If you find yourself
          adding guards (&quot;go to X, but only if Y&quot;) or delayed transitions (&quot;after 5 seconds,
          do Z&quot;), that&apos;s the signal to reach for XState. The diagram is the machine; the
          code is just an encoding of it.
        </Callout>
      </section>

      {/* Related */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Related</h2>
        <div className="space-y-3">
          <Link
            href="/frameworks/state-architecture"
            className="flex items-center justify-between p-4 border border-content-border rounded-lg hover:opacity-90 transition-opacity"
          >
            <div>
              <div className="font-medium text-content">State Architecture</div>
              <div className="text-sm text-content-muted">
                Where state lives and why - the broader framework
              </div>
            </div>
            <ChevronRight size={20} className="text-content-muted shrink-0" />
          </Link>
          <Link
            href="/deep-dives/state-management-internals"
            className="flex items-center justify-between p-4 border border-content-border rounded-lg hover:opacity-90 transition-opacity"
          >
            <div>
              <div className="font-medium text-content">State Management Internals</div>
              <div className="text-sm text-content-muted">
                How Zustand and Redux use useSyncExternalStore under the hood
              </div>
            </div>
            <ChevronRight size={20} className="text-content-muted shrink-0" />
          </Link>
        </div>
      </section>

      <RelatedContent
        items={deepDiveRelations['state-machines'].frameworks}
        type="frameworks"
      />
      <RelatedContent
        items={deepDiveRelations['state-machines'].patterns}
        type="patterns"
      />
    </div>
  );
}
