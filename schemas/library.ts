import { z } from "@gorth/structure/cores/zod";
import type { SnapshotSummary } from "@/schemas/sync";

export const libraryQuerySchema = z.object({
  kind: z.enum(["tab", "bookmark", "group", "workspace"]).default("tab"),
  id: z.string().min(1).max(128).optional(),
  snapshot: z.uuid().optional(),
  search: z.string().max(200).default(""),
  page: z.coerce.number().int().min(0).max(100000).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
export type LibraryQuery = z.infer<typeof libraryQuerySchema>;
export interface LibraryRow {
  id: string;
  title: string;
  url: string;
  faviconUrl?: string;
  count?: number;
  description?: string;
}
export interface LibraryResponse {
  items: LibraryRow[];
  total: number;
  snapshot: SnapshotSummary | null;
  snapshots: SnapshotSummary[];
  title: string;
}
