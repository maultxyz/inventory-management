import { HotkeyHint } from "@/components/hotkey-hint";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useHotkeys } from "@/hooks/use-hotkeys";
import { HOTKEY_GROUP_ORDER, HOTKEYS } from "@/lib/constants/hotkeys";
import { isHotkeyActive } from "@/lib/hotkeys";
import type { HotkeyId } from "@/lib/interfaces/hotkeys";
import {
  setSingleKeyHotkeysEnabled,
  useSingleKeyHotkeysEnabled,
} from "@/lib/single-key-hotkeys-store";
import { IconKeyboard } from "@tabler/icons-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

export function KeyboardShortcutsButton() {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const singleKeyHotkeysEnabled = useSingleKeyHotkeysEnabled();
  const singleKeyHintId = useId();

  useHotkeys({ showShortcuts: () => setOpen(true) });

  const ids = Object.keys(HOTKEYS) as HotkeyId[];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="max-md:hidden"
        aria-label={t("hotkeys.title")}
        title={t("hotkeys.title")}
        onClick={() => setOpen(true)}
      >
        <IconKeyboard className="size-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("hotkeys.title")}</DialogTitle>
            <DialogDescription>{t("hotkeys.description")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1">
            <Label className="flex items-center justify-between gap-4 font-normal">
              {t("hotkeys.singleKey.label")}
              <Switch
                checked={singleKeyHotkeysEnabled}
                onCheckedChange={setSingleKeyHotkeysEnabled}
                aria-describedby={singleKeyHintId}
              />
            </Label>
            <p id={singleKeyHintId} className="text-xs text-foreground/70">
              {t("hotkeys.singleKey.hint")}
            </p>
          </div>
          <div className="flex flex-col gap-4 md:gap-2">
            {HOTKEY_GROUP_ORDER.map((group) => (
              <section key={group} className="flex flex-col gap-1.5">
                <h3 className="text-xs font-semibold text-foreground">
                  {t(`hotkeys.groups.${group}`)}
                </h3>
                <ul className="flex flex-col gap-1">
                  {ids
                    .filter((id) => HOTKEYS[id].group === group)
                    .map((id) => {
                      const isActive =
                        group === "stockDialog" ||
                        isHotkeyActive(id, singleKeyHotkeysEnabled);
                      return (
                        <li
                          key={id}
                          className="flex items-center justify-between gap-4 text-foreground/70"
                        >
                          <span>{t(`hotkeys.actions.${id}`)}</span>
                          <span className="inline-flex items-center gap-1.5">
                            {isActive ? null : (
                              <Badge variant="outline">
                                {t("hotkeys.off")}
                              </Badge>
                            )}
                            <HotkeyHint
                              id={id}
                              showWhenInactive
                              className={isActive ? undefined : "line-through"}
                            />
                          </span>
                        </li>
                      );
                    })}
                </ul>
              </section>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
