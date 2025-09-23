import { getPrsentationsForSupplier } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { fullPresentItems, presentationsItems, presentationsItemsTable } from "@/types/order";
import { CheckedState } from "@radix-ui/react-checkbox";
import { formatDate } from "date-fns";
import { CalendarIcon, PackagePlus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface PresentOrdersTableProps {
    supplier ?: number | null;
    presentationsOrder ?: fullPresentItems[];
    onUpdate: (data: fullPresentItems[]) => void;
    mode ?: 'EDIT' | 'RECEIVED'
}

const initializeTableData = (products: presentationsItems[]): fullPresentItems[] => {
    return products.map((p) => ({
        presentation_id: p.presentation_id,
        presentation_name: p.presentations.name,
        presentation_unit: p.presentations.unit,
        conversion_factor: p.presentations.conversion_factor,
        item_name: p.presentations.items.name,
        target_quantity: p.presentations.items.target_quantity,
        quantity_orderned: 0,
        quantity_received: 0,
        unit_price: 0,
        expiration_date: null,
        selected: false
    }));
}

export default function PresentationOrdesTable({supplier ,presentationsOrder ,onUpdate, mode}: PresentOrdersTableProps){

    const [products, setProducts] = useState<fullPresentItems[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [progress, setProgress] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const t = useTranslations("PRESE_ORDER_TABLE");
    

    useEffect(() => {
        if (supplier) {
            getProducts(supplier);
            setIsLoading(true);
            setProgress(0);
        }
    }, [supplier]);

    const filteredPresentations = products.filter(
        (product) =>
        product.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.presentation_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getProducts = async (supplier_id:number) => {
        const {data} = await getPrsentationsForSupplier(supplier_id);
        if(data){
            const productList = initializeTableData(data);
            if(presentationsOrder && presentationsOrder?.length > 0){
                const idsPresents = new Map(presentationsOrder.map(p=> [p.presentation_id, p]));
                const selectDate = productList.map( pro => {
                    const dataPres = idsPresents.get(pro.presentation_id);
                    if(dataPres){
                        console.log('DATAP', dataPres)
                        return {
                            ...pro, 
                            selected:true,
                            quantity_orderned: dataPres.quantity_orderned,
                            quantity_received: dataPres.quantity_received,
                            unit_price: dataPres.unit_price,
                            expiration_date: dataPres.expiration_date
                        };                        
                    }
                    return pro;
                });
                setProducts(selectDate);
            }else{
                setProducts(productList);
            }

            setIsLoading(false)

            
            const timer: NodeJS.Timeout = setInterval(() => {
                setProgress((old) => {
                    if (old >= 100) {
                        clearInterval(timer)
                        setIsLoading(false)
                        return 100
                    }
                    return old + 20
                })
            }, 150)
            return () => clearInterval(timer)  
        }
    }

    useEffect(() => {
        if (products.length > 0) {
            const selectedProducts = products.filter((p) => p.selected);
            onUpdate(selectedProducts);
        }
    }, [products, onUpdate]);


    const handleInputChange = (
        id: number,
        field: keyof presentationsItemsTable,
        value: CheckedState | boolean | Date | string | number | undefined
    ) => {
        setProducts((prev) =>
            prev.map((p) =>
                p.presentation_id === id ? { ...p, [field]: value } : p
            )
            );
    };
    
    return(
        <div className="space-y-4">
            <div className="flex items-start md:items-center gap-2">
                <PackagePlus className="h-5 w-5 mt-1 md:mt-0 sm:h-4 sm:w-4 text-muted-foreground" />
                <h3 className="font-medium text-lg md:text-base">{t("REGISTER_PRODUCTS")}</h3>
            </div>             
            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-8 gap-4">
                    <span className="text-muted-foreground">
                        {t("LOADING")}
                    </span>
                    <Progress value={progress} className="w-2/3 h-3"/>
                </div>
            ): (
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1 max-w-full">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t("SEARCH")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                        </div>
                    </div>
                    <div className="hidden md:block rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-secondary rounded-tr-md rounded-tl-md">
                                    <TableHead className="text-foreground font-semibold w-[50px]"></TableHead>
                                    <TableHead className="text-foreground font-semibold">{t("PRODUCT-T")}</TableHead>
                                    <TableHead className="text-foreground font-semibold">{t("PRESENTATION-T")}</TableHead>
                                    <TableHead className="text-foreground font-semibold">{t("QTY_RECEIVED-T")}</TableHead>
                                    <TableHead className="text-foreground font-semibold">{t("QTY_ORDERED-T")}</TableHead>
                                    <TableHead className="text-foreground font-semibold">{t("UNIT_PRICE-T")}</TableHead>
                                    <TableHead className="text-foreground font-semibold">{t("EXPIRATION_DATE-T")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPresentations.length == 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        {searchTerm ? t("PRODUCT-NO-FOUND") : t("NO-PRODUCT")}
                                    </div>
                                ) : (
                                filteredPresentations.map((item) => (
                                    <TableRow key={item.presentation_id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={item.selected}
                                                onCheckedChange={(isChecked) =>
                                                    handleInputChange(item.presentation_id, "selected", isChecked)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>{item.item_name}</TableCell>
                                        <TableCell>{item.presentation_name}</TableCell>
                                        <TableCell>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    className="w-full min-w-20"
                                                    value={item.quantity_received}
                                                    onChange={(e) =>
                                                    handleInputChange(
                                                        item.presentation_id,
                                                        "quantity_received",
                                                        Number(e.target.value)
                                                    )
                                                    }
                                                />
                                                <span className='pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50'>
                                                    {item.presentation_unit}
                                                </span>                                    
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {
                                                mode === 'EDIT' ?
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            className="w-full min-w-20"
                                                            value={item.quantity_orderned}
                                                            onChange={(e) =>
                                                            handleInputChange(
                                                                item.presentation_id,
                                                                "quantity_orderned",
                                                                Number(e.target.value)
                                                            )
                                                            }
                                                        />
                                                        <span className='pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50'>
                                                            {item.presentation_unit}
                                                        </span>                                    
                                                    </div>
                                                :
                                                `${item.quantity_orderned} ${item.presentation_unit}`
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    className="w-full min-w-20"
                                                    value={item.unit_price}
                                                    onChange={(e) =>
                                                    handleInputChange(item.presentation_id, "unit_price", Number(e.target.value))
                                                    }
                                                />   
                                                <span className='pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50'>
                                                    / {item.presentation_unit}
                                                </span>                             
                                            </div>

                                        </TableCell>
                                        <TableCell>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                        "w-[200px] justify-start text-left font-normal",
                                                        !item.expiration_date && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {item.expiration_date
                                                        ? formatDate(item.expiration_date, "PPP")
                                                        : t("SELECT-DATE")}
                                                    </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={item.expiration_date || undefined}
                                                        onSelect={(date) =>
                                                        handleInputChange(item.presentation_id, "expiration_date", date)
                                                        }
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </TableCell>
                                    </TableRow>  
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="block md:hidden space-y-2">
                        {
                        filteredPresentations.length == 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? t("PRODUCT-NO-FOUND") : t("NO-PRODUCT")}
                                </div>
                            ) : (
                                filteredPresentations.map((item) => (
                                    <Card className="p-4" key={item.presentation_id}>
                                        <div className="flex justify-between w-full pb-4">
                                            <div className="flex flex-col">
                                                <h3 className="text-card-foreground">{item.item_name}</h3>
                                                <p className="text-sm text-muted-foreground">{item.presentation_name}</p>
                                            </div>
                                            <div className="flex justify-center items-center">
                                                <Checkbox
                                                    checked={item.selected}
                                                    onCheckedChange={(isChecked) =>
                                                        handleInputChange(item.presentation_id, "selected", isChecked)
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <h3>{t("QTY_ORDERED-T")}</h3>
                                                <p>{item.quantity_orderned} {item.presentation_unit}</p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <h3>{t("QTY_RECEIVED-T")}</h3>
                                                <div className="relative w-1/2">
                                                    <Input
                                                        type="number"
                                                        className="w-full"
                                                        value={item.quantity_received}
                                                        onChange={(e) =>
                                                        handleInputChange(
                                                            item.presentation_id,
                                                            "quantity_received",
                                                            Number(e.target.value)
                                                        )
                                                        }
                                                    />
                                                    <span className='pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-9 text-sm peer-disabled:opacity-50'>
                                                        {item.presentation_unit}
                                                    </span>                                    
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <h3>{t("UNIT_PRICE-T")}</h3>
                                                <div className="relative w-1/2">
                                                    <Input
                                                        type="number"
                                                        className="w-full"
                                                        value={item.unit_price}
                                                        onChange={(e) =>
                                                        handleInputChange(item.presentation_id, "unit_price", Number(e.target.value))
                                                        }
                                                    />   
                                                    <span className='pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50'>
                                                        / {item.presentation_unit}
                                                    </span>                             
                                                </div>
                                            </div>    
                                            <div className="flex flex-col justify-between items-start">
                                                <h3>{t("EXPIRATION_DATE-T")}</h3>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !item.expiration_date && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {item.expiration_date
                                                            ? formatDate(item.expiration_date, "PPP")
                                                            : t("SELECT-DATE")}
                                                        </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={item.expiration_date || undefined}
                                                            onSelect={(date) =>
                                                            handleInputChange(item.presentation_id, "expiration_date", date)
                                                            }
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>                                   
                                        </div>
                                    </Card>
                                ))
                            )
                        }
                    </div>
                </div>                
            )}
        </div>
    );
}