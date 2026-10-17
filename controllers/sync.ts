import "server-only";
import type { Context } from "hono";
import type { ApiEnv } from "@/utils/interface";
import { readJson } from "@/lib/http/request";
import { snapshotInputSchema, snapshotIdSchema } from "@/schemas/sync";
import {
  listSnapshots as listSnapshotsServices,
  saveSnapshot as saveSnapshotServices,
  deleteSnapshot as deleteSnapshotServices,
  getSnapshot as getSnapshotServices,
} from "@/services/sync-store";

export async function listSnapshots(context: Context<ApiEnv>) {
  const items = await listSnapshotsServices(context.get("user").id);
  return context.json({ items }, 200, { "Cache-Control": "no-store" });
}
export async function saveSnapshot(context: Context<ApiEnv>) {
  const input = snapshotInputSchema.parse(
    await readJson(context.req.raw, 2 * 1024 * 1024),
  );
  const snapshot = await saveSnapshotServices(context.get("user").id, input);
  return context.json({ snapshot }, 201, { "Cache-Control": "no-store" });
}
export async function deleteSnapshot(context: Context<ApiEnv>) {
  const id = snapshotIdSchema.parse(context.req.query("id"));
  await deleteSnapshotServices(context.get("user").id, id);
  return context.body(null, 204);
}
export async function getSnapshot(context: Context<ApiEnv>) {
  const id = snapshotIdSchema.parse(context.req.query("id"));
  const snapshot = await getSnapshotServices(context.get("user").id, id);
  return context.json({ version: snapshot.version, data: snapshot.data }, 200, {
    "Cache-Control": "private, no-store",
    "Content-Disposition":
      'attachment; filename="gorth-browser-' + id + '.json"',
    "X-Content-Type-Options": "nosniff",
  });
}
