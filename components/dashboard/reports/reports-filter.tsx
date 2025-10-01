"use client"

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { DateRange } from "react-day-picker";


// type DateRange = { from: string; to: string }

type PropFilter = {
  range: DateRange | undefined,
  onChange: (range: DateRange | undefined) => void,
  onApply: () => void,
  loading: boolean
}

export default function ReportsFilter({range, onChange, onApply, loading }:PropFilter) {
  
    const t = useTranslations("FILTERS-REPORTS");

    return (
        <div className="w-full flex flex-row items-center justify-end">
            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant='outline'>
                        <CalendarIcon />
                        {range?.from && range?.to
                        ? `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
                        : t("SELECT-RANGE")}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto overflow-hidden p-0' align='end'>
                        <Calendar
                            mode="range"
                            defaultMonth={range?.from}
                            selected={range}
                            onSelect={onChange}
                            fixedWeeks
                            showOutsideDays
                            disabled={loading}
                    />
                    </PopoverContent>
                </Popover>
                <Button onClick={onApply} disabled={loading}>{t("APPLY")}</Button>
            </div>
        </div>
    );
}