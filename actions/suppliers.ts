"use server"

import { createClient } from "@/lib/supabase/server";
import { Supplier, SupplierFormValues } from "@/types/suppliers";

export async function createSupplier(supplier: SupplierFormValues) {

    try {
        const supabase = await createClient();
        const {error: supplierError} = await supabase.from("suppliers").insert({
            company_name: supplier.company_name,
            contact_name: supplier.contact_name,
            address: supplier.address,
            phone: supplier.phone,
            email: supplier.email,
            frecuency: supplier.frecuency,
            is_active: true
        });

        if(supplierError){
            console.error('Error in create Profile:', supplierError);
            return { error: supplierError};
        }

        return {success: true, error:null};
    } catch (err) {
        console.error('Unexpected error in create supplier:', err);
        return { error: { message: 'Unexpected error occurred' } }
    }


}

export async function updateSupplier(supplier: Supplier, data: SupplierFormValues) {
    try {
        const supabase = await createClient();
        const {error} = await supabase.from("suppliers")
                            .update({
                                company_name: data.company_name,
                                contact_name: data.contact_name,
                                address: data.address,
                                phone: data.phone,
                                email: data.email,
                                frecuency: data.frecuency,
                            })
                            .eq("supplier_id", supplier.supplier_id);
        if(error){
            console.error('Error in update supplier:', error);
            return {error: error};
        }
        return {success: true, error: null};
    } catch (err) {
        console.error("Error updating supplier:", err)
        return { success: false, error: "Error actualizando proveedor" }
    }
}


//delete
export async function deleteSupplier(supplier_id: string) {
    try {
        const supabase =  await createClient();
        const {error} = await supabase.from("suppliers").delete().eq("supplier_id",supplier_id);
        if(error){
            console.error('Error in delete SUPPLIER:', error);
            return { data: null, error: "ERROR-DELETE-SUPPLIER"};
        }
        return {success: true, error: null};
    } catch (err) {
        console.error("Error delete suppliers:", err)
        return { data: null, error: "ERROR-DELETE-SUPPLIER" }
    }
    
}

export async function getSuppliers(){
    try {
        const supabase = await createClient();
        const {data, error} = await supabase.from("suppliers").select("*"); 
        if(error){
            console.error('Error in get suppliers:', error);
            return { data: null, error: "ERROR-GET-SUPPLIERS"};
        }
        return {data: data, error: null};
    } catch (err) {
        console.error("Error get suppliers:", err)
        return { data: null, error: "ERROR-GET-SUPPLIERS" }
    }
}