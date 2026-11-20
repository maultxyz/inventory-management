import { IconBadge } from "@/components/icon-badge";
import type { QrScannerViewProps } from "@/lib/interfaces/labels";
import { cn } from "@/lib/utils";
import { IconCameraOff, IconLoader2 } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export function QrScannerView({
  videoRef,
  status,
  isPaused,
}: QrScannerViewProps) {
  const { t } = useTranslation("inventory");
  const isCameraLive = status === "scanning";
  const hasCameraProblem = status !== "scanning" && status !== "starting";

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-card bg-black">
      <video
        ref={videoRef}
        muted
        playsInline
        aria-label={t("scan.cameraLabel")}
        className={cn("size-full object-cover", !isCameraLive && "invisible")}
      />
      {isCameraLive && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 left-1/2 aspect-square h-3/5 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-white/90 shadow-[0_0_0_100vmax_rgb(0_0_0/0.35)] transition-opacity",
            isPaused && "opacity-40",
          )}
        />
      )}
      {status === "starting" && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-white">
          <IconLoader2 aria-hidden className="size-5 animate-spin" />
          {t("scan.status.starting")}
        </div>
      )}
      {hasCameraProblem && (
        <div
          role="alert"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white"
        >
          <IconBadge size="xl" tone="neutral" className="bg-white/15 text-white">
            <IconCameraOff aria-hidden className="size-5" />
          </IconBadge>
          <p className="max-w-sm text-sm font-medium">
            {t(`scan.status.${status}`)}
          </p>
        </div>
      )}
    </div>
  );
}
