import { cva, type VariantProps } from 'class-variance-authority'
import { type HTMLAttributes } from 'react'

const calloutVariants = cva(
  'p-4 rounded-lg border',
  {
    variants: {
      variant: {
        info: 'bg-box-info-bg border-box-info-border',
        success: 'bg-box-success-bg border-box-success-border',
        warning: 'bg-box-warning-bg border-box-warning-border',
        note: 'bg-box-yellow-bg border-box-yellow-border',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
)

const calloutTitleColors = {
  info: 'text-primary',
  success: 'text-[hsl(142_76%_30%)]',
  warning: 'text-[hsl(38_92%_40%)]',
  note: 'text-[hsl(48_96%_35%)]',
}

export interface CalloutProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof calloutVariants> {
  /** Color theme applied to the border, background, and title. @default 'info' */
  variant?: 'info' | 'success' | 'warning' | 'note'
  /** Optional heading rendered above the body content in the variant's accent color. */
  title?: string
}

function Callout({ className, variant = 'info', title, children, ...props }: CalloutProps) {
  const titleColorClass = calloutTitleColors[variant ?? 'info']
  
  return (
    <div className={calloutVariants({ variant, className })} {...props}>
      {title && (
        <h4 className={`font-bold text-sm mb-2 ${titleColorClass}`}>
          {title}
        </h4>
      )}
      <div className="text-sm text-content">
        {children}
      </div>
    </div>
  )
}

export { Callout, calloutVariants }
