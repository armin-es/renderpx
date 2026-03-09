const PAGES = [
  { id: 'overview', name: 'Project Overview', depth: 0, active: true },
  { id: 'api', name: 'API Design', depth: 0 },
  { id: 'components', name: 'Components', depth: 0 },
  { id: 'data', name: 'Data Model', depth: 1 },
  { id: 'state', name: 'State Management', depth: 1 },
]

type Block = {
  id: string
  type: 'heading1' | 'heading2' | 'paragraph' | 'bullet'
  content: string
  cursor?: boolean
}

const BLOCKS: Block[] = [
  { id: 'h1', type: 'heading1', content: 'Project Overview' },
  { id: 'p1', type: 'paragraph', content: 'Architecture for the new file management system using normalized state.' },
  { id: 'h2', type: 'heading2', content: 'Key Decisions' },
  { id: 'li1', type: 'bullet', content: 'Flat Map<id, Block> — not a nested tree' },
  { id: 'li2', type: 'bullet', content: 'Zustand for local mutations + React Query for persistence' },
  { id: 'li3', type: 'bullet', content: 'Yjs CRDT for real-time collaboration', cursor: true },
]

export function NotionMockup() {
  return (
    <div className="not-prose border border-content-border rounded-lg overflow-hidden text-xs select-none">
      {/* Window chrome */}
      <div className="bg-code-bg border-b border-content-border px-3 py-1.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/70 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/70 inline-block" />
        </div>
        <span className="text-content-muted text-[11px] flex-1 text-center">
          notion.so / workspace
        </span>
      </div>

      <div className="flex" style={{ height: '216px' }}>

        {/* PageNavigator sidebar */}
        <div className="w-40 border-r border-content-border flex flex-col shrink-0">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary border-b border-content-border bg-primary/5">
            PageNavigator
          </div>
          <div className="flex-1 overflow-hidden p-1.5 space-y-px">
            {PAGES.map(p => (
              <div
                key={p.id}
                className={`px-2 py-0.5 rounded text-[11px] truncate leading-relaxed ${
                  p.active ? 'bg-primary/10 text-primary font-medium' : 'text-content'
                }`}
                style={{ paddingLeft: `${8 + p.depth * 12}px` }}
              >
                ▪ {p.name}
              </div>
            ))}
          </div>
          <div className="px-2 py-1 text-[9px] text-content-muted border-t border-content-border leading-tight">
            page IDs in flat Map
          </div>
        </div>

        {/* BlockList / BlockRenderer */}
        <div className="flex-1 min-w-0 border-r border-content-border flex flex-col">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary border-b border-content-border bg-primary/5">
            BlockList → BlockRenderer
          </div>
          <div className="flex-1 overflow-hidden px-4 py-2 space-y-1">
            {BLOCKS.map(b => (
              <div
                key={b.id}
                className={`relative ${
                  b.type === 'heading1' ? 'text-[13px] font-bold text-content' :
                  b.type === 'heading2' ? 'text-[11px] font-semibold text-content mt-1' :
                  b.type === 'bullet' ? 'flex gap-1.5 text-[10px] text-content' :
                  'text-[10px] text-content leading-relaxed'
                }`}
              >
                {b.type === 'bullet' && <span className="text-content-muted shrink-0 mt-px">•</span>}
                <span
                  className={b.cursor ? 'border-r border-primary animate-pulse' : ''}
                >
                  {b.content}
                </span>
                <span className="absolute -left-4 top-0 text-[8px] text-content-muted/40 font-mono">
                  {b.id}
                </span>
              </div>
            ))}
          </div>
          <div className="px-2 py-1 text-[9px] text-content-muted border-t border-content-border leading-tight">
            switch on block.type · autosave on change
          </div>
        </div>

        {/* Store snapshot */}
        <div className="w-40 flex flex-col shrink-0">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary border-b border-content-border bg-primary/5">
            Zustand Store
          </div>
          <div className="flex-1 overflow-hidden p-2 font-mono">
            <div className="text-[9px] space-y-0.5 text-content-muted">
              <div>blocks: {'{'}</div>
              <div className="pl-2 text-content">h1: {'{'} heading1 {'}'}</div>
              <div className="pl-2 text-content">p1: {'{'} paragraph {'}'}</div>
              <div className="pl-2 text-content">h2: {'{'} heading2 {'}'}</div>
              <div className="pl-2 text-content">li1, li2,</div>
              <div className="pl-2 text-primary font-semibold">li3 ← cursor {'}'}</div>
              <div className="mt-1.5">rootBlockIds:</div>
              <div className="pl-2 text-content">['h1','p1'...</div>
              <div className="mt-1.5 text-green-500">● autosaving</div>
            </div>
          </div>
          <div className="px-2 py-1 text-[9px] text-content-muted border-t border-content-border leading-tight">
            flat Map&lt;id, Block&gt;
          </div>
        </div>

      </div>
    </div>
  )
}
