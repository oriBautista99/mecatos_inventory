"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Item } from "@/types/item";
import { withMask } from "use-mask-input";
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from "@/components/ui/select";
import { TYPE_PRODUCTION } from "@/types/constants";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

export type RowValues = {
    item_id: number;
    item: string;
    quantity: string;
    hour: string;
    current_quantity: string;
};

type Props = {
    type: typeof TYPE_PRODUCTION[keyof typeof TYPE_PRODUCTION];
    data: Item[];
    initialRows?: RowValues[] | null;
    typeTable: 'EDIT' | 'CREATE';
    onChange?: (rows: RowValues[]) => void;
};

export default function ProductionItemsTable({ type, data, initialRows, typeTable, onChange }: Props) {
    const [search, setSearch] = useState("");
    const [rows, setRows] = useState<RowValues[]>(
        data.map((item) => {
            return {
                item_id: Number(item.item_id),
                item: item.name,
                quantity: "",
                hour: "",
                current_quantity: "",
            };
        })
    );
    const t = useTranslations("PROD-ITEM-TABLE");

    const isFirstRender = useRef(false);

    const filteredData = data.filter((item) => {
        const matchesSearch =
        item.name?.toLowerCase().includes(search.toLowerCase());

        return matchesSearch;
    });

    useEffect(() => {
        if (onChange) {
            onChange(rows);
        }
    }, [rows, onChange]);

    useEffect(() => {

        if (isFirstRender.current) return;
        
        if( data.length > 0 && typeTable === 'CREATE') {
            setRows(
                data.map((item) => ({
                    item_id: Number(item.item_id),
                    item: item.name,
                    quantity: "",
                    hour: "",
                    current_quantity: "",
                }))
            );
            isFirstRender.current = true;
        }

        if (initialRows &&  data.length > 0 && typeTable === 'EDIT') {
            setRows(
                data.map((item) => {
                    const existing = initialRows.find(r => r.item_id === Number(item.item_id));
                    return {
                        item_id: Number(item.item_id),
                        item: item.name,
                        quantity: existing?.quantity || "",
                        hour: existing?.hour || "",
                        current_quantity: existing?.current_quantity || "",
                    };
                })
            );
            isFirstRender.current = true;

        }
    }, [initialRows,data,typeTable]);

    const handleChange = (
        index: number,
        field: keyof RowValues,
        value: string
    ) => {
        setRows((prev) =>
            prev.map((row, i) =>
                i === index ? { ...row, [field]: value } : row
            )
        );

    };

    return (
        <div className="flex flex-col space-y-4">
            <div className="relative flex-1 max-w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                <Input
                    placeholder={t("SEARCH")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 w-full text-sm"
                />                    
            </div>
            <div className="md:rounded-xl md:border md:border-border shadow">
                <div className="overflow-x-auto rounded-xl border border-border shadow max-h-[50vh]">
                    <Table className="bg-card">
                        <TableHeader>
                        <TableRow className="bg-secondary">
                            <TableHead>{t("NAME")}</TableHead>
                            <TableHead>{t("QTY")}</TableHead>
                            { type !== 'DESSERT' && <TableHead>{t("HOUR")}</TableHead>}
                            { type === 'DESSERT' && <TableHead>{t("STOCK")}</TableHead>}
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredData.map((item, index) => (
                            <TableRow key={item.item_id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                                <Input
                                type="number"
                                placeholder="0"
                                value={rows[index]?.quantity ?? ""}
                                onChange={(e) =>
                                    handleChange(index, "quantity", e.target.value)
                                }
                                />
                            </TableCell>
                            {
                                type !== 'DESSERT' ? (
                                <TableCell>
                                    <div className="flex items-center w-full border rounded-md bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                                        <Input
                                            type="text"
                                            placeholder="HH:MM"
                                            value={rows[index]?.hour.split(" ")[0] ?? ""}
                                            onChange={(e) => {
                                                const ampm = rows[index]?.hour.split(" ")[1] || "AM"; // conserva AM/PM
                                                handleChange(index, "hour", `${e.target.value} ${ampm}`);
                                            }}
                                            ref={withMask("99:99", { placeholder: "_" })} // ⏰ Máscara aquí
                                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
                                        />

                                        <Select
                                            value={rows[index]?.hour.split(" ")[1] || "AM"}
                                            onValueChange={(val) => {
                                                const current = rows[index]?.hour.split(" ")[0] || ""
                                                handleChange(index, "hour", `${current} ${val}`)
                                            }}
                                        >
                                            <SelectTrigger className="w-20 border-0 rounded-none bg-muted/50 focus:ring-0 focus:ring-offset-0">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="AM">AM</SelectItem>
                                                <SelectItem value="PM">PM</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </TableCell>
                                ) : (
                                <TableCell>
                                    <Input
                                    type="number"
                                    placeholder="0"
                                    value={rows[index]?.current_quantity ?? ""}
                                    onChange={(e) =>
                                        handleChange(index, "current_quantity", e.target.value)
                                    }
                                    />
                                </TableCell>
                                )
                            }


                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
            </div>            
        </div>

    );
}
