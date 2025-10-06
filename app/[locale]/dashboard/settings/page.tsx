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
        <div className="overflow-y-hidden space-y-4 mx-auto px-2 sm:px-4">
            <div  className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
                <div className="flex flex-col justify-start w-full">
                    <h1 className="text-2xl font-bold tracking-tight">{t("TITLE")}</h1>
                    <p className="text-sm text-muted-foreground tracking-tight">
                        {t("DESCRIPTION-TITLE")}
                    </p>
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
    );
}