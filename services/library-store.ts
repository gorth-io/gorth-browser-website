import "server-only";
import { getSnapshot, listSnapshots } from "@/services/sync-store";
import { syncDataSchema } from "@/schemas/sync";
import type { LibraryQuery, LibraryResponse } from "@/schemas/library";
import { projectLibrary } from "@/utils/library";
import { RequestError } from "@/lib/http/request";
import { formatSnapshotSummary } from "@/utils/formatter";

export async function getLibrary(
  userId: string,
  query: LibraryQuery,
): Promise<LibraryResponse> {
  const snapshots = (await listSnapshots(userId)).map(formatSnapshotSummary);
  const id = query.snapshot ?? snapshots[0]?.id;
  if (!id)
    return {
      items: [],
      total: 0,
      snapshot: null,
      snapshots,
      title: "Synced library",
    };
  // getSnapshot always scopes the ID to the authenticated owner, including explicit IDs.
  const snapshot = await getSnapshot(userId, id);
  const projection = projectLibrary(syncDataSchema.parse(snapshot.data), query);
  if (!projection)
    throw new RequestError(404, "Collection not found in this snapshot.");
  const search = query.search.toLocaleLowerCase();
  const filtered = projection.items.filter((item) =>
    (item.title + " " + item.url).toLocaleLowerCase().includes(search),
  );
  return {
    items: filtered.slice(
      query.page * query.limit,
      (query.page + 1) * query.limit,
    ),
    total: filtered.length,
    snapshot: formatSnapshotSummary(snapshot),
    snapshots,
    title: projection.title,
  };
}
