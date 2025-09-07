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
            return { data: null, authError };
        }

        // hashear el PIN
        const salt = await bcrypt.genSalt(10);
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
            return { data: null, authError };
        }

        return {authUser, error:null};        
    } catch (err) {
        console.error('Unexpected error in createProveedor:', err);
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
            const {data, error} = await supabase.from("profiles")
                            .update({
                                email: dataForm.email,
                                username: dataForm.username,
                                role: dataForm.role,
                                pin_hash: hashedPin
                            })
                            .eq("profile_id", profile.profile_id);
            if(error){
                console.error('Error in update Profile:', error);
                return { data: null, error };
            }
            return {data, error: null};

        }else{
            await supabaseAdmin.auth.admin.updateUserById(profile.auth_user,{
                email: dataForm.email
            });

            const supabase =  await createClient();
            const {data, error} = await supabase.from("profiles")
                                .update({
                                    email: dataForm.email,
                                    username: dataForm.username,
                                    role: dataForm.role,
                                })
                                .eq("profile_id", profile.profile_id);
            if(error){
                console.error('Error in update Profile:', error);
                return { data: null, error };
            }
            return {data, error: null};
        }        
        

    }catch (err) {
        console.error("Error updating user:", err)
        return { data: null , error: "Error actualizando usuario" }
    }
}

//delete
export async function deleteUser(profile: Profile) {
    await supabaseAdmin.auth.admin.deleteUser(profile.auth_user);
    const supabase =  await createClient();
    await supabase.from("profiles").delete().eq("profile_id",profile.profile_id);
}

// listar
export async function getUsers() {
    const supabase =  await createClient();
    const {data, error} = await supabase.from("profiles").select("*");
    if (error) throw error;
    return data;
}

export async function getUserById(id:string) {
    const supabase =  await createClient();
    const {data, error} = await supabase.from("profiles").select("*").eq("auth_user", id);
    if (error) throw error;
    return data[0];
}