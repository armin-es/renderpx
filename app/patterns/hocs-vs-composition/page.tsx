import Link from 'next/link'
import { CodeBlock } from '@/components/CodeBlock'
import { Callout, InlineCode } from '@/components/ui'

const NAIVE_CODE = `// Wrap every component that needs auth in a HOC
function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthWrapper(props: P) {
    const { user, loading } = useAuth()
    if (loading) return <Spinner />
    if (!user) return <Navigate to="/login" />
    return <Component {...props} user={user} />
  }
}
const ProfilePage = withAuth(ProfilePageInner)
const SettingsPage = withAuth(SettingsPageInner)
// Works, but: wrapper nesting (withAuth(withTheme(Page))), refs don't pass through unless forwarded, and multiple HOCs are hard to read.`;

const FIRST_IMPROVEMENT_CODE = `// Composition: render children only when authenticated
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" />
  return <>{children}</>
}

// Usage: wrap once at layout level
<AuthGuard>
  <ProfilePage />
</AuthGuard>
// Or wrap a route: no HOC, no prop injection; just a wrapper that gates rendering.`;

const PRODUCTION_CODE = `// Prefer composition for "gating" and "layout"; use HOCs sparingly
// Composition (guard):
<AuthGuard>
  <ThemeProvider>
    <App />
  </ThemeProvider>
</AuthGuard>

// Composition (inject via context instead of HOC):
function useUser() {
  const ctx = useContext(AuthContext)
  if (!ctx.user) throw new Error('Missing AuthProvider')
  return ctx.user
}
// Any child calls useUser(); no withAuth(Component) needed.

// When a HOC is still useful: adding props or behavior to a component type (e.g. connect in Redux).
// Use forwardRef + displayName so refs and DevTools stay clear.`;

export default function HocsVsCompositionPatternPage() {
  return (
    <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-6 bg-content-bg">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-content">
          HOCs vs Composition
        </h1>
        <p className="text-xl text-content-muted">
          Reuse logic or gating by wrapping components. HOCs (higher-order components) wrap a component and return a new one, often injecting props. Composition uses a wrapper component that renders <InlineCode>children</InlineCode> conditionally or provides context. Prefer composition for guards and layout; use HOCs when you need to augment a component type.
        </p>
      </div>

      <section id="problem" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">The problem I keep seeing</h2>
        <p className="text-content mb-4">
          You need to add the same behavior to many components—auth check, theme, tracking. Two options: a higher-order component (HOC) that takes a component and returns a wrapped one, or a wrapper component that uses composition (e.g. <InlineCode>AuthGuard</InlineCode> that renders children only when authenticated). Both work; composition is usually simpler and avoids ref/displayName issues.
        </p>
      </section>

      <section id="naive-approach" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Naive approach</h2>
        <p className="text-content mb-4">
          A HOC: <InlineCode>withAuth(Page)</InlineCode> wraps the component, runs the auth check, and injects <InlineCode>user</InlineCode> as a prop. Every page that needs auth is wrapped. Multiple HOCs stack and refs don’t pass through unless you use <InlineCode>forwardRef</InlineCode> in each layer.
        </p>
        <CodeBlock code={NAIVE_CODE} lang="tsx" />
      </section>

      <section id="first-improvement" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">First improvement</h2>
        <p className="text-content mb-4">
          Composition: a component that accepts <InlineCode>children</InlineCode> and renders them only when the condition is met (e.g. user is logged in). Use it once at layout or route level. No prop injection, no wrapping every page; the tree stays readable.
        </p>
        <CodeBlock code={FIRST_IMPROVEMENT_CODE} lang="tsx" />
      </section>

      <section id="remaining-issues" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Remaining issues</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Injecting data:</strong> If children need <InlineCode>user</InlineCode>, use context: an <InlineCode>AuthProvider</InlineCode> that wraps the tree and a <InlineCode>useUser()</InlineCode> hook. No HOC needed.</li>
          <li><strong>When HOCs still make sense:</strong> When you’re augmenting a component type (e.g. Redux <InlineCode>connect</InlineCode>, or a library that expects a HOC). Use <InlineCode>forwardRef</InlineCode> and set <InlineCode>displayName</InlineCode> for debugging.</li>
        </ul>
      </section>

      <section id="production-pattern" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Production pattern</h2>
        <p className="text-content mb-4">
          Prefer composition: guard components (<InlineCode>AuthGuard</InlineCode>, <InlineCode>FeatureGate</InlineCode>) that render <InlineCode>children</InlineCode> or redirect. Use context + hooks to provide data (e.g. <InlineCode>useUser()</InlineCode>) so any descendant can consume it without a HOC. Reserve HOCs for cases where you must wrap a component type (e.g. legacy Redux, or a third-party API that expects a HOC); then use <InlineCode>forwardRef</InlineCode> and preserve displayName.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />
      </section>

      <section id="when-i-use-this" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">When I use this</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Composition:</strong> Auth gates, feature flags, layout wrappers, providers. Clear tree and no ref/displayName issues.</li>
          <li><strong>HOCs:</strong> When integrating with a library that uses HOCs, or when you need to return a “enhanced” component type (e.g. with extra props) and composition doesn’t fit.</li>
        </ul>
      </section>

      <section id="gotchas" className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-content">Gotchas</h2>
        <ul className="list-disc pl-6 space-y-2 text-content">
          <li><strong>Refs:</strong> HOCs don’t forward refs by default; wrap with <InlineCode>forwardRef</InlineCode> in the HOC and pass the ref to the inner component.</li>
          <li><strong>Static methods:</strong> HOCs don’t copy static methods from the wrapped component; use a lib like <InlineCode>hoist-non-react-statics</InlineCode> if you need them.</li>
        </ul>
      </section>

      <p className="text-content-muted text-sm">
        <Link href="/patterns/compound-components" className="text-primary hover:underline">
          Compound Components →
        </Link>
        {' · '}
        <Link href="/patterns/render-props-vs-hooks" className="text-primary hover:underline">
          Render Props vs Hooks →
        </Link>
        {' · '}
        <Link href="/patterns" className="text-primary hover:underline">
          All patterns
        </Link>
      </p>
    </div>
  )
}
