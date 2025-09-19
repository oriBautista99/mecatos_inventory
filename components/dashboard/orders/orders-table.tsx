import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order } from "@/types/order";

type OrdersTableProps = {
  data: Order[];
};

export default function OrdersTable({ data }: OrdersTableProps) {
    if (!data.length) {
        return <p className="text-center text-sm text-muted-foreground">No hay órdenes para mostrar</p>;
    }

    return(
        <div className="overflow-x-auto rounded-xl border border-border shadow">
            <Table>
                <TableHeader>
                    <TableRow className="bg-secondary">
                        <TableHead className="text-foreground font-semibold">ID Order</TableHead>
                        <TableHead className="text-foreground font-semibold">Proveedor</TableHead>
                        <TableHead className="text-foreground font-semibold">Fecha de Creacion</TableHead>
                        <TableHead className="text-foreground font-semibold">Estado</TableHead>
                        <TableHead className="text-foreground font-semibold">Fecha de Expiracion</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((order) => (
                        <TableRow key={order.order_id}>
                            <TableCell>{order.order_id}</TableCell>
                            <TableCell>{order.suppliers.company_name}</TableCell>
                            <TableCell>{order.created_at.getUTCDate()}</TableCell>
                            <TableCell>{order.status}</TableCell>
                            <TableCell>{order.expiration_date.getUTCDate()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}