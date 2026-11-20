import { HotkeyHint } from "@/components/hotkey-hint";
import { useTranslation } from "react-i18next";

export function StatusBar() {
  const { t } = useTranslation("common");
  return (
    <footer className="flex h-6 shrink-0 items-center justify-between gap-3 border-t px-2 pb-[env(safe-area-inset-bottom)] text-2xs text-foreground/70 max-md:hidden">
      <span>
        {t("appName")} v{__APP_VERSION__}
      </span>
      <span className="flex items-center gap-1.5">
        <HotkeyHint id="showShortcuts" />
        {t("hotkeys.title")}
      </span>
    </footer>
  );
}
