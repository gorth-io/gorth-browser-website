import type { SyncData } from "@/schemas/sync";
import type { LibraryQuery, LibraryRow } from "@/schemas/library";

export function projectLibrary(
  data: SyncData,
  query: Pick<LibraryQuery, "kind" | "id">,
): { title: string; items: LibraryRow[] } | null {
  if (query.id && (query.kind === "group" || query.kind === "workspace")) {
    const collection = (
      query.kind === "group" ? data.groups : data.workspaces
    ).find((item) => item.id === query.id);
    if (!collection) return null;
    const tabIds = new Set(collection.tabIds);
    if (query.kind === "workspace") {
      const space = data.workspaces.find((item) => item.id === query.id)!;
      for (const group of data.groups.filter((item) =>
        space.groupIds.includes(item.id),
      ))
        for (const id of group.tabIds) tabIds.add(id);
    }
    return {
      title: collection.name,
      items: data.tabs
        .filter((tab) => tabIds.has(tab.id))
        .map((tab) => ({
          id: tab.id,
          title: tab.title,
          url: tab.url,
          faviconUrl: tab.faviconUrl,
        })),
    };
  }
  if (query.kind === "group" || query.kind === "workspace") {
    const collections = query.kind === "group" ? data.groups : data.workspaces;
    return {
      title: query.kind === "group" ? "Tab group" : "Workspace",
      items: collections.map((item) => {
        const count = projectLibrary(data, { kind: query.kind, id: item.id })!
          .items.length;
        return {
          id: item.id,
          title: item.name,
          url: "/" + query.kind + "/" + encodeURIComponent(item.id),
          count,
          description: count + " tabs",
        };
      }),
    };
  }
  return {
    title: query.kind === "bookmark" ? "Bookmark" : "Synced tab",
    items: (query.kind === "bookmark" ? data.bookmarks : data.tabs).map(
      (item) => ({
        id: item.id,
        title: item.title,
        url: item.url,
        faviconUrl: item.faviconUrl,
      }),
    ),
  };
}
export function webHref(value: string) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}
