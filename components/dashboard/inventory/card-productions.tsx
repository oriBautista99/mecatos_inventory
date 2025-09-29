"use client"

import { Card } from "@/components/ui/card";
import { TYPE_PRODUCTION } from "@/types/constants";
import { CakeSlice, Croissant, Wheat } from "lucide-react";

type CardProps = {
    url: typeof TYPE_PRODUCTION[keyof typeof TYPE_PRODUCTION] | null;
    title: string;
    description: string;
    onSheet: (url: typeof TYPE_PRODUCTION[keyof typeof TYPE_PRODUCTION] | null) => void;
};


export default function CardProductions({url, title, description, onSheet}: CardProps){
    return(
        <Card 
            className='h-24 group shadow-sm relative p-4 overflow-hidden cursor-pointer transition-all duration-300'
            onClick={() => onSheet(url)}
        >
            <div className="absolute top-0 left-0 w-full rounded-tl-lg overflow-hidden">
                <div className="bg-primary/60 p-5 pb-7 pr-7  w-fit rounded-br-full ">
                    {
                        url === 'BREAD' && <Wheat className="w-10 h-10 transition-all duration-300 group-hover:w-12 group-hover:h-12 text-primary-foreground"/>
                    }
                    {
                        url === 'DESSERT' && <CakeSlice className="w-10 h-10 transition-all duration-300 group-hover:w-12 group-hover:h-12 text-primary-foreground"/>
                    }
                    {
                        url === 'PASTRY' && <Croissant className="w-10 h-10 transition-all duration-300 group-hover:w-12 group-hover:h-12 text-primary-foreground"/>
                    }
                </div>
            </div>

            <div className="ml-24 text-start">
                <h1 className="text-2xl font-extrabold uppercase text-foreground">{title}</h1>
                <p className="text-sm tracking-tight">{description}</p>
            </div>
            {/* <div className="w-full flex justify-end items-center">
                <ArrowRight className="w-4 h-4 group-hover:text-primary transition-all duration-300  group-hover:w-5 group-hover:h-5"/>
            </div> */}
        </Card>
    );
}