import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const FRAMEWORK_TITLES: Record<string, string> = {
  'component-composition': 'Component Composition',
  'data-fetching': 'Data Fetching & Sync',
  'rendering-strategy': 'Rendering Strategy',
  'design-systems': 'Design System Architecture',
  'code-organization': 'Code Organization',
}

export default function FrameworkComingSoonPage({
  params,
}: {
  params: { slug: string }
}) {
  const slug = params.slug
  const title = FRAMEWORK_TITLES[slug] ?? slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            All Frameworks
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-gray-600 mb-8">
          This framework is outlined and coming soon. The full decision framework, progressive examples, and production patterns will be added here.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Back to all frameworks
        </Link>
      </div>
    </div>
  )
}
