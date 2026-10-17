import "server-only";
import { createHash } from "node:crypto";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { getDatabase } from "@/database";
import { browserSnapshotTable } from "@/database/schema";
import { RequestError } from "@/lib/http/request";
import type { SnapshotInput } from "@/schemas/sync";
import { snapshotSelection } from "@/schemas/sync-selection";
export async function listSnapshots(userId: string) {
  return getDatabase()
    .select(snapshotSelection)
    .from(browserSnapshotTable)
    .where(eq(browserSnapshotTable.userId, userId))
    .orderBy(
      desc(browserSnapshotTable.createdAt),
      desc(browserSnapshotTable.id),
    )
    .limit(50);
}
export async function saveSnapshot(userId: string, input: SnapshotInput) {
  const document = JSON.stringify(input.data);
  if (Buffer.byteLength(document) > 2 * 1024 * 1024)
    throw new RequestError(413, "Backup data must be smaller than 2 MB.");
  return getDatabase().transaction(async (database) => {
    await database.execute(
      sql`select pg_advisory_xact_lock(hashtext(${userId}))`,
    );
    const [total] = await database
      .select({ value: count() })
      .from(browserSnapshotTable)
      .where(eq(browserSnapshotTable.userId, userId));
    if (total.value >= 50)
      throw new RequestError(
        409,
        "You can store up to 50 backups. Delete a backup first.",
      );
    const [snapshot] = await database
      .insert(browserSnapshotTable)
      .values({
        ...input,
        userId,
        checksum: createHash("sha256").update(document).digest("hex"),
        tabCount: input.data.tabs.length,
        groupCount: input.data.groups.length,
        workspaceCount: input.data.workspaces.length,
        bookmarkCount: input.data.bookmarks.length,
      })
      .returning(snapshotSelection);
    return snapshot;
  });
}
export async function getSnapshot(userId: string, id: string) {
  const [snapshot] = await getDatabase()
    .select({ ...snapshotSelection, data: browserSnapshotTable.data })
    .from(browserSnapshotTable)
    .where(
      and(
        eq(browserSnapshotTable.id, id),
        eq(browserSnapshotTable.userId, userId),
      ),
    )
    .limit(1);
  if (!snapshot) throw new RequestError(404, "Backup not found.");
  return snapshot;
}
export async function deleteSnapshot(userId: string, id: string) {
  const [deleted] = await getDatabase()
    .delete(browserSnapshotTable)
    .where(
      and(
        eq(browserSnapshotTable.id, id),
        eq(browserSnapshotTable.userId, userId),
      ),
    )
    .returning({ id: browserSnapshotTable.id });
  if (!deleted) throw new RequestError(404, "Backup not found.");
}
