import { getOrdersForStatus } from "@/actions/orders";
import { Order } from "@/types/order";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ClipboardList, FileInput, Truck } from "lucide-react";
import { Button } from "../ui/button";
import { PieChartComponent } from "../PieChart";
import { useTranslations } from "next-intl";
import { Spinner } from "../ui/spinner";

export type chartDataStatus = {
    label: string, 
    value: number
}

export default function OrdersCard() {
    const [ordersReceiving, setOrdersReceiving] = useState<Order[] | null>([]);
    const [totalOrdersReceiving, setTotalOrdersReceiving] = useState<number>(0);
    const [ordersSuggested, setOrdersSuggested] = useState<Order[] | null>([]);
    const [totalOrdersSuggested, setTotalOrdersSuggested] = useState<number>(0);
    const [chartData, setChartData] = useState<chartDataStatus[]>([]);
    const pathname = usePathname(); 
    const t = useTranslations("DASH-CARD-ORDERS");
    
    async function loadOrders() {
        const { data: received, total: totalReceived } = await getOrdersForStatus(["RECEIVED"], 1,0);
        const { data: suggested, total: totalSuggested } = await getOrdersForStatus(["SUGGESTED"],1,0);
        if(received && suggested) {
            setOrdersReceiving(received);
            setTotalOrdersReceiving(totalReceived);
            setOrdersSuggested(suggested);
            setTotalOrdersSuggested(totalSuggested);
            setChartData([
                {
                    label: "RECEIVING",
                    value: totalReceived
                },
                {
                    label: "SUGGESTED",
                    value: totalSuggested
                }
            ])
        }
    }

    useEffect(() => {
        loadOrders();
    }, []);

    return(
        <Card className="p-6 border-none h-full max-h-full">
            <div className="flex flex-col h-full relative space-y-4">
                <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex justify-center items-center">
                            <ClipboardList className="h-6 w-6 text-primary"/>
                        </div>
                        <h1 className="text-md font-semibold text-foreground tracking-tight">{t("ORDERS")}</h1>
                    </div>
                    <Link href={pathname+'/orders'}>
                        <Button variant='ghost' className='group text-primary font-semibold'>
                            {t("MORE")} 
                            <ArrowRight className='transition-transform duration-200 group-hover:-translate-x-0.5' />
                        </Button>                    
                    </Link>
                </div>
                {
                    totalOrdersReceiving && totalOrdersSuggested ? (
                        <div className="flex flex-col justify-between relative">
                            <div className="absolute flex flex-col w-full h-full justify-center items-center text-foreground font-semibold">
                                <h1 className="text-2xl font-bold">{totalOrdersReceiving+totalOrdersSuggested}</h1>
                                <p className="text-xs text-muted-foreground font-normal pb-6">Total</p>
                            </div>
                            <div className="h-60 w-full">
                                <PieChartComponent
                                    data={chartData}
                                    nameKey={"label"}
                                    valueKey={"value"}
                                    config={{
                                        "RECEIVING": { label: "RECEIVING", color: "hsl(var(--chart-1))" },
                                        "SUGGESTED": { label: "SUGGESTED", color: "hsl(var(--chart-2))" },
                                    }}                        
                                >
                                </PieChartComponent>
                            </div>
                        </div>                        
                    ) : (
                        <div className="w-full flex justify-center items-center p-4 gap-2">
                            <Spinner className="size-9 text-primary/80" /> 
                            <p className="text-sm text-muted-foreground">{t("LOADING")}</p>
                        </div>
                    )
                }
                {
                    ordersReceiving && ordersReceiving.length > 0 &&
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex justify-center items-center">
                                <FileInput className="h-6 w-6 text-primary"/>
                            </div>
                            <h1 className="text-md font-semibold text-foreground tracking-tight">{t("LAST-RECEIVING-ORDER")}</h1>
                        </div>
                        <div className="bg-primary/10 p-4 flex flex-col shadow-md rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex justify-center items-center">
                                    <Truck className="text-primary h-6 w-6"></Truck>
                                </div>
                                <div className="flex flex-col justify-end">
                                    <p className="w-full text-end font-semibold text-md">{t("ORDER")} # {ordersReceiving[0].order_id}</p>
                                    <p className="text-end text-foreground font-semibold w-full rounded-full text-sm">{ordersReceiving[0].suppliers?.company_name}</p>
                                </div>
                            </div>
                            <p className="text-sm"><span className="font-semibold">{t("RECEIVED")}: </span>{ordersReceiving[0].received_date && new Date(ordersReceiving[0].received_date).toDateString()}</p>
                            <p className="text-sm"><span className="font-semibold">{t("EXPIRATION")}: </span>{ordersReceiving[0].expiration_date && new Date(ordersReceiving[0].expiration_date).toDateString()}</p>
                        </div>
                    </div>                
                }
                {
                    ordersSuggested && ordersSuggested.length > 0 &&
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex justify-center items-center">
                                <FileInput className="h-6 w-6 text-primary"/>
                            </div>
                            <h1 className="text-md font-semibold text-foreground tracking-tight">{t("LAST-SUGGESTED-ORDER")}</h1>
                        </div>
                        <div className="bg-primary/20 p-4 flex flex-col shadow-md rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex justify-center items-center">
                                    <Truck className="text-primary h-6 w-6"></Truck>
                                </div>
                                <div className="flex flex-col justify-end">
                                    <p className="w-full text-end font-semibold text-md">{t("ORDER")} # {ordersSuggested[0].order_id}</p>
                                    <p className="text-end text-foreground font-semibold w-full rounded-full text-sm">{ordersSuggested[0].suppliers?.company_name}</p>
                                </div>
                            </div>
                            <p className="text-sm"><span className="font-semibold">{t("GENERATED")}: </span>{ordersSuggested[0].created_at && new Date(ordersSuggested[0].created_at).toDateString()}</p>
                        </div>
                    </div>                
                }
            </div>
        </Card>
    );

}