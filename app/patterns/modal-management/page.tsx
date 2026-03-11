import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'
import { RelatedContent } from '@/components/RelatedContent'
import { patternRelations } from '@/lib/related-content'

const NAIVE_CODE = `// Modal open state local to each screen - no shared pattern
function UserList() {
  const [open, setOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const handleRowClick = (user: User) => {
    setSelectedUser(user)
    setOpen(true)
  }

  return (
    <>
      <table>...</table>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center" onClick={() => setOpen(false)}>
          <div className="bg-white p-4 rounded" onClick={e => e.stopPropagation()}>
            <UserDetails user={selectedUser} />
            <button onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  )
}
// Works for one modal. Multiple modals, escape key, focus trap, and URL state get messy.`;

const FIRST_IMPROVEMENT_CODE = `// Single modal state + content in context or root
type ModalState = { type: 'user-details'; user: User } | { type: 'confirm'; message: string } | null

function App() {
  const [modal, setModal] = useState<ModalState>(null)

  return (
    <ModalContext.Provider value={setModal}>
      <UserList />
      {modal?.type === 'user-details' && <UserDetailsModal user={modal.user} onClose={() => setModal(null)} />}
      {modal?.type === 'confirm' && <ConfirmModal message={modal.message} onClose={() => setModal(null)} />}
    </ModalContext.Provider>
  )
}
// One place to render modals; any child can setModal({ type: 'user-details', user }). Add focus trap and Escape in each modal.`;

const PRODUCTION_CODE = `// Radix Dialog (or similar): focus trap, escape, aria
import * as Dialog from '@radix-ui/react-dialog'

function UserDetailsModal({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded shadow-lg">
          <Dialog.Title>{user.name}</Dialog.Title>
          <UserDetails user={user} />
          <Dialog.Close asChild>
            <button>Close</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Open from anywhere via context:
const openModal = useModal()
openModal({ type: 'user-details', user })
// Radix handles focus trap, Escape, click outside, and aria.`;

const STACK_CODE = `// Multiple modals (e.g. confirm inside a details modal): stack or queue
// Option A: Stack - render modals in order; top one receives Escape
const [stack, setStack] = useState<ModalState[]>([])
const push = (m: ModalState) => setStack(s => [...s, m])
const pop = () => setStack(s => s.slice(0, -1))
// Option B: Only one modal at a time; new one replaces or queues (e.g. toast instead).`;

export default function ModalManagementPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Modal Management
        </h1>
        <p className="text-xl text-content-muted">
          Open and close modals (dialogs) in a predictable way: focus trap, Escape, optional URL sync, and support for stacked or sequential modals.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          Modals need to trap focus, close on Escape and (often) click-outside, and be announced to screen readers. Managing which modal is open from deep in the tree leads to prop drilling or scattered state. You want a single place to render modals and a clear way to open/close them from anywhere.
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          Local <InlineCode>useState</InlineCode> for open/close and modal content in the same component that triggers it. Fine for one screen; when multiple components need to open modals or you need escape/focus behavior, it gets duplicated or inconsistent.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          Lift modal state to a context (or root): store “which modal is open” and its props (e.g. <InlineCode>{`{ type: 'user-details', user }`}</InlineCode>). Render the active modal in one place (e.g. layout). Any child can call <InlineCode>setModal(...)</InlineCode> to open. Add focus trap and Escape inside each modal component.
        </p>
        <CodeBlock code={FIRST_IMPROVEMENT_CODE} lang="tsx" />
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Accessibility:</strong> Focus trap (tab stays inside modal), focus return on close, <InlineCode>aria-modal</InlineCode>, <InlineCode>role="dialog"</InlineCode>, and a visible title for screen readers.</li>
          <li><strong>Escape and click-outside:</strong> Consistent behavior; some modals may want to block dismiss (e.g. “Unsaved changes”).</li>
          <li><strong>Stacking:</strong> If a modal can open another (e.g. confirm inside details), define whether they stack (Escape closes top) or replace.</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          Use Radix UI Dialog (or Headless UI Modal). It provides overlay, content, focus trap, Escape, and <InlineCode>{'aria-*'}</InlineCode>. Control open state via <InlineCode>open</InlineCode> and <InlineCode>onOpenChange</InlineCode>. Keep a small “modal registry” in context: <InlineCode>{`openModal({ type, props })`}</InlineCode> and render the matching component in a single portal. For stacked modals, keep an array of open modals and render the top one; pass <InlineCode>onClose</InlineCode> to pop the stack.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />
        <CodeBlock code={STACK_CODE} lang="tsx" className="mt-4" label="Stacking modals" />
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Details / edit overlay:</strong> Click a row → modal with full record; close and return to list.</li>
          <li><strong>Confirmations:</strong> “Delete?”, “Discard changes?” with Cancel / Confirm.</li>
          <li><strong>Skip when:</strong> A slide-over or inline expand is enough; prefer those for less disruptive flows.</li>
        </ul>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Scroll lock:</strong> When the modal is open, body scroll should be locked; Radix and similar do this.</li>
          <li><strong>URL:</strong> If the modal is “the page” (e.g. <InlineCode>/users/1</InlineCode> in a modal), sync open state with the route and use <InlineCode>router.back()</InlineCode> or replace to close.</li>
          <li><strong>Focus return:</strong> When closing, focus should return to the element that opened the modal so keyboard users aren’t lost.</li>
        </ul>
      </section>

      <p className="text-content-muted text-sm">
        <Link href="/patterns/toasts" className="text-primary hover:underline">
          Toasts →
        </Link>
        {' · '}
        <Link href="/patterns" className="text-primary hover:underline">
          All patterns
        </Link>
      </p>

      <RelatedContent
        items={patternRelations['modal-management'].frameworks}
        type="frameworks"
      />
      <RelatedContent
        items={patternRelations['modal-management'].deepDives}
        type="deepDives"
      />
    </div>
  )
}
