'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'
import { useEffect, useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'

const FRAMEWORKS = [
  { id: 'state-architecture', label: 'State Architecture' },
  { id: 'component-composition', label: 'Component Composition' },
  { id: 'data-fetching', label: 'Data Fetching & Sync' },
  { id: 'rendering-strategy', label: 'Rendering Strategy' },
  { id: 'design-systems', label: 'Design System Architecture' },
  { id: 'code-organization', label: 'Code Organization' },
  { id: 'performance-architecture', label: 'Performance Architecture' },
]

const DEEP_DIVES = [
  { id: 'state-management-internals', label: 'State Management Internals' },
  { id: 'state-architecture-in-practice', label: 'State Architecture in Practice' },
  { id: 'state-machines', label: 'State Machines' },
  { id: 'graphql-caching', label: 'GraphQL Caching' },
  { id: 'useeffect-async-cleanup', label: 'useEffect & Async Cleanup' },
]

const PATTERNS = [
  { id: 'optimistic-updates', label: 'Optimistic Updates' },
  { id: 'infinite-scroll', label: 'Infinite Scroll' },
  { id: 'debouncing-throttling', label: 'Debouncing & Throttling' },
  { id: 'form-validation', label: 'Form Validation' },
  { id: 'loading-states', label: 'Loading States' },
  { id: 'error-boundaries', label: 'Error Boundaries' },
  { id: 'cache-invalidation', label: 'Cache Invalidation' },
  { id: 'polling-vs-websockets', label: 'Polling vs WebSockets' },
  { id: 'multi-step-forms', label: 'Multi-Step Forms' },
  { id: 'virtualized-lists', label: 'Virtualized Lists' },
  { id: 'stale-while-revalidate', label: 'Stale-While-Revalidate' },
  { id: 'autosave-draft', label: 'Autosave / Draft' },
  { id: 'dependent-fields', label: 'Dependent Fields' },
  { id: 'toasts', label: 'Toasts' },
  { id: 'modal-management', label: 'Modal Management' },
  { id: 'compound-components', label: 'Compound Components' },
  { id: 'render-props-vs-hooks', label: 'Render Props vs Hooks' },
  { id: 'controlled-vs-uncontrolled', label: 'Controlled vs Uncontrolled' },
  { id: 'hocs-vs-composition', label: 'HOCs vs Composition' },
  { id: 'code-splitting-lazy-loading', label: 'Code Splitting & Lazy Loading' },
  { id: 'memoization', label: 'Memoization' },
]

const STATE_ARCH_SECTIONS = [
  { id: 'the-problem', label: 'The Problem' },
  { id: 'the-solution', label: 'The Solution' },
  { id: 'when-narrowing-fails', label: 'When Narrowing Fails' },
  { id: 'react-compiler', label: 'React Compiler Impact' },
  { id: 'decision-framework', label: 'Decision Framework' },
  { id: 'decision-matrix', label: 'Decision Matrix' },
  { id: 'in-practice', label: 'See It In Practice' },
  { id: 'production-patterns', label: 'Production Patterns' },
  { id: 'hot-takes', label: 'Hot Takes' },
  { id: 'real-rollout', label: 'A Real Rollout' },
  { id: 'related-frameworks', label: 'Related Frameworks' },
]

const COMPONENT_COMP_SECTIONS = [
  { id: 'the-problem', label: 'The Problem' },
  { id: 'the-solution', label: 'The Solution' },
  { id: 'the-framework', label: 'The Framework' },
  { id: 'decision-matrix', label: 'Decision Matrix' },
  { id: 'progressive-complexity', label: 'Progressive Complexity' },
  { id: 'production-patterns', label: 'Production Patterns' },
  { id: 'hot-takes', label: 'Hot Takes' },
  { id: 'real-rollout', label: 'A Real Rollout' },
  { id: 'related-frameworks', label: 'Related Frameworks' },
]

const DATA_FETCHING_SECTIONS = [
  { id: 'the-problem', label: 'The Problem' },
  { id: 'the-solution', label: 'The Immediate Fix' },
  { id: 'react-query', label: 'React Query' },
  { id: 'the-framework', label: 'The Framework' },
  { id: 'decision-matrix', label: 'Decision Matrix' },
  { id: 'progressive-complexity', label: 'Progressive Complexity' },
  { id: 'production-patterns', label: 'Production Patterns' },
  { id: 'real-rollout', label: 'A Real Rollout' },
  { id: 'hot-takes', label: 'Hot Takes' },
  { id: 'related-frameworks', label: 'Related Frameworks' },
]

const RENDERING_STRATEGY_SECTIONS = [
  { id: 'the-problem', label: 'The Problem' },
  { id: 'rendering-modes', label: 'The Five Modes' },
  { id: 'the-framework', label: 'The Framework' },
  { id: 'decision-matrix', label: 'Decision Matrix' },
  { id: 'progressive-complexity', label: 'Progressive Complexity' },
  { id: 'production-patterns', label: 'Production Patterns' },
  { id: 'real-rollout', label: 'A Real Rollout' },
  { id: 'hot-takes', label: 'Hot Takes' },
  { id: 'related-frameworks', label: 'Related Frameworks' },
]

const DESIGN_SYSTEMS_SECTIONS = [
  { id: 'the-problem', label: 'The Problem' },
  { id: 'the-solution', label: 'Three Layers' },
  { id: 'design-tokens', label: 'Design Tokens' },
  { id: 'variant-system', label: 'Variant System' },
  { id: 'headless-primitives', label: 'Headless Primitives' },
  { id: 'decision-matrix', label: 'Decision Matrix' },
  { id: 'progressive-complexity', label: 'Progressive Complexity' },
  { id: 'production-patterns', label: 'Production Patterns' },
  { id: 'real-rollout', label: 'A Real Rollout' },
  { id: 'portfolio-applied', label: 'Applied to This Portfolio' },
  { id: 'hot-takes', label: 'Hot Takes' },
  { id: 'related-frameworks', label: 'Related Frameworks' },
]

const CODE_ORG_SECTIONS = [
  { id: 'the-problem', label: 'The Problem' },
  { id: 'the-framework', label: 'The Framework' },
  { id: 'decision-matrix', label: 'Decision Matrix' },
  { id: 'progressive-examples', label: 'Progressive Examples' },
  { id: 'production-patterns', label: 'Production Patterns' },
  { id: 'real-rollout', label: 'A Real Rollout' },
  { id: 'hot-takes', label: 'Hot Takes' },
  { id: 'related-frameworks', label: 'Related Frameworks' },
]

const PERFORMANCE_ARCH_SECTIONS = [
  { id: 'the-problem', label: 'The Problem' },
  { id: 'the-triangle', label: 'The Performance Triangle' },
  { id: 'the-framework', label: 'The Framework' },
  { id: 'decision-matrix', label: 'Decision Matrix' },
  { id: 'render-demo', label: 'Re-renders in Action' },
  { id: 'bundle-demo', label: 'Bundle Splitting in Action' },
  { id: 'progressive-examples', label: 'Progressive Examples' },
  { id: 'production-patterns', label: 'Production Patterns' },
  { id: 'hot-takes', label: 'Hot Takes' },
  { id: 'real-rollout', label: 'A Real Rollout' },
  { id: 'related-frameworks', label: 'Related Frameworks' },
]

const PATTERN_DETAIL_SECTIONS = [
  { id: 'problem', label: 'Problem' },
  { id: 'naive-approach', label: 'Naive Approach' },
  { id: 'first-improvement', label: 'First Improvement' },
  { id: 'remaining-issues', label: 'Remaining Issues' },
  { id: 'production-pattern', label: 'Production Pattern' },
  { id: 'when-i-use-this', label: 'When I Use This' },
  { id: 'gotchas', label: 'Gotchas' },
]

const STATE_MACHINES_SECTIONS = [
  { id: 'the-problem', label: 'The Problem' },
  { id: 'discriminated-unions', label: 'Discriminated Unions' },
  { id: 'use-reducer', label: 'useReducer' },
  { id: 'xstate', label: 'XState' },
  { id: 'the-forms-trap', label: 'The Forms Trap' },
  { id: 'decision', label: 'Decision' },
]

const USEEFFECT_CLEANUP_SECTIONS = [
  { id: 'the-race-condition', label: 'The Race Condition' },
  { id: 'fix-cancelled-flag', label: 'Fix 1: Cancelled Flag' },
  { id: 'fix-abortcontroller', label: 'Fix 2: AbortController' },
  { id: 'what-you-still-need', label: 'What You Still Need' },
  { id: 'when-to-use-useeffect', label: 'When to Still Use useEffect' },
]

const GRAPHQL_CACHING_SECTIONS = [
  { id: 'the-problem', label: 'The Problem' },
  { id: 'query-invalidation', label: 'Query Invalidation' },
  { id: 'normalized-cache', label: 'Normalized Cache' },
  { id: 'the-antipattern', label: 'The Antipattern' },
  { id: 'decision', label: 'Decision' },
]

const STATE_MGMT_INTERNALS_SECTIONS = [
  { id: 'the-core-question', label: 'The Core Question' },
  { id: 'usesyncexternalstore', label: 'useSyncExternalStore' },
  { id: 'how-zustand-uses-it', label: 'How Zustand Uses It' },
  { id: 'context-vs-external-store', label: 'Context vs External Store' },
  { id: 'before-usesyncexternalstore', label: 'Before useSyncExternalStore' },
  { id: 'selector-patterns', label: 'Selector Patterns' },
]

const STATE_ARCH_PRACTICE_SECTIONS = [
  { id: 'progressive-complexity', label: 'Progressive Complexity' },
  { id: 'production-patterns', label: 'Production Patterns' },
  { id: 'decision-signals', label: 'Decision Signals' },
]

const sectionLabelClass =
  'px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-sidebar-text border-b border-sidebar-border pb-2'

const navLinkBase = 'block px-3 py-2 rounded-md transition-colors'
const navLinkActive = 'text-primary font-medium'
const navLinkInactive = 'text-sidebar-text-muted hover:text-sidebar-text hover:bg-black/5'

const navAnchorBase = 'block px-3 py-1.5 rounded-md text-xs transition-colors'
const navAnchorActive = 'font-medium text-primary'
const navAnchorInactive = 'text-sidebar-text-muted hover:text-sidebar-text hover:bg-black/5'

function CollapsibleSection({
  label,
  isActive,
  children,
}: {
  label: string
  isActive: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (isActive) setOpen(true)
  }, [isActive])

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-sidebar-text border-b border-sidebar-border pb-2 hover:opacity-70 transition-opacity"
      >
        <span>{label}</span>
        <ChevronDown size={10} className={`transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && children}
    </div>
  )
}

function SidebarNav() {
  const pathname = usePathname()

  const isPatterns = pathname === '/patterns'
  const isPatternDetail = pathname?.startsWith('/patterns/') && pathname !== '/patterns'
  const isStateArch = pathname === '/frameworks/state-architecture'
  const isComponentComp = pathname === '/frameworks/component-composition'
  const isDataFetching = pathname === '/frameworks/data-fetching'
  const isRenderingStrategy = pathname === '/frameworks/rendering-strategy'
  const isDesignSystems = pathname === '/frameworks/design-systems'
  const isCodeOrg = pathname === '/frameworks/code-organization'
  const isPerformanceArch = pathname === '/frameworks/performance-architecture'
  const isStateMachines = pathname === '/deep-dives/state-machines'
  const isUseEffectCleanup = pathname === '/deep-dives/useeffect-async-cleanup'
  const isGraphqlCaching = pathname === '/deep-dives/graphql-caching'
  const isStateMgmtInternals = pathname === '/deep-dives/state-management-internals'
  const isStateArchPractice = pathname === '/deep-dives/state-architecture-in-practice'

  const isFramework = isStateArch || isComponentComp || isDataFetching || isRenderingStrategy || isDesignSystems || isCodeOrg || isPerformanceArch
  const isDeepDive = isStateMachines || isUseEffectCleanup || isGraphqlCaching || isStateMgmtInternals || isStateArchPractice

  return (
    <nav className="flex flex-col gap-6 text-sm">
      <CollapsibleSection label="Frameworks" isActive={isFramework}>
        <ul className="space-y-0.5">
          {FRAMEWORKS.map((fw) => {
            const href = `/frameworks/${fw.id}`
            const active = pathname === href
            return (
              <li key={fw.id}>
                <Link
                  href={href}
                  className={`${navLinkBase} ${active ? navLinkActive : navLinkInactive}`}
                >
                  {fw.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </CollapsibleSection>

      <CollapsibleSection label="Patterns" isActive={isPatterns || isPatternDetail}>
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/patterns"
              className={`${navLinkBase} ${isPatterns ? navLinkActive : navLinkInactive}`}
            >
              All Patterns
            </Link>
          </li>
          {PATTERNS.map((p) => {
            const href = `/patterns/${p.id}`
            const active = pathname === href
            return (
              <li key={p.id}>
                <Link
                  href={href}
                  className={`${navLinkBase} ${active ? navLinkActive : navLinkInactive}`}
                >
                  {p.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </CollapsibleSection>

      <CollapsibleSection label="Deep Dives" isActive={isDeepDive}>
        <ul className="space-y-0.5">
          {DEEP_DIVES.map((dd) => {
            const href = `/deep-dives/${dd.id}`
            const active = pathname === href
            return (
              <li key={dd.id}>
                <Link
                  href={href}
                  className={`${navLinkBase} ${active ? navLinkActive : navLinkInactive}`}
                >
                  {dd.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </CollapsibleSection>

      <div>
        <Link
          href="/about"
          className="block px-3 mb-3 text-[10px] font-bold uppercase tracking-widest border-b border-sidebar-border pb-2 transition-opacity hover:opacity-70 text-sidebar-text"
        >
          About
        </Link>
      </div>

    </nav>
  )
}

function RightSidebar() {
  const pathname = usePathname()
  const [activeId, setActiveId] = useState<string>('')

  const isStateArch = pathname === '/frameworks/state-architecture'
  const isComponentComp = pathname === '/frameworks/component-composition'
  const isDataFetchingRight = pathname === '/frameworks/data-fetching'
  const isRenderingStrategyRight = pathname === '/frameworks/rendering-strategy'
  const isDesignSystemsRight = pathname === '/frameworks/design-systems'
  const isCodeOrgRight = pathname === '/frameworks/code-organization'
  const isPerformanceArchRight = pathname === '/frameworks/performance-architecture'
  const isPatternDetailRight = pathname?.startsWith('/patterns/') && pathname !== '/patterns'
  const isStateMachinesRight = pathname === '/deep-dives/state-machines'
  const isUseEffectCleanupRight = pathname === '/deep-dives/useeffect-async-cleanup'
  const isGraphqlCachingRight = pathname === '/deep-dives/graphql-caching'
  const isStateMgmtInternalsRight = pathname === '/deep-dives/state-management-internals'
  const isStateArchPracticeRight = pathname === '/deep-dives/state-architecture-in-practice'
  const sections = isPatternDetailRight
    ? PATTERN_DETAIL_SECTIONS
    : isStateArch
    ? STATE_ARCH_SECTIONS
    : isComponentComp
    ? COMPONENT_COMP_SECTIONS
    : isDataFetchingRight
    ? DATA_FETCHING_SECTIONS
    : isRenderingStrategyRight
    ? RENDERING_STRATEGY_SECTIONS
    : isDesignSystemsRight
    ? DESIGN_SYSTEMS_SECTIONS
    : isCodeOrgRight
    ? CODE_ORG_SECTIONS
    : isPerformanceArchRight
    ? PERFORMANCE_ARCH_SECTIONS
    : isStateMachinesRight
    ? STATE_MACHINES_SECTIONS
    : isUseEffectCleanupRight
    ? USEEFFECT_CLEANUP_SECTIONS
    : isGraphqlCachingRight
    ? GRAPHQL_CACHING_SECTIONS
    : isStateMgmtInternalsRight
    ? STATE_MGMT_INTERNALS_SECTIONS
    : isStateArchPracticeRight
    ? STATE_ARCH_PRACTICE_SECTIONS
    : null

  useEffect(() => {
    if (!sections) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-50% 0px -50% 0px' }
    )

    sections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [sections])

  if (!sections) return null

  return (
    <aside className="hidden lg:flex flex-col w-48 shrink-0 border-l border-sidebar-border bg-sidebar-bg sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-6 px-4 text-sm">
      <div className={sectionLabelClass}>On this page</div>
      <nav className="space-y-1">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={`${navAnchorBase} ${activeId === section.id ? navAnchorActive : navAnchorInactive}`}
          >
            {section.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}

export function DocsShell({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-sidebar-border bg-header-bg shrink-0 flex items-center h-14 px-4 gap-6">
        <button
          type="button"
          className="lg:hidden p-1 -ml-1 text-header-text-muted hover:text-header-text transition-colors"
          onClick={() => setMobileMenuOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link
          href="/"
          className="font-bold text-header-text hover:opacity-90 transition-opacity"
        >
          renderpx
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-header-text-muted hover:text-header-text">
            Frameworks
          </Link>
          <Link href="/patterns" className="text-header-text-muted hover:text-header-text">
            Patterns
          </Link>
          <Link
            href="/deep-dives/state-management-internals"
            className="text-header-text-muted hover:text-header-text"
          >
            Deep Dives
          </Link>
          <Link href="/about" className="text-header-text-muted hover:text-header-text">
            About
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-xs text-header-text-muted">
            <a href="https://github.com/armin-es" target="_blank" rel="noopener noreferrer" className="hover:text-header-text transition-colors">GitHub</a>
            <a href="https://www.linkedin.com/in/armin-eslami-845885231/" target="_blank" rel="noopener noreferrer" className="hover:text-header-text transition-colors">LinkedIn</a>
          </div>
          <div className="flex items-center gap-1 text-xs text-header-text-muted">
            {(['light', 'auto', 'dark'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`px-2 py-1 rounded capitalize ${
                  theme === t
                    ? 'bg-white/20 text-header-text'
                    : 'hover:bg-white/10 hover:text-header-text'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {/* TODO: implement command palette search
          <div className="flex items-center gap-2 text-xs text-header-text-muted">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">K</kbd>
            <span>Search</span>
          </div>
          */}
        </div>
      </header>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-14 left-0 bottom-0 z-40 w-72 bg-sidebar-bg border-r border-sidebar-border overflow-y-auto py-6 px-3 lg:hidden">
            <SidebarNav />
          </div>
        </>
      )}

      <div className="flex flex-1 min-h-0">
        <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-sidebar-border bg-sidebar-bg sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-6 px-3">
          <SidebarNav />
        </aside>

        <main className="flex-1 min-w-0 overflow-auto">
          {children}
        </main>

        <RightSidebar />
      </div>
    </div>
  )
}
