import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    theme: { text: ["control", "2xs"], radius: ["card"] },
    classGroups: {
      z: [{ z: ["lock-screen", "decor", "skip-link", "loading-gate"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
