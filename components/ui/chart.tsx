"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Workaround for https://github.com/recharts/recharts/issues/3615
const CartesianGrid = (props: React.ComponentProps<typeof RechartsPrimitive.CartesianGrid>) => (
  <RechartsPrimitive.CartesianGrid {...props} vertical={false} />
)

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentPropsWithoutRef<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      className,
      viewBox,
      hideLabel = false,
      hideIndicator = false,
      content,
      payload,
      label,
      nameKey,
      labelKey,
      ...props
    },
    ref,
  ) => {
    const { chartTooltip } = useChart()

    if (content) {
      return (
        <div ref={ref} className={cn("recharts-default-tooltip", className)} {...props}>
          {content as React.ReactNode}
        </div>
      )
    }

    if (!payload || !payload.length) {
      return null
    }

    const formattedLabel = labelKey ? chartTooltip.formatter?.(label, { key: labelKey, type: "label" }) : label
    const formattedPayload = payload.map((item) => {
      const formattedValue = chartTooltip.formatter?.(item.value, { key: item.dataKey, type: "value" })
      const formattedName = nameKey ? chartTooltip.formatter?.(item.name, { key: nameKey, type: "name" }) : item.name
      return { ...item, value: formattedValue, name: formattedName }
    })

    return (
      <div
        ref={ref}
        className={cn("rounded-lg border bg-background px-3 py-1.5 text-sm shadow-xl", className)}
        {...props}
      >
        {!hideLabel && formattedLabel && <p className="font-medium text-foreground">{formattedLabel}</p>}
        {formattedPayload.map((item, index) => (
          <div key={item.dataKey || index} className="flex items-center gap-x-2">
            {!hideIndicator && (
              <div
                className={cn("h-2 w-2 rounded-full", item.color && `bg-[${item.color}]`)}
                style={{ backgroundColor: item.color }}
              />
            )}
            {item.name && (
              <p className="text-muted-foreground">
                {item.name}: <span className="font-medium text-foreground">{item.value}</span>
              </p>
            )}
          </div>
        ))}
      </div>
    )
  },
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartContext = React.createContext<{
  chartConfig: Record<string, { label?: string; color?: string }>
  chartTooltip: { formatter?: (value: any, context: { key: string | number; type: "label" | "value" | "name" }) => any }
}>({
  chartConfig: {},
  chartTooltip: {},
})

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: Record<string, { label?: string; color?: string }>
    children: React.ReactNode
  }
>(({ config, className, children, ...props }, ref) => {
  const chartTooltip = React.useMemo(() => {
    const formatter = (value: any, context: { key: string | number; type: "label" | "value" | "name" }) => {
      if (context.type === "value" && typeof value === "number") {
        return value.toLocaleString()
      }
      return value
    }
    return { formatter }
  }, [])

  return (
    <ChartContext.Provider value={{ chartConfig: config, chartTooltip }}>
      <div ref={ref} className={cn("flex h-[300px] w-full flex-col items-center justify-center", className)} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

export { ChartContainer, ChartTooltip, ChartTooltipContent, CartesianGrid }
