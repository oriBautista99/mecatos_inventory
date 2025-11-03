
export interface LossEventRow {
  loss_event_id: number
  profile_id?: string
  loss_date: string
  notes?: string
  created_at?: string,
  reason: string,
  profiles: { username: string }
}

export interface Supplier {
  supplier_id: number;
  company_name: string;
}

export interface SupplierPresentation {
  supplier_presentation_id: number;
  suppliers: Supplier;
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
  //item_batches?: ItemBatch[];
}

export interface ItemForLoss {
  item_id: number;
  name: string;
  base_unit: string;
  category_id: number;
  storage_area_id: number;
  item_type_id: number;
  item_presentations: Presentation[];
}

export interface LossEventDetail {
  loss_event_detail_id: string
  loss_event_id?: string
  item_id: string
  quantity_lost: number
  production_event_detail_id?: number
  created_at?: string
}
type LossType = 'end_of_the_day' | 'loss_due_for_expiration' | 'customer_return' | 'work_accident';

export const LOSS_TYPES: LossType[] = [
  'end_of_the_day',
  'loss_due_for_expiration',
  'customer_return',
  'work_accident',
]