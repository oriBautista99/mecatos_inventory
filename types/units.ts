import z from "zod";

export interface Units { 
    unit_id: string;
    name: string;
    abbreviation: string;
    created_at?: Date;
}

export const UnitSchema = z.object({
  name: z.string().min(1, "El nombre de la categoria es obligatorio"),
  abbreviation: z.string().min(1, "La abreviacion es obligatoria"),
});

export type UnitFormValues = z.infer<typeof UnitSchema>;