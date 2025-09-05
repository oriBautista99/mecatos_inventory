"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server";
import { Profile, UserFormData } from "@/types/user"
import bcrypt from "bcryptjs";

// Crear

export async function createUser(data: UserFormData) {

    //  crea en auth
    const {data: authUser, error: authError} = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        email_confirm: true,
        password: data.pin_hash,
    });

    if(authError) throw authError;

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

    if(profileError) throw profileError;

    return authUser.user;
}

//update
export async function updateUser(profile: Profile, data: UserFormData) {

    try{
        if(data.pin_hash){
            const salt = await bcrypt.genSalt(10);
            const hashedPin = await bcrypt.hash(data.pin_hash, salt);

            await supabaseAdmin.auth.admin.updateUserById(profile.auth_user,{
                email: data.email,
                password: data.pin_hash
            });

            const supabase =  await createClient();
            const {error} = await supabase.from("profiles")
                            .update({
                                email: data.email,
                                username: data.username,
                                role: data.role,
                                pin_hash: hashedPin
                            })
                            .eq("profile_id", profile.profile_id);
            if(error) throw error;
        }else{
            await supabaseAdmin.auth.admin.updateUserById(profile.auth_user,{
                email: data.email
            });

            const supabase =  await createClient();
            const {error} = await supabase.from("profiles")
                                .update({
                                    email: data.email,
                                    username: data.username,
                                    role: data.role,
                                })
                                .eq("profile_id", profile.profile_id);
            if(error) throw error;
        }        
        return {success: true};

    }catch (err) {
        console.error("Error updating user:", err)
        return { success: false, error: "Error actualizando usuario" }
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