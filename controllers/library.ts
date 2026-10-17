import "server-only";
import type { Context } from "hono";
import type { ApiEnv } from "@/utils/interface";
import { libraryQuerySchema } from "@/schemas/library";
import { getLibrary as getLibraryServices } from "@/services/library-store";
export async function getLibrary(context: Context<ApiEnv>) {
  const query = libraryQuerySchema.parse(context.req.query());
  const data = await getLibraryServices(context.get("user").id, query);
  return context.json(data, 200, { "Cache-Control": "private, no-store" });
}
