import { getOrderById } from "@/actions/orders";
import OrderDetail from "./orderDetail";
import { fullPresentItems} from "@/types/order";

export default async function Page(props: { params: Promise<{ order_id: string }> }) {

    const { order_id } = await props.params;
    const { data:order, error } = await getOrderById(Number(order_id));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const presentations: fullPresentItems[] = order.order_details.map( (od:any) => {
        return {
            presentation_id: od.presentation_id,
            order_detail_id: od.order_detail_id,
            batch_id: od.item_batches.batch_id,
            presentation_name: od.presentations.name,
            presentation_unit: od.presentations.unit,
            conversion_factor: od.presentations.conversion_factor,
            item_name: od.presentations.items?.name,
            target_quantity: od.presentations.items?.target_quantity,
            quantity_orderned: od.quantity_ordered,
            quantity_received: od.quantity_received,
            unit_price: od.unit_price,
            expiration_date: '',
            selected:  true
        }
    });
    

    if (!order && error) return <div>{error.toString()}</div>;

    return(
        <OrderDetail
            order={order}
            presentations={presentations}
        ></OrderDetail>
    );
}