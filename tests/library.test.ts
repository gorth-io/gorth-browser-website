import { beforeEach, expect, it, vi } from "vitest";
import { libraryQuerySchema } from "@/schemas/library";
import { syncDataSchema } from "@/schemas/sync";
import { projectLibrary, webHref } from "@/utils/library";
vi.mock("server-only", () => ({}));
const store = vi.hoisted(() => ({ list: vi.fn(), get: vi.fn() }));
vi.mock("@/services/sync-store", () => ({
  listSnapshots: store.list,
  getSnapshot: store.get,
}));
import { getLibrary } from "@/services/library-store";

const data = syncDataSchema.parse({
  tabs: [
    {
      id: "a",
      title: "Alpha",
      url: "https://alpha.test",
      faviconUrl: "https://alpha.test/synced.png",
    },
    { id: "b", title: "Beta", url: "https://beta.test" },
    { id: "c", title: "Gamma", url: "gorth://home" },
  ],
  groups: [{ id: "g", name: "Group", mode: "normal", tabIds: ["b", "a"] }],
  workspaces: [
    { id: "w", name: "Workspace", tabIds: ["b", "c"], groupIds: ["g"] },
  ],
  bookmarks: [{ id: "mark", title: "Saved", url: "https://saved.test" }],
});
const summary = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  name: "Backup",
  deviceName: "Desktop",
  version: 1,
  checksum: "hash",
  tabCount: 3,
  groupCount: 1,
  workspaceCount: 1,
  bookmarkCount: 1,
  createdAt: new Date("2026-10-16T00:00:00Z"),
};
beforeEach(() => {
  vi.resetAllMocks();
  store.list.mockResolvedValue([summary]);
  store.get.mockResolvedValue({ ...summary, data });
});
it("unions direct and grouped workspace tabs without duplicates, preserving tab order", () => {
  expect(
    projectLibrary(data, { kind: "workspace", id: "w" })?.items.map(
      (item) => item.id,
    ),
  ).toEqual(["a", "b", "c"]);
  expect(projectLibrary(data, { kind: "workspace" })?.items[0].count).toBe(3);
  expect(
    projectLibrary(data, { kind: "group", id: "g" })?.items.map(
      (item) => item.id,
    ),
  ).toEqual(["a", "b"]);
  expect(projectLibrary(data, { kind: "group", id: "missing" })).toBeNull();
});
it("uses only synced favicons and never infers a browsing-history request", () => {
  const rows = projectLibrary(data, { kind: "tab" })!.items;
  expect(rows[0].faviconUrl).toBe("https://alpha.test/synced.png");
  expect(rows[1].faviconUrl).toBeUndefined();
  expect(
    projectLibrary(data, { kind: "bookmark" })!.items[0].faviconUrl,
  ).toBeUndefined();
  expect(webHref("javascript:alert(1)")).toBeUndefined();
  expect(webHref("https://user:secret@example.test")).toBeUndefined();
  expect(webHref("gorth://home")).toBeUndefined();
  expect(webHref("https://alpha.test")).toBe("https://alpha.test/");
});
it("drops unsupported icon metadata without dropping a valid backup", () => {
  const input = {
    tabs: [
      {
        id: "t",
        title: "Tab",
        url: "https://example.test",
        faviconUrl: "file:///private/icon.png",
        accessToken: "never-save",
      },
    ],
    cookies: ["never-save"],
  };
  const parsed = syncDataSchema.parse(input);
  expect(parsed.tabs[0].faviconUrl).toBe("");
  expect(JSON.stringify(parsed)).not.toContain("never-save");
  expect(
    syncDataSchema.safeParse({
      tabs: [{ id: "t", title: "x", url: "https://user:secret@example.test" }],
    }).success,
  ).toBe(false);
});
it("bounds pagination and filters before slicing", async () => {
  expect(libraryQuerySchema.safeParse({ limit: 101 }).success).toBe(false);
  const response = await getLibrary(
    "owner",
    libraryQuerySchema.parse({ search: "beta", page: 0, limit: 1 }),
  );
  expect(response.total).toBe(1);
  expect(response.items[0].id).toBe("b");
  expect(store.list).toHaveBeenCalledWith("owner");
  expect(store.get).toHaveBeenCalledWith("owner", summary.id);
  expect(response.snapshot).toEqual({
    ...summary,
    createdAt: summary.createdAt.toISOString(),
  });
  expect(response.snapshot).not.toHaveProperty("data");
});
it("keeps explicit snapshot selection owner-scoped and propagates missing snapshots", async () => {
  store.get.mockRejectedValue(new Error("Backup not found"));
  await expect(
    getLibrary(
      "other-owner",
      libraryQuerySchema.parse({ snapshot: summary.id }),
    ),
  ).rejects.toThrow("Backup not found");
  expect(store.get).toHaveBeenCalledWith("other-owner", summary.id);
});
it("returns an empty state without querying a nonexistent snapshot", async () => {
  store.list.mockResolvedValue([]);
  expect(await getLibrary("owner", libraryQuerySchema.parse({}))).toMatchObject(
    { items: [], total: 0, snapshot: null },
  );
  expect(store.get).not.toHaveBeenCalled();
});
it("rejects a collection absent from the chosen snapshot", async () => {
  await expect(
    getLibrary(
      "owner",
      libraryQuerySchema.parse({ kind: "workspace", id: "absent" }),
    ),
  ).rejects.toMatchObject({ status: 404 });
});
