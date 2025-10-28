import { getOrderById } from "@/actions/orders";
import OrderDetails from "./orderDetails";
import { fullPresentItems } from "@/types/order";

export default async function Page(props: { params: Promise<{ order_id: string }> }) {

    const { order_id } = await props.params;
    const { data:order, error } = await getOrderById(Number(order_id)); 
    // console.log("DATA : ", order);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const presentations: fullPresentItems[] = order.order_details.map( (od:any) => {
        // console.log('OD: ', od);
        return {
            presentation_id: od.item_presentation_id,
            order_detail_id: od.order_detail_id,
            batch_id: od.item_batches.length > 0 ? od.item_batches[0].batch_id : 0,
            presentation_name: od.item_presentations ? od.item_presentations.name : '',
            presentation_unit: od.item_presentations ? od.item_presentations.presentation_types.units.name : '',
            conversion_factor: od.item_presentations ? od.item_presentations.presentation_types.conversion_factor : 0,
            item_name: od.item_presentations ? od.item_presentations.items?.name : "",
            target_quantity: od.item_presentations ? od.item_presentations.items?.target_quantity : 1,
            quantity_orderned: od.quantity_ordered,
            quantity_received: od.quantity_received,
            unit_price: od.unit_price,
            expiration_date: od.item_batches.length > 0 ? od.item_batches[0].expiration_date : '',
            selected:  true
        }
    });
    // console.log('PRESENTATION: ', presentations)
    if (!order && error) return <div>{error.toString()}</div>;

    return(
        <OrderDetails
            order={order}
            presentations={presentations}
        ></OrderDetails>
    );
}