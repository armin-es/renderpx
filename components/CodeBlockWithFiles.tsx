import { CodeBlock } from '@/components/CodeBlock'
import { CodeBlockMultiFile } from '@/components/CodeBlockMultiFile'
import type { BundledLanguage } from 'shiki'

export interface CodeFile {
  name: string
  code: string
  lang?: BundledLanguage
}

interface CodeBlockWithFilesProps {
  files: CodeFile[]
  label?: string
  className?: string
}

/**
 * Renders multiple code files in a tabbed browser.
 * CodeBlock handles theme detection dynamically (light/dark).
 */
export function CodeBlockWithFiles({
  files,
  label,
  className = '',
}: CodeBlockWithFilesProps) {
  const fileNames = files.map((f) => f.name)
  const contents = files.map((f) => (
    <CodeBlock
      key={f.name}
      code={f.code}
      lang={f.lang ?? 'tsx'}
      inner={true}
    />
  ))

  return (
    <CodeBlockMultiFile
      fileNames={fileNames}
      contents={contents}
      label={label}
      className={className}
    />
  )
}
