import { DateRange } from "react-day-picker"

export function getPrevRange(r: DateRange): DateRange | undefined{
    const fromDate = r.from
    const toDate = r.to
    if(fromDate && toDate){
        const diffDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000*60*60*24)) + 1
        const prevTo = fromDate
        prevTo.setDate(prevTo.getDate() - 1)          
        const prevFrom = new Date(prevTo)
        prevFrom.setDate(prevFrom.getDate() - diffDays + 1)
        return {
            from: prevFrom,
            to: prevTo
        }              
    }
    return undefined;
}

export function startOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
}

export function endOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
}