import {
  QR_BARCODE_FORMAT,
  SCAN_CAMERA_IDEAL_HEIGHT_PX,
  SCAN_CAMERA_IDEAL_WIDTH_PX,
  SCAN_CROP_FRACTION,
  SCAN_CROP_MAX_SIDE_PX,
  SCAN_INTERVAL_MS,
} from "@/lib/constants/labels";
import type {
  NativeBarcodeDetector,
  QrScannerStatus,
  UseQrScannerOptions,
  WindowWithBarcodeDetector,
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

async function createNativeQrDetector(): Promise<NativeBarcodeDetector | null> {
  const BarcodeDetector = (window as WindowWithBarcodeDetector).BarcodeDetector;
  if (!BarcodeDetector) return null;
  try {
    const supportedFormats = await BarcodeDetector.getSupportedFormats();
    if (!supportedFormats.includes(QR_BARCODE_FORMAT)) return null;
    return new BarcodeDetector({ formats: [QR_BARCODE_FORMAT] });
  } catch {
    return null;
  }
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
    let scanTimer: ReturnType<typeof setTimeout> | null = null;
    let nativeQrDetector: NativeBarcodeDetector | null = null;
    let isCancelled = false;
    const frameCanvas = document.createElement("canvas");
    const frameContext = frameCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    const drawCenterCropOfFrame = (video: HTMLVideoElement) => {
      if (!frameContext) return false;
      const cropSide = Math.round(
        Math.min(video.videoWidth, video.videoHeight) * SCAN_CROP_FRACTION,
      );
      const canvasSide = Math.min(cropSide, SCAN_CROP_MAX_SIDE_PX);
      frameCanvas.width = canvasSide;
      frameCanvas.height = canvasSide;
      frameContext.drawImage(
        video,
        Math.round((video.videoWidth - cropSide) / 2),
        Math.round((video.videoHeight - cropSide) / 2),
        cropSide,
        cropSide,
        0,
        0,
        canvasSide,
        canvasSide,
      );
      return true;
    };

    const decodeCanvas = async () => {
      if (nativeQrDetector) {
        const detectedCodes = await nativeQrDetector.detect(frameCanvas);
        return detectedCodes[0]?.rawValue ?? null;
      }
      if (!frameContext) return null;
      const frame = frameContext.getImageData(
        0,
        0,
        frameCanvas.width,
        frameCanvas.height,
      );
      const qrCode = jsQR(frame.data, frame.width, frame.height, {
        inversionAttempts: "dontInvert",
      });
      return qrCode?.data ?? null;
    };

    const scanFrame = async () => {
      const video = videoRef.current;
      if (
        !video ||
        isPausedRef.current ||
        document.hidden ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        video.videoWidth === 0 ||
        !drawCenterCropOfFrame(video)
      ) {
        return;
      }
      const scannedText = await decodeCanvas();
      if (scannedText && !isCancelled) onScanRef.current(scannedText);
    };

    const scanContinuously = () => {
      scanFrame()
        .catch((error) => console.error("Reading a camera frame failed", error))
        .finally(() => {
          if (!isCancelled)
            scanTimer = setTimeout(scanContinuously, SCAN_INTERVAL_MS);
        });
    };

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: SCAN_CAMERA_IDEAL_WIDTH_PX },
          height: { ideal: SCAN_CAMERA_IDEAL_HEIGHT_PX },
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
        const [detector] = await Promise.all([
          createNativeQrDetector(),
          video.play(),
        ]);
        nativeQrDetector = detector;
        if (isCancelled) return;
        setStatus("scanning");
        scanContinuously();
      })
      .catch((error) => {
        if (isCancelled) return;
        console.error("Starting the camera failed", error);
        setStatus(statusOfCameraError(error));
      });

    return () => {
      isCancelled = true;
      if (scanTimer) clearTimeout(scanTimer);
      cameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return { videoRef, status };
}
