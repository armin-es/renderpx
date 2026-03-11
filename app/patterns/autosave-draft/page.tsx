import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'
import { RelatedContent } from '@/components/RelatedContent'
import { patternRelations } from '@/lib/related-content'

const NAIVE_CODE = `// Single "Save" button - user can lose work if they leave or crash
function EditPostForm({ postId }: { postId: string }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch(\`/api/posts/\${postId}\`, {
      method: 'PATCH',
      body: JSON.stringify({ title, body }),
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <textarea value={body} onChange={e => setBody(e.target.value)} />
      <button type="submit">Save</button>
    </form>
  )
}
// If the user closes the tab or navigates away, changes are lost.`;

const FIRST_IMPROVEMENT_CODE = `// Debounced autosave to localStorage - draft survives refresh
function EditPostForm({ postId }: { postId: string }) {
  const draftKey = \`draft-\${postId}\`
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem(draftKey)
    if (raw) {
      try {
        const { title: t, body: b } = JSON.parse(raw)
        setTitle(t ?? ''); setBody(b ?? '')
      } catch (_) {}
    }
  }, [postId])

  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify({ title, body }))
    }, 1000)
    return () => clearTimeout(t)
  }, [title, body, postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveToApi({ title, body })
    localStorage.removeItem(draftKey)
  }

  return ( /* form JSX */ )
}
// Draft persists locally; user can close and come back. Not synced across devices.`;

const PRODUCTION_CODE = `// Autosave to API (debounced) + draft indicator + conflict handling
function EditPostForm({ postId }: { postId: string }) {
  const form = useForm({ defaultValues: { title: '', body: '' } })
  const lastSaved = useRef<Date | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const debouncedSave = useMemo(
    () =>
      debounce(async (data: { title: string; body: string }) => {
        setSaveStatus('saving')
        try {
          await fetch(\`/api/posts/\${postId}/draft\`, {
            method: 'PUT',
            body: JSON.stringify(data),
          })
          lastSaved.current = new Date()
          setSaveStatus('saved')
        } catch {
          setSaveStatus('error')
        }
      }, 2000),
    [postId]
  )

  useEffect(() => {
    const sub = form.watch((data) => debouncedSave(data))
    return () => sub.unsubscribe()
  }, [form, debouncedSave])

  // On mount: load draft from API (or initial post) and hydrate form
  const { data } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId),
  })
  useEffect(() => {
    if (data) form.reset(data)
  }, [data?.updatedAt])

  return (
    <form onSubmit={form.handleSubmit(submitFinal)}>
      {saveStatus === 'saved' && <span className="text-muted">Saved at {lastSaved.current?.toLocaleTimeString()}</span>}
      {saveStatus === 'error' && <span role="alert">Failed to save draft</span>}
      {/* fields */}
    </form>
  )
}
// Draft stored on server; multiple tabs/devices can be handled with last-write-wins or conflict UI.`;

export default function AutosaveDraftPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Autosave / Draft
        </h1>
        <p className="text-xl text-content-muted">
          Save the user’s work automatically (debounced) so they don’t lose changes on refresh, navigation, or crash. Optionally persist draft to the server for cross-device and multi-tab.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          Long forms and editors with a single “Save” button risk losing work if the user closes the tab, hits back, or the browser crashes. Users expect drafts to be preserved. You need to save periodically in the background -either to local storage (draft per device) or to the server (draft synced, recoverable elsewhere).
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          One submit button; no persistence until the user clicks Save. Any leave or crash loses unsaved changes.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          Debounce form values and write to <InlineCode>localStorage</InlineCode> (keyed by post id or form id). On mount, read from localStorage and hydrate the form. On successful final submit, clear the draft key. The user can refresh or come back later and see their draft; it doesn’t sync across devices.
        </p>
        <CodeBlock code={FIRST_IMPROVEMENT_CODE} lang="tsx" />
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Server draft:</strong> To recover drafts on another device or after clearing storage, persist to an API (e.g. <InlineCode>PUT /posts/:id/draft</InlineCode>) with the same debounce.</li>
          <li><strong>Feedback:</strong> Show “Saving…”, “Saved at 3:42 PM”, or “Failed to save” so the user knows the draft is safe (or not).</li>
          <li><strong>Conflict:</strong> If the user has two tabs or two devices, define behavior: last-write-wins, or prompt to resolve conflict when loading.</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          Use React Hook Form (or similar) and <InlineCode>form.watch</InlineCode> with a debounced save (e.g. 1–2 seconds). Save to an API endpoint that stores the draft; on load, fetch the draft (or the published resource) and <InlineCode>form.reset</InlineCode>. Show a small status: “Saving…”, “Saved at …”, or an error. Clear or overwrite the draft when the user explicitly publishes. For conflict, either last-write-wins and show “Draft updated elsewhere” or merge/compare and let the user choose.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Long-form editors:</strong> Blog posts, emails, settings pages. Autosave reduces anxiety and prevents loss.</li>
          <li><strong>Multi-step forms:</strong> Persist each step’s answers so users can complete later (see Multi-Step Forms for step + draft).</li>
          <li><strong>Skip when:</strong> Form is short and submit is one click; or data is highly sensitive and you must not persist until explicit submit.</li>
        </ul>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Debounce length:</strong> Too short and you send many requests; too long and the user might leave before the last change is saved. 1–2 seconds is a good default.</li>
          <li><strong>Draft vs submit:</strong> Distinguish “save draft” (autosave) from “publish” or “submit.” Don’t treat every autosave as a final submit; clear draft only after successful final action.</li>
          <li><strong>Hydration:</strong> When loading draft from API, use <InlineCode>reset</InlineCode> so the form doesn’t show empty then pop; avoid flashing “Unsaved changes” if the loaded draft matches what you just saved.</li>
        </ul>
      </section>

      <p className="text-content-muted text-sm">
        <Link href="/patterns/form-validation" className="text-primary hover:underline">
          Form Validation →
        </Link>
        {' · '}
        <Link href="/patterns/multi-step-forms" className="text-primary hover:underline">
          Multi-Step Forms →
        </Link>
        {' · '}
        <Link href="/patterns" className="text-primary hover:underline">
          All patterns
        </Link>
      </p>

      <RelatedContent
        items={patternRelations['autosave-draft'].frameworks}
        type="frameworks"
      />
      <RelatedContent
        items={patternRelations['autosave-draft'].deepDives}
        type="deepDives"
      />
    </div>
  )
}
