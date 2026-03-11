'use client'

import { useState } from 'react'
import { Folder, FileCode } from 'lucide-react'

interface FileNode {
  name: string
  type: 'folder' | 'file'
  children?: FileNode[]
  isNew?: boolean
  touched?: boolean // existing folder that gets a new file added
}

const TYPE_BASED_TREE: FileNode = {
  name: 'src',
  type: 'folder',
  children: [
    {
      name: 'components',
      type: 'folder',
      touched: true,
      children: [
        { name: 'UserAvatar.tsx', type: 'file' },
        { name: 'ProductCard.tsx', type: 'file' },
        { name: 'NotificationBell.tsx', type: 'file', isNew: true },
        { name: 'NotificationList.tsx', type: 'file', isNew: true },
      ],
    },
    {
      name: 'hooks',
      type: 'folder',
      touched: true,
      children: [
        { name: 'useUser.ts', type: 'file' },
        { name: 'useProduct.ts', type: 'file' },
        { name: 'useNotifications.ts', type: 'file', isNew: true },
      ],
    },
    {
      name: 'services',
      type: 'folder',
      touched: true,
      children: [
        { name: 'userService.ts', type: 'file' },
        { name: 'productService.ts', type: 'file' },
        { name: 'notificationService.ts', type: 'file', isNew: true },
      ],
    },
    {
      name: 'utils',
      type: 'folder',
      touched: true,
      children: [
        { name: 'formatDate.ts', type: 'file' },
        { name: 'formatNotification.ts', type: 'file', isNew: true },
      ],
    },
    {
      name: 'types',
      type: 'folder',
      touched: true,
      children: [
        { name: 'user.ts', type: 'file' },
        { name: 'product.ts', type: 'file' },
        { name: 'notification.ts', type: 'file', isNew: true },
      ],
    },
    {
      name: 'constants',
      type: 'folder',
      touched: true,
      children: [
        { name: 'routes.ts', type: 'file' },
        { name: 'notificationTypes.ts', type: 'file', isNew: true },
      ],
    },
  ],
}

const FEATURE_BASED_TREE: FileNode = {
  name: 'src',
  type: 'folder',
  children: [
    {
      name: 'features',
      type: 'folder',
      children: [
        {
          name: 'users',
          type: 'folder',
          children: [
            { name: 'UserAvatar.tsx', type: 'file' },
            { name: 'useUser.ts', type: 'file' },
            { name: 'userService.ts', type: 'file' },
            { name: 'types.ts', type: 'file' },
          ],
        },
        {
          name: 'products',
          type: 'folder',
          children: [
            { name: 'ProductCard.tsx', type: 'file' },
            { name: 'useProduct.ts', type: 'file' },
            { name: 'productService.ts', type: 'file' },
            { name: 'types.ts', type: 'file' },
          ],
        },
        {
          name: 'notifications',
          type: 'folder',
          isNew: true,
          children: [
            { name: 'NotificationBell.tsx', type: 'file', isNew: true },
            { name: 'NotificationList.tsx', type: 'file', isNew: true },
            { name: 'useNotifications.ts', type: 'file', isNew: true },
            { name: 'notificationService.ts', type: 'file', isNew: true },
            { name: 'types.ts', type: 'file', isNew: true },
            { name: 'index.ts', type: 'file', isNew: true },
          ],
        },
      ],
    },
    {
      name: 'shared',
      type: 'folder',
      children: [
        { name: 'formatDate.ts', type: 'file' },
        { name: 'constants.ts', type: 'file' },
      ],
    },
  ],
}

interface TreeNodeProps {
  node: FileNode
  depth?: number
}

function TreeNode({ node, depth = 0 }: TreeNodeProps) {
  const [open, setOpen] = useState(true)
  const indent = depth * 16

  const fileColor = node.isNew
    ? 'hsl(var(--box-success-border))'
    : 'hsl(var(--content-text-muted))'

  const folderColor = node.isNew
    ? 'hsl(var(--box-success-border))'
    : node.touched
    ? 'hsl(var(--box-warning-border))'
    : 'hsl(var(--content-text))'

  if (node.type === 'file') {
    return (
      <div
        className="flex items-center gap-1.5 py-0.5 text-xs"
        style={{ paddingLeft: indent + 4 }}
      >
        <FileCode size={12} style={{ color: fileColor, flexShrink: 0 }} />
        <span style={{ color: fileColor, fontFamily: 'var(--font-mono), monospace' }}>
          {node.name}
        </span>
        {node.isNew && (
          <span
            className="text-[10px] px-1 rounded font-bold ml-1"
            style={{
              backgroundColor: 'hsl(var(--box-success-bg))',
              color: 'hsl(var(--box-success-border))',
            }}
          >
            NEW
          </span>
        )}
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        className="flex items-center gap-1.5 py-0.5 text-xs w-full text-left"
        style={{ paddingLeft: indent }}
        onClick={() => setOpen(!open)}
      >
        <Folder size={13} style={{ color: folderColor, flexShrink: 0 }} />
        <span
          className="font-medium"
          style={{ color: folderColor, fontFamily: 'var(--font-mono), monospace' }}
        >
          {node.name}/
        </span>
        {node.isNew && (
          <span
            className="text-[10px] px-1 rounded font-bold ml-1"
            style={{
              backgroundColor: 'hsl(var(--box-success-bg))',
              color: 'hsl(var(--box-success-border))',
            }}
          >
            NEW
          </span>
        )}
        {node.touched && (
          <span
            className="text-[10px] px-1 rounded font-bold ml-1"
            style={{
              backgroundColor: 'hsl(var(--box-warning-bg))',
              color: 'hsl(var(--box-warning-border))',
            }}
          >
            TOUCHED
          </span>
        )}
      </button>
      {open && node.children && (
        <div>
          {node.children.map((child, i) => (
            <TreeNode key={`${child.name}-${i}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function countTouchedDirs(node: FileNode): number {
  let count = 0
  if (node.type === 'folder' && node.touched) count++
  if (node.type === 'folder' && node.isNew) count++
  if (node.children) {
    for (const child of node.children) {
      count += countTouchedDirs(child)
    }
  }
  return count
}

export function FeatureAddDemo() {
  const [mode, setMode] = useState<'type-based' | 'feature-based'>('type-based')
  const tree = mode === 'type-based' ? TYPE_BASED_TREE : FEATURE_BASED_TREE
  const dirsTouched = mode === 'type-based' ? 6 : 1

  return (
    <div
      className="rounded-lg border p-5"
      style={{ borderColor: 'hsl(var(--content-border))' }}
    >
      <div className="flex items-center justify-between mb-4">
        <p
          className="text-sm font-medium"
          style={{ color: 'hsl(var(--content-text))' }}
        >
          Adding a <strong>Notifications</strong> feature:
        </p>
        <div
          className="flex rounded-md overflow-hidden border text-xs font-medium"
          style={{ borderColor: 'hsl(var(--content-border))' }}
        >
          <button
            type="button"
            onClick={() => setMode('type-based')}
            className="px-3 py-1.5 transition-colors"
            style={{
              backgroundColor:
                mode === 'type-based'
                  ? 'hsl(var(--link))'
                  : 'hsl(var(--content-bg))',
              color:
                mode === 'type-based'
                  ? 'white'
                  : 'hsl(var(--content-text-muted))',
            }}
          >
            Type-Based
          </button>
          <button
            type="button"
            onClick={() => setMode('feature-based')}
            className="px-3 py-1.5 transition-colors"
            style={{
              backgroundColor:
                mode === 'feature-based'
                  ? 'hsl(var(--link))'
                  : 'hsl(var(--content-bg))',
              color:
                mode === 'feature-based'
                  ? 'white'
                  : 'hsl(var(--content-text-muted))',
            }}
          >
            Feature-Based
          </button>
        </div>
      </div>

      <div
        className="flex items-center gap-2 mb-4 text-sm px-3 py-2 rounded"
        style={{
          backgroundColor:
            dirsTouched > 1
              ? 'hsl(var(--box-warning-bg))'
              : 'hsl(var(--box-success-bg))',
          color: 'hsl(var(--content-text))',
        }}
      >
        <span className="font-bold text-base">{dirsTouched}</span>
        <span>
          {dirsTouched > 1
            ? `directories touched - spread across ${dirsTouched} separate folders`
            : 'directory - everything in one place'}
        </span>
      </div>

      <div
        className="rounded-md p-3 leading-6"
        style={{ backgroundColor: 'hsl(var(--code-bg))' }}
      >
        <TreeNode node={tree} depth={0} />
      </div>

      <div className="flex gap-4 mt-3 text-xs" style={{ color: 'hsl(var(--content-text-muted))' }}>
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-sm"
            style={{ backgroundColor: 'hsl(var(--box-success-border))' }}
          />
          New files
        </div>
        {mode === 'type-based' && (
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-sm"
              style={{ backgroundColor: 'hsl(var(--box-warning-border))' }}
            />
            Existing folders touched
          </div>
        )}
      </div>
    </div>
  )
}
