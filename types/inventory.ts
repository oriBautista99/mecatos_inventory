export interface Supplier {
  supplier_id: number;
  company_name: string;
}

export interface SupplierPresentation {
  supplier_presentation_id: number;
  suppliers: Supplier;
}

export interface ItemBatch {
  batch_id: number;
  current_quantity: number;
  received_date: string;   // ISO string
  expiration_date: string; // ISO string
  is_active: boolean;
  order_detail_id: number;
  created_at: string;
}

export interface Presentation {
  presentation_id: number;
  name: string;
  unit: string;
  conversion_factor: number;
  is_default: boolean;
  item_id: number;
  quantity: number;
  suppliers_presentations: SupplierPresentation[];
  item_batches?: ItemBatch[];
}

export interface Item {
  item_id: number;
  name: string;
  base_unit: string;
  category_id: number;
  storage_area_id: number;
  item_type_id: number;
  presentations: Presentation[];
}

export interface ItemForCount extends Item {
  system_quantity: number; // calculado sumando lotes * factor
}

export interface InventoryCount {
  count_id: number;
  counted_by: number;
  created_at: string;
  notes?: string;
}

export interface InventoryCountDetail {
  count_detail_id: number;
  count_id: number;
  item_id: number;
  counted_quantity: number;
  system_quantity: number;
  difference: number;
  created_at: string;
}

export interface ItemForCountTable extends ItemForCount {
    counted_quantity?: number;
}

export interface Profiles {
  username: string;
  profile_id: number;
}

export interface InventoryCountDetailUpdate extends InventoryCountDetail {
  item: Item;
}

export interface CountDetails extends InventoryCount{
  inventory_counts_details: InventoryCountDetailUpdate[];
}

export interface CountTableRow {
  item_id: number;
  name: string;
  base_unit: string;
  system_quantity: number;
  counted_quantity?: number;
  presentation ?: Presentation
}