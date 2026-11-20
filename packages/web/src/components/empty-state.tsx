import { IconBadge } from "@/components/icon-badge";
import type { EmptyStateProps } from "@/lib/interfaces/empty-state";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "default",
  titleAs: TitleElement = "p",
  className,
}: EmptyStateProps) {
  const compact = size === "compact";
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        compact ? "py-6" : "py-16",
        className,
      )}
    >
      {Icon && (
        <IconBadge size={compact ? "lg" : "2xl"}>
          <Icon className={compact ? "size-5" : "size-7"} />
        </IconBadge>
      )}
      <div className="flex max-w-sm flex-col gap-1">
        <TitleElement className="text-sm font-medium">{title}</TitleElement>
        {description && (
          <p className="text-xs text-foreground/70">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
