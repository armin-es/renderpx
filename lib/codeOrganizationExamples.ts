/**
 * Code Organization & Boundaries progressive examples.
 * Five escalating structures for the same e-commerce app.
 */
export const codeOrgExamples = [
  {
    id: '01-flat',
    title: 'Example 1: Flat',
    subtitle: 'Everything at root - works until ~15 files',
    complexity: 'Starter',
  },
  {
    id: '02-type-based',
    title: 'Example 2: Type-Based',
    subtitle: 'Grouped by role: components/, hooks/, utils/',
    complexity: 'Common',
  },
  {
    id: '03-feature-based',
    title: 'Example 3: Feature-Based',
    subtitle: 'Grouped by domain: features/products/, features/cart/',
    complexity: 'Production',
  },
  {
    id: '04-module-contracts',
    title: 'Example 4: Module Contracts',
    subtitle: 'Public API via index.ts - internals are private',
    complexity: 'Advanced',
  },
  {
    id: '05-route-colocation',
    title: 'Example 5: Route Colocation',
    subtitle: 'Components live next to the routes that use them',
    complexity: 'Framework-Native',
  },
]

export const CODEORG_VISUAL_LABELS: Record<string, string> = {
  '01-flat': 'Flat',
  '02-type-based': 'By Type',
  '03-feature-based': 'By Feature',
  '04-module-contracts': 'Contracts',
  '05-route-colocation': 'Colocation',
}

export const codeOrgExampleContent: Record<
  string,
  { description: string; code: string; explanation: string; whenThisBreaks: string }
> = {
  '01-flat': {
    description:
      'The natural starting point for every project. All files live at the same level. There are no rules, no abstractions - just code. This works perfectly at small scale and requires zero upfront decisions.',
    code: `// ✅ Works great at < 15 files - no ceremony required

src/
  UserAvatar.tsx
  UserProfile.tsx
  ProductCard.tsx
  ProductList.tsx
  CartItem.tsx
  CartSummary.tsx
  useUser.ts
  useProduct.ts
  useCart.ts
  formatDate.ts
  formatPrice.ts
  types.ts
  App.tsx

// Zero setup. Everything is one import away.
// You can see the entire codebase in one glance.
import { UserAvatar } from './UserAvatar'
import { useCart } from './useCart'`,
    explanation:
      'Zero friction - start building immediately.\nNo mental overhead deciding where a file belongs.\nEverything is one directory away.',
    whenThisBreaks:
      'At ~15–20 files, scrolling through a flat list becomes painful. Related files (ProductCard.tsx, useProduct.ts, productService.ts) are scattered alphabetically. There\'s no way to tell which files belong to which feature.',
  },

  '02-type-based': {
    description:
      'The most common first refactor: separate files by their technical role. Components go in components/, hooks in hooks/, utilities in utils/. This feels intuitive and mirrors the mental model most developers start with.',
    code: `// ⚠️ Common at medium scale - but adds friction as features grow

src/
  components/
    UserAvatar.tsx
    UserProfile.tsx
    ProductCard.tsx
    ProductList.tsx
    CartItem.tsx
    CartSummary.tsx
  hooks/
    useUser.ts
    useProduct.ts
    useCart.ts
  services/
    userService.ts
    productService.ts
    cartService.ts
  utils/
    formatDate.ts
    formatPrice.ts
  types/
    index.ts       // User, Product, Cart types all mixed together

// Adding a Notifications feature means touching 5+ directories:
// components/NotificationBell.tsx
// components/NotificationList.tsx
// hooks/useNotifications.ts
// services/notificationService.ts
// types/notification.ts (add to the shared types file)

// Deleting Notifications means hunting across all 5 directories.
// grep -r "notification" src/ --include="*.ts" --include="*.tsx"`,
    explanation:
      'Familiar structure - any developer knows where to look for a component or hook.\nEasy to enforce as a team convention.\nWorks well when the codebase has few features that change independently.',
    whenThisBreaks:
      'When one feature spans 5+ directories, every change becomes a multi-directory safari. The "delete test" fails: you can\'t delete a feature by deleting one folder. Teams working on different features collide in the same directories.',
  },

  '03-feature-based': {
    description:
      'Instead of asking "what is this file?" (its type), ask "what feature does this file belong to?" (its domain). Each feature owns everything it needs. The directory structure now tells you about your product, not your tech stack.',
    code: `// ✅ The right structure for most teams and codebases

src/
  features/
    users/
      UserAvatar.tsx
      UserProfile.tsx
      useUser.ts
      userService.ts
      types.ts
    products/
      ProductCard.tsx
      ProductList.tsx
      useProduct.ts
      productService.ts
      types.ts
    cart/
      CartItem.tsx
      CartSummary.tsx
      useCart.ts
      cartService.ts
      types.ts
  shared/
    utils/
      formatDate.ts    // used by multiple features
      formatPrice.ts
    components/
      Button.tsx       // design system primitives
      Modal.tsx

// Adding Notifications: create features/notifications/ - done.
// Deleting Cart: rm -rf features/cart/ - done.
// The directory structure "screams" what the app does.`,
    explanation:
      'The "delete test" passes: remove a feature by removing one folder.\nRelated code changes together - no more multi-directory commits for one feature.\nNew team members understand the product domain from the folder names.',
    whenThisBreaks:
      'Cross-feature dependencies become implicit. Feature A imports from Feature B directly, creating hidden coupling. When Feature B changes, Feature A breaks unexpectedly. The next step is to make those dependencies explicit.',
  },

  '04-module-contracts': {
    description:
      'Add an explicit public API to each feature using an index.ts barrel file. Only what\'s exported from index.ts is part of the public contract. Internal files are implementation details - other features must not import them directly.',
    code: `// ✅ Explicit boundaries - know exactly what each feature exposes

src/
  features/
    products/
      index.ts          ← Public contract: the only file others import
      ProductCard.tsx   ← private (not exported from index.ts)
      ProductList.tsx   ← private
      useProduct.ts     ← exported via index.ts
      productService.ts ← private
      types.ts          ← exported via index.ts

// features/products/index.ts
export { ProductCard } from './ProductCard'
export { ProductList } from './ProductList'
export { useProduct } from './useProduct'
export type { Product, ProductFilters } from './types'
// productService.ts is NOT exported - it's an internal detail

// Consuming in another feature:
import { ProductCard, useProduct } from '@/features/products'
//                                                         ↑
//                                    This is the contract. Not:
// import { productService } from '@/features/products/productService'
//                                                   ↑ ← direct import bypasses contract

// Enforce the contract with an ESLint rule:
// "no-restricted-imports": no direct imports from feature internals`,
    explanation:
      'Clear boundaries: other features import from the index, never from internals.\nRefactoring internals never breaks external consumers (as long as the public API stays the same).\nEasy to audit what\'s actually shared vs. what\'s private.',
    whenThisBreaks:
      'Large teams will still bypass barrel imports unless enforced via ESLint. Barrel files can also harm tree-shaking and bundle size if you export everything. Only export what other features actually need.',
  },

  '05-route-colocation': {
    description:
      'In Next.js App Router, the most natural organization is to colocate components next to the routes that use them. A component used by only one route lives in that route\'s directory. Only components used across multiple routes move to a shared location.',
    code: `// ✅ Next.js App Router: colocation is the framework default

app/
  products/
    page.tsx              ← the route
    ProductGrid.tsx       ← only used by this route
    ProductFilters.tsx    ← only used by this route
    loading.tsx
    error.tsx
    [id]/
      page.tsx
      ProductDetail.tsx   ← only used by this route
      AddToCartButton.tsx ← 'use client' - only used here
      loading.tsx

  cart/
    page.tsx
    CartItemList.tsx      ← only used by this route
    CartSummary.tsx       ← only used by this route

  (shared)/
    layout.tsx

components/
  ui/
    Button.tsx            ← used everywhere → shared
    Modal.tsx             ← used everywhere → shared
  layout/
    Header.tsx            ← used everywhere → shared
    Sidebar.tsx           ← used everywhere → shared

// The colocation heuristic:
// "If you delete this route, does this component go with it?"
// YES → keep it colocated
// NO  → it belongs in components/`,
    explanation:
      'Deleting a route removes its components too - no orphaned files.\nRoute-specific code is invisible from other routes (no accidental reuse).\nNew team members look in the route folder first - they find what they need.\nAligns with how Next.js itself thinks about page-level code.',
    whenThisBreaks:
      'When a component is genuinely shared between routes, it shouldn\'t live in either route folder. The judgment call - "is this shared enough to promote?" - is the discipline. Premature sharing creates coupling; late sharing creates duplication.',
  },
}
