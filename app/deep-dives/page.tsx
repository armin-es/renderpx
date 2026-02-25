import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const deepDives = [
  {
    slug: 'state-management-internals',
    title: 'State Management Internals',
    description: 'How state management libraries actually work: useSyncExternalStore, Zustand\'s subscription model, and why Context causes re-renders.',
  },
  {
    slug: 'state-architecture-in-practice',
    title: 'State Architecture in Practice',
    description: 'Progressive complexity walkthrough - the same feature implemented at 5 increasing scales, from useState to Zustand.',
  },
  {
    slug: 'state-machines',
    title: 'State Machines',
    description: 'When boolean flags aren\'t enough. Modeling complex UI flows with explicit states and transitions.',
  },
  {
    slug: 'graphql-caching',
    title: 'GraphQL Caching',
    description: 'How Apollo and other clients normalize and cache GraphQL responses, and what breaks when the cache gets stale.',
  },
  {
    slug: 'useeffect-async-cleanup',
    title: 'useEffect & Async Cleanup',
    description: 'Why async effects need cleanup, how to cancel requests, and the patterns that prevent stale closures and race conditions.',
  },
]

export default function DeepDivesPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-6 py-10 bg-content-bg">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2 text-content">Deep Dives</h1>
        <p className="text-content-muted">
          How the tools actually work under the hood. Understanding internals makes debugging faster and architectural decisions more confident.
        </p>
      </div>

      <div className="grid gap-3">
        {deepDives.map((dd) => (
          <Link
            key={dd.slug}
            href={`/deep-dives/${dd.slug}`}
            className="group flex items-start justify-between border border-content-border rounded-lg p-5 hover:shadow-sm transition-all"
          >
            <div>
              <h2 className="font-bold text-primary mb-1 group-hover:underline">{dd.title}</h2>
              <p className="text-sm text-content-muted">{dd.description}</p>
            </div>
            <ArrowRight size={16} className="mt-1 ml-4 shrink-0 text-content-muted group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
