import Link from 'next/link'
import { ArrowRight, Code2, Layers, Database, Zap, Layout, FolderTree } from 'lucide-react'
import { Button } from '@/components/ui'

const frameworks = [
  {
    id: 'state-architecture',
    title: 'State Architecture',
    question: 'Where does state live and why?',
    hotTake: 'URL state is the most underused pattern in modern React',
    icon: Database,
    complexity: 'Beginner → Production Scale',
  },
  {
    id: 'component-composition',
    title: 'Component Composition',
    question: 'How do components talk to each other?',
    hotTake: 'Render props are making a comeback for the right reasons',
    icon: Layers,
    complexity: 'Props → Headless Patterns',
  },
  {
    id: 'data-fetching',
    title: 'Data Fetching & Sync',
    question: 'How does UI stay in sync with backend?',
    hotTake: 'Most apps need optimistic updates earlier than you think',
    icon: Zap,
    complexity: 'useEffect → Real-time',
  },
  {
    id: 'rendering-strategy',
    title: 'Rendering Strategy',
    question: 'When does code run and where?',
    hotTake: 'SSR is overused; many apps would be better as SPA + CDN',
    icon: Code2,
    complexity: 'CSR → Streaming SSR',
  },
  {
    id: 'design-systems',
    title: 'Design System Architecture',
    question: 'How do we build reusable UI?',
    hotTake: 'Composition beats configuration for long-term flexibility',
    icon: Layout,
    complexity: 'Components → Themeable Primitives',
  },
  {
    id: 'code-organization',
    title: 'Code Organization',
    question: 'How do we prevent the big ball of mud?',
    hotTake: 'Feature folders scale better than technical layers',
    icon: FolderTree,
    complexity: 'Folders → Monorepo Packages',
  },
]

const contentClass = 'max-w-4xl mx-auto px-6 py-10'

export default function Home() {
  return (
    <div className="min-h-full bg-content-bg">
      <div className={contentClass}>
        {/* Hero Section */}
        <header className="pt-8 pb-12">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight text-content">
              How I Architect Frontend Systems That Scale
            </h1>
            <p className="text-lg max-w-3xl text-content-muted">
              Decision frameworks and patterns from building production applications.
              Not just what to use, but <em>when</em> and <em>why</em>.
            </p>
            <div className="flex gap-4">
              <Button asChild variant="primary" size="lg">
                <a href="#frameworks" className="inline-flex items-center gap-2">
                  Explore the frameworks
                  <ArrowRight size={16} />
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/patterns">
                  Quick Pattern Lookup
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Featured Framework Preview */}
        <section className="py-8 border-t border-content-border">
          <div className="rounded-xl border border-content-border p-6">
            <div className="flex items-start gap-4 mb-4">
              <Database className="mt-1 shrink-0 text-primary" size={24} />
              <div>
                <span className="text-sm font-medium text-primary">Featured Framework</span>
                <h2 className="text-2xl font-bold mt-1 text-content">State Architecture</h2>
              </div>
            </div>
            <p className="mb-4 text-content-muted">
              Where state lives isn&apos;t about choosing tools—it&apos;s about coordination costs and sources of truth.
              I once inherited a React app where a single form field triggered 47 re-renders. Here&apos;s how I think about state to prevent this.
            </p>
            <Link
              href="/frameworks/state-architecture"
              className="inline-flex items-center gap-2 font-medium hover:underline text-primary"
            >
              Read the full framework
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* Frameworks Grid */}
        <section id="frameworks" className="py-12 border-t border-content-border">
          <h2 className="text-2xl font-bold mb-6 text-content">The 6 Decision Frameworks</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {frameworks.map((framework) => {
              const Icon = framework.icon
              return (
                <Link
                  key={framework.id}
                  href={`/frameworks/${framework.id}`}
                  className="group rounded-lg border border-content-border p-5 transition-all hover:shadow-sm"
                >
                  <Icon className="mb-3 shrink-0 text-content-muted" size={22} />
                  <h3 className="font-bold mb-2 group-hover:underline text-primary">
                    {framework.title}
                  </h3>
                  <p className="text-sm mb-2 text-content-muted">
                    {framework.question}
                  </p>
                  <div className="text-sm italic mb-2 text-content-muted">
                    &quot;{framework.hotTake}&quot;
                  </div>
                  <div className="text-xs text-content-muted">
                    {framework.complexity}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* About Section */}
        <section className="py-12 border-t border-content-border">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold mb-4 text-content">Why I Built This</h2>
            <div className="space-y-4 text-content-muted">
              <p>
                After years of building frontend applications at scale, I found myself explaining
                the same architectural decisions over and over. Not just to interviewers, but to
                teammates, mentees, and my future self when revisiting old choices.
              </p>
              <p>
                This site is my answer: a living document of how I think about frontend architecture.
                Each framework represents patterns I&apos;ve learned, mistakes I&apos;ve made, and mental models
                that have proven useful in production.
              </p>
              <p>
                It&apos;s simultaneously my reference guide and my portfolio—documentation of technical
                depth through both explanation and implementation.
              </p>
            </div>
          </div>
        </section>

        <footer className="py-8 border-t border-content-border text-sm text-content-muted">
          © 2025 Frontend Architecture Frameworks
        </footer>
      </div>
    </div>
  )
}
