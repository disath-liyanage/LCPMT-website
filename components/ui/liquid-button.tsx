"use client"

import * as React from "react"
import { Slot, Slottable } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const liquidbuttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:scale-105 duration-300 transition text-primary",
        outline: "bg-transparent hover:bg-[#0F2A1D]/5 hover:scale-105 duration-300 transition",
      },
      size: {
        default: "h-9 px-4 py-2",
        lg: "h-14 px-8",
        sm: "h-7 px-3 text-xs", 
      },
    },
    defaultVariants: {
      variant: "default",
      size: "lg",
    },
  }
)

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidbuttonVariants> {
  asChild?: boolean
}

export function LiquidButton({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: LiquidButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn("relative group", liquidbuttonVariants({ variant, size, className }))}
      {...props}
    >
      <div className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full rounded-full shadow-[0_0_6px_rgba(15,42,29,0.05),0_2px_6px_rgba(15,42,29,0.08),inset_3px_3px_0.5px_-3px_rgba(255,255,255,0.9),inset_-3px_-3px_0.5px_-3px_rgba(15,42,29,0.1),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(15,42,29,0.05),inset_0_0_2px_2px_rgba(255,255,255,0.5)] transition-all" />
      
      <div
        className="pointer-events-none absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-full"
        style={{ backdropFilter: 'url("#container-glass")' }}
      />

      <Slottable>{children}</Slottable>
    </Comp>
  )
}