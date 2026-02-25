import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const caseStudies = [
  {
    slug: 'reddit',
    title: 'Reddit',
    description: 'Feed architecture, nested comment threads, optimistic voting, real-time strategy, and performance for a high-traffic social platform.',
  },
]

export default function SystemDesignPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-6 py-10 bg-content-bg">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2 text-content">System Design</h1>
        <p className="text-content-muted">
          Frontend architecture for real products. Each case study covers data modeling, component structure, state strategy, and the trade-offs I&apos;d make if building it today.
        </p>
      </div>

      <div className="grid gap-3">
        {caseStudies.map((cs) => (
          <Link
            key={cs.slug}
            href={`/system-design/${cs.slug}`}
            className="group flex items-start justify-between border border-content-border rounded-lg p-5 hover:shadow-sm transition-all"
          >
            <div>
              <h2 className="font-bold text-primary mb-1 group-hover:underline">{cs.title}</h2>
              <p className="text-sm text-content-muted">{cs.description}</p>
            </div>
            <ArrowRight size={16} className="mt-1 ml-4 shrink-0 text-content-muted group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
