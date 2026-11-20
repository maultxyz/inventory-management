import { Button } from "@/components/ui/button";
import { MAIN_CONTENT_ID } from "@/lib/constants/a11y";
import { PAGE_TITLE_CLASS } from "@/lib/constants/nav";
import { IconError404 } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  const { t } = useTranslation("common");

  return (
    <main
      id={MAIN_CONTENT_ID}
      tabIndex={-1}
      className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4 text-center outline-none"
    >
      <IconError404 aria-hidden className="size-16 text-foreground/70" />
      <div className="flex flex-col gap-1">
        <h1 className={PAGE_TITLE_CLASS}>{t("notFound.title")}</h1>
        <p className="text-xs text-foreground/70">
          {t("notFound.description")}
        </p>
      </div>
      <Button nativeButton={false} render={<Link to="/" />}>
        {t("backHome")}
      </Button>
    </main>
  );
}
