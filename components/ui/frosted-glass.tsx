"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const frostedGlassVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 backdrop-blur-md border shadow-sm",
  {
    variants: {
      variant: {
        default:
          "bg-background/40 border-border/50 text-foreground hover:bg-background/60 hover:shadow-md",
        active:
          "bg-primary/20 border-primary/30 text-primary shadow-md",
        pill:
          "bg-muted/40 border-muted-foreground/20 text-foreground/90 hover:bg-muted/60 tracking-wide",
        icon:
          "bg-background/50 border-border/50 text-foreground hover:bg-background/80 hover:scale-105",
      },
      size: {
        default: "h-10 px-5 py-2 text-sm",
        sm: "h-7 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-12 w-12 flex-shrink-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface FrostedGlassProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof frostedGlassVariants> {
  asChild?: boolean
}

export const FrostedGlass = React.forwardRef<HTMLButtonElement, FrostedGlassProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(frostedGlassVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
FrostedGlass.displayName = "FrostedGlass"