"use client"
import { getTopProducedByItem } from "@/actions/reports/production";
import { getLossesByItem } from "@/actions/reports/waste";
import AlertsCard from "@/components/dashboard/alerts-card";
import CountsCard from "@/components/dashboard/counts-card";
import LostCard from "@/components/dashboard/lost-card";
import OrdersCard from "@/components/dashboard/orders-card";
import ProductionCard from "@/components/dashboard/production-card";
import CardInfo from "@/components/dashboard/reports/card-info";
import { useProfileLoginSWR } from "@/hooks/useUserLogin";
import { LossesRow, TopProducedRow } from "@/types/reports";
import { endOfDay, getPrevRange, startOfDay } from "@/utils/range";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

export default function Dashboard() {

  const t = useTranslations("DASHBOARD-HOME");
  const {profile} = useProfileLoginSWR();
  const [range] = useState<DateRange | undefined>({
      from: new Date(new Date().setDate(new Date().getDate() - 7)), // hace 7 días
      to: new Date(), // hoy
  });
  // card production
  const [top, setTop] = useState<TopProducedRow[]>([]);
  const [prevTop, setPrevTop] = useState<TopProducedRow[]>([]);
  // card waste
  const [losses, setLosses] = useState<LossesRow[]>([]);
  const [prevLosses, setPrevLosses] = useState<LossesRow[]>([]);

  async function loadAllData() {
    if(range){
      const today = new Date();
      const from = range?.from ? startOfDay(range.from) : startOfDay(today);
      const to   = range?.to   ? endOfDay(range.to)     : endOfDay(today);
      const dateRange = { from, to };
      const prevRange = getPrevRange(range);
      const fromPrev = prevRange?.from ? startOfDay(prevRange.from) : startOfDay(today);
      const toPrev   = prevRange?.to   ? endOfDay(prevRange.to)    : endOfDay(today);

      const [r1,r2,p1,p2] = await Promise.all([
        getTopProducedByItem(dateRange, 10),
        getLossesByItem(dateRange),
        getTopProducedByItem({from:fromPrev, to: toPrev}, 10),
        getLossesByItem({from:fromPrev, to: toPrev})
      ]);
      if (!r1?.error && r1?.data) setTop(r1.data)
      if (!r2?.error && r2?.data) setLosses(r2.data)
      if (!p1?.error && p1?.data) setPrevTop(p1.data)
      if (!p2?.error && p2?.data) setPrevLosses(p2.data)

    }
  }

  useEffect(() => { 
    loadAllData();
  }, [])
  
  const totalProduced = top.reduce((a,b)=>a + Number(b.total_produced||0), 0);
  const prevProduced = prevTop.reduce((a,b)=>a + Number(b.total_produced||0), 0)
  const varProduced = prevProduced > 0 ? ((totalProduced - prevProduced)/prevProduced)*100 : 0
  const totalLosses   = losses.reduce((a,b)=>a + Number(b.total_loss||0), 0);
  const prevLossesTotal   = prevLosses.reduce((a,b)=>a + Number(b.total_loss||0), 0);
  const varLosses = prevLossesTotal > 0 ? ((totalLosses - prevLossesTotal)/prevLossesTotal)*100 : 0;

  return (
    <div className="min-h-screen p-0 flex flex-col space-y-6">
      {/* Título */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 lg:grid-cols-3 lg:grid-rows-1 gap-6 p-6 rounded-xl bg-primary/15">
        <div className="flex flex-col justify-between">
          <div className="text-muted-foreground/60 mb-4">
            {range?.to?.toDateString()}
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{t("HELLO")}, {profile?.username}!</h1>
            <p className="text-sm font-normal text-muted-foreground/75">{t("MESS")}</p>
          </div>
        </div>
        <div className="rounded-xl shadow-md md:row-start-2 lg:row-start-1 lg:col-start-2">
          <CardInfo
              title={t("CARD-1-TITLE")}
              description={t("CARD-DESCRIPTION")}
              sign={t("CARD-UNIT")}
              value={totalProduced}
              variation={varProduced}
          ></CardInfo>
        </div>
        <div className="rounded-xl shadow-md h-auto md:row-start-2 md:col-start-2 lg:row-start-1 lg:col-start-3">
          <CardInfo
              title={t("CARD-2-TITLE")}
              description={t("CARD-DESCRIPTION")}
              sign={t("CARD-UNIT")}
              value={totalLosses}
              variation={varLosses}
          ></CardInfo>
        </div>
      </div>
      
      <div
        className="
          grid
          flex-1
          gap-6
          grid-cols-1
          md:grid-cols-7 
          md:grid-rows-3 
          lg:grid-cols-7
          lg:grid-rows-2
          auto-rows-[minmax(200px,auto)]
          items-start
        "
      >
        <div className="rounded-xl shadow-md md:col-span-4 lg:col-span-3">
          <ProductionCard></ProductionCard>
        </div>
        <div className="rounded-xl shadow-md md:col-start-5 md:col-span-3 lg:col-start-4 lg:col-span-2">
          <AlertsCard></AlertsCard>
        </div>
        <div className="rounded-xl shadow-md md:col-start-5 md:row-start-2 md:row-span-2 md:col-span-3 lg:col-start-6 lg:row-span-2 lg:col-span-2">
          <OrdersCard></OrdersCard>
        </div>        
        <div className="rounded-xl shadow-md md:col-start-1 md:row-start-2 md:col-span-4 lg:col-span-2 lg:row-start-2 lg:col-start-1">
          <CountsCard></CountsCard>
        </div>
        <div className="rounded-xl shadow-md md:col-span-4 md:col-start-1 md:row-start-3 lg:col-start-3 lg:row-start-2 lg:col-span-3">
          <LostCard></LostCard>
        </div>        
      </div>
    </div>
  )
}