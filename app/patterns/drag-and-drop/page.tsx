import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'
import { RelatedContent } from '@/components/RelatedContent'
import { patternRelations } from '@/lib/related-content'

const NAIVE_CODE = `// Native HTML drag events - mouse only, no touch, no keyboard
function DraggableList({ items, onReorder }: { items: Item[]; onReorder: (items: Item[]) => void }) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null) return
    const next = [...items]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(targetIndex, 0, moved)
    onReorder(next)
    setDragIndex(null)
  }

  return (
    <ul>
      {items.map((item, i) => (
        <li
          key={item.id}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(i)}
          style={{ opacity: dragIndex === i ? 0.4 : 1 }}
        >
          {item.label}
        </li>
      ))}
    </ul>
  )
}
// Problems: no touch/mobile support, no keyboard navigation,
// browser ghost image is ugly, no drop indicator between items,
// breaks inside scroll containers or overflow:hidden parents.`

const FIRST_IMPROVEMENT_CODE = `// dnd-kit: handles pointer + touch + keyboard, composable sensors
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableItem({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      {...attributes}
    >
      {/* Attach listeners to a dedicated handle, not the whole row,
          so clicks on buttons inside the item still work. */}
      <button {...listeners} aria-label="Drag to reorder" className="cursor-grab px-1">
        ⠿
      </button>
      {label}
    </li>
  )
}

function SortableList({ items, onReorder }: { items: Item[]; onReorder: (items: Item[]) => void }) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex(i => i.id === active.id)
    const newIndex = items.findIndex(i => i.id === over.id)
    onReorder(arrayMove(items, oldIndex, newIndex))
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <ul>
          {items.map(item => <SortableItem key={item.id} id={item.id} label={item.label} />)}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
// Better: works with touch and keyboard. Still missing: no visual
// drop indicator, no optimistic server sync, drag preview clips inside
// overflow:hidden parents.`

const PRODUCTION_CODE = `// Production: DragOverlay + optimistic reorder + rollback on error
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableList({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems)
  const [activeId, setActiveId] = useState<string | null>(null)
  const reorderMutation = useMutation({ mutationFn: saveOrder })

  // PointerSensor handles mouse + touch.
  // activationConstraint prevents accidental drags on click.
  // KeyboardSensor enables arrow-key reordering for accessibility.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex(i => i.id === active.id)
    const newIndex = items.findIndex(i => i.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)

    setItems(reordered)                        // optimistic update
    reorderMutation.mutate(reordered, {
      onError: () => setItems(items),          // rollback on failure
    })
  }

  const activeItem = items.find(i => i.id === activeId)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <ul>
          {items.map(item => <SortableItem key={item.id} item={item} />)}
        </ul>
      </SortableContext>

      {/* DragOverlay renders in a portal at document root so it
          is never clipped by overflow:hidden parents */}
      <DragOverlay>
        {activeItem ? <ItemCard item={activeItem} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}`

export default function DragAndDropPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">Drag-and-Drop</h1>
        <p className="text-xl text-content-muted">
          Reorderable lists with mouse, touch, and keyboard support. The browser&apos;s native drag API looks tempting but breaks on mobile and inside scroll containers. Use dnd-kit instead.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          Drag-and-drop feels simple until you need it to actually work. Developers reach for the browser&apos;s native <InlineCode>draggable</InlineCode> attribute and <InlineCode>onDragOver</InlineCode>/<InlineCode>onDrop</InlineCode> events, which work for basic mouse drag on desktop. But they break on iOS entirely (Safari ignores the touch events), produce an ugly browser ghost image, give no drop indicator, and clip when the parent has <InlineCode>overflow: hidden</InlineCode>. Rolling your own from raw pointer events is worse.
        </p>
        <p className="text-content">
          The real requirement is usually: reorder items in a list, show a drag preview that doesn&apos;t clip, work on touch and with keyboard, sync the new order to the server, and roll back if the mutation fails.
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          Native HTML drag events. Works for mouse on desktop; fails everywhere else.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          <InlineCode>dnd-kit</InlineCode> is the right library for React DnD in 2024+. It abstracts sensors (pointer, touch, keyboard) behind a composable API, handles ARIA announcements for accessibility, and gives you CSS transforms for smooth movement instead of browser ghost images. The <InlineCode>useSortable</InlineCode> hook wraps each item; <InlineCode>arrayMove</InlineCode> handles the reorder math; <InlineCode>SortableContext</InlineCode> coordinates the list.
        </p>
        <CodeBlock code={FIRST_IMPROVEMENT_CODE} lang="tsx" />
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li>
            <strong>No DragOverlay:</strong> The dragged item moves in-place using CSS transforms. If the parent has <InlineCode>overflow: hidden</InlineCode>, the dragged item clips. <InlineCode>DragOverlay</InlineCode> renders the preview in a portal at the document root, solving this.
          </li>
          <li>
            <strong>No optimistic server sync:</strong> Calling <InlineCode>onReorder</InlineCode> which triggers a React Query mutation will cause the list to revert to server state until the mutation settles. Store local order in <InlineCode>useState</InlineCode> and update it immediately; rollback on error.
          </li>
          <li>
            <strong>Clicks on interactive children:</strong> Without an <InlineCode>activationConstraint</InlineCode> on <InlineCode>PointerSensor</InlineCode>, a simple click on a button inside the row will trigger the drag. Add <InlineCode>distance: 8</InlineCode> so a drag only starts after 8px of movement.
          </li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          Combine <InlineCode>DragOverlay</InlineCode> for a portal-rendered preview, <InlineCode>PointerSensor</InlineCode> with activation constraint, <InlineCode>KeyboardSensor</InlineCode> for accessibility, local <InlineCode>useState</InlineCode> for optimistic reorder, and mutation rollback on error.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />
        <Callout variant="info" title="Database ordering">
          If order is persisted as an integer column, inserting between two items requires renumbering siblings. Use fractional indexing instead (each item&apos;s order is a string like <InlineCode>&quot;a0&quot;</InlineCode> that sorts lexicographically) so any insert is a single-row update. Libraries like <InlineCode>fractional-indexing</InlineCode> handle this.
        </Callout>
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Kanban boards:</strong> Card reorder within a column and cross-column moves (dnd-kit handles both with multiple <InlineCode>SortableContext</InlineCode> instances).</li>
          <li><strong>Block editors:</strong> Notion-style block reordering where any content block can be dragged above or below another.</li>
          <li><strong>Ordered lists with user preference:</strong> Saved search filters, dashboard widgets, playlist tracks.</li>
          <li><strong>Skip when:</strong> Items are sorted by a system criterion (date, score) the user can&apos;t override. Don&apos;t add drag interaction for its own sake.</li>
        </ul>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li>
            <strong>Attach listeners to a handle, not the whole row.</strong> If you spread <InlineCode>listeners</InlineCode> on the <InlineCode>&lt;li&gt;</InlineCode>, every click-inside becomes a potential drag start. Use a <InlineCode>&lt;button&gt;</InlineCode> with a grip icon as the handle.
          </li>
          <li>
            <strong>activationConstraint is not optional.</strong> Without <InlineCode>distance: 8</InlineCode>, clicking a button inside the row triggers the drag and swallows the click event. This causes confusing UX where buttons appear to not respond.
          </li>
          <li>
            <strong>DragOverlay vs in-place transform.</strong> The in-place CSS transform approach is fine for simple cases. Use <InlineCode>DragOverlay</InlineCode> whenever the list sits inside a scrollable container, a modal, or anything with <InlineCode>overflow: hidden</InlineCode>.
          </li>
          <li>
            <strong>dnd-kit + virtualized lists.</strong> There is a known incompatibility between <InlineCode>@dnd-kit/sortable</InlineCode> and TanStack Virtual: the virtualizer unmounts items that scroll out of view, which confuses the drop position calculation. The workaround is to overscan heavily during a drag (render more items outside the viewport) and reset overscan on drag end.
          </li>
          <li>
            <strong>Rollback needs a snapshot.</strong> Capture <InlineCode>items</InlineCode> before the optimistic update (e.g. <InlineCode>const prev = items</InlineCode>) so you have something to roll back to in <InlineCode>onError</InlineCode>. Closures capture stale state; use a ref if the mutation is async.
          </li>
        </ul>
      </section>

      <p className="text-content-muted text-sm mb-12">
        <Link href="/patterns/optimistic-updates" className="text-primary hover:underline">
          Optimistic Updates →
        </Link>
        {' · '}
        <Link href="/patterns/virtualized-lists" className="text-primary hover:underline">
          Virtualized Lists →
        </Link>
        {' · '}
        <Link href="/system-design/notion" className="text-primary hover:underline">
          Used in: Notion editor →
        </Link>
        {' · '}
        <Link href="/patterns" className="text-primary hover:underline">
          All patterns
        </Link>
      </p>

      <RelatedContent
        items={patternRelations['drag-and-drop']?.frameworks ?? []}
        type="frameworks"
      />
      <RelatedContent
        items={patternRelations['drag-and-drop']?.deepDives ?? []}
        type="deepDives"
      />
    </div>
  )
}
