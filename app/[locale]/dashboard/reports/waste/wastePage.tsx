"use client"

import { getLossesByItem, getTopProducedByItem } from "@/actions/reports/production";
import { ChartCard } from "@/components/dashboard/reports/card-chart";
import CardInfo from "@/components/dashboard/reports/card-info";
import ReportsFilter from "@/components/dashboard/reports/reports-filter";
import { Progress } from "@/components/ui/progress";
import { LossesRow, TopProducedRow } from "@/types/reports";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

export default function WastePage() {

    const [losses, setLosses] = useState<LossesRow[]>([])
    const [prevLosses, setPrevLosses] = useState<LossesRow[]>([])
    const [top, setTop] = useState<TopProducedRow[]>([])
    const t = useTranslations("WASTE-REPORT");
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    const [range, setRange] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 7)), // hace 7 días
        to: new Date(), // hoy
    });

        // Calcula el rango anterior según el actual
    function getPrevRange(r: DateRange): DateRange | undefined{
        const fromDate = r.from
        const toDate = r.to
        if(fromDate && toDate){
            const diffDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000*60*60*24)) + 1
            const prevTo = fromDate
            prevTo.setDate(prevTo.getDate() - 1)          
            const prevFrom = new Date(prevTo)
            prevFrom.setDate(prevFrom.getDate() - diffDays + 1)
            return {
                from: prevFrom,
                to: prevTo
            }              
        }
        return undefined;
    }

    async function load() {
        if(range){
            const from = range?.from
            ? range.from.toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10)

            const to = range?.to
            ? range.to.toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10)

            const dateRange = { from, to }
            const prevRange = getPrevRange(range);

            const fromPrev = prevRange?.from
            ? prevRange.from.toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10)

            const toPrev = prevRange?.to
            ? prevRange.to.toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10)


            const [r1,r2, p1] = await Promise.all([
                getTopProducedByItem(dateRange),
                getLossesByItem(dateRange),
                getLossesByItem({from:fromPrev, to: toPrev})
            ])
            if (!r1?.error && r1?.data) setTop(r1.data)
            if (!r2?.error && r2?.data) setLosses(r2.data)
            if (!p1?.error && p1?.data) setPrevLosses(p1.data)

            const timer: NodeJS.Timeout = setInterval(() => {
            setProgress((old) => {
                if (old >= 100) {
                    clearInterval(timer)
                    setLoading(false)
                    return 100
                }
                return old + 20
                })
            }, 150)
            return () => clearInterval(timer)            
        }

    }

    useEffect(() => { 
            load();
         }, [])
    
    function onApply() { load() }

    const totalProduced = top.reduce((a,b)=>a + Number(b.total_produced||0), 0)
    const totalLosses   = losses.reduce((a,b)=>a + Number(b.total_loss||0), 0);
    const prevLossesTotal   = prevLosses.reduce((a,b)=>a + Number(b.total_loss||0), 0);
    const lossRate = totalProduced > 0 ? (totalLosses / totalProduced) * 100 : 0
    const varLosses = prevLossesTotal > 0 ? ((totalLosses - prevLossesTotal)/prevLossesTotal)*100 : 0

    
    return (
        <div className="overflow-y-hidden space-y-4">
            <div className="flex px-2 md:pb-4 items-center justify-between gap-4">
                <div className="w-full flex flex-col items-start">
                    <h1 className="text-2xl font-bold tracking-tight">{t("TITLE")}</h1>
                </div>
                {/* Filtros */}
                <ReportsFilter range={range}
                    onChange={setRange}
                    onApply={onApply}
                    loading={loading} >
                </ReportsFilter>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CardInfo
                    title={t("CARD-1-TITLE")}
                    description={t("CARD-1-DESCRIPTION")}
                    sign={t("CARD-1-UNITS")}
                    value={totalLosses}
                    variation={varLosses}
                ></CardInfo>
                <CardInfo
                    title={t("CARD-2-TITLE")}
                    description={t("CARD-2-DESCRIPTION")}
                    sign={t("CARD-2-UNITS")}
                    value={lossRate.toFixed(1)}
                ></CardInfo> 
            </div>

            {
                loading ? (
                    <div className="flex flex-col items-center justify-center p-8 gap-4">
                        <span className="text-muted-foreground">{t("LOADING")}</span>
                        <Progress value={progress} className="w-2/3 h-3" />
                    </div>
                ):(
                    range &&
                    <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-7 md:grid-rows-2 gap-4">
                        <div className="col-span-1 md:col-span-3 lg:col-span-5">
                            {/* Pérdidas por ítem */}
                            <ChartCard
                                title={t("TITLE-CHART-1")}
                                filename={`losses_${range.from}_${range.to}.csv`}
                                data={losses}
                                xKey="item_name"
                                yKey="total_loss"
                                typeChart="BAR"
                                range={range}
                                enableItemFilter={false}
                            ></ChartCard>                
                        </div>
                    </div>                    
                )
            }
        </div>
    );
}