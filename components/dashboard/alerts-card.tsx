"use client"

import { AlertRow } from "@/types/alert";
import { useEffect, useState } from "react";
import { getPendingAlerts, resolveAlert } from "@/actions/alerts";
import { Card } from "../ui/card";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Check, CircleAlert, BookCheck } from "lucide-react";
import { Button } from "../ui/button";
import { useProfileLoginSWR } from "@/hooks/useUserLogin";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Spinner } from "../ui/spinner";

export default function AlertsCard() {

    const [alerts, setAlerts] = useState<AlertRow[]>([]);
    const pathname = usePathname(); 
    const { profile } = useProfileLoginSWR();
    const t = useTranslations("DASH-CARD-ALERTS");
    
    async function loadAlerts() {
        const { data, error } = await getPendingAlerts(4);
        if (!error && data) {
            setAlerts(data as AlertRow[]);
        };
    }

    useEffect(() => {
        loadAlerts();
    }, []);

    async function handleResolve(alertId: number) {
        if (profile) {
            const response = await resolveAlert(String(alertId), String(profile.profile_id));
            if (response.success) {
                toast.success(t("RESOLVED-SUCCESSFULLY"));
            }
        }
    }

    return(
        <Card className="p-6 border-none h-full max-h-full">
            <div className="flex flex-col justify-between h-full relative space-y-2">
                <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex justify-center items-center">
                            <BookCheck className="h-6 w-6 text-primary"/>
                        </div>
                        <h1 className="text-md font-semibold text-foreground tracking-tight">{t("TITLE")}</h1>
                    </div>
                    <Link href={pathname+'/reports/waste'}>
                        <Button variant='ghost' className='group text-primary font-semibold'>
                            {t("MORE")} 
                            <ArrowRight className='transition-transform duration-200 group-hover:-translate-x-0.5' />
                        </Button>                    
                    </Link>
                </div>
                <div className="flex flex-col space-y-2">
                    <div className="flex flex-col">
                            <p className="text-sm font-normal text-muted-foreground">{t("DESCRIPTION")}</p>                 
                    </div>
                    <div className="space-y-2 overflow-y-auto max-h-[300px]">
                        {
                            alerts.length > 0 ? 
                            (
                                alerts.map((alert) => {
                                    return(
                                        <div key={alert.alert_id} className="p-3 bg-accent/10 hover:bg-accent/25 rounded-lg shadow-sm transition-all hover:shadow-md">
                                            <div className="flex items-center justify-between gap-3 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex justify-center items-center">
                                                        <CircleAlert className="h-5 w-5 text-accent"></CircleAlert>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-foreground text-sm">
                                                            {alert.item_name}
                                                        </span>
                                                        <span className="text-muted-foreground text-xs">
                                                            {t("EXPIRATION")}: <span className="text-foreground font-medium">{new Date(alert.due_date).toLocaleDateString()}</span>
                                                        </span>
                                                        <span className="text-muted-foreground text-xs font-medium">
                                                            {t("QTY")}: <span className="text-foreground font-medium">{alert.remaining_quantity}</span> 
                                                        </span>
                                                    </div>                                                
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        onClick={() => handleResolve(alert.alert_id)}
                                                        size={"sm"}
                                                        className="h-7 px-2 text-xs"
                                                    >
                                                        <Check className="w-4 h-4"></Check>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })                                
                            ) : (
                                <div className="w-full flex justify-center items-center p-4 gap-2">
                                    <Spinner className="size-9 text-primary/80" /> 
                                    <p className="text-sm text-muted-foreground">{t("LOADING")}</p>
                                </div>
                            )
                        }
                    </div>       
                </div>
            </div>  
        </Card>

    )
}