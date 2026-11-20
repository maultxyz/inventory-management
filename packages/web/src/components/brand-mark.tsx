import { cn } from "@/lib/utils";
import { IconPackage } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export function BrandMark({ className }: { className?: string }) {
  const { t } = useTranslation("common");
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 font-heading text-sm font-medium text-foreground",
        className,
      )}
    >
      <IconPackage aria-hidden className="size-4 text-foreground/70" />
      {t("appName")}
    </span>
  );
}
