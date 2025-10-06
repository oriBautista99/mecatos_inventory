"use client"

import { getPendingAlerts, resolveAlert } from "@/actions/alerts";
import { Button, buttonVariants } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProfileLoginSWR } from "@/hooks/useUserLogin";
import { cn } from "@/lib/utils";
import { AlertRow } from "@/types/alert";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AlertsView() {

    const [alerts, setAlerts] = useState<AlertRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const {profile} = useProfileLoginSWR();
    const t = useTranslations("ALERTS-VIEW");
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const totalPages = Math.ceil(alerts.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const currentData = alerts.slice(startIndex, startIndex + pageSize);

    async function loadAlerts() {
        setLoading(true);
        const { data, error } = await getPendingAlerts();
        if (!error && data) {
            setAlerts(data as AlertRow[]);
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
        };
        setLoading(false);
    }

    useEffect(() => {
        loadAlerts();
    }, []);

    async function handleResolve(alertId: number) {
        if(profile){
            const response = await resolveAlert(String(alertId), String(profile.profile_id));
            if(response.success){
                toast.success(t("RESOLVED-SUCCESSFULLY")); 
                await loadAlerts();            
            }
         
        }
    }

    return (
        <div className="overflow-y-hidden space-y-4 mx-auto px-2 sm:px-4">
            <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
                <div className="flex flex-col justify-start w-full">
                    <h1 className="text-2xl font-bold tracking-tight">{t("TITLE")}</h1>
                    <p className="text-sm text-muted-foreground tracking-tight">
                        {t("DESCRIPTION")}
                    </p>
                </div>
            </div>
            {
                loading ? (
                    <div className="flex flex-col items-center justify-center p-8 gap-4">
                        <span className="text-muted-foreground">{t("LOADING")}</span>
                        <Progress value={progress} className="w-2/3 h-3" />
                    </div>
                ) : (
                    <div className="overflow-x-auto space-y-2">
                        <div className="md:rounded-xl md:border md:border-border shadow">
                            <div className="overflow-x-auto rounded-xl border border-border shadow max-h-[70vh]">
                                <Table className="bg-card">
                                    <TableHeader>
                                        <TableRow className="bg-secondary">
                                            <TableHead className="text-foreground font-semibold">{t("ITEM")}</TableHead>
                                            <TableHead className="text-foreground font-semibold">{t("QTY")}</TableHead>
                                            <TableHead className="text-foreground font-semibold">{t("EXPIRATION")}</TableHead>
                                            <TableHead className="text-foreground font-semibold"></TableHead>          
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentData.map((alert) => (
                                            <TableRow className="cursor-pointer" 
                                                key={alert.alert_id}>
                                                <TableCell>{alert.item_name}</TableCell>
                                                <TableCell>{alert.remaining_quantity}</TableCell>
                                                <TableCell>
                                                    {new Date(alert.due_date).toLocaleDateString()}
                                                </TableCell>  
                                                                           
                                                <TableCell>
                                                    <Button
                                                        onClick={() => handleResolve(alert.alert_id)}
                                                    >
                                                    {t("RESOLVE")}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                )
            }
             {/* Pagination */}
            {totalPages > 1 && (
                <Pagination>
                <PaginationContent>
                    <PaginationItem>
                    <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        aria-disabled={page === 1}
                    />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                        <PaginationLink 
                            isActive={page === i + 1} 
                            onClick={() => setPage(i + 1)}
                            className={cn(
                                'hover:!text-secondary-foreground !border-none !shadow-none',
                                buttonVariants({
                                    variant: 'secondary',
                                    size: 'icon'
                                })
                            )}
                        >
                        {i + 1}
                        </PaginationLink>
                    </PaginationItem>
                    ))}
                    <PaginationItem>
                    <PaginationNext
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        aria-disabled={page === totalPages}
                    />
                    </PaginationItem>
                </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}