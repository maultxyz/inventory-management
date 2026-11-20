import { QR_CODE_QUIET_ZONE_MODULES } from "@/lib/constants/labels";
import type { QrCodeProps } from "@/lib/interfaces/labels";
import QRCode from "qrcode";
import { useMemo } from "react";

export function QrCode({ value, className }: QrCodeProps) {
  const { sizeWithQuietZone, darkModulesPath } = useMemo(() => {
    const { modules } = QRCode.create(value, { errorCorrectionLevel: "M" });
    const pathSegments: string[] = [];
    for (let row = 0; row < modules.size; row += 1) {
      for (let column = 0; column < modules.size; column += 1) {
        if (modules.get(row, column)) {
          pathSegments.push(
            `M${column + QR_CODE_QUIET_ZONE_MODULES} ${row + QR_CODE_QUIET_ZONE_MODULES}h1v1h-1z`,
          );
        }
      }
    }
    return {
      sizeWithQuietZone: modules.size + QR_CODE_QUIET_ZONE_MODULES * 2,
      darkModulesPath: pathSegments.join(""),
    };
  }, [value]);

  return (
    <svg
      aria-hidden
      className={className}
      viewBox={`0 0 ${sizeWithQuietZone} ${sizeWithQuietZone}`}
      shapeRendering="crispEdges"
    >
      <rect width={sizeWithQuietZone} height={sizeWithQuietZone} fill="#fff" />
      <path d={darkModulesPath} fill="#000" />
    </svg>
  );
}
