const POSTS = [
  { id: 'p1', sub: 'r/webdev', title: 'Show HN: I built a file browser in 2k LOC', author: 'armin_dev', score: 1203, comments: 87, age: '5h', selected: true },
  { id: 'p2', sub: 'r/programming', title: 'Why TypeScript strict mode is worth the pain', author: 'ts_fan', score: 4821, comments: 312, age: '12h' },
  { id: 'p3', sub: 'r/AskReddit', title: 'What was your biggest career mistake?', author: 'curious_cat', score: 28430, comments: 4891, age: '1d' },
]

const COMMENTS = [
  { id: 'c1', author: 'senior_dev', score: 892, text: 'The normalized state approach here is key — O(1) moves.', depth: 0 },
  { id: 'c2', author: 'react_fan', score: 234, text: 'Which virtualizer did you use for the tree?', depth: 1 },
  { id: 'c3', author: 'armin_dev', score: 156, text: 'react-window with a flattened tree array.', depth: 2 },
  { id: 'c4', author: 'skeptic_42', score: -8, text: 'Is this actually needed at that scale?', depth: 1 },
]

export function RedditMockup() {
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
          reddit.com / r/webdev
        </span>
      </div>

      <div className="flex" style={{ height: '216px' }}>

        {/* FeedList */}
        <div className="flex-1 min-w-0 border-r border-content-border flex flex-col">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary border-b border-content-border bg-primary/5">
            FeedList (useInfiniteQuery)
          </div>
          <div className="flex-1 overflow-hidden divide-y divide-content-border">
            {POSTS.map(p => (
              <div
                key={p.id}
                className={`flex gap-2 p-2 ${p.selected ? 'bg-primary/5' : ''}`}
              >
                {/* VoteButton */}
                <div className="flex flex-col items-center gap-0.5 shrink-0 w-10">
                  <div className="text-[9px] font-bold text-primary border border-primary/40 rounded px-1 py-0.5 leading-none">
                    Vote
                  </div>
                  <div className={`font-bold text-[11px] ${p.selected ? 'text-primary' : 'text-content'}`}>
                    {p.score >= 1000 ? `${(p.score / 1000).toFixed(1)}k` : p.score}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-content-muted mb-0.5">{p.sub}</div>
                  <div className={`font-semibold text-[11px] line-clamp-2 leading-snug ${p.selected ? 'text-primary' : 'text-content'}`}>
                    {p.title}
                  </div>
                  <div className="text-content-muted text-[10px] mt-0.5">
                    u/{p.author} · {p.age} · {p.comments} comments
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-2 py-1 text-[9px] text-content-muted border-t border-content-border leading-tight">
            cursor-paginated · staleTime 60s · prefetch on hover
          </div>
        </div>

        {/* CommentTree (post detail) */}
        <div className="w-56 flex flex-col shrink-0">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary border-b border-content-border bg-primary/5">
            CommentTree
          </div>
          <div className="flex-1 overflow-hidden p-2 space-y-2">
            {COMMENTS.map(c => (
              <div
                key={c.id}
                className="text-[10px]"
                style={{ paddingLeft: `${c.depth * 12}px` }}
              >
                <div
                  className={`${c.depth > 0 ? 'border-l-2 border-content-border pl-2' : ''}`}
                >
                  <div className="flex items-baseline gap-1.5 mb-0.5">
                    <span className="font-semibold text-primary">u/{c.author}</span>
                    <span className={`text-[9px] ${c.score < 0 ? 'text-red-400' : 'text-content-muted'}`}>
                      {c.score > 0 ? '+' : ''}{c.score}
                    </span>
                  </div>
                  <p className="text-content leading-snug">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-2 py-1 text-[9px] text-content-muted border-t border-content-border leading-tight">
            collapse: local useState · recursive render
          </div>
        </div>

      </div>
    </div>
  )
}
