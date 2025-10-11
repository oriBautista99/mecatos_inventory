"use server"

import { createClient } from "@/lib/supabase/server";
import { PresentationFormValues, Supplier_Presentation } from "@/types/presentations";

export async function createPresentations(presentations: PresentationFormValues[]){
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const {data, error: areaError} = await supabase.from("presentations")
            .insert(presentations)
            .select();

        if(areaError){
            console.error('Error in create Profile:', areaError);
            return { error: areaError};
        }

        return {success: true, data:data, error:null};  
    } catch (err) {
        console.error('Unexpected error in create presentation:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}

export async function create_present_sup_pre(presentations: PresentationFormValues[]){
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }

        const suppliers_id_present = presentations.map(pr => pr.supplier_ids);
        const presents = presentations.map(pre => {
            const {supplier_ids, presentation_id, ...data} = pre;
            return data;
        });

        // console.log("IDS PROVEEDORES Y PRESENTACIONES", suppliers_id_present, presents);

        const {data, error: areaError} = await supabase.from("presentations")
            .insert(presents)
            .select();

        if(data){
            // console.log("PRESENTACIONES CREADAD: ", data);

            let newsSupplierPresents = [];
            for(let i=0; i < suppliers_id_present.length; i++){ //pre
                for(let j=0; j < suppliers_id_present[i].length; j++){
                    newsSupplierPresents.push({
                        presentation_id: data[i].presentation_id,
                        supplier_id: Number(suppliers_id_present[i][j])
                    });
                }
            }
            // console.log("PROVEEDOR-PRESENTACION", newsSupplierPresents);

            const responseSP = await create_Supplier_Presentations(newsSupplierPresents);

            if(responseSP.success){
                return {success: true, data:data, error:null}; 
            }
        }

        if(areaError){
            console.error('Error in create Profile:', areaError);
            return { error: areaError};
        }

         
    } catch (err) {
        console.error('Unexpected error in create presentation:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}

export async function create_Supplier_Presentations(newSupPres: Supplier_Presentation[]){
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        
        if (userError || !user) {
            return { error: "Unauthorized" };
        }
        const {error} = await supabase.from("suppliers_presentations")
            .insert(newSupPres)
            .select();
        if(error){
            console.error('Error in create Profile:', error);
            return { error: error};
        }

        return {success: true, error:null};
    } catch (err) {
        console.error('Unexpected error in createArea:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }
}

export async function updatePresentations(newPresentations: PresentationFormValues[]){
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Unauthorized"); 
        }
        // Prepara los datos sacando supplier_ids y separando presentation_id
        const presents = newPresentations.map((pre) => {
        const { supplier_ids, ...data } = pre;
        return {
            presentation_id: pre.presentation_id,
            ...data,
            item_id: Number(pre.item_id),
        };
        });
        // Actualizamos uno por uno (para que cada fila reciba sus valores)
        for (const pre of presents) {
            const { presentation_id, ...updateData } = pre;

            const { error } = await supabase
                .from("presentations")
                .update(updateData)
                .eq("presentation_id", presentation_id);

            if (error) {
                console.error("Error updating presentation:", error);
                return { error };
            }
        }

        return {success: true, error: null};
    } catch (err) {
        console.error("Error updating presentations:", err)
        return {error: "Error actualizando presentations" }
    }
}

export async function deletePresentations(ids: number[]) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { error } = await supabase
      .from("presentations")
      .delete()
      .in("presentation_id", ids);

    if (error) {
      console.error("Error deleting presentations:", error);
      return { error };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("Error in deletePresentations:", err);
    return { error: "Error eliminando presentations" };
  }
}

