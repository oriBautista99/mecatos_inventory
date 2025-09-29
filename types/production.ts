export interface Item {
  item_id: string
  name: string
  shelf_life_days?: number
  description?: string
}

export interface ProductionEvent {
  production_event_id: string
  profile_id?: string
  event_date: string
  notes?: string
  created_at: string
}

export interface ProductionEventDetail {
  production_event_detail_id: string
  production_event_id?: string
  item_id: string
  quantity_produced: number
  current_quantity?: number
  shelf_life_days?: number
  hour?: string
  created_at: string
}

export type MovementType = 'production_in' | 'loss_out'

export interface InventoryMovement {
  movement_id: string
  item_id: string
  profile_id?: string
  production_event_detail_id?: string
  movement_type: MovementType
  quantity: number
  movement_date: string
  notes?: string
  created_at: string
}

export interface ExpirationAlert {
  alert_id: string
  production_event_detail_id: string
  item_id: string
  due_date: string
  created_at: string
  resolved: boolean
  resolved_at?: string
  quantity_expected: number
  notes?: string
  created_by?: string
}

export interface ProductionStatus {
  production_event_detail_id: string
  production_event_id: string
  item_id: string
  item_name: string
  event_date: string
  quantity_produced: number
  total_loss: number
  remaining: number
  alert_id?: string
  due_date?: string
  resolved?: boolean
}

export interface ProductionHistoryRow {
  production_event_detail_id: string
  quantity_produced: number
  shelf_life_days?: number
  created_at: string
  production_events: {
    event_date: string
    notes?: string
    profile_id?: string
  }
  items: {
    name: string
  }
}

export interface ProductionEventRow {
  production_event_id: number
  profile_id?: string
  event_date: string
  notes?: string
  created_at?: string,
  type_production?: string,
  profiles: { username: string }
}

export interface ProductionEventDetailsAPI extends ProductionEventDetail  {
  items: Item;
} 

export interface ProductionEventRowAPI extends ProductionEventRow {
  production_event_details: ProductionEventDetailsAPI[];
}