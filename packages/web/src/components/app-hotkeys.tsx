import { useHotkeys } from "@/hooks/use-hotkeys";
import {
  HOTKEY_ROUTES,
  HOTKEY_SEARCH_ATTRIBUTE,
} from "@/lib/constants/hotkeys";
import { hardReload } from "@/lib/app-update";
import { focusHotkeySearch } from "@/lib/hotkeys";
import { toast } from "@/lib/toast";
import { useNavigate } from "react-router-dom";

export function AppHotkeys() {
  const navigate = useNavigate();
  const go = (route: string) => () => navigate(route);

  useHotkeys({
    focusSearch: () => {
      if (!focusHotkeySearch(`[${HOTKEY_SEARCH_ATTRIBUTE}]`)) {
        navigate(HOTKEY_ROUTES.goItems);
      }
    },
    dismissToasts: () => toast.dismiss(),
    reloadApp: () => void hardReload(),
    goOverview: go(HOTKEY_ROUTES.goOverview),
    goScan: go(HOTKEY_ROUTES.goScan),
    goItems: go(HOTKEY_ROUTES.goItems),
    goActivity: go(HOTKEY_ROUTES.goActivity),
  });

  return null;
}
