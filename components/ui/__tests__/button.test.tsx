import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'
import { describe, it, expect, vi } from 'vitest'

describe('Button', () => {
  it('renders as a button element', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button.tagName).toBe('BUTTON')
  })

  it('renders children', () => {
    render(<Button>Button Text</Button>)
    expect(screen.getByText('Button Text')).toBeInTheDocument()
  })

  it('applies default variant when not specified', () => {
    render(<Button>Default</Button>)
    const button = screen.getByRole('button', { name: /default/i })
    expect(button.className).toContain('bg-primary')
    expect(button.className).toContain('text-white')
  })

  it('applies primary variant', () => {
    render(<Button variant="primary">Primary</Button>)
    const button = screen.getByRole('button', { name: /primary/i })
    expect(button.className).toContain('bg-primary')
    expect(button.className).toContain('text-white')
  })

  it('applies secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button', { name: /secondary/i })
    expect(button.className).toContain('border-2')
    expect(button.className).toContain('border-primary')
    expect(button.className).toContain('text-primary')
  })

  it('applies ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const button = screen.getByRole('button', { name: /ghost/i })
    expect(button.className).toContain('text-content')
  })

  it('applies outline variant', () => {
    render(<Button variant="outline">Outline</Button>)
    const button = screen.getByRole('button', { name: /outline/i })
    expect(button.className).toContain('border')
    expect(button.className).toContain('border-content-border')
  })

  it('applies default size when not specified', () => {
    render(<Button>Default Size</Button>)
    const button = screen.getByRole('button', { name: /default size/i })
    expect(button.className).toContain('px-4')
    expect(button.className).toContain('py-2')
  })

  it('applies sm size', () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByRole('button', { name: /small/i })
    expect(button.className).toContain('px-3')
    expect(button.className).toContain('py-1.5')
    expect(button.className).toContain('text-sm')
  })

  it('applies md size', () => {
    render(<Button size="md">Medium</Button>)
    const button = screen.getByRole('button', { name: /medium/i })
    expect(button.className).toContain('px-4')
    expect(button.className).toContain('py-2')
  })

  it('applies lg size', () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByRole('button', { name: /large/i })
    expect(button.className).toContain('px-6')
    expect(button.className).toContain('py-3')
  })

  it('supports disabled state', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button', { name: /disabled/i })
    expect(button).toBeDisabled()
    expect(button.className).toContain('disabled:pointer-events-none')
    expect(button.className).toContain('disabled:opacity-50')
  })

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    await userEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>
    )
    const button = screen.getByRole('button', { name: /disabled/i })
    await userEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('supports forwardRef', () => {
    const ref = { current: null }
    const { rerender } = render(<Button ref={ref}>Forward Ref</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('renders with asChild to render as different element', () => {
    const { container } = render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    const link = container.querySelector('a')
    expect(link).toBeInTheDocument()
    expect(link?.href).toContain('/test')
    expect(link?.className).toContain('inline-flex')
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button', { name: /custom/i })
    expect(button.className).toContain('custom-class')
  })

  it('applies base button styles', () => {
    render(<Button>Base</Button>)
    const button = screen.getByRole('button', { name: /base/i })
    expect(button.className).toContain('inline-flex')
    expect(button.className).toContain('items-center')
    expect(button.className).toContain('justify-center')
    expect(button.className).toContain('gap-2')
    expect(button.className).toContain('font-medium')
    expect(button.className).toContain('transition-colors')
  })

  it('has focus-visible ring styling', () => {
    render(<Button>Focus Ring</Button>)
    const button = screen.getByRole('button', { name: /focus ring/i })
    expect(button.className).toContain('focus-visible:outline-none')
    expect(button.className).toContain('focus-visible:ring-2')
  })

  it('combines variant, size, and custom className', () => {
    render(
      <Button variant="secondary" size="lg" className="custom">
        Combined
      </Button>
    )
    const button = screen.getByRole('button', { name: /combined/i })
    expect(button.className).toContain('border-primary')
    expect(button.className).toContain('px-6')
    expect(button.className).toContain('custom')
  })
})
