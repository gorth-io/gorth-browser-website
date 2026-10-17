import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { z } from "@gorth/structure/cores/zod";
import type { ApiEnv } from "@/utils/interface";
import { RequestError } from "@/lib/http/request";
import { requireAuth } from "@/middlewares/auth";
import { getLibrary } from "@/controllers/library";
import {
  listSnapshots,
  saveSnapshot,
  deleteSnapshot,
  getSnapshot,
} from "@/controllers/sync";

export function createSyncRoutes() {
  const router = new Hono<ApiEnv>();
  router.onError((error, context) => {
    if (error instanceof HTTPException) return error.getResponse();
    const status =
      error instanceof RequestError
        ? (error.status as ContentfulStatusCode)
        : error instanceof z.ZodError
          ? 400
          : 503;
    return context.json(
      {
        error:
          error instanceof RequestError
            ? error.message
            : status === 400
              ? "Invalid backup format or references."
              : "Backup storage is unavailable.",
      },
      status,
      { "Cache-Control": "no-store" },
    );
  });
  router.get("/", requireAuth(), listSnapshots);
  router.get("/library", requireAuth(), getLibrary);
  router.post("/", requireAuth(true), saveSnapshot);
  router.delete("/", requireAuth(true), deleteSnapshot);
  router.get("/file", requireAuth(), getSnapshot);
  return router;
}
