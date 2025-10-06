"use client"

import { AreaChartComponent } from "@/components/area-chart"
import { BarChartComponent } from "@/components/bar-chart"
import { LineChartComponent } from "@/components/line-chart"
import { PieChartComponent } from "@/components/PieChart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useItemsSWR } from "@/hooks/useItems"
import { TypeOfDataCharts } from "@/types/reports"
import { Download } from "lucide-react"
import { useEffect, useState } from "react"
import { DateRange } from "react-day-picker"

type PropChartCard = {
    title:string
    descripcion?: string
    footer?: string
    data: TypeOfDataCharts[]
    xKey: string
    yKey: string
    filename:string
    typeChart: string
    range: DateRange
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchData?: (range: { from: string; to: string }, itemId?: number) => Promise<any>
    enableItemFilter?: boolean
}

function detectChartType(data: TypeOfDataCharts[], typeChart: string) {

    if (!data || data.length === 0) return typeChart;

    const sample = data[0];

    if ("event_day" in sample && "total" in sample) {
        return "LINE";
    }

    if ("item_name" in sample && "total_produced" in sample) {
        return "BAR";
    }

    if ("name" in sample && "value" in sample) {
        return "PIE";
    }

    if ("reason" in sample && "total_loss" in sample) {
        return "AREA";
    }

    return typeChart;
}

export function ChartCard({title, data, xKey, yKey, filename, typeChart, range, fetchData, enableItemFilter=false}: PropChartCard){

    const [itemId, setItemId] = useState<number | undefined>(undefined)
    const [localData, setLocalData] = useState<TypeOfDataCharts[]>(data)
    const { items=[] } = useItemsSWR();
    const filterItems = items.filter(it => it.production_type);
    const [resolvedType, setResolvedType] = useState<string>(typeChart) 

    useEffect(() => {
        async function reload() {
            if (fetchData && range && range.from && range.to) {
                const {data:newData, error} = await fetchData(
                    { from: range.from.toISOString().slice(0, 10), to: range.to.toISOString().slice(0, 10) },
                    itemId
                )
                if (!error) setLocalData(newData)
                setResolvedType(detectChartType(newData, typeChart))
            } else {
                setLocalData(data);
            }
        }
        reload()
    }, [itemId, range, data])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function downloadCSV(filename: string, rows: any[]) {
        if (!rows?.length) return
        const headers = Object.keys(rows[0])
        const csv = [headers.join(","), ...rows.map(r => headers.map(h => `"${(r[h]??"").toString().replace(/"/g,'""')}"`).join(","))].join("\n")
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }
    
    return(
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex flex-col space-y-1">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>
                        {range?.from?.toLocaleDateString()} - {range?.to?.toLocaleDateString()}
                    </CardDescription>                    
                </div>
                <div className="flex items-center justify-end gap-2 max-w-xs w-full">
                    {enableItemFilter && (
                        <div className="w-full">
                            <Select 
                                value={itemId ? String(itemId) : "all"}   // "all" representa Todos
                                onValueChange={(value) => {
                                if (value === "all") {
                                    setItemId(undefined)  // Todos = sin filtro
                                } else {
                                    setItemId(Number(value))
                                }
                                }}
                            >
                                <SelectTrigger id="itemId" className="relative w-full text-sm py-2 h-8">
                                    <SelectValue
                                        className="text-sm sm:text-base lg:text-sm tracking-tight"
                                        placeholder="Filtrar por producto"
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                {/* Opción Todos */}
                                    <SelectItem
                                        className="text-sm sm:text-base lg:text-sm"
                                        value="all"
                                    >
                                        Todos
                                    </SelectItem>

                                {/* Opciones dinámicas */}
                                {filterItems.map((item) => (
                                    <SelectItem
                                        className="text-sm sm:text-base lg:text-sm"
                                        key={item.item_id}
                                        value={String(item.item_id)}
                                        >
                                        {item.name}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>                            
                        </div>
                    )}
                    <Button variant="secondary" onClick={()=>downloadCSV(filename, data)}>
                        <Download className="w-4 h-4"/>
                    </Button> 
                </div>

            </CardHeader>    
            <CardContent className="mx-auto aspect-auto h-60 w-full">
                {
                    resolvedType === "BAR" &&
                        <BarChartComponent
                            data={localData}
                            xKey={xKey}
                            yKey={yKey}
                            config={{
                                total_produced: {
                                    label: "Producido",
                                    color: "hsl(var(--chart-1))",
                                },
                                total_loss: {
                                    label: "Perdido",
                                    color: "hsl(var(--chart-1))",
                                },
                            }}                        
                        >
                        </BarChartComponent>                                                                                  
                }
                {
                    resolvedType === "PIE" && localData.length> 0 &&
                        <PieChartComponent
                            data={localData}
                            nameKey={yKey}
                            valueKey={xKey}
                            config={{
                                "0-1 días": { label: "0-1 días", color: "hsl(var(--chart-1))" },
                                "2-3 días": { label: "2-3 días", color: "hsl(var(--chart-2))" },
                                "4+ días":  { label: "4+ días",  color: "hsl(var(--chart-3))" },
                            }}                        
                        >
                        </PieChartComponent>                                                                                  
                }
                {
                    resolvedType === 'LINE' && 
                        <LineChartComponent
                            data={localData}
                            xKey={xKey}
                            yKey={yKey}
                            xIsDate={true}
                            config={{
                                total: { label: "Producción", color: "hsl(var(--chart-1))" },
                            }}
                        />
                }
                {
                    resolvedType === 'AREA' && 
                        <AreaChartComponent
                            data={localData}
                            xKey={xKey}
                            yKey={yKey}
                            xIsDate={false}
                            config={{
                                total: { label: "Producción", color: "hsl(var(--chart-1))" },
                            }}
                        />
                }
            </CardContent>
        </Card>

    );
}