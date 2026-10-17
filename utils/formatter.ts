export function resolveInternalPath(value: unknown, fallback = "/account") {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\\\s]/.test(value)
  )
    return fallback;
  try {
    const origin = "https://internal.invalid";
    const url = new URL(value, origin);
    return url.origin === origin && !url.pathname.startsWith("/auth/")
      ? url.pathname + url.search + url.hash
      : fallback;
  } catch {
    return fallback;
  }
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
import type { SnapshotSummary } from "@/schemas/sync";

// Explicit projection: the library never returns the full backup document.
export function formatSnapshotSummary(
  item: Omit<SnapshotSummary, "createdAt"> & { createdAt: Date },
): SnapshotSummary {
  return {
    id: item.id,
    name: item.name,
    deviceName: item.deviceName,
    version: item.version,
    checksum: item.checksum,
    tabCount: item.tabCount,
    groupCount: item.groupCount,
    workspaceCount: item.workspaceCount,
    bookmarkCount: item.bookmarkCount,
    createdAt: item.createdAt.toISOString(),
  };
}
