import { Item } from "@/types/item";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then(async res => {
  if (!res.ok) throw new Error("Fetch error");
  return (await res.json()) as Item[];
});

export function useItemsSWR() {
  const { data, error, isLoading } = useSWR<Item[]>("/api/items", fetcher);
  return {
    items: data,
    error,
    isLoading
  };
}

// helper to revalidate after a mutation
export const revalidateItems = () => mutate("/api/items");
