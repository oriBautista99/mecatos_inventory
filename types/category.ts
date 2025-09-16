import z from "zod";

export interface Category { 
    category_id: string;
    name: string;
    description: string;
    created_at?: Date;
}

export const CategorySchema = z.object({
  name: z.string().min(1, "El nombre de la categoria es obligatorio"),
  description: z.string().min(1, "La descripcion es obligatoria"),
});

export type CategoryFormValues = z.infer<typeof CategorySchema>;