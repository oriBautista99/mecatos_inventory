import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { TypeOfDataCharts } from "@/types/reports";

type ChartConfig = Record<
  string,
  { label: string; color: string }
>

type PropChartBar = {
    data: TypeOfDataCharts[]
    xKey: string
    yKey: string
    xIsDate?: boolean // si el eje X son fechas
    config: ChartConfig
    label?: string    // nombre de la métrica (para tooltip)
}

export function BarChartComponent({ data, xKey, yKey, config, xIsDate = false, label } : PropChartBar){
    return(
        <ChartContainer config={config} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                data={data}
                margin={{ left: 4, right: 4 }}
                >
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
                        nameKey={label ?? yKey}
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

                <Bar dataKey={yKey} radius={8} fill={`var(--color-${yKey}, #3b82f6)`} />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}