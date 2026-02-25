'use client'

import { type ReactNode } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { clsx } from 'clsx'

interface CodeBlockMultiFileProps {
  /** Display name per file (e.g. "App.tsx", "utils.ts") */
  fileNames: string[]
  /** Pre-rendered code content per file (use CodeBlock with inner=true from server) */
  contents: ReactNode[]
  /** Optional label left of the tabs (e.g. "Files") */
  label?: string
  className?: string
}

export function CodeBlockMultiFile({
  fileNames,
  contents,
  label,
  className = '',
}: CodeBlockMultiFileProps) {
  const defaultValue = fileNames[0] ?? ''

  return (
    <div
      className={clsx(
        'rounded-lg overflow-hidden border shadow-sm min-h-0 flex flex-col',
        className
      )}
      style={{ backgroundColor: 'hsl(var(--code-bg))', borderColor: 'hsl(var(--content-border))' }}
    >
      <Tabs.Root defaultValue={defaultValue} className="flex flex-col min-h-0 flex-1">
        <div
          className="shrink-0 px-4 py-2 text-xs font-mono flex items-center gap-2 border-b"
          style={{ color: 'hsl(var(--content-text-muted))', borderColor: 'hsl(var(--content-border) / 0.5)' }}
        >
          {label && <span style={{ color: 'hsl(var(--content-text-muted) / 0.9)' }}>{label}</span>}
          <Tabs.List className="flex gap-1 overflow-x-auto -mb-px min-w-0">
            {fileNames.map((name) => (
              <Tabs.Trigger
                key={name}
                value={name}
                className={clsx(
                  'px-3 py-1.5 rounded-t text-left text-xs font-mono whitespace-nowrap shrink-0',
                  'data-[state=active]:bg-white/15 data-[state=active]:text-white',
                  'data-[state=inactive]:text-white/60 hover:text-white/90',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30'
                )}
              >
                {name}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {fileNames.map((name, i) => (
            <Tabs.Content
              key={name}
              value={name}
              className="flex-1 min-h-0 overflow-auto p-4 data-[state=inactive]:hidden flex flex-col"
              forceMount
            >
              <div className="text-sm min-h-0">{contents[i]}</div>
            </Tabs.Content>
          ))}
        </div>
      </Tabs.Root>
    </div>
  )
}
