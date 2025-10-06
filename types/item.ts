import z from "zod";
import { Category } from "./category";
import { UNITS } from "./constants";
import { Item_types } from "./itemTypes";
import { Storage_area } from "./storage_area";
import { Presentation, PresentationSchema } from "./presentations";

export interface Item {
    item_id: string;
    name: string;
    description: string;
    base_unit: typeof UNITS[keyof typeof UNITS],
    min_quantity: number,
    target_quantity: number;
    is_active ?: boolean,
    category_id: number,
    categories: Category,
    item_type_id: number,
    item_types: Item_types,
    storage_area_id: number,
    storage_areas: Storage_area,
    created_at?: string,
    system_quantity ?: number,
    presentations: Presentation[],
    production_type ?: 'BREAD' | 'DESSERT' | 'PASTRY';
}

export const ItemSchema = z.object({
    name: z.string().min(1, "El nombre de la categoria es obligatorio"),
    description: z.string().min(1, "La descripcion es obligatoria"),
    base_unit: z.string().min(1,"La unidad es obligatoria"),
    min_quantity: z.coerce.number().min(1, "La cantidad minima es obligatoria"),
    target_quantity: z.coerce.number().min(1, "La cantidad objetivo es obligatoria"),
    category_id:z.coerce.number(),
    item_type_id: z.coerce.number(),
    storage_area_id: z.coerce.number(),
    presentations: z.array(PresentationSchema).min(1, "Debe agregar al menos una presentacion")
});

export type ItemFormValues = z.infer<typeof ItemSchema>;

export interface filters_Items {
    category_id?: string
    item_type_id?: string
    storage_area_id?: string
    supplier?: string
}