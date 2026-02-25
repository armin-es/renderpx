'use client'

import Link from 'next/link'

export function FrameworkNav() {
  const sections = [
    { id: 'the-problem', label: 'The Problem' },
    { id: 'decision-framework', label: 'Decision Framework' },
    { id: 'decision-matrix', label: 'Decision Matrix' },
    { id: 'progressive-examples', label: 'Progressive Examples' },
    { id: 'production-patterns', label: 'Production Patterns' },
    { id: 'hot-takes', label: 'Hot Takes' },
    { id: 'related-frameworks', label: 'Related Frameworks' },
  ]

  return (
    <nav className="w-64 shrink-0 sticky top-24 self-start hidden lg:block">
      <div className="text-sm font-medium text-gray-900 mb-3">State Architecture</div>
      <ul className="space-y-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="block text-sm text-gray-600 hover:text-gray-900 py-1"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-8 pt-8 border-t">
        <Link
          href="/"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← All Frameworks
        </Link>
      </div>
    </nav>
  )
}
