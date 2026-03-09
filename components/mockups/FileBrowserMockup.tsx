const TREE_NODES = [
  { id: 'docs', name: 'Documents', depth: 0, open: true },
  { id: 'proj', name: 'Projects', depth: 1, open: false },
  { id: 'design', name: 'Design', depth: 1, open: true },
  { id: 'logo', name: 'logo.svg', depth: 2, file: true },
  { id: 'ui', name: 'ui-kit.fig', depth: 2, file: true },
  { id: 'dl', name: 'Downloads', depth: 0, open: false },
  { id: 'desk', name: 'Desktop', depth: 0, open: false },
]

const FILES = [
  { name: 'report.pdf', ext: 'PDF', size: '2.4 MB', selected: true },
  { name: 'photo.jpg', ext: 'JPG', size: '4.1 MB' },
  { name: 'budget.xlsx', ext: 'XLS', size: '840 KB' },
  { name: 'notes.md', ext: 'MD', size: '12 KB' },
  { name: 'video.mp4', ext: 'MP4', size: '128 MB' },
  { name: 'data.csv', ext: 'CSV', size: '2.1 MB' },
]

export function FileBrowserMockup() {
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
          My Drive / Documents / Design
        </span>
      </div>

      <div className="overflow-x-auto">
      <div className="flex" style={{ height: '200px', minWidth: '520px' }}>

        {/* SidebarTree */}
        <div className="w-44 border-r border-content-border flex flex-col shrink-0">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary border-b border-content-border bg-primary/5">
            SidebarTree
          </div>
          <div className="flex-1 overflow-hidden p-1.5 space-y-px font-mono">
            {TREE_NODES.map(n => (
              <div
                key={n.id}
                className={`flex items-center gap-1 px-1 py-0.5 rounded text-[11px] ${
                  n.id === 'design' ? 'bg-primary/10 text-primary font-medium' : 'text-content'
                }`}
                style={{ paddingLeft: `${6 + n.depth * 12}px` }}
              >
                {n.file ? (
                  <span className="text-content-muted w-3">–</span>
                ) : n.open ? (
                  <span className="w-3">▾</span>
                ) : (
                  <span className="w-3">▸</span>
                )}
                <span className={n.file ? 'text-content-muted' : ''}>{n.name}</span>
              </div>
            ))}
          </div>
          <div className="px-2 py-1 text-[9px] text-content-muted border-t border-content-border leading-tight">
            lazy-load on expand · O(1) lookup
          </div>
        </div>

        {/* MainPanel */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary border-b border-content-border bg-primary/5">
            MainPanel
          </div>
          <div className="flex-1 overflow-hidden p-2">
            <div className="grid grid-cols-3 gap-1.5">
              {FILES.map(f => (
                <div
                  key={f.name}
                  className={`border rounded p-1.5 text-center ${
                    f.selected
                      ? 'border-primary/50 bg-primary/8 ring-1 ring-primary/20'
                      : 'border-content-border'
                  }`}
                >
                  <div className={`text-[10px] font-bold mb-0.5 ${f.selected ? 'text-primary' : 'text-content-muted'}`}>
                    {f.ext}
                  </div>
                  <div className="text-[10px] truncate text-content">{f.name}</div>
                  <div className="text-[9px] text-content-muted">{f.size}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="px-2 py-1 text-[9px] text-content-muted border-t border-content-border leading-tight">
            FixedSizeList · renders viewport only · O(1) node updates
          </div>
        </div>

        {/* PreviewPanel */}
        <div className="w-40 border-l border-content-border flex flex-col shrink-0">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary border-b border-content-border bg-primary/5">
            PreviewPanel
          </div>
          <div className="flex-1 overflow-hidden p-2 flex flex-col gap-2">
            <div className="h-20 bg-code-bg rounded border border-content-border flex flex-col items-center justify-center text-[10px] gap-1">
              <span className="text-content-muted">lazy renderer</span>
              <span className="text-[9px] text-content-muted/60 font-mono">pdf.js · ~300KB</span>
            </div>
            <div>
              <div className="font-semibold text-content text-[11px]">report.pdf</div>
              <div className="text-content-muted text-[10px]">2.4 MB · 14 pages</div>
              <div className="text-content-muted text-[10px]">Modified today</div>
            </div>
          </div>
          <div className="px-2 py-1 text-[9px] text-content-muted border-t border-content-border leading-tight">
            dynamic import per MIME type
          </div>
        </div>

      </div>
      </div>
    </div>
  )
}
