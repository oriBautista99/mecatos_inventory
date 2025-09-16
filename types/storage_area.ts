import z from "zod";

export interface Storage_area { 
    storage_area_id: string;
    name: string;
    description: string;
    is_active?: boolean;
    created_at?: Date;
}

export const storagAreaSchema = z.object({
  name: z.string().min(1, "El nombre del area es obligatorio"),
  description: z.string().min(1, "La descripcion es obligatoria"),
  is_active: z.boolean()
});

export type AreaStorageFormValues = z.infer<typeof storagAreaSchema>;