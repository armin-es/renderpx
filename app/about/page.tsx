import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'About — Armin Eslami',
  description: 'Senior Frontend Engineer with 8+ years building production React applications.',
}

export default function AboutPage() {
  return (
    <div className="min-h-full bg-content-bg">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <header className="pt-8 pb-10 border-b border-content-border">
          <h1 className="text-3xl font-bold tracking-tight text-content mb-2">Armin Eslami</h1>
          <p className="text-content-muted mb-6">Senior Frontend Engineer · Los Angeles, CA</p>
          <div className="flex items-center gap-4 text-sm">
            <a
              href="https://github.com/armin-es"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:underline"
            >
              GitHub ↗
            </a>
            <a
              href="https://www.linkedin.com/in/armin-eslami-845885231/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:underline"
            >
              LinkedIn ↗
            </a>
            <a href="mailto:armin.eslami@gmail.com" className="text-link hover:underline">
              armin.eslami@gmail.com
            </a>
          </div>
        </header>

        <section className="py-10 border-b border-content-border">
          <div className="space-y-4 text-content-muted leading-relaxed">
            <p>
              I&apos;m a senior frontend engineer with 8+ years building production web applications,
              specializing in React, Next.js, and TypeScript. Most of my work has been on complex,
              data-heavy UIs: security dashboards, risk platforms, real-time feeds. Architecture
              decisions in those contexts have real consequences on performance and maintainability.
            </p>
            <p>
              Most recently at Digg, where I shipped community discovery features ahead of a launch
              that grew the platform from a few thousand to 100,000+ users. Before that, led the
              Next.js rewrite of Coalition Control, a security posture dashboard serving 30,000+ users.
            </p>
          </div>
        </section>

        <section className="py-10">
          <h2 className="text-lg font-bold text-content mb-3">What this site is</h2>
          <p className="text-content-muted mb-6 leading-relaxed">
            renderpx is where I document the architectural decisions I make in production: the
            frameworks I use to think about state, data fetching, and rendering, and the
            implementation patterns I reach for when building real features.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-medium text-link hover:underline"
          >
            Explore the frameworks
            <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </div>
  )
}
