import { Storage_area } from "@/types/storage_area";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then(async res => {
  if (!res.ok) throw new Error("Fetch error");
  return (await res.json()) as Storage_area[];
});

export function useStorageAreasSWR() {
  const { data, error, isLoading } = useSWR<Storage_area[]>("/api/storage-areas", fetcher);
  return {
    areas: data,
    error,
    isLoading
  };
}

// helper to revalidate after a mutation
export const revalidateStorageAreas = () => mutate("/api/storage-areas");
