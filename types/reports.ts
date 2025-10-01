export type TopProducedRow = { item_id: number; item_name: string; total_produced: number }
export type DailySeriesRow = { event_day: string; total: number }
export type LossesRow     = { item_id: number; item_name: string; total_loss: number }
export type SnapshotRow   = { item_id: number; item_name: string; remaining_quantity: number }
export type AgingRow      = { item_id: number; item_name: string; due_date: string; remaining_quantity: number }
export type AgingRowChart      = { value: number; name: string; }
