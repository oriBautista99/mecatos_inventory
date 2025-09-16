import z from "zod";

export interface Supplier { 
    supplier_id: string;
    company_name: string;
    contact_name: string;
    address: string;
    phone: string;
    email: string;
    frecuency: string[];
    is_active: boolean;
    created_at?: Date;
}

export const supplierSchema = z.object({
  company_name: z.string().min(1, "El nombre de la empresa es obligatorio"),
  contact_name: z.string().min(1, "El nombre del contacto es obligatorio"),
  address: z.string().min(1, "La dirección es obligatoria"),
  phone: z
    .string()
    .min(7, "Debe tener al menos 7 dígitos")
    .regex(/^[0-9+\-\s]+$/, "Número de teléfono inválido"),
  email: z.string().email("Correo inválido"),
  frecuency: z.array(z.string()).min(1, "Debe seleccionar al menos un día"),
  is_active: z.boolean(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;