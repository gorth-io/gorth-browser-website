import { useQueryClient } from "@gorth/primitive/cores/tanstack/query";
import { useCallerQuery, useCallerMutation } from "@/utils/caller";
import {
  backupFileSchema,
  syncDataSchema,
  type SnapshotInput,
  type SnapshotSummary,
} from "@/schemas/sync";
const key = ["account", "sync"] as const;
export function useSnapshots() {
  return useCallerQuery<{ items: SnapshotSummary[] }>({
    url: "/sync",
    queryKey: key,
    queryOptions: { retry: false },
  });
}
export function useSnapshotMutation() {
  const queries = useQueryClient();
  return useCallerMutation<
    unknown,
    { action: "save"; data: SnapshotInput } | { action: "delete"; id: string }
  >({
    url: "/sync",
    mapVariables: (input, options) => ({
      ...options,
      ...(input.action === "save"
        ? { url: "/sync", method: "POST", body: input.data }
        : { url: "/sync", method: "DELETE", params: { id: input.id } }),
    }),
    mutationOptions: {
      onSuccess: () => queries.invalidateQueries({ queryKey: key }),
    },
  });
}
export async function readBackupFile(file: File) {
  if (file.size > 2 * 1024 * 1024)
    throw new Error("Choose a JSON file smaller than 2 MB.");
  const document: unknown = JSON.parse(await file.text());
  const wrapped = backupFileSchema.safeParse(document);
  // Also accept the native BrowserSnapshot export; discard non-sync fields.
  return wrapped.success
    ? wrapped.data
    : { version: 1 as const, data: syncDataSchema.parse(document) };
}
