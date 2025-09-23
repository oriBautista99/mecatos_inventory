import z from "zod";
import { ORDER_STATUS } from "./constants";
import { Supplier } from "./suppliers";

export interface Order {
    order_id?: number;
    created_at?: Date;
    received_date?: Date;
    expiration_date?: Date;
    status: typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
    supplier_id:  number;
    suppliers?: Supplier;
    created_by?: number;
    description ?:  string;
}

export const OrderSchema = z.object({
    supplier_id: z.number(),
    received_date: z.date().optional(),
    expiration_date: z.date().min(new Date(), {
        message: "La fecha de finalización no puede ser en el pasado."
    }).optional(),
    created_by: z.number(),
    created_at: z.date(),
    status: z.string(),
    order_id: z.number().optional(),
    description: z.string().optional()
});

export type OrderFromValues = z.infer<typeof OrderSchema>;

export type presentationsItems = {
    presentation_id: number,
    presentations: {
        conversion_factor: number,
        description: string,
        name: string,
        presentation_id: number,
        unit: string,
        items: {
            base_unit: string,
            description: string,
            item_id: number,
            min_quantity: number,
            name: string,
            target_quantity: number
        }
    },
    suppliers: {
        company_name: string,
        supplier_id: number
    }
}

export type presentationsItemsTable = {
    quantity_orderned: number,
    quantity_received: number,
    unit_price: number,
    expiration_date: Date | null,
    selected:  boolean;
}

export type fullPresentItems = {
    presentation_id: number,
    order_detail_id?: number,
    batch_id?: number,
    presentation_name: string,
    presentation_unit: string,
    conversion_factor: number,
    item_name: string,
    target_quantity: number,
} & presentationsItemsTable;


export interface OrderDetails {
    order_detail_id?: number;
    order_id: number;
    presentation_id: number;
    quantity_ordered ?: number;
    quantity_received ?: number;
    unit_price ?: number;
}

export interface itemBatches {
    batch_id ?: number;
    created_at ?: Date;
    quantity_batch: number;
    current_quantity: number;
    received_date?: Date;
    expiration_date?: Date;
    presentation_id: number;
    order_detail_id: number;
    is_active ?: boolean;
}

export function mapSupabaseDataToPresentations(
  supabaseData: any[] | null
): presentationsItems[] {
  if (!supabaseData) {
    return [];
  }

  const mappedData = supabaseData.map((record) => {
    const presentation = record.presentations;
    const supplier = record.suppliers;
    const item = presentation.items;

    return {
      presentation_id: record.presentation_id,
      presentations: {
        conversion_factor: presentation.conversion_factor,
        description: presentation.description,
        name: presentation.name,
        presentation_id: presentation.presentation_id,
        unit: presentation.unit,
        items: {
          base_unit: item.base_unit,
          description: item.description,
          item_id: item.item_id,
          min_quantity: item.min_quantity,
          name: item.name,
          target_quantity: item.target_quantity,
        },
      },
      suppliers: {
        company_name: supplier.company_name,
        supplier_id: supplier.supplier_id,
      },
    };
  });

  return mappedData;
}