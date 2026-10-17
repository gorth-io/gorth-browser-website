import { useState, useMemo } from "react";
import { Link } from "@gorth/primitive/cores/tanstack/router";
import { DataTable } from "@/components/custom/data-table";
import type { DataTableProps } from "@gorth/primitive/utils/interface";
import { NavIdentity } from "@/components/dashboard/nav-user";
import { Spinner } from "@gorth/primitive/pattern/spinner";
import { Button } from "@gorth/primitive/custom/button";
import {
  Select,
  SelectGroup,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gorth/primitive/custom/select";
import { useLibrary } from "@/services/library";
import { webHref } from "@/utils/library";
import type { LibraryRow, LibraryQuery } from "@/schemas/library";

export function LibraryTable({
  kind = "tab",
  id,
  snapshot: initialSnapshot,
}: Pick<LibraryQuery, "kind" | "id"> & { snapshot?: string }) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [snapshot, setSnapshot] = useState(initialSnapshot ?? "");
  const query = useLibrary({
    kind,
    id,
    snapshot: snapshot || undefined,
    search,
    page: pagination.pageIndex,
    limit: pagination.pageSize,
  });
  const collections = !id && (kind === "group" || kind === "workspace");
  const columns = useMemo<DataTableProps<LibraryRow>["columns"]>(
    () => [
      {
        id: "identity",
        accessorFn: (row) => row.title,
        header: collections ? "Collection" : "Website",
        cell: ({ row }) => {
          const item = row.original;
          const identity = (
            <NavIdentity
              user={{
                name: item.title || item.url || "Untitled",
                email: item.url,
                avatar: item.faviconUrl,
              }}
              description={item.description ?? item.url}
            />
          );
          return collections ? (
            <Link
              to={item.url}
              search={{ snapshot: query.data?.snapshot?.id ?? "" }}
              className="flex min-w-0"
            >
              {identity}
            </Link>
          ) : webHref(item.url) ? (
            <a
              href={webHref(item.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0"
            >
              {identity}
            </a>
          ) : (
            identity
          );
        },
      },
      ...(collections
        ? [{ id: "count", header: "Tabs", accessorKey: "count" }]
        : []),
    ],
    [collections, query.data?.snapshot?.id],
  );
  return (
    <div className="space-y-4">
      <h1 className="sr-only">{query.data?.title ?? "Browser library"}</h1>
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={snapshot || "latest"}
          onValueChange={(value) => {
            if (!value) return;
            setSnapshot(value === "latest" ? "" : value);
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }}
        >
          <SelectTrigger aria-label="Snapshot" className="w-full sm:w-80">
            <SelectValue placeholder="Latest synced snapshot" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="latest">Latest synced snapshot</SelectItem>
              {query.data?.snapshots.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name} · {item.deviceName}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link to="/account/sync" />}
        >
          Manage backups
        </Button>
      </div>
      {query.isError ? (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 text-sm text-destructive"
        >
          <span>
            Unable to load this library. Check your session and selected
            snapshot.
          </span>
          <Button variant="outline" onClick={() => void query.refetch()}>
            Retry
          </Button>
        </div>
      ) : null}
      <DataTable
        columns={columns}
        data={query.data?.items ?? []}
        rowCount={query.data?.total ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        getRowId={(row) => row.id}
        nav={{
          name: query.data?.title ?? (kind === "tab" ? "Synced tab" : kind),
          description: query.data?.snapshot
            ? "From " +
              query.data.snapshot.name +
              " · " +
              query.data.snapshot.deviceName
            : "No synced snapshot yet. Upload a browser export to get started.",
        }}
        search={{
          value: search,
          placeholder: "Search title or URL...",
          onValueChange: (value) => {
            setSearch(value);
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          },
        }}
        loading={query.isPending || query.isFetching}
        loadingMessage={
          <Spinner variant="infinite" className="mx-auto size-8" />
        }
        onReload={() => void query.refetch()}
        onToggle={() => {}}
        emptyMessage={
          query.isError ? "Library unavailable." : "No items in this snapshot."
        }
      />
    </div>
  );
}
