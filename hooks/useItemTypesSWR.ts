import { Item_types } from "@/types/itemTypes";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then(async res => {
  if (!res.ok) throw new Error("Fetch error");
  return (await res.json()) as Item_types[];
});

export function useItemTypesSWR() {
  const { data, error, isLoading } = useSWR<Item_types[]>("/api/item-types", fetcher);
  return {
    itemTypes: data,
    error,
    isLoading
  };
}

// helper to revalidate after a mutation
export const revalidateItemTypes = () => mutate("/api/item-types");
