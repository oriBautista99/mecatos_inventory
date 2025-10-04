"use client"

import {
  XAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TypeOfDataCharts } from "@/types/reports"

type ChartConfig = Record<
  string,
  { label: string; color: string }
>

type PropChartLine = {
  data: TypeOfDataCharts[]
  xKey: string         // clave del eje X (ej. fecha o categoría)
  yKey: string         // clave del valor (ej. total)
  config: ChartConfig  // colores/labels
  xIsDate?: boolean    // formatear eje X como fecha
}

export function AreaChartComponent({ data, xKey, yKey, config, xIsDate = false }: PropChartLine) {
  return (
    <ChartContainer config={config} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
            accessibilityLayer
            data={data} 
            margin={{ left: 12, right: 12 }}>
          <CartesianGrid vertical={false} />

          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => {
              if (!xIsDate) return value
              const date = new Date(value)
              return date.toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
              })
            }}
          />

          <YAxis />

          <ChartTooltip
            content={
              <ChartTooltipContent
                className="w-[150px]"
                nameKey={yKey}
                labelFormatter={(value) => {
                  if (!xIsDate) return value
                  return new Date(value).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                }}
              />
            }
          />

          <Area
            type="natural"
            dataKey={yKey}
            stroke={`hsl(var(--chart-1))`}
            strokeWidth={2}
            fill="hsl(var(--chart-1))"
            activeDot={{
                r: 6,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
