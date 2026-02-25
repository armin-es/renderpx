'use client'

import { useState } from 'react'
import { Book, Zap, Pencil } from 'lucide-react'

type ViewMode = 'learn' | 'reference' | 'notes'

interface ViewToggleProps {
  frameworkId: string
  currentView?: ViewMode
  onViewChange?: (view: ViewMode) => void
}

export function ViewToggle({
  frameworkId,
  currentView = 'learn',
  onViewChange
}: ViewToggleProps) {
  const [view, setView] = useState<ViewMode>(currentView)

  const handleViewChange = (newView: ViewMode) => {
    setView(newView)
    onViewChange?.(newView)
  }

  const views = [
    {
      id: 'learn' as ViewMode,
      label: 'Learn',
      icon: Book,
      description: 'Full framework explanation',
    },
    {
      id: 'reference' as ViewMode,
      label: 'Quick Ref',
      icon: Zap,
      description: 'Decision matrix & code snippets',
    },
    {
      id: 'notes' as ViewMode,
      label: 'My Notes',
      icon: Pencil,
      description: 'Personal project history',
    },
  ]

  return (
    <div className="border-b bg-white sticky top-16 z-10">
      <div className="flex gap-1 px-6">
        {views.map((v) => {
          const Icon = v.icon
          const isActive = view === v.id

          return (
            <button
              key={v.id}
              onClick={() => handleViewChange(v.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium
                border-b-2 transition-colors
                ${isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }
              `}
            >
              <Icon size={16} />
              {v.label}
            </button>
          )
        })}
      </div>

      <div className="px-6 py-2 bg-gray-50 border-t">
        <p className="text-xs text-gray-600">
          {views.find(v => v.id === view)?.description}
        </p>
      </div>
    </div>
  )
}
