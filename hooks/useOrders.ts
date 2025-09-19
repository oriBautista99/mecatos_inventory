import { Order } from "@/types/order";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then(async res => {
  if (!res.ok) throw new Error("Fetch error");
  return (await res.json()) as Order[];
});

export function useOrderSWR(){
  const { data, error, isLoading } = useSWR<Order[]>("/api/orders", fetcher);
  return {
    orders: data,
    error,
    isLoading
  }; 
}

// helper to revalidate after a mutation
export const revalidateOrders = () => mutate("/api/orders");