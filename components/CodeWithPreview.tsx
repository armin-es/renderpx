import { type ReactNode } from 'react'
import { CodeBlock } from '@/components/CodeBlock'
import { CodeBlockWithFiles, type CodeFile } from '@/components/CodeBlockWithFiles'
import { CodeWithPreviewToolbar } from '@/components/CodeWithPreviewToolbar'
import type { BundledLanguage } from 'shiki'

interface CodeWithPreviewPropsSingle {
  code: string
  files?: never
  lang?: BundledLanguage
  codeLabel?: string
}

interface CodeWithPreviewPropsMulti {
  code?: never
  files: CodeFile[]
  lang?: never
  codeLabel?: string
}

type CodeWithPreviewProps = (CodeWithPreviewPropsSingle | CodeWithPreviewPropsMulti) & {
  /** The live app / component to show next to the code */
  preview: ReactNode
  previewLabel?: string
  layout?: 'side-by-side' | 'stacked'
  className?: string
  /** @deprecated theme is now auto-detected from light/dark mode */
  theme?: never
}

export function CodeWithPreview(props: CodeWithPreviewProps) {
  const {
    codeLabel,
    preview,
    previewLabel = 'Preview',
    layout = 'side-by-side',
    className = '',
  } = props
  const code = 'code' in props ? props.code : undefined
  const files = 'files' in props ? props.files : undefined
  const lang = 'lang' in props ? props.lang ?? 'tsx' : 'tsx'

  const codePanel =
    files != null && files.length > 0 ? (
      <CodeBlockWithFiles
        files={files}
        label={codeLabel}
        className="rounded-none border-0 shadow-none h-full"
      />
    ) : (
      <CodeBlock
        code={code!}
        lang={lang}
        label={codeLabel}
        className="rounded-none border-0 shadow-none h-full"
      />
    )

  const previewSection = (
    <div
      className={`
        flex flex-col shrink-0 bg-preview-bg
        ${layout === 'side-by-side' ? 'min-h-[280px] lg:min-h-0 lg:border-l-0' : 'min-h-[200px]'}
      `}
    >
      <div className="px-4 py-2 text-[11px] font-medium uppercase tracking-wider border-b border-content-border shrink-0 text-content-muted">
        {previewLabel}
      </div>
      <div className="flex-1 p-6 overflow-auto flex items-center justify-center min-h-0">
        {preview}
      </div>
    </div>
  )

  const codeSection = (
    <div
      className={
        layout === 'side-by-side'
          ? 'lg:border-r border-content-border min-h-0 min-w-0 flex flex-col overflow-hidden'
          : 'min-w-0 overflow-hidden flex flex-col min-h-0'
      }
    >
      <div className={layout === 'stacked' ? 'flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col' : ''}>
        {codePanel}
      </div>
    </div>
  )

  if (layout === 'stacked') {
    return (
      <CodeWithPreviewToolbar
        previewSection={previewSection}
        codeSection={codeSection}
        rawCode={code ?? undefined}
        previewLabel={previewLabel}
        codeLabel={codeLabel}
        defaultCodeExpanded={true}
        className={className}
      />
    )
  }

  return (
    <div
      className={`
        rounded-xl overflow-hidden bg-card-bg
        ring-1 shadow-sm
        lg:grid lg:grid-cols-2 lg:min-h-[320px]
        ${className}
      `}
    >
      {codeSection}
      {previewSection}
    </div>
  )
}
