import { type HTMLAttributes } from 'react'

/** Props for InlineCode. Forwards all native `<code>` attributes. */
export interface InlineCodeProps extends HTMLAttributes<HTMLElement> {}

function InlineCode({ className = '', ...props }: InlineCodeProps) {
  return (
    <code
      className={`text-xs px-1 py-0.5 rounded bg-inline-code-bg ${className}`}
      {...props}
    />
  )
}

export { InlineCode }
