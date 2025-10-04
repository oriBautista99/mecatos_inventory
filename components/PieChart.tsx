"use client"

import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TypeOfDataCharts } from "@/types/reports"

type ChartConfig = Record<
  string,
  { label: string; color: string }
>

type PropChartPie = {
  data: TypeOfDataCharts[]
  nameKey: string       // la categoría (ej: item_name, bucket, etc.)
  valueKey: string      // el valor (ej: total, remaining, etc.)
  config: ChartConfig   // configuración de colores/labels
}

export function PieChartComponent({
  data,
  nameKey,
  valueKey,
  config
}: PropChartPie) {
  return (
    <ChartContainer
      config={config}
      className="h-full w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={data}
            dataKey={valueKey}    
            innerRadius={40}
          >
            {data.map((entry, index) => {
              const key = entry[nameKey as keyof typeof entry] as string
              const color = config[key]?.color ?? `hsl(var(--chart-${(index % 5) + 1}))`
              return <Cell key={`cell-${index}`} fill={color} />
            })}
          </Pie>
          <ChartLegend
              content={<ChartLegendContent nameKey={nameKey} />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
        </PieChart>
        
      </ResponsiveContainer>
    </ChartContainer>
  )
}
