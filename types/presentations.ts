import z from "zod";
import { UNITS } from "./constants";
import { Item } from "./item";
import { Supplier } from "./suppliers";

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
  presentation_id: number;
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