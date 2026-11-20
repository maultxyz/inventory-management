import { HotkeyHint } from "@/components/hotkey-hint";
import { Button } from "@/components/ui/button";
import { hardReload, useIsAppUpdateAvailable } from "@/lib/app-update";
import { IconRefresh } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export function AppUpdateButton() {
  const { t } = useTranslation("common");
  const isAppUpdateAvailable = useIsAppUpdateAvailable();
  if (!isAppUpdateAvailable) return null;
  return (
    <Button
      variant="outline"
      size="sm"
      title={t("appUpdate.availableLabel")}
      onClick={() => void hardReload()}
    >
      <IconRefresh />
      {t("appUpdate.available")}
      <HotkeyHint id="reloadApp" className="touch:hidden" />
    </Button>
  );
}
