import { render, screen } from '@testing-library/react'
import { Badge } from '../badge'
import { describe, it, expect } from 'vitest'

describe('Badge', () => {
  it('renders as a span', () => {
    render(<Badge>Test Badge</Badge>)
    const badge = screen.getByText('Test Badge')
    expect(badge.tagName).toBe('SPAN')
  })

  it('renders children', () => {
    render(<Badge>Badge Content</Badge>)
    expect(screen.getByText('Badge Content')).toBeInTheDocument()
  })

  it('applies default variant when not specified', () => {
    render(<Badge>Default</Badge>)
    const badge = screen.getByText('Default')
    expect(badge.className).toContain('bg-box-info-bg')
    expect(badge.className).toContain('text-primary')
  })

  it('applies success variant', () => {
    render(<Badge variant="success">Success</Badge>)
    const badge = screen.getByText('Success')
    expect(badge.className).toContain('bg-box-success-bg')
  })

  it('applies warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>)
    const badge = screen.getByText('Warning')
    expect(badge.className).toContain('bg-box-warning-bg')
  })

  it('applies muted variant', () => {
    render(<Badge variant="muted">Muted</Badge>)
    const badge = screen.getByText('Muted')
    expect(badge.className).toContain('bg-content-border')
  })

  it('applies default size when not specified', () => {
    render(<Badge>Default Size</Badge>)
    const badge = screen.getByText('Default Size')
    expect(badge.className).toContain('px-3')
    expect(badge.className).toContain('py-1')
    expect(badge.className).toContain('text-xs')
  })

  it('applies sm size', () => {
    render(<Badge size="sm">Small</Badge>)
    const badge = screen.getByText('Small')
    expect(badge.className).toContain('px-2')
    expect(badge.className).toContain('py-0.5')
    expect(badge.className).toContain('text-[10px]')
  })

  it('applies md size', () => {
    render(<Badge size="md">Medium</Badge>)
    const badge = screen.getByText('Medium')
    expect(badge.className).toContain('px-3')
    expect(badge.className).toContain('py-1')
  })

  it('applies lg size', () => {
    render(<Badge size="lg">Large</Badge>)
    const badge = screen.getByText('Large')
    expect(badge.className).toContain('px-4')
    expect(badge.className).toContain('py-1.5')
    expect(badge.className).toContain('text-sm')
  })

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>)
    const badge = screen.getByText('Custom')
    expect(badge.className).toContain('custom-class')
  })

  it('combines variant, size, and custom className', () => {
    render(
      <Badge variant="warning" size="lg" className="custom">
        Combined
      </Badge>
    )
    const badge = screen.getByText('Combined')
    expect(badge.className).toContain('bg-box-warning-bg')
    expect(badge.className).toContain('px-4')
    expect(badge.className).toContain('custom')
  })

  it('applies base badge styles', () => {
    render(<Badge>Base</Badge>)
    const badge = screen.getByText('Base')
    expect(badge.className).toContain('inline-flex')
    expect(badge.className).toContain('items-center')
    expect(badge.className).toContain('rounded-full')
    expect(badge.className).toContain('font-medium')
  })
})
