"use server"

import { createClient } from "@/lib/supabase/server";

// listar
export async function getRoles() {
    try {
        const supabase =  await createClient();
        const {data, error} = await supabase.from("roles").select("*");
        if(error){
            console.error('Error in get users:', error);
            return { data: null, error: "ERROR-GET-USERS"};
        }
        return {data: data, error: null};            
    } catch (err) {
        console.error("Error get users:", err)
        return { data: null, error: "ERROR-GET-USERS" }
    }
}


export async function createRole(role: { name: string; description: string; permissions?: number[] }) {

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Unauthorized"); // O devuelve {error: "Unauthorized"}
        }
        const {data: newRole, error: typeError} = await supabase.from('roles').insert([{
            name: role.name,
            description: role.description
        }]).select().single();
        
        if(typeError){
            console.error('Error in create roles:', typeError);
            return { error: typeError};
        }

        if (newRole && newRole?.role_id && role.permissions && role.permissions.length > 0) {
            const rolePermissions = role.permissions.map((pid) => ({
                role_id: newRole.role_id,
                permission_id: pid,
            }));
            await supabase.from("role_permissions").insert(rolePermissions);
        }

        return {success: true, error:null};        
    } catch (err) {
        console.error('Unexpected error in roles:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}

export async function updateRole(role: any, values: { name: string; description: string; permissions?: number[] }) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Unauthorized"); // O devuelve {error: "Unauthorized"}
        }
        const { error } = await supabase
            .from("roles")
            .update({ name: values.name, description: values.description })
            .eq("role_id", role.role_id);

        if(error){
            console.error('Error in update roles:', error);
            return {error: error};
        }

        await supabase.from("role_permissions").delete().eq("role_id", role.role_id);
        if (values.permissions && values.permissions.length > 0) {
            const newRelations = values.permissions.map((pid) => ({
                role_id: role.role_id,
                permission_id: pid,
            }));
            await supabase.from("role_permissions").insert(newRelations);
        }

        return {success: true, error: null};
    } catch (err) {
        console.error("Error updating roles:", err)
        return {error: "Error actualizando roles" }
    }
}

//get permission
export async function getPermissions() {
    try {
        const supabase =  await createClient();
        const {data, error} = await supabase.from("permissions").select("*");
        if(error){
            console.error('Error in get permissions:', error);
            return { data: null, error: "ERROR-GET-permissions"};
        }
        return {data: data, error: null};            
    } catch (err) {
        console.error("Error get permissions:", err)
        return { data: null, error: "ERROR-GET-permissions" }
    }
}

export async function getRolePermissions(role_id: number) {
    try {
        const supabase =  await createClient();
        const { data, error } = await supabase
            .from("role_permissions")
            .select("permission_id")
            .eq("role_id", role_id);
        if(error){
            console.error('Error in get permissions:', error);
            return { data: null, error: "ERROR-GET-permissions"};
        }
        return {data: data, error: null};            
    } catch (err) {
        console.error("Error get permissions:", err)
        return { data: null, error: "ERROR-GET-permissions" }
    }
}

//delete
export async function deleteRole(role_id: string) {
    try {
        const supabase =  await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Unauthorized"); // O devuelve {error: "Unauthorized"}
        }
        await supabase.from("role_permissions").delete().eq("role_id", role_id);
        const { error } = await supabase.from("roles").delete().eq("role_id", role_id);
        if(error){
            console.error('Error in delete roles:', error);
            return { data: null, error: "ERROR-DELETE-roles"};
        }
        return {success: true, error: null};
    } catch (err) {
        console.error("Error delete roles:", err)
        return { data: null, error: "ERROR-DELETE-roles" }
    }

}