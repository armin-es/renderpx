'use client'

import { type ReactNode, useState } from 'react'
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'

interface CodeWithPreviewToolbarProps {
  previewSection: ReactNode
  codeSection: ReactNode
  /** Raw code string for the Copy button (single file). Omit for multi-file. */
  rawCode?: string
  previewLabel?: string
  codeLabel?: string
  /** Default expanded state for the code block */
  defaultCodeExpanded?: boolean
  className?: string
}

export function CodeWithPreviewToolbar({
  previewSection,
  codeSection,
  rawCode,
  previewLabel = 'Preview',
  codeLabel = 'Code',
  defaultCodeExpanded = true,
  className = '',
}: CodeWithPreviewToolbarProps) {
  const [codeExpanded, setCodeExpanded] = useState(defaultCodeExpanded)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (rawCode == null) return
    void navigator.clipboard.writeText(rawCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={`rounded-xl overflow-hidden border border-content-border bg-card-bg flex flex-col ${className}`}>
      {/* Preview on top */}
      {previewSection}

      {/* Toolbar: Collapse code | Copy code */}
      <div className="flex items-center justify-between gap-4 px-4 py-2.5 border-t border-content-border bg-card-toolbar shrink-0">
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
            onClick={handleCopy}
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

      {/* Code section - collapsible */}
      {codeExpanded && (
        <div className="flex flex-col min-h-0 max-h-[420px] border-t border-content-border overflow-hidden">
          <div className="flex-1 min-h-0 overflow-auto">{codeSection}</div>
        </div>
      )}
    </div>
  )
}
