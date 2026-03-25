import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useSiteSettings() {
  const { data: settings, isLoading: settingsLoading } = useQuery<Record<string, string>>({
    queryKey: ["public-settings"],
    queryFn: () => api.settings.getPublic(),
    staleTime: 60_000,
    retry: 1,
    throwOnError: false,
  });

  const { data: cvData, isLoading: cvLoading } = useQuery<{ url: string }>({
    queryKey: ["public-cv"],
    queryFn: () => api.settings.getCv(),
    staleTime: 60_000,
    retry: 1,
    throwOnError: false,
  });

  const rawCvUrl = cvData?.url ?? null;
  const cvUrl = rawCvUrl && rawCvUrl.trim() && !rawCvUrl.includes("example.com")
    ? rawCvUrl
    : null;

  return {
    settings: settings ?? {},
    siteTitle: settings?.["site_title"] ?? "nayem.me",
    cvUrl,
    isLoading: settingsLoading || cvLoading,
  };
}
