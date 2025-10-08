import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 motion-safe:transition-all motion-safe:duration-200",
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--interactive-primary))] text-white hover:bg-[hsl(var(--interactive-primary-hover))] shadow-md hover:shadow-lg motion-safe:hover:scale-[1.02] motion-safe:hover:-translate-y-0.5 transition-all",
        secondary: "bg-[hsl(var(--interactive-secondary))] border-2 border-[hsl(var(--color-raspberry-60))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--interactive-secondary-hover))] shadow-sm hover:shadow-md motion-safe:hover:scale-[1.02]",
        outline: "border-2 border-[hsl(var(--interactive-primary))] text-[hsl(var(--interactive-primary))] bg-transparent hover:bg-[hsl(var(--color-darkpurple-30))] shadow-sm hover:shadow-md motion-safe:hover:scale-[1.02]",
        ghost: "text-[hsl(var(--interactive-primary))] hover:bg-[hsl(var(--color-bone-20))] motion-safe:hover:scale-[1.02]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md motion-safe:hover:scale-[1.02]",
        link: "text-[hsl(var(--interactive-primary))] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 min-h-[44px]",
        sm: "h-9 rounded-md px-3 min-h-[44px]",
        lg: "h-11 rounded-md px-8 min-h-[44px]",
        icon: "h-10 w-10 min-h-[44px] min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Support for reduced motion preferences
if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // Motion-safe utilities will handle this via Tailwind
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
