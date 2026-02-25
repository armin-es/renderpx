import './globals.css'
import type { Metadata } from 'next'
import { DocsShell } from '@/components/DocsShell'
import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'renderpx — Armin Eslami',
  description: 'Frontend architecture frameworks, patterns, and deep dives by Armin Eslami, Senior Frontend Engineer.',
  openGraph: {
    title: 'renderpx — Frontend Architecture by Armin Eslami',
    description: 'Decision frameworks and implementation patterns from 8+ years building production React applications.',
    url: 'https://renderpx.dev',
    siteName: 'renderpx',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'renderpx — Frontend Architecture by Armin Eslami',
    description: 'Decision frameworks and implementation patterns from 8+ years building production React applications.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');var e=document.documentElement;if(t==='light'){e.classList.add('theme-light');e.classList.remove('theme-dark');}else if(t==='dark'){e.classList.add('theme-dark');e.classList.remove('theme-light');}else{e.classList.remove('theme-light','theme-dark');}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <DocsShell>{children}</DocsShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
