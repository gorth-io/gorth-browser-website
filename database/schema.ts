import { userTable } from "./auth";
export {
  userStatus,
  userTable,
  sessionTable,
  accountTable,
  rateLimitTable,
  legacySessionTable,
  legacyVerificationTable,
  verificationTable,
  revocationTable,
  proofTable,
} from "./auth";
import type { SyncData } from "@/schemas/sync";
import {
  bigint,
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const releaseTable = pgTable(
  "release",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    version: text("version").notNull(),
    platform: text("platform", {
      enum: ["macos", "windows", "linux"],
    }).notNull(),
    architecture: text("architecture", { enum: ["arm64", "x64"] }).notNull(),
    downloadUrl: text("download_url").notNull(),
    checksum: text("checksum"),
    sizeBytes: bigint("size_bytes", { mode: "number" }),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("release_variant_unique").on(
      table.version,
      table.platform,
      table.architecture,
    ),
  ],
);

export const browserSnapshotTable = pgTable(
  "browser_snapshot",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    deviceName: varchar("device_name", { length: 80 }).notNull(),
    version: bigint("version", { mode: "number" }).notNull().default(1),
    data: jsonb("data").$type<SyncData>().notNull(),
    checksum: varchar("checksum", { length: 64 }).notNull(),
    tabCount: bigint("tab_count", { mode: "number" }).notNull(),
    groupCount: bigint("group_count", { mode: "number" }).notNull(),
    workspaceCount: bigint("workspace_count", { mode: "number" }).notNull(),
    bookmarkCount: bigint("bookmark_count", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("browser_snapshot_user_created_idx").on(
      table.userId,
      table.createdAt,
    ),
  ],
);
