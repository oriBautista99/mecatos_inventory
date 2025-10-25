import z from "zod";

export interface TypePresentation { 
    presentation_type_id: string;
    name: string;
    description: string;
    conversion_factor: number;
    unit: string;
    created_at?: Date;
}

export const TypePresentationSchema = z.object({
  name: z.string().min(1, "El nombre de la categoria es obligatorio"),
  description: z.string().optional(),
  conversion_factor: z.number().optional(),
  unit: z.string().optional(),
});

export type TypePresentationFormValues = z.infer<typeof TypePresentationSchema>;