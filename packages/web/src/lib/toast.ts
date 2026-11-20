import { ERROR_TOAST_DURATION_MS } from "@/lib/constants/toast";
import { toast as sonnerToast } from "sonner";

function error(...[message, data]: Parameters<typeof sonnerToast.error>) {
  return sonnerToast.error(message, {
    duration: ERROR_TOAST_DURATION_MS,
    ...data,
  });
}

export const toast: typeof sonnerToast = Object.assign(
  (...args: Parameters<typeof sonnerToast>) => sonnerToast(...args),
  sonnerToast,
  { error },
);
