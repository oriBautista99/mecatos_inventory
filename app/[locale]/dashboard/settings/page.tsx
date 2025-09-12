"use client"
import CardItemTypes from "@/components/dashboard/settings/card-item-types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tabs } from "@radix-ui/react-tabs";
import { Type } from "lucide-react";
import { useTranslations } from "next-intl";

const tabs = [
    {
        name: 'TYPE',
        value: 'types',
        icon: Type,
        content: (
            <>
                <CardItemTypes></CardItemTypes>
            </>
        )
    }
];

export default function Page() {

    const t = useTranslations("SETTINGS"); 
    
    
    return(
        <div className="bg-background p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-2 sm:gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="space-y-1">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('TITLE')}</h1>
                            <p className="text-sm sm:text-base text-muted-foreground">{t('DESCRIPTION-TITLE')}</p>
                        </div>
                    </div> 
                </div>
                <div className="w-full max-w-full">
                    <Tabs defaultValue="types"  className="gap-1">
                        <ScrollArea>
                            <TabsList className="mb-3">
                                {
                                    tabs.map(({icon: Icon, name, value}) => (
                                        <TabsTrigger key={value} value={value} className="gap-1">
                                            <Icon className="h-4 w-4"/>
                                            {t(name)}
                                        </TabsTrigger>
                                    ))
                                }
                            </TabsList>                            
                            <ScrollBar orientation='horizontal' />
                        </ScrollArea>

                        {tabs && tabs.map(tab => (
                            <TabsContent key={tab.value} value={tab.value}>
                                {tab.content}
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </div>
        </div>
    );
}