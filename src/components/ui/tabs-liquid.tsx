import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const LiquidTabs = TabsPrimitive.Root

const LiquidTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-12 items-center justify-center rounded-xl liquid-glass p-1.5 text-muted-foreground gap-1",
      className
    )}
    {...props}
  />
))
LiquidTabsList.displayName = "LiquidTabsList"

const LiquidTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium",
      "ring-offset-background transition-all duration-300",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "liquid-glass-tab",
      "data-[state=active]:liquid-glass-tab-active data-[state=active]:text-foreground data-[state=active]:font-semibold",
      className
    )}
    {...props}
  />
))
LiquidTabsTrigger.displayName = "LiquidTabsTrigger"

const LiquidTabsContent = TabsPrimitive.Content

export { LiquidTabs, LiquidTabsList, LiquidTabsTrigger, LiquidTabsContent }
