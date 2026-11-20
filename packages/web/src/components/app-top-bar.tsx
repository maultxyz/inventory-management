import { AppUpdateButton } from "@/components/app-update-button";
import { BrandMark } from "@/components/brand-mark";
import { KeyboardShortcutsButton } from "@/components/keyboard-shortcuts-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { HOME_PATH } from "@/lib/constants/nav";
import { Link } from "react-router-dom";

export function AppTopBar() {
  return (
    <header className="flex h-8 shrink-0 items-center justify-between gap-2 px-2 touch:h-12 touch:px-3">
      <Link
        to={HOME_PATH}
        className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <BrandMark />
      </Link>
      <div className="flex shrink-0 items-center gap-0.5 text-foreground">
        <AppUpdateButton />
        <KeyboardShortcutsButton />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
