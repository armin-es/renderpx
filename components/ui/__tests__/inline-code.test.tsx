import { render, screen } from '@testing-library/react'
import { InlineCode } from '../inline-code'
import { describe, it, expect } from 'vitest'

describe('InlineCode', () => {
  it('renders as a code element', () => {
    render(<InlineCode>const x = 1</InlineCode>)
    const code = screen.getByText('const x = 1')
    expect(code.tagName).toBe('CODE')
  })

  it('renders children', () => {
    render(<InlineCode>const message = "hello"</InlineCode>)
    expect(screen.getByText('const message = "hello"')).toBeInTheDocument()
  })

  it('applies base code styles', () => {
    render(<InlineCode>Base</InlineCode>)
    const code = screen.getByText('Base')
    expect(code.className).toContain('text-xs')
    expect(code.className).toContain('px-1')
    expect(code.className).toContain('py-0.5')
    expect(code.className).toContain('rounded')
    expect(code.className).toContain('bg-inline-code-bg')
  })

  it('applies custom className', () => {
    render(<InlineCode className="custom-class">Custom</InlineCode>)
    const code = screen.getByText('Custom')
    expect(code.className).toContain('custom-class')
  })

  it('merges custom className with base styles', () => {
    render(<InlineCode className="font-bold">Merged</InlineCode>)
    const code = screen.getByText('Merged')
    expect(code.className).toContain('text-xs')
    expect(code.className).toContain('bg-inline-code-bg')
    expect(code.className).toContain('font-bold')
  })

  it('accepts data attributes', () => {
    render(
      <InlineCode data-testid="custom-code">Code</InlineCode>
    )
    const code = screen.getByTestId('custom-code')
    expect(code).toBeInTheDocument()
  })

  it('accepts id attribute', () => {
    render(
      <InlineCode id="code-snippet">Snippet</InlineCode>
    )
    const code = screen.getByText('Snippet')
    expect(code.id).toBe('code-snippet')
  })

  it('accepts title attribute', () => {
    render(
      <InlineCode title="JavaScript code">const x = 1</InlineCode>
    )
    const code = screen.getByText('const x = 1')
    expect(code.title).toBe('JavaScript code')
  })

  it('renders multiline code', () => {
    const multilineCode = `function hello() {
  return "world"
}`
    const { container } = render(<InlineCode>{multilineCode}</InlineCode>)
    const code = container.querySelector('code')
    expect(code?.textContent).toContain('function hello()')
    expect(code?.textContent).toContain('return "world"')
  })

  it('renders special characters', () => {
    render(<InlineCode>{`<div> && || !=`}</InlineCode>)
    expect(screen.getByText(/<div> && \|\| !=/, { exact: false })).toBeInTheDocument()
  })

  it('accepts style prop', () => {
    const { container } = render(
      <InlineCode style={{ color: 'red' }}>Styled</InlineCode>
    )
    const code = container.querySelector('code')
    expect(code?.style.color).toBe('red')
  })

  it('empty className defaults correctly', () => {
    render(<InlineCode>Default Class</InlineCode>)
    const code = screen.getByText('Default Class')
    expect(code.className).toBeTruthy()
    expect(code.className).toContain('text-xs')
  })
})
