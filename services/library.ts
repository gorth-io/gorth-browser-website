import { useCallerQuery } from "@/utils/caller";
import type { LibraryQuery, LibraryResponse } from "@/schemas/library";
export function useLibrary(query: LibraryQuery) {
  return useCallerQuery<LibraryResponse>({
    url: "/sync/library",
    params: query,
    queryKey: ["browser-library", query],
    queryOptions: { retry: false },
  });
}
