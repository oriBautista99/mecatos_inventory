"use client"

import { getTopProducedByItem } from "@/actions/reports/production";
import { getLossesByDate, getLossesByItem, getLossesByReason } from "@/actions/reports/waste";
import { ChartCard } from "@/components/dashboard/reports/card-chart";
import CardInfo from "@/components/dashboard/reports/card-info";
import ReportsFilter from "@/components/dashboard/reports/reports-filter";
import { Progress } from "@/components/ui/progress";
import { LossByDay, LossesByReason, LossesRow, TopProducedRow } from "@/types/reports";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

export default function WastePage() {

    const [losses, setLosses] = useState<LossesRow[]>([])
    const [lossesByReason, setLossesByReason] = useState<LossesByReason[]>([])
    const [lossesByDay, setLossesByDay] = useState<LossByDay[]>([])
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

    function startOfDay(date: Date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.toISOString();
    }

    function endOfDay(date: Date) {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d.toISOString();
    }

    async function load() {
        if(range){
            const today = new Date();
            const from = range?.from ? startOfDay(range.from) : startOfDay(today);
            const to   = range?.to   ? endOfDay(range.to)     : endOfDay(today);
            const dateRange = { from, to };
            const prevRange = getPrevRange(range);
            const fromPrev = prevRange?.from ? startOfDay(prevRange.from) : startOfDay(today);
            const toPrev   = prevRange?.to   ? endOfDay(prevRange.to)     : endOfDay(today);
            const [r1,r2, r3, r4, p1] = await Promise.all([
                getTopProducedByItem(dateRange),
                getLossesByItem(dateRange),
                getLossesByReason(dateRange),
                getLossesByDate(dateRange),
                getLossesByItem({from:fromPrev, to: toPrev})
            ])
            if (!r1?.error && r1?.data) setTop(r1.data)
            if (!r2?.error && r2?.data) setLosses(r2.data)
            if (!r3?.error && r3?.data) setLossesByReason(r3.data)
            if (!r4?.error && r4?.data) setLossesByDay(r4.data)
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
            <div className="flex px-2 items-center justify-between gap-4">
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
            {
                loading ? (
                    <div className="flex flex-col items-center justify-center p-8 gap-4">
                        <span className="text-muted-foreground">{t("LOADING")}</span>
                        <Progress value={progress} className="w-2/3 h-3" />
                    </div>
                ):(
                    range &&
                    <div className="space-y-4">
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
                        <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-7 md:grid-rows-2 gap-4">
                            <div className="col-span-1 md:col-span-3 lg:col-span-7">
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
                            <div className="col-span-1 md:col-span-2 lg:col-span-4">
                                {/* Pérdidas por ítem */}
                                <ChartCard
                                    title={t("TITLE-CHART-2")}
                                    filename={`losses_by_day_${range.from}_${range.to}.csv`}
                                    data={lossesByDay}
                                    xKey="loss_date"
                                    yKey="total_loss"
                                    typeChart="LINE"
                                    range={range}
                                    enableItemFilter={false}
                                ></ChartCard>                
                            </div>
                            <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                {/* Pérdidas por ítem */}
                                <ChartCard
                                    title={t("TITLE-CHART-3")}
                                    filename={`losses_by_reason_${range.from}_${range.to}.csv`}
                                    data={lossesByReason}
                                    xKey="reason"
                                    yKey="total_loss"
                                    typeChart="AREA"
                                    range={range}
                                    enableItemFilter={false}
                                ></ChartCard>                
                            </div>
                        </div>                         
                    </div>
                   
                )
            }
        </div>
    );
}