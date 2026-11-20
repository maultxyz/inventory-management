import type { NavItemDef } from "@/lib/interfaces/nav";
import {
  IconHistory,
  IconLayoutDashboard,
  IconPackages,
  IconQrcode,
} from "@tabler/icons-react";

export const HOME_PATH = "/app/home";
export const SCAN_PATH = "/app/scan";
export const ITEMS_PATH = "/app/items";
export const ACTIVITY_PATH = "/app/activity";

export const NAV_ITEMS: NavItemDef[] = [
  { to: HOME_PATH, icon: IconLayoutDashboard, labelKey: "nav.overview" },
  { to: SCAN_PATH, icon: IconQrcode, labelKey: "nav.scan" },
  { to: ITEMS_PATH, icon: IconPackages, labelKey: "nav.items" },
  { to: ACTIVITY_PATH, icon: IconHistory, labelKey: "nav.activity" },
];

export const COMPACT_LAYOUT_MAX_WIDTH_PX = 1023;

export const PAGE_TITLE_CLASS =
  "font-heading text-sm font-semibold text-foreground";
export const PAGE_BODY_CLASS =
  "mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:gap-3 md:px-4 md:py-3 tablet:gap-4 tablet:p-5";
export const SIDEBAR_IDLE_ITEM_CLASS =
  "text-sidebar-foreground hover:bg-sidebar-accent dark:hover:bg-sidebar-accent aria-expanded:bg-sidebar-accent";
export const SIDEBAR_SELECTED_ITEM_CLASS =
  "bg-sidebar-selected text-foreground hover:bg-sidebar-selected hover:text-foreground dark:hover:bg-sidebar-selected aria-expanded:bg-sidebar-selected";
export const SIDEBAR_EXPANDED_ITEM_CLASS =
  "w-full justify-start gap-2 px-2 border-0 font-normal";

export const MOBILE_NAV_TAB_CLASS =
  "flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-2xs leading-tight font-medium text-sidebar-foreground transition-colors active:bg-sidebar-accent tablet:h-12 tablet:flex-row tablet:gap-2 tablet:text-sm";
export const MOBILE_NAV_TAB_ACTIVE_CLASS = "bg-sidebar-selected text-foreground";
