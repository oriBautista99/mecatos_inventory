"use client"

import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AgingRow, AgingRowChart, DailySeriesRow, LossesRow, SnapshotRow, TopProducedRow } from "@/types/reports"

type ChartConfig = Record<
  string,
  { label: string; color: string }
>

type PropChartLine = {
  data: TopProducedRow[] | DailySeriesRow[] | LossesRow[] | SnapshotRow[] | AgingRow[] | AgingRowChart[]
  xKey: string         // clave del eje X (ej. fecha o categoría)
  yKey: string         // clave del valor (ej. total)
  config: ChartConfig  // colores/labels
  xIsDate?: boolean    // formatear eje X como fecha
}

export function LineChartComponent({ data, xKey, yKey, config, xIsDate = false }: PropChartLine) {
  return (
    <ChartContainer config={config} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={data} margin={{ left: 12, right: 12 }}>
          <CartesianGrid vertical={false} />

          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={20}
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

          <Line
            type="natural"
            dataKey={yKey}
            stroke={`hsl(var(--chart-1))`}
            strokeWidth={2}
            dot={{
                fill: "var(--color-desktop)",
              }}
              activeDot={{
                r: 6,
              }}
          />
        </ReLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
