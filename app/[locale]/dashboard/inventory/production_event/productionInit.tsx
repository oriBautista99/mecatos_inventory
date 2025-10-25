"use client"

import { getProductionEvents } from "@/actions/production";
import CardProductions from "@/components/dashboard/inventory/card-productions";
import { ProductionHistoryTable } from "@/components/dashboard/inventory/production-history-table";
import { SheetProduction } from "@/components/dashboard/inventory/sheetProduction";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { TYPE_PRODUCTION } from "@/types/constants";
import { ProductionEventRow } from "@/types/production";
import { Progress } from "@radix-ui/react-progress";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export type SheetState =
  | { mode: "create"; type?: typeof TYPE_PRODUCTION[keyof typeof TYPE_PRODUCTION] | null }
  | { mode: "edit"; eventId: number ; type?:  typeof TYPE_PRODUCTION[keyof typeof TYPE_PRODUCTION] | null}
  | null;

export default function ProductionInit() {
     
    const pathname = usePathname(); 
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [productions, setProductions] = useState<ProductionEventRow[]>([]);
    const [sheetState, setSheetState] = useState<SheetState>(null);
    const t = useTranslations("PRODUCTION-INIT");

    async function loadDailyProductions() {
        const today = formatDate(new Date());
        const {data}  = await getProductionEvents(today);
        if(data) {
            setProductions(data.map((row) => ({
                ...row,
                profiles: Array.isArray(row.profiles) ? row.profiles[0] : row.profiles,
            })));
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
        }else{
            toast.error('Error al cargar producciones');
        }
    }

    useEffect(() => {
        loadDailyProductions();
    }, []);


    return (
        <div className="max-h-screen overflow-y-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center w-full space-y-4 md:space-y-2">
                <div className="flex flex-col items-start">
                    <h1 className="text-2xl font-bold tracking-tight">{t("TITLE")}</h1>
                    <p className="text-sm text-muted-foreground tracking-tight">{t("DESCRIPTION")}</p>
                </div>
                <Link className="w-full md:w-fit" href={`${pathname}/history`}>
                    <Button className="w-full md:w-fit">
                        {t("HISTORY")}
                    </Button>        
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-3 md:grid-rows-1 gap-8">
                <div className="w-full">
                    <CardProductions
                        url="BREAD"
                        title={t("CARD-BREAD")}
                        description={t("CARD-BREAD-DESCP")}
                        onSheet={() => setSheetState({ mode: "create", type:'BREAD' })}
                    ></CardProductions>
                </div>
                <div>
                    <CardProductions
                        url="PASTRY"
                        title={t("CARD-PASTRY")}
                        description={t("CARD-PASTRY-DESCP")}
                        onSheet={() => setSheetState({ mode: "create", type:'PASTRY' })}
                    ></CardProductions>
                </div>
                <div>
                    <CardProductions
                        url="DESSERT"
                        title={t("CARD-DESSERT")}
                        description={t("CARD-DESSERT-DESCP")}
                        onSheet={() => setSheetState({ mode: "create", type:'DESSERT' })}
                    ></CardProductions>
                </div>
                <Sheet open={!!sheetState} onOpenChange={() => setSheetState(null)}>
                    {sheetState && (
                        <SheetProduction
                            type={sheetState.type}
                            eventId={sheetState.mode === "edit" ? sheetState.eventId : null}
                            onClose={() => {setSheetState(null); loadDailyProductions()}}
                        />
                    )}
                </Sheet>
            </div>
            {
                loading ? (
                    <div className="flex flex-col items-center justify-center p-8 gap-4">
                        <span className="text-muted-foreground">{t("LOADING")}</span>
                        <Progress value={progress} className="w-2/3 h-3" />
                    </div>
                ) : (
                    <div className="flex flex-col w-full gap-2">
                        <h1 className="pl-2 text-xl font-bold tracking-tight">Producciones del día</h1>
                        <ProductionHistoryTable
                            data={productions}
                            daily={true}
                            onSelectRow={(id, type) => setSheetState({ mode: "edit", type:type, eventId: id })} 
                        ></ProductionHistoryTable>   
                    </div>
                 
                )
            }

        </div>
    );
}