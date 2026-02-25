import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const frameworks = [
  {
    slug: 'state-architecture',
    title: 'State Architecture',
    description: 'Where state lives and why. Local, lifted, URL, server, and global state - the decision criteria for each.',
  },
  {
    slug: 'component-composition',
    title: 'Component Composition',
    description: 'How components communicate. Props, render props, compound components, and headless patterns.',
  },
  {
    slug: 'data-fetching',
    title: 'Data Fetching & Sync',
    description: 'How UI stays in sync with the backend. useEffect to React Query to real-time.',
  },
  {
    slug: 'rendering-strategy',
    title: 'Rendering Strategy',
    description: 'When code runs and where. CSR, SSR, SSG, ISR - the trade-offs and when each makes sense.',
  },
  {
    slug: 'design-systems',
    title: 'Design System Architecture',
    description: 'How to build reusable UI. Component APIs, theming, and the composition vs configuration trade-off.',
  },
  {
    slug: 'code-organization',
    title: 'Code Organization',
    description: 'How to prevent the big ball of mud. Feature folders, module boundaries, and monorepo structure.',
  },
  {
    slug: 'performance-architecture',
    title: 'Performance Architecture',
    description: 'Where performance problems actually come from and how to fix them systematically.',
  },
]

export default function FrameworksPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-6 py-10 bg-content-bg">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2 text-content">Frameworks</h1>
        <p className="text-content-muted">
          Decision frameworks for architectural choices. Not just what to use, but when and why - covering the trade-offs that matter in production.
        </p>
      </div>

      <div className="grid gap-3">
        {frameworks.map((fw) => (
          <Link
            key={fw.slug}
            href={`/frameworks/${fw.slug}`}
            className="group flex items-start justify-between border border-content-border rounded-lg p-5 hover:shadow-sm transition-all"
          >
            <div>
              <h2 className="font-bold text-primary mb-1 group-hover:underline">{fw.title}</h2>
              <p className="text-sm text-content-muted">{fw.description}</p>
            </div>
            <ArrowRight size={16} className="mt-1 ml-4 shrink-0 text-content-muted group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
