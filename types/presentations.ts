import z from "zod";
import { UNITS } from "./constants";
import { Item } from "./item";
import { Supplier } from "./suppliers";
import { TypePresentation } from "./type_presentation";

export interface Presentation {
    presentation_id: number;
    name: string;
    description: string;
    conversion_factor: number;
    unit: typeof UNITS[keyof typeof UNITS];
    quantity: number;
    created_at ?: Date;
    item_id?: string;
    Item?:Item;
    items?:Item;
    suppliers_presentations ?: {suppliers:Supplier}[];
}

export interface Supplier_Presentation {
  item_presentation_id: number;
  supplier_id: number;
}

export const PresentationSchema = z.object({
  name: z.string().min(1, "El nombre de la presentación es obligatorio"),
  description: z.string().min(1, "la description de la presentación es obligatorio"),
  quantity: z.coerce.number().min(1, "La cantidad debe ser mayor a 0"),
  unit: z.string().min(1, "La unidad es obligatoria"),
  conversion_factor:  z.coerce.number().min(1),
  item_id: z.string().optional(),
  presentation_id: z.coerce.number().optional(),
  supplier_ids: z.array(z.string()).min(1, "Debes seleccionar al menos un proveedor") // ← nuevo campo
});

export type PresentationFormValues = z.infer<typeof PresentationSchema>;

export interface ItemPresentation {
  item_presentation_id: number;
  item_id: number;
  quantity: number;
  is_default: boolean;
  presentation_type_id: number;
  presentation_types: TypePresentation;
  suppliers_presentations ?: {suppliers:Supplier}[];
}

export const ItemPresentationSchema = z.object({
  item_presentation_id: z.coerce.number().optional(),
  quantity: z.coerce.number().min(1, "La cantidad debe ser mayor a 0"),
  item_id: z.string().optional(),
  is_default: z.boolean(),
  unit: z.string().min(1),
  conversion_factor:  z.coerce.number().min(1),
  presentation_type_id: z.coerce.number().optional(),
  supplier_ids: z.array(z.string()).min(1, "Debes seleccionar al menos un proveedor") // ← nuevo campo
});

export type ItemPresentationFormValues = z.infer<typeof ItemPresentationSchema>;
