"use server"

import { createClient } from "@/lib/supabase/server";
import { Category, CategoryFormValues } from "@/types/category";

export async function createCategory(category: CategoryFormValues) {
    try {
        const supabase = await createClient();
        // validar sesión con el cliente del request
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const {error: categoryError} = await supabase.from("categories").insert({
            name: category.name,
            description: category.description
        });

        if(categoryError){
            console.error('Error in create category:', categoryError);
            return { error: categoryError};
        }

        return {success: true, error:null};        
    } catch (err) {
        console.error('Unexpected error in category:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}

export async function updateCategory(category: Category, dataCategory: CategoryFormValues) {
    try {
        const supabase = await createClient();
        // validar sesión con el cliente del request
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const {error} = await supabase.from("categories")
                            .update({
                                name: dataCategory.name,
                                description: dataCategory.description,
                            })
                            .eq("category_id", category.category_id);
        if(error){
            console.error('Error in update caregory:', error);
            return {error: error};
        }
        return {success: true, error: null};
    } catch (err) {
        console.error("Error updating categories:", err)
        return {error: "Error actualizando categories" }
    }
}

//delete
export async function deleteCategory(category_id: string) {
    try {
        const supabase =  await createClient();
        // validar sesión con el cliente del request
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const {error} = await supabase.from("categories").delete().eq("category_id",category_id);
        if(error){
            console.error('Error in delete categories:', error);
            return { data: null, error: "ERROR-DELETE-CATEGORIES"};
        }
        return {success: true, error: null};
    } catch (err) {
        console.error("Error delete categories:", err)
        return { data: null, error: "ERROR-DELETE-CATEGORIES" }
    }

}

/*export async function getCategories(){
    try {
        const supabase = await createClient();
        const {data, error} = await supabase.from("categories").select("*");
        if(error){
            console.error('Error in get categories:', error);
            return { data: null, error: "ERROR-GET-CATEGORIES"};
        }
        return {data: data, error: null};     
    } catch (err) {
        console.error("Error get categories:", err)
        return { data: null, error: "ERROR-GET-CATEGORIES" }
    }
}*/
