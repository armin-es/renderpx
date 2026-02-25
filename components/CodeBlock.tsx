'use client'

import { useEffect, useState } from 'react'
import { codeToHast } from 'shiki'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import type { BundledLanguage, BundledTheme } from 'shiki'

interface CodeBlockProps {
  code: string
  lang?: BundledLanguage
  theme?: BundledTheme
  label?: string
  /** If true, render only the code content (no outer wrapper). Use when embedding in CodeBlockMultiFile. */
  inner?: boolean
  className?: string
}

export function CodeBlock({
  code,
  lang = 'tsx',
  theme,
  label,
  inner = false,
  className = '',
}: CodeBlockProps) {
  const [content, setContent] = useState<React.ReactNode>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const renderCode = async () => {
      try {
        setLoading(true)
        setError(null)

        // Detect current theme from CSS or system preference
        let resolvedTheme: BundledTheme = theme || 'github-dark'
        
        if (!theme) {
          const htmlElement = document.documentElement
          const currentTheme = htmlElement.classList.contains('theme-light')
            ? 'light'
            : htmlElement.classList.contains('theme-dark')
            ? 'dark'
            : window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          
          resolvedTheme = currentTheme === 'light' ? 'solarized-light' : 'github-dark'
        }

        const hast = await codeToHast(code.trim(), {
          lang,
          theme: resolvedTheme,
        })

        const rendered = toJsxRuntime(hast, {
          Fragment,
          jsx,
          jsxs,
          components: {
            pre: ({ children, style: shikiStyle, ...props }) =>
              jsx('pre', {
                ...props,
                className: 'p-0 m-0 min-w-max w-max',
                // Merge Shiki's theme styles (background, color) with our layout style
                style: { ...shikiStyle, whiteSpace: 'pre', backgroundColor: 'transparent' },
                children,
              }),
            code: ({ children, ...props }) =>
              jsx('code', {
                ...props,
                className: 'text-[12px] font-mono block leading-relaxed',
                style: { fontFamily: 'var(--font-mono), ui-monospace, monospace' },
                children,
              }),
          },
        })

        setContent(rendered)
        setLoading(false)
      } catch (err) {
        console.error('CodeBlock rendering error:', err)
        setError(err instanceof Error ? err.message : 'Failed to render code')
        setLoading(false)
      }
    }

    renderCode()
  }, [code, lang, theme])

  const codeContent = (
    <div className="code-block-content flex-1 p-4 overflow-x-auto overflow-y-auto text-[12px] min-h-0 min-w-0">
      {loading && <span style={{ opacity: 0.5 }}>Loading...</span>}
      {error && <span style={{ color: 'red' }}>Error: {error}</span>}
      {!loading && !error && content}
    </div>
  )

  if (inner) return codeContent

  return (
    <div
      className={`rounded-lg overflow-hidden min-h-0 min-w-0 flex flex-col border bg-code-bg border-content-border ${className}`}
    >
      {(label || lang) && (
        <div className="px-4 py-2.5 text-[11px] border-b border-content-border/40 font-semibold uppercase tracking-wider flex items-center gap-2 text-content">
          {label && <span>{label}</span>}
          <span className="opacity-85">{lang}</span>
        </div>
      )}
      {codeContent}
    </div>
  )
}
