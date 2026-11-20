import { Button } from "@/components/ui/button";
import type { OverviewSectionProps } from "@/lib/interfaces/overview";
import { cn } from "@/lib/utils";
import { useId } from "react";
import { Link } from "react-router-dom";

export function OverviewSection({
  heading,
  description,
  viewAllTo,
  viewAllLabel,
  isOnCanvas = false,
  children,
}: OverviewSectionProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "flex min-w-0 flex-col gap-2",
        !isOnCanvas && "rounded-card border bg-card p-4 md:p-2.5",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <h2
            id={headingId}
            className="font-heading text-sm font-semibold text-foreground"
          >
            {heading}
          </h2>
          {description && (
            <p className="text-xs text-foreground/70">{description}</p>
          )}
        </div>
        {viewAllTo && (
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link to={viewAllTo} />}
          >
            {viewAllLabel}
          </Button>
        )}
      </div>
      {children}
    </section>
  );
}
