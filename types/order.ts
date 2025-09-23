export interface Order {
    order_id: number;
    creation_date: Date;
    recived_date: Date;
    expiration_date: Date;
    status: statusOrder;
    supplier_id:  number;
    created_id: number;
}

export enum statusOrder {
    received,
    sent,
    processed,
    reviewed
}