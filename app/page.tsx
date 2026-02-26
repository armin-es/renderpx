import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const sections = [
  {
    href: '/frameworks',
    label: 'Frameworks',
    description: 'Decision frameworks for architectural choices: where state lives, how components compose, when to use SSR.',
    meta: '7 frameworks',
  },
  {
    href: '/deep-dives',
    label: 'Deep Dives',
    description: 'How the tools actually work under the hood: useSyncExternalStore, React Compiler, context subscriptions.',
    meta: '5 deep dives',
  },
  {
    href: '/patterns',
    label: 'Patterns',
    description: 'Implementation patterns for recurring problems: optimistic updates, infinite scroll, cache invalidation.',
    meta: '10+ patterns',
  },
  {
    href: '/system-design',
    label: 'System Design',
    description: 'Frontend architecture for real products: data models, component structure, state strategy, performance.',
    meta: '1 case study',
  },
]

export default function Home() {
  return (
    <div className="min-h-full bg-content-bg">
      <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6">
        <header className="pt-8 pb-12">
          <div className="flex items-center gap-4 flex-wrap mb-6">
            <span className="font-medium text-content">Armin Eslami</span>
            <span className="text-content-muted">Senior Frontend Engineer</span>
            <div className="flex items-center gap-3 text-sm">
              <a href="https://github.com/armin-es" target="_blank" rel="noopener noreferrer" className="text-link hover:underline">GitHub</a>
              <a href="https://www.linkedin.com/in/armin-eslami-845885231/" target="_blank" rel="noopener noreferrer" className="text-link hover:underline">LinkedIn</a>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-content mb-4">
            How I Architect Frontend Systems
          </h1>
          <p className="text-lg text-content-muted max-w-2xl">
            Decision frameworks, implementation patterns, and system design case studies from building production React applications.
          </p>
        </header>

        <section className="grid sm:grid-cols-2 gap-4 pb-12 border-b border-content-border">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-lg border border-content-border p-5 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-primary group-hover:underline">{section.label}</h2>
                <ArrowRight size={16} className="text-content-muted group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm text-content-muted mb-3">{section.description}</p>
              <span className="text-xs text-content-muted">{section.meta}</span>
            </Link>
          ))}
        </section>

        <section className="py-12 max-w-2xl">
          <p className="text-content-muted">
            After years of building frontend applications at scale, I found myself explaining the same architectural decisions over and over - to teammates, mentees, and my future self when revisiting old choices. This site is my answer: a living reference for how I think about frontend architecture, written in the style of a tech talk: problem, naive approach, why it fails, production solution.
          </p>
        </section>

        <footer className="py-8 border-t border-content-border text-sm text-content-muted flex items-center justify-between flex-wrap gap-4">
          <span>© 2026 Armin Eslami</span>
          <div className="flex items-center gap-4">
            <a href="https://github.com/armin-es" target="_blank" rel="noopener noreferrer" className="hover:text-content transition-colors">GitHub</a>
            <a href="https://www.linkedin.com/in/armin-eslami-845885231/" target="_blank" rel="noopener noreferrer" className="hover:text-content transition-colors">LinkedIn</a>
          </div>
        </footer>
      </div>
    </div>
  )
}
