'use client'

import { type ReactNode, useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import { ProductFilterDemos } from '@/components/demos/ProductFilterDemos'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout } from '@/components/ui'

export interface Example {
  id: string
  title: string
  subtitle: string
  complexity: string
}

export interface ExampleContentItem {
  description: string
  explanation: string
  whenThisBreaks: string
}

/** Short labels for the visual progression strip (e.g. "Local", "URL"). Defaults derived from title. */
const DEFAULT_VISUAL_LABELS: Record<string, string> = {
  '01-local-state': 'Local',
  '02-lifted-state': 'Lifted',
  '03-url-state': 'URL',
  '04-server-state': 'Server',
  '05-global-state': 'Global',
}

interface ExampleViewerProps {
  examples: Example[]
  content: Record<string, ExampleContentItem & { code?: string }>
  codeBlocks?: ReactNode[]
  /** Optional short labels for the visual progression; keyed by example id. */
  visualLabels?: Record<string, string>
  /** When true, show a live preview next to the code (product filter demos). */
  showPreview?: boolean
}

export function ExampleViewer({ examples, content, codeBlocks, visualLabels, showPreview = false }: ExampleViewerProps) {
  const [activeExample, setActiveExample] = useState(examples[0].id)
  const [codeExpanded, setCodeExpanded] = useState(true)
  const [copied, setCopied] = useState(false)
  const activeIndex = examples.findIndex((e) => e.id === activeExample)
  const current = content[activeExample]
  const currentCodeBlock = activeIndex >= 0 && codeBlocks ? codeBlocks[activeIndex] : null
  const rawCode = current?.code
  const labels = visualLabels ?? DEFAULT_VISUAL_LABELS

  const renderedCodeBlock = currentCodeBlock || (rawCode ? <CodeBlock code={rawCode} lang="tsx" /> : null)

  const handleCopyCode = () => {
    if (rawCode == null) return
    void navigator.clipboard.writeText(rawCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Tabs.Root value={activeExample} onValueChange={setActiveExample}>
      {/* Visual progression: stages with active highlight */}
      <div className="flex items-center gap-0 mb-8 rounded-lg border border-content-border bg-content-bg p-4 overflow-x-auto">
        {examples.map((example, i) => {
          const isActive = example.id === activeExample
          const label = labels[example.id] ?? example.title
          return (
            <div key={example.id} className="flex items-center flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setActiveExample(example.id)}
                className={`
                  flex flex-col items-center gap-1.5 flex-1 min-w-0 py-2 px-3 rounded-md transition-colors
                  ${isActive ? 'ring-2 ring-offset-2 ring-primary bg-primary/10 text-primary' : 'text-content-muted hover:opacity-80'}
                `}
              >
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 ${
                    isActive ? 'bg-primary text-white' : 'bg-content-border text-content-muted'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-xs font-medium truncate w-full text-center">{label}</span>
              </button>
              {i < examples.length - 1 && (
                <div className="shrink-0 w-6 flex items-center justify-center text-content-border">
                  <span className="text-lg">→</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Tabs.Content value={activeExample} className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">
              {examples.find(e => e.id === activeExample)?.title}
            </h3>
            <span className="text-xs px-3 py-1 rounded-full bg-box-info-bg text-primary">
              {examples.find(e => e.id === activeExample)?.complexity}
            </span>
          </div>
          <p className="mb-4 text-content-muted">
            {examples.find(e => e.id === activeExample)?.subtitle}
          </p>
        </div>

        <div>
          <p className="mb-4 text-content">{current?.description}</p>
        </div>

        {showPreview ? (
          <div className="flex flex-col rounded-xl overflow-hidden border border-content-border bg-card-bg">
            {/* Preview on top - full width */}
            <div className="flex flex-col shrink-0 border-b border-content-border bg-preview-bg">
              <div className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider border-b border-content-border shrink-0 text-content-muted">
                Preview
              </div>
              <div className="min-h-[200px] p-4 flex items-center justify-center">
                <ProductFilterDemos variant={activeExample} />
              </div>
            </div>
            {/* Toolbar: Collapse code | Copy code */}
            <div className="flex items-center justify-between gap-4 px-4 py-2.5 border-b border-content-border shrink-0 bg-card-toolbar">
              <button
                type="button"
                onClick={() => setCodeExpanded((e) => !e)}
                className="flex items-center gap-2 rounded py-1.5 pr-2 transition-colors hover:opacity-90 text-content"
                title={codeExpanded ? 'Collapse code' : 'Expand code'}
              >
                {codeExpanded ? <ChevronUp size={16} strokeWidth={2.5} /> : <ChevronDown size={16} strokeWidth={2.5} />}
                <span className="text-sm font-semibold">
                  {codeExpanded ? 'Collapse code' : 'Expand code'}
                </span>
              </button>
              {rawCode != null && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={`flex items-center gap-2 rounded py-1.5 pl-2 transition-colors hover:opacity-90 ${
                    copied ? 'text-[hsl(142_56%_42%)]' : 'text-content'
                  }`}
                  title="Copy code"
                >
                  {copied ? <Check size={16} strokeWidth={2.5} /> : <Copy size={16} strokeWidth={2.5} />}
                  <span className="text-sm font-semibold">
                    {copied ? 'Copied' : 'Copy code'}
                  </span>
                </button>
              )}
            </div>
            {codeExpanded && (
              <div className="flex flex-col min-h-0 max-h-[420px] overflow-auto">
                <div className="p-4 min-h-0">{renderedCodeBlock}</div>
              </div>
            )}
          </div>
        ) : (
          <div>{renderedCodeBlock}</div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <Callout variant="success" title="Why this works">
            <div className="whitespace-pre-line">{current?.explanation}</div>
          </Callout>
          <Callout variant="warning" title="When this breaks">
            {current?.whenThisBreaks}
          </Callout>
        </div>

        {activeExample !== examples[examples.length - 1].id && (
          <div className="pt-4 border-t border-content-border">
            <button
              type="button"
              onClick={() => {
                const currentIndex = examples.findIndex(e => e.id === activeExample)
                if (currentIndex < examples.length - 1) {
                  setActiveExample(examples[currentIndex + 1].id)
                }
              }}
              className="font-medium text-sm hover:underline text-primary"
            >
              → See how this scales to the next level
            </button>
          </div>
        )}
      </Tabs.Content>
    </Tabs.Root>
  )
}
