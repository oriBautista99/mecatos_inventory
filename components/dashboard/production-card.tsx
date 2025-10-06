"use client"

import { getDailyProductionSeries } from "@/actions/reports/production";
import { DailySeriesRow } from "@/types/reports";
import { endOfDay, startOfDay } from "@/utils/range";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { Card } from "../ui/card";
import { ArrowRight, PackageCheck } from "lucide-react";
import { Button } from "../ui/button";
import { BarChartComponent } from "../bar-chart";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ProductionCard(){

    const [range] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 7)), // hace 7 días
        to: new Date(), // hoy
    });
    const [series, setSeries] = useState<DailySeriesRow[]>([])
    const pathname = usePathname(); 
    const t = useTranslations("DASH-PROD-CARD");

    async function load() {
        if(range) {
            const today = new Date();
            const from = range?.from ? startOfDay(range.from) : startOfDay(today);
            const to   = range?.to   ? endOfDay(range.to)     : endOfDay(today);

            const dateRange = { from, to };

            const r1 = await getDailyProductionSeries(dateRange);
            if (!r1?.error && r1?.data) setSeries(r1.data)
        }
    } 

    
    useEffect(() => { 
        load();
    }, [])

    return (
        <Card className="space-y-2 p-6 border-none h-full">
            <div className="flex flex-col justify-between h-full">
                <div className="flex justify-between">
                    <div className="flex gap-4">
                        <div className="flex justify-center items-center">
                            <PackageCheck className="h-6 w-6 text-primary"/>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-md font-semibold text-foreground tracking-tight">{t("TITLE")}</h1>
                            <p className="text-sm font-normal text-muted-foreground">{t("DESCRIP")}</p>                
                        </div>                
                    </div>
                    <Link href={pathname+'/reports/production'}>
                        <Button variant='ghost' className='group text-primary font-semibold'>
                            {t("MORE")}   
                            <ArrowRight className='transition-transform duration-200 group-hover:-translate-x-0.5' />
                        </Button>                    
                    </Link>

                </div>
                <div>
                    {
                        range &&
                        <div className="p-1 w-full h-auto">
                            <BarChartComponent
                                data={series}
                                xKey="event_day"
                                yKey="total"
                                xIsDate={true}
                                config={{
                                    total: { label: "Producción", color: "hsl(var(--chart-1))" },
                                }}
                            /> 
                        </div>
                    
                    }                    
                </div>
            </div>
        </Card>
    )

}