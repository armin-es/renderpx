import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'
import { Diagram } from '@/components/Diagram'
import { FileBrowserMockup } from '@/components/mockups/FileBrowserMockup'

const DATA_MODEL_CODE = `// The most important decision: flat map, not nested tree.
// The instinct is to store folders as nested objects with a children array.
// That works until you need to update a deeply nested node - every
// ancestor must be cloned to maintain immutability.

interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  parentId: string | null
  size?: number
  mimeType?: string
  modifiedAt: string
  childrenLoaded: boolean   // false until the user expands this folder
  childIds?: string[]       // populated on first expand
}

// O(1) lookup, cheap updates, easy to serialize
type FileStore = Map<string, FileNode>

// Children of a folder:
//   store.get(folderId).childIds.map(id => store.get(id))
//
// Updating a node:
//   store.set(id, { ...store.get(id), name: 'new name' })
//
// No recursive traversal. No ancestor cloning.
// This is also how the Box Content API models its response - a flat list
// of items under a folder ID, not a nested tree payload.`

const COMPONENT_TREE_CODE = `FileBrowser
├── Toolbar
│   ├── BreadcrumbNav       -- current path, click to navigate up
│   ├── SearchInput         -- debounced, scoped to current folder
│   └── ViewControls        -- grid/list toggle, sort, upload button
├── FileTree (sidebar)
│   └── TreeNode            -- recursive, lazy-loads children on expand
├── FileGrid / FileList     -- main panel, virtualized
│   └── FileCard / FileRow  -- one per visible file
└── FilePreview             -- right panel or modal

// State split:
//
//   File data (nodes + children) -- React Query (server state)
//   Current folder ID            -- URL (?folder=abc, deep-linkable)
//   Selected file IDs            -- local useState(Set)
//   Open folder IDs in tree      -- local useState(Set)
//   View mode, sort              -- URL or localStorage
//
// Rule: anything the user expects to survive a page refresh goes in
// the URL or localStorage. Anything purely visual stays local.`

const LAZY_LOAD_CODE = `// Folders only fetch their children when the user expands them.
// This is the core pattern for any tree UI that can be arbitrarily deep.

async function expandFolder(folderId: string) {
  const node = store.get(folderId)!

  if (node.childrenLoaded) {
    // Already fetched - just toggle open state, no network request
    setOpenIds(prev => {
      const next = new Set(prev)
      next.has(folderId) ? next.delete(folderId) : next.add(folderId)
      return next
    })
    return
  }

  // First expand - fetch children
  setLoadingIds(prev => new Set(prev).add(folderId))
  try {
    const children = await api.getChildren(folderId)

    setStore(prev => {
      const next = new Map(prev)
      children.forEach(child => next.set(child.id, child))
      next.set(folderId, {
        ...node,
        childrenLoaded: true,
        childIds: children.map(c => c.id),
      })
      return next
    })
    setOpenIds(prev => new Set(prev).add(folderId))
  } finally {
    setLoadingIds(prev => {
      const next = new Set(prev)
      next.delete(folderId)
      return next
    })
  }
}

// API contract (matches the real Box Content API shape):
// GET /api/v2/folders/:id/items?limit=100&marker=<cursor>
// Response: { entries: FileNode[], next_marker: string | null, total_count: number }
//
// Cursor-based pagination, not offset - stable when items are
// inserted or deleted between requests.`

const VIRTUALIZATION_CODE = `// A folder with 50,000 files cannot render 50,000 DOM nodes.
// The fix: render only the rows visible in the viewport.

// For the flat file list: FixedSizeList from react-window.
// For the sidebar tree: react-window doesn't handle trees natively.
// Solution - maintain a flat array of *visible* tree nodes in display order:

function flattenVisibleTree(
  rootIds: string[],
  store: FileStore,
  openIds: Set<string>,
  depth = 0
): Array<{ node: FileNode; depth: number }> {
  const result: Array<{ node: FileNode; depth: number }> = []
  for (const id of rootIds) {
    const node = store.get(id)!
    result.push({ node, depth })
    if (node.type === 'folder' && openIds.has(id) && node.childIds) {
      result.push(
        ...flattenVisibleTree(node.childIds, store, openIds, depth + 1)
      )
    }
  }
  return result
}

// Feed this flat array into FixedSizeList.
// When a folder is opened or closed, recompute the array.
// react-window renders only the visible slice.

function FileTreeVirtualized({ rootIds, store, openIds, onToggle }) {
  const items = useMemo(
    () => flattenVisibleTree(rootIds, store, openIds),
    [rootIds, store, openIds]
  )

  return (
    <FixedSizeList
      height={600}
      width="100%"
      itemCount={items.length}
      itemSize={32}
    >
      {({ index, style }) => {
        const { node, depth } = items[index]
        return (
          <TreeRow
            key={node.id}
            style={style}
            node={node}
            depth={depth}
            isOpen={openIds.has(node.id)}
            onToggle={onToggle}
          />
        )
      }}
    </FixedSizeList>
  )
}`

const PREVIEW_CODE = `// The challenge: 60+ file formats, but you can't ship all renderers upfront.
// A PDF renderer (pdf.js) alone is ~300KB gzipped.
// The solution: dynamic imports. Each renderer is a separate bundle chunk,
// downloaded only when the user opens that file type.

type RendererFactory = () => Promise<{ default: React.ComponentType<RendererProps> }>

const rendererRegistry = new Map<string, RendererFactory>([
  ['application/pdf',        () => import('./renderers/PdfRenderer')],
  ['image/jpeg',             () => import('./renderers/ImageRenderer')],
  ['image/png',              () => import('./renderers/ImageRenderer')],
  ['image/gif',              () => import('./renderers/ImageRenderer')],
  ['video/mp4',              () => import('./renderers/VideoRenderer')],
  ['text/plain',             () => import('./renderers/TextRenderer')],
  ['application/javascript', () => import('./renderers/CodeRenderer')],
  // Office formats: browser can't render natively. Two options:
  //   1. Server-side conversion to PDF (recommended for enterprise - controlled, no 50MB WASM)
  //   2. LibreOffice WebAssembly client-side (~50MB, works offline)
])

function PreviewContainer({ file }: { file: FileNode }) {
  const [Renderer, setRenderer] = useState<React.ComponentType<RendererProps> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const factory = rendererRegistry.get(file.mimeType ?? '')
    if (!factory) { setLoading(false); return }

    factory()
      .then(mod => setRenderer(() => mod.default))
      .catch(setError)
      .finally(() => setLoading(false))
  }, [file.mimeType])

  if (loading) return <PreviewSkeleton />
  if (error)   return <PreviewError error={error} />
  if (!Renderer) return <UnsupportedFormat mimeType={file.mimeType} />
  return <Renderer file={file} />
}

// Preload on hover: when the user hovers a file, start downloading
// its renderer chunk so the preview feels instant when they click.
function FileCard({ file, onSelect }) {
  const prefetchRenderer = () => {
    const factory = rendererRegistry.get(file.mimeType ?? '')
    factory?.()  // trigger the dynamic import - browser caches the chunk
  }

  return (
    <div onMouseEnter={prefetchRenderer} onClick={() => onSelect(file)}>
      {file.name}
    </div>
  )
}`

const OPTIMISTIC_CODE = `// File operations should feel instant. Update the UI first,
// then confirm with the server, roll back on failure.

async function moveItems(ids: string[], targetFolderId: string) {
  // 1. Save previous state for rollback
  const previousParents = ids.map(id => ({
    id,
    parentId: store.get(id)!.parentId,
  }))

  // 2. Apply immediately to UI
  setStore(prev => {
    const next = new Map(prev)
    ids.forEach(id => {
      next.set(id, { ...next.get(id)!, parentId: targetFolderId })
    })
    return next
  })

  try {
    await api.moveItems(ids, targetFolderId)
  } catch {
    // 3. Rollback on failure
    setStore(prev => {
      const next = new Map(prev)
      previousParents.forEach(({ id, parentId }) => {
        next.set(id, { ...next.get(id)!, parentId })
      })
      return next
    })
    showToast('Move failed. Changes reverted.')
  }
}

// The same pattern applies to: rename, delete, create folder.
// Always: snapshot -> apply -> confirm/rollback.`

const ACCESSIBILITY_CODE = `// File tree: ARIA tree widget pattern (WCAG 2.1)
// Each folder is a treeitem with aria-expanded.
// Children are grouped under role="group".

<ul role="tree" aria-label="Files">
  <li
    role="treeitem"
    aria-expanded={isOpen}
    aria-level={1}
    aria-selected={isSelected}
    tabIndex={0}
    onKeyDown={handleKeyDown}
  >
    <span>Documents</span>
    {isOpen && (
      <ul role="group">
        <li role="treeitem" aria-level={2} tabIndex={-1}>
          report.pdf
        </li>
      </ul>
    )}
  </li>
</ul>

// Required keyboard navigation (WCAG 2.1 SC 2.1.1):
//
//   ArrowUp / ArrowDown  -- move focus between items
//   ArrowRight           -- expand folder (or move to first child if open)
//   ArrowLeft            -- collapse folder (or move to parent if closed)
//   Enter                -- open file / navigate into folder
//   F2                   -- rename (fire rename input)
//   Delete               -- delete (open confirmation)
//   Ctrl+A               -- select all in current folder
//
// File grid: role="grid" + role="row" + role="gridcell"
// Supports 2D keyboard navigation (arrow keys move between cells).
//
// Drag-and-drop is mouse-only by default - WCAG failure.
// Keyboard alternative: Ctrl+X to cut, navigate to target, Ctrl+V to move.`

export default function FileBrowserSystemDesignPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <p className="text-sm text-content-muted mb-2">System Design</p>
        <h1 className="text-4xl font-bold mb-4 text-content">File browser UI</h1>
        <p className="text-xl text-content-muted">
          Data model for a hierarchical file system, lazy-loading tree, virtualized list, file preview with dynamic renderer loading, optimistic mutations, and accessibility for enterprise-scale content management.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-lg font-semibold text-content mb-3">What we&apos;re building</h2>
        <FileBrowserMockup />
        <p className="text-content-muted text-sm mt-2">
          Three panels: a lazy-loading <strong className="text-content">SidebarTree</strong>, a virtualized <strong className="text-content">MainPanel</strong> file grid, and a <strong className="text-content">PreviewPanel</strong> with dynamically-loaded renderers. Each maps to a distinct architectural decision.
        </p>
      </div>

      <section id="the-challenge" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The Challenge</h2>
        <p className="text-content mb-4">
          A file browser looks straightforward until you hit the constraints of a real product. Folders contain thousands of items - you cannot render them all. The file tree can be dozens of levels deep - you cannot fetch it all upfront. Users expect file moves and renames to feel instant - you cannot wait for the server. Previewing 60+ file formats in a browser is a bundle-size disaster if you approach it naively. And the whole thing must be fully keyboard-navigable per WCAG 2.1 AA.
        </p>
        <p className="text-content mb-4">
          The scope here is a production-grade file browser: a sidebar tree with lazy-loading, a <Link href="/patterns/virtualized-lists" className="text-primary hover:underline">virtualized</Link> main panel, a file preview system with <Link href="/patterns/code-splitting-lazy-loading" className="text-primary hover:underline">dynamic renderer loading</Link>, <Link href="/patterns/optimistic-updates" className="text-primary hover:underline">optimistic updates</Link> for all mutations, and full keyboard accessibility. This is the architecture I&apos;d propose in a system design interview for any enterprise content management product.
        </p>
      </section>

      <section id="data-model" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Data Model</h2>
        <p className="text-content mb-4">
          The instinct is to model the file system as a nested JavaScript object - each folder has a <InlineCode>children</InlineCode> array containing its child folders and files. It feels natural. It breaks immediately when you try to update a deeply nested node: you have to clone every ancestor to maintain immutability, and the traversal to find the node is O(depth).
        </p>
        <p className="text-content mb-4">
          Use a <Link href="/patterns/normalized-state" className="text-primary hover:underline"><strong>flat map</strong></Link> instead. Every node - file or folder - lives at the top level of a <InlineCode>Map&lt;string, FileNode&gt;</InlineCode> keyed by ID. Folders store an array of child IDs, not child objects. Any node is an O(1) lookup. Any update is a single <InlineCode>map.set(id, updated)</InlineCode>. This is also the shape the Box Content API returns: a flat list of items under a folder ID, not a nested tree payload.
        </p>
        <CodeBlock code={DATA_MODEL_CODE} lang="ts" />
        <Callout variant="info" title="childrenLoaded tracks lazy-fetch state">
          <InlineCode>childrenLoaded: false</InlineCode> means we have not fetched this folder&apos;s children yet. <InlineCode>childrenLoaded: true</InlineCode> with a populated <InlineCode>childIds</InlineCode> array means the children are in the store. This flag is what makes collapse/expand fast - the second expand is a local Set toggle, not a network request.
        </Callout>
      </section>

      <section id="architecture-map" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Architecture Map</h2>
        <p className="text-content mb-6">
          Each surface in the file browser maps to a specific pattern or decision. This is the full picture before diving into each:
        </p>
        <Diagram className="mb-8" chart={`
flowchart LR
  subgraph UI["UI Layer"]
    ST["SidebarTree\\n(virtualized)"]
    MP["MainPanel\\n(FixedSizeList)"]
    PP["PreviewPanel\\n(lazy renderers)"]
  end
  subgraph State["State Layer"]
    RQ["React Query\\nper-folder cache"]
    LS["Local state\\nopenIds · selectedIds"]
  end
  API["Box API\\n/folders/:id/items"]
  FC["Box API\\n/files/:id/content"]
  URL["URL\\n?folder=id"]

  URL -->|source of truth| RQ
  URL -->|source of truth| LS
  RQ --> API
  ST --> RQ & LS
  MP --> RQ
  PP -.->|reads cached metadata| RQ
  PP -->|content stream| FC
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
                <td className="py-3 pr-6 font-medium text-content">File data store</td>
                <td className="py-3 pr-6">Flat Map by ID</td>
                <td className="py-3">O(1) lookup and update; no recursive traversal; maps to API response shape</td>
              </tr>
              <tr className="border-b border-content-border">
                <td className="py-3 pr-6 font-medium text-content">Tree children</td>
                <td className="py-3 pr-6">Lazy-fetch on first expand</td>
                <td className="py-3">Tree can be arbitrarily deep; fetch only what the user actually opens</td>
              </tr>
              <tr className="border-b border-content-border">
                <td className="py-3 pr-6 font-medium text-content">Current folder</td>
                <td className="py-3 pr-6">URL query param</td>
                <td className="py-3">Deep-linkable, back/forward works, React Query key auto-derived from URL</td>
              </tr>
              <tr className="border-b border-content-border">
                <td className="py-3 pr-6 font-medium text-content">File list (50k+ items)</td>
                <td className="py-3 pr-6">FixedSizeList (react-window)</td>
                <td className="py-3">Only render visible rows; DOM count stays ~30 regardless of folder size</td>
              </tr>
              <tr className="border-b border-content-border">
                <td className="py-3 pr-6 font-medium text-content">Sidebar tree (deep)</td>
                <td className="py-3 pr-6">Flatten visible nodes + FixedSizeList</td>
                <td className="py-3">react-window needs a flat array; flatten visible tree nodes in display order</td>
              </tr>
              <tr className="border-b border-content-border">
                <td className="py-3 pr-6 font-medium text-content">File preview</td>
                <td className="py-3 pr-6">Dynamic import registry by MIME type</td>
                <td className="py-3">Each renderer is a separate chunk; only download what the user opens</td>
              </tr>
              <tr className="border-b border-content-border">
                <td className="py-3 pr-6 font-medium text-content">Move / rename / delete</td>
                <td className="py-3 pr-6">Optimistic update + rollback</td>
                <td className="py-3">Instant UI; API confirms in background; snapshot enables reliable rollback</td>
              </tr>
              <tr className="border-b border-content-border">
                <td className="py-3 pr-6 font-medium text-content">Drag-and-drop</td>
                <td className="py-3 pr-6">HTML Drag and Drop API + Ctrl+X/V keyboard fallback</td>
                <td className="py-3">Drag is mouse-only (WCAG failure) without a keyboard alternative</td>
              </tr>
              <tr className="border-b border-content-border">
                <td className="py-3 pr-6 font-medium text-content">File tree ARIA</td>
                <td className="py-3 pr-6">role="tree" + role="treeitem" + aria-expanded</td>
                <td className="py-3">WCAG 2.1 tree widget pattern; arrow key navigation required</td>
              </tr>
              <tr className="border-b border-content-border">
                <td className="py-3 pr-6 font-medium text-content">File grid ARIA</td>
                <td className="py-3 pr-6">role="grid" + role="gridcell"</td>
                <td className="py-3">2D keyboard navigation (arrow keys between files)</td>
              </tr>
              <tr>
                <td className="py-3 pr-6 font-medium text-content">Thumbnails</td>
                <td className="py-3 pr-6">IntersectionObserver lazy load</td>
                <td className="py-3">Only request thumbnail images when they scroll into view</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="component-structure" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Component Structure and State Placement</h2>
        <p className="text-content mb-4">
          The file browser has three distinct panels that share minimal state. Keep them as separate subtrees - not a single monolithic component. The component decomposition and state placement rules:
        </p>
        <CodeBlock code={COMPONENT_TREE_CODE} lang="tsx" />
        <Callout variant="warning" title="Put the current folder ID in the URL">
          If the current folder is local React state, the back button and sharing a link break. The current folder is the primary navigation state of the app - it belongs in the URL as a query param or path segment. React Query then uses that ID as its query key: when the URL changes, the right data is already in cache or gets fetched.
        </Callout>
      </section>

      <section id="lazy-loading" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Lazy-Loading the Tree</h2>
        <p className="text-content mb-4">
          Fetching the entire file system tree on load is never the right approach. The tree can be arbitrarily deep, and the user will only expand a small fraction of it. Fetch children only when the user expands a folder for the first time. After that, toggle is a local operation. The file preview system applies the same principle to JS bundles; see{' '}
          <Link href="/patterns/code-splitting-lazy-loading" className="text-primary hover:underline">
            Code Splitting &amp; Lazy Loading
          </Link>
          .
        </p>
        <p className="text-content mb-4">
          The <InlineCode>childrenLoaded</InlineCode> flag on each node is the key. On expand: check the flag, skip the fetch if true, fetch and populate if false. The store gets immutably updated with the new children; the expanded folder ID goes into the open-IDs Set.
        </p>
        <CodeBlock code={LAZY_LOAD_CODE} lang="ts" />
        <Diagram className="my-6" chart={`
sequenceDiagram
  actor User
  participant Tree as SidebarTree
  participant Cache as React Query Cache
  participant API as Box API

  User->>Tree: Click expand folder
  Tree->>Cache: getQueryData(['folder', id])
  alt Already cached
    Cache-->>Tree: FileNode[] (instant, no network)
  else Not cached yet
    Tree->>Cache: prefetchQuery(['folder', id])
    Cache->>API: GET /folders/:id/items
    API-->>Cache: FileNode[]
    Cache-->>Tree: FileNode[]
  end
  Tree->>Tree: Add id to openIds Set (local toggle)
        `} />
        <Callout variant="info" title="Prefetch on hover">
          When the user hovers a closed folder, start the children fetch immediately. By the time they click the expand arrow, the data is already loading or in cache. One line: <InlineCode>queryClient.prefetchQuery(['folder', folderId])</InlineCode> on <InlineCode>onMouseEnter</InlineCode>.
        </Callout>
      </section>

      <section id="virtualization" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Virtualization</h2>
        <p className="text-content mb-4">
          A folder with 50,000 items cannot render 50,000 DOM nodes. The browser will hang on mount and scroll will be unusable. <Link href="/patterns/virtualized-lists" className="text-primary hover:underline">Virtualization</Link> is the only solution: render only the rows currently in the viewport.
        </p>
        <p className="text-content mb-4">
          For the flat file list in the main panel, <InlineCode>FixedSizeList</InlineCode> from <InlineCode>react-window</InlineCode> is a two-line integration. The sidebar tree is harder: react-window operates on flat arrays, but trees are hierarchical. The trick is to flatten the visible tree into a flat array in display order, re-computing it whenever a folder opens or closes. Feed that array to <InlineCode>FixedSizeList</InlineCode>.
        </p>
        <CodeBlock code={VIRTUALIZATION_CODE} lang="tsx" />
      </section>

      <section id="file-preview" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">File Preview System</h2>
        <p className="text-content mb-4">
          Supporting 60+ file formats without a massive initial bundle requires <Link href="/patterns/code-splitting-lazy-loading" className="text-primary hover:underline">dynamic imports</Link>. The naive approach - importing every renderer at the top of the file - ships all renderer code to every user, even if they only ever open JPEGs. A PDF renderer (pdf.js) alone is ~300KB gzipped.
        </p>
        <p className="text-content mb-4">
          Use a renderer registry: a <InlineCode>Map</InlineCode> from MIME type to a factory function that returns a dynamic import. Each renderer becomes a separate Webpack/Rollup chunk, downloaded only when that file type is first previewed. Pair this with hover-based prefetching so the renderer is already loading by the time the user clicks.
        </p>
        <CodeBlock code={PREVIEW_CODE} lang="tsx" />
        <Callout variant="info" title="PDF accessibility: text layer overlay">
          Rendering a PDF as a canvas gives sighted users a pixel-perfect preview, but screen readers see nothing. The fix: use pdf.js&apos;s <InlineCode>page.getTextContent()</InlineCode> to get the text layer, then render invisible <InlineCode>&lt;span&gt;</InlineCode> elements on top of the canvas at the correct positions. Screen readers read the spans; sighted users see the canvas. This is exactly how Google Docs and the Box preview handle PDFs.
        </Callout>
      </section>

      <section id="optimistic-updates" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Optimistic Mutations</h2>
        <p className="text-content mb-4">
          File operations - move, rename, delete, create folder - should feel instant. Waiting 300ms for a server round-trip before reflecting a drag-and-drop move breaks the mental model of a direct-manipulation interface.
        </p>
        <p className="text-content mb-4">
          The <Link href="/patterns/optimistic-updates" className="text-primary hover:underline">pattern</Link> is always the same: snapshot the current state, apply the change to local state immediately, fire the API call in the background, rollback to the snapshot if the API call fails. A <Link href="/patterns/toasts" className="text-primary hover:underline">toast</Link> surfaces the failure to the user. This is a three-step operation, not a two-step one - the snapshot is what makes rollback reliable.
        </p>
        <CodeBlock code={OPTIMISTIC_CODE} lang="ts" />
        <Callout variant="warning" title="Undo via command stack">
          Optimistic rollback handles API failure. For user-initiated undo (Ctrl+Z), you need a separate command stack: each mutation pushes an inverse operation onto the stack. Undo pops and applies the inverse. This is a separate concern from rollback - rollback is automatic on failure, undo is explicit and always available, even after a successful API call.
        </Callout>
      </section>

      <section id="accessibility" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Accessibility</h2>
        <p className="text-content mb-4">
          Enterprise products must meet WCAG 2.1 AA. A file browser has two distinct ARIA patterns: the sidebar is a <InlineCode>tree</InlineCode> widget (hierarchical, single-selection, expand/collapse), and the main panel is a <InlineCode>grid</InlineCode> widget (2D navigation). These are different keyboard patterns - mixing them up will confuse screen reader users.
        </p>
        <p className="text-content mb-4">
          The most overlooked requirement: <Link href="/patterns/drag-and-drop" className="text-primary hover:underline">drag-and-drop</Link> is mouse-only by default, which is a WCAG SC 2.1.1 failure. Always provide a keyboard equivalent. Cut/paste (Ctrl+X, navigate, Ctrl+V) or a &quot;Move to...&quot; dialog are both acceptable. The drag-and-drop UX is the enhancement on top, not the only path.
        </p>
        <CodeBlock code={ACCESSIBILITY_CODE} lang="tsx" />
      </section>

      <section id="building-blocks" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Building Blocks</h2>
        <p className="text-content-muted mb-6">
          The patterns and frameworks this system design applies.
        </p>

        <div className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-content-muted mb-3">Patterns used</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { href: '/patterns/normalized-state', title: 'Normalized State', desc: 'Flat Map<string, FileNode> store with O(1) lookup, update, and move without recursive traversal.' },
              { href: '/patterns/optimistic-updates', title: 'Optimistic Updates', desc: 'Move, rename, and delete reflect immediately; rollback on API failure.' },
              { href: '/patterns/virtualized-lists', title: 'Virtualized Lists', desc: 'Render only visible rows for folders with 50,000+ items.' },
              { href: '/patterns/code-splitting-lazy-loading', title: 'Code Splitting & Lazy Loading', desc: 'Each file renderer (PDF, video, image) is a separate chunk loaded on demand.' },
              { href: '/patterns/debouncing-throttling', title: 'Debouncing & Throttling', desc: 'Search-as-you-type debounced 300ms; prefetch throttled on hover.' },
              { href: '/patterns/infinite-scroll', title: 'Infinite Scroll', desc: 'Cursor-based pagination loads more files as the user scrolls near the bottom.' },
              { href: '/patterns/drag-and-drop', title: 'Drag-and-Drop', desc: 'File move via drag with optimistic reorder and keyboard Ctrl+X/V fallback.' },
              { href: '/patterns/loading-states', title: 'Loading States', desc: 'Skeleton rows in the file list; spinner on tree node expansion.' },
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
              { href: '/frameworks/state-architecture', title: 'State Architecture', desc: 'Server state in React Query, URL for navigation, local state for UI.' },
              { href: '/frameworks/data-fetching', title: 'Data Fetching & Sync', desc: 'React Query for folder contents; cursor-based pagination; prefetch on hover.' },
              { href: '/frameworks/rendering-strategy', title: 'Rendering Strategy', desc: 'Static shell with client-side tree; SSR for initial folder contents.' },
              { href: '/frameworks/performance-architecture', title: 'Performance Architecture', desc: 'Virtualization, dynamic imports for renderers, IntersectionObserver thumbnails.' },
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
            <h3 className="font-semibold text-content mb-2">Start with cursor-based pagination on day one</h3>
            <p className="text-content-muted">
              Offset pagination (<InlineCode>?offset=100&limit=50</InlineCode>) is easier to implement and breaks when items are inserted or deleted between page requests. If a file is added to the folder while the user is paginating, they either see a duplicate or miss an item. Cursor-based pagination is stable: the cursor points to a specific item, not a position. Migrating an existing API from offset to cursor pagination under load is painful work that is entirely avoidable.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-content mb-2">Model the store as a Map from the beginning, not an array or nested object</h3>
            <p className="text-content-muted">
              The temptation at the start is to store the current folder&apos;s contents as an array - it matches the API response shape and is easy to map over. The first time you need to update a specific file (rename, move-in, move-out), you convert it to a find-and-replace operation on the array. The second time, you add an index. By the third time, you have a de facto Map implemented badly. Start with the Map.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-content mb-2">Do not add virtualization until you have measured the problem</h3>
            <p className="text-content-muted">
              Virtualization complicates keyboard accessibility (focus management across unmounted items), breaks <InlineCode>Ctrl+F</InlineCode> in-page search for items not in the DOM, and makes item height estimation a source of scroll-jump bugs. Most folders have under 200 items - React handles 200 DOM nodes trivially. Measure on real devices with real data first. The performance win is real for power users with deep repositories, but do not pay the complexity cost until you have confirmed the user impact.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-content mb-2">React Query&apos;s cache is already a store; don&apos;t duplicate it into Zustand</h3>
            <p className="text-content-muted">
              A common pattern is to fetch folder children with React Query and then write the result into a separate Zustand normalized map. This creates two sources of truth for the same data. React Query already caches each folder&apos;s children by query key - that cache is the store. The only state you need beyond it is <InlineCode>openIds</InlineCode> (which folders are expanded) and <InlineCode>selectedIds</InlineCode> (which files are highlighted). Both are local <InlineCode>useState</InlineCode>. Zustand is only justified when you have cross-folder mutation state that needs to persist across navigation - a move operation that touches files visible in multiple query cache entries simultaneously. If the app is primarily read-heavy browsing, skip Zustand entirely and drive everything from the URL and React Query.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-content mb-2">Accessibility is architecture, not a late-stage addition</h3>
            <p className="text-content-muted">
              Retrofitting ARIA tree patterns and keyboard navigation onto an existing component tree is significantly harder than building them in from the start. The <InlineCode>role="tree"</InlineCode> pattern requires managed focus (only one item is in the tab order at a time), which changes the component&apos;s render structure. Drag-and-drop requiring a keyboard alternative changes the interaction model. Plan for these constraints before the first component renders, not during a compliance audit.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
