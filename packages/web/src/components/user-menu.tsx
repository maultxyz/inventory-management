import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hardReload } from "@/lib/app-update";
import { signOut, useAuthSession } from "@/lib/auth";
import { appQueryClient } from "@/lib/query-client";
import { IconLogout, IconRefresh, IconUserCircle } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export function UserMenu() {
  const { t } = useTranslation("common");
  const { data } = useAuthSession();
  const user = data?.user;

  const handleSignOut = async () => {
    await signOut();
    appQueryClient.clear();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("userMenu.open")}
          >
            <IconUserCircle className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-2xs font-normal text-foreground/70">
              {t("userMenu.signedInAs")}
            </span>
            <span className="truncate text-xs font-medium text-foreground">
              {user?.name || user?.email}
            </span>
            {user?.name && (
              <span className="truncate text-2xs font-normal text-foreground/70">
                {user.email}
              </span>
            )}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void hardReload()}>
          <IconRefresh />
          <span className="flex flex-1 items-center justify-between gap-3">
            {t("userMenu.reloadApp")}
            <span className="text-2xs text-foreground/70">
              {t("userMenu.version", { version: __APP_VERSION__ })}
            </span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void handleSignOut()}>
          <IconLogout />
          {t("userMenu.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
