import { Units } from "@/types/units";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then(async res => {
  if (!res.ok) throw new Error("Fetch error");
  return (await res.json()) as Units[];
});

export function useUnitsSWR() {
  const { data, error, isLoading } = useSWR<Units[]>("/api/units", fetcher);
  return {
    units: data,
    error,
    isLoading
  };
}

// helper to revalidate after a mutation
export const revalidateUnits = () => mutate("/api/units");