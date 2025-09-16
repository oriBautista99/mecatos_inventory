import { Supplier } from "@/types/suppliers";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then(async res => {
  if (!res.ok) throw new Error("Fetch error");
  return (await res.json()) as Supplier[];
});

export function useSuppliersSWR() {
  const { data, error, isLoading } = useSWR<Supplier[]>("/api/suppliers", fetcher);
  return {
    suppliers: data,
    error,
    isLoading
  };
}

// helper to revalidate after a mutation
export const revalidateSuppliers = () => mutate("/api/suppliers");
