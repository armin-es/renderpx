import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'
import { Diagram } from '@/components/Diagram'
import { NotionMockup } from '@/components/mockups/NotionMockup'

const DATA_MODEL_CODE = `// The data model is the most important architectural decision.
// Use a FLAT map of blocks (not a nested tree) keyed by ID.
// Assemble the tree only at render time.

type BlockType =
  | 'paragraph' | 'heading1' | 'heading2' | 'heading3'
  | 'bulleted-list' | 'numbered-list' | 'toggle'
  | 'code' | 'image' | 'embed' | 'divider' | 'callout'

interface RichTextSpan {
  text: string
  bold?: boolean
  italic?: boolean
  code?: boolean
  href?: string
}

interface Block {
  id: string
  type: BlockType
  content: RichTextSpan[]     // inline text with marks
  childIds: string[]          // ordered list of child block IDs
  parentId: string | null
  // type-specific properties (language for code, url for image, etc.)
  properties: Record<string, unknown>
}

// Flat map - O(1) lookup by ID, easy to update without recursive mutation
type BlockMap = Record<string, Block>

interface Document {
  id: string
  title: string
  rootBlockIds: string[]   // top-level block order
  blocks: BlockMap
  icon?: string
  coverImageUrl?: string
}

// Why flat?
// - Updating a nested tree requires recursive cloning through every ancestor
// - CRDTs (Yjs) represent state as flat maps internally anyway
// - Easier to serialize, diff, and sync over the wire
// - Assembling the tree for rendering is a one-time traversal`

const BLOCK_RENDERING_CODE = `// Block registry: maps type -> component. Avoids a giant switch statement.
// Add new block types by adding an entry here - no changes elsewhere.

const BLOCK_RENDERERS: Record<BlockType, React.ComponentType<BlockRendererProps>> = {
  paragraph:      ParagraphBlock,
  heading1:       HeadingBlock,
  heading2:       HeadingBlock,
  heading3:       HeadingBlock,
  'bulleted-list': BulletedListBlock,
  'numbered-list': NumberedListBlock,
  toggle:         ToggleBlock,
  code:           CodeBlock,
  image:          ImageBlock,
  embed:          lazy(() => import('./blocks/EmbedBlock')),  // lazy-load heavy blocks
  divider:        DividerBlock,
  callout:        CalloutBlock,
}

function BlockRenderer({ blockId, blocks }: { blockId: string; blocks: BlockMap }) {
  const block = blocks[blockId]
  if (!block) return null
  const Component = BLOCK_RENDERERS[block.type]
  return <Component block={block} blocks={blocks} />
}

// Recursive rendering: each block renders its children
function DocumentRenderer({ document }: { document: Document }) {
  return (
    <div className="document-editor">
      {document.rootBlockIds.map(id => (
        <BlockRenderer key={id} blockId={id} blocks={document.blocks} />
      ))}
    </div>
  )
}

// Toggle block - expands/collapses nested blocks
function ToggleBlock({ block, blocks }: BlockRendererProps) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1">
        <ChevronRight size={14} className={open ? 'rotate-90' : ''} />
        <RichTextRenderer content={block.content} />
      </button>
      {open && block.childIds.map(id => (
        <div key={id} className="pl-5">
          <BlockRenderer blockId={id} blocks={blocks} />
        </div>
      ))}
    </div>
  )
}`

const EDITOR_CORE_CODE = `// The core problem: React's virtual DOM reconciliation conflicts with
// the browser's native text editing in contenteditable.
// React diffs and patches the DOM on re-render, which moves the cursor
// back to position 0. This breaks selection, IME composition, and undo.

// Naive - fights React reconciliation:
function NaiveParagraph({ block }: { block: Block }) {
  return (
    <div
      contentEditable
      // React re-renders this on every state change and resets the cursor.
      dangerouslySetInnerHTML={{ __html: block.textContent }}
    />
  )
}

// Better: suppress React's DOM management for the editable node,
// manually sync content only when the block is not focused.
function ParagraphBlock({ block }: { block: Block }) {
  const ref = useRef<HTMLDivElement>(null)
  const updateBlock = useDocumentStore(s => s.updateBlock)

  // Push server changes into the DOM only when this block is not being edited.
  // This prevents the cursor-jump problem while keeping the content in sync.
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.textContent = plainText(block.content)
    }
  }, [block.content])

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={e => updateBlock(block.id, e.currentTarget.textContent ?? '')}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          e.preventDefault()
          insertBlockAfter(block.id)    // split or insert new block
        }
        if (e.key === 'Backspace' && !e.currentTarget.textContent) {
          e.preventDefault()
          deleteBlock(block.id)        // merge up or remove empty block
        }
        if (e.key === '/') {
          openSlashMenu(block.id, getCursorPosition())
        }
      }}
    />
  )
}

// In production: use TipTap (built on ProseMirror) per block, or for the
// whole document. TipTap handles:
//   - cursor management across the entire document
//   - mark toggles (bold, italic, links) without manual DOM manipulation
//   - collaborative editing via the Yjs extension
//   - schema validation (can't put a block inside an inline span)
//
// Notion built their own ProseMirror integration.
// Most teams should not - use TipTap's editor.`

const SLASH_COMMAND_CODE = `// Slash commands: detect "/" keystroke, open a positioned command palette,
// filter as you type, insert block on selection.

function useSlashCommand(blockId: string) {
  const [state, setState] = useState<{
    open: boolean
    query: string
    position: { x: number; y: number }
  }>({ open: false, query: '', position: { x: 0, y: 0 } })

  const onKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent ?? ''
    const lastSlash = text.lastIndexOf('/')

    if (lastSlash !== -1 && !text.slice(lastSlash + 1).includes(' ')) {
      const range = window.getSelection()?.getRangeAt(0)
      const rect = range?.getBoundingClientRect()
      setState({
        open: true,
        query: text.slice(lastSlash + 1),
        position: { x: rect?.left ?? 0, y: (rect?.bottom ?? 0) + 4 },
      })
    } else {
      setState(s => ({ ...s, open: false }))
    }
  }

  const insertBlock = useCallback((type: BlockType) => {
    replaceSlashTextWithBlock(blockId, type)
    setState(s => ({ ...s, open: false }))
  }, [blockId])

  return { slashState: state, onKeyUp, insertBlock }
}

const COMMANDS = [
  { type: 'heading1',      label: 'Heading 1',    keywords: ['h1', 'title'] },
  { type: 'heading2',      label: 'Heading 2',    keywords: ['h2'] },
  { type: 'bulleted-list', label: 'Bullet list',  keywords: ['ul', 'list'] },
  { type: 'numbered-list', label: 'Numbered list', keywords: ['ol', '1.'] },
  { type: 'code',          label: 'Code block',   keywords: ['code', 'pre'] },
  { type: 'image',         label: 'Image',        keywords: ['img', 'photo'] },
  { type: 'callout',       label: 'Callout',      keywords: ['note', 'info'] },
  { type: 'divider',       label: 'Divider',      keywords: ['hr', 'line'] },
] as const

function CommandPalette({ query, position, onSelect, onClose }: CommandPaletteProps) {
  const filtered = COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.keywords.some(k => k.includes(query.toLowerCase()))
  )

  useEffect(() => {
    // Close on Escape or click outside
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      style={{ position: 'fixed', left: position.x, top: position.y }}
      className="z-50 bg-white dark:bg-neutral-900 shadow-lg rounded-lg border p-1 w-64"
      role="listbox"
    >
      {filtered.length === 0 && (
        <div className="px-3 py-2 text-sm text-gray-400">No results</div>
      )}
      {filtered.map(cmd => (
        <button
          key={cmd.type}
          role="option"
          onClick={() => onSelect(cmd.type as BlockType)}
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 text-sm"
        >
          {cmd.label}
        </button>
      ))}
    </div>
  )
}`


const REAL_TIME_CODE = `// Yjs is the standard CRDT library for collaborative editing.
// Each Y.Doc is a conflict-free replicated data type - concurrent edits
// from multiple users are automatically merged without conflicts.

import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

// One Y.Doc per document; one provider per WebSocket connection
const ydoc = new Y.Doc()
const provider = new WebsocketProvider('wss://collab.yourapp.com', docId, ydoc)

// Blocks stored as a Y.Map<Y.Map<unknown>> - each entry is a block
const yBlocks = ydoc.getMap<Y.Map<unknown>>('blocks')
const yRootIds = ydoc.getArray<string>('rootIds')

// Awareness: who else is in this document, and where is their cursor
provider.awareness.setLocalStateField('user', {
  id: currentUser.id,
  name: currentUser.name,
  color: '#' + Math.floor(Math.random() * 0xffffff).toString(16),
})

// React integration: observe Y.Doc and re-render on remote changes
function useYDocDocument(ydoc: Y.Doc): Document {
  const [doc, setDoc] = useState(() => buildDocFromYDoc(ydoc))

  useEffect(() => {
    const handler = () => setDoc(buildDocFromYDoc(ydoc))
    ydoc.on('update', handler)
    return () => ydoc.off('update', handler)
  }, [ydoc])

  return doc
}

// Presence: other users' cursors and selections
function useAwareness(provider: WebsocketProvider) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])

  useEffect(() => {
    const handler = () => {
      const states = Array.from(provider.awareness.getStates().entries())
        .filter(([clientId]) => clientId !== provider.awareness.clientID)
        .map(([, state]) => state.user)
        .filter(Boolean)
      setCollaborators(states)
    }
    provider.awareness.on('change', handler)
    return () => provider.awareness.off('change', handler)
  }, [provider])

  return collaborators
}

// When to add Yjs:
// - Start without it. Build with React Query mutations and single-user editing first.
// - Add Yjs when users request live collaboration - the Yjs extension for TipTap
//   makes this a near drop-in addition if you planned for it.
// - Design block IDs as UUIDs from day one (not sequential integers) so merging
//   concurrent inserts doesn't produce ID collisions.`

const STATE_MAP_CODE = `// What lives where in a Notion-style document editor

// 1. Document content - server state (React Query) for read,
//    Y.Doc (Yjs) for write when collaboration is enabled
const { data: document } = useQuery({
  queryKey: ['document', docId],
  queryFn: () => fetchDocument(docId),
  staleTime: Infinity,  // Y.Doc is the source of truth once loaded
})

// 2. Block order during drag - local useState for optimistic reorder
const [rootIds, setRootIds] = useState(document.rootBlockIds)

// 3. Selection / cursor position - pure local state, ephemeral
// Lives in the editor component; no global store needed
const [selection, setSelection] = useState<EditorSelection | null>(null)

// 4. Slash command menu - local state in the block that triggered it
const [slashMenu, setSlashMenu] = useState<SlashMenuState | null>(null)

// 5. Sidebar page tree - separate server state query
const { data: pageTree } = useQuery({
  queryKey: ['page-tree', workspaceId],
  queryFn: () => fetchPageTree(workspaceId),
  staleTime: 30_000,
})

// 6. Presence / collaborators - WebSocket (Yjs awareness), not React Query
const collaborators = useAwareness(provider)

// 7. Auth + UI preferences (sidebar width, theme) - Zustand
const { user, sidebarCollapsed, theme } = useAppStore()`


export default function NotionSystemDesignPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <p className="text-sm text-content-muted mb-2">System Design</p>
        <h1 className="text-4xl font-bold mb-4 text-content">Notion-style document editor</h1>
        <p className="text-xl text-content-muted">
          Block-based content model, contenteditable pitfalls, slash commands, drag-to-reorder, autosave, and optional real-time collaboration with Yjs CRDT.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-lg font-semibold text-content mb-3">What we&apos;re building</h2>
        <NotionMockup />
        <p className="text-content-muted text-sm mt-2">
          A <strong className="text-content">PageNavigator</strong> sidebar, a <strong className="text-content">BlockList</strong> that renders each block by type via <strong className="text-content">BlockRenderer</strong>, and a Zustand store holding a flat <code className="text-[11px] bg-code-bg px-1 rounded">Map&lt;id, Block&gt;</code> — not a nested tree.
        </p>
      </div>

      <section id="the-challenge" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The Challenge</h2>
        <p className="text-content mb-4">
          A document editor like Notion is one of the hardest frontend problems because every obvious approach has a hidden trap. Raw <InlineCode>contenteditable</InlineCode> conflicts with React&apos;s virtual DOM. Nested tree state makes every block update a recursive clone. Cursor management across block boundaries requires ProseMirror-level knowledge. And then there&apos;s real-time collaboration, which invalidates most naive assumptions about state ownership.
        </p>
        <p className="text-content mb-4">
          The scope here is a collaborative document editor with: a block-based content model, multiple block types (text, heading, list, code, image, embed), slash commands to insert blocks, <Link href="/patterns/drag-and-drop" className="text-primary hover:underline">drag-to-reorder</Link>, <Link href="/patterns/autosave-draft" className="text-primary hover:underline">autosave</Link>, and optional live collaboration with presence indicators.
        </p>
        <p className="text-content">
          Each section covers the key decision, the naive approach, and what you&apos;d actually build.
        </p>
      </section>

      <section id="data-model" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Data Model</h2>
        <p className="text-content mb-4">
          The most important decision is the shape of a block. The instinct is a nested tree: each block has a <InlineCode>children</InlineCode> array. That works until you need to update a deeply nested block - you have to clone every ancestor to maintain immutability.
        </p>
        <p className="text-content mb-4">
          Use a <Link href="/patterns/normalized-state" className="text-primary hover:underline"><strong>flat map</strong></Link> instead. Each block stores an array of child IDs, not child objects. The document has a <InlineCode>blocks: Record&lt;string, Block&gt;</InlineCode> map and a <InlineCode>rootBlockIds: string[]</InlineCode>. Any block can be looked up in O(1), updated without recursive cloning, and the structure maps naturally to how CRDT libraries like Yjs store data.
        </p>
        <CodeBlock code={DATA_MODEL_CODE} lang="ts" />
        <Callout variant="info" title="Fractional indexing for order">
          If block order is stored in a database as an integer column, inserting between two blocks requires renumbering siblings. Use fractional indexing instead - order values are strings that sort lexicographically, so any insert is a single-row write. The <InlineCode>fractional-indexing</InlineCode> npm package handles this.
        </Callout>
      </section>

      <section id="architecture-map" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Architecture Map</h2>
        <Diagram className="mb-8" chart={`
flowchart LR
  subgraph UI["UI Layer"]
    BL["BlockList\\n(root block IDs)"]
    BR["BlockRenderer\\n(switch on type)"]
    SE["Slash Commands\\n+ Toolbar"]
    DnD["Drag-and-Drop\\n(reorder)"]
  end
  subgraph State["State"]
    ZS["Zustand\\nblocks: Map + rootBlockIds"]
    RQ["React Query\\n(save / load)"]
  end
  subgraph Sync["Collaboration (optional)"]
    YJ["Yjs CRDT"]
    WS["WebSocket Provider"]
  end
  API["API / DB"]

  BL --> BR
  SE & DnD --> ZS
  BR --> ZS
  ZS --> RQ
  ZS --> YJ
  YJ --> WS
  WS --> API
  RQ --> API
        `} />
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-content-border">
                <th className="text-left py-3 pr-6 font-semibold text-content">Surface</th>
                <th className="text-left py-3 pr-6 font-semibold text-content">Pattern / approach</th>
                <th className="text-left py-3 font-semibold text-content">Why</th>
              </tr>
            </thead>
            <tbody className="text-content-muted">
              <tr className="border-b border-content-border">
                <td className="py-3 pr-6 font-medium text-content">Block rendering</td>
                <td className="py-3 pr-6">Block registry + recursive render</td>
                <td className="py-3">Extensible without a giant switch; new types = new entry</td>
              </tr>
              <tr className="border-b border-content-border">
                <td className="py-3 pr-6 font-medium text-content">Text editing</td>
                <td className="py-3 pr-6">TipTap / ProseMirror per block</td>
                <td className="py-3">Raw contenteditable + React fight the DOM; ProseMirror handles cursor, marks, composition</td>
              </tr>
              <tr className="border-b border-content-border">
                <td className="py-3 pr-6 font-medium text-content">Block mutations</td>
                <td className="py-3 pr-6">Optimistic updates + debounced sync</td>
                <td className="py-3">Every keystroke can&apos;t wait for a server round-trip; buffer 500ms then flush</td>
              </tr>
              <tr className="border-b border-content-border">
                <td className="py-3 pr-6 font-medium text-content">Slash commands</td>
                <td className="py-3 pr-6">Local UI state + floating menu</td>
                <td className="py-3">Detect &quot;/&quot;, position using <InlineCode>getBoundingClientRect</InlineCode>, filter + keyboard nav</td>
              </tr>
              <tr className="border-b border-content-border">
                <td className="py-3 pr-6 font-medium text-content">Block reorder</td>
                <td className="py-3 pr-6">dnd-kit + optimistic reorder</td>
                <td className="py-3">Mouse + touch + keyboard; <InlineCode>DragOverlay</InlineCode> avoids clipping; rollback on error</td>
              </tr>
              <tr className="border-b border-content-border">
                <td className="py-3 pr-6 font-medium text-content">Page tree (sidebar)</td>
                <td className="py-3 pr-6">React Query (separate query)</td>
                <td className="py-3">Different staleTime from doc content; page tree changes less often</td>
              </tr>
              <tr className="border-b border-content-border">
                <td className="py-3 pr-6 font-medium text-content">Collaboration</td>
                <td className="py-3 pr-6">Yjs CRDT + WebSocket provider</td>
                <td className="py-3">Concurrent edits merged conflict-free; awareness API handles presence</td>
              </tr>
              <tr className="border-b border-content-border">
                <td className="py-3 pr-6 font-medium text-content">Autosave</td>
                <td className="py-3 pr-6">Debounced mutation + save indicator</td>
                <td className="py-3">500ms debounce; show &quot;Saving...&quot; / &quot;Saved&quot;; flush on blur</td>
              </tr>
              <tr className="border-b border-content-border">
                <td className="py-3 pr-6 font-medium text-content">Long documents</td>
                <td className="py-3 pr-6">TanStack Virtual</td>
                <td className="py-3">1000+ blocks - render only what&apos;s in the viewport</td>
              </tr>
              <tr>
                <td className="py-3 pr-6 font-medium text-content">Heavy block types</td>
                <td className="py-3 pr-6">React.lazy per block type</td>
                <td className="py-3">Embed, syntax-highlighted code - don&apos;t ship their bundles unless the block type is used</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="block-rendering" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Block Rendering</h2>
        <p className="text-content mb-4">
          Each block type is a separate React component. The naive approach is a giant switch or if-else chain in a single render function - it becomes unmaintainable as you add types. Use a block registry instead: a plain object mapping <InlineCode>BlockType</InlineCode> to a component. Adding a new type is one object entry.
        </p>
        <p className="text-content mb-4">
          Since blocks nest (toggle blocks contain children, list items contain sub-items), each block component receives the full <InlineCode>BlockMap</InlineCode> and renders its child IDs recursively. This avoids threading child nodes through props - each component looks up what it needs by ID.
        </p>
        <CodeBlock code={BLOCK_RENDERING_CODE} lang="tsx" />
      </section>

      <section id="editor-core" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The Editor Core</h2>
        <p className="text-content mb-4">
          The most common mistake in document editor implementations: using <InlineCode>contenteditable</InlineCode> with <InlineCode>dangerouslySetInnerHTML</InlineCode> and letting React manage the DOM. React reconciles on every state change and resets the cursor to position 0. The user&apos;s typing position is lost on every keystroke.
        </p>
        <p className="text-content mb-4">
          The manual fix (shown below) suppresses React&apos;s reconciliation for the editable node and syncs content only when the block is not focused. This works for simple plaintext blocks. For rich text (bold, links, marks), you need ProseMirror or TipTap - the browser&apos;s selection model across marked text is too complex to manage manually.
        </p>
        <CodeBlock code={EDITOR_CORE_CODE} lang="tsx" />
        <Callout variant="warning" title="Don't build your own rich text editor">
          ProseMirror took years to develop and handles hundreds of edge cases: IME composition (Chinese, Japanese, Korean), bidirectional text, cross-browser selection, Safari&apos;s unique input events, screen reader compatibility. TipTap wraps ProseMirror in a React-friendly API and adds a Yjs extension for collaboration. Use it. Notion built their own - you shouldn&apos;t need to.
        </Callout>
      </section>

      <section id="slash-commands" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Slash Commands</h2>
        <p className="text-content mb-4">
          Slash commands are the primary block insertion UX. When the user types <InlineCode>/</InlineCode> at the start of an empty block (or anywhere in text), a command palette appears at the cursor position. As the user types more characters, the list filters. Pressing Enter or clicking inserts the selected block type and replaces the <InlineCode>/query</InlineCode> text.
        </p>
        <p className="text-content mb-4">
          The tricky part is positioning the menu at the cursor - <InlineCode>window.getSelection().getRangeAt(0).getBoundingClientRect()</InlineCode> gives you the cursor&apos;s viewport coordinates. The menu is rendered with <InlineCode>position: fixed</InlineCode> at those coordinates. If you render it in the React tree near the block, it may clip inside an <InlineCode>overflow: hidden</InlineCode> container. A portal at the document body is safer.
        </p>
        <CodeBlock code={SLASH_COMMAND_CODE} lang="tsx" />
      </section>

      <section id="drag-and-drop" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Drag-and-Drop Block Reorder</h2>
        <p className="text-content mb-4">
          Blocks need to be reorderable via a drag handle. The most common mistake: attaching drag listeners to the entire block. This means clicking anywhere on the block (including inside the text editor) triggers a drag, swallowing click events.
        </p>
        <p className="text-content mb-4">
          Use a dedicated grip icon that appears on hover. Attach drag listeners only to that icon. The block content - the editor, buttons, links - remains fully interactive. The full dnd-kit setup with <InlineCode>DragOverlay</InlineCode>, <InlineCode>PointerSensor</InlineCode> activation constraint, and optimistic reorder with rollback is covered in the{' '}
          <Link href="/patterns/drag-and-drop" className="text-primary hover:underline">Drag-and-Drop pattern</Link>.
        </p>
        <Callout variant="info" title="Nested block drag">
          This example handles top-level block reorder. For nested blocks (inside a toggle or list), you need one <InlineCode>SortableContext</InlineCode> per parent block, each with its own <InlineCode>items</InlineCode> array. Cross-list dragging (moving a block out of a toggle into the root level) requires <InlineCode>DragOverlay</InlineCode> and custom collision detection.
        </Callout>
      </section>

      <section id="real-time-sync" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Real-Time Collaboration</h2>
        <p className="text-content mb-4">
          Yjs is the production choice for collaborative document editing. It implements a CRDT (conflict-free replicated data type): every client holds a full copy of the document, edits are represented as operations that can be applied in any order, and concurrent edits from two users always merge to the same result with no server-side conflict resolution logic.
        </p>
        <p className="text-content mb-4">
          The WebSocket provider syncs operations in real time; when a user is offline, changes queue locally and sync on reconnect. The awareness API tracks who is in the document and where their cursor is, which powers the collaborator avatars and cursor overlays.
        </p>
        <CodeBlock code={REAL_TIME_CODE} lang="tsx" />
        <Diagram className="my-6" chart={`
sequenceDiagram
  participant A as User A
  participant YA as Yjs (client A)
  participant WS as WebSocket Server
  participant YB as Yjs (client B)
  participant B as User B

  A->>YA: Type in block "Hello"
  YA->>YA: Create CRDT operation
  YA->>WS: Broadcast operation
  WS->>YB: Forward operation
  YB->>YB: Merge (conflict-free)
  YB->>B: Update block text

  Note over YA,YB: Concurrent edit — both users type simultaneously
  B->>YB: Type " world"
  YB->>WS: Broadcast operation
  WS->>YA: Forward operation
  YA->>YA: Merge deterministically
  YA->>A: Result: "Hello world"
        `} />
        <Callout variant="success" title="Ship without Yjs first">
          Yjs adds complexity: a new mental model for state, a separate WebSocket server, and a migration from your existing mutation-based writes. Build the single-user version first with React Query and optimistic updates. Add Yjs when users actually need live collaboration - the TipTap Yjs extension makes it a near drop-in if you planned block IDs as UUIDs from the start.
        </Callout>
      </section>

      <section id="state-architecture" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">State Architecture</h2>
        <p className="text-content mb-4">
          This is the surface where wrong state placement causes the most pain. The rule: server state in React Query, ephemeral UI state local to the component that owns it, and global client state (auth, theme, UI prefs) in Zustand.
        </p>
        <CodeBlock code={STATE_MAP_CODE} lang="tsx" />
        <Callout variant="warning" title="Don't put selection in global state">
          Cursor position and text selection are ephemeral, device-local, and change thousands of times per minute during typing. Putting them in a global store causes every subscribed component to re-render on every keystroke. Keep selection in the editor component&apos;s local state.
        </Callout>
      </section>

      <section id="performance" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Performance</h2>
        <p className="text-content mb-4">
          Four performance concerns are specific to document editors.
        </p>
        <ul className="list-disc pl-6 space-y-3 text-content mb-6">
          <li>
            <strong><Link href="/patterns/virtualized-lists" className="text-primary hover:underline">Virtualized lists</Link>:</strong>{' '}
            Render only the blocks currently in the viewport. TanStack Virtual handles variable-height items. See the tradeoffs below before adding this.
          </li>
          <li>
            <strong><Link href="/patterns/code-splitting-lazy-loading" className="text-primary hover:underline">Lazy-load heavy block types</Link>:</strong>{' '}
            Embed blocks (Figma, YouTube) and syntax-highlighted code pull in large dependencies. <InlineCode>React.lazy</InlineCode> splits them out of the initial bundle.
          </li>
          <li>
            <strong><Link href="/patterns/debouncing-throttling" className="text-primary hover:underline">Debounce writes</Link>:</strong>{' '}
            Buffer keystrokes for 500ms then flush to the server. Also flush on blur when the user leaves a block. Prevents a round-trip on every character.
          </li>
          <li>
            <strong><Link href="/patterns/memoization" className="text-primary hover:underline">Memoize block components</Link>:</strong>{' '}
            When one block changes, only that block should re-render. Use <InlineCode>React.memo</InlineCode> with a custom comparator on <InlineCode>blockId + updatedAt</InlineCode> so siblings don&apos;t re-render unnecessarily.
          </li>
        </ul>
        <Callout variant="info" title="Measure before virtualizing">
          Virtualization adds complexity: the virtualizer needs block heights before rendering, variable-height items require measurement, and dnd-kit has known issues with TanStack Virtual during drag (items scroll out of view and are unmounted). For most documents (under 200 blocks), React handles it fine without virtualization. Add it only when you have real user complaints about scroll performance.
        </Callout>
      </section>

      <section id="building-blocks" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Building Blocks</h2>
        <p className="text-content-muted mb-6">
          The patterns and frameworks that this system design applies - each covers one piece of the architecture above.
        </p>

        <div className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-content-muted mb-3">Patterns used</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { href: '/patterns/optimistic-updates', title: 'Optimistic Updates', desc: 'Block edits and reorder reflect immediately; rollback on sync failure.' },
              { href: '/patterns/autosave-draft', title: 'Autosave / Draft', desc: 'Debounced write to server on every block change; save indicator.' },
              { href: '/patterns/debouncing-throttling', title: 'Debouncing & Throttling', desc: '500ms debounce on keystroke sync; prevents per-character round-trips.' },
              { href: '/patterns/drag-and-drop', title: 'Drag-and-Drop', desc: 'Block reorder with dnd-kit; optimistic reorder + rollback.' },
              { href: '/patterns/virtualized-lists', title: 'Virtualized Lists', desc: 'Render only visible blocks for documents with 1000+ entries.' },
              { href: '/patterns/polling-vs-websockets', title: 'Polling vs WebSockets', desc: 'WebSockets for Yjs sync; polling as a fallback for presence.' },
              { href: '/patterns/code-splitting-lazy-loading', title: 'Code Splitting & Lazy Loading', desc: 'Embed and syntax-highlighted code blocks load on demand.' },
              { href: '/patterns/loading-states', title: 'Loading States', desc: 'Skeleton layout during initial document fetch.' },
            ].map(p => (
              <Link
                key={p.href}
                href={p.href}
                className="border border-content-border rounded-lg p-3 hover:shadow-sm transition-all group"
              >
                <div className="font-medium text-primary group-hover:underline text-sm mb-1">{p.title}</div>
                <div className="text-xs text-content-muted">{p.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-content-muted mb-3">Frameworks applied</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { href: '/frameworks/state-architecture', title: 'State Architecture', desc: 'Where block state, selection, presence, and UI prefs live.' },
              { href: '/frameworks/data-fetching', title: 'Data Fetching & Sync', desc: 'React Query for document and page tree; Yjs for collaborative state.' },
              { href: '/frameworks/rendering-strategy', title: 'Rendering Strategy', desc: 'SSR for initial page load; client-side for editor interactions.' },
              { href: '/frameworks/performance-architecture', title: 'Performance Architecture', desc: 'Virtualization, memoization, lazy block types, debounced writes.' },
            ].map(fw => (
              <Link
                key={fw.href}
                href={fw.href}
                className="border border-content-border rounded-lg p-3 hover:shadow-sm transition-all group"
              >
                <div className="font-medium text-primary group-hover:underline text-sm mb-1">{fw.title}</div>
                <div className="text-xs text-content-muted">{fw.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="tradeoffs" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">What I&apos;d Do Differently</h2>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-content mb-2">Use TipTap from day one, not raw contenteditable</h3>
            <p className="text-content-muted">
              The browser&apos;s editing model is a decade of accumulated quirks. IME composition events (Chinese, Japanese input), Safari&apos;s non-standard input event behavior, bidirectional text, and screen reader compatibility will consume weeks if you handle them manually. TipTap gives you a schema-validated, extension-based editor that already handles all of this. The cost is bundle size (~50kB gzipped) and a new mental model; both are worth it.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-content mb-2">Design the data model for CRDT before you need it</h3>
            <p className="text-content-muted">
              Adding Yjs to an existing data model means rewriting every mutation. The changes are not large individually, but they touch every place that writes state. If you use UUID block IDs from the start (instead of sequential integers), use a flat map (not nested tree), and separate block content from block metadata, the migration is mostly mechanical. If you used integers and nested state, the migration requires a data transformation and a period where the old and new models coexist.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-content mb-2">Don&apos;t virtualize until you have to</h3>
            <p className="text-content-muted">
              Virtualization complicates drag-and-drop (items scroll out of view and unmount), breaks <InlineCode>Cmd+F</InlineCode> in-page search (hidden items aren&apos;t in the DOM), and makes block height estimation fragile. For most documents, 200 blocks renders fast. Add virtualization only when you have measured scroll jank on real devices with real content. Premature optimization here causes bugs that are genuinely hard to debug.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-content mb-2">The block-as-flat-map pattern pays off across the whole stack</h3>
            <p className="text-content-muted">
              The flat map is slightly awkward to assemble for rendering, but it eliminates an entire class of bugs: no recursive state updates, no deeply nested immer patches, no &quot;why did this ancestor re-render&quot; mystery. When you add Yjs, you realize Yjs internally stores everything as a flat map anyway. Getting there from a nested tree is the migration you don&apos;t want to do under deadline pressure.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
