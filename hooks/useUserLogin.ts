import { Profile } from "@/types/user";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then(async res => {
  if (!res.ok) throw new Error("Fetch error");
  return (await res.json()) as Profile[];
});

export function useProfileLoginSWR() {
  const { data, error, isLoading } = useSWR<Profile[]>("/api/user-login", fetcher);
  return {
    profile: data && data[0],
    error,
    isLoading
  };
}

// helper to revalidate after a mutation
export const revalidateProfileLogin = () => mutate("/api/user-login");
