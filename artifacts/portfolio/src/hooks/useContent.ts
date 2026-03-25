import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { PublicContent } from "../lib/api";

export function useContent() {
  return useQuery<PublicContent>({
    queryKey: ["public-content"],
    queryFn: () => api.content.getAll(),
    staleTime: 60_000,
    retry: 1,
    throwOnError: false,
  });
}
