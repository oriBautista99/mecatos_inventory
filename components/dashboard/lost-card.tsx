import { getLossesByDate } from "@/actions/reports/waste";
import { LossByDay } from "@/types/reports";
import { endOfDay, startOfDay } from "@/utils/range";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { Card } from "../ui/card";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { AreaChartComponent } from "../area-chart";
import Link from "next/link";
import { Spinner } from "../ui/spinner";

export default function LostCard(){
    const [range] = useState<DateRange | undefined>({
        from: new Date(new Date().setDate(new Date().getDate() - 7)), // hace 7 días
        to: new Date(), // hoy
    });
    const [lossesByDay, setLossesByDay] = useState<LossByDay[]>([])
    const pathname = usePathname(); 
    const t = useTranslations("DASH-LOST-CARD");

    async function load() {
        if(range) {
            const today = new Date();
            const from = range?.from ? startOfDay(range.from) : startOfDay(today);
            const to   = range?.to   ? endOfDay(range.to)     : endOfDay(today);

            const dateRange = { from, to };

            const r1 = await getLossesByDate(dateRange);
            if (!r1?.error && r1?.data) setLossesByDay(r1.data)
        }
    } 

    
    useEffect(() => { 
        load();
    }, []);

    
    return (
        <Card className="space-y-2 p-6 border-none h-full">
            <div className="flex flex-col justify-between h-full">
                <div className="flex justify-between">
                    <div className="flex gap-4">
                        <div className="flex justify-center items-center">
                            <Trash className="h-6 w-6 text-primary"/>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-md font-semibold text-foreground tracking-tight">{t("TITLE")}</h1>
                            <p className="text-sm font-normal text-muted-foreground">{t("DESCRIP")}</p>                
                        </div>                
                    </div>
                    <Link href={pathname+'/reports/waste'}>
                        <Button variant='ghost' className='group text-primary font-semibold'>
                            {t("MORE")}   
                            <ArrowRight className='transition-transform duration-200 group-hover:-translate-x-0.5' />
                        </Button>                    
                    </Link>

                </div>
                <div>
                    {
                        range && lossesByDay ? (
                            <div className="p-1 w-full">
                                <AreaChartComponent
                                    data={lossesByDay}
                                    xKey="loss_date"
                                    yKey="total_loss"
                                    xIsDate={true}
                                    config={{
                                        total: { label: "Perdida", color: "hsl(var(--chart-1))" },
                                    }}
                                /> 
                            </div>                            
                        ) : (
                            <div className="w-full flex justify-center items-center p-4 gap-2">
                                <Spinner className="size-9 text-primary/80" /> 
                                <p className="text-sm text-muted-foreground">{t("LOADING")}</p>
                            </div>
                        )

                    }                    
                </div>
            </div>
        </Card>
    )
    
}