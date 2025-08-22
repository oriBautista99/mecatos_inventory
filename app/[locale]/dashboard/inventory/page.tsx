import {redirect} from "next/navigation";

export default function InventoryRedirectPage() {
  redirect("./inventory/storage_areas"); 
  // redirige relativo a /dashboard/inventory
}