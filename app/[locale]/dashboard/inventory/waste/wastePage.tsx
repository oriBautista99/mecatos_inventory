"use client"

import { getLoss } from "@/actions/loss";
import LossSheet from "@/components/dashboard/inventory/loss-sheet";
import LossTable from "@/components/dashboard/inventory/loss-table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet } from "@/components/ui/sheet";
import { LossEventRow } from "@/types/loss";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type SheetState =
        {mode: 'create' | null} 
        | {mode: 'edit'; eventId: number | null} 
        | null;

export default function WastePage(){

    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [productions, setProductions] = useState<LossEventRow[]>([]);
    const [sheetState, setSheetState] = useState<SheetState>(null);
    const t = useTranslations("WASTE-PAGE");

    async function loadLoss() {
        const {data}  = await getLoss();
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
            toast.error('Error al cargar perdidas');
        }
    }

    useEffect(() => {
        loadLoss();
    }, []);

    return(
        <div className="max-h-screen overflow-y-auto space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center w-full space-y-4 md:space-y-2">
                <div className="flex flex-col items-start">
                    <h1 className="text-2xl font-bold tracking-tight">{t("TITLE")}</h1>
                    <p className="text-sm text-muted-foreground tracking-tight">{t("DESCRIPTION")}</p>
                </div>
                <Sheet open={!!sheetState} onOpenChange={(open) => !open && setSheetState(null)}>
                    
                    <Button className="w-full sm:w-fit" onClick={() => setSheetState({ mode: "create" })}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t("REGISTER-WASTE")}
                    </Button>
                    {
                        sheetState && (
                            <LossSheet
                                eventId={sheetState.mode === "edit" ? sheetState.eventId : null}
                                onClose={() => {setSheetState(null); loadLoss()}}
                            ></LossSheet>                            
                        )
                    }

                </Sheet>
            </div>
            {
                loading ? (
                    <div className="flex flex-col items-center justify-center p-8 gap-4">
                        <span className="text-muted-foreground">{t("LOADING")}</span>
                        <Progress value={progress} className="w-2/3 h-3" />
                    </div>
                ) : (
                    <LossTable
                        data={productions}
                        onSelectRow={(id) => setSheetState({mode: 'edit', eventId: id})} 
                    ></LossTable>                    
                )
            }
        </div>
    );
}