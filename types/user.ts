import { z } from "zod"
import { ROLES } from "./constants"

export interface Profile {
    profile_id: string
    username: string
    email: string,
    pin_hash ?: string,
    role: typeof ROLES[keyof typeof ROLES],
    is_active: boolean
    avatar?: string
    created_at: string
    auth_user: string
}

export const userSchema = z.object({
  username: z.string().min(1, "Nombre no válido"),
  email: z.string().email("Email inválido"),
  role: z.number("Role Invalido"),
})


export const createUserSchema = userSchema.extend({
  pin_hash: z.string().min(6, "Pin inválido")
})

export const updateUserSchema = userSchema.extend({
  pin_hash: z.union([
    z.string().min(6, "Pin inválido"),
    z.literal("")
  ]).optional()
})

export type UserFormData = z.infer<typeof createUserSchema | typeof updateUserSchema>;