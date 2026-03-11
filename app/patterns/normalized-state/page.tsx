import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'
import { RelatedContent } from '@/components/RelatedContent'
import { patternRelations } from '@/lib/related-content'

const NAIVE_CODE = `// Nested tree - the intuitive shape
type CommentThread = {
  id: string
  text: string
  author: string
  replies: CommentThread[]  // ← recursive children embedded inline
}

// Works fine until you need to update one comment
function updateComment(thread: CommentThread, id: string, newText: string): CommentThread {
  if (thread.id === id) return { ...thread, text: newText }
  return {
    ...thread,
    replies: thread.replies.map(reply => updateComment(reply, id, newText)),
    // ↑ Recursive traversal every time. Deep trees = O(depth) copies.
  }
}

// Same problem for a file tree, org chart, or category hierarchy.
// Adding a node, moving a node, or checking if a node exists all require
// walking the tree. And the entire tree re-renders on any update.`

const IMMUTABLE_CASCADE_CODE = `// Immutable update in a nested tree - you must clone every ancestor
// Tree: root → Documents → Projects → file.txt (renaming the file)

const newRoot = {
  ...root,                          // ← clone root (new reference)
  children: root.children.map(node =>
    node.id !== 'documents' ? node : {
      ...node,                      // ← clone Documents
      children: node.children.map(node =>
        node.id !== 'projects' ? node : {
          ...node,                  // ← clone Projects
          children: node.children.map(node =>
            node.id !== 'file' ? node : { ...node, name: 'renamed.txt' }
            //                           ↑ clone the actual target
          )
        }
      )
    }
  )
}
// Result: 4 new objects for 1 rename. A 10-level tree = 10 new objects.
// And because root is a new reference, every component subscribed
// to root re-renders - even the ones that display unrelated folders.`

const FIRST_IMPROVEMENT_CODE = `// Flat map - every node lives at the top level, keyed by ID
type Comment = {
  id: string
  text: string
  author: string
  childIds: string[]  // ← IDs only, not embedded objects
}

type CommentStore = Map<string, Comment>

// O(1) lookup - no traversal
const comment = store.get(id)

// O(1) update - one map entry replaced
function updateComment(store: CommentStore, id: string, newText: string): CommentStore {
  const next = new Map(store)
  next.set(id, { ...store.get(id)!, text: newText })
  return next
}

// Add a reply - no tree traversal, just add the child ID to the parent
function addReply(store: CommentStore, parentId: string, reply: Comment): CommentStore {
  const next = new Map(store)
  next.set(reply.id, reply)
  const parent = store.get(parentId)!
  next.set(parentId, { ...parent, childIds: [...parent.childIds, reply.id] })
  return next
}`

const PRODUCTION_CODE = `// Full normalized store with a root IDs list and Zustand
import { create } from 'zustand'

type FileNode = {
  id: string
  name: string
  type: 'file' | 'folder'
  parentId: string | null
  childIds: string[]
  childrenLoaded: boolean
}

type FileStore = {
  nodes: Map<string, FileNode>
  rootIds: string[]

  // Selectors
  getNode: (id: string) => FileNode | undefined
  getChildren: (parentId: string) => FileNode[]

  // Mutations - all O(1)
  upsertNode: (node: FileNode) => void
  moveNode: (nodeId: string, newParentId: string) => void
  deleteNode: (nodeId: string) => void
  markChildrenLoaded: (folderId: string, children: FileNode[]) => void
}

export const useFileStore = create<FileStore>((set, get) => ({
  nodes: new Map(),
  rootIds: [],

  getNode: (id) => get().nodes.get(id),

  getChildren: (parentId) => {
    const { nodes } = get()
    const parent = nodes.get(parentId)
    if (!parent) return []
    return parent.childIds.map(id => nodes.get(id)).filter(Boolean) as FileNode[]
  },

  upsertNode: (node) =>
    set(s => ({ nodes: new Map(s.nodes).set(node.id, node) })),

  moveNode: (nodeId, newParentId) =>
    set(s => {
      const next = new Map(s.nodes)
      const node = next.get(nodeId)!
      const oldParent = next.get(node.parentId!)!
      const newParent = next.get(newParentId)!

      // Remove from old parent
      next.set(oldParent.id, {
        ...oldParent,
        childIds: oldParent.childIds.filter(id => id !== nodeId),
      })
      // Add to new parent
      next.set(newParent.id, {
        ...newParent,
        childIds: [...newParent.childIds, nodeId],
      })
      // Update node's own parentId
      next.set(nodeId, { ...node, parentId: newParentId })

      return { nodes: next }
    }),

  deleteNode: (nodeId) =>
    set(s => {
      const next = new Map(s.nodes)
      const node = next.get(nodeId)!

      // Remove from parent's childIds
      if (node.parentId) {
        const parent = next.get(node.parentId)!
        next.set(parent.id, {
          ...parent,
          childIds: parent.childIds.filter(id => id !== nodeId),
        })
      }

      // Delete the node itself (deep delete would recurse childIds)
      next.delete(nodeId)
      return { nodes: next }
    }),

  markChildrenLoaded: (folderId, children) =>
    set(s => {
      const next = new Map(s.nodes)
      // Insert all children into the flat map
      children.forEach(c => next.set(c.id, c))
      // Update the folder's childIds and mark loaded
      const folder = next.get(folderId)!
      next.set(folderId, {
        ...folder,
        childIds: children.map(c => c.id),
        childrenLoaded: true,
      })
      return { nodes: next }
    }),
}))`

const SELECTOR_CODE = `// Granular selectors prevent unnecessary re-renders
// Each component subscribes only to the node(s) it needs

function FileRow({ nodeId }: { nodeId: string }) {
  // Re-renders ONLY when this specific node changes
  const node = useFileStore(s => s.nodes.get(nodeId))
  if (!node) return null
  return <div>{node.name}</div>
}

function FolderTree({ folderId }: { folderId: string }) {
  // Re-renders when this folder's childIds change (not when unrelated nodes update)
  const childIds = useFileStore(s => s.nodes.get(folderId)?.childIds ?? [])
  return (
    <ul>
      {childIds.map(id => <FileRow key={id} nodeId={id} />)}
    </ul>
  )
}

// Compare to the nested approach: any update anywhere in the tree
// would re-render the root - because the root object reference changes.`

export default function NormalizedStatePatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          Normalized State
        </h1>
        <p className="text-xl text-content-muted">
          Store every entity in a flat map keyed by ID instead of nesting objects. Updates become O(1), traversal disappears, and re-renders become granular.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          Hierarchical data (comment threads, file trees, org charts, category taxonomies) feels natural to model as nested objects - a comment has <InlineCode>replies</InlineCode>, a folder has <InlineCode>children</InlineCode>. The structure matches how you&apos;d draw it on a whiteboard.
        </p>
        <p className="text-content mb-4">
          It breaks down the first time you need to update a node deep in the tree. Finding it requires a recursive walk. Updating it immutably requires copying every ancestor from the root down. Moving a node between parents is a multi-step mutation that&apos;s easy to get wrong - and you typically want it to feel instant, which means pairing it with <Link href="/patterns/optimistic-updates" className="text-primary hover:underline">optimistic updates</Link>. And because the root object reference changes on any update, everything subscribed to the root re-renders.
        </p>
        <p className="text-content">
          The fix: don&apos;t nest. Put every node in a flat <InlineCode>Map&lt;string, Node&gt;</InlineCode> keyed by ID, and replace embedded children with arrays of child IDs.
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          Nested objects mirror the logical structure but make every mutation a recursive traversal.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="ts" />
        <p className="text-content mt-4 mb-4">
          The second cost is the clone cascade. To update <InlineCode>node.name</InlineCode> immutably, every ancestor from the root down to that node must be copied - otherwise their references don't change and React sees no update:
        </p>
        <CodeBlock code={IMMUTABLE_CASCADE_CODE} lang="ts" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          Replace the nested tree with a flat map. Children become arrays of IDs, not embedded objects. Every read and write becomes a map operation.
        </p>
        <CodeBlock code={FIRST_IMPROVEMENT_CODE} lang="ts" />
        <p className="text-content mt-4 text-sm">
          <strong>Why this helps:</strong> Lookup, insert, update, and delete are now all O(1) regardless of tree depth. No recursive traversal. Moving a node is three <InlineCode>map.set()</InlineCode> calls.
        </p>
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Root entry point:</strong> A flat map has no implicit root. You need a separate <InlineCode>rootIds: string[]</InlineCode> array to know which nodes are top-level.</li>
          <li><strong>Orphan cleanup:</strong> Deleting a folder does not automatically delete its descendants in the map. You need to walk <InlineCode>childIds</InlineCode> recursively on delete if you want a clean store.</li>
          <li><strong>Re-render granularity:</strong> If components subscribe to the whole map, every update still triggers a full re-render. Selectors scoped to a single node ID fix this - see the Granular selectors section below.</li>
          <li><strong>API response mismatch:</strong> Some APIs return nested trees. You need a normalize step on fetch to flatten them into the map before storing.</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          A Zustand store with a <InlineCode>Map&lt;string, FileNode&gt;</InlineCode> and named mutation methods. Each method touches only the nodes it needs - no full-tree copies.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="ts" />
        <Callout variant="info" title="This is how Apollo and Redux Toolkit normalize too">
          Apollo Client&apos;s normalized cache and Redux Toolkit&apos;s <InlineCode>createEntityAdapter</InlineCode> use the same principle: a flat map of entities keyed by ID, with selectors that derive structure on read. The pattern predates React - it&apos;s how relational databases work.
        </Callout>
      </section>

      <section id="granular-selectors" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Granular selectors</h2>
        <p className="text-content mb-4">
          Normalization only pays off on re-renders if components subscribe to individual nodes, not the whole map. Each row subscribes to its own ID - renaming one file only re-renders that row, not the entire tree.
        </p>
        <CodeBlock code={SELECTOR_CODE} lang="tsx" />
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Use:</strong> Any data that is hierarchical or relational - comment threads, <Link href="/system-design/file-browser" className="text-primary hover:underline">file trees</Link>, org charts, nested categories, <Link href="/system-design/notion" className="text-primary hover:underline">block-based documents (Notion)</Link>, navigation menus with submenus.</li>
          <li><strong>Use:</strong> When multiple parts of the UI reference the same entity by ID (e.g. a user card appears in a post, in a comment, and in a sidebar).</li>
          <li><strong>Skip:</strong> Simple flat lists with no relations - a <InlineCode>Post[]</InlineCode> array is fine if you&apos;re never looking up a post by ID or updating individual posts.</li>
          <li><strong>Skip:</strong> Read-only data that is fetched and displayed once with no mutations - normalization is about update ergonomics, not read ergonomics.</li>
        </ul>
        <Callout variant="info" title="Decision" className="mt-4">
          If you catch yourself writing a recursive find/update function, switch to a normalized map. That&apos;s the tell.
        </Callout>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Normalize on ingest, not on render:</strong> Flatten the API response as soon as it arrives. Never store a nested tree and flatten on read - you lose the O(1) update benefit and pay the traversal cost on every render.</li>
          <li><strong>Deep delete:</strong> When deleting a subtree, collect all descendant IDs first (one pass down via <InlineCode>childIds</InlineCode>), then delete them all in a single map update. Don&apos;t delete the parent first - you&apos;ll lose the child ID list.</li>
          <li><strong>Referential equality in selectors:</strong> <InlineCode>useFileStore(s =&gt; s.nodes.get(id))</InlineCode> returns a stable reference as long as that node hasn&apos;t changed. If you derive an array (e.g. <InlineCode>getChildren</InlineCode>), the new array is a new reference every call - memoize it with <InlineCode>useMemo</InlineCode> or use a library like <InlineCode>reselect</InlineCode>. See <Link href="/patterns/memoization" className="text-primary hover:underline">Memoization</Link>.</li>
          <li><strong>Circular references:</strong> Each node stores its <InlineCode>parentId</InlineCode> alongside <InlineCode>childIds</InlineCode>. This is fine for traversal but means a move operation must update three nodes atomically - don&apos;t forget to update the node&apos;s own <InlineCode>parentId</InlineCode>.</li>
        </ul>
      </section>

      <p className="text-content-muted text-sm mb-8">
        <Link href="/system-design/file-browser" className="text-primary hover:underline">
          File Browser system design →
        </Link>
        {' · '}
        <Link href="/patterns/optimistic-updates" className="text-primary hover:underline">
          Optimistic Updates pattern
        </Link>
        {' · '}
        <Link href="/patterns" className="text-primary hover:underline">
          All patterns
        </Link>
      </p>

      <RelatedContent
        items={patternRelations['normalized-state']?.frameworks}
        type="frameworks"
      />
      <RelatedContent
        items={patternRelations['normalized-state']?.deepDives}
        type="deepDives"
      />
    </div>
  )
}
