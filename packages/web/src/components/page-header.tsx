import { Button } from "@/components/ui/button";
import { PAGE_TITLE_CLASS } from "@/lib/constants/nav";
import type { PageHeaderProps } from "@/lib/interfaces/nav";
import { cn } from "@/lib/utils";
import { IconArrowLeft } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function PageHeader({
  title,
  description,
  backTo,
  backLabel,
  actions,
  tabs,
  children,
  spansFullWidth = false,
}: PageHeaderProps) {
  const { t } = useTranslation("common");
  const backButtonLabel = backLabel ?? t("mobileMenu.back");
  return (
    <div
      className={cn(
        "sticky top-0 z-20 border-b bg-background",
        !tabs && "pb-2.5",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full flex-col gap-2 px-4 pt-2.5",
          spansFullWidth ? "" : "max-w-6xl",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 max-sm:grid max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:gap-x-3 max-sm:gap-y-0.5">
          <div className="flex min-w-0 items-center gap-2 max-sm:contents">
            {backTo && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label={backButtonLabel}
                title={backButtonLabel}
                nativeButton={false}
                render={<Link to={backTo} />}
              >
                <IconArrowLeft />
              </Button>
            )}
            <div className="min-w-0 max-sm:contents">
              <h1
                className={cn(
                  PAGE_TITLE_CLASS,
                  "max-sm:self-center max-sm:text-lg",
                )}
              >
                {title}
              </h1>
              {description && (
                <p className="text-xs text-foreground/70 max-sm:col-span-2">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-1.5 max-sm:col-start-2 max-sm:row-start-1 max-sm:flex-nowrap max-sm:justify-end">
              {actions}
            </div>
          )}
        </div>
        {children}
        {tabs}
      </div>
    </div>
  );
}
