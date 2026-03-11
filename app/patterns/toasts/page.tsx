import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'
import { RelatedContent } from '@/components/RelatedContent'
import { patternRelations } from '@/lib/related-content'

const NAIVE_CODE = `// Inline state per screen - toasts only where you call setToast
function SaveButton() {
  const [toast, setToast] = useState<{ message: string } | null>(null)

  const handleSave = async () => {
    try {
      await save()
      setToast({ message: 'Saved!' })
      setTimeout(() => setToast(null), 3000)
    } catch {
      setToast({ message: 'Failed to save' })
    }
  }

  return (
    <>
      <button onClick={handleSave}>Save</button>
      {toast && <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded">{toast.message}</div>}
    </>
  )
}
// Every component that needs toasts duplicates state and markup; only one toast at a time per component.`;

const FIRST_IMPROVEMENT_CODE = `// Global toast state (Context + useState) - any component can trigger
const ToastContext = createContext<((msg: string) => void) | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([])
  const add = useCallback((message: string) => {
    const id = Date.now()
    setToasts(t => [...t, { id, message }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }, [])

  return (
    <ToastContext.Provider value={add}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2">
        {toasts.map(t => <div key={t.id} className="bg-black text-white px-4 py-2 rounded">{t.message}</div>)}
      </div>
    </ToastContext.Provider>
  )
}
// Single place to render toasts; queue multiple; call toast('Saved!') from anywhere.`;

const PRODUCTION_CODE = `// Use a library: sonner, react-hot-toast, or Radix Toast
import { toast } from 'sonner'

// From anywhere (no provider in the call site):
toast.success('Saved!')
toast.error('Failed to save')
toast.promise(saveMutation(), { loading: 'Saving...', success: 'Saved!', error: 'Failed' })

// Or with a provider for theming/position:
import { Toaster } from 'sonner'
// In layout:
<Toaster position="bottom-right" richColors />

// Stacking, dismiss, accessibility (aria-live), and action buttons come built-in.`;

export default function ToastsPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Toasts
        </h1>
        <p className="text-xl text-content-muted">
          Short-lived notifications (success, error, info) that don’t block the UI. Global trigger, stacked display, and accessible announcements.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          After a save, delete, or error, the user needs feedback. Inline messages clutter the form; modals are heavy. You want a small, non-blocking notification (toast) that appears briefly and can be triggered from anywhere -mutations, API errors, background jobs -without passing callbacks through the tree.
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          Local state in the component that performs the action: <InlineCode>toast</InlineCode> message + a timeout to clear it. The toast is rendered in the same component; other parts of the app can’t trigger toasts without prop drilling or duplicating UI.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          A toast context (or small store): expose a function like <InlineCode>toast(message)</InlineCode> and render a list of toasts in a single fixed container (e.g. bottom-right). Any component can call the function; toasts stack and auto-dismiss after a delay.
        </p>
        <CodeBlock code={FIRST_IMPROVEMENT_CODE} lang="tsx" />
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Accessibility:</strong> Toasts should be announced to screen readers (<InlineCode>aria-live</InlineCode> region) and not steal focus from the flow.</li>
          <li><strong>Variants:</strong> Success (green), error (red), loading, promise (loading → success/error). A small API keeps call sites clean.</li>
          <li><strong>Stacking and dismiss:</strong> Multiple toasts should stack; user may want to dismiss one or pause auto-remove.</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          Use a library: <InlineCode>sonner</InlineCode>, <InlineCode>react-hot-toast</InlineCode>, or Radix UI Toast. They provide a global <InlineCode>toast.success()</InlineCode> / <InlineCode>toast.error()</InlineCode> (and often <InlineCode>toast.promise()</InlineCode> for async), a single <InlineCode>Toaster</InlineCode> in the layout, stacking, dismiss, and <InlineCode>aria-live</InlineCode>. Add the provider once; call from any component or from non-React code (e.g. API client) if the library supports an imperative API.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Mutation feedback:</strong> “Saved”, “Deleted”, “Failed to save” after a button or form submit.</li>
          <li><strong>Background jobs:</strong> “Export ready”, “Sync complete” when you can’t show inline.</li>
          <li><strong>Skip when:</strong> The message is critical and must be acknowledged (use a modal or inline error). For validation errors, prefer inline near the field.</li>
        </ul>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Don’t toast validation errors:</strong> Show those next to the fields or at the top of the form so the user can fix them; toasts are for success or non-field errors.</li>
          <li><strong>aria-live:</strong> Use <InlineCode>{'aria-live="polite"'}</InlineCode> so screen readers announce the toast without interrupting; avoid <InlineCode>{'assertive'}</InlineCode> unless it’s urgent.</li>
          <li><strong>Promise toasts:</strong> <InlineCode>{`toast.promise(fn, { loading, success, error })`}</InlineCode> keeps the UX to one toast that updates; better than loading toast + separate success toast.</li>
        </ul>
      </section>

      <p className="text-content-muted text-sm">
        <Link href="/patterns/error-boundaries" className="text-primary hover:underline">
          Error Boundaries →
        </Link>
        {' · '}
        <Link href="/patterns" className="text-primary hover:underline">
          All patterns
        </Link>
      </p>

      <RelatedContent
        items={patternRelations['toasts'].frameworks}
        type="frameworks"
      />
      <RelatedContent
        items={patternRelations['toasts'].deepDives}
        type="deepDives"
      />
    </div>
  )
}
