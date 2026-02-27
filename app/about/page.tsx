import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'About — Armin Eslami',
  description: 'Senior Frontend Engineer with 8+ years building production React applications.',
}

export default function AboutPage() {
  return (
    <div className="min-h-full bg-content-bg">
      <div className="max-w-2xl mx-auto px-4 py-10 sm:px-6">
        <header className="pt-8 pb-10 border-b border-content-border">
          <h1 className="text-3xl font-bold tracking-tight text-content mb-2">Armin Eslami</h1>
          <p className="text-content-muted mb-6">Senior Frontend Engineer · Los Angeles, CA</p>
          <div className="flex items-center gap-4 text-sm flex-wrap">
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
            <a
              href="/resume.pdf"
              download="Armin-Eslami-Resume.pdf"
              className="text-link hover:underline"
            >
              Resume ↓
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
          </div>
        </section>

        <section className="py-10 border-b border-content-border">
          <h2 className="text-lg font-bold text-content mb-6">Work Experience</h2>
          <div className="space-y-8">
            {/* Digg */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-bold text-content">Digg</h3>
                <span className="text-sm text-content-muted">Jan 2026 – Feb 2026</span>
              </div>
              <p className="text-sm text-content-muted mb-3">Senior Software Engineer (Front-End) · Remote</p>
              <ul className="space-y-2 text-content-muted text-sm">
                <li className="flex gap-3">
                  <span className="text-primary mt-0.5">→</span>
                  <span>Shipped community discovery and notification features ahead of a launch that grew the platform from a few thousand to 100,000+ users within a month.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-0.5">→</span>
                  <span>Built a custom masonry (Pinterest-style) grid layout integrating infinite query and existing virtualization to handle large, dynamic content feeds at scale.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-0.5">→</span>
                  <span>Diagnosed a cache normalization problem in the React Query + GraphQL setup and contributed to a custom client cache that resolved stale UI state across shared components.</span>
                </li>
              </ul>
            </div>

            {/* Coalition */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-bold text-content">Coalition Inc.</h3>
                <span className="text-sm text-content-muted">Jul 2022 – Sep 2025</span>
              </div>
              <p className="text-sm text-content-muted mb-3">Senior Software Engineer (Front-End) · Remote, San Francisco, CA</p>
              <ul className="space-y-2 text-content-muted text-sm">
                <li className="flex gap-3">
                  <span className="text-primary mt-0.5">→</span>
                  <span>Led the rewrite of Coalition Control in Next.js, React, and TypeScript, delivering a security posture dashboard with interactive analytics serving 30,000+ users.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-0.5">→</span>
                  <span>Built a frontend component library on Material UI, packaged as an npm package and adopted across security applications to unify design and streamline development.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-0.5">→</span>
                  <span>Established AI-powered development workflows using Cursor and Claude Code, including custom localization scripts that cut per-language implementation time from days to under 1 hour.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-0.5">→</span>
                  <span>Designed and implemented an auto-generated TypeScript API SDK, reducing developer-written code by 25% and significantly improving the development experience.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-0.5">→</span>
                  <span>Developed and integrated an end-to-end testing framework with Playwright and comprehensive monitoring solutions (Datadog RUM, Sentry) to establish a robust CI/CD workflow.</span>
                </li>
              </ul>
            </div>

            {/* RepRisk */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-bold text-content">RepRisk North America Inc.</h3>
                <span className="text-sm text-content-muted">Jul 2019 – Jul 2022</span>
              </div>
              <p className="text-sm text-content-muted mb-3">Senior Software Engineer (Front-End) · Toronto, ON</p>
              <ul className="space-y-2 text-content-muted text-sm">
                <li className="flex gap-3">
                  <span className="text-primary mt-0.5">→</span>
                  <span>Led the comprehensive rewrite of the core React application to a modern stack utilizing Next.js, Node.js, and TypeScript, significantly enhancing performance and maintainability.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-0.5">→</span>
                  <span>Architected a full-stack solution with a Node.js middleware server and GraphQL API, and containerized the application using Docker, optimizing scalability and deployment efficiency.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary mt-0.5">→</span>
                  <span>Developed a centralized company UI library of reusable components, which streamlined development workflows and ensured consistent user experiences across multiple applications.</span>
                </li>
              </ul>
            </div>
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
