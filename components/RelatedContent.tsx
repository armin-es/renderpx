import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { RelatedItem } from '@/lib/related-content'

interface RelatedContentProps {
  items?: RelatedItem[]
  type: 'frameworks' | 'patterns' | 'deepDives'
}

const typeLabels = {
  frameworks: 'Related Frameworks',
  patterns: 'Related Patterns',
  deepDives: 'Related Deep Dives',
}

export function RelatedContent({ items, type }: RelatedContentProps) {
  if (!items || items.length === 0) return null

  return (
    <section className="mt-12 pt-8 border-t border-content-border">
      <h2 className="text-lg font-bold text-content mb-4">{typeLabels[type]}</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group block p-4 rounded-lg border border-content-border hover:shadow-sm hover:border-primary transition-all"
          >
            <div className="flex items-center justify-between gap-3 mb-1">
              <h3 className="font-medium text-primary group-hover:underline">{item.title}</h3>
              <ArrowRight size={16} className="text-content-muted group-hover:text-primary transition-colors flex-shrink-0" />
            </div>
            <p className="text-sm text-content-muted">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
