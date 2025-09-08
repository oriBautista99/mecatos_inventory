"use server"

import { createClient } from "@/lib/supabase/server";
import { Supplier, SupplierFormValues } from "@/types/suppliers";

export async function createSupplier(supplier: SupplierFormValues) {

    const supabase = await createClient();
    const {data, error: supplierError} = await supabase.from("suppliers").insert({
        company_name: supplier.company_name,
        contact_name: supplier.contact_name,
        address: supplier.address,
        phone: supplier.phone,
        email: supplier.email,
        frecuency: supplier.frecuency,
        is_active: true
    });

    if(supplierError) throw supplierError;

    return data;
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
        if(error) throw error;
    } catch (err) {
        console.error("Error updating supplier:", err)
        return { success: false, error: "Error actualizando proveedor" }
    }
}


//delete
export async function deleteSupplier(supplier: Supplier) {
    const supabase =  await createClient();
    await supabase.from("suppliers").delete().eq("supplier_id",supplier.supplier_id);
}

export async function getSuppliers(){
    const supabase = await createClient();
    const {data, error} = await supabase.from("suppliers").select("*");
    if (error) throw error;
    return data;
}