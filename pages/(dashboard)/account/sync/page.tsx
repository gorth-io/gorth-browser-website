import { SyncManager } from "@/components/sync-manager";
export default function SyncPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Browser backup</h1>
      <SyncManager />
    </>
  );
}
