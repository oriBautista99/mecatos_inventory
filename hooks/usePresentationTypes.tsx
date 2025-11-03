import { TypePresentation } from "@/types/type_presentation";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then(async res => {
  if (!res.ok) throw new Error("Fetch error");
  return (await res.json()) as TypePresentation[];
});

export function usePresentationTypesSWR() {
  const { data, error, isLoading } = useSWR<TypePresentation[]>("/api/presentation-types", fetcher);
  return {
    presentationsTypes: data,
    error,
    isLoading
  };
}

// helper to revalidate after a mutation
export const revalidatePresentationTypes = () => mutate("/api/presentation-types");
