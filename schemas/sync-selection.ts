import { browserSnapshotTable } from "@/database/schema";
export const snapshotSelection = {
  id: browserSnapshotTable.id,
  name: browserSnapshotTable.name,
  deviceName: browserSnapshotTable.deviceName,
  version: browserSnapshotTable.version,
  checksum: browserSnapshotTable.checksum,
  tabCount: browserSnapshotTable.tabCount,
  groupCount: browserSnapshotTable.groupCount,
  workspaceCount: browserSnapshotTable.workspaceCount,
  bookmarkCount: browserSnapshotTable.bookmarkCount,
  createdAt: browserSnapshotTable.createdAt,
};
