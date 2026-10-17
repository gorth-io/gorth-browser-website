import { useLocation, useParams } from "@gorth/primitive/cores/tanstack/router";
import { LibraryTable } from "@/components/library-table";
export default function Page() {
  const { id } = useParams({ strict: false });
  const search = useLocation({ select: (location) => location.searchStr });
  const snapshot = new URLSearchParams(search).get("snapshot") ?? undefined;
  return <LibraryTable kind="workspace" id={id} snapshot={snapshot} />;
}
