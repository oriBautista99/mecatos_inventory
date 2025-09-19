import z from "zod";
import { ORDER_STATUS } from "./constants";
import { Supplier } from "./suppliers";

export interface Order {
    order_id?: number;
    created_at?: Date;
    received_date: Date;
    expiration_date: Date;
    status: typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
    supplier_id:  number;
    suppliers?: Supplier;
    created_by?: number;
    description ?:  string;
}

export const OrderSchema = z.object({
    supplier_id: z.number(),
    received_date: z.date(),
    expiration_date: z.date().min(new Date(), {
        message: "La fecha de finalización no puede ser en el pasado."
    }),
    created_by: z.number(),
    created_at: z.date(),
    status: z.string(),
    order_id: z.number().optional()
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
    received_date: Date;
    expiration_date: Date;
    presentation_id: number;
    order_detail_id: number;
    is_active ?: boolean;
}