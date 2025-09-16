import z from "zod";

export interface Item_types { 
    item_type_id: string;
    name: string;
    description: string;
    created_at?: Date;
}

export const ItemTypeSchema = z.object({
  name: z.string().min(1, "El nombre de la categoria es obligatorio"),
  description: z.string().min(1, "La descripcion es obligatoria"),
});

export type ItemTypesFormValues = z.infer<typeof ItemTypeSchema>;