"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { [key: string]: { label: string; color?: string } }
export type ChartConfig = Record<
    string,
    {
        label: React.ReactNode
        icon?: React.ComponentType
        color?: string
        theme?: Record<string, string>
    }
>

type ChartContextProps = {
    config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
    const context = React.useContext(ChartContext)
    if (!context) {
        throw new Error("useChart must be used within a ChartContainer")
    }
    return context
}

export function ChartContainer({
    id,
    className,
    config,
    children,
    ...props
}: React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ReactNode
}) {
    const chartId = React.useId()

    return (
        <ChartContext.Provider value={{ config }}>
            <div
                id={id || chartId}
                className={cn(
                    "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
                    className
                )}
                {...props}
            >
                <ChartStyle id={id || chartId} config={config} />
                <RechartsPrimitive.ResponsiveContainer>
                    {children}
                </RechartsPrimitive.ResponsiveContainer>
            </div>
        </ChartContext.Provider>
    )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
    const colorConfig = Object.entries(config).filter(
        ([_, config]) => config.theme || config.color
    )

    if (!colorConfig.length) {
        return null
    }

    return (
        <style
            dangerouslySetInnerHTML={{
                __html: Object.entries(config)
                    .map(([key, item]) => {
                        const color = item.theme?.["light"] || item.color
                        return color ? `#${id} [data-chart="${key}"] { --color-chart: ${color}; }` : null
                    })
                    .join("\n"),
            }}
        />
    )
}

export const ChartTooltip = RechartsPrimitive.Tooltip

export function ChartTooltipContent({
    active,
    payload,
    label,
    className,
    indicator = "dot",
    hideLabel = false,
    labelKey,
    labelFormatter,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
    indicator?: "line" | "dot" | "dashed"
    hideLabel?: boolean
    labelKey?: string
    labelFormatter?: (label: any, payload: any[]) => React.ReactNode
}) {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
        if (hideLabel || !payload?.length) {
            return null
        }

        const [item] = payload
        const key = `${labelKey || item.dataKey || item.name || "value"}`
        const itemConfig = config[key]
        const value =
            !labelKey && typeof label === "string"
                ? config[label]?.label || label
                : itemConfig?.label || label

        if (labelFormatter) {
            return (
                <div className="font-medium text-[12px] leading-[18px]">
                    {labelFormatter(value, payload)}
                </div>
            )
        }

        if (!value) {
            return null
        }

        return <div className="font-medium text-[12px] leading-[18px]">{value}</div>
    }, [label, labelFormatter, payload, hideLabel, labelKey, config])

    if (!active || !payload?.length) {
        return null
    }

    return (
        <div
            className={cn(
                "grid min-w-[8rem] items-start gap-1.5 rounded-lg border bg-white px-2.5 py-1.5 text-xs shadow-xl",
                className
            )}
        >
            {!hideLabel ? tooltipLabel : null}
            <div className="grid gap-1.5">
                {payload.map((item, index) => {
                    const key = `${item.dataKey || item.name || "value"}`
                    const itemConfig = config[key]
                    const indicatorColor = item.payload.fill || item.color

                    return (
                        <div
                            key={item.dataKey || index}
                            className="flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground"
                        >
                            {indicator === "dot" && (
                                <div
                                    className="shrink-0 w-1 rounded-[2px]"
                                    style={{
                                        backgroundColor: indicatorColor,
                                    }}
                                />
                            )}
                            <div className="flex flex-1 justify-between leading-none items-center gap-2">
                                <div className="grid gap-0.5">
                                    <span className="text-muted-foreground text-[11px] leading-[16px]">
                                        {itemConfig?.label || item.name}
                                    </span>
                                </div>
                                {item.value && (
                                    <span className="font-mono font-medium tabular-nums text-foreground text-[11px] leading-[16px]">
                                        {item.value.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export const ChartLegend = RechartsPrimitive.Legend
