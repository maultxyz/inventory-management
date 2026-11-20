import { HotkeyHint } from "@/components/hotkey-hint";
import { NAV_HOTKEY_BY_PATH } from "@/lib/constants/hotkeys";
import { NAV_ITEMS } from "@/lib/constants/nav";
import { sidebarItemClassName } from "@/lib/sidebar-item";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

export function AppNav() {
  const { t } = useTranslation("common");
  return (
    <nav
      aria-label={t("a11y.mainNavigation")}
      className="hidden w-52 shrink-0 flex-col gap-px border-r p-1 md:flex"
    >
      {NAV_ITEMS.map(({ to, icon: Icon, labelKey }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => sidebarItemClassName({ isActive })}
        >
          <Icon aria-hidden className="size-4" />
          <span className="flex-1 truncate text-left">{t(labelKey)}</span>
          <HotkeyHint
            id={NAV_HOTKEY_BY_PATH[to]}
            className="opacity-0 transition-opacity group-hover/button:opacity-100 group-focus-visible/button:opacity-100"
          />
        </NavLink>
      ))}
    </nav>
  );
}
