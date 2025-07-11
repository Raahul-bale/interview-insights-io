
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 backdrop-blur-md border",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-black/90 border-black backdrop-blur-md shadow-lg hover:shadow-xl",
        destructive:
          "bg-destructive/20 text-destructive-foreground hover:bg-destructive/30 border-destructive/30 backdrop-blur-md shadow-lg hover:shadow-xl",
        outline:
          "bg-background/20 hover:bg-accent/30 hover:text-accent-foreground border-input/50 backdrop-blur-md shadow-lg hover:shadow-xl",
        secondary:
          "bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 border-secondary/30 backdrop-blur-md shadow-lg hover:shadow-xl",
        ghost: "bg-transparent hover:bg-accent/20 hover:text-accent-foreground border-transparent backdrop-blur-md hover:shadow-lg",
        link: "text-primary underline-offset-4 hover:underline bg-transparent border-transparent backdrop-blur-none",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

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
