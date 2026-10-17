import { useState } from "react";
import { Archive } from "@gorth/primitive/cores/lucide";
import { Spinner } from "@gorth/primitive/pattern/spinner";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@gorth/primitive/default/empty";
import { Link } from "@gorth/primitive/cores/tanstack/router";
import { normalizeCallerError } from "@/utils/caller";
import { Button } from "@gorth/primitive/custom/button";
import { Input } from "@gorth/primitive/default/input";
import { Label } from "@gorth/primitive/default/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@gorth/primitive/default/card";
import {
  useSnapshots,
  useSnapshotMutation,
  readBackupFile,
} from "@/services/sync";
import { formatDateTime } from "@/utils/formatter";
export function SyncManager() {
  const query = useSnapshots();
  const mutation = useSnapshotMutation();
  const [message, setMessage] = useState("");
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create a backup</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const fields = new FormData(form);
              const file = fields.get("file");
              setMessage("");
              try {
                if (!(file instanceof File) || !file.size)
                  throw new Error("Choose a Browser backup JSON file.");
                const data = await readBackupFile(file);
                await mutation.mutateAsync({
                  action: "save",
                  data: {
                    ...data,
                    name: String(fields.get("name") ?? ""),
                    deviceName: String(fields.get("deviceName") ?? ""),
                  },
                });
                setMessage("Your backup was saved.");
                form.reset();
              } catch (error) {
                setMessage(normalizeCallerError(error).message);
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="backup-name">Backup name</Label>
              <Input
                id="backup-name"
                name="name"
                required
                maxLength={80}
                placeholder="My browser"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backup-device">Device name</Label>
              <Input
                id="backup-device"
                name="deviceName"
                required
                maxLength={80}
                placeholder="My Mac"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backup-file">Browser JSON export</Label>
              <Input
                id="backup-file"
                name="file"
                type="file"
                accept=".json,application/json"
                required
              />
            </div>
            <Button
              className="self-end"
              type="submit"
              disabled={mutation.isPending}
            >
              Save backup
            </Button>
          </form>
          <p aria-live="polite" className="mt-3 text-sm">
            {message}
          </p>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        Manual versioned backups, not live synchronization. Cookies, passwords,
        tokens, browsing history and extension data are excluded. Restoring a
        backup never happens automatically.
      </p>
      {query.isPending && (
        <div
          role="status"
          aria-label="Loading backups"
          className="flex justify-center py-8"
        >
          <Spinner variant="infinite" className="size-8" />
        </div>
      )}
      {query.isError && (
        <p role="alert">
          Unable to load backups. Check your session and database configuration.
        </p>
      )}
      {query.data?.items.length === 0 && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Archive />
            </EmptyMedia>
            <EmptyTitle>No backups yet</EmptyTitle>
            <EmptyDescription>
              Upload your first browser export using the form above.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {query.data?.items.map((snapshot) => (
          <Card key={snapshot.id}>
            <CardHeader>
              <CardTitle className="truncate">{snapshot.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {snapshot.deviceName} · {formatDateTime(snapshot.createdAt)}
              </p>
              <p className="text-sm">
                {snapshot.tabCount} tabs · {snapshot.groupCount} groups ·{" "}
                {snapshot.workspaceCount} workspaces · {snapshot.bookmarkCount}{" "}
                bookmarks
              </p>
              <div className="flex gap-2">
                <Button
                  nativeButton={false}
                  className="h-9"
                  variant="outline"
                  render={<Link to={"/sync/file?id=" + snapshot.id} />}
                >
                  Download backup
                </Button>
                <Button
                  className="h-9"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={async () => {
                    if (!window.confirm("Delete this backup?")) return;
                    try {
                      await mutation.mutateAsync({
                        action: "delete",
                        id: snapshot.id,
                      });
                      setMessage("Deleted.");
                    } catch {
                      setMessage("Unable to delete this backup.");
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
