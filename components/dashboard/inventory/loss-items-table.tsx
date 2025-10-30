"use client"

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Item } from "@/types/item";
import { ItemForLoss } from "@/types/loss";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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

type RowState = Record<number, string>;

export default function LostItemsTable({ data, initialRows, typeTable, onChange }: Props) {


    const [rows, setRows] = useState<RowState>({});
    const t = useTranslations("LOSS-ITEM-TABLE");

    useEffect(() => {
    if (onChange) {
        const rowsArray = Object.entries(rows).map(([id, quantity]) => ({
        item_id: Number(id),
        quantity_lost: quantity,
        }));
        onChange(rowsArray);
    }
    }, [rows, onChange]);

useEffect(() => {
  setRows((prev) => {
    const newRows = { ...prev };

    // crear los nuevos sin borrar los anteriores
    data.forEach((item) => {
      const id = Number(item.item_id);
      if (!(id in newRows)) {
        if (typeTable === "EDIT" && initialRows) {
          const existing = initialRows.find((r) => r.item_id === id);
          newRows[id] = existing?.quantity_lost ?? "";
        } else {
          newRows[id] = "";
        }
      }
    });

    return newRows;
  });
}, [data, initialRows, typeTable]);


    const handleChange = (itemId: number, value: string) => {
    setRows((prev) => ({
        ...prev,
        [itemId]: value,
    }));
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
                        data.map((item) => (
                            <TableRow key={item.item_id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={rows[Number(item.item_id)] ?? ""}
                                        onChange={(e) =>
                                            handleChange(Number(item.item_id), e.target.value)
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