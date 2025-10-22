"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server";
import { Profile, UserFormData } from "@/types/user"
import bcrypt from "bcryptjs";

// Crear

export async function createUser(data: UserFormData) {
    try {
        //  crea en auth
        const {data: authUser, error: authError} = await supabaseAdmin.auth.admin.createUser({
            email: data.email,
            email_confirm: true,
            password: data.pin_hash,
        });

        if(authError){
            console.error('Error in create Auth User:', authError);
            return { error: authError };
        }

        // hashear el PIN
        const salt = await bcrypt.genSalt(10);
        if(!data.pin_hash){
            throw new Error("PIN no proporcionado");
        }
        const hashedPin = await bcrypt.hash(data.pin_hash, salt);       

        // inserta en profile
        const supabase =  await createClient();
        const {error : profileError } = await supabase.from("profiles").insert({
            auth_user: authUser.user.id,
            email: data.email,
            username: data.username,
            role: data.role,
            pin_hash: hashedPin,
            is_active: true
        })

        if(profileError){
            console.error('Error in create Profile:', authError);
            return { error: authError };
        }

        return {success: true, error:null};  
    } catch (err) {
        console.error('Unexpected error in createUser: ', err);
        return { data: null, error: { message: 'Unexpected error occurred' } }
    }

}

//update
export async function updateUser(profile: Profile, dataForm: UserFormData) {
    try{
        if(dataForm.pin_hash){
            const salt = await bcrypt.genSalt(10);
            const hashedPin = await bcrypt.hash(dataForm.pin_hash, salt);

            await supabaseAdmin.auth.admin.updateUserById(profile.auth_user,{
                email: dataForm.email,
                password: dataForm.pin_hash
            });

            const supabase =  await createClient();
            const {error} = await supabase.from("profiles")
                            .update({
                                email: dataForm.email,
                                username: dataForm.username,
                                role: dataForm.role,
                                pin_hash: hashedPin
                            })
                            .eq("profile_id", profile.profile_id);
            if(error){
                console.error('Error in update Profile:', error);
                return { error: error };
            }
            return {success: true, error: null};
        }else{
            await supabaseAdmin.auth.admin.updateUserById(profile.auth_user,{
                email: dataForm.email
            });

            const supabase =  await createClient();
            const {error} = await supabase.from("profiles")
                                .update({
                                    email: dataForm.email,
                                    username: dataForm.username,
                                    role: dataForm.role,
                                })
                                .eq("profile_id", profile.profile_id);
            if(error){
                console.error('Error in update Profile:', error);
                return { error: error };
            }
            return {success: true, error: null};
        }        
    }catch (err) {
        console.error("Error updating user:", err)
        return { error: "Error actualizando usuario" }
    }
}

//delete
export async function deleteUser(profile: Profile) {
    try {
        const {error: authError} = await supabaseAdmin.auth.admin.deleteUser(profile.auth_user);
        const supabase =  await createClient();
        const {error} = await supabase.from("profiles").delete().eq("profile_id",profile.profile_id);        
        if(error || authError){
            console.error('Error in delete user:', error);
            return { data: null, error: "ERROR-DELETE-USERS"};
        }
        return {success: true, error: null};
    } catch (err) {
        console.error("Error delete user:", err)
        return { data: null, error: "ERROR-DELETE-USERS" }
    }

}

// listar
export async function getUsers() {
    try {
        const supabase =  await createClient();
        const {data, error} = await supabase.from("profiles").select(`
            *,
            role_id,
            roles (
                role_id,
                name,
                description
            )
        `);
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

export async function getUserById(id:string) {
    try {
        const supabase =  await createClient();
        const {data, error} = await supabase.from("profiles").select("*").eq("auth_user", id);
        if(error){
            console.error('Error in get user:', error);
            return { data: null, error: "ERROR-GET-USER"};
        }
        return {data: data[0], error: null};       
    } catch (err) {
        console.error("Error get users:", err)
        return { data: null, error: "ERROR-GET-USER" }
    }

}