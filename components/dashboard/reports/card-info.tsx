"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Boxes, ChefHat } from "lucide-react"

type PropsCardCharts =  {
  title: string,
  description?: string,
  value: string | number,
  sign: string
  variation?: number
}

function VariationBadge({ value }: { value: number }) {
    if (value === 0) return <Badge variant='outline'>0 %</Badge>
    const positive = value > 0
    if(positive){
        return(
            <Badge className='rounded-full border-none bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5'>
                <span className='size-1.5 rounded-full bg-green-600 dark:bg-green-400' aria-hidden='true' />
                {positive ? "↑" : "↓"} {Math.abs(value).toFixed(1)}%
            </Badge>
        )
    }else{
        <Badge className='bg-destructive/10 [a&]:hover:bg-destructive/5 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive rounded-full border-none focus-visible:outline-none'>
            <span className='bg-destructive size-1.5 rounded-full' aria-hidden='true' />
            {positive ? "↑" : "↓"} {Math.abs(value).toFixed(1)}%
        </Badge>
    }
}

export default function CardInfo({title,value,variation,sign, description} : PropsCardCharts) {
    return (
        <Card className="relative">
            <div className="absolute top-0 right-0 rounded-tr-lg overflow-hidden">
                <div className="p-5 pb-7 pl-7 w-fit rounded-bl-full ">
                    {
                        sign === '%' && <ChefHat className="w-10 h-10 transition-all duration-300 group-hover:w-12 group-hover:h-12 text-primary/80"/>
                    }
                    {
                        sign.includes('/') && <Activity className="w-10 h-10 transition-all duration-300 group-hover:w-12 group-hover:h-12 text-primary/80"/>
                    }
                    {
                        sign !== '%' &&  !sign.includes('/') && <Boxes className="w-10 h-10 transition-all duration-300 group-hover:w-12 group-hover:h-12 text-primary/80"/>
                    }
                </div>
            </div>
            <CardHeader className="pb-2">
                <CardTitle className=" text-card-foreground/80">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-start justify-center gap-2">
                <h1 className="text-3xl font-semibold">{value} <span className="text-2xl">{sign}</span></h1>
                    <div className="flex space-x-2 text-sm">
                        {variation !== undefined && 
                            VariationBadge({value:variation})
                        }
                        <p className="text-muted-foreground/75">{description}</p>
                    </div>
            </CardContent>
        </Card>
    )
}