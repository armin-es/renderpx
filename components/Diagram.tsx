'use client'

import { useEffect, useRef, useState } from 'react'

interface DiagramProps {
  chart: string
  className?: string
}

let idCounter = 0

export function Diagram({ chart, className }: DiagramProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string>('')
  const id = useRef(`mermaid-${++idCounter}`)

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        const mermaid = (await import('mermaid')).default
        const isDark = document.documentElement.classList.contains('theme-dark') ||
          (!document.documentElement.classList.contains('theme-light') &&
            window.matchMedia('(prefers-color-scheme: dark)').matches)

        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'neutral',
          themeVariables: isDark ? {
            background: 'hsl(0 0% 11%)',
            mainBkg: 'hsl(0 0% 16%)',
            nodeBorder: 'hsl(0 0% 28%)',
            clusterBkg: 'hsl(0 0% 14%)',
            titleColor: 'hsl(0 0% 95%)',
            edgeLabelBackground: 'hsl(0 0% 14%)',
            lineColor: 'hsl(0 0% 55%)',
            primaryColor: 'hsl(317 77% 30%)',
            primaryTextColor: 'hsl(0 0% 95%)',
            primaryBorderColor: 'hsl(317 77% 45%)',
            secondaryColor: 'hsl(0 0% 18%)',
            tertiaryColor: 'hsl(0 0% 18%)',
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
            fontSize: '13px',
          } : {
            background: 'hsl(0 0% 99%)',
            mainBkg: 'hsl(0 0% 97%)',
            nodeBorder: 'hsl(0 0% 82%)',
            clusterBkg: 'hsl(317 77% 55% / 0.06)',
            titleColor: 'hsl(0 0% 9%)',
            edgeLabelBackground: 'hsl(0 0% 99%)',
            lineColor: 'hsl(0 0% 55%)',
            primaryColor: 'hsl(317 77% 92%)',
            primaryTextColor: 'hsl(0 0% 9%)',
            primaryBorderColor: 'hsl(317 77% 55%)',
            secondaryColor: 'hsl(0 0% 96%)',
            tertiaryColor: 'hsl(0 0% 96%)',
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
            fontSize: '13px',
          },
        })

        const { svg: rendered } = await mermaid.render(id.current, chart.trim())
        if (!cancelled) setSvg(rendered)
      } catch (e) {
        if (!cancelled) setError(String(e))
      }
    }

    render()
    return () => { cancelled = true }
  }, [chart])

  if (error) return (
    <div className="text-sm text-red-500 p-4 border border-red-200 rounded">
      Diagram error: {error}
    </div>
  )

  if (!svg) return (
    <div className="h-32 flex items-center justify-center text-content-muted text-sm">
      Loading diagram…
    </div>
  )

  return (
    <div
      ref={ref}
      className={`overflow-x-auto rounded-lg border border-content-border bg-card-bg p-4 ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
