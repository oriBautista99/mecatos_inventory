"use client"

import { getInventoryHistory } from "@/actions/inventory";
import { InventoryCount, InventoryCountDetail, Profiles } from "@/types/inventory";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "../ui/card";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Calculator, Notebook } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslations } from "next-intl";

export default function CountsCard()  {
    const [counts, setCounts] = useState<(InventoryCount & { inventory_counts_details: InventoryCountDetail[] } & {profiles: Profiles})[]>([]);  
    const pathname = usePathname(); 
    const t = useTranslations("DASH-CARD-COUNTS");

    async function loadCounts() {
        const data  = await getInventoryHistory(7);
        if(data) {
            setCounts(data);
        }else{
            toast.error('Error al cargar conteos');
        }
    }

    useEffect(() => {
        loadCounts();
    }, []);


    return(
        <Card className="p-6 border-none h-full max-h-full">
            <div className="flex flex-col justify-between h-full relative space-y-2">
                <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex justify-center items-center">
                            <Notebook className="h-6 w-6 text-primary"/>
                        </div>
                        <h1 className="text-md font-semibold text-foreground tracking-tight">{t("TITLE")}</h1>
                    </div>
                    <Link href={pathname+'/inventory/count'}>
                        <Button variant='ghost' className='group text-primary font-semibold'>
                            {t("MORE")}
                            <ArrowRight className='transition-transform duration-200 group-hover:-translate-x-0.5' />
                        </Button>                    
                    </Link>
                </div>
                <div className="h-full flex flex-col space-y-2">
                    <div className="flex flex-col">
                        <p className="text-sm font-normal text-muted-foreground">{t("DESCRIPTION")}</p>                 
                    </div>
                    <div className="flex flex-col gap-2 overflow-y-auto h-full max-h-[300px]">
                        {
                            counts.map((count) => {
                                return (
                                    <Link key={count.count_id} href={`${pathname}/inventory/count/${count.count_id}`}>
                                        <div className=" cursor-pointer p-3 shadow-sm bg-primary/5 hover:bg-primary/15 rounded-sm w-full flex justify-between">
                                            <div className="flex gap-3">
                                                <div className="flex justify-center items-center">
                                                    <Calculator className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex flex-col h-full justify-between items-start">
                                                    <p className="text-sm font-semibold">{t("COUNT")}: # <span className="font-semibold">{count.count_id}</span></p>  
                                                    <p className="text-sm font-medium text-muted-foreground">{new Date(count.created_at).toLocaleString()}</p>  
                                                </div>                                                
                                            </div>

                                            <div className="flex justify-end items-end">
                                                <p className="text-sm font-semibold text-muted-foreground">{count.profiles.username}</p> 
                                            </div>
                                        </div>                                
                                    </Link>

                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </Card>
    );
}