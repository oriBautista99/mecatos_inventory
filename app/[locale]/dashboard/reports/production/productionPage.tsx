"use client"

import { getDailyProductionSeries, getShowcaseAging, getShowcaseSnapshot, getTopProducedByItem } from "@/actions/reports/production";
import { ChartCard } from "@/components/dashboard/reports/card-chart";
import CardInfo from "@/components/dashboard/reports/card-info";
import ReportsFilter from "@/components/dashboard/reports/reports-filter";
import { Progress } from "@/components/ui/progress";
import { AgingRow, DailySeriesRow, SnapshotRow, TopProducedRow } from "@/types/reports";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";

export default function ProductionPage() {

    const [range, setRange] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 7)), // hace 7 días
        to: new Date(), // hoy
    });
    const t = useTranslations("PRODUCTION-REPORTS");
    const [top, setTop] = useState<TopProducedRow[]>([])
    const [series, setSeries] = useState<DailySeriesRow[]>([])
    const [snapshot, setSnapshot] = useState<SnapshotRow[]>([])
    const [aging, setAging] = useState<AgingRow[]>([]);

    const [prevTop, setPrevTop] = useState<TopProducedRow[]>([])

    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

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
            const toPrev   = prevRange?.to   ? endOfDay(prevRange.to)    : endOfDay(today);


            const [r1, r2, r3, r5, p1] = await Promise.all([
                getTopProducedByItem(dateRange, 10),
                getDailyProductionSeries(dateRange),
                getShowcaseSnapshot(dateRange),
                getShowcaseAging(),
                getTopProducedByItem({from:fromPrev, to: toPrev}, 10)
            ])
            if (!r1?.error && r1?.data) setTop(r1.data)
            if (!r2?.error && r2?.data) setSeries(r2.data)
            if (!r3?.error && r3?.data) setSnapshot(r3.data)
            if (!r5?.error && r5?.data) setAging(r5.data)
            if (!p1?.error && p1?.data) setPrevTop(p1.data)

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

    //Data cards
    const totalProduced = top.reduce((a,b)=>a + Number(b.total_produced||0), 0)
    const totalSnapshot = snapshot.reduce((a,b)=>a + Number(b.remaining_quantity||0), 0)

    // Totales previos
    const prevProduced = prevTop.reduce((a,b)=>a + Number(b.total_produced||0), 0)

    // KPIs derivados
    const avgDaily = series.length > 0 ? totalProduced / series.length : 0

    // Variaciones
    const varProduced = prevProduced > 0 ? ((totalProduced - prevProduced)/prevProduced)*100 : 0
    

    // Buckets de aging en cliente: 0-1d, 2-3d, 4+días
    const agingBuckets = useMemo(() => {
        const now = new Date()
        const buckets: Record<string, number> = { "0-1 días":0, "2-3 días":0, "4+ días":0 }
        aging.forEach((row) => {
        const due = new Date(row.due_date)
        const diff = Math.ceil((due.getTime() - now.getTime()) / (1000*60*60*24))
        const qty = Number(row.remaining_quantity || 0)
        if (diff <= 1) buckets["0-1 días"] += qty
        else if (diff <= 3) buckets["2-3 días"] += qty
        else buckets["4+ días"] += qty
        })
        return Object.entries(buckets).map(([name, value]) => ({ name, value }))
    }, [aging])

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
            { loading ? (
                <div className="flex flex-col items-center justify-center p-8 gap-4">
                    <span className="text-muted-foreground">{t("LOADING")}</span>
                    <Progress value={progress} className="w-2/3 h-3" />
                </div>
            ): (
                <div className="space-y-4">
                    {/* KPIs Snapshot */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <CardInfo
                            title={t("CARD-1-TITLE")}
                            description={t("CARD-1-DESCRIPTION")}
                            sign={t("CARD-1-UNITS")}
                            value={totalSnapshot}
                        ></CardInfo>
                        <CardInfo
                            title={t("CARD-2-TITLE")}
                            description={t("CARD-2-DESCRIPTION")}
                            sign={t("CARD-2-UNITS")}
                            value={totalProduced}
                            variation={varProduced}
                        ></CardInfo>
                        <CardInfo
                            title={t("CARD-3-TITLE")}
                            description={t("CARD-3-DESCRIPTION")}
                            sign={t("CARD-3-UNITS")}
                            value={avgDaily.toFixed(1)}
                        ></CardInfo>
                    </div>
                    {/* Grid de charts */}
                    {range &&
                        <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-7 md:grid-rows-2 gap-4">
                            <div className="col-span-1 md:col-span-3 lg:col-span-4">
                                {/* Serie diaria */}
                                <ChartCard
                                    title={t("TITLE-CHART-1")}
                                    filename={`daily_production_${range.from}_${range.to}.csv`}
                                    data={series}
                                    xKey="event_day"
                                    yKey="total"
                                    typeChart="LINE"
                                    range={range}
                                    fetchData={getDailyProductionSeries}
                                    enableItemFilter={true}
                                ></ChartCard>                
                            </div>
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 md:col-start-4 lg:col-start-5 lg:row-start-1"> 
                                {/* Aging de vitrina */}
                                <ChartCard
                                    title={t("TITLE-CHART-2")}
                                    filename={`aging_${range.from}_${range.to}.csv`}
                                    data={agingBuckets}
                                    xKey="value"
                                    yKey="name"
                                    typeChart="PIE"
                                    range={range}
                                    enableItemFilter={false}
                                ></ChartCard> 
                            </div>
                            <div className="col-span-1 md:col-span-5 lg:col-span-7 md:col-start-1 md:row-start-2">
                                <ChartCard
                                    title={t("TITLE-CHART-3")}
                                    filename={`top_produced_${range.from}_${range.to}.csv`}
                                    data={top}
                                    xKey="item_name"
                                    yKey="total_produced"
                                    typeChart="BAR"
                                    range={range}
                                    fetchData={getTopProducedByItem}
                                    enableItemFilter={false}
                                ></ChartCard>        
                            </div>
                        </div>            
                    }                    
                </div>
            )}

        </div>
  );
}