import useSWR, { mutate } from "swr";
import { Category } from "@/types/category";

const fetcher = (url: string) => fetch(url).then(async res => {
  if (!res.ok) throw new Error("Fetch error");
  return (await res.json()) as Category[];
});

export function useCategoriesSWR() {
  const { data, error, isLoading } = useSWR<Category[]>("/api/categories", fetcher);
  return {
    categories: data,
    error,
    isLoading
  };
}

// helper to revalidate after a mutation
export const revalidateCategories = () => mutate("/api/categories");
