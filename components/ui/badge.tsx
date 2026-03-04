import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";

const badgeVariants = cva("inline-flex items-center rounded-full font-medium", {
  variants: {
    variant: {
      default: "bg-box-info-bg text-primary",
      success: "bg-box-success-bg text-[hsl(142_76%_30%)]",
      warning: "bg-box-warning-bg text-[hsl(38_92%_40%)]",
      muted: "bg-content-border/30 text-content-muted",
    },
    size: {
      sm: "px-2 py-0.5 text-[10px]",
      md: "px-3 py-1 text-xs",
      lg: "px-4 py-1.5 text-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  /** Color theme of the badge. @default 'default' */
  variant?: "default" | "success" | "warning" | "muted";
  /** Controls padding and font size. @default 'md' */
  size?: "sm" | "md" | "lg";
}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={badgeVariants({ variant, size, className })} {...props} />
  );
}

export { Badge, badgeVariants };
