import z from "zod";
import { Category } from "./category";
import { UNITS } from "./constants";
import { Item_types } from "./itemTypes";
import { Storage_area } from "./storage_area";
import { Supplier } from "./suppliers";

export interface Item {
    item_id: string;
    name: string;
    description: string;
    base_unit: typeof UNITS[keyof typeof UNITS],
    min_quantity: number,
    target_quantity: number;
    is_active ?: boolean,
    supplier: Supplier,
    category: Category,
    item_type: Item_types,
    storage_area: Storage_area,
    created_at: string
}

export const ItemSchema = z.object({
    name: z.string().min(1, "El nombre de la categoria es obligatorio"),
    description: z.string().min(1, "La descripcion es obligatoria"),
    base_unit: z.string().min(1,"La unidad es obligatoria"),
    min_quantity: z.number().min(1, "La cantidad minima es obligatoria"),
    target_quantity: z.number().min(1, "La cantidad objetivo es obligatoria"),
    supplier: z.string(),
    category: z.string(),
    item_type: z.string(),
    storage_area: z.string(),
});

export type ItemFormValues = z.infer<typeof ItemSchema>;