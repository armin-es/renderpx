import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'About — Armin Eslami',
  description: 'Senior Frontend Engineer with 8+ years building production React applications.',
}

export default function AboutPage() {
  return (
    <div className="min-h-full bg-content-bg">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <header className="pt-8 pb-12 border-b border-content-border">
          <h1 className="text-4xl font-bold tracking-tight text-content mb-3">Armin Eslami</h1>
          <p className="text-lg text-content-muted mb-6">Senior Frontend Engineer · Los Angeles, CA</p>
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
            <a
              href="mailto:armin.eslami@gmail.com"
              className="text-link hover:underline"
            >
              armin.eslami@gmail.com
            </a>
          </div>
        </header>

        <section className="py-10 border-b border-content-border">
          <div className="space-y-4 text-content-muted leading-relaxed">
            <p>
              I&apos;m a senior frontend engineer with 8+ years building production web applications,
              specializing in React, Next.js, and TypeScript. Most of my career has been spent on
              complex, data-heavy UIs — security dashboards, risk platforms, real-time feeds — where
              the architecture decisions have real consequences on performance, maintainability, and team velocity.
            </p>
            <p>
              I care about the reasoning behind decisions, not just the decisions themselves. This site
              is my attempt to document that reasoning: the frameworks I use to think about state,
              composition, data fetching, and rendering — and the patterns I reach for when building
              production features.
            </p>
          </div>
        </section>

        <section className="py-10 border-b border-content-border">
          <h2 className="text-xl font-bold text-content mb-8">Experience</h2>
          <div className="space-y-10">

            <div>
              <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
                <h3 className="font-bold text-content">Senior Frontend Engineer — Digg</h3>
                <span className="text-sm text-content-muted">Jan 2026 – Feb 2026 · Remote</span>
              </div>
              <ul className="space-y-2 text-content-muted text-sm">
                <li>Shipped community discovery and notification features ahead of a public launch that grew the platform from a few thousand to 100,000+ users within a month.</li>
                <li>Built a custom masonry grid integrating infinite query and virtualization to handle large dynamic content feeds at scale.</li>
                <li>Diagnosed a cache normalization problem in the React Query + GraphQL setup and contributed to the custom client cache that resolved stale UI state across shared components.</li>
              </ul>
            </div>

            <div>
              <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
                <h3 className="font-bold text-content">Senior Frontend Engineer — Coalition Inc.</h3>
                <span className="text-sm text-content-muted">Jul 2022 – Sep 2025 · Remote, San Francisco</span>
              </div>
              <ul className="space-y-2 text-content-muted text-sm">
                <li>Led the rewrite of the Coalition Control application in Next.js, React, and TypeScript — a security posture dashboard with interactive analytics serving 30,000+ users.</li>
                <li>Built a frontend component library on Material UI, packaged as an npm package and adopted across security applications to unify design and streamline development.</li>
                <li>Established AI-powered development workflows using Cursor and Claude Code, including custom localization scripts that cut per-language implementation time from days to under 1 hour.</li>
                <li>Designed and implemented an auto-generated TypeScript API SDK, reducing developer-written code by 25%.</li>
                <li>Built end-to-end testing with Playwright and monitoring with Datadog RUM and Sentry.</li>
              </ul>
            </div>

            <div>
              <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
                <h3 className="font-bold text-content">Senior Frontend Engineer — RepRisk</h3>
                <span className="text-sm text-content-muted">Jul 2019 – Jul 2022 · Toronto</span>
              </div>
              <ul className="space-y-2 text-content-muted text-sm">
                <li>Led a comprehensive rewrite of the core React application to Next.js, Node.js, and TypeScript.</li>
                <li>Architected a full-stack solution with a Node.js middleware server and GraphQL API, containerized with Docker.</li>
                <li>Built a centralized UI component library used across multiple applications.</li>
              </ul>
            </div>

          </div>
        </section>

        <section className="py-10 border-b border-content-border">
          <h2 className="text-xl font-bold text-content mb-4">Education</h2>
          <div className="space-y-2 text-content-muted text-sm">
            <p>Master of Applied Science in Engineering — Carleton University, Ottawa</p>
            <p>Master of Science in Engineering — KTH Royal Institute of Technology, Stockholm</p>
          </div>
        </section>

        <section className="py-10">
          <h2 className="text-xl font-bold text-content mb-6">What I&apos;m building here</h2>
          <p className="text-content-muted mb-6">
            renderpx is a living reference for the architectural decisions I make and the patterns I&apos;ve
            found most useful in production. Each framework is a structured way of thinking about a
            category of frontend problems — not just a list of best practices.
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
