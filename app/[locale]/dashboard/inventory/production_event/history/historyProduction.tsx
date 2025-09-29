"use client"
import { ProductionEventRow } from "@/types/production";
import { useEffect, useState } from "react";
import { SheetState } from "../productionInit";
import { getProductionEvents } from "@/actions/production";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ProductionHistoryTable } from "@/components/dashboard/inventory/production-history-table";
import { Progress } from "@/components/ui/progress";
import { Sheet } from "@/components/ui/sheet";
import { SheetProduction } from "@/components/dashboard/inventory/sheetProduction";

export default function HistoryProduction() {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [productions, setProductions] = useState<ProductionEventRow[]>([]);
    const [sheetState, setSheetState] = useState<SheetState>(null);
    const t = useTranslations("PRODUCTION-HISTORY");

    async function loadProductions() {
        const {data}  = await getProductionEvents();
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
        loadProductions();
    }, []);


    return (
        <div className="max-h-screen overflow-y-auto space-y-4">
            <div className="flex flex-col items-start">
                <h1 className="text-2xl font-bold tracking-tight">{t("TITLE")}</h1>
                <p className="text-sm text-muted-foreground tracking-tight">{t("DESCRIPTION")}</p>
            </div>
            {
                loading ? (
                    <div className="flex flex-col items-center justify-center p-8 gap-4">
                        <span className="text-muted-foreground">{t("LOADING")}</span>
                        <Progress value={progress} className="w-2/3 h-3" />
                    </div>
                ) : (
                    <ProductionHistoryTable
                        data={productions}
                        onSelectRow={(id, type) => setSheetState({ mode: "edit", type:type, eventId: id })} 
                    ></ProductionHistoryTable>                    
                )
            }
            <Sheet open={!!sheetState} onOpenChange={() => setSheetState(null)}>
                {sheetState && (
                    <SheetProduction
                        type={sheetState.type}
                        eventId={sheetState.mode === "edit" ? sheetState.eventId : null}
                        onClose={() => {setSheetState(null); loadProductions()}}
                    />
                )}
            </Sheet>
        </div>
    );
}