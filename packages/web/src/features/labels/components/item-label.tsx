import { QrCode } from "@/components/qr-code";
import { itemScanUrl } from "@/features/labels/lib/item-qr";
import {
  LABEL_PADDING_IN,
  LABEL_SHEET,
  LABEL_TEXT_SIZE_PER_HEIGHT,
} from "@/lib/constants/labels";
import type { ItemLabelProps } from "@/lib/interfaces/labels";

export function ItemLabel({ item }: ItemLabelProps) {
  const { labelWidthIn, labelHeightIn } = LABEL_SHEET;
  const qrCodeSizeIn = labelHeightIn - LABEL_PADDING_IN * 2;

  return (
    <div
      className="flex items-center overflow-hidden bg-white text-black"
      style={{
        width: `${labelWidthIn}in`,
        height: `${labelHeightIn}in`,
        padding: `${LABEL_PADDING_IN}in`,
        gap: `${LABEL_PADDING_IN}in`,
        fontSize: `${labelHeightIn * LABEL_TEXT_SIZE_PER_HEIGHT}in`,
        lineHeight: 1.15,
      }}
    >
      <div
        className="shrink-0"
        style={{ width: `${qrCodeSizeIn}in`, height: `${qrCodeSizeIn}in` }}
      >
        <QrCode
          value={itemScanUrl(window.location.origin, item.guid)}
          className="size-full"
        />
      </div>
      <div className="flex min-w-0 flex-col" style={{ gap: "0.2em" }}>
        <span className="line-clamp-3 font-bold break-words">{item.name}</span>
        {item.location && (
          <span className="truncate" style={{ fontSize: "0.85em" }}>
            {item.location}
          </span>
        )}
      </div>
    </div>
  );
}
