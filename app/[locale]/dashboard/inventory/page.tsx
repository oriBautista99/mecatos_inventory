import {redirect} from "next/navigation";

export default function InventoryRedirectPage() {
  redirect("./inventory/items"); 
  // redirige relativo a /dashboard/inventory
}