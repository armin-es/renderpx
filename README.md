# Frontend Architecture Frameworks

A Next.js 14 portfolio and reference site for frontend decision frameworks and patterns. Built from your existing content in `../files/`.

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## What’s included

- **Home** (`/`) – Hero, featured framework, grid of 6 frameworks
- **State Architecture** (`/frameworks/state-architecture`) – Full framework: problem, decision framework, matrix, progressive examples, production patterns, hot takes
- **Pattern Browser** (`/patterns`) – Quick reference by category and decision trees
- **Other frameworks** (`/frameworks/component-composition`, etc.) – “Coming soon” placeholders

## Project layout

```
app/
  layout.tsx, page.tsx, globals.css
  frameworks/
    state-architecture/page.tsx   # Full content
    [slug]/page.tsx               # Coming soon for other frameworks
  patterns/page.tsx
components/
  CodeBlock.tsx, CodeWithPreview.tsx      # Code + live preview (single or multi-file)
  CodeBlockWithFiles.tsx, CodeBlockMultiFile.tsx   # Tabbed file browser
  demos/                                # Client demos for CodeWithPreview
  FrameworkNav.tsx, DecisionMatrix.tsx, ExampleViewer.tsx, ViewToggle.tsx
```

**Code + live preview:** Shiki + `CodeWithPreview` + `components/demos/`. Rationale: `../EXECUTION_PLAN.md` → Code display strategy.

**File browsing:** Use `CodeWithPreview` with `files={[{ name, code, lang }, ...]}` or standalone `CodeBlockWithFiles`. Tabbed UI uses existing Radix Tabs; all files are highlighted on the server, tab switch is client-only. **Weight:** no new deps; same bundle as single-file (Radix already in use). Heavier options: Sandpack (~100–200KB+ client) or StackBlitz embed (iframe, their load).

## Deploy

```bash
pnpm build
pnpm start
```

Or deploy to [Vercel](https://vercel.com) by connecting this directory.
