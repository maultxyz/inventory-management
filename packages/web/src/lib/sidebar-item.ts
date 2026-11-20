import { buttonVariants } from "@/components/ui/button";
import {
  SIDEBAR_EXPANDED_ITEM_CLASS,
  SIDEBAR_IDLE_ITEM_CLASS,
  SIDEBAR_SELECTED_ITEM_CLASS,
} from "@/lib/constants/nav";
import { cn } from "@/lib/utils";

export function sidebarItemClassName({ isActive }: { isActive: boolean }) {
  return cn(
    buttonVariants({ variant: "ghost" }),
    SIDEBAR_EXPANDED_ITEM_CLASS,
    isActive ? SIDEBAR_SELECTED_ITEM_CLASS : SIDEBAR_IDLE_ITEM_CLASS,
  );
}
