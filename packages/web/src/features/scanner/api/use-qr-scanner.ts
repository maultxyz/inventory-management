import {
  SCAN_FRAME_MAX_WIDTH_PX,
  SCAN_INTERVAL_MS,
} from "@/lib/constants/labels";
import type {
  QrScannerStatus,
  UseQrScannerOptions,
} from "@/lib/interfaces/labels";
import jsQR from "jsqr";
import { useEffect, useRef, useState } from "react";

function statusOfCameraError(error: unknown): QrScannerStatus {
  const errorName = error instanceof DOMException ? error.name : "";
  if (errorName === "NotAllowedError" || errorName === "SecurityError") {
    return "permissionDenied";
  }
  if (errorName === "NotFoundError" || errorName === "OverconstrainedError") {
    return "noCamera";
  }
  return "failed";
}

export function useQrScanner({ isPaused, onScan }: UseQrScannerOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<QrScannerStatus>("starting");
  const onScanRef = useRef(onScan);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    onScanRef.current = onScan;
    isPausedRef.current = isPaused;
  }, [onScan, isPaused]);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus(window.isSecureContext ? "noCamera" : "insecureContext");
      return;
    }
    let cameraStream: MediaStream | null = null;
    let scanTimer: ReturnType<typeof setInterval> | null = null;
    let isCancelled = false;
    const frameCanvas = document.createElement("canvas");
    const frameContext = frameCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    const scanFrame = () => {
      const video = videoRef.current;
      if (
        !video ||
        !frameContext ||
        isPausedRef.current ||
        document.hidden ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        video.videoWidth === 0
      ) {
        return;
      }
      const scale = Math.min(1, SCAN_FRAME_MAX_WIDTH_PX / video.videoWidth);
      frameCanvas.width = Math.round(video.videoWidth * scale);
      frameCanvas.height = Math.round(video.videoHeight * scale);
      frameContext.drawImage(video, 0, 0, frameCanvas.width, frameCanvas.height);
      const frame = frameContext.getImageData(
        0,
        0,
        frameCanvas.width,
        frameCanvas.height,
      );
      const qrCode = jsQR(frame.data, frame.width, frame.height, {
        inversionAttempts: "dontInvert",
      });
      if (qrCode?.data) onScanRef.current(qrCode.data);
    };

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      .then(async (stream) => {
        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        cameraStream = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        if (isCancelled) return;
        setStatus("scanning");
        scanTimer = setInterval(scanFrame, SCAN_INTERVAL_MS);
      })
      .catch((error) => {
        if (isCancelled) return;
        console.error("Starting the camera failed", error);
        setStatus(statusOfCameraError(error));
      });

    return () => {
      isCancelled = true;
      if (scanTimer) clearInterval(scanTimer);
      cameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return { videoRef, status };
}
