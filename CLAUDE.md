# CLAUDE.md — Frontend Architecture Portfolio

## Project Purpose

A senior frontend engineer's portfolio that doubles as a personal reference system. The goal is to document architectural decision frameworks, implementation patterns, and case studies in a "tech talk in written form" style — text explaining the problem, code showing it, text analyzing why it fails, improved code, repeat.

Dual purpose:

1. **Self-documentation** — a living reference for past decisions, patterns, and gotchas
2. **Hiring signal** — demonstrates architectural depth, decision-making frameworks, and production experience

---

## Project Location

```text
/Users/armin/Documents - Local/notes/projects/portfolio/framework-portfolio/
```

Run with:

```bash
pnpm dev   # starts at http://localhost:3000
pnpm build
```

---

## Tech Stack

| Tool | Version | Notes |
| --- | --- | --- |
| Next.js | ^16.1.6 | App Router |
| React | ^19.2.4 | React 19 + Compiler |
| TypeScript | ^5.3.0 | |
| Tailwind CSS | ^3.4.1 | CSS variables for theming |
| Shiki | ^3.22.0 | Server-side syntax highlighting |
| Zustand | ^5.0.11 | Used in demos, not app state |
| Radix UI | accordion, tabs | |
| Lucide React | ^0.574.0 | Icons |
| pnpm | 9.15.0 | Package manager — always use pnpm |

---

## Content Architecture (3 Layers)

### Layer 1: Frameworks — `/app/frameworks/[slug]/`

How to *think* about architectural decisions. Template per framework:

1. The Hook — production problem story + interactive demo
2. The Framework — mental model + decision tree
3. Decision Matrix — table (pattern vs criteria)
4. Progressive Complexity — same feature at 5 increasing scales
5. Production Patterns — 2–3 anonymized real scenarios
6. Common Mistakes & Hot Takes
7. Related Frameworks

**Status:**

- `state-architecture` — **fully written** (see below for details)
- `component-composition`, `data-fetching`, `rendering-strategy`, `design-system`, `code-organization` — outlined, not yet written

### Layer 2: Patterns — `/app/patterns/`

How to *implement* specific things. Template: problem → naive approach → first improvement → remaining issues → production pattern → when to use → gotchas.

**Written:** Optimistic Updates, Infinite Scroll, Debouncing & Throttling, Form Validation, Loading States

**Outlined but not written:** Error Boundaries, Cache Invalidation, Polling vs WebSockets, Multi-Step Forms, Virtualized Lists, and ~10 more

### Layer 3: Case Studies — not yet built

How to *combine* frameworks and patterns. Planned: Chat App, Dashboard, E-commerce Checkout.

### Deep Dives — `/app/deep-dives/[slug]/`

How the *tools actually work* under the hood.

**Written:** `state-management-internals` — covers `useSyncExternalStore`, Zustand's subscription model, Context vs external store comparison, historical pre-React-18 approach.

---

## File Structure

```text
app/
  layout.tsx                    # Wraps everything in DocsShell
  page.tsx                      # Home/landing
  globals.css                   # CSS variables for theming (light/dark/auto)
  frameworks/
    state-architecture/page.tsx # Only fully-written framework
    [slug]/page.tsx             # Placeholder for other frameworks
  patterns/page.tsx             # Pattern index
  deep-dives/
    state-management-internals/page.tsx

components/
  DocsShell.tsx                 # TanStack-style layout: dark sidebar + top bar
  CodeBlock.tsx                 # Shiki server component — always use for code
  CodeWithPreview.tsx           # CodeBlock + live demo (stacked layout)
  CodeWithPreviewToolbar.tsx    # MUI-style: preview → toolbar → collapsible code
  CodeBlockMultiFile.tsx        # Multi-file tabbed code display
  DecisionMatrix.tsx            # Reusable comparison table
  ExampleViewer.tsx             # Progressive complexity stepper (5 steps)
  FrameworkNav.tsx              # In-page anchor navigation
  ViewToggle.tsx                # Learn / Reference / My Notes toggle
  ThemeProvider.tsx
  demos/                        # Client-side interactive demos
    FormContext.ts              # Shared context for form demos
    FormContent.tsx             # Form input fields
    StickyActionBar.tsx         # Sticky Save button (consumes FormContext)
    ProblemDemo.tsx             # Shows context re-render problem
    SolutionDemo.tsx            # Shows narrowed provider solution
    ZustandDemo.tsx             # Shows Zustand fine-grained subscriptions
    SplitContextDemo.tsx        # Problem vs Solution context split demos
    ContextSubscriptionDemo.tsx # Demonstrates useContext subscription behavior
    ProductFilterDemos.tsx      # Progressive complexity live demos (5 variants)
    ResetButton.tsx             # Reusable reset button for demos

lib/
  stateArchitectureExamples.ts  # Progressive example content + code strings
  reactCompilerContent.ts       # React Compiler section content
```

---

## UI / Design Conventions

- **Style:** TanStack docs aesthetic — dark sidebar, dark top bar, light content area
- **Theme:** Light / Dark / Auto (system). Stored in `localStorage`. Inline script prevents flash. Never use hardcoded Tailwind color classes like `bg-gray-100` or `text-gray-700` — always use CSS variables.
- **CSS variables** (defined in `globals.css`):
  - `--content-bg`, `--content-text`, `--content-text-muted`, `--content-border`
  - `--sidebar-bg`, `--sidebar-text`, `--sidebar-text-muted`, `--sidebar-border`
  - `--code-bg`, `--card-bg`, `--card-toolbar-bg`, `--preview-bg`
  - `--inline-code-bg`, `--link`
  - `--box-info-bg/border`, `--box-success-*`, `--box-warning-*`, `--box-yellow-*`
  - `--table-row-alt`
- **Code font:** `'JetBrains Mono', Menlo, Monaco, Consolas, monospace, 'Courier New'` — 12px
- **Code blocks:** Always Shiki (`CodeBlock` component). `pre-wrap` is off — code uses horizontal scroll. Fixed height with vertical scroll.
- **Code + Demo pattern:** Use `CodeWithPreview layout="stacked"` — app preview on top (collapsible via toolbar), code below. Never side-by-side (squeezes code).

---

## State Architecture Page — What's Complete

The most important reference for the content style and component patterns.

**Narrative flow:**

1. Problem: Form state at root causes all siblings to re-render (`ProblemDemo`)
2. Solution: Narrow the provider to wrap only components that need the state (`SolutionDemo`)
3. When narrowing isn't enough: Tree topology problem + `useContext` subscription behavior
4. Zustand as the answer: `ZustandDemo` — fine-grained selectors, no provider needed
5. Split context as a workaround (if staying with React primitives)
6. React Compiler Impact: automatic `memo()` reduces cascade re-renders; still can't fix Context subscription model
7. Decision Framework + Decision Matrix
8. Progressive Complexity (5 steps via `ExampleViewer` + `ProductFilterDemos`)
9. Production Patterns
10. Hot Takes

**Key technical facts documented:**

- `useContext()` subscribes a component to the entire context object — any property change causes a re-render, even if that property isn't used
- Zustand uses `React.useSyncExternalStore` to bridge external JS state with React's render cycle — each component subscribes independently via a selector
- Context solution only works efficiently when consuming components are structurally close (siblings inside a narrow provider)
- React Compiler automates `memo()` equivalence but cannot change how Context subscriptions work
- Before React 18: state management libraries used `useState`/`useReducer` force-update hacks (tearing risk in concurrent mode); `useSyncExternalStore` was designed to solve this

---

## Content Style Guide

**Writing pattern:** Text (explain the problem) → Code (show it) → Text (analyze why it fails) → Code (improved) → Text (remaining issues) → Code (production version)

**Voice:** First-person, opinionated. "I once inherited..." / "Here's what I keep seeing..." / "The mistake I made early on..."

**Depth:** B-to-C level (paragraph explanations + teaching moments, not just one-liners). Future self should be able to re-learn the *reasoning*, not just see the syntax.

**Demos:** Every code block that shows a pattern should have a live interactive demo next to it (via `CodeWithPreview`). Demos must be fully functional — not placeholder UI.

**Demo rules:**

- Use `useRef` for render counters (not `useState` — causes infinite loops)
- Memoize context values passed to providers (prevents spurious re-renders in demos)
- Always use CSS variables for colors (demos must work in light + dark mode)
- Give demos real data and functional interactions (filters that filter, saves that respond)

---

## Reference Docs in This Directory

| File | Purpose |
| --- | --- |
| `EXECUTION_PLAN.md` | Full phased build plan — phases 0–6, status of each framework/pattern |
| `chat.md` | Original Claude.ai conversation that defined the project vision and structure |
| `cursor_chat_analysis_and_execution_plan.md` | Cursor session: state-architecture page work (demos, Zustand, layout, dark mode) |
| `cursor_implementation_plan_for_state_ar.md` | Cursor session: React Compiler section, narrative restructure, context subscription demos |

---

## Current Priorities (from EXECUTION_PLAN.md Phase order)

1. Finish `state-architecture` — one "Coming Soon" section remains:
   - Codifying Patterns as AI Skills/Rules (pending)
2. Component Composition framework (next framework after state-architecture)
3. Port remaining patterns to `/patterns/` pages
4. Flesh out `state-management-internals` deep dive with interactive demos

---

## Common Mistakes to Avoid

- Don't use hardcoded Tailwind color classes in page or demo components — always CSS variables
- Don't use `useState` for render counters in demos — causes infinite loops; use `useRef`
- Don't put unrelated components inside a Context Provider just for convenience
- Don't make demos purely static (no interaction) — every demo should be functional
- Don't use `npm` — this project uses `pnpm`
- Don't embed Sandpack/StackBlitz under every code snippet — use `CodeWithPreview` with a local React component demo instead
