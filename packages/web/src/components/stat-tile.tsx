import type { StatTileProps } from "@/lib/interfaces/inventory";
import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  tone = "primary",
  caption,
}: StatTileProps) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-card border bg-card p-3 md:p-2.5">
      <dt className="truncate text-xs text-foreground/70">{label}</dt>
      <dd
        className={cn(
          "truncate font-heading text-lg font-semibold",
          tone === "warning" ? "text-warning-foreground" : "text-foreground",
        )}
      >
        {value}
      </dd>
      {caption && (
        <dd className="line-clamp-2 text-2xs text-foreground/70">{caption}</dd>
      )}
    </div>
  );
}
