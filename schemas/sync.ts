import { z } from "@gorth/structure/cores/zod";
const id = z.string().min(1).max(128);
const url = z
  .string()
  .max(32768)
  .refine((value) => {
    if (!value) return true;
    try {
      const parsed = new URL(value);
      return (
        ["http:", "https:", "gorth:"].includes(parsed.protocol) &&
        !parsed.username &&
        !parsed.password
      );
    } catch {
      return false;
    }
  }, "Only web URLs and Gorth pages are allowed.");
const title = z.string().max(8192);
const favicon = z
  .string()
  .max(32768)
  .transform((value) => {
    if (
      /^data:image\/(?:png|jpeg|webp|x-icon|vnd\.microsoft\.icon);base64,[A-Za-z0-9+/=]+$/.test(
        value,
      )
    )
      return value;
    try {
      const image = new URL(value);
      if (
        ["https:", "http:"].includes(image.protocol) &&
        !image.username &&
        !image.password
      )
        return image.href;
    } catch {
      /* Drop non-web favicon metadata, not the browser export. */
    }
    return "";
  });
const tabSchema = z.object({
  id,
  title,
  url,
  faviconUrl: favicon.optional(),
  isMuted: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  internalPage: z.string().max(128).nullable().default(null),
  isSleeping: z.boolean().default(false),
});
const groupSchema = z
  .object({
    id,
    name: z.string().trim().min(1).max(80),
    mode: z.enum(["normal", "split", "glance"]),
    tabIds: z.array(id).min(1).max(500),
  })
  .refine(
    (group) => group.mode === "normal" || group.tabIds.length === 2,
    "Split/glance groups require two tabs.",
  );
const workspaceSchema = z.object({
  id,
  name: z.string().trim().min(1).max(80),
  tabIds: z.array(id).max(500),
  groupIds: z.array(id).max(500).default([]),
  activeTabId: id.nullable().default(null),
});
// Explicit allow-list. No cookies, credentials, tokens, history or extension storage.
export const syncDataSchema = z
  .object({
    tabs: z.array(tabSchema).max(500),
    groups: z.array(groupSchema).max(500).default([]),
    workspaces: z.array(workspaceSchema).max(64).default([]),
    bookmarks: z
      .array(
        z.object({
          id,
          title,
          faviconUrl: favicon.optional(),
          url: url.refine(Boolean, "Bookmark URL is required."),
        }),
      )
      .max(10000)
      .default([]),
    activeTabId: id.nullable().default(null),
    splitTabId: id.nullable().default(null),
    activeWorkspaceId: id.nullable().default(null),
    preferences: z
      .object({
        theme: z.enum(["light", "dark", "system"]).optional(),
        tabLayout: z.enum(["separate", "compact"]).optional(),
        verticalTabs: z.boolean().optional(),
        sidebarSide: z.enum(["left", "right"]).optional(),
        enableWorkspace: z.boolean().optional(),
      })
      .optional(),
  })
  .superRefine((data, context) => {
    const unique = (values: string[], path: string) => {
      if (new Set(values).size !== values.length)
        context.addIssue({
          code: "custom",
          message: "Duplicate IDs.",
          path: [path],
        });
    };
    unique(
      data.tabs.map((item) => item.id),
      "tabs",
    );
    unique(
      data.groups.map((item) => item.id),
      "groups",
    );
    unique(
      data.workspaces.map((item) => item.id),
      "workspaces",
    );
    unique(
      data.bookmarks.map((item) => item.id),
      "bookmarks",
    );
    const tabs = new Set(data.tabs.map((item) => item.id));
    const groups = new Set(data.groups.map((item) => item.id));
    const missing = (path: string) =>
      context.addIssue({
        code: "custom",
        message: "Unknown tab/group/workspace reference.",
        path: [path],
      });
    if (data.activeTabId && !tabs.has(data.activeTabId)) missing("activeTabId");
    if (data.splitTabId && !tabs.has(data.splitTabId)) missing("splitTabId");
    for (const group of data.groups) {
      unique(group.tabIds, "groups");
      if (group.tabIds.some((item) => !tabs.has(item))) missing("groups");
    }
    for (const space of data.workspaces) {
      unique(space.tabIds, "workspaces");
      unique(space.groupIds, "workspaces");
      if (
        space.tabIds.some((item) => !tabs.has(item)) ||
        space.groupIds.some((item) => !groups.has(item)) ||
        (space.activeTabId && !space.tabIds.includes(space.activeTabId))
      )
        missing("workspaces");
    }
    if (
      data.activeWorkspaceId &&
      !data.workspaces.some((space) => space.id === data.activeWorkspaceId)
    )
      missing("activeWorkspaceId");
  });
export const backupFileSchema = z.object({
  version: z.literal(1),
  data: syncDataSchema,
});
export const snapshotInputSchema = backupFileSchema.extend({
  name: z.string().trim().min(1).max(80),
  deviceName: z.string().trim().min(1).max(80),
});
export const snapshotIdSchema = z.uuid();
export type SyncData = z.infer<typeof syncDataSchema>;
export type SnapshotInput = z.infer<typeof snapshotInputSchema>;
export interface SnapshotSummary {
  id: string;
  name: string;
  deviceName: string;
  version: number;
  checksum: string;
  tabCount: number;
  groupCount: number;
  workspaceCount: number;
  bookmarkCount: number;
  createdAt: string;
}
