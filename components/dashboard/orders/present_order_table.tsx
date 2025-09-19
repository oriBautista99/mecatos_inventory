import { getPrsentationsForSupplier } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { fullPresentItems, presentationsItems, presentationsItemsTable } from "@/types/order";
import { CheckedState } from "@radix-ui/react-checkbox";
import { formatDate } from "date-fns";
import { CalendarIcon, PackagePlus } from "lucide-react";
import { useEffect, useState } from "react";

interface PresentOrdersTableProps {
    supplier ?: number | null,
    onUpdate: (data: fullPresentItems[]) => void;
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

export default function PresentationOrdesTable({supplier, onUpdate}: PresentOrdersTableProps){

    const [products, setProducts] = useState<fullPresentItems[]>([]);

    useEffect(() => {
        if (supplier) {
            getProducts(supplier);
        }
    }, [supplier]);

    const getProducts = async (supplier_id:number) => {
        const {data} = await getPrsentationsForSupplier(supplier_id);
        if(data){
            setProducts(initializeTableData(data));
        }
    }

    useEffect(() => {
    if (products && products.some(p => p.selected)) {
        const selectedProducts = products.filter((p) => p.selected);
        onUpdate(selectedProducts);
    }
    }, [products, onUpdate]);

    const handleInputChange = (
        id: number,
        field: keyof presentationsItemsTable,
        value: CheckedState | boolean | Date | string | number | undefined
    ) => {
        setProducts((prevData) => {
            if (!prevData) return [];
            return prevData.map((p) => (p.presentation_id === id ? { ...p, [field]: value } : p));
        });
    };
    
    return(
        <div>
            <div className="flex items-center gap-2">
                <PackagePlus className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm sm:text-base">Registra los Productos Recibidos</h3>
            </div> 
            <div>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-secondary">
                            <TableHead className="text-foreground font-semibold w-[50px]"></TableHead>
                            <TableHead className="text-foreground font-semibold">Producto</TableHead>
                            <TableHead className="text-foreground font-semibold">Presentacion</TableHead>
                            <TableHead className="text-foreground font-semibold">Cantidad recibida</TableHead>
                            <TableHead className="text-foreground font-semibold">Cantidad ordenada</TableHead>
                            <TableHead className="text-foreground font-semibold">Precio (unidad)</TableHead>
                            <TableHead className="text-foreground font-semibold">Fecha de vencimiento</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products && products.map((item) => (
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
                                {/* Aquí puedes mostrar la cantidad ordenada, si tienes ese dato en el array inicial */}
                                {item.quantity_orderned} {item.presentation_unit}
                            </TableCell>
                            <TableCell>
                                <div className="relative">
                                    <Input
                                        type="number"
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
                                        : "Seleccionar fecha"}
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
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}