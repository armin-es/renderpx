import { render, screen } from '@testing-library/react'
import { Callout } from '../callout'
import { describe, it, expect } from 'vitest'

describe('Callout', () => {
  it('renders as a div', () => {
    render(<Callout>Callout Content</Callout>)
    const callout = screen.getByText('Callout Content')
    expect(callout.tagName).toBe('DIV')
  })

  it('renders children', () => {
    render(<Callout>Test Content</Callout>)
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies default variant when not specified', () => {
    const { container } = render(<Callout>Default</Callout>)
    const callout = container.querySelector('div')
    expect(callout?.className).toContain('bg-box-info-bg')
    expect(callout?.className).toContain('border-box-info-border')
  })

  it('applies info variant', () => {
    const { container } = render(<Callout variant="info">Info</Callout>)
    const callout = container.querySelector('div')
    expect(callout?.className).toContain('bg-box-info-bg')
    expect(callout?.className).toContain('border-box-info-border')
  })

  it('applies success variant', () => {
    const { container } = render(<Callout variant="success">Success</Callout>)
    const callout = container.querySelector('div')
    expect(callout?.className).toContain('bg-box-success-bg')
    expect(callout?.className).toContain('border-box-success-border')
  })

  it('applies warning variant', () => {
    const { container } = render(<Callout variant="warning">Warning</Callout>)
    const callout = container.querySelector('div')
    expect(callout?.className).toContain('bg-box-warning-bg')
    expect(callout?.className).toContain('border-box-warning-border')
  })

  it('applies note variant', () => {
    const { container } = render(<Callout variant="note">Note</Callout>)
    const callout = container.querySelector('div')
    expect(callout?.className).toContain('bg-box-yellow-bg')
    expect(callout?.className).toContain('border-box-yellow-border')
  })

  it('does not render title when not provided', () => {
    render(<Callout>No Title</Callout>)
    const h4 = screen.queryByRole('heading', { level: 4 })
    expect(h4).not.toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(<Callout title="Important">Content</Callout>)
    const h4 = screen.getByRole('heading', { level: 4 })
    expect(h4.textContent).toBe('Important')
  })

  it('applies title color for info variant', () => {
    render(<Callout variant="info" title="Info Title">Content</Callout>)
    const title = screen.getByText('Info Title')
    expect(title.className).toContain('text-primary')
  })

  it('applies title color for success variant', () => {
    render(<Callout variant="success" title="Success Title">Content</Callout>)
    const title = screen.getByText('Success Title')
    expect(title.className).toContain('hsl(142')
  })

  it('applies title color for warning variant', () => {
    render(<Callout variant="warning" title="Warning Title">Content</Callout>)
    const title = screen.getByText('Warning Title')
    expect(title.className).toContain('hsl(38')
  })

  it('applies title color for note variant', () => {
    render(<Callout variant="note" title="Note Title">Content</Callout>)
    const title = screen.getByText('Note Title')
    expect(title.className).toContain('hsl(48')
  })

  it('title has correct styling', () => {
    render(<Callout title="Title">Content</Callout>)
    const title = screen.getByText('Title')
    expect(title.className).toContain('font-bold')
    expect(title.className).toContain('text-sm')
    expect(title.className).toContain('mb-2')
  })

  it('applies base callout styles', () => {
    const { container } = render(<Callout>Base</Callout>)
    const callout = container.querySelector('div')
    expect(callout?.className).toContain('p-4')
    expect(callout?.className).toContain('rounded-lg')
    expect(callout?.className).toContain('border')
  })

  it('wraps children content in a styled div', () => {
    render(
      <Callout>
        <span>Child Content</span>
      </Callout>
    )
    const childContent = screen.getByText('Child Content')
    const contentWrapper = childContent.parentElement
    expect(contentWrapper?.className).toContain('text-sm')
    expect(contentWrapper?.className).toContain('text-content')
  })

  it('applies custom className', () => {
    const { container } = render(<Callout className="custom-class">Custom</Callout>)
    const callout = container.querySelector('div')
    expect(callout?.className).toContain('custom-class')
  })

  it('renders complex children', () => {
    render(
      <Callout title="Complex">
        <p>Paragraph content</p>
        <strong>Bold text</strong>
      </Callout>
    )
    expect(screen.getByText('Paragraph content')).toBeInTheDocument()
    expect(screen.getByText('Bold text')).toBeInTheDocument()
  })

  it('combines variant, title, and custom className', () => {
    const { container } = render(
      <Callout
        variant="success"
        title="Success Title"
        className="custom"
      >
        Combined
      </Callout>
    )
    const callout = container.querySelector('div')
    expect(callout?.className).toContain('bg-box-success-bg')
    expect(callout?.className).toContain('custom')
    expect(screen.getByText('Success Title')).toBeInTheDocument()
  })
})
