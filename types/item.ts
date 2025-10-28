import z from "zod";
import { Category } from "./category";
import { UNITS } from "./constants";
import { Item_types } from "./itemTypes";
import { Storage_area } from "./storage_area";
import { ItemPresentation, ItemPresentationSchema } from "./presentations";
import { Units } from "./units";

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
    unit_id: number;
    units: Units;
    created_at?: string,
    system_quantity ?: number,
    item_presentations: ItemPresentation[],
    //presentations: Presentation[],
    production_type ?: 'BREAD' | 'DESSERT' | 'PASTRY',
    shelf_life_days?: number
}

export const ItemSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del producto es obligatorio"),

  description: z
    .string()
    .optional(),

  min_quantity: z
    .coerce
    .number()
    .min(1, "La cantidad mínima es obligatoria"),

  target_quantity: z
    .coerce
    .number()
    .min(1, "La cantidad objetivo es obligatoria"),

  category_id: z
    .coerce
    .number()
    .min(1, "Debe seleccionar una categoría"),

  item_type_id: z
    .coerce
    .number()
    .min(1, "Debe seleccionar un tipo de ítem"),

  storage_area_id: z
    .coerce
    .number()
    .min(1, "Debe seleccionar un área de almacenamiento"),

  unit_id: z
    .coerce
    .number()
    .min(1, "Debe seleccionar una unidad base"),

  item_presentations: z
    .array(ItemPresentationSchema)
    .min(1, "Debe agregar al menos una presentación"),

  production_type: z
    .string()
    .optional(),

  shelf_life_days: z
    .coerce
    .number()
});

export type ItemFormValues = z.infer<typeof ItemSchema>;

export interface filters_Items {
    category_id?: string
    item_type_id?: string
    storage_area_id?: string
    supplier?: string
}