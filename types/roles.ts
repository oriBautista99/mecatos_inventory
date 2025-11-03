import z from "zod";

export interface RolesUser { 
    role_id: string;
    name: string;
    description: string;
    role_permissions?: {
      permission_id: string,
      permissions: Permission[]
    }[];
    created_at?: Date;
}


export const RolesSchema = z.object({
  name: z.string().min(1, "El nombre de la categoria es obligatorio"),
  description: z.string().min(1, "La descripcion es obligatoria")
});

export type RolesFormValues = z.infer<typeof RolesSchema>;

export interface Permission { 
    permission_id: string;
    name: string;
    description: string;
    code: string;
    created_at?: Date;
}
