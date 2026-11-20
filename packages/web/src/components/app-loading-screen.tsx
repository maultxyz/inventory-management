import { IconPackage } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export function AppLoadingScreen() {
  const { t } = useTranslation("common");

  return (
    <div className="flex h-dvh w-dvw items-center justify-center bg-background">
      <IconPackage
        aria-hidden
        className="size-8 animate-pulse text-foreground/60 motion-reduce:animate-none"
      />
      <span role="status" className="sr-only">
        {t("loadingApp")}
      </span>
    </div>
  );
}
