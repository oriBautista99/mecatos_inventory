"use client"

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Item } from "@/types/item";
import { ItemForLoss } from "@/types/loss";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export type RowValuesLost = {
    item_id: number;
    item?: string;
    quantity_lost: string;
};

type Props = {
    data: ItemForLoss[] | Partial<Item>[];
    initialRows?: RowValuesLost[] | null;
    typeTable: 'EDIT' | 'CREATE';
    onChange?: (rows: RowValuesLost[]) => void;
};

export default function LostItemsTable({ data, initialRows, typeTable, onChange }: Props) {

    const [rows, setRows] = useState<RowValuesLost[]>(
        data.map((item) => {
            return {
                item_id: Number(item.item_id),
                item: item.name,
                quantity_lost: "",
            };
        })
    );
    const t = useTranslations("LOSS-ITEM-TABLE");
    const isFirstRender = useRef(false);

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
                    quantity_lost: ""
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
                        quantity_lost: existing?.quantity_lost || "",
                    };
                })
            );
            isFirstRender.current = true;

        }
    }, [initialRows,data,typeTable]);

    const handleChange = (
        index: number,
        field: keyof RowValuesLost,
        value: string
    ) => {
        setRows((prev) =>
            prev.map((row, i) =>
                i === index ? { ...row, [field]: value } : row
            )
        );

    };

    return(
        <div className="overflow-x-auto rounded-xl border border-border shadow max-h-[45vh]">
            <Table className="bg-card">
                <TableHeader>
                    <TableRow className="bg-secondary">
                        <TableHead>{t("PRODUCT")}</TableHead>
                        <TableHead>{t("QYT_LOST")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        data.map((item, index) => (
                            <TableRow key={item.item_id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={rows[index]?.quantity_lost ?? ""}
                                        onChange={(e) =>
                                            handleChange(index, "quantity_lost", e.target.value)
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    );
}