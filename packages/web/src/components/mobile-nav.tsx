import {
  MOBILE_NAV_TAB_ACTIVE_CLASS,
  MOBILE_NAV_TAB_CLASS,
  NAV_ITEMS,
} from "@/lib/constants/nav";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

export function MobileNav() {
  const { t } = useTranslation("common");
  return (
    <nav
      aria-label={t("a11y.mainNavigation")}
      className="flex shrink-0 border-t pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {NAV_ITEMS.map(({ to, icon: Icon, labelKey }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(MOBILE_NAV_TAB_CLASS, isActive && MOBILE_NAV_TAB_ACTIVE_CLASS)
          }
        >
          <Icon aria-hidden className="size-5" />
          {t(labelKey)}
        </NavLink>
      ))}
    </nav>
  );
}
