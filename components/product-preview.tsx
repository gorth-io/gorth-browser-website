import {
  Globe,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "@gorth/primitive/cores/lucide";

export function ProductPreview() {
  return (
    <figure
      aria-label="Illustrated browser interface preview"
      className="rounded-xl border bg-card p-2 shadow-sm"
    >
      <div className="overflow-hidden rounded-xl border bg-background">
        <div className="flex h-12 items-center gap-2 border-b bg-muted/50 px-3">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="mr-3 size-2.5 rounded-full bg-green-400" />
          <span className="flex h-8 flex-1 items-center gap-2 rounded-md bg-background px-3 text-xs">
            <Globe className="size-3" />
            Your workspace
          </span>
          <Plus className="size-4" />
        </div>
        <div className="flex h-12 items-center gap-2 border-b px-3">
          <ShieldCheck className="size-4 text-muted-foreground" />
          <span className="flex h-8 flex-1 items-center gap-2 rounded-md bg-muted px-3 text-xs text-muted-foreground">
            <Search className="size-3" />
            Search or enter address
          </span>
          <SlidersHorizontal className="size-4 text-muted-foreground" />
        </div>
        <div className="flex min-h-64 flex-col items-center justify-center gap-5 bg-gradient-to-br from-violet-500/10 to-background p-8">
          <Globe className="size-12" />
          <p className="text-center text-2xl font-semibold">
            What will you explore?
          </p>
          <div className="flex w-full items-center gap-2 rounded-lg border bg-background p-3 text-xs text-muted-foreground">
            <Search className="size-4" />A fresh start for the web
          </div>
        </div>
      </div>
      <figcaption className="px-2 pt-3 pb-1 text-xs text-muted-foreground">
        Interface preview · Gorth Browser
      </figcaption>
    </figure>
  );
}
